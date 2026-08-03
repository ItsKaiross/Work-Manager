"""
AI-powered job preparation suggestion generator
"""
from typing import List, Dict, Any
import re


def generate_preparation_suggestions(
    job_description: str,
    position: str,
    company: str,
    match_percentage: float = None,
    resume_skills: List[str] = None,
    missing_skills: List[str] = None
) -> Dict[str, Any]:
    """
    Generate personalized preparation suggestions for a job application
    """
    suggestions = {
        "technical_prep": [],
        "company_research": [],
        "behavioral_prep": [],
        "skills_to_focus": [],
        "questions_to_ask": []
    }
    
    # Extract key skills and technologies from job description
    job_desc_lower = job_description.lower() if job_description else ""
    
    # Common technical skills and frameworks
    tech_keywords = {
        "python": "Python",
        "javascript": "JavaScript",
        "react": "React",
        "node": "Node.js",
        "typescript": "TypeScript",
        "java": "Java",
        "sql": "SQL",
        "aws": "AWS",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "git": "Git",
        "api": "REST APIs",
        "machine learning": "Machine Learning",
        "data": "Data Analysis",
        "agile": "Agile methodologies"
    }
    
    found_technologies = []
    for keyword, display_name in tech_keywords.items():
        if keyword in job_desc_lower:
            found_technologies.append(display_name)
    
    # Technical Preparation
    if found_technologies:
        suggestions["technical_prep"].append(
            f"Review and practice: {', '.join(found_technologies[:5])}"
        )
    
    if "algorithm" in job_desc_lower or "data structure" in job_desc_lower:
        suggestions["technical_prep"].append(
            "Practice coding problems on LeetCode or HackerRank"
        )
    
    if "system design" in job_desc_lower:
        suggestions["technical_prep"].append(
            "Prepare for system design questions - review scalability patterns"
        )
    
    # Add match-based suggestions
    if match_percentage is not None:
        if match_percentage < 50:
            suggestions["skills_to_focus"].append(
                "Focus on bridging skill gaps - consider highlighting transferable skills"
            )
        elif match_percentage < 70:
            suggestions["skills_to_focus"].append(
                "Good match! Prepare examples demonstrating your relevant experience"
            )
        else:
            suggestions["skills_to_focus"].append(
                "Excellent match! Focus on showcasing your most relevant projects"
            )
    
    # Company Research
    suggestions["company_research"].extend([
        f"Research {company}'s products, services, and recent news",
        f"Understand {company}'s company culture and values",
        f"Look up the team you'd be joining on LinkedIn",
        "Review the company's tech blog or engineering blog if available"
    ])
    
    # Behavioral Preparation
    position_lower = position.lower() if position else ""
    
    if "senior" in position_lower or "lead" in position_lower:
        suggestions["behavioral_prep"].extend([
            "Prepare examples of leadership and mentoring experiences",
            "Think about times you've made technical decisions with business impact",
            "Be ready to discuss how you handle conflicts and difficult conversations"
        ])
    elif "junior" in position_lower or "entry" in position_lower:
        suggestions["behavioral_prep"].extend([
            "Emphasize your learning agility and growth mindset",
            "Prepare examples of how you've overcome challenges",
            "Show enthusiasm for learning from senior team members"
        ])
    else:
        suggestions["behavioral_prep"].extend([
            "Prepare STAR (Situation, Task, Action, Result) examples",
            "Think about a time you failed and what you learned",
            "Be ready to discuss your collaboration style"
        ])
    
    suggestions["behavioral_prep"].append(
        "Review common behavioral questions for your role level"
    )
    
    # Questions to Ask
    suggestions["questions_to_ask"].extend([
        "What does success look like in this role after 6 months?",
        "What are the biggest challenges the team is facing right now?",
        "How does the team approach professional development?",
        "What's the typical day-to-day workflow like?",
        "How do you measure performance and give feedback?"
    ])
    
    # Add missing skills recommendations
    if missing_skills and len(missing_skills) > 0:
        skills_to_learn = missing_skills[:3]  # Top 3 missing skills
        suggestions["skills_to_focus"].append(
            f"Consider brushing up on: {', '.join(skills_to_learn)}"
        )
    
    # Add position-specific questions
    if "engineer" in position_lower or "developer" in position_lower:
        suggestions["questions_to_ask"].append(
            "What's the tech stack and how do you handle technical debt?"
        )
    elif "manager" in position_lower:
        suggestions["questions_to_ask"].append(
            "How is the team structured and what's your management philosophy?"
        )
    elif "designer" in position_lower:
        suggestions["questions_to_ask"].append(
            "How does design collaborate with product and engineering?"
        )
    
    return suggestions


def format_suggestions_for_display(suggestions: Dict[str, Any]) -> str:
    """Format suggestions into a readable string"""
    output = []
    
    section_titles = {
        "technical_prep": "🔧 Technical Preparation",
        "company_research": "🏢 Company Research",
        "behavioral_prep": "💬 Behavioral Interview Prep",
        "skills_to_focus": "🎯 Skills to Focus On",
        "questions_to_ask": "❓ Questions to Ask"
    }
    
    for key, title in section_titles.items():
        if suggestions.get(key):
            output.append(f"\n{title}:")
            for item in suggestions[key]:
                output.append(f"  • {item}")
    
    return "\n".join(output)
