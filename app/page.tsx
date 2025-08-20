// app/page.tsx
export const metadata = {
  title: "KhojManthan",
  description: "India’s First Indigenous File Search Engine",
};

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-semibold">🚀 KhojManthan</h1>
        <p className="opacity-80">
          India’s First Indigenous File Search Engine
        </p>

        <div className="mt-6">
          <a
            href="https://github.com/SaurabhSRSS/KhojManthan"
            className="inline-block px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 transition"
          >
            ⭐ Star on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
