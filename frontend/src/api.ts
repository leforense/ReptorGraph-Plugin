import type { RawProject, RawProjectDetail } from './types';

interface ProjectsResponse {
  next: string | null;
  previous: string | null;
  results: RawProject[];
}

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} — ${url}`);
  }
  // res.json() returns Promise<any>; cast via unknown to satisfy strict generics
  return res.json() as unknown as T;
}

export async function fetchAllProjects(): Promise<RawProject[]> {
  const all: RawProject[] = [];
  let url: string | null = '/api/v1/pentestprojects/?page_size=200';

  while (url) {
    const data: ProjectsResponse = await apiFetch<ProjectsResponse>(url);
    all.push(...data.results);
    url = data.next;
  }

  return all;
}

export async function fetchProjectDetail(id: string): Promise<RawProjectDetail> {
  return apiFetch<RawProjectDetail>(`/api/v1/pentestprojects/${id}/`);
}

const BATCH_SIZE = 5;

export async function fetchAllProjectDetails(
  projects: RawProject[],
  onProgress: (done: number, total: number) => void,
): Promise<RawProjectDetail[]> {
  const results: RawProjectDetail[] = [];

  for (let i = 0; i < projects.length; i += BATCH_SIZE) {
    const batch = projects.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(batch.map(p => fetchProjectDetail(p.id)));
    results.push(...details);
    onProgress(Math.min(i + BATCH_SIZE, projects.length), projects.length);
  }

  return results;
}
