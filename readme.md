# `netlify-cms-oauth-client`

## How to install

```bash
npm i @stefanprobst/netlify-cms-oauth-client
```

## How to set up

```ts
import { createHandlers } from "@stefanprobst/netlify-cms-oauth-client";

const handlers = createHandlers();
```

Then, use `handlers.authorize` and `handlers.callback` as request handlers for the
`/api/oauth/authorize` and `/api/oauth/callback` API routes. How exactly to do this will depend on
the framework you are using.

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
