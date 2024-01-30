# `netlify-cms-oauth-client`

## How to install

```bash
npm i @stefanprobst/netlify-cms-oauth-client
```

## How to set up

Use the exported `authorize` and `callback` functions as request handlers for the
`/api/oauth/authorize` and `/api/oauth/callback` API routes. How exactly to do this will depend on
the framework you are using.

### Example: Nuxt 3

```ts
// server/api/authorize.get.ts
import { authorize } from "@stefanprobst/netlify-cms-oauth-client";

export default defineEventHandler(async (event) => {
	return authorize(event.node.req, event.node.res);
});

// server/api/callback.get.ts
import { callback } from "@stefanprobst/netlify-cms-oauth-client";

export default defineEventHandler(async (event) => {
	return callback(event.node.req, event.node.res);
});
```

## How to configure

The following example assumes a website deployed at `https://example.com`, with the API routes for
the OAuth flow at `/api/oauth/authorize` and `/api/oauth/callback`.

(i) Create a new OAuth app on [GitHub](https://github.com/settings/applications/new) to get a
"Client ID" and "Client secret". Set the "Authorization callback URL" to
`https://example.com/api/oauth/callback`.

(ii) Add configuration to NetlifyCMS, and set environment variables.

```yaml config.yaml
backend:
  name: github
  repo: owner/repo
  branch: main
  base_url: https://example.com
  auth_endpoint: /api/oauth/authorize
```

```text .env
OAUTH_PROVIDER=github
# GitHub OAuth app client id.
OAUTH_CLIENT_ID=
# GitHub OAuth app client secret.
OAUTH_CLIENT_SECRET=
# GitHub OAuth app callback URL.
OAUTH_REDIRECT_URL=https://example.com/api/oauth/callback
# Deployed website's base URL.
OAUTH_ALLOWED_ORIGIN=https://example.com
```

Note: you can add environment variables to your Vercel deployment via CLI:

```bash
vercel env add OAUTH_PROVIDER github
```
