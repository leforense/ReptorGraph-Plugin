export type Lang = 'pt-BR' | 'en';

const translations = {
  'pt-BR': {
    // Header
    appSubtitle: 'Security Metrics Dashboard',
    btnRefresh: 'Atualizar',
    btnExport: 'Exportar PNG',
    lastUpdated: 'Atualizado',

    // Stat cards — overview
    totalProjects: 'Total de Projetos',
    activeProjects: 'Projetos Ativos',
    finalizedProjects: 'Projetos Finalizados',
    totalFindings: 'Total de Findings',

    // Project filter
    filterAllProjects: 'Todos os Projetos',
    selectProject: 'Selecione um projeto...',
    selectToLoad: 'Selecione um projeto para carregar o dashboard',
    total: 'Total',

    // Stat cards — severity
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Médio',
    low: 'Baixo',
    informational: 'Informativo',

    // Stat cards — retest
    reported: 'Reportados',
    reportedSub: 'Aguardando reteste',
    fixed: 'Corrigidos',
    fixedSub: 'Remediação confirmada',
    notFixed: 'Não Corrigidos',
    notFixedSub: 'Reteste reprovado',
    partialFixed: 'Parcialmente',
    partialFixedSub: 'Remediação parcial',
    changed: 'Comportamento Alterado',
    changedSub: 'Não corrigido',
    riskAccepted: 'Risco Aceito',
    riskAcceptedSub: 'Aprovado pela diretoria',

    // Chart titles
    chartSeverityTitle: 'Findings por Severidade',
    chartRetestTitle: 'Status de Reteste',
    chartPentesterTitle: 'Findings por Pentester',
    chartPentesterNote: 'Baseado em participação no projeto — todos os pentesters recebem os findings do projeto',
    chartTopProjectsTitle: 'Top Projetos Ativos por Número de Findings',
    chartFindingsListTitle: 'Findings do Projeto',
    chartLifecycleTitle: 'Vida Útil das Vulnerabilidades',
    avgResolutionDays: 'Tempo Médio de Resolução',
    avgResolutionSub: 'dias (findings resolvidos)',
    noLifecycleData: 'Sem data de início (campo não encontrado nas seções)',

    // Chart — severity labels
    severityCritical: 'Crítico',
    severityHigh: 'Alto',
    severityMedium: 'Médio',
    severityLow: 'Baixo',
    severityInfo: 'Info',

    // Chart — retest labels
    retestNew: 'Reportado',
    retestOpen: 'Não Resolvido',
    retestResolved: 'Resolvido',
    retestPartial: 'Parcial',
    retestChanged: 'Alterado',
    retestAccepted: 'Risco Aceito',

    // Tooltip
    tooltipFindings: 'Findings',
    tooltipProject: 'projeto',
    tooltipProjects: 'projetos',

    // Loading / Error
    loadingProjects: 'Buscando projetos...',
    loadingProject: 'Carregando projeto',
    loadingOf: 'de',
    errorTitle: 'Erro ao carregar dados',
    btnRetry: 'Tentar novamente',
    noRetestData: 'Sem dados de reteste',

    // Footer
    footerBy: 'desenvolvido por',
  },

  en: {
    // Header
    appSubtitle: 'Security Metrics Dashboard',
    btnRefresh: 'Refresh',
    btnExport: 'Export PNG',
    lastUpdated: 'Updated',

    // Stat cards — overview
    totalProjects: 'Total Projects',
    activeProjects: 'Active Projects',
    finalizedProjects: 'Finalized Projects',
    totalFindings: 'Total Findings',

    // Project filter
    filterAllProjects: 'All Projects',
    selectProject: 'Select a project...',
    selectToLoad: 'Select a project to load the dashboard',
    total: 'Total',

    // Stat cards — severity
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    informational: 'Informational',

    // Stat cards — retest
    reported: 'Reported',
    reportedSub: 'Awaiting retest',
    fixed: 'Fixed',
    fixedSub: 'Remediation confirmed',
    notFixed: 'Not Fixed',
    notFixedSub: 'Retest failed',
    partialFixed: 'Partially Fixed',
    partialFixedSub: 'Partial remediation',
    changed: 'Behavior Changed',
    changedSub: 'Not truly fixed',
    riskAccepted: 'Risk Accepted',
    riskAcceptedSub: 'Board approved',

    // Chart titles
    chartSeverityTitle: 'Findings by Severity',
    chartRetestTitle: 'Retest Status',
    chartPentesterTitle: 'Findings by Pentester',
    chartPentesterNote: "Based on project membership — all project pentesters receive the project's findings",
    chartTopProjectsTitle: 'Top Active Projects by Finding Count',
    chartFindingsListTitle: 'Project Findings',
    chartLifecycleTitle: 'Vulnerability Lifecycle',
    avgResolutionDays: 'Avg. Resolution Time',
    avgResolutionSub: 'days (resolved findings)',
    noLifecycleData: 'No start date (field not found in sections)',

    // Chart — severity labels
    severityCritical: 'Critical',
    severityHigh: 'High',
    severityMedium: 'Medium',
    severityLow: 'Low',
    severityInfo: 'Info',

    // Chart — retest labels
    retestNew: 'Reported',
    retestOpen: 'Not Fixed',
    retestResolved: 'Resolved',
    retestPartial: 'Partial',
    retestChanged: 'Changed',
    retestAccepted: 'Risk Accepted',

    // Tooltip
    tooltipFindings: 'Findings',
    tooltipProject: 'project',
    tooltipProjects: 'projects',

    // Loading / Error
    loadingProjects: 'Fetching projects...',
    loadingProject: 'Loading project',
    loadingOf: 'of',
    errorTitle: 'Error loading data',
    btnRetry: 'Try again',
    noRetestData: 'No retest data',

    // Footer
    footerBy: 'developed by',
  },
} as const;

export type TranslationKey = keyof typeof translations['pt-BR'];

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key];
}
