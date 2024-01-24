import assert from "node:assert";

import { isNonEmptyString, isUrl as isAbsoluteUrl } from "@stefanprobst/lib";

type GitHubTokenResponseData =
	| { access_token: string; scope: string; token_type: string }
	| { error: string; error_description: string; error_uri: string };

type AccessToken =
	| { status: "error"; message: string; url: string }
	| { status: "success"; token: string };

const configs = {
	github: {
		baseUrl: "https://github.com",
		authorizationPathname: "/login/oauth/authorize",
		tokenPathname: "/login/oauth/access_token",
		scope: "public_repo",
		getAccessToken(data: GitHubTokenResponseData): AccessToken {
			if ("error" in data) {
				return {
					status: "error",
					message: data.error_description,
					url: String(new URL(data.error_uri, "https://docs.github.com")),
				};
			}

			return { status: "success", token: data.access_token };
		},
	},
};

type OAuthProvider = keyof typeof configs;

function isValidOAuthProvider(value: unknown): value is OAuthProvider {
	return Object.keys(configs).includes(value as OAuthProvider);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createClient() {
	const provider = process.env.OAUTH_PROVIDER;
	assert(isNonEmptyString(provider) && isValidOAuthProvider(provider), "Invalid OAuth provider.");

	const clientId = process.env.OAUTH_CLIENT_ID;
	assert(isNonEmptyString(clientId), "Invalid OAuth client ID.");

	const clientSecret = process.env.OAUTH_CLIENT_SECRET;
	assert(isNonEmptyString(clientSecret), "Invalid OAuth client secret.");

	const redirectUrl = process.env.OAUTH_REDIRECT_URL;
	assert(
		isNonEmptyString(redirectUrl) && isAbsoluteUrl(redirectUrl),
		"Invalid OAuth redirect URL.",
	);

	const allowedOrigin = process.env.OAUTH_ALLOWED_ORIGIN;
	assert(isNonEmptyString(allowedOrigin) && isAbsoluteUrl(allowedOrigin), "Invalid origin.");

	const config = configs[provider];

	function createAuthorizationUrl(_scope?: string | null): URL {
		const scope = _scope ?? config.scope;
		const url = new URL(config.authorizationPathname, config.baseUrl);

		url.searchParams.set("client_id", clientId!);

		url.searchParams.set("redirect_uri", redirectUrl!);
		url.searchParams.set("scope", scope);
		return url;
	}

	function createTokenUrl(authorizationCode: string): URL {
		const url = new URL(config.tokenPathname, config.baseUrl);

		url.searchParams.set("client_id", clientId!);

		url.searchParams.set("client_secret", clientSecret!);
		url.searchParams.set("code", authorizationCode);
		return url;
	}

	return {
		allowedOrigin,
		createAuthorizationUrl,
		createTokenUrl,
		// eslint-disable-next-line @typescript-eslint/unbound-method
		getAccessToken: config.getAccessToken,
		provider,
	};
}
