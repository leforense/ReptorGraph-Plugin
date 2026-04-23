import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer,
} from 'recharts';
import type { BySeverity } from '../types';
import type { Lang } from '../i18n';
import { t } from '../i18n';

interface Props {
  data: BySeverity;
  lang: Lang;
}

export default function SeverityChart({ data, lang }: Props) {
  const severityConfig = [
    { key: 'critical' as const, label: t(lang, 'severityCritical'), color: '#dc2626' },
    { key: 'high'     as const, label: t(lang, 'severityHigh'),     color: '#f97316' },
    { key: 'medium'   as const, label: t(lang, 'severityMedium'),   color: '#eab308' },
    { key: 'low'      as const, label: t(lang, 'severityLow'),      color: '#3b82f6' },
    { key: 'info'     as const, label: t(lang, 'severityInfo'),     color: '#64748b' },
  ];

  const chartData = severityConfig.map(s => ({
    name: s.label,
    value: data[s.key],
    color: s.color,
  }));

  return (
    <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
      <h2 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
        {t(lang, 'chartSeverityTitle')}
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 10, left: -10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '13px',
            }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
            itemStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [value.toLocaleString(), t(lang, 'tooltipFindings')]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
