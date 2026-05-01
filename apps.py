import logging
from sysreptor.plugins import PluginConfig

log = logging.getLogger(__name__)

class ReptorGraphConfig(PluginConfig):
    plugin_id = 'b7687d15-fa42-4ac4-8fa5-aa06f6159377'

    def ready(self) -> None:
        import json
        import os
        from django.conf import settings

        severity_defaults = {
            'critical': "#DC2626",
            'high':     '#f97316',
            'medium':   '#eab308',
            'low':      '#3b82f6',
            'info':     '#64748b',
        }
        retest_defaults = {
            'new':      '#94a3b8',
            'open':     '#ef4444',
            'resolved': '#22c55e',
            'partial':  '#eab308',
            'changed':  '#f97316',
            'accepted': '#a855f7',
        }
        retest_label_keys = ['new', 'open', 'resolved', 'partial', 'changed', 'accepted']

        # Lifecycle field config — allows community customization for different SysReptor templates.
        # These control which section/finding fields the frontend reads for the lifecycle chart.
        lifecycle_env_keys = {
            'startField':        'REPTORGRAPH_LIFECYCLE_START_FIELD',
            'retestDateField':   'REPTORGRAPH_LIFECYCLE_RETEST_DATE_FIELD',
            'retestStatusField': 'REPTORGRAPH_LIFECYCLE_RETEST_STATUS_FIELD',
            'resolvedValue':     'REPTORGRAPH_LIFECYCLE_RESOLVED_VALUE',
        }

        # Only write config.js if at least one env var is explicitly set.
        # Otherwise, leave the file from collectstatic untouched so that defaults
        # set in frontend/public/config.js (and built into static/) are preserved.
        all_trigger_keys = (
            [f'REPTORGRAPH_COLOR_{k.upper()}' for k in severity_defaults]
            + [f'REPTORGRAPH_COLOR_RETEST_{k.upper()}' for k in retest_defaults]
            + [f'REPTORGRAPH_RETEST_LABEL_{k.upper()}' for k in retest_label_keys]
            + ['REPTORGRAPH_DEFAULT_LANG']
            + list(lifecycle_env_keys.values())
        )
        if not any(os.environ.get(key) for key in all_trigger_keys):
            log.info('ReptorGraph: no env vars set — keeping collectstatic config.js')
            return

        raw_lang = os.environ.get('REPTORGRAPH_DEFAULT_LANG', 'pt-BR')
        default_lang = raw_lang if raw_lang in ('pt-BR', 'en') else 'pt-BR'

        # Only include labels that are explicitly set — unset ones fall back to i18n in the frontend
        retest_labels = {
            k: v for k in retest_label_keys
            if (v := os.environ.get(f'REPTORGRAPH_RETEST_LABEL_{k.upper()}', ''))
        }

        # Only include lifecycle overrides that are explicitly set
        lifecycle_overrides = {
            k: v for k, env_key in lifecycle_env_keys.items()
            if (v := os.environ.get(env_key, ''))
        }

        config = {
            'defaultLang': default_lang,
            'severity': {
                k: os.environ.get(f'REPTORGRAPH_COLOR_{k.upper()}', v)
                for k, v in severity_defaults.items()
            },
            'retest': {
                k: os.environ.get(f'REPTORGRAPH_COLOR_RETEST_{k.upper()}', v)
                for k, v in retest_defaults.items()
            },
            'retestLabels': retest_labels,
            'lifecycle': lifecycle_overrides if lifecycle_overrides else {},
        }

        config_path = os.path.join(
            settings.STATIC_ROOT, 'plugins', self.plugin_id, 'config.js'
        )
        try:
            with open(config_path, 'w') as f:
                f.write(f'window.REPTORGRAPH_CONFIG = {json.dumps(config)};\n')
            log.info('ReptorGraph: config.js written to %s', config_path)
        except OSError as e:
            log.warning('ReptorGraph: could not write config.js (%s) — using frontend defaults', e)

    def get_frontend_settings(self, request):
        return {}
