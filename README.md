# ReptorGraph

A [SysReptor](https://docs.sysreptor.com) plugin that aggregates findings from all your projects and displays a visual security metrics dashboard — directly inside the SysReptor interface.

<img width="2928" height="3310" alt="reptorgraph-2026-04-23 (3)" src="https://github.com/user-attachments/assets/c8fd1f12-73a6-4a7d-a0b2-3398aa9f6437" />


## Features

- **Overview cards** — total projects, active vs finalized, total findings
- **Severity breakdown** — Critical / High / Medium / Low / Informational
- **Retest status breakdown** — Reported, Fixed, Not Fixed, Partial, Changed, Risk Accepted
- **Findings by pentester** — stacked by severity, based on project membership
- **Top active projects** — stacked by severity, top 10
- **Export PNG** — one-click dashboard screenshot
- **Bilingual UI** — PT-BR / EN toggle, preference saved per browser

## How it works

The plugin frontend runs inside a SysReptor iframe (same origin). It fetches all projects and their findings from the SysReptor REST API using the logged-in user's session — no extra credentials required. Data is aggregated client-side and rendered with [Recharts](https://recharts.org).

> **Access scope:** the dashboard shows only the projects visible to the logged-in user. An admin sees all projects; a regular user sees only their own.

---

## Requirements

- SysReptor instance (self-hosted via Docker)
- Node.js 18+ (to build the frontend)
- The `plugins/` directory bind-mounted into the SysReptor container (see [Deploy](#deploy))

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ReptorGraph-Plugin.git
cd ReptorGraph-Plugin
```

### 2. Build the frontend

```bash
cd frontend
npm install
npm run build   # outputs to ../static/
cd ..
```

### 3. Place the plugin in your SysReptor deploy

Copy (or symlink) this directory as `reptorgraph` inside your plugins folder:

```bash
cp -r ReptorGraph-Plugin /path/to/sysreptor/deploy/plugins/reptorgraph
```

> The directory **must** be named `reptorgraph` — Python module names cannot contain hyphens.

### 4. Configure the bind mount

If you don't already have a `docker-compose.override.yml`, create one next to your `docker-compose.yml`:

```yaml
services:
  app:
    volumes:
      - type: bind
        source: ./plugins
        target: /app/plugins
        read_only: true
```

> The bind mount replaces the entire `/app/plugins` directory in the container. To keep the built-in plugins (`cyberchef`, `graphqlvoyager`, `checkthehash`) working, copy them from the official image first:
> ```bash
> docker create --name temp syslifters/sysreptor:latest
> docker cp temp:/app/plugins/cyberchef   ./plugins/
> docker cp temp:/app/plugins/graphqlvoyager ./plugins/
> docker cp temp:/app/plugins/checkthehash   ./plugins/
> docker rm temp
> ```

### 5. Enable the plugin

In your `app.env`:

```env
ENABLED_PLUGINS=cyberchef,graphqlvoyager,checkthehash,reptorgraph
```

### 6. Restart the container

```bash
docker compose restart app
```

**ReptorGraph** will appear in the SysReptor main menu.

---

## Development (local)

For local development, Vite proxies `/api/*` requests to your SysReptor instance using a Bearer token — so you can work on the UI without deploying to the server.

### 1. Create `.env` from the template

```bash
cp .env.example .env
```

Edit `.env`:

```env
SYSREPTOR_URL=https://your-sysreptor-instance.example.com
SYSREPTOR_TOKEN=your_api_token_here
```

Get your API token from **SysReptor → Account → API Tokens**.

### 2. Start the dev server

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

The Vite proxy injects the Bearer token server-side — it never reaches the browser.

---

## Customization

### (Attention) Retest status values

The `retest_status` field should reflect your environment in SysReptor; my environment was customized as follows:

| Value | Meaning |
|---|---|
| `new` | Reported — initial state when the pentest report is delivered |
| `open` | Not Fixed — submitted for retest but failed |
| `resolved` | Fixed — remediation confirmed |
| `partial` | Partially Fixed — partial remediation |
| `changed` | Behavior Changed — not truly fixed |
| `accepted` | Risk Accepted — formally approved by management |

These values are hardcoded in the plugin. If your SysReptor instance uses **different or additional statuses**, update the following files after rebuilding:

| File | What to change |
|---|---|
| `frontend/src/types.ts` | `RetestStatus` type union |
| `frontend/src/aggregator.ts` | `ByRetestStatus` object initializer |
| `frontend/src/i18n.ts` | `retest*` label keys in both `pt-BR` and `en` sections |
| `frontend/src/components/RetestStatusChart.tsx` | `statusConfig` array |

### Language / UI text

All human-readable strings live in `frontend/src/i18n.ts`. Both PT-BR and EN are defined there. Add more languages by extending the `translations` object and the `Lang` type.

### Top projects limit

The dashboard shows the top 10 active projects by finding count. Change the `.slice(0, 10)` in `frontend/src/aggregator.ts` to adjust.

---

## Project structure

```
reptorgraph/                  ← Django app (place this inside /app/plugins/)
├── __init__.py
├── apps.py                   ← PluginConfig (plugin_id, ready hook)
├── urls.py                   ← empty (no custom API endpoints)
├── static/                   ← built frontend (generated by npm run build)
│   ├── index.html
│   ├── plugin.js             ← SysReptor SPA integration entry point
│   └── assets/
├── frontend/                 ← React + Vite + TypeScript source
│   ├── src/
│   │   ├── i18n.ts           ← all UI strings (PT-BR + EN)
│   │   ├── api.ts            ← SysReptor API fetch logic
│   │   ├── aggregator.ts     ← data aggregation + pentester merge logic
│   │   ├── types.ts          ← TypeScript interfaces
│   │   ├── App.tsx           ← state management + layout
│   │   └── components/
│   └── public/
│       └── plugin.js         ← SysReptor route + menu registration
└── .env.example              ← dev credentials template
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Django (minimal — no database, no models) |
| Frontend | React 18 + Vite 6 + TypeScript (strict) |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Export | html2canvas |

All dependencies are bundled locally. No CDN calls — safe for air-gapped deployments.

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

When contributing, please:
- Run `npm run build` (which runs `tsc --noEmit` first) before submitting
- Keep UI strings in `i18n.ts` — no hardcoded text in components
- Follow the existing code style (functional components, explicit interfaces, no global state)

---

## License

MIT

---

*Developed by [leforense](https://github.com/leforense)*
