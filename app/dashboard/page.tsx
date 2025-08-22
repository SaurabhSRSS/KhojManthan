"use client";

import { useEffect, useRef, useState } from "react";

type UploadedMeta = { id: string; name: string; size: number; type: string };

const LS_KEY = "km-recent-uploads";

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export default function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [items, setItems] = useState<UploadedMeta[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load previous uploads from localStorage (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Save whenever list changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  function setTransientNote(msg: string) {
    setNote(msg);
    setTimeout(() => setNote(null), 2500);
  }

  async function doUpload(file: File) {
    setError(null);
    setNote(null);

    // Allow only pdf/docx/txt for now
    const okTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!okTypes.includes(file.type) && !["pdf", "docx", "txt"].includes(ext || "")) {
      setError("Only PDF, DOCX, or TXT files are allowed.");
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Upload failed. Please try again.");
      }

      const meta: UploadedMeta = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: data.name || file.name,
        size: data.size ?? file.size,
        type: data.type || file.type,
      };

      setItems((prev) => [meta, ...prev].slice(0, 20)); // keep last 20
      setTransientNote("✅ Uploaded!");
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      setError(e?.message || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = inputRef.current;
    if (!el || !el.files || el.files.length === 0) {
      setError("Please choose a file first.");
      return;
    }
    await doUpload(el.files[0]);
  }

  // Drag & drop handlers
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      doUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ opacity: 0.9, marginBottom: 24 }}>
        Upload your documents (PDF / DOCX / TXT).<br />
        <span style={{ opacity: 0.8 }}>Storage plug-in next.</span>
      </p>

      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}
      >
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragOver ? "#60a5fa" : "rgba(255,255,255,0.18)"}`,
            background: dragOver ? "rgba(96,165,250,0.08)" : "transparent",
            borderRadius: 14,
            padding: 18,
            marginBottom: 14,
            textAlign: "center",
            transition: "all .15s ease",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Drag & drop a file here
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            or use the chooser below
          </div>
        </div>

        {/* Classic form */}
        <form onSubmit={onSubmit} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept=".pdf,.docx,.txt"
            disabled={busy}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "8px 10px",
              borderRadius: 8,
            }}
          />
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              cursor: busy ? "not-allowed" : "pointer",
              background: busy
                ? "linear-gradient(90deg,#7c7c7c,#9a9a9a)"
                : "linear-gradient(90deg,#7c3aed,#22d3ee)",
              color: "#fff",
              fontWeight: 700,
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
          <a
            href="/"
            style={{
              marginLeft: 8,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              textDecoration: "none",
              color: "inherit",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            ← Home
          </a>
        </form>

        {/* Messages */}
        {error && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid rgba(255,0,0,0.35)",
              background: "rgba(255,0,0,0.08)",
              padding: "10px 12px",
              borderRadius: 10,
              color: "#ff9b9b",
              fontWeight: 600,
            }}
          >
            ❌ {error}
          </div>
        )}
        {note && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid rgba(16,185,129,0.35)",
              background: "rgba(16,185,129,0.10)",
              padding: "10px 12px",
              borderRadius: 10,
              color: "#7ce0b7",
              fontWeight: 600,
            }}
          >
            {note}
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Recent uploads
      </h2>

      {items.length === 0 ? (
        <div
          style={{
            opacity: 0.75,
            border: "1px dashed rgba(255,255,255,0.18)",
            borderRadius: 14,
            padding: 18,
          }}
        >
          No files yet. Upload one to see it here.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          {items.map((f) => (
            <div
              key={f.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: 520 }}>
                  {f.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {formatBytes(f.size)} • {f.type || "unknown"}
                </div>
              </div>
              <button
                onClick={() =>
                  setItems((prev) => prev.filter((x) => x.id !== f.id))
                }
                title="Remove from list"
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "transparent",
                  color: "inherit",
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
        }
