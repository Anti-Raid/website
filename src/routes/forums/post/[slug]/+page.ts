import { PUBLIC_ENVIRONMENT } from '$env/static/public';
import type { posts } from '../../../../types/forums/types.interface';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	const post: posts | null = await fetch(`${API_URL}/posts/get?post_id=${params.slug}`).then(
		async (res: Response) => {
			const data = await res.json();

			if (data && !data.error) return data;
			else return null;
		}
	);

	return {
		post: post || null
	};
}
