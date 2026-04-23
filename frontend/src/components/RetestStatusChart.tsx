import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, LabelList,
} from 'recharts';
import type { ByRetestStatus } from '../types';
import type { Lang } from '../i18n';
import { t } from '../i18n';

interface Props {
  data: ByRetestStatus;
  lang: Lang;
}

export default function RetestStatusChart({ data, lang }: Props) {
  const statusConfig = [
    { key: 'new'      as const, label: t(lang, 'retestNew'),      color: '#94a3b8' },
    { key: 'open'     as const, label: t(lang, 'retestOpen'),     color: '#ef4444' },
    { key: 'resolved' as const, label: t(lang, 'retestResolved'), color: '#22c55e' },
    { key: 'partial'  as const, label: t(lang, 'retestPartial'),  color: '#eab308' },
    { key: 'changed'  as const, label: t(lang, 'retestChanged'),  color: '#f97316' },
    { key: 'accepted' as const, label: t(lang, 'retestAccepted'), color: '#a855f7' },
  ];

  const chartData = statusConfig
    .map(s => ({ name: s.label, value: data[s.key], color: s.color }))
    .filter(s => s.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 flex items-center justify-center">
        <p className="text-slate-600 text-sm">{t(lang, 'noRetestData')}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
      <h2 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
        {t(lang, 'chartRetestTitle')}
      </h2>
      <ResponsiveContainer width="100%" height={240}>
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
            width={110}
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
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
            <LabelList
              dataKey="value"
              position="right"
              style={{ fill: '#64748b', fontSize: 12 }}
              formatter={(v: number) => v.toLocaleString()}
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
