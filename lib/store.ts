// lib/store.ts
export type KMFile = {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

// Memory me ek array rakhenge recent files ka
export let recentFiles: KMFile[] = [];
