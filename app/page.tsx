// app/page.tsx
export const metadata = {
  title: "KhojManthan",
  description: "India’s First Indigenous File Search Engine",
};

export default function Home() {
  return (
    <main style={{ textAlign: "center", padding: "50px" }}>
      <h1>🚀 KhojManthan</h1>
      <p>India’s First Indigenous File Search Engine</p>
      <a
        href="https://github.com/SaurabhSRSS/KhojManthan"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "10px 16px",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          textDecoration: "none",
        }}
      >
        ⭐ Star on GitHub
      </a>
    </main>
  );
}
