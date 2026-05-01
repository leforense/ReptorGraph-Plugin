import type {
  RawProjectDetail,
  RawMember,
  RawImportedMember,
  BySeverity,
  ByRetestStatus,
  PentesterStat,
  ProjectStat,
  DashboardData,
  Severity,
  FindingListStat,
  FindingLifecycleStat,
  LifecycleConfig,
} from './types';
import { DEFAULT_LIFECYCLE_CONFIG } from './api';

function mergePentesters(
  members: RawMember[],
  importedMembers: RawImportedMember[],
): string[] {
  const seen = new Set(members.map(m => m.name));
  const result = members.map(m => m.name);

  for (const imp of importedMembers) {
    if (!seen.has(imp.name)) {
      result.push(imp.name);
      seen.add(imp.name);
    }
  }

  return result;
}

const SEVERITY_KEYS: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 5, high: 4, medium: 3, low: 2, info: 1,
};

function parseLocalDate(dateStr: string): Date {
  // Parse YYYY-MM-DD as local noon to avoid timezone-induced day shifts
  return new Date(dateStr + 'T12:00:00');
}

function extractStartDate(project: RawProjectDetail, config: LifecycleConfig): Date | null {
  for (const section of project.sections ?? []) {
    const val = section.data[config.startField];
    if (typeof val === 'string' && val) {
      const d = parseLocalDate(val);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

export function aggregateData(
  projects: RawProjectDetail[],
  lifecycleConfig: LifecycleConfig = DEFAULT_LIFECYCLE_CONFIG,
): DashboardData {
  const bySeverity: BySeverity = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const byRetestStatus: ByRetestStatus = {
    new: 0, open: 0, resolved: 0, partial: 0, changed: 0, accepted: 0,
  };

  // Pentester stats are based on project membership (members + imported_members),
  // not on finding.assignee, because most findings don't have individual assignees.
  // All findings in a project are attributed to every pentester on that project.
  const pentesterMap = new Map<string, PentesterStat>();
  const activeProjectStats: ProjectStat[] = [];
  let totalFindings = 0;

  // Per-finding data only computed for single-project view (too large otherwise)
  const findingsList: FindingListStat[] = [];
  const findingsLifecycle: FindingLifecycleStat[] = [];
  let avgResolutionDays: number | null = null;

  const isSingleProject = projects.length === 1;

  for (const project of projects) {
    const pentesters = mergePentesters(project.members, project.imported_members);

    // Track severity breakdown per active project for the top-projects chart
    if (!project.readonly) {
      const ps: ProjectStat = {
        name: project.name, total: 0,
        critical: 0, high: 0, medium: 0, low: 0, info: 0,
      };
      for (const f of project.findings) {
        ps.total++;
        if (SEVERITY_KEYS.includes(f.data.severity)) ps[f.data.severity]++;
      }
      if (ps.total > 0) activeProjectStats.push(ps);
    }

    // Ensure every pentester on this project has an entry in the map
    for (const name of pentesters) {
      if (!pentesterMap.has(name)) {
        pentesterMap.set(name, {
          name,
          projects: 0,
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        });
      }
      pentesterMap.get(name)!.projects++;
    }

    // Extract project start date for lifecycle (from sections)
    const startDate = isSingleProject ? extractStartDate(project, lifecycleConfig) : null;

    for (const finding of project.findings) {
      totalFindings++;

      const sev = finding.data.severity;
      if (SEVERITY_KEYS.includes(sev)) bySeverity[sev]++;

      const rst = finding.data.retest_status;
      if (rst in byRetestStatus) byRetestStatus[rst]++;

      // Attribute to assignee if set, otherwise fall back to all project members
      const recipients = finding.assignee ? [finding.assignee.name] : pentesters;
      for (const name of recipients) {
        if (!pentesterMap.has(name)) {
          pentesterMap.set(name, { name, projects: 0, total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 });
        }
        const stat = pentesterMap.get(name)!;
        stat.total++;
        if (SEVERITY_KEYS.includes(sev)) stat[sev]++;
      }

      if (isSingleProject) {
        findingsList.push({ id: finding.id, title: finding.data.title, severity: sev });

        if (startDate) {
          // Read retest fields dynamically (field names are configurable)
          const retestDate = finding.data[lifecycleConfig.retestDateField];
          const retestStatus = finding.data[lifecycleConfig.retestStatusField];
          const isResolved =
            typeof retestStatus === 'string' &&
            retestStatus === lifecycleConfig.resolvedValue;
          const endDate =
            isResolved && typeof retestDate === 'string' && retestDate
              ? parseLocalDate(retestDate)
              : null;

          findingsLifecycle.push({
            id: finding.id,
            title: finding.data.title,
            severity: sev,
            startDate,
            endDate,
          });
        }
      }
    }
  }

  // Sort findings list by severity weight (critical first)
  findingsList.sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity]);

  // Average resolution time: mean of (endDate - startDate) in days for resolved findings
  const resolvedFindings = findingsLifecycle.filter(f => f.endDate !== null);
  if (resolvedFindings.length > 0) {
    const totalDays = resolvedFindings.reduce((sum, f) => {
      return sum + (f.endDate!.getTime() - f.startDate.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    avgResolutionDays = Math.round(totalDays / resolvedFindings.length);
  }

  return {
    totalProjects: projects.length,
    finalizedProjects: projects.filter(p => p.readonly).length,
    activeProjects: projects.filter(p => !p.readonly).length,
    totalFindings,
    bySeverity,
    byRetestStatus,
    byPentester: [...pentesterMap.values()].sort((a, b) => b.total - a.total),
    topProjects: activeProjectStats.sort((a, b) => b.total - a.total).slice(0, 10),
    findingsList,
    findingsLifecycle,
    avgResolutionDays,
    lastUpdated: new Date(),
  };
}
