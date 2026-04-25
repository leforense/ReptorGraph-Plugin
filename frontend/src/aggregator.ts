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
} from './types';

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

export function aggregateData(projects: RawProjectDetail[]): DashboardData {
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
    }
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
    lastUpdated: new Date(),
  };
}
