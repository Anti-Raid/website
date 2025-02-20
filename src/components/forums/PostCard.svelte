<script lang="ts">
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import Swal from 'sweetalert2';
	import 'animate.css';
	import type { users, posts } from '../../types/forums/types.interface';
	import { onMount } from 'svelte';
	import Popup from './Popup.svelte';

	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	export let User: users;
	export let Post: posts;
	export let AuthedUser: users | null = null;
	export let Token: string | null = null;
	export let Type: string = 'general';

	let CommentsCount: number = Post.comments.length;
	let SharingCompatible: boolean = false;
	let deletingPost: boolean = false;

	const ImageLoadError = (err: any) => {
		err.target.src = '/logo.webp';
	};

	const animateCSS = (element: any, animation: any, prefix: string = 'animate__') =>
		// We create a Promise and return it
		new Promise((resolve, reject) => {
			const animationName = `${prefix}${animation}`;
			const node = element;

			node.classList.add(`${prefix}animated`, animationName);

			// When the animation ends, we clean the classes and resolve the Promise
			function handleAnimationEnd(event: any) {
				event.stopPropagation();
				node.classList.remove(`${prefix}animated`, animationName);
				resolve('Animation ended');
			}

			node.addEventListener('animationend', handleAnimationEnd, { once: true });
		});

	let hasUpvoted = false;
	let hasDownvoted = false;
	if (AuthedUser)
		hasUpvoted = Post.upvotes.find((p) => p.userid === AuthedUser?.userid) ? true : false;
	if (AuthedUser)
		hasDownvoted = Post.downvotes.find((p) => p.userid === AuthedUser?.userid) ? true : false;

	let UpvoteCount: number = Post.upvotes.length;
	let DownvoteCount: number = Post.downvotes.length;

	const Upvote = async (PostID: string, Element: any) => {
		if (AuthedUser) {
			await fetch(`${API_URL}/posts/vote?PostID=${PostID}&type=up`, {
				method: 'PUT',
				headers: {
					Authorization: Token || ''
				}
			}).then(async (i) => {
				const Response = await i.json();

				if (Response.success) {
					hasUpvoted = true;
					animateCSS(Element, 'bounce');
					UpvoteCount++;
				} else {
					return Swal.fire({
						title: 'Error!',
						html: Response.error,
						icon: 'error',
						timer: 4000,
						timerProgressBar: true
					});
				}
			});
		} else {
			return Swal.fire({
				title: 'Error!',
				html: 'You are not logged in.',
				icon: 'error',
				timer: 4000,
				timerProgressBar: true
			});
		}
	};

	const Downvote = async (PostID: string, Element: any) => {
		if (AuthedUser) {
			await fetch(`${API_URL}/posts/vote?PostID=${PostID}&type=down`, {
				method: 'PUT',
				headers: {
					Authorization: Token || ''
				}
			}).then(async (i) => {
				const Response = await i.json();

				if (Response.success) {
					hasDownvoted = true;
					animateCSS(Element, 'bounce');
					DownvoteCount++;
				} else {
					return Swal.fire({
						title: 'Error!',
						html: Response.error,
						icon: 'error',
						timer: 4000,
						timerProgressBar: true
					});
				}
			});
		} else {
			return Swal.fire({
				title: 'Error!',
				html: 'You are not logged in.',
				icon: 'error',
				timer: 4000,
				timerProgressBar: true
			});
		}
	};

	const DeletePost = async (PostID: string) => {
		if (AuthedUser) {
			await fetch(`${API_URL}/posts/delete`, {
				method: 'DELETE',
				body: JSON.stringify({
					post_id: PostID
				}),
				headers: {
					'Content-Type': 'application/json',
					Authorization: Token || ''
				}
			}).then(async (i) => {
				const Response = await i.json();

				if (Response.success) window.location.reload();
				else {
					return Swal.fire({
						title: 'Error!',
						html: Response.error,
						icon: 'error',
						timer: 4000,
						timerProgressBar: true
					});
				}
			});
		} else {
			return Swal.fire({
				title: 'Error!',
				html: 'You are not logged in.',
				icon: 'error',
				timer: 4000,
				timerProgressBar: true
			});
		}
	};

	onMount(() => {
		SharingCompatible = navigator.share !== undefined;
	});

	const SharePost = (PostID: string): any => {
		if (SharingCompatible)
			navigator.share({
				title: `@${User.usertag}'s post on AntiRaid Forums`,
				text: Post.caption,
				url: `${window.location.origin}/forums/post/${PostID}`
			});
		else
			return Swal.fire({
				title: 'Error!',
				html: 'Your browser does not support sharing.',
				icon: 'error',
				timer: 4000,
				timerProgressBar: true
			});
	};

	const Comments = () => {
		window.location.href = `${window.location.origin}/forums/post/${Post.postid}#comments`;
	};
</script>

<div
	class="block h-auto max-w-sm p-2 border rounded-t-lg shadow bg-surface-800 border-surface-700 hover:bg-surface-700"
