import logging
from sysreptor.plugins import PluginConfig

log = logging.getLogger(__name__)


class ReptorGraphConfig(PluginConfig):
    """
    ReptorGraph - Security Metrics Dashboard

    Aggregates findings from all SysReptor projects and displays
    a visual dashboard with severity, retest status, and pentester metrics.
    """

    plugin_id = 'b7687d15-fa42-4ac4-8fa5-aa06f6159377'

    def ready(self) -> None:
        log.info('Loading ReptorGraph...')

    def get_frontend_settings(self, request):
        return {}
