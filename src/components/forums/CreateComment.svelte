<script lang="ts">
	import Swal from 'sweetalert2';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import Upload from './Popkat.svelte';

	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	export let PostID: string | null;
	export let Token: string | null;

	let Caption: string = '';
	let ImageURL: any;
	let ImageWidgetOpen: boolean = false;
	let disabled: boolean = false;

	const uploadImage = () => {
		ImageWidgetOpen = true;
	};

	const validateCaption = (caption: string) => {
		if (caption) {
			if (caption != '') {
				if (caption.trim()) return true;
				else return false;
			} else return false;
		} else return false;
	};

	const submitData = () => {
		let data: any = {};

		if (validateCaption(Caption)) data['caption'] = Caption;
		else return Swal.fire('Error', 'A caption is required.', 'error');

		if (ImageURL || ImageURL != '') data['image'] = ImageURL;
		else data['image'] = null;

		fetch(`${API_URL}/posts/comment?id=${PostID}`, {
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
						window.location.reload();
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
	};
</script>

<label for="caption" class="sr-only">Caption (required)</label>
<input
	placeholder="Caption*"
	name="caption"
	class="relative block w-full appearance-none rounded-t-md border border-gray-300 px-3 py-3 bg-surface-800 text-primary-400 font-bold placeholder-primary-400 focus:z-10 focus:border-surface-500 focus:outline-none focus:ring-surface-500 sm:text-sm"
	bind:value={Caption}
/>

<div
	class="flex w-full appearance-none rounded-b-md border border-gray-300 px-3 py-6 bg-surface-800 text-primary-600 font-bold focus:z-10 focus:border-surface-500 focus:outline-none focus:ring-surface-500 sm:text-sm"
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
