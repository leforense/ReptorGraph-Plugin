# ReptorGraph

A [SysReptor](https://docs.sysreptor.com) plugin that aggregates findings from all your projects and displays a visual security metrics dashboard — directly inside the SysReptor interface.

**UPDATE:**  Now it doesn't load everything; you need to select whether you want to load everything or each item individually. 

<img width="1464" height="1239" alt="image" src="https://github.com/user-attachments/assets/a7a5d34f-75cf-49d5-80df-e9afd2f48432" />

**All Projects:**

<img width="1462" height="1161" alt="image" src="https://github.com/user-attachments/assets/9c93b4a1-8e60-46d6-9cf1-8e3eb7fc33be" />


**Unique Project:**

<img width="1461" height="1119" alt="image" src="https://github.com/user-attachments/assets/d408b22b-fa76-4615-969a-3733cf6d20de" />


## Features

- **Overview cards** — total projects, active vs finalized, total findings
- **Severity breakdown** — Critical / High / Medium / Low / Informational
- **Retest status breakdown** — Reported, Fixed, Not Fixed, Partial, Changed, Risk Accepted
- **Findings by pentester** — stacked by severity, based on project membership
- **Top active projects** — stacked by severity, top 10
- **Findings list** *(single project)* — horizontal bar chart, each finding by title and severity
- **Vulnerability lifecycle** *(single project)* — stacked area chart showing active findings day-by-day, from pentest start to last remediation
- **Avg. resolution time card** *(single project)* — mean days from pentest start to retest confirmation, for resolved findings
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
git clone https://github.com/leforense/ReptorGraph-Plugin.git
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

All customization below is done via `app.env` — **no rebuild required**. After any change, restart the container:

```bash
docker compose restart app
```

> **How it works:** on startup, `apps.py` reads the env vars and writes a `config.js` file into the collected static directory. The React frontend loads this file before rendering. If no env vars are set, the built-in defaults from `frontend/public/config.js` are used.

---

### Default language

The UI ships with a PT-BR / EN toggle. The default language (shown to users who haven't toggled it yet) is `pt-BR`. To change it:

```env
REPTORGRAPH_DEFAULT_LANG=en
```

Accepted values: `pt-BR`, `en`. Any other value falls back to `pt-BR`.

> The user's last-chosen language is saved in their browser's `localStorage` and always takes priority over this setting.

---

### Retest status labels

The six retest status labels shown in the dashboard (stat cards and chart) can be overridden per installation — useful when your team uses different terminology than the defaults.

```env
REPTORGRAPH_RETEST_LABEL_NEW=Reported
REPTORGRAPH_RETEST_LABEL_OPEN=Issue Ticket Open
REPTORGRAPH_RETEST_LABEL_RESOLVED=Fixed
REPTORGRAPH_RETEST_LABEL_PARTIAL=Partially Remediated
REPTORGRAPH_RETEST_LABEL_CHANGED=Behavior Changed
REPTORGRAPH_RETEST_LABEL_ACCEPTED=Risk Accepted
```

Only set the variables you want to override. Unset ones continue to use the built-in PT-BR / EN translations. Custom labels are language-agnostic — they override both PT-BR and EN simultaneously.

The underlying `retest_status` API values (`new`, `open`, `resolved`, `partial`, `changed`, `accepted`) are fixed by SysReptor and are not configurable.

---

### Vulnerability lifecycle fields

The lifecycle chart reads two dates to compute each finding's active period:

| Concept | Default field | Where it lives |
|---|---|---|
| Pentest start date | `start_date` | Any project section's `data` object |
| Resolution date | `date_retest` | `finding.data` |
| Resolution status field | `retest_status` | `finding.data` |
| Value that means "resolved" | `resolved` | `finding.data[retestStatusField]` |

If your SysReptor report template uses different field names, override them:

```env
REPTORGRAPH_LIFECYCLE_START_FIELD=start_date
REPTORGRAPH_LIFECYCLE_RETEST_DATE_FIELD=date_retest
REPTORGRAPH_LIFECYCLE_RETEST_STATUS_FIELD=retest_status
REPTORGRAPH_LIFECYCLE_RESOLVED_VALUE=resolved
```

Only set the variables you need to override — unset ones use the defaults above.

> **How the chart reads `start_date`:** the plugin searches all sections of the project (e.g. `target_details`, `other`, etc.) and uses the first section whose `data` object contains the configured field. If no section has it, the lifecycle chart shows a "no data" placeholder.

---

### Chart colors

Severity and retest status colors can be overridden via `app.env`:

```env
# Severity colors
REPTORGRAPH_COLOR_CRITICAL=#dc2626
REPTORGRAPH_COLOR_HIGH=#f97316
REPTORGRAPH_COLOR_MEDIUM=#eab308
REPTORGRAPH_COLOR_LOW=#3b82f6
REPTORGRAPH_COLOR_INFO=#64748b

# Retest status colors
REPTORGRAPH_COLOR_RETEST_NEW=#94a3b8
REPTORGRAPH_COLOR_RETEST_OPEN=#ef4444
REPTORGRAPH_COLOR_RETEST_RESOLVED=#22c55e
REPTORGRAPH_COLOR_RETEST_PARTIAL=#eab308
REPTORGRAPH_COLOR_RETEST_CHANGED=#f97316
REPTORGRAPH_COLOR_RETEST_ACCEPTED=#a855f7
```

---

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
│       ├── plugin.js         ← SysReptor route + menu registration
│       └── config.js         ← default colors (overwritten at runtime by app.env)
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
