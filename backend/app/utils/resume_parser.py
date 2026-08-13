"""
Resume parser utility to extract information from resume files
"""
import re
from typing import Dict, List, Optional, Any
import os


def parse_resume(file_path: str) -> Dict[str, Any]:
    """
    Parse resume file and extract key information
    Returns dict with: skills, experience_years, education_level, raw_text
    """
    file_ext = os.path.splitext(file_path)[1].lower()
    
    # Extract text based on file type
    try:
        if file_ext == '.pdf':
            text = extract_text_from_pdf(file_path)
        elif file_ext in ['.doc', '.docx']:
            text = extract_text_from_docx(file_path)
        elif file_ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            text = ""
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        text = ""
    
    if not text:
        return {
            'skills': [],
            'experience_years': None,
            'education_level': None,
            'raw_text': ""
        }
    
    # Parse the extracted text
    skills = extract_skills(text)
    experience_years = extract_experience_years(text)
    education_level = extract_education_level(text)
    
    return {
        'skills': skills,
        'experience_years': experience_years,
        'education_level': education_level,
        # Cap generously rather than to a page or two - AI match scoring reads
        # this whole field, and multi-page resumes shouldn't get cut off.
        'raw_text': text[:20000]
    }


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except ImportError:
        print("pdfplumber not installed. Install with: pip install pdfplumber")
        return ""
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        from docx import Document
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except ImportError:
        print("python-docx not installed. Install with: pip install python-docx")
        return ""
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""


# Shared skill vocabulary, exposed at module level so job descriptions can be
# scanned with the same list (see app.crud.resume.calculate_match_score) -
# matching skill_match against what a job actually asks for, not just
# whatever fraction of the resume's own skill list happens to appear in it.
SKILL_KEYWORDS = [
    # Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'go', 'rust', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',

    # Web Technologies
    'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'fastapi', 'spring', 'asp.net', 'laravel', 'rails', 'next.js', 'nuxt', 'gatsby',

    # Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server',
    'dynamodb', 'cassandra', 'sqlite', 'mariadb',

    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform',
    'ansible', 'gitlab', 'github', 'bitbucket', 'circleci', 'travis ci',

    # Data Science & ML
    'machine learning', 'deep learning', 'data science', 'tensorflow', 'pytorch', 'scikit-learn',
    'pandas', 'numpy', 'matplotlib', 'tableau', 'power bi', 'spark', 'hadoop',

    # Mobile Development
    'ios', 'android', 'react native', 'flutter', 'xamarin', 'mobile development',

    # Other Technical
    'git', 'agile', 'scrum', 'rest api', 'graphql', 'microservices', 'linux', 'unix',
    'api', 'json', 'xml', 'testing', 'tdd', 'unit testing', 'integration testing',

    # Video Editing & Motion
    'premiere pro', 'premiere', 'after effects', 'davinci resolve', 'final cut pro',
    'final cut', 'avid media composer', 'video editing', 'video production',
    'motion graphics', 'color grading', 'color correction', 'sound design',
    'audio editing', 'adobe audition', 'storyboarding', 'cinematography',
    'capcut', 'filmora',

    # Graphic Design & Creative
    'photoshop', 'illustrator', 'indesign', 'lightroom', 'adobe xd', 'figma', 'sketch',
    'canva', 'procreate', 'coreldraw', 'affinity designer', 'affinity photo',
    'adobe creative suite', 'creative cloud', 'graphic design', 'typography',
    'branding', 'ui design', 'ux design', 'ui/ux', 'wireframing', 'prototyping',
    'logo design', 'print design', 'illustration',

    # 3D & Animation
    'blender', 'cinema 4d', 'maya', '3ds max', '3d modeling', 'animation', 'rigging',

    # Soft Skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
    'analytical', 'critical thinking', 'time management', 'collaboration'
]


def extract_skills(text: str) -> List[str]:
    """
    Extract skills from resume text
    Uses a comprehensive list of common tech and professional skills
    """
    text_lower = text.lower()
    skill_keywords = SKILL_KEYWORDS

    # Order matches by where they first appear in the resume text, not by
    # position in skill_keywords - otherwise categories checked later in the
    # list (e.g. newly added ones) get squeezed out by the cap below even
    # when they're clearly present in the text.
    found_skills = []
    for skill in skill_keywords:
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        match = re.search(pattern, text_lower)
        if match:
            # Capitalize properly for display
            display_name = skill.title() if skill.islower() else skill
            found_skills.append((match.start(), display_name))

    found_skills.sort(key=lambda item: item[0])

    # Remove duplicates while preserving that text-appearance order
    seen = set()
    unique_skills = []
    for _, skill in found_skills:
        skill_lower = skill.lower()
        if skill_lower not in seen:
            seen.add(skill_lower)
            unique_skills.append(skill)

    return unique_skills[:25]  # Limit to top 25 skills, prioritizing what appears first in the resume


def extract_experience_years(text: str) -> Optional[float]:
    """
    Extract years of experience from resume text
    Looks for patterns like "5 years of experience", "3+ years", etc.
    """
    text_lower = text.lower()
    
    # Patterns to match
    patterns = [
        r'(\d+\.?\d*)\s*\+?\s*years?\s+(?:of\s+)?experience',
        r'experience[:\s]+(\d+\.?\d*)\s*\+?\s*years?',
        r'(\d+\.?\d*)\s*\+?\s*yrs?\s+(?:of\s+)?experience',
        r'over\s+(\d+\.?\d*)\s+years?',
        r'more than\s+(\d+\.?\d*)\s+years?',
    ]
    
    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            try:
                years = float(match)
                if 0 < years <= 50:  # Sanity check
                    max_years = max(max_years, years)
            except ValueError:
                continue
    
    return max_years if max_years > 0 else None


def extract_education_level(text: str) -> Optional[str]:
    """
    Extract highest education level from resume text
    """
    text_lower = text.lower()
    
    # Check in order of highest to lowest
    education_levels = [
        ('PhD', ['ph.d', 'phd', 'doctor of philosophy', 'doctorate']),
        ('Master', ['master', 'm.s.', 'ms ', 'm.a.', 'ma ', 'mba', 'master\'s']),
        ('Bachelor', ['bachelor', 'b.s.', 'bs ', 'b.a.', 'ba ', 'bachelor\'s', 'undergraduate degree']),
        ('Associate', ['associate', 'a.a.', 'aa ', 'a.s.', 'as ', 'associate\'s']),
        ('High School', ['high school', 'secondary school', 'diploma'])
    ]
    
    for level, keywords in education_levels:
        for keyword in keywords:
            if keyword in text_lower:
                return level
    
    return None


# Test function
if __name__ == "__main__":
    # Test with sample text
    sample_text = """
    John Doe
    Software Engineer
    
    EXPERIENCE
    Senior Developer at Tech Corp (2020-Present)
    - 5+ years of experience in web development
    - Working with Python, JavaScript, React, Node.js
    
    EDUCATION
    Master of Science in Computer Science
    University of Technology, 2019
    
    SKILLS
    Python, JavaScript, React, Node.js, AWS, Docker, MySQL, Git
    """
    
    result = parse_resume("")
    print(result)
