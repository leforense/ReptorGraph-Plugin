import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { DashboardData } from './types';
import type { Lang } from './i18n';
import { t } from './i18n';
import { fetchAllProjects, fetchAllProjectDetails } from './api';
import { aggregateData } from './aggregator';
import Header from './components/Header';
import StatCard from './components/StatCard';
import SeverityChart from './components/SeverityChart';
import RetestStatusChart from './components/RetestStatusChart';
import PentesterChart from './components/PentesterChart';
import TopProjectsChart from './components/TopProjectsChart';
import { LoadingState, ErrorState } from './components/LoadingState';

type AppState =
  | { status: 'loading'; done: number; total: number }
  | { status: 'error'; message: string }
  | { status: 'loaded'; data: DashboardData };

function getInitialLang(): Lang {
  const saved = localStorage.getItem('reptorgraph-lang');
  return saved === 'en' || saved === 'pt-BR' ? saved : 'pt-BR';
}

export default function App() {
  const [state, setState] = useState<AppState>({ status: 'loading', done: 0, total: 0 });
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const dashboardRef = useRef<HTMLDivElement>(null);

  function handleLangChange(newLang: Lang) {
    setLang(newLang);
    localStorage.setItem('reptorgraph-lang', newLang);
  }

  async function load() {
    try {
      setState({ status: 'loading', done: 0, total: 0 });

      const projects = await fetchAllProjects();
      if (projects.length === 0) {
        setState({ status: 'loaded', data: aggregateData([]) });
        return;
      }

      setState({ status: 'loading', done: 0, total: projects.length });
      const details = await fetchAllProjectDetails(projects, (done, total) => {
        setState({ status: 'loading', done, total });
      });

      setState({ status: 'loaded', data: aggregateData(details) });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (state.status === 'loading') {
    return <LoadingState done={state.done} total={state.total} lang={lang} />;
  }

  if (state.status === 'error') {
    return <ErrorState message={state.message} onRetry={load} lang={lang} />;
  }

  const { data } = state;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        lastUpdated={data.lastUpdated}
        lang={lang}
        onLangChange={handleLangChange}
        onRefresh={load}
        onExport={handleExport}
      />

      <div ref={dashboardRef} className="p-6 space-y-5 bg-slate-950">
        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t(lang, 'totalProjects')}    value={data.totalProjects} />
          <StatCard label={t(lang, 'activeProjects')}   value={data.activeProjects} />
          <StatCard label={t(lang, 'finalizedProjects')} value={data.finalizedProjects} />
          <StatCard label={t(lang, 'totalFindings')}    value={data.totalFindings} />
        </div>

        {/* Severity breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label={t(lang, 'critical')}     value={data.bySeverity.critical} variant="critical" />
          <StatCard label={t(lang, 'high')}         value={data.bySeverity.high}     variant="high" />
          <StatCard label={t(lang, 'medium')}       value={data.bySeverity.medium}   variant="medium" />
          <StatCard label={t(lang, 'low')}          value={data.bySeverity.low}      variant="low" />
          <StatCard label={t(lang, 'informational')} value={data.bySeverity.info}    variant="info" />
        </div>

        {/* Retest breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label={t(lang, 'reported')}
            value={data.byRetestStatus.new}
            sublabel={t(lang, 'reportedSub')}
          />
          <StatCard
            label={t(lang, 'fixed')}
            value={data.byRetestStatus.resolved}
            sublabel={t(lang, 'fixedSub')}
            variant="info"
          />
          <StatCard
            label={t(lang, 'notFixed')}
            value={data.byRetestStatus.open}
            sublabel={t(lang, 'notFixedSub')}
            variant="critical"
          />
          <StatCard
            label={t(lang, 'partialFixed')}
            value={data.byRetestStatus.partial}
            sublabel={t(lang, 'partialFixedSub')}
            variant="medium"
          />
          <StatCard
            label={t(lang, 'changed')}
            value={data.byRetestStatus.changed}
            sublabel={t(lang, 'changedSub')}
            variant="high"
          />
          <StatCard
            label={t(lang, 'riskAccepted')}
            value={data.byRetestStatus.accepted}
            sublabel={t(lang, 'riskAcceptedSub')}
            variant="low"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SeverityChart data={data.bySeverity} lang={lang} />
          <RetestStatusChart data={data.byRetestStatus} lang={lang} />
        </div>

        {/* Pentester breakdown */}
        {data.byPentester.length > 0 && (
          <PentesterChart data={data.byPentester} lang={lang} />
        )}

        {/* Top projects */}
        {data.topProjects.length > 0 && (
          <TopProjectsChart data={data.topProjects} lang={lang} />
        )}

        <p className="text-center text-slate-700 text-xs pb-2">
          ReptorGraph — {t(lang, 'footerBy')}{' '}
          <span className="text-slate-600">leforense</span>
        </p>
      </div>
    </div>
  );
}
