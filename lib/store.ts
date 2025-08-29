// lib/store.ts
export type KMFile = {
  name: string;
  size: number;
  type: string;
  uploadedAt: string; // ISO string
};

// super-simple in-memory store (Vercel serverless par deploy pe reset hoga)
export const recentFiles: KMFile[] = [];
