import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { FindingLifecycleStat, SeverityColors, Severity } from '../types';
import type { Lang } from '../i18n';
import { t } from '../i18n';

interface Props {
  data: FindingLifecycleStat[];
  lang: Lang;
  colors: SeverityColors;
}

interface DayPoint {
  date: string;
  dateMs: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

const SEVERITY_STACK_ORDER: Severity[] = ['info', 'low', 'medium', 'high', 'critical'];

function formatLabel(date: Date, lang: Lang): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  if (lang === 'pt-BR') return `${d}/${m}/${y}`;
  return `${m}/${d}/${y}`;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function buildTimeline(findings: FindingLifecycleStat[], lang: Lang): DayPoint[] {
  if (findings.length === 0) return [];

  // All findings share the same startDate (project start)
  const start = new Date(findings[0].startDate);
  start.setHours(0, 0, 0, 0);

  const allResolved = findings.every(f => f.endDate !== null);

  let end: Date;
  if (allResolved) {
    // End = lastResolutionDate + 1 day: the loop naturally lands on that day with all counts=0,
    // creating the visual "drop to zero" without extending the chart to today unnecessarily.
    let lastResolution = new Date(findings[0].endDate!);
    for (const f of findings) {
      const d = new Date(f.endDate!);
      if (d > lastResolution) lastResolution = d;
    }
    lastResolution.setHours(0, 0, 0, 0);
    end = addDays(lastResolution, 1);
  } else {
    // Some findings still open — show through today
    end = new Date();
    end.setHours(0, 0, 0, 0);
  }

  const points: DayPoint[] = [];

  // The zero anchor sits ~1/8 of the total span before the start date.
  // This makes the "before pentest" flat-zero section visually apparent on the chart
  // regardless of how long the engagement lasted. Minimum 3 days.
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const padding = Math.max(3, Math.ceil(totalDays / 8));
  const firstZero = addDays(start, -padding);
  points.push({
    date: formatLabel(firstZero, lang),
    dateMs: firstZero.getTime(),
    critical: 0, high: 0, medium: 0, low: 0, info: 0,
  });

  // Day by day from start to end
  const cursor = new Date(start);
  while (cursor <= end) {
    const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

    for (const f of findings) {
      const fStart = new Date(f.startDate);
      fStart.setHours(0, 0, 0, 0);
      // Finding is active on day d if: fStart <= d AND (no endDate OR d < endDate)
      // endDate is the retest date — on that day the finding is already resolved
      const fEnd = f.endDate ? new Date(f.endDate) : null;
      if (fEnd) fEnd.setHours(0, 0, 0, 0);

      if (cursor >= fStart && (fEnd === null || cursor < fEnd)) {
        counts[f.severity]++;
      }
    }

    points.push({
      date: formatLabel(cursor, lang),
      dateMs: cursor.getTime(),
      ...counts,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}

export default function LifecycleChart({ data, lang, colors }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 flex items-center justify-center min-h-[200px]">
        <p className="text-slate-600 text-sm">{t(lang, 'noLifecycleData')}</p>
      </div>
    );
  }

  const timeline = buildTimeline(data, lang);

  const severityLabels: Record<Severity, string> = {
    critical: t(lang, 'severityCritical'),
    high:     t(lang, 'severityHigh'),
    medium:   t(lang, 'severityMedium'),
    low:      t(lang, 'severityLow'),
    info:     t(lang, 'severityInfo'),
  };

  return (
    <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
      <h2 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
        {t(lang, 'chartLifecycleTitle')}
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={timeline} margin={{ top: 4, right: 10, left: -10, bottom: 4 }}>
          <defs>
            {SEVERITY_STACK_ORDER.map(sev => (
              <linearGradient key={sev} id={`grad-${sev}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={colors[sev]} stopOpacity={0.6} />
                <stop offset="95%" stopColor={colors[sev]} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '13px',
            }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
            itemStyle={{ color: '#94a3b8' }}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={value => <span style={{ color: '#94a3b8' }}>{value}</span>}
          />
          {/* Stacked areas: info at bottom, critical on top — matches visual severity emphasis */}
          {SEVERITY_STACK_ORDER.map(sev => (
            <Area
              key={sev}
              type="stepAfter"
              dataKey={sev}
              name={severityLabels[sev]}
              stackId="1"
              stroke={colors[sev]}
              fill={`url(#grad-${sev})`}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