>
	<a href="/forums/@{User.usertag}">
		<h2 class="flex">
			<img
				class="h-8 rounded-full"
				src={User.avatar}
				height="30px"
				width="30px"
				alt="{User.name}'s Avatar"
				on:error={ImageLoadError}
			/>
			<p class="ml-2 mt-1 mb-1 font-bold text-primary-400">
				{#if User.name != User.usertag}{User.name}{:else}{User.usertag}{/if}
				<span class="text-primary-400/75"
					>{User.usertag != User.name ? `(@${User.usertag})` : ''}</span
				>
			</p>
		</h2>
	</a>
</div>

<div
	class="block h-auto max-w-sm p-3 border rounded-b-lg shadow bg-surface-800 border-surface-700 hover:bg-surface-700"
>
	<a href="/forums/post/{Post.postid}">
		<h5 class="mb-2 text-base font-bold overflow-x-auto tracking-tight text-primary-400">
			{Post.caption}
		</h5>

		{#if Post.image}
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<img
				src={Post.image}
				alt="Post Card"
				class="max-h-[160px] w-full rounded-md"
				height="120px"
				loading="lazy"
				tabIndex={0}
				on:keypress={(event) => {
					event.preventDefault();
					window.location.href = String(Post.image);
				}}
				on:click={(event) => {
					event.preventDefault();
					window.location.href = String(Post.image);
				}}
				on:error={ImageLoadError}
			/>
		{/if}

		{#if Post.plugins.length != 0}
			{#each Post.plugins as item}
				{#if item.type === 'tenor'}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<img
						src={item.href}
						alt="Tenor"
						class="object-cover w-full max-h-[160px] rounded-md"
						height="120px"
						loading="lazy"
						tabIndex={0}
						on:keypress={(event) => {
							event.preventDefault();
							window.location.href = item.href || '';
						}}
						on:click={(event) => {
							event.preventDefault();
							window.location.href = item.href || '';
						}}
						on:error={ImageLoadError}
					/>
				{/if}

				{#if item.type === 'url'}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="block max-w-sm p-2 border cursor-pointer rounded-md shadow bg-surface-600 border-surface-400 hover:bg-surface-800"
						tabIndex={0}
						on:keypress={(event) => {
							event.preventDefault();
							window.location.href = item.jsonData.url;
						}}
						on:click={(event) => {
							event.preventDefault();
							window.location.href = item.jsonData.url;
						}}
					>
						<h2 class="flex">
							<img
								class="h-5 rounded-full"
								src={item.jsonData.favicon}
								height="20px"
								width="20px"
								alt={item.jsonData.sitename}
								on:error={ImageLoadError}
							/>
							<p class="ml-2 font-extrabold text-sm text-primary-400 hover:underline">
								{item.jsonData.sitename}
							</p>
						</h2>

						<div class="mt-3">
							<h2 class="text-primary-500 text-md font-semibold hover:underline">
								{item.jsonData.title}
							</h2>
							<p class="text-primary-300 text-sm font-semibold">{item.jsonData.description}</p>

							{#if item.jsonData.image}
								<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
								<img
									src={item.jsonData.image}
									alt={item.jsonData.title}
									class="object-cover mt-2 w-full max-h-[120px] rounded-md"
									height="110px"
									loading="lazy"
									tabIndex={0}
									on:keypress={(event) => {
										event.preventDefault();
										window.location.href = item.jsonData.image;
									}}
									on:click={(event) => {
										event.preventDefault();
										window.location.href = item.jsonData.image;
									}}
									on:error={ImageLoadError}
								/>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</a>

	<div class="flex font-normal mt-3">
		<button
			class="flex {hasUpvoted ? 'text-green-400' : 'text-gray-400'}"
			on:click={(event) => {
				Upvote(Post.postid, event.target);
			}}
		>
			<i class="fa-solid fa-angles-up mt-1 mr-1" /> <b>{UpvoteCount}</b>
		</button>

		<button
			class="flex pl-7 {hasDownvoted ? 'text-red-400' : 'text-gray-400'}"
			on:click={(event) => {
				Downvote(Post.postid, event.target);
			}}
		>
			<i class="fa-solid fa-angles-down mt-1 mr-1" /> <b>{DownvoteCount}</b>
		</button>

		<button class="flex pl-7 text-gray-400" on:click={Comments}>
			<i class="fa-solid fa-comment mt-1 mr-1" /> <b>{CommentsCount}</b>
		</button>

		{#if SharingCompatible}
			<button class="flex pl-7 text-green-400" on:click={SharePost(Post.postid)}>
				<i class="fa-solid fa-share mt-1" />
			</button>
		{/if}

		{#if AuthedUser}
			{#if AuthedUser.userid === User.userid}
				<button class="flex pl-5 text-red-400" on:click={() => (deletingPost = true)}>
					<i class="fa-solid fa-trash-alt mt-1" />
				</button>
			{/if}
		{/if}
	</div>
</div>

{#if deletingPost}
	<Popup
		Title="Delete Post"
		Description="Are you sure you want to delete this post? This action is NOT reversible."
		MainButton={{
			Name: 'Delete',
			Function: () => DeletePost(Post.postid)
		}}
		SecondaryButton={{
			Name: 'Cancel',
			Function: () => (deletingPost = false)
		}}
	/>
{/if}
