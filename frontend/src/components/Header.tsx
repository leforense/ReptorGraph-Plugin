import type { Lang } from '../i18n';
import { t } from '../i18n';

interface HeaderProps {
  lastUpdated: Date;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export default function Header({ lastUpdated, lang, onLangChange, onRefresh, onExport }: HeaderProps) {
  const locale = lang === 'pt-BR' ? 'pt-BR' : 'en-US';

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <svg
          className="w-8 h-8 text-cyan-500 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
        <div>
          <h1 className="text-lg font-bold text-slate-100 leading-tight">ReptorGraph</h1>
          <p className="text-slate-500 text-xs">{t(lang, 'appSubtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language toggle */}
        <div className="flex items-center border border-slate-700 rounded-md overflow-hidden">
          <button
            onClick={() => onLangChange('pt-BR')}
            className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
              lang === 'pt-BR'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => onLangChange('en')}
            className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
              lang === 'en'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            EN
          </button>
        </div>

        <span className="text-slate-500 text-xs hidden md:block">
          {t(lang, 'lastUpdated')}: {lastUpdated.toLocaleString(locale)}
        </span>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors border border-slate-700"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {t(lang, 'btnRefresh')}
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-cyan-600 text-white hover:bg-cyan-500 transition-colors font-medium"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {t(lang, 'btnExport')}
        </button>
      </div>
    </header>
  );
}
