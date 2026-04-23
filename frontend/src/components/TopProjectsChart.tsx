import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
} from 'recharts';
import type { ProjectStat } from '../types';
import type { Lang } from '../i18n';
import { t } from '../i18n';

interface Props {
  data: ProjectStat[];
  lang: Lang;
}

function truncateName(name: string, max = 35): string {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

export default function TopProjectsChart({ data, lang }: Props) {
  const severityBars = [
    { key: 'critical' as const, label: t(lang, 'severityCritical'), color: '#dc2626' },
    { key: 'high'     as const, label: t(lang, 'severityHigh'),     color: '#f97316' },
    { key: 'medium'   as const, label: t(lang, 'severityMedium'),   color: '#eab308' },
    { key: 'low'      as const, label: t(lang, 'severityLow'),      color: '#3b82f6' },
    { key: 'info'     as const, label: t(lang, 'severityInfo'),     color: '#64748b' },
  ];

  const chartData = data.map(p => ({ ...p, name: truncateName(p.name) }));

  const barHeight = 34;
  const minHeight = 200;
  const chartHeight = Math.max(minHeight, chartData.length * barHeight + 60);

  return (
    <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
      <h2 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
        {t(lang, 'chartTopProjectsTitle')}
      </h2>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={200}
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
            formatter={(value: number, name) => [
              value.toLocaleString(),
              name,
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={(value) => (
              <span style={{ color: '#94a3b8' }}>{value}</span>
            )}
          />
          {severityBars.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId="a"
              fill={s.color}
            >
              {i === severityBars.length - 1 && (
                <LabelList
                  dataKey="total"
                  position="right"
                  style={{ fill: '#64748b', fontSize: 12 }}
                  formatter={(v: number) => v.toLocaleString()}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
