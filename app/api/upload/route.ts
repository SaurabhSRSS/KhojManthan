for (const f of files) {
  const okType = allowed.includes(f.type);
  const okSize = f.size <= max;

  if (okType && okSize) {
    recentFiles.unshift({
      name: f.name,
      size: f.size,
      type: f.type,
      uploadedAt: new Date().toISOString(),
    });
    accepted.push(f.name);
  } else {
    rejected.push(f.name);
  }
}

// yeh line hogi final return
return NextResponse.json({ ok: true, files: recentFiles });
