"use client";

import { useState } from "react";

type UploadedMeta = { name: string; size: number; type: string };

const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
];

export default function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UploadedMeta[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;

    if (!file || file.size === 0) {
      setError("Please choose a file first.");
      return;
    }

    // Validate type (PDF / DOCX / TXT)
    if (!ALLOWED.includes(file.type)) {
      setError("Only PDF, DOCX, or TXT files are allowed.");
      return;
    }

    // Optional: 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10 MB).");
      return;
    }

    try {
      setBusy(true);

      // 🔒 Storage integration will come next; for now we just “mock” success
      await new Promise((r) => setTimeout(r, 600));

      setItems((prev) => [
        { name: file.name, size: file.size, type: file.type },
        ...prev,
      ]);

      // Reset the form so user can choose another file
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash">
      <h1>Dashboard</h1>
      <p>Upload your documents (PDF / DOCX / TXT). Storage plug-in next.</p>

      <form onSubmit={onSubmit} className="card" noValidate>
        <input
          type="file"
          name="file"           // 👈 FormData yahin se uthayega
          accept=".pdf,.docx,.txt"
        />
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? "Uploading..." : "Upload"}
          </button>
          <a className="btn" href="/">← Home</a>
        </div>

        {error && (
          <div className="alert" role="alert" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}
      </form>

      <h2 style={{ marginTop: 28 }}>Recent uploads</h2>
      <div className="card">
        {items.length === 0 ? (
          <p>No files yet. Upload one to see it here.</p>
        ) : (
          <ul>
            {items.map((f, i) => (
              <li key={i}>
                <strong>{f.name}</strong> • {(f.size / 1024).toFixed(1)} KB
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
        }
