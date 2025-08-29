'use client';

import { useState, useRef } from 'react';

type Queued = { id: string; file: File };

export default function DashboardPage() {
  const [queue, setQueue] = useState<Queued[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // nayi selection ko queue me merge karo (duplicates hatao by name+size+lastModified)
    const incoming: Queued[] = Array.from(files).map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}`,
      file: f,
    }));

    setQueue((prev) => {
      const seen = new Set(prev.map((q) => q.id));
      const merged = [...prev];
      for (const q of incoming) if (!seen.has(q.id)) merged.push(q);
      return merged;
    });

    // mobile browsers me re-pick allow karne ke liye input reset
    e.currentTarget.value = '';
  }

  function removeOne(id: string) {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }

  function clearAll() {
    setQueue([]);
    inputRef.current?.blur();
  }

  async function uploadAll(e: React.FormEvent) {
    e.preventDefault();
    if (busy || queue.length === 0) return;

    try {
      setBusy(true);
      const fd = new FormData();
      for (const q of queue) fd.append('files', q.file);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        alert(json?.error ?? 'Upload failed');
        return;
      }

      // success → queue clear & optional toast
      setQueue([]);
      alert('Uploaded!');
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

      <form onSubmit={uploadAll} encType="multipart/form-data" className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            id="file-input"
            type="file"
            name="files"
            multiple                  // browser multi-select enable
            accept=".pdf,.txt,.docx"  // optional
            onChange={onPick}
            className="block"
          />
          <button
            type="submit"
            disabled={busy || queue.length === 0}
            className="rounded-md px-3 py-1.5 border border-white/20 hover:bg-white/10 disabled:opacity-50"
          >
            {busy ? 'Uploading…' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={queue.length === 0 || busy}
            className="rounded-md px-3 py-1.5 border border-white/10 hover:bg-white/5 disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        {/* Queue list with remove (❌) */}
        <div className="rounded-xl border border-white/10 p-3">
          <p className="mb-2 text-sm opacity-80">
            Selected files ({queue.length}) — Allowed: PDF, DOCX, TXT • ≤ 10 MB each
          </p>
          {queue.length === 0 ? (
            <p className="text-sm opacity-60">No files selected yet.</p>
          ) : (
            <ul className="space-y-2">
              {queue.map((q) => (
                <li
                  key={q.id}
                  className="group flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2"
                >
                  <span className="truncate">
                    {q.file.name} · {(q.file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    aria-label="Remove file"
                    onClick={() => removeOne(q.id)}
                    className="opacity-60 hover:opacity-100 transition rounded-md px-2 py-1 border border-white/10 group-hover:border-white/20"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Recent uploads</h2>
        <p className="opacity-70 text-sm">
          (Server-side list; storage plugin aayega to yahan se persist dikhayenge.)
        </p>
      </section>
    </main>
  );
}
