"use client";

import { useState, useRef, useEffect } from "react";

type UploadedMeta = {
  name: string;
  size: number;
  uploadedAt: string;
};

export default function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedMeta[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 🟢 Fetch files from API on load
  useEffect(() => {
    refreshFiles();
  }, []);

  async function refreshFiles() {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      if (data.ok) setFiles(data.files);
    } catch (e) {
      console.error("Failed to fetch files", e);
    }
  }

  // 🟢 Upload handler
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fileInput = inputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError("Please choose a file first.");
      return;
    }

    const form = new FormData();
    for (let i = 0; i < fileInput.files.length; i++) {
      form.append("files", fileInput.files[i]);
    }

    setBusy(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Upload failed");
      } else {
        await refreshFiles();
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch (err) {
      setError("Unexpected error during upload.");
    } finally {
      setBusy(false);
    }
  }

  // 🟢 Delete handler
  async function handleDelete(name: string) {
    if (!confirm(`Delete file "${name}"?`)) return;

    try {
      const res = await fetch(`/api/files/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        await refreshFiles();
      } else {
        alert("Delete failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Delete request failed.");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📂 Dashboard</h1>

      {/* Upload form */}
      <form onSubmit={onSubmit} className="space-y-4 mb-6">
        <input
          type="file"
          ref={inputRef}
          multiple
          className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0 file:text-sm file:font-semibold
                     file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* File list */}
      {files.length === 0 ? (
        <div className="text-slate-400">
          No files yet. Upload one to see it here.
        </div>
      ) : (
        <ul className="space-y-3">
          {files.map((f) => (
            <li
              key={f.name}
              className="relative group border border-slate-700 rounded-lg px-3 py-2 bg-slate-800/40"
            >
              {/* ❎ hover par dikhne wala cross (desktop), mobile par always visible */}
              <button
                onClick={() => handleDelete(f.name)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 
                           flex items-center justify-center opacity-0 group-hover:opacity-100 
                           hover:bg-red-700 transition"
                title="Remove file"
                aria-label={`Remove ${f.name}`}
              >
                ×
              </button>

              <div className="min-w-0">
                <div className="truncate font-medium">{f.name}</div>
                <div className="text-xs text-slate-400">
                  {(f.size / 1024).toFixed(1)} KB •{" "}
                  {new Date(f.uploadedAt).toLocaleString()}
                </div>
              </div>

              <div className="mt-2">
                <a
                  className="px-2 py-1 text-sm rounded bg-slate-700 text-white"
                  href={`/api/files/${encodeURIComponent(f.name)}`}
                  target="_blank"
                >
                  Open
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
    }
