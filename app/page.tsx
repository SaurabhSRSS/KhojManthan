// app/page.tsx
export const metadata = {
  title: "KhojManthan",
  description: "India’s First Indigenous File Search Engine",
};

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "40px",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>🚀 KhojManthan</h1>
        <p style={{ opacity: 0.8, marginBottom: "20px" }}>
          India’s First Indigenous File Search Engine
        </p>

        <a
          href="https://github.com/SaurabhSRSS/KhojManthan"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          ⭐ Star on GitHub
        </a>
      </div>
    </main>
  );
                    }
