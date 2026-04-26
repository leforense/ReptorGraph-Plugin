import { useMemo, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { ColorConfig, RawProject, RawProjectDetail } from './types';
import type { Lang } from './i18n';
import { t } from './i18n';
import { fetchAllProjects, fetchAllProjectDetails, fetchPluginConfig } from './api';
import { aggregateData } from './aggregator';
import Header from './components/Header';
import StatCard from './components/StatCard';
import SeverityChart from './components/SeverityChart';
import RetestStatusChart from './components/RetestStatusChart';
import PentesterChart from './components/PentesterChart';
import TopProjectsChart from './components/TopProjectsChart';
import { LoadingState, ErrorState } from './components/LoadingState';

type AppState =
  | { status: 'loading-list' }
  | { status: 'idle'; projects: RawProject[] }
  | { status: 'loading-details'; done: number; total: number; projects: RawProject[] }
  | { status: 'loaded'; allDetails: RawProjectDetail[]; projects: RawProject[]; scope: 'all' | string }
  | { status: 'error'; message: string };

const DEFAULT_COLORS: ColorConfig = {
  severity: { critical: '#DC2626', high: '#f97316', medium: '#eab308', low: '#3b82f6', info: '#64748b' },
  retest:   { new: '#94a3b8', open: '#ef4444', resolved: '#22c55e', partial: '#eab308', changed: '#f97316', accepted: '#a855f7' },
};

function getInitialLang(): Lang {
  const saved = localStorage.getItem('reptorgraph-lang');
  if (saved === 'en' || saved === 'pt-BR') return saved;
  const cfgLang = (window as unknown as { REPTORGRAPH_CONFIG?: { defaultLang?: string } })
    .REPTORGRAPH_CONFIG?.defaultLang;
  return cfgLang === 'en' || cfgLang === 'pt-BR' ? cfgLang : 'pt-BR';
}

function sortProjects(projects: RawProject[]): RawProject[] {
  return [...projects].sort((a, b) => a.name.localeCompare(b.name));
}

export default function App() {
  const [state, setState] = useState<AppState>({ status: 'loading-list' });
  // undefined = no selection yet, null = all projects, string = specific project
  const [selectedProjectId, setSelectedProjectId] = useState<string | null | undefined>(undefined);
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [colors, setColors] = useState<ColorConfig>(DEFAULT_COLORS);
  const dashboardRef = useRef<HTMLDivElement>(null);

  function handleLangChange(newLang: Lang) {
    setLang(newLang);
    localStorage.setItem('reptorgraph-lang', newLang);
  }

  useEffect(() => {
    fetchPluginConfig().then(setColors);
  }, []);

  useEffect(() => { loadList(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadList() {
    setState({ status: 'loading-list' });
    try {
      const projects = sortProjects(await fetchAllProjects());
      setState({ status: 'idle', projects });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  async function loadAllDetails(projects: RawProject[]) {
    setState({ status: 'loading-details', done: 0, total: projects.length, projects });
    try {
      const allDetails = await fetchAllProjectDetails(projects, (done, total) => {
        setState(s => s.status === 'loading-details' ? { ...s, done, total } : s);
      });
      setState({ status: 'loaded', allDetails, projects, scope: 'all' });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  async function loadSingleProject(projectId: string, projects: RawProject[]) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    setState({ status: 'loading-details', done: 0, total: 1, projects });
    try {
      const details = await fetchAllProjectDetails([project], (done, total) => {
        setState(s => s.status === 'loading-details' ? { ...s, done, total } : s);
      });
      setState({ status: 'loaded', allDetails: details, projects, scope: projectId });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  async function handleProjectChange(projectId: string | null) {
    if (state.status === 'loading-details') return;
    setSelectedProjectId(projectId);
    const projects = 'projects' in state ? state.projects : [];

    if (projectId === null) {
      // "All projects" — skip fetch if already loaded
      if (state.status === 'loaded' && state.scope === 'all') return;
      await loadAllDetails(projects);
    } else {
      // Single project — skip fetch if this exact scope already loaded
      if (state.status === 'loaded' && (state.scope === 'all' || state.scope === projectId)) return;
      await loadSingleProject(projectId, projects);
    }
  }

  async function handleRefresh() {
    if (state.status === 'loading-details') return;
    const prevSelection = selectedProjectId;
    setState({ status: 'loading-list' });
    try {
      const projects = sortProjects(await fetchAllProjects());
      if (prevSelection === null) {
        await loadAllDetails(projects);
      } else if (typeof prevSelection === 'string') {
        await loadSingleProject(prevSelection, projects);
      } else {
        setSelectedProjectId(undefined);
        setState({ status: 'idle', projects });
      }
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  const dashboardData = useMemo(() => {
    if (state.status !== 'loaded') return null;
    const details = (typeof selectedProjectId === 'string' && state.scope === 'all')
      ? state.allDetails.filter(p => p.id === selectedProjectId)
      : state.allDetails;
    return aggregateData(details);
  }, [state, selectedProjectId]);

  async function handleExport() {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, {
      backgroundColor: '#020617',
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `reptorgraph-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  const projects = (
    state.status === 'idle' ||
    state.status === 'loading-details' ||
    state.status === 'loaded'
  ) ? state.projects : [];

  const isSingleProject = typeof selectedProjectId === 'string';
  const lastUpdated = dashboardData?.lastUpdated ?? null;

  if (state.status === 'loading-list') {
    return <LoadingState done={0} total={0} lang={lang} />;
  }

  if (state.status === 'error') {
    return <ErrorState message={state.message} onRetry={loadList} lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        lastUpdated={lastUpdated}
        lang={lang}
        onLangChange={handleLangChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={handleProjectChange}
      />

      {state.status === 'loading-details' && (
        <LoadingState done={state.done} total={state.total} lang={lang} />
      )}

      {state.status === 'idle' && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-500 text-sm">{t(lang, 'selectToLoad')}</p>
        </div>
      )}

      {state.status === 'loaded' && dashboardData && (
        <div ref={dashboardRef} className="p-6 space-y-5 bg-slate-950">

          {/* Overview — hidden in single project mode */}
          {!isSingleProject && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label={t(lang, 'totalProjects')}     value={dashboardData.totalProjects} />
              <StatCard label={t(lang, 'activeProjects')}    value={dashboardData.activeProjects} />
              <StatCard label={t(lang, 'finalizedProjects')} value={dashboardData.finalizedProjects} />
              <StatCard label={t(lang, 'totalFindings')}     value={dashboardData.totalFindings} />
            </div>
          )}

          {/* Severity breakdown — adds Total card in single project mode */}
          <div className={`grid grid-cols-2 md:grid-cols-3 ${isSingleProject ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4`}>
            <StatCard label={t(lang, 'critical')}      value={dashboardData.bySeverity.critical} color={colors.severity.critical} />
            <StatCard label={t(lang, 'high')}          value={dashboardData.bySeverity.high}     color={colors.severity.high} />
            <StatCard label={t(lang, 'medium')}        value={dashboardData.bySeverity.medium}   color={colors.severity.medium} />
            <StatCard label={t(lang, 'low')}           value={dashboardData.bySeverity.low}      color={colors.severity.low} />
            <StatCard label={t(lang, 'informational')} value={dashboardData.bySeverity.info}     color={colors.severity.info} />
            {isSingleProject && (
              <StatCard label={t(lang, 'total')} value={dashboardData.totalFindings} />
            )}
          </div>

          {/* Retest breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label={colors.retestLabels?.new      ?? t(lang, 'reported')}     value={dashboardData.byRetestStatus.new}      sublabel={t(lang, 'reportedSub')} />
            <StatCard label={colors.retestLabels?.resolved ?? t(lang, 'fixed')}        value={dashboardData.byRetestStatus.resolved}  sublabel={t(lang, 'fixedSub')}    color={colors.retest.resolved} />
            <StatCard label={colors.retestLabels?.open     ?? t(lang, 'notFixed')}     value={dashboardData.byRetestStatus.open}      sublabel={t(lang, 'notFixedSub')} color={colors.retest.open} />
            <StatCard label={colors.retestLabels?.partial  ?? t(lang, 'partialFixed')} value={dashboardData.byRetestStatus.partial}   sublabel={t(lang, 'partialFixedSub')} color={colors.retest.partial} />
            <StatCard label={colors.retestLabels?.changed  ?? t(lang, 'changed')}      value={dashboardData.byRetestStatus.changed}   sublabel={t(lang, 'changedSub')}  color={colors.retest.changed} />
            <StatCard label={colors.retestLabels?.accepted ?? t(lang, 'riskAccepted')} value={dashboardData.byRetestStatus.accepted}  sublabel={t(lang, 'riskAcceptedSub')} color={colors.retest.accepted} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SeverityChart data={dashboardData.bySeverity} lang={lang} colors={colors.severity} />
            <RetestStatusChart data={dashboardData.byRetestStatus} lang={lang} colors={colors.retest} retestLabels={colors.retestLabels} />
          </div>

          {/* Pentester breakdown */}
          {dashboardData.byPentester.length > 0 && (
            <PentesterChart data={dashboardData.byPentester} lang={lang} colors={colors.severity} />
          )}

          {/* Top projects — hidden in single project mode */}
          {!isSingleProject && dashboardData.topProjects.length > 0 && (
            <TopProjectsChart data={dashboardData.topProjects} lang={lang} colors={colors.severity} />
          )}

          <p className="text-center text-slate-700 text-xs pb-2">
            ReptorGraph — {t(lang, 'footerBy')}{' '}
            <span className="text-slate-600">leforense</span>
          </p>
        </div>
      )}
    </div>
  );
}
