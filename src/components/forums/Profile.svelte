<script lang="ts">
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import Swal from 'sweetalert2';
	import PostCard from './PostCard.svelte';
	import type { users, posts } from '../../types/forums/types.interface';

	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	export let Profile: users; // Fetched Profile
	export let AuthedUser: users | null; // Authenticated User
	export let UserPosts: posts[] | null;
	export let Token: string | null = null;

	let isFollowing: boolean = true;
	if (Profile && AuthedUser)
		isFollowing = Profile.followers.find((p) => p.userid === AuthedUser?.userid) ? true : false;

	let followingCount: number | null = 0;
	let followerCount: number | null = 0;
	if (Profile) {
		followingCount = Profile.following.length;
		followerCount = Profile.followers.length;
	}

	const Follow = async (UserID: string) => {
		if (Token) {
			await fetch(`${API_URL}/users/follow?target=${UserID}&type=follow`, {
				method: 'PUT',
				headers: {
					Authorization: Token || ''
				}
			})
				.then(async (i) => {
					const Response = await i.json();

					if (Response.success) {
						Swal.fire({
							title: 'Success!',
							html: 'You have successfully followed this user.',
							icon: 'success',
							timer: 2000,
							timerProgressBar: true
						}).then(() => {
							location.reload();
						});

						return true;
					} else {
						Swal.fire({
							title: 'Error!',
							html: Response.error,
							icon: 'error',
							timer: 4000,
							timerProgressBar: true
						});

						return false;
					}
				})
				.catch((err) => {
					Swal.fire({
						title: 'Error!',
						html: err,
						icon: 'error',
						timer: 4000,
						timerProgressBar: true
					});

					return false;
				});
		} else {
			Swal.fire({
				title: 'Error!',
				html: 'You are not logged in.',
				icon: 'error',
				timer: 4000,
				timerProgressBar: true
			});

			return false;
		}
	};

	const Unfollow = async (UserID: string) => {
		if (Token) {
			await fetch(`${API_URL}/users/follow?target=${UserID}&type=unfollow`, {
				method: 'PUT',
				headers: {
					Authorization: Token || ''
				}
			})
				.then(async (i) => {
					const Response = await i.json();

					if (Response.success) {
						Swal.fire({
							title: 'Success!',
							html: 'You have successfully unfollowed this user.',
							icon: 'success',
							timer: 2000,
							timerProgressBar: true
						}).then(() => {
							location.reload();
						});

						return true;
					} else {
						Swal.fire({
							title: 'Error!',
							html: Response.error,
							icon: 'error',
							timer: 4000,
							timerProgressBar: true
						});

						return false;
					}
				})
				.catch((err) => {
					Swal.fire({
						title: 'Error!',
						html: err,
						icon: 'error',
						timer: 4000,
						timerProgressBar: true
					});

					return false;
				});
		} else {
			Swal.fire({
				title: 'Error!',
				html: 'You are not logged in.',
				icon: 'error',
				timer: 4000,
				timerProgressBar: true
			});

			return false;
		}
	};
</script>

{#if Profile}
	<div
		class="block max-w-sm p-4 border rounded-lg shadow bg-surface-800 border-surface-700 hover:bg-surface-700"
	>
		<img
			class="rounded-full"
			src={Profile.avatar}
			height="60px"
			width="60px"
			alt="Profile Avatar"
		/>

		<p class="mt-2 font-bold text-xl text-primary-400">{Profile.name}</p>
		{#if Profile.name != Profile.usertag}
			<p class="mt-0 font-bold text-sm text-primary-500">@{Profile.usertag}</p>
		{/if}

		{#if Profile.bio}
			{#if Profile.bio != 'None'}
				<h5 class="mt-1 font-bold text-md text-primary-400">
					{Profile.bio}
				</h5>
			{/if}
		{/if}

		<p class="mt-3 font-normal text-primary-400">
			<span class="font-bold">{followingCount} following</span> |
			<span class="font-bold">{followerCount} followers</span>
		</p>

		<div class="p-1" />

		<div id="profile_actions">
			{#if AuthedUser}
				{#if Profile.userid === AuthedUser.userid}
					<button
						class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-surface-500 rounded-lg hover:bg-surface-400 focus:ring-2 focus:outline-none focus:ring-surface-300"
						on:click={() => {
							window.location.href = '/forums/profile/edit';
						}}>Edit Profile</button
					>
				{:else if !isFollowing}
					<button
						class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-surface-500 rounded-lg hover:bg-surface-400 focus:ring-2 focus:outline-none focus:ring-surface-300"
						on:click={() => Follow(Profile.userid)}>Follow</button
					>
				{:else}
					<button
						class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-surface-500 rounded-lg hover:bg-surface-400 focus:ring-2 focus:outline-none focus:ring-surface-300"
						on:click={() => Unfollow(Profile.userid)}>Unfollow</button
					>
				{/if}
			{/if}
		</div>
	</div>

	<div class="p-4" />

	{#if !UserPosts}
		<!-- There was an error, or our servers are experiencing issues. -->
	{:else if UserPosts.length === 0 && UserPosts.length === 0}
		<h2 class="text-white font-bold">You don't have any posts yet, create one now!</h2>

		<div class="p-3" />
	{:else}
		<div id="posts" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each UserPosts as item}
				<div class="col-span-1 h-auto p-0 m-0">
					<div class="self-auto h-auto p-0 m-0">
						<PostCard User={Profile} Post={item} {AuthedUser} {Token} Type={'fourms'} />
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/if}
