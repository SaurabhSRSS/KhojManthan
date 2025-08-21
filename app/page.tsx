import Link from "next/link";

export default function Home() {
  return (
    <main style={{minHeight:"100vh", display:"grid", placeItems:"center", padding:24}}>
      <div style={{textAlign:"center"}}>
        <h1 style={{fontSize:40, marginBottom:12}}>🚀 KhojManthan</h1>
        <p style={{opacity:.8, marginBottom:24}}>
          India’s First Indigenous File Search Engine
        </p>
        <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap"}}>
          <a
            href="https://github.com/SaurabhSRSS/KhojManthan"
            style={{padding:"10px 14px", borderRadius:10, border:"1px solid #444", textDecoration:"none"}}
          >
            ⭐ Star on GitHub
          </a>
          <Link
            href="/dashboard"
            style={{padding:"10px 14px", borderRadius:10, border:"1px solid #444", textDecoration:"none"}}
          >
            📊 Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
