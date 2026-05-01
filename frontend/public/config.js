// Default config — overwritten by apps.py on container startup when env vars are set
window.REPTORGRAPH_CONFIG = {
  defaultLang: 'pt-BR',
  severity: { critical: '#dc2626', high: '#f97316', medium: '#eab308', low: '#3b82f6', info: '#64748b' },
  retest:   { new: '#94a3b8', open: '#ef4444', resolved: '#22c55e', partial: '#eab308', changed: '#f97316', accepted: '#a855f7' },
  // lifecycle: field names used to build the vulnerability lifecycle chart.
  // Override via REPTORGRAPH_LIFECYCLE_* env vars in app.env.
  lifecycle: {
    startField:        'start_date',    // section field that holds the pentest start date
    retestDateField:   'date_retest',   // finding.data field with the retest/resolution date
    retestStatusField: 'retest_status', // finding.data field with the retest status
    resolvedValue:     'resolved',      // value that means the finding is resolved
  }
};
