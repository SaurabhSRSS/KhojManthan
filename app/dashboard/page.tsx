<ul>
  {items.map((f, idx) => (
    <li key={idx} className="flex justify-between items-center py-2 border-b">
      <span>{f.name} ({Math.round(f.size / 1024)} KB)</span>
      <a
        href={`/api/files/${encodeURIComponent(f.name)}`}
        className="text-blue-600 underline ml-4"
        download
      >
        ⬇ Download
      </a>
    </li>
  ))}
</ul>
