<script lang="ts">
	import Swal from 'sweetalert2';
	import Tenor from './Tenor.svelte';
	import Upload from './Popkat.svelte';
	import { PUBLIC_ENVIRONMENT, PUBLIC_WebEmbedAPIKey } from '$env/static/public';

	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	export let Token: string | null;
	export let Type: string = 'general';

	let Caption: string = '';
	let ImageURL: any;
	let Plugins: any = [];
	let ImageWidgetOpen: boolean = false;
	let disabled: boolean = false;
	let TenorButton: Boolean = false;

	const uploadImage = () => {
		ImageWidgetOpen = true;
	};

	const openTenor = () => {
		if (!TenorButton) TenorButton = true;
		else TenorButton = false;
	};

	const gifSelected = (i: any) => {
		Plugins.push({
			type: 'tenor',
			href: i.detail.gif
		});
	};

	const validateCaption = (caption: string) => {
		if (caption) {
			if (caption != '') {
				if (caption.trim()) return true;
				else return false;
			} else return false;
		} else return false;
	};

	const submitData = async () => {
		let data: any = {
			type: Type === 'general' ? 0 : 1
		};

		if (validateCaption(Caption)) {
			let urls = Caption.match(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*|www\.[^\s\/$?#].[^\s]*/gi);

			if (urls) {
				if (urls.length != 1)
					return Swal.fire(
						'Error',
						'Sorry, posts can only contain one link at this time. Please remove any extra links, and try again.',
						'error'
					);
				else {
					if (urls[0].startsWith('www.')) urls[0] = 'https://' + urls[0];

					const embedData = await fetch(
						`https://jsonlink.io/api/extract?url=${encodeURI(
							urls[0]
						)}&api_key=${PUBLIC_WebEmbedAPIKey}`
					).then(async (response) => {
						if (!response.ok)
							return Swal.fire('Error', `${response.status} - ${await response.json()}`, 'error');
						else {
							const data = await response.json();
							if (data.error)
								return Swal.fire(
									'Error',
									`${data.error}\nPlease ensure that the URL that you have provided is correct before trying again.`,
									'error'
								);
							else return data;
						}
					});

					Plugins.push({
						type: 'url',
						href: null,
						jsonData: {
							title: embedData.title,
							description: embedData.description,
							favicon: embedData.favicon,
							image: embedData.images[0],
							sitename: embedData.sitename,
							url: embedData.url
						}
					});
				}
			}

			data['caption'] = Caption;
		} else return Swal.fire('Error', 'A caption is required.', 'error');

		if (ImageURL || ImageURL != '') data['image'] = ImageURL;
		else data['image'] = null;

		if (Plugins || Plugins.length != 0) data['plugins'] = Plugins;
		else data['plugins'] = [];

		setTimeout(() => {
			fetch(`${API_URL}/posts/post`, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
					Authorization: Token || ''
				}
			})
				.then(async (res) => {
					const data: any = await res.json();

					if (data.success) {
						let timerInterval: any;

						return Swal.fire({
							title: 'Success!',
							html: 'You will be refreshed in <b></b> seconds!',
							icon: 'success',
							timer: 2000,
							timerProgressBar: true,
							didOpen: () => {
								Swal.showLoading();
								const b: any = Swal.getHtmlContainer();
								const elem: any = b.querySelector('b');

								timerInterval = setInterval(() => {
									elem.textContent = Math.floor(Number(Swal.getTimerLeft()) / 1000);
								}, 100);
							},
							willClose: () => {
								clearInterval(timerInterval);
							}
						}).then(() => {
							location.reload();
						});
					} else
						return Swal.fire({
							title: 'Error',
							text: data.error,
							icon: 'error',
							timer: 2000,
							timerProgressBar: true
						});
				})
				.catch((error) => {
					return Swal.fire({
						title: 'Error',
						text: error,
						icon: 'error',
						timer: 2000,
						timerProgressBar: true
					});
				});
		}, 1000);
	};
</script>

<label for="caption" class="sr-only">Caption (required)</label>
<input
	placeholder="Caption*"
	name="caption"
	class="relative block w-full appearance-none rounded-t-md border border-gray-300 px-3 py-3 bg-surface-800 text-primary-400 font-bold placeholder-primary-400 focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-surface-500 sm:text-sm"
	bind:value={Caption}
/>

<div
	class="flex w-full appearance-none rounded-b-md border border-gray-300 px-3 py-6 bg-surface-800 text-primary-500 font-bold focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-surface-500 sm:text-sm"
>
	<button type="button" on:click={uploadImage}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 text-primary-400"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
			/>
		</svg>
	</button>

	<Upload
		Logo="/logo.webp"
		AllowedFileTypes={['image/jpg', 'image/jpeg', 'image/png', 'image/svg', 'image/gif']}
		MaxFileSize={60}
		MultipleFilesAllowed={false}
		API_URL="https://popkat.purrquinox.com"
		Open={ImageWidgetOpen}
		on:upload_finished={(d) => {
			if (d) ImageURL = d.detail[0].url;
		}}
		on:error={(err) => {
			Swal.fire('Error', err.toString(), 'error');
		}}
		on:close={() => (ImageWidgetOpen = false)}
	/>

	<div class="pr-2" />

	<button type="button" on:click={openTenor}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 text-primary-400"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
			/>
		</svg>
	</button>

	<div class="pr-2" />

	<button class="absolute right-8" type="button" on:click={submitData} {disabled}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 text-primary-400"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
			/>
		</svg>
	</button>
</div>

{#if TenorButton}
	<Tenor
		on:selected={(e) => {
			gifSelected(e);
		}}
	/>
{/if}
