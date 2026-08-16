"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { useActiveResume, useAllResumes, useResumeAnalysis, uploadResume, generateJobKeywords } from "@/hooks/useResume";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";
import { Resume } from "@/types/resume";

const JOB_SITES: { name: string; url: (keyword: string) => string }[] = [
  { name: "LinkedIn", url: (k) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(k)}` },
  { name: "Glassdoor", url: (k) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(k)}` },
  { name: "Google Jobs", url: (k) => `https://www.google.com/search?q=${encodeURIComponent(k)}&ibp=htl;jobs` },
  { name: "ZipRecruiter", url: (k) => `https://www.ziprecruiter.com/candidate/search?search=${encodeURIComponent(k)}` },
  { name: "Monster", url: (k) => `https://www.monster.com/jobs/search?q=${encodeURIComponent(k)}` },
  { name: "SimplyHired", url: (k) => `https://www.simplyhired.com/search?q=${encodeURIComponent(k)}` },
  { name: "CareerBuilder", url: (k) => `https://www.careerbuilder.com/jobs?keywords=${encodeURIComponent(k)}` },
  { name: "Dice", url: (k) => `https://www.dice.com/jobs?q=${encodeURIComponent(k)}` },
  { name: "OnlineJobs.ph", url: (k) => `https://www.onlinejobs.ph/jobseekers/jobsearch?jobkeyword=${encodeURIComponent(k)}` },
];

export default function ResumePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { resume: activeResume, loading, error, refresh } = useActiveResume();
  const { resumes: allResumes, refresh: refreshAllResumes } = useAllResumes();
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [displayedResume, setDisplayedResume] = useState<Resume | null>(null);
  const { analysis, loading: analysisLoading, refresh: refreshAnalysis } = useResumeAnalysis(displayedResume?.id);
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [keywordsError, setKeywordsError] = useState<string | null>(null);
  
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  useSessionMonitor();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  // Update displayed resume when active resume or selection changes
  useEffect(() => {
    if (selectedResumeId) {
      const selected = allResumes.find(r => r.id === selectedResumeId);
      setDisplayedResume(selected || null);
    } else if (activeResume) {
      setDisplayedResume(activeResume);
      setSelectedResumeId(activeResume.id);
    }
  }, [activeResume, selectedResumeId, allResumes]);

  const handleResumeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resumeId = parseInt(e.target.value);
    setSelectedResumeId(resumeId);
  };

  const handleGenerateKeywords = async () => {
    if (!displayedResume) return;

    setKeywordsLoading(true);
    setKeywordsError(null);

    try {
      const updated = await generateJobKeywords(displayedResume.id);
      setDisplayedResume(updated);
      refreshAllResumes();
    } catch (err) {
      setKeywordsError(err instanceof Error ? err.message : "Failed to generate job suggestions");
    } finally {
      setKeywordsLoading(false);
    }
  };

  if (!checked) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError("Please select a file");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await uploadResume(selectedFile);
      
      setUploadSuccess(true);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("resume-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      // Show parsed info
      console.log("Parsed resume info:", result.parsed_info);
      console.log("Full result:", result);
      
      // Refresh data with a longer delay to ensure backend processing is complete
      setTimeout(() => {
        refresh();
        setTimeout(() => refreshAnalysis(), 300);
      }, 500);
      
      // Or just reload the page to ensure fresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-4 pt-16 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Resume Manager</h1>

          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              📄 Upload your resume and we'll automatically extract your skills, experience, and education!
            </p>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resume File (PDF, DOC, DOCX, TXT)
                </label>
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                  ✅ Resume uploaded and parsed successfully! Match scores calculated for all applications.
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? "Uploading and Parsing..." : "Upload Resume"}
              </button>
            </form>
          </div>

          {/* Current Resume & Analysis */}
          {loading || analysisLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              <p className="font-semibold mb-1">Error loading resume data</p>
              <p className="text-sm">{error}</p>
              {error.includes("Cannot connect") && (
                <p className="text-sm mt-2">
                  Make sure the backend server is running on <code className="bg-red-100 px-1 rounded">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code>
                </p>
              )}
            </div>
          ) : displayedResume && analysis ? (
            <div className="space-y-6">
              {/* Resume Selector Dropdown */}
              {allResumes.length > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <label htmlFor="resume-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📂 View Resume History ({allResumes.length} resumes)
                  </label>
                  <select
                    id="resume-select"
                    value={selectedResumeId || ''}
                    onChange={handleResumeSelect}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {allResumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.filename} - Uploaded {new Date(r.upload_date).toLocaleDateString()} 
                        {r.is_active ? ' (Active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Current Resume Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Resume Details</h2>
                  {displayedResume.is_active && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Filename:</span> {displayedResume.filename}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Uploaded:</span>{" "}
                    {new Date(displayedResume.upload_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Size:</span> {formatFileSize(displayedResume.file_size)}
                  </p>
                  {displayedResume.experience_years && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Experience:</span> {displayedResume.experience_years} years
                    </p>
                  )}
                  {displayedResume.education_level && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Education:</span> {displayedResume.education_level}
                    </p>
                  )}
                </div>

                {displayedResume.skills && displayedResume.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {displayedResume.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Job Suggestions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <h2 className="text-xl font-semibold">💼 Job Suggestions For You</h2>
                  <button
                    type="button"
                    onClick={handleGenerateKeywords}
                    disabled={keywordsLoading}
                    className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {keywordsLoading
                      ? "Generating..."
                      : displayedResume.job_keywords && displayedResume.job_keywords.length > 0
                      ? "🔄 Regenerate"
                      : "✨ Generate Job Suggestions"}
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Based on this resume, AI suggests searching for these roles. Pick a job site to search each one.
                </p>

                {keywordsError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {keywordsError}
                  </div>
                )}

                {displayedResume.job_keywords && displayedResume.job_keywords.length > 0 ? (
                  <div className="space-y-2">
                    {displayedResume.job_keywords.map((keyword: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                      >
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-200 truncate">
                          {keyword}
                        </span>
                        <details className="relative shrink-0 group">
                          <summary
                            className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none px-3 py-1 bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-800/40 transition flex items-center gap-1"
                          >
                            Search on
                            <span className="transition-transform group-open:rotate-180">▾</span>
                          </summary>
                          <div className="absolute right-0 z-20 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
                            {JOB_SITES.map((site) => (
                              <a
                                key={site.name}
                                href={site.url(keyword)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Search "${keyword}" on ${site.name}`}
                                className="flex items-center justify-between px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                              >
                                {site.name}
                                <span className="text-gray-400">↗</span>
                              </a>
                            ))}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  !keywordsLoading && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No job suggestions yet. Click "Generate Job Suggestions" above to have AI suggest roles based on this resume.
                    </p>
                  )
                )}
              </div>

              {/* Success Rate Dashboard */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Success Rate Analysis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Success Rate</p>
                    <p className={`text-3xl font-bold ${getSuccessRateColor(analysis.success_rate)}`}>
                      {analysis.success_rate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {analysis.total_applications > 0 
                        ? `Based on ${analysis.total_applications} applications`
                        : "No applications yet"}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Match</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {analysis.average_match_percentage.toFixed(1)}%
                    </p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getMatchColor(analysis.average_match_percentage)}`}
                        style={{ width: `${analysis.average_match_percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                      {analysis.total_applications}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Analyzed with your resume
                    </p>
                  </div>
                </div>

                {/* Top Skills */}
                {analysis.top_matching_skills.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow mb-6">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Your Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.top_matching_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">📊 Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-2">No resume uploaded yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your resume above to start tracking your success rate
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
