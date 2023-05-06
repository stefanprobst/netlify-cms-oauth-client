import stripIndent from "strip-indent";

import { type createClient } from "./client.js";

type Client = ReturnType<typeof createClient>;

export function createSuccesPage(args: {
	allowedOrigin: Client["allowedOrigin"];
	provider: Client["provider"];
	token: string;
}): string {
	const { allowedOrigin, provider, token } = args;

	const origin = new URL(allowedOrigin).origin;
	const success = JSON.stringify({ token, provider });

	const title = "Signing in to CMS...";
	const message = title;
	const missingParent = "Cannot find parent window which opened this popup.";

	return stripIndent(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${message}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
        }
        html {
          font-family: 'Roboto', ui-sans-serif, system-ui, sans-serif;
        }
        html, body {
          height: 100%;
        }
        main {
          min-height: 100%;
          display: grid;
          place-items: center;
        }
      </style>
    </head>
    <body>
      <main>
        <p id="message">${message}</p>
      </main>
      <script>
        (function () {
          function receiveMessage(event) {
            if (event.data !== 'authorizing:${provider}') return
            if (event.origin !== '${origin}') return

            window.removeEventListener('message', receiveMessage)
            window.opener.postMessage('authorization:${provider}:success:${success}', event.origin)
          }

          if (window.opener) {
            window.addEventListener('message', receiveMessage)
            window.opener.postMessage('authorizing:${provider}', '*')
          } else {
            document.getElementById('message').innerText = '${missingParent}'
          }
        })()
      </script>
    </body>
    </html>
  `);
}

export function createErrorPage(error?: { message: string; url: string }): string {
	const title = "Failed to sign in to CMS";
	let message = title;

	if (error) {
		message =
			title + `. <a href="${error.url}" rel="noreferrer" target="_blank">${error.message}</a>`;
	}

	return stripIndent(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
        }
        html {
          font-family: 'Roboto', ui-sans-serif, system-ui, sans-serif;
        }
        html, body {
          height: 100%;
        }
        main {
          min-height: 100%;
          display: grid;
          place-items: center;
        }
      </style>
    </head>
    <body>
      <main>
        <p id="message">${message}</p>
      </main>
    </body>
    </html>
  `);
}
