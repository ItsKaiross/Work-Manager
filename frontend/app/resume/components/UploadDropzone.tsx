"use client";
import { useEffect, useRef, useState } from "react";

interface UploadDropzoneProps {
  uploading: boolean;
  error: string;
  successMessage: string;
  onUpload: (file: File) => void;
  resetSignal?: number;
}

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];
const MAX_SIZE_MB = 10;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function UploadDropzone({ uploading, error, successMessage, onUpload, resetSignal }: UploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resetSignal === undefined) return;
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [resetSignal]);

  function validateAndSet(file: File) {
    setLocalError("");
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setLocalError(`File type is not supported. Use ${ALLOWED_EXTENSIONS.join(", ")}.`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(`File exceeds the ${MAX_SIZE_MB}MB size limit.`);
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }

  function handleRemove() {
    setSelectedFile(null);
    setLocalError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
    onUpload(selectedFile);
  }

  return (
    <div id="upload-dropzone" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-1">Upload resume</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        PDF, DOC, DOCX, or TXT — up to {MAX_SIZE_MB}MB. Your file is stored privately and only used to match you against your own applications.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!selectedFile ? (
          <label
            htmlFor="resume-file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-10 px-4 text-center cursor-pointer transition focus-within:ring-2 focus-within:ring-blue-500 ${
              dragActive
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/10"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="text-blue-600 dark:text-blue-400 font-medium">Click to browse</span> or drag and drop
            </span>
            <input
              ref={inputRef}
              id="resume-file"
              type="file"
              accept={ALLOWED_EXTENSIONS.join(",")}
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && validateAndSet(e.target.files[0])}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-6 h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="min-h-[44px] px-3 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
            >
              Remove
            </button>
          </div>
        )}

        <div aria-live="polite">
          {localError && <p className="text-sm text-red-600 dark:text-red-400">{localError}</p>}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {successMessage && (
            <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </p>
          )}
          {uploading && <p className="text-sm text-gray-500 dark:text-gray-400">Uploading and processing your resume…</p>}
        </div>

        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          {uploading ? "Uploading…" : "Upload resume"}
        </button>
      </form>
    </div>
  );
}
