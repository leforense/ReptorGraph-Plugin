import type { RawProject, RawProjectDetail, ColorConfig, LifecycleConfig } from './types';

export const DEFAULT_LIFECYCLE_CONFIG: LifecycleConfig = {
  startField: 'start_date',
  retestDateField: 'date_retest',
  retestStatusField: 'retest_status',
  resolvedValue: 'resolved',
};

const COLOR_DEFAULTS: ColorConfig = {
  severity: { critical: '#DC2626', high: '#f97316', medium: '#eab308', low: '#3b82f6', info: '#64748b' },
  retest:   { new: '#94a3b8', open: '#ef4444', resolved: '#22c55e', partial: '#eab308', changed: '#f97316', accepted: '#a855f7' },
};

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
  return res.json() as unknown as T;
}

export async function fetchPluginConfig(): Promise<ColorConfig> {
  const win = window as unknown as { REPTORGRAPH_CONFIG?: ColorConfig };
  const cfg = win.REPTORGRAPH_CONFIG ?? COLOR_DEFAULTS;
  return {
    ...cfg,
    lifecycle: { ...DEFAULT_LIFECYCLE_CONFIG, ...(cfg.lifecycle ?? {}) },
  };
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
