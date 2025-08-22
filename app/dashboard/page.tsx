function isAllowed(file: File) {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  // Some mobiles send empty or octet-stream; fall back to extension check
  const mimeOk = allowed.includes(file.type);
  const name = file.name.toLowerCase();
  const extOk =
    name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".txt");

  return mimeOk || extOk;
}
