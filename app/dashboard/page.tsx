"use client";

import { useRef, useState } from "react";

type UploadedMeta = { name: string; size: number; type: string };

// ✅ any file type allowed
const MAX_MB = 10;                 // per-file limit
const MAX_FILES_AT_ONCE = 10;      // one shot limit

export default function DashboardPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UploadedMeta[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const el = inputRef.current;
    if (!el || !el.files || el.files.length === 0) {
      setError("Please choose at least one file.");
      return;
    }

    const files = Array.from(el.files).slice(0, MAX_FILES_AT_ONCE);

    // only size-check now (no type restrictions)
    const valid: File[] = [];
    const problems: string[] = [];
    for (const f of files) {
      if (f.size > MAX_MB * 1024 * 1024) {
        problems.push(`${f.name}: too large (> ${MAX_MB} MB)`);
        continue;
      }
      valid.push(f);
    }

    if (valid.length === 0) {
      setError(problems.length ? problems.join(" • ") : "No valid files selected.");
      return;
    }

    setBusy(true);
    try {
      // upload sequentially (API expects one "file" per request)
      for (const f of valid) {
        const fd = new FormData();
        fd.append("file", f);

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(`Upload failed for ${f.name}`);

        const data = (await res.json()) as { ok: boolean; name: string; size: number; type: string };
        if (data?.ok) {
          setItems(prev => [{ name: data.name, size: data.size, type: data.type }, ...prev].slice(0, 10));
        }
      }
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 className="text-5xl font-bold mb-6">Dashboard</h1>
      <p className="text-zinc-300 mb-8">
        Upload <b>any file type</b> (limit {MAX_MB} MB each).<br />
        Storage plug-in next.
      </p>

      <form onSubmit={onSubmit} className="rounded-2xl p-4 md:p-6 bg-zinc-900/40 border border-zinc-800">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <input
            ref={inputRef}
            type="file"
            multiple   // ← multi-select on
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-sky-500 file:text-white file:cursor-pointer"
          />
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white disabled:opacity-60"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
          <a href="/" className="ml-auto text-zinc-300 underline underline-offset-4">Home</a>
        </div>

        <p className="mt-3 text-sm text-zinc-400">
          Up to {MAX_FILES_AT_ONCE} files per batch • ≤ {MAX_MB} MB each
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-600 bg-red-950/40 text-red-300 p-3">
            {error}
          </div>
        )}
      </form>

      <section className="mt-10">
        <h2 className="text-3xl font-semibold mb-4">Recent uploads</h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 p-4 text-zinc-400">
            No files yet. Upload one to see it here.
          </div>
        ) : (
          <ul className="rounded-xl border border-zinc-800 divide-y divide-zinc-800">
            {items.map((f, i) => (
              <li key={`${f.name}-${i}`} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span className="font-medium">{f.name}</span>
                </div>
                <span className="text-sm text-zinc-400">
                  {(f.type || "unknown").toString()} · {(f.size / 1024).toFixed(1)} KB
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
    }
