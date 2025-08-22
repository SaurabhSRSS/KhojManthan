"use client";

import { useEffect, useRef, useState } from "react";

type UploadedMeta = { name: string; size: number; type: string };

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const LS_KEY = "km_recent_uploads";

export default function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [items, setItems] = useState<UploadedMeta[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load recent uploads from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  function chooseFile() {
    setError(null);
    inputRef.current?.click();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  async function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  async function handleFile(file: File) {
    // Validate
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PDF, DOCX, or TXT files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Max file size is 10 MB.");
      return;
    }

    setBusy(true);
    setHint("Uploading…");
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok !== true) {
        throw new Error(data?.error || "Upload failed");
      }

      const meta: UploadedMeta = {
        name: data.name ?? file.name,
        size: data.size ?? file.size,
        type: data.type ?? file.type,
      };
      setItems((prev) => [meta, ...prev].slice(0, 10));
      setHint("Uploaded!");
      setTimeout(() => setHint(null), 1200);
      // clear input
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-5xl font-extrabold tracking-tight mb-3">Dashboard</h1>
      <p className="text-zinc-300 mb-8">
        Upload your documents (<b>PDF / DOCX / TXT</b>). Storage plug-in next.
      </p>

      {/* Upload Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 mb-10">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={chooseFile}
          className={[
            "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
            dragOver ? "border-sky-400 bg-sky-400/10" : "border-white/15",
          ].join(" ")}
        >
          <p className="font-medium mb-2">
            Drag & drop a file here, or <span className="underline">browse</span>
          </p>
          <p className="text-sm text-zinc-400">
            Allowed: PDF, DOCX, TXT • Max 10MB
          </p>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={onInputChange}
          />
          <button
            onClick={chooseFile}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 disabled:opacity-60"
          >
            {busy ? "Uploading…" : "Choose file"}
          </button>
          <button
            onClick={() => {
              setItems([]);
              try {
                localStorage.removeItem(LS_KEY);
              } catch {}
            }}
            disabled={busy || items.length === 0}
            className="px-4 py-2 rounded-lg bg-white/10 disabled:opacity-50"
          >
            Clear recent
          </button>
          {hint && <span className="text-sm text-emerald-400">{hint}</span>}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Recent uploads */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent uploads</h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-zinc-400">
            No files yet. Upload one to see it here.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((it, idx) => (
              <li
                key={`${it.name}-${idx}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-zinc-400">
                    {it.type || "unknown"} • {(it.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={() =>
                    setItems((prev) =>
                      prev.filter((_, i) => i !== idx)
                    )
                  }
                  className="text-sm px-3 py-1 rounded-md bg-white/10 hover:bg-white/15"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
  }
