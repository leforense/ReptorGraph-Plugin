type Variant = 'default' | 'critical' | 'high' | 'medium' | 'low' | 'info';

interface StatCardProps {
  label: string;
  value: number;
  variant?: Variant;
  sublabel?: string;
  color?: string;
}

const borderColor: Record<Variant, string> = {
  default:  'border-slate-700',
  critical: 'border-red-600',
  high:     'border-orange-500',
  medium:   'border-yellow-500',
  low:      'border-blue-500',
  info:     'border-slate-500',
};

const valueColor: Record<Variant, string> = {
  default:  'text-cyan-400',
  critical: 'text-red-400',
  high:     'text-orange-400',
  medium:   'text-yellow-400',
  low:      'text-blue-400',
  info:     'text-slate-400',
};

export default function StatCard({ label, value, variant = 'default', sublabel, color }: StatCardProps) {
  return (
    <div
      className={`bg-slate-900 rounded-lg border-l-4 ${!color ? borderColor[variant] : ''} p-4 flex flex-col justify-between`}
      style={color ? { borderLeftColor: color } : undefined}
    >
      <p className="text-slate-400 text-xs uppercase tracking-wider leading-tight">{label}</p>
      <p
        className={`text-3xl font-bold mt-2 ${!color ? valueColor[variant] : ''}`}
        style={color ? { color } : undefined}
      >
        {value.toLocaleString('pt-BR')}
      </p>
      {sublabel && (
        <p className="text-slate-500 text-xs mt-1">{sublabel}</p>
      )}
    </div>
  );
}
