import { PUBLIC_ENVIRONMENT } from '$env/static/public';
import type { posts, users } from '../../../types/forums/types.interface.js';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	let profilePosts: posts[] | null = null;

	const profile: users | null = await fetch(`${API_URL}/users/get?tag=${params.slug}`).then(
		async (res) => {
			const status = res.status;
			const data = await res.json();

			if (data) {
				if (data.error)
					return {
						error: data.message
					};
				else return data;
			} else
				return {
					error: 'Unable to reach server.'
				};
		}
	);

	if (profile && !profile.error)
		profilePosts = await fetch(`${API_URL}/users/list_posts?tag=${profile.usertag}`).then(
			(res: Response) => {
				const status = res.status;

				if (status === 200) return res.json();
				else return null;
			}
		);
	else profilePosts = null;

	return {
		profile: profile,
		profilePosts: profilePosts
	};
}
