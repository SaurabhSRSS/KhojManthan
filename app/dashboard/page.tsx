import Link from "next/link";

export const metadata = {
  title: "Dashboard • KhojManthan",
};

export default function DashboardPage() {
  return (
    <main style={{padding:"40px 20px", maxWidth: 960, margin: "0 auto"}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center", marginBottom: 24}}>
        <h1 style={{fontSize: 28, margin: 0}}>Dashboard</h1>
        <Link href="/" style={{textDecoration:"none", border:"1px solid #444", padding:"8px 12px", borderRadius:8}}>
          ← Home
        </Link>
      </header>

      <section style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",
        gap:16
      }}>
        <div style={{border:"1px solid #333", borderRadius:12, padding:16}}>
          <h3 style={{marginTop:0}}>Quick Search</h3>
          <p style={{opacity:.8, marginTop:8}}>Search files across indexed sources.</p>
        </div>

        <div style={{border:"1px solid #333", borderRadius:12, padding:16}}>
          <h3 style={{marginTop:0}}>Uploads</h3>
          <p style={{opacity:.8, marginTop:8}}>Upload docs (PDF/Images) — coming soon.</p>
        </div>

        <div style={{border:"1px solid #333", borderRadius:12, padding:16}}>
          <h3 style={{marginTop:0}}>Recent Activity</h3>
          <p style={{opacity:.8, marginTop:8}}>Your recent searches will appear here.</p>
        </div>
      </section>
    </main>
  );
}
