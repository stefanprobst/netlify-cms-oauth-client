import '@stefanprobst/request/fetch'

import { isNonEmptyString } from '@stefanprobst/is-nonempty-string'
import { HttpError, request as get } from '@stefanprobst/request'
import type { VercelRequest, VercelResponse } from '@vercel/node'

import { createClient } from './client.js'
import { createErrorPage, createSuccesPage } from './pages.js'

const client = createClient()

export async function authorize(
  request: VercelRequest,
  response: VercelResponse,
): Promise<unknown> {
  const { scope } = request.query

  if (Array.isArray(scope)) {
    return response.status(400).json({ message: 'Invalid OAuth scope.' })
  }

  const authorizationUrl = client.createAuthorizationUrl(scope)

  return response.redirect(String(authorizationUrl))
}

export async function callback(request: VercelRequest, response: VercelResponse): Promise<unknown> {
  const { code } = request.query

  if (!isNonEmptyString(code)) {
    return response.status(400).json({ message: 'Invalid authorization code.' })
  }

  const tokenUrl = client.createTokenUrl(code)

  try {
    const data = await get(tokenUrl, { method: 'post', responseType: 'json' })
    const token = client.getAccessToken(data)

    if (token.status === 'error') {
      const html = createErrorPage(token)

      return response.setHeader('content-type', 'text/html').send(html)
    }

    const html = createSuccesPage({
      allowedOrigin: client.allowedOrigin,
      provider: client.provider,
      token: token.token,
    })

    return response.setHeader('content-type', 'text/html').send(html)
  } catch (error) {
    if (error instanceof HttpError) {
      return response.status(error.response.status).json({ message: error.message })
    }

    return response.status(500).json({ message: String(error) })
  }
}
