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

        # Only write config.js if at least one color env var is explicitly set.
        # Otherwise, leave the file from collectstatic untouched so that colors
        # edited in frontend/public/config.js (and built into static/) are preserved.
        all_keys = (
            [f'REPTORGRAPH_COLOR_{k.upper()}' for k in severity_defaults]
            + [f'REPTORGRAPH_COLOR_RETEST_{k.upper()}' for k in retest_defaults]
        )
        if not any(os.environ.get(key) for key in all_keys):
            log.info('ReptorGraph: no color env vars set — keeping collectstatic config.js')
            return

        config = {
            'severity': {
                k: os.environ.get(f'REPTORGRAPH_COLOR_{k.upper()}', v)
                for k, v in severity_defaults.items()
            },
            'retest': {
                k: os.environ.get(f'REPTORGRAPH_COLOR_RETEST_{k.upper()}', v)
                for k, v in retest_defaults.items()
            },
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
