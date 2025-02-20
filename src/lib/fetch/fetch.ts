import { ApiError } from '$lib/generated/types';
import logger from '../ui/logger';
import dompurify from 'dompurify';
import * as marked from 'marked';

const { sanitize } = dompurify;

interface FetchClientOptions extends RequestInit {
	auth?: string;
	noExtraHeaders?: boolean;
	noWait?: boolean;
	onRatelimit?: (n: number, err: ApiError) => void;
}

/**
 * A wrapper around the fetch API for convenience purposes
 */
export class ClientResponse {
	private response: Response;

	constructor(response: Response) {
		this.response = response;
	}

	get status(): number {
		return this.response.status;
	}

	/**
	 * Returns whether or not the request was successful.
	 *
	 * This also handles edge-cases such as HTTP 200 yet being an error
	 */
	get ok(): boolean {
		return this.response.ok;
	}

	/**
	 * Formats a response
	 *
	 * @returns The error message if the request was not successful
	 */
	async error(base?: string, type?: 'markdown' | 'html'): Promise<string> {
		if (this.ok) {
			throw new Error(`Cannot call error() when response.ok is true`);
		}

		if (!type) {
			type = 'html';
		}

		try {
			let json: ApiError = await this.response.json();

			if (type == 'html') {
				let htmlOut = await marked.parse(this.formatApiError(base || '', json));
				let sanitized = sanitize(htmlOut);

				// Ensure that the error message is wrapped in a paragraph
				if (!sanitized.startsWith('<p')) {
					sanitized = `<p class="mb-2">${sanitized}</p>`;
				}

				return sanitized;
			}

			return sanitize(this.formatApiError(base || '', json));
		} catch (err) {
			if (base) {
				return `${base}: ${this.response.statusText} (${err})`;
			}

			return `${this.response.statusText} (${err})`;
		}
	}

	private formatApiError(base: string, err: ApiError) {
		if (err?.context) {
			if (base) {
				return `${base}: ${err.message} [${err.context}]`;
			}
			return `${err.message} [${err.context}]`;
		} else {
			if (base) {
				return `${base}: ${err.message}`;
			}
			return `${err.message}`;
		}
	}

	async json(): Promise<any> {
		if (!this.ok) {
			throw new Error(`Cannot call json() when response.ok is false`);
		}
		return this.response.json();
	}
}

export async function fetchClient(
	url: string,
	options?: FetchClientOptions
): Promise<ClientResponse> {
	let rawOptions = options;

	if (!options) {
		options = {};
	}

	let headers: Record<string, string> = {};

	if (!options?.noExtraHeaders) {
		headers['Content-Type'] = 'application/json';
	}

	if (options.headers) {
		headers = {
			...headers,
			...(options.headers as Record<string, string>)
		};
	}

	let modifier = '';

	if (options.auth) {
		headers['Authorization'] = `User ${options.auth}`;
		modifier += ' (authorized)';
	} else {
		if (headers['Authorization']) {
			throw new Error('options.auth must be used for auth');
		}
	}

	logger.info(
		'FetchClient',
		options.method ? options.method.toUpperCase() + modifier : 'GET' + modifier,
		url
	);

	try {
		const res = await fetch(url, {
			headers: headers,
			...options
		});

		if ([408, 502, 503, 504].includes(res.status)) {
			throw new Error('Server currently undergoing maintenance');
		}

		let retryAfter = res.headers.get('Retry-After');
		if (retryAfter) {
			logger.info('FetchClient', 'Rate limited', res.headers.get('Retry-After'), res.headers);
			let retryAfter = res.headers.get('Retry-After');

			let err: ApiError = await res.json();

			let n = parseFloat(retryAfter || '3') * 1000;

			if (options.onRatelimit) {
				options.onRatelimit(n, err);
			}

			// Wait for the time specified by the server
			if (!options.noWait) {
				logger.info('FetchClient', `Rate limited, waiting ${retryAfter} seconds`);
				await new Promise((resolve) => setTimeout(resolve, n));

				if (options.onRatelimit) {
					options.onRatelimit(0, err);
				}

				return await fetchClient(url, rawOptions);
			}
		}

		return new ClientResponse(res);
	} catch (err) {
		logger.error('FetchClient', 'Error', err);
		throw err;
	}
}
