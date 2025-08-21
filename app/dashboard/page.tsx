"use client";

import { useState, useRef } from "react";

type UploadedMeta = { name: string; size: number; type: string };

export default function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UploadedMeta[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fileInput = inputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError("Please choose a file first.");
      return;
    }

    const file = fileInput.files[0];
    const form = new FormData();
    form.append("file", file);

    setBusy(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      // show in list (local state for now)
      setItems((prev) => [{ name: data.file.name, size: data.file.size, type: data.file.type }, ...prev]);
      // clear input
      fileInput.value = "";
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function prettyBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
    return `${(n / 1024 ** 3).toFixed(1)} GB`;
  }

  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <h1 style={{ marginTop: 0, fontSize: 28 }}>Dashboard</h1>
      <p className="sub" style={{ marginTop: 6 }}>Upload your documents (PDF / DOCX / TXT). Storage plug-in next.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          disabled={busy}
          style={{
            padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,.15)",
            background: "var(--panel, #13131a)", color: "var(--text, #e7e7ea)"
          }}
        />
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
          <a className="btn" href="/" style={{ textDecoration: "none" }}>← Home</a>
        </div>
      </form>

      {error && (
        <div style={{
          marginTop: 14, padding: "10px 12px", borderRadius: 10,
          border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.08)"
        }}>
          ⚠️ {error}
        </div>
      )}

      <section style={{ marginTop: 26 }}>
        <h3 style={{ margin: "0 0 10px" }}>Recent uploads</h3>
        {items.length === 0 ? (
          <div className="card" style={{ opacity: .85 }}>
            <p>No files yet. Upload one to see it here.</p>
          </div>
        ) : (
          <div className="grid">
            {items.map((f, i) => (
              <div key={i} className="card">
                <strong>{f.name}</strong>
                <p style={{ marginTop: 6, opacity: .85 }}>
                  {f.type || "unknown"} • {prettyBytes(f.size)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
