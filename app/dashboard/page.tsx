"use client";

import { useRef, useState } from "react";

type UploadedMeta = { name: string; size: number; type: string };

const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function DashboardPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UploadedMeta[]>([]);

  function onFileChange() {
    // user ne nayi file select ki -> purana error hata do
    if (error) setError(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    setError(null);
    const el = inputRef.current;
    if (!el || !el.files || el.files.length === 0) {
      setError("Please choose a file first.");
      return;
    }

    const file = el.files[0];

    // client-side checks
    if (!ALLOWED.includes(file.type)) {
      setError("Only PDF, DOCX, or TXT files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File is too large. Max 10 MB.");
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      // ✅ sirf success par hi add karo
      if (!res.ok || (data && data.ok === false)) {
        throw new Error(data?.error || "Upload failed. Please try again.");
      }

      // latest-first + cap to 10 items
      const meta: UploadedMeta = { name: file.name, size: file.size, type: file.type };
      setItems((prev) => [meta, ...prev].slice(0, 10));

      // clean UI
      if (inputRef.current) inputRef.current.value = "";
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <section className="card">
        <h1 className="title">Dashboard</h1>
        <p className="muted">Upload your documents (PDF / DOCX / TXT).<br />Storage plug-in next.</p>

        <form onSubmit={onSubmit} className="uploader">
          <input
            ref={inputRef}
            type="file"
            onChange={onFileChange}
            accept=".pdf,.docx,.txt"
          />
          <button disabled={busy} type="submit">
            {busy ? "Uploading..." : "Upload"}
          </button>
          <a href="/" className="back">← Home</a>
        </form>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="list">
        <h2>Recent uploads</h2>
        {items.length === 0 ? (
          <p className="muted">No files yet. Upload one to see it here.</p>
        ) : (
          <ul>
            {items.map((f, i) => (
              <li key={i}>
                <strong>{f.name}</strong> · {(f.size / 1024).toFixed(1)} KB
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
