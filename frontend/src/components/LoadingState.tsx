import type { Lang } from '../i18n';
import { t } from '../i18n';

interface LoadingProps {
  done: number;
  total: number;
  lang: Lang;
}

interface ErrorProps {
  message: string;
  onRetry: () => void;
  lang: Lang;
}

export function LoadingState({ done, total, lang }: LoadingProps) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const message = total === 0
    ? t(lang, 'loadingProjects')
    : `${t(lang, 'loadingProject')} ${done} ${t(lang, 'loadingOf')} ${total}`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3">
        <svg
          className="w-8 h-8 text-cyan-500 animate-pulse"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
        <span className="text-lg font-semibold text-slate-300">ReptorGraph</span>
      </div>

      <div className="w-72 space-y-2">
        <p className="text-slate-400 text-sm text-center">{message}</p>
        {total > 0 && (
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
        {total > 0 && (
          <p className="text-slate-600 text-xs text-center">{percent}%</p>
        )}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry, lang }: ErrorProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <svg
        className="w-12 h-12 text-red-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div className="text-center space-y-1">
        <p className="text-slate-200 font-semibold">{t(lang, 'errorTitle')}</p>
        <p className="text-slate-500 text-sm max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-sm font-medium transition-colors"
      >
        {t(lang, 'btnRetry')}
      </button>
    </div>
  );
}
