/**
 * ReptorGraph - SysReptor Plugin Entry Point
 * Registers the dashboard route and main menu entry.
 */
export default function (options) {
  options.pluginHelpers.addRoute({
    scope: 'main',
    route: {
      path: 'reptorgraph',
      component: () => options.pluginHelpers.iframeComponent({
        src: 'index.html',
      }),
    },
    menu: {
      title: 'ReptorGraph',
    },
  });
}
