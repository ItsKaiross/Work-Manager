import { useState } from "react";
import { User, UserResume, getUserResume, downloadResumeFile } from "@/lib/admin-api";

interface UsersTableProps {
  users: User[];
  onToggleActive: (user: User) => void;
  onToggleAdmin: (user: User) => void;
  onDelete: (userId: number) => void;
}

export function UsersTable({ users, onToggleActive, onToggleAdmin, onDelete }: UsersTableProps) {
  const [resumeModalUser, setResumeModalUser] = useState<User | null>(null);
  const [resumeData, setResumeData] = useState<UserResume | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadResume() {
    if (!resumeData) return;
    setDownloading(true);
    try {
      await downloadResumeFile(resumeData.id, resumeData.filename);
    } catch (err: any) {
      setResumeError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  async function handleViewResume(user: User) {
    setResumeModalUser(user);
    setResumeData(null);
    setResumeError("");
    setResumeLoading(true);
    try {
      const data = await getUserResume(user.id);
      setResumeData(data);
    } catch (err: any) {
      setResumeError(err.message);
    } finally {
      setResumeLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Provider
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {user.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {user.auth_provider}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleActive(user)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    user.is_active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleAdmin(user)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    user.is_admin
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"
                  }`}
                >
                  {user.is_admin ? "Admin" : "User"}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleViewResume(user)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                >
                  Resume
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {resumeModalUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setResumeModalUser(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Resume — {resumeModalUser.email}
              </h3>
              <button
                onClick={() => setResumeModalUser(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {resumeLoading && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
            )}
            {resumeError && <p className="text-red-500 text-sm">{resumeError}</p>}

            {resumeData && (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Filename:</span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">{resumeData.filename}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(resumeData.upload_date).toLocaleDateString()}
                  </span>
                </p>
                {resumeData.experience_years != null && (
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Experience:</span>{" "}
                    <span className="text-gray-900 dark:text-gray-100">
                      {resumeData.experience_years} years
                    </span>
                  </p>
                )}
                {resumeData.education_level && (
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Education:</span>{" "}
                    <span className="text-gray-900 dark:text-gray-100">{resumeData.education_level}</span>
                  </p>
                )}
                {resumeData.skills && resumeData.skills.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {resumeData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDownloadResume}
                  disabled={downloading}
                  className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {downloading ? "Downloading..." : "Download Resume File"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
