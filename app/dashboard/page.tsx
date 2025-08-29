// app/dashboard/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type KMFile = {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export default function DashboardPage() {
  const [picked, setPicked] = useState<File[]>([]);
  const [recent, setRecent] = useState<KMFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // read from API on mount & after actions
  const refresh = async () => {
    try {
      const r = await fetch('/api/files', { cache: 'no-store' });
      const j = await r.json();
      if (j.ok) setRecent(j.files || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // formatted sizes
  const fmt = (n: number) =>
    n >= 1024 * 1024
      ? `${(n / (1024 * 1024)).toFixed(1)} MB`
      : n >= 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${n} B`;

  // build UI list for picked files (before upload)
  const pickedList = useMemo(
    () =>
      picked.map((f, i) => (
        <li key={`${f.name}-${i}`} className="flex items-center gap-2">
          <span className="truncate">{f.name}</span>
          <span className="text-xs opacity-70">· {fmt(f.size)}</span>
          <button
            className="ml-2 rounded-full border px-2 text-xs hover:bg-red-600/10 hover:text-red-600"
            onClick={() =>
              setPicked((prev) => prev.filter((_, idx) => idx !== i))
            }
            aria-label="Remove from queue"
            title="Remove"
          >
            ×
          </button>
        </li>
      )),
    [picked]
  );

  // drag & drop (progressive enhancement)
  const onDrop = async (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    const files = Array.from(ev.dataTransfer.files || []);
    if (!files.length) return;
    setPicked((prev) => [
      ...prev,
      ...files.filter((f) =>
        ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
          f.type
        )
      ),
    ]);
  };

  const onUpload = async () => {
    if (!picked.length) {
      setMsg('Please choose one or more files first.');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      picked.forEach((f) => fd.append('files', f)); // IMPORTANT: same field name 'files'

      const r = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const j = await r.json();

      if (!j.ok) {
        setMsg(j.error || 'Upload failed.');
      } else {
        setMsg(`Uploaded ${j.accepted?.length ?? picked.length} file(s).`);
        setPicked([]);
        inputRef.current?.value && (inputRef.current.value = '');
        await refresh(); // make it persistent on the list
      }
    } catch (e) {
      setMsg('Network error.');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (name: string) => {
    try {
      await fetch(`/api/files?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      await refresh();
    } catch {}
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 opacity-80">
          Upload your documents (PDF / DOCX / TXT). Storage plug-in next.
        </p>

        <div
          className="mt-4 rounded-xl border border-dashed border-white/20 p-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              multiple
              name="files"
              accept=".pdf,.txt,.docx"
              className="block w-full max-w-xs cursor-pointer rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
              onChange={(e) =>
                setPicked((prev) => [
                  ...prev,
                  ...Array.from(e.target.files || []),
                ])
              }
            />
            <button
              className="rounded-md border border-white/10 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
              onClick={onUpload}
              disabled={busy}
            >
              {busy ? 'Uploading…' : 'Upload'}
            </button>
            <button
              className="rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
              onClick={refresh}
            >
              Refresh
            </button>
          </div>

          {/* queued files (pre-upload) */}
          {picked.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-sm font-medium opacity-80">
                In queue ({picked.length})
              </div>
              <ul className="space-y-1">{pickedList}</ul>
            </div>
          )}

          {msg && <div className="mt-3 text-sm opacity-80">{msg}</div>}

          <div className="mt-2 text-xs opacity-70">
            Allowed: PDF, DOCX, TXT • Max 10 files • ≤ 10&nbsp;MB each
          </div>
        </div>
      </section>

      {/* persistent list */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Recent uploads</h2>
        {recent.length === 0 ? (
          <p className="mt-3 opacity-70">
            No files yet. Upload one to see it here.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((f) => (
              <li
                key={`${f.name}-${f.uploadedAt}`}
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate">{f.name}</div>
                  <div className="text-xs opacity-70">
                    {fmt(f.size)} · {f.type} ·{' '}
                    {new Date(f.uploadedAt).toLocaleString()}
                  </div>
                </div>

                {/* hover/cross delete */}
                <button
                  className="ml-3 hidden rounded-full border px-2 text-sm text-red-500 hover:bg-red-500/10 group-hover:block"
                  title="Delete"
                  aria-label="Delete"
                  onClick={() => onDelete(f.name)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 text-sm">
        <a className="underline" href="/">
          Home
        </a>
      </div>
    </main>
  );
}
