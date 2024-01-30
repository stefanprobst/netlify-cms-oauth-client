import { type IncomingMessage, type ServerResponse } from "node:http";

import { HttpError, isNonEmptyString, request as get } from "@stefanprobst/lib";

import { createClient } from "./client.js";
import { createErrorPage, createSuccesPage } from "./pages.js";
import { getRequestUrl, html, json, redirect } from "./utils.js";


// eslint-disable-next-line @typescript-eslint/require-await
export async function authorize(request: IncomingMessage, response: ServerResponse): Promise<void> {
	const client = createClient();

	const url = getRequestUrl(request);
	const scope = url.searchParams.get("scope");

	const authorizationUrl = client.createAuthorizationUrl(scope);

	return redirect(response, authorizationUrl);
}

export async function callback(request: IncomingMessage, response: ServerResponse): Promise<void> {
	const client = createClient();

	const url = getRequestUrl(request);
	const code = url.searchParams.get("code");

	if (!isNonEmptyString(code)) {
		return json(response, { message: "Invalid authorization code." }, 400);
	}

	const tokenUrl = client.createTokenUrl(code);

	try {
		const data = await get(tokenUrl, { method: "post", responseType: "json" });
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
		const token = client.getAccessToken(data as any);

		if (token.status === "error") {
			return html(response, createErrorPage(token));
		}

		return html(
			response,
			createSuccesPage({
				allowedOrigin: client.allowedOrigin,
				provider: client.provider,
				token: token.token,
			}),
		);
	} catch (error) {
		if (error instanceof HttpError) {
			return json(response, { message: error.message }, error.response.status);
		}

		return json(response, { message: String(error) }, 500);
	}
}
