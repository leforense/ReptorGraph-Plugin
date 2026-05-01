import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, LabelList,
} from 'recharts';
import type { FindingListStat, SeverityColors, Severity } from '../types';
import type { Lang } from '../i18n';
import { t } from '../i18n';

interface Props {
  data: FindingListStat[];
  lang: Lang;
  colors: SeverityColors;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 5, high: 4, medium: 3, low: 2, info: 1,
};

const SEVERITY_LABEL: Record<Severity, { pt: string; en: string }> = {
  critical: { pt: 'Crítico',    en: 'Critical' },
  high:     { pt: 'Alto',       en: 'High' },
  medium:   { pt: 'Médio',      en: 'Medium' },
  low:      { pt: 'Baixo',      en: 'Low' },
  info:     { pt: 'Info',       en: 'Info' },
};

function truncateTitle(title: string, max = 48): string {
  return title.length > max ? title.slice(0, max - 1) + '…' : title;
}

export default function FindingListChart({ data, lang, colors }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map(f => ({
    name: truncateTitle(f.title),
    fullTitle: f.title,
    value: SEVERITY_WEIGHT[f.severity],
    severity: f.severity,
    severityLabel: SEVERITY_LABEL[f.severity][lang === 'pt-BR' ? 'pt' : 'en'],
    color: colors[f.severity],
  }));

  const barHeight = 38;
  const chartHeight = Math.max(160, chartData.length * barHeight + 60);

  return (
    <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
      <h2 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
        {t(lang, 'chartFindingsListTitle')}
      </h2>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 70, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 5]}
            hide
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={260}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              // payload[0].payload is the raw chartData entry (typed as any by Recharts)
              const entry = payload[0].payload as {
                fullTitle: string;
                severityLabel: string;
                color: string;
              };
              return (
                <div style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '13px',
                }}>
                  <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>
                    {entry.fullTitle}
                  </p>
                  <p style={{ color: entry.color }}>{entry.severityLabel}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26}>
            <LabelList
              dataKey="severityLabel"
              position="right"
              style={{ fill: '#64748b', fontSize: 12 }}
            />
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
