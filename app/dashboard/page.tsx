"use client";

import { useRef, useState } from "react";

type KMFile = {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export default function DashboardPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<KMFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onUpload = async () => {
    try {
      setError(null);

      const fs = inputRef.current?.files;
      if (!fs || fs.length === 0) {
        setError("Please choose at least one file.");
        return;
      }

      const fd = new FormData();
      for (const f of Array.from(fs)) fd.append("files", f);

      setBusy(true);

      // 👇 IMPORTANT: leading slash must be present
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      // If server replied with HTML (404/500), avoid JSON.parse crash
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await res.text();
        throw new Error(`Server returned ${res.status}.`);
      }

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Upload failed");

      setFiles(data.files || []);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  const loadList = async () => {
    try {
      setError(null);
      const res = await fetch("/api/files/"); // list all
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await res.text();
        throw new Error(`Server returned ${res.status}.`);
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load");
      setFiles(data.files || []);
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    }
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">
        Upload your documents (PDF / DOCX / TXT). Storage plug-in next.
      </p>

      <div className="flex items-center gap-3 mb-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <button
          onClick={onUpload}
          disabled={busy}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
        <button
          onClick={loadList}
          className="px-3 py-2 rounded border"
          title="Refresh list"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-3">{error}</div>
      )}

      <p className="text-sm text-neutral-400 mb-6">
        Allowed: PDF, DOCX, TXT • Max 10 files • ≤ 10 MB each
      </p>

      <h2 className="text-2xl font-semibold mb-3">Recent uploads</h2>
      {files.length === 0 ? (
        <p className="text-neutral-400">No files yet. Upload one to see it here.</p>
      ) : (
        <ul className="list-disc pl-6 space-y-1">
          {files.map((f) => (
            <li key={f.name}>
              {f.name} · {(f.size / 1024).toFixed(1)} KB
            </li>
          ))}
        </ul>
      )}
    </main>
  );
      }
