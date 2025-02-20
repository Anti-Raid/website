<script lang="ts">
	import Meta from '@components/Meta.svelte';
	import Error from '@components/Message.svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import Profile from '@components/forums/Profile.svelte';
	import type { posts } from '@types/forums/types.interface';
	import type { PageData } from './$types';

	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	let userPosts: posts[] | null;

	export let data: PageData;

	onMount(async () => {
		if (data.user) {
			userPosts = await fetch(`${API_URL}/users/list_posts?tag=${data.user.usertag}`).then(
				async (res) => {
					const status = res.status;

					if (status === 200) {
						const data: any = await res.json();

						if (data.error) return null;
						else return data;
					} else return null;
				}
			);
		}
	});
</script>

{#if data.user}
	<Meta
		title="@{data.user.usertag} - AntiRaid Forums"
		description="View your AntiRaid Forums Profile!"
	/>
	<Profile Profile={data.user} AuthedUser={data.user} UserPosts={userPosts} Token={data.token} />
{:else}
	<Error big={true} type={'error'}>In order to view this page, you have to login!</Error>
{/if}
