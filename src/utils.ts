import type { IncomingMessage, ServerResponse } from 'node:http'

export function getRequestUrl(request: IncomingMessage): URL {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return new URL(request.url!, `https://${request.headers.host}`)
}

export function redirect(response: ServerResponse, url: URL): void {
  response.statusCode = 302
  response.setHeader('Location', String(url))
  response.end()
}

function send(response: ServerResponse, body: string, type: string, statusCode = 200): void {
  response.statusCode = statusCode
  response.setHeader('content-type', type)
  response.setHeader('content-length', Buffer.byteLength(body))
  response.end(body)
}

export function html(response: ServerResponse, body: string, statusCode = 200): void {
  return send(response, body, 'text/html; charset=utf-8', statusCode)
}

export function json(response: ServerResponse, body: object, statusCode = 200): void {
  return send(response, JSON.stringify(body), 'application/json; charset=utf-8', statusCode)
}
