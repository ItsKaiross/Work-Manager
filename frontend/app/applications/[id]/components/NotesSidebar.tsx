"use client";
import { useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface NotesSidebarProps {
  initialNotes: string;
  onSave: (notes: string) => Promise<void>;
}

const AUTOSAVE_DELAY_MS = 800;
const SAVED_MESSAGE_DURATION_MS = 2500;

export default function NotesSidebar({ initialNotes, onSave }: NotesSidebarProps) {
  const [value, setValue] = useState(initialNotes);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialNotes);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedFadeRef.current) clearTimeout(savedFadeRef.current);
    };
  }, []);

  function scheduleSave(next: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (next === lastSavedRef.current) return;
      setStatus("saving");
      setErrorMsg("");
      try {
        await onSave(next);
        lastSavedRef.current = next;
        setStatus("saved");
        if (savedFadeRef.current) clearTimeout(savedFadeRef.current);
        savedFadeRef.current = setTimeout(() => setStatus("idle"), SAVED_MESSAGE_DURATION_MS);
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Failed to save notes");
      }
    }, AUTOSAVE_DELAY_MS);
  }

  function handleChange(next: string) {
    setValue(next);
    scheduleSave(next);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-3">Notes</h2>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes about this application…"
        rows={10}
        aria-label="Notes"
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm leading-relaxed focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
      />
      <div aria-live="polite" className="mt-2 text-xs min-h-[1rem]">
        {status === "saving" && <span className="text-gray-400 dark:text-gray-500">Saving…</span>}
        {status === "saved" && <span className="text-green-600 dark:text-green-400">Saved just now</span>}
        {status === "error" && <span className="text-red-600 dark:text-red-400">{errorMsg}</span>}
      </div>
    </div>
  );
}
