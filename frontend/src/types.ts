export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type RetestStatus = 'new' | 'open' | 'resolved' | 'partial' | 'changed' | 'accepted';

export interface RawMember {
  id: string;
  name: string;
  username?: string;
  is_active?: boolean;
  roles?: string[];
}

export interface RawImportedMember {
  id: string;
  name: string;
  roles?: string[];
}

export interface RawFinding {
  id: string;
  assignee: RawMember | null;
  status: string;
  data: {
    title: string;
    severity: Severity;
    retest_status: RetestStatus;
    date_retest: string | null;
    [key: string]: unknown;
  };
}

export interface RawSection {
  id: string;
  data: Record<string, unknown>;
}

export interface RawProject {
  id: string;
  name: string;
  created: string;
  updated: string;
  readonly: boolean;
  members: RawMember[];
  imported_members: RawImportedMember[];
}

export interface RawProjectDetail extends RawProject {
  findings: RawFinding[];
  sections?: RawSection[];
}

export interface BySeverity {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface ByRetestStatus {
  new: number;
  open: number;
  resolved: number;
  partial: number;
  changed: number;
  accepted: number;
}

export interface PentesterStat {
  name: string;
  projects: number;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface ProjectStat {
  name: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface FindingListStat {
  id: string;
  title: string;
  severity: Severity;
}

export interface FindingLifecycleStat {
  id: string;
  title: string;
  severity: Severity;
  startDate: Date;
  endDate: Date | null;
}

export interface SeverityColors {
  critical: string;
  high: string;
  medium: string;
  low: string;
  info: string;
}

export interface RetestColors {
  new: string;
  open: string;
  resolved: string;
  partial: string;
  changed: string;
  accepted: string;
}

export interface RetestLabels {
  new?: string;
  open?: string;
  resolved?: string;
  partial?: string;
  changed?: string;
  accepted?: string;
}

export interface LifecycleConfig {
  startField: string;
  retestDateField: string;
  retestStatusField: string;
  resolvedValue: string;
}

export interface ColorConfig {
  severity: SeverityColors;
  retest: RetestColors;
  defaultLang?: 'pt-BR' | 'en';
  retestLabels?: RetestLabels;
  lifecycle?: Partial<LifecycleConfig>;
}

export interface DashboardData {
  totalProjects: number;
  finalizedProjects: number;
  activeProjects: number;
  totalFindings: number;
  bySeverity: BySeverity;
  byRetestStatus: ByRetestStatus;
  byPentester: PentesterStat[];
  topProjects: ProjectStat[];
  findingsList: FindingListStat[];
  findingsLifecycle: FindingLifecycleStat[];
  avgResolutionDays: number | null;
  lastUpdated: Date;
}
