import { isAbsoluteUrl } from '@stefanprobst/is-absolute-url'
import { isNonEmptyString } from '@stefanprobst/is-nonempty-string'
import assert from 'node:assert'

type GitHubTokenResponseData =
  | { access_token: string; scope: string; token_type: string }
  | { error: string; error_description: string; error_uri: string }

type AccessToken =
  | { status: 'success'; token: string }
  | { status: 'error'; message: string; url: string }

const configs = {
  github: {
    baseUrl: 'https://github.com',
    authorizationPathname: '/login/oauth/authorize',
    tokenPathname: '/login/oauth/access_token',
    scope: 'public_repo',
    getAccessToken(data: GitHubTokenResponseData): AccessToken {
      if ('error' in data) {
        return {
          status: 'error',
          message: data.error_description,
          url: String(new URL(data.error_uri, 'https://docs.github.com')),
        }
      }

      return { status: 'success', token: data.access_token }
    },
  },
}

type OAuthProvider = keyof typeof configs

function isValidOAuthProvider(value: unknown): value is OAuthProvider {
  return Object.keys(configs).includes(value as OAuthProvider)
}

export function createClient() {
  const provider = process.env['OAUTH_PROVIDER']
  assert(isNonEmptyString(provider) && isValidOAuthProvider(provider), 'Invalid OAuth provider.')

  const clientId = process.env['OAUTH_CLIENT_ID']
  assert(isNonEmptyString(clientId), 'Invalid OAuth client ID.')

  const clientSecret = process.env['OAUTH_CLIENT_SECRET']
  assert(isNonEmptyString(clientSecret), 'Invalid OAuth client secret.')

  const redirectUrl = process.env['OAUTH_REDIRECT_URL']
  assert(isNonEmptyString(redirectUrl) && isAbsoluteUrl(redirectUrl), 'Invalid OAuth redirect URL.')

  const allowedOrigin = process.env['OAUTH_ALLOWED_ORIGIN']
  assert(isNonEmptyString(allowedOrigin) && isAbsoluteUrl(allowedOrigin), 'Invalid origin.')

  const config = configs[provider]

  function createAuthorizationUrl(_scope?: string | null): URL {
    const scope = _scope ?? config.scope
    const url = new URL(config.authorizationPathname, config.baseUrl)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url.searchParams.set('client_id', clientId!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url.searchParams.set('redirect_uri', redirectUrl!)
    url.searchParams.set('scope', scope)
    return url
  }

  function createTokenUrl(authorizationCode: string): URL {
    const url = new URL(config.tokenPathname, config.baseUrl)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url.searchParams.set('client_id', clientId!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url.searchParams.set('client_secret', clientSecret!)
    url.searchParams.set('code', authorizationCode)
    return url
  }

  return {
    allowedOrigin,
    createAuthorizationUrl,
    createTokenUrl,
    getAccessToken: config.getAccessToken,
    provider,
  }
}
