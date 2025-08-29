"use client";

import { useEffect, useState } from "react";

type KMFile = {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export default function Dashboard() {
  const [files, setFiles] = useState<KMFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFiles() {
    try {
      setError(null);
      const res = await fetch("/api/files", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setFiles(data.files || []);
    } catch {
      setError("Couldn't refresh files");
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (![...fd.keys()].includes("files")) {
      const input = form.querySelector<HTMLInputElement>('input[type="file"][name="files"]');
      if (input && input.files && input.files.length > 0) {
        for (const f of Array.from(input.files)) fd.append("files", f);
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        setFiles(data.files || []);
        setPanelOpen(true);
        (form.reset as any)?.();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    await loadFiles();
    setPanelOpen(true);
  }

  async function handleDelete(name: string) {
    const url = new URL("/api/files", window.location.origin);
    url.searchParams.set("name", name);
    const res = await fetch(url.toString(), { method: "DELETE" });
    const data = await res.json();
    if (data.ok) loadFiles();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          type="file"
          name="files"
          multiple
          className="file:mr-3 file:px-3 file:py-2 file:rounded file:border-0 file:bg-slate-700 file:text-white file:cursor-pointer"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2 rounded bg-slate-600 text-white"
          >
            Refresh
          </button>
        </div>
      </form>

      <p className="text-sm text-slate-400 mb-4">
        Allowed: PDF, DOCX, TXT • Max 10 files • ≤ 10 MB each
      </p>

      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

      <div className="border border-slate-700 rounded-xl overflow-hidden">
        <div
          className="flex items-center justify-between bg-slate-800/60 px-4 py-3 cursor-pointer"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
        >
          <div className="font-semibold">Recent uploads</div>
          <div className="text-sm text-slate-400">
            {files.length} item{files.length !== 1 ? "s" : ""} • {panelOpen ? "Hide" : "Show"}
          </div>
        </div>

        {panelOpen && (
          <div className="p-4">
            {files.length === 0 ? (
              <div className="text-slate-400">No files yet. Upload one to see it here.</div>
            ) : (
              <ul className="space-y-3">
                {files.map((f) => (
                  <li
                    key={f.name}
                    className="relative border border-slate-700 rounded-lg px-3 py-2 group"
                  >
                    {/* ❌ Cross at top-right */}
                    <button
                      onClick={() => handleDelete(f.name)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100"
                      title="Remove file"
                    >
                      ×
                    </button>

                    <div className="min-w-0">
                      <div className="truncate font-medium">{f.name}</div>
                      <div className="text-xs text-slate-400">
                        {(f.size / 1024).toFixed(1)} KB • {new Date(f.uploadedAt).toLocaleString()}
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

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPanelOpen(false)}
                className="px-4 py-2 rounded bg-slate-700 text-white"
              >
                Done
              </button>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 rounded bg-slate-600 text-white"
              >
                Reload list
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
      }
