import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');
  const apiUrl = env.SYSREPTOR_URL;
  const apiToken = env.SYSREPTOR_TOKEN;

  return {
    plugins: [react()],
    build: {
      outDir: '../static',
      emptyOutDir: true,
    },
    base: './',
    server: {
      // In dev mode, proxy /api/* to the real SysReptor instance with Bearer auth.
      // The token is injected server-side so it never appears in browser requests.
      proxy: apiUrl
        ? {
            '/api': {
              target: apiUrl,
              changeOrigin: true,
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  if (apiToken) {
                    proxyReq.setHeader('Authorization', `Bearer ${apiToken}`);
                  }
                });
              },
            },
          }
        : undefined,
    },
  };
});
