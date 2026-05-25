import { CONFIG } from './config';
import type { AppData } from './types';

export async function apiGet<T = unknown>(params: Record<string, string> = {}): Promise<T> {
  const url = new URL(CONFIG.GOOGLE_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error('Network error');
  return r.json();
}

export async function apiPost<T = unknown>(params: Record<string, string | number> = {}): Promise<T> {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => body.set(k, String(v)));
  const r = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!r.ok) throw new Error('Network error');
  return r.json();
}

export async function fetchAllData(): Promise<AppData> {
  try {
    const res = await apiGet<{ students?: unknown[]; subjects?: unknown[]; teachers?: unknown[] }>({
      action: 'getAll',
    });
    return {
      students: Array.isArray(res.students) ? (res.students as AppData['students']) : [],
      subjects: Array.isArray(res.subjects) ? (res.subjects as AppData['subjects']) : [],
      teachers: Array.isArray(res.teachers) ? (res.teachers as AppData['teachers']) : [],
    };
  } catch {
    return { students: [], subjects: [], teachers: [] };
  }
}
