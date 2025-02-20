import cookie from 'cookie';
import { PUBLIC_ENVIRONMENT } from '$env/static/public';
import type { users, posts } from '../../types/forums/types.interface';

export const load = async ({ request, fetch }: any) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	let posts: posts[];

	posts = await fetch(`${API_URL}/posts/list`).then(async (res: Response) => {
		const status = res.status;

		if (status === 200) {
			const data: posts[] = await res.json();

			if (data) return data;
			else return null;
		} else return null;
	});

	let userData: users | null = null;

	if (cookies.token) {
		userData = await fetch(`${API_URL}/users/@me`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: cookies.token
			}
		}).then(async (res: Response) => {
			const status = res.status;

			if (status === 200) {
				const data: users = await res.json();

				if (data) return data;
				else return null;
			} else return null;
		});
	}

	return {
		user: userData,
		posts: posts,
		token: cookies.token
	};
};
