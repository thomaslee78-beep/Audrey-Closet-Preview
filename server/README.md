# Audrey Smart Scan Cloudflare Worker — Phase 7A4

This folder contains the production Smart Scan service for Audrey Closet.

The public PWA calls this Worker. The Worker holds `OPENAI_API_KEY` as a Cloudflare secret and forwards only approved Smart Scan requests to OpenAI.

## Recommended first deployment: create Worker first, then connect GitHub

This sequence is recommended because the Worker declares `OPENAI_API_KEY` as a required secret. Creating the Worker shell first lets you add that secret before repository deployments begin.

1. Create/sign in to a Cloudflare account.
2. Open **Workers & Pages** → **Create application**.
3. Create a simple Worker and name it exactly:
   `audrey-smartscan-api`
4. Deploy the starter Worker once so the Worker exists in your account.
5. Open the new Worker → **Settings** → **Variables and Secrets** → **Add**.
6. Add:
   - Type: **Secret**
   - Name: `OPENAI_API_KEY`
   - Value: your OpenAI API key
   - Save / Deploy
7. Open Worker → **Settings** → **Builds** → **Connect**.
8. Connect GitHub and authorize Cloudflare access to repository:
   `thomaslee78-beep/Audrey-Closet`
9. Configure the build:
   - Worker name: `audrey-smartscan-api`
   - Production branch for this first test: `dev/smart-scan-color-pattern-v13.24`
   - Root directory: `server`
   - Build command: leave blank
   - Deploy command: `npm run deploy`
10. Save the build configuration and trigger/deploy the branch.
11. Cloudflare will provide a URL similar to:
    `https://audrey-smartscan-api.<your-subdomain>.workers.dev`
12. Test:
    `<worker-url>/health`
    Expected JSON includes `ok: true` and `service: "audrey-smartscan"`.
13. Send only the Worker URL back to the Audrey Closet development thread. Do **not** send the API key.

The Worker name in Cloudflare must match the `name` field in `server/wrangler.jsonc`.

> Deployment trigger note: this README was intentionally touched after enabling the D1 migration deploy script to create a fresh production-branch push for Cloudflare Builds.

## Secret safety

Never put `OPENAI_API_KEY` in:

- GitHub source files
- GitHub Actions YAML
- browser JavaScript
- localStorage
- Preview configuration
- chat messages

The Worker accesses it through `env.OPENAI_API_KEY`.

## Optional quota storage (recommended before broad public release)

The Worker can use a Cloudflare KV binding named `SMARTSCAN_USAGE_KV` to enforce daily per-install/network quotas.

Without KV, Smart Scan still works, but quota mode is `log-only`.

When ready:

1. Cloudflare dashboard → **Storage & Databases** → **KV** → create namespace, for example `audrey-smartscan-usage`.
2. Worker → **Settings** → **Bindings** → Add KV namespace binding.
3. Binding name must be exactly: `SMARTSCAN_USAGE_KV`.
4. Select the namespace you created.
5. Redeploy the Worker.

## Current endpoints

- `GET /health`
- `POST /v1/smartscan/analyze`

The analyze endpoint:

- allows only Audrey Closet origins
- validates app/feature headers
- validates image/request size
- restricts AI models to the Audrey allowlist
- validates the returned clothing taxonomy
- logs model/token/request usage server-side
- optionally enforces daily quotas using KV

## Local CLI alternative

From the repository:

```bash
cd server
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

Enter the key only into Wrangler's secret prompt.

## Preview integration

The PWA modules are already prepared for service mode:

- `smart-scan-service-v13.24-phase7a4a.js`
- `smart-scan-ai-v13.24-phase7a4-runtime.js`

Preview currently leaves service mode dormant. Once the Worker URL is known, the Preview deployment can inject:

```js
window.AUDREY_SMART_SCAN_SERVICE_CONFIG = {
  enabled: true,
  endpoint: 'https://YOUR-WORKER.workers.dev',
  defaultModel: 'gpt-5.6-luna',
  detail: 'auto'
};
```

No API key is present in this configuration.

## Future Audrey Cloud expansion

This Worker can remain the Smart Scan route while the backend grows into a broader Audrey Cloud API. Future components can be separated by route/service, for example:

- `/v1/smartscan/*`
- `/v1/auth/*`
- `/v1/sync/*`
- `/v1/backup/*`
- `/v1/admin/*`

Cloudflare D1 can later hold relational app/sync metadata, while R2 can hold backup photos and larger objects. Keep Smart Scan provider logic isolated even if these services share the same Cloudflare account/platform.
