"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { useActiveResume, useResumeAnalysis, uploadResume } from "@/hooks/useResume";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";

export default function ResumePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { resume, loading, error, refresh } = useActiveResume();
  const { analysis, loading: analysisLoading, refresh: refreshAnalysis } = useResumeAnalysis(resume?.id);
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  
  useSessionMonitor();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
    } else {
      setChecked(true);
    }
  }, [router]);

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

    if (!skills.trim()) {
      setUploadError("Please enter at least one skill");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await uploadResume(
        selectedFile,
        skills,
        experienceYears ? parseFloat(experienceYears) : undefined,
        educationLevel || undefined
      );
      
      setUploadSuccess(true);
      setSelectedFile(null);
      setSkills("");
      setExperienceYears("");
      setEducationLevel("");
      
      // Reset file input
      const fileInput = document.getElementById("resume-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      // Refresh data
      refresh();
      setTimeout(() => refreshAnalysis(), 500);
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
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Resume Manager</h1>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700 mb-2">
                  Resume File (PDF, DOC, DOCX, TXT)
                </label>
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated) *
                </label>
                <input
                  id="skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., JavaScript, React, Node.js, Python"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    id="experience"
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="e.g., 3.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                    Education Level
                  </label>
                  <select
                    id="education"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="High School">High School</option>
                    <option value="Associate">Associate Degree</option>
                    <option value="Bachelor">Bachelor's Degree</option>
                    <option value="Master">Master's Degree</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Resume uploaded successfully! Match scores calculated for all applications.
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? "Uploading..." : "Upload Resume"}
              </button>
            </form>
          </div>

          {/* Current Resume & Analysis */}
          {loading || analysisLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          ) : resume && analysis ? (
            <div className="space-y-6">
              {/* Current Resume Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Current Resume</h2>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Filename:</span> {resume.filename}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Uploaded:</span>{" "}
                    {new Date(resume.upload_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Size:</span> {formatFileSize(resume.file_size)}
                  </p>
                  {resume.experience_years && (
                    <p className="text-gray-700">
                      <span className="font-medium">Experience:</span> {resume.experience_years} years
                    </p>
                  )}
                  {resume.education_level && (
                    <p className="text-gray-700">
                      <span className="font-medium">Education:</span> {resume.education_level}
                    </p>
                  )}
                </div>

                {resume.skills && resume.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, index) => (
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

              {/* Success Rate Dashboard */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Success Rate Analysis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className={`text-3xl font-bold ${getSuccessRateColor(analysis.success_rate)}`}>
                      {analysis.success_rate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analysis.total_applications > 0 
                        ? `Based on ${analysis.total_applications} applications`
                        : "No applications yet"}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-600 mb-1">Average Match</p>
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

                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {analysis.total_applications}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Analyzed with your resume
                    </p>
                  </div>
                </div>

                {/* Top Skills */}
                {analysis.top_matching_skills.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Your Top Skills</h3>
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
                <div className="bg-white rounded-lg p-4 shadow">
                  <h3 className="font-semibold text-gray-800 mb-3">📊 Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-2">No resume uploaded yet</p>
              <p className="text-sm text-gray-600">
                Upload your resume above to start tracking your success rate
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
