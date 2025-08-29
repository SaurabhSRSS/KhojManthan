"use client";

import { useEffect, useRef, useState } from "react";

type FileRow = { name: string; size: number; type: string; uploadedAt: string };

export default function Dashboard() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function loadList() {
    const res = await fetch("/api/files", { cache: "no-store" });
    const data = await res.json();
    if (data?.ok) setFiles(data.files || []);
  }

  useEffect(() => { loadList(); }, []);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!inputRef.current || !inputRef.current.files?.length) {
      setMsg("Choose at least one file.");
      return;
    }
    setMsg(null);
    setBusy(true);

    try {
      const form = new FormData();
      // IMPORTANT: "files" (plural) field name
      Array.from(inputRef.current.files).forEach(f => form.append("files", f));

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setMsg(data?.error || "Upload failed.");
      } else {
        const rej = (data.rejected || []) as Array<{ name: string; reason: string }>;
        if (rej.length) {
          setMsg(`Some files rejected: ${rej.map(r => `${r.name} (${r.reason})`).join(", ")}`);
        } else {
          setMsg("Uploaded successfully.");
        }
        await loadList();
      }
    } catch (err: any) {
      setMsg(err?.message || "Network error.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onDelete(name: string) {
    await fetch(`/api/files?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    await loadList();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-zinc-100">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">Upload your documents (PDF / DOCX / TXT). Storage plug-in next.</p>

      <form onSubmit={onUpload} className="rounded-2xl bg-zinc-900/40 p-4 mb-8">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.docx"
          className="mb-3 block"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl px-4 py-2 bg-indigo-600 disabled:opacity-60"
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
        {msg && <div className="mt-3 text-sm text-amber-300">{msg}</div>}
        <div className="mt-2 text-xs text-zinc-400">
          Allowed: PDF, DOCX, TXT • Max 10 files • ≤ 10 MB each
        </div>
      </form>

      <h2 className="text-2xl font-semibold mb-3">Recent uploads</h2>
      {files.length === 0 ? (
        <div className="text-zinc-400">No files yet. Upload one to see it here.</div>
      ) : (
        <ul className="space-y-2">
          {files.map(f => (
            <li key={f.name} className="rounded-xl bg-zinc-900/40 p-3 flex items-center justify-between">
              <div className="mr-3">
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-zinc-400">
                  {f.type} · {(f.size / 1024).toFixed(1)} KB · {new Date(f.uploadedAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => onDelete(f.name)}
                className="text-sm rounded-lg px-3 py-1 bg-red-600/80"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
