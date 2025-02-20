<script lang="ts">
	import Error from '@components/Message.svelte';
	import Meta from '@components/Meta.svelte';
	import Upload from '@components/forums/Popkat.svelte';
	import Swal from 'sweetalert2';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import type { PageData } from './$types';

	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	export let data: PageData;

	let Usertag: string | undefined = data.user?.usertag;
	let Name: string | undefined = data.user?.name;
	let Bio: string | undefined = data.user?.bio || 'None';
	let Image: any = data.user?.avatar || '/logo.webp';
	let Discord: string | undefined = data.user?.discord_id || undefined;

	let ImageWidgetOpen: boolean = false;

	const uploadImage = () => {
		ImageWidgetOpen = true;
	};

	const undoChanges = () => {
		Usertag = data.user?.usertag;
		Name = data.user?.name;
		Bio = data.user?.bio || 'None';
		Image = data.user?.avatar || '/logo.webp';
		Discord = data.user?.discord_id || undefined;
	};

	const validate = (d: string | undefined) => {
		if (d) {
			if (d != '') {
				if (d.trim()) return true;
				else return false;
			} else return false;
		} else return false;
	};

	const saveChanges = () => {
		let p: any = {};

		if (validate(Usertag)) p['tag'] = Usertag;
		else return Swal.fire('Error', 'A usertag is required.', 'error');

		if (validate(Name)) p['name'] = Name;
		else return Swal.fire('Error', 'A Name is required.', 'error');

		if (validate(Image)) p['avatar'] = Image;
		else return Swal.fire('Error', 'A avatar is required.', 'error');

		if (validate(Image)) p['discord'] = Discord;
		else p['discord'] = Discord;

		if (validate(Bio)) p['bio'] = Bio;
		else p['bio'] = null;

		fetch(`${API_URL}/users/@me`, {
			method: 'PATCH',
			body: JSON.stringify(p),
			headers: {
				'Content-Type': 'application/json',
				Authorization: data.token
			}
		})
			.then(async (res) => {
				const data: any = await res.json();

				if (data.success) {
					let timerInterval: any;

					return Swal.fire({
						title: 'Success!',
						html: 'You will be sent home in <b></b> seconds!',
						icon: 'success',
						timer: 3000,
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
						window.location.href = '/forums/profile';
					});
				} else
					return Swal.fire({
						title: 'Error',
						text: data.message,
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

<Meta title="Edit Profile - AntiRaid Fourms" description="Edit your AntiRaid Forums Profile" />

{#if data.user}
	<div class="space-y-12">
		<div class="border border-white rounded-md p-4">
			<h2 class="text-lg font-bold text-primary-400">Profile</h2>
			<p class="mt-1 text-md font-bold text-primary-200">
				Here, you can customize your AntiRaid Forums profile!
			</p>

			<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
				<div class="sm:col-span-4">
					<label for="Name" class="block text-lg font-medium leading-6 text-primary-400">Name</label
					>
					<div class="mt-2">
						<div
							class="flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md"
						>
							<input
								type="text"
								name="Name"
								id="Name"
								autocomplete="Name"
								class="relative block w-full appearance-none rounded-md text-base font-bold border border-surface-700 px-3 py-2 bg-gray-700 text-white placeholder-primary-400 focus:z-10 focus:border-surface-300 focus:outline-none focus:ring-surface-300"
								placeholder="Name"
								bind:value={Name}
							/>
						</div>
					</div>
				</div>

				<div class="col-span-full">
					<label for="usertag" class="block text-lg font-medium leading-6 text-primary-400"
						>Usertag</label
					>
					<div class="mt-2">
						<input
							type="text"
							id="tag"
							name="usertag"
							class="relative block w-full appearance-none rounded-md text-base font-bold border border-gray-300 px-3 py-2 bg-gray-700 text-white placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
							placeholder="Usertag"
							bind:value={Usertag}
						/>
					</div>

					<p class="mt-2 text-base font-bold leading-6 text-red-600">
						Create an usertag, this will allow vistors to easily identify you. This will also update
						your profile link. (Current profile link: <a
							class="text-red-600 underline"
							href="/@{data.user?.usertag}">/@{data.user?.usertag}</a
						>)
					</p>
				</div>

				<div class="col-span-full">
					<label for="bio" class="block text-lg font-medium leading-6 text-primary-400"
						>Biography</label
					>
					<div class="mt-2">
						<input
							type="text"
							id="about"
							name="about"
							class="relative block w-full appearance-none rounded-md text-base font-bold border border-gray-300 px-3 py-2 bg-gray-700 text-white placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
							placeholder="Bio"
							bind:value={Bio}
						/>
					</div>
					<p class="mt-3 text-base font-bold leading-6 text-primary-200">
						Write a small description about yourself.
					</p>
				</div>

				<div class="col-span-full">
					<label for="discord" class="block text-lg font-medium leading-6 text-primary-400"
						>Discord User ID</label
					>
					<div class="mt-2">
						<input
							type="text"
							id="discord"
							name="discord"
							class="relative block w-full appearance-none rounded-md text-base font-bold border border-gray-300 px-3 py-2 bg-gray-700 text-white placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
							placeholder="Discord User ID"
							bind:value={Discord}
						/>
					</div>
					<p class="mt-3 text-base font-bold leading-6 text-primary-200">
						Enter your Discord User ID, to access your spotlight with our Discord application. If
						someone is asking you to enter something into this field, it is a scam; Purrquinox (or
						AntiRaid) staff will NEVER ask you to enter anything here.
					</p>
				</div>

				<div class="col-span-full">
					<label for="photo" class="block text-lg font-medium leading-6 text-primary-400"
						>Avatar</label
					>
					<div class="mt-2 flex items-center gap-x-3">
						<img class="h-12 w-12 rounded-full" src={Image} alt="Profile Avatar" />
						<button
							type="button"
							class="rounded-md bg-surface-800 px-2.5 py-1.5 text-sm font-semibold text-primary-300 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-surface-700"
							on:click={uploadImage}>Change Avatar</button
						>

						<Upload
							Logo="/logo.webp"
							AllowedFileTypes={['image/jpg', 'image/jpeg', 'image/png', 'image/svg', 'image/gif']}
							MaxFileSize={60}
							MultipleFilesAllowed={false}
							API_URL="https://popkat.purrquinox.com"
							Open={ImageWidgetOpen}
							on:upload_finished={(d) => {
								if (d) Image = d.detail[0].url;
							}}
							on:error={(err) => {
								Swal.fire('Error', err.toString(), 'error');
							}}
							on:close={() => (ImageWidgetOpen = false)}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="mt-6 flex items-center justify-end gap-x-6">
		<button
			type="button"
			class="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
			on:click={undoChanges}>Undo Changes</button
		>
		<button
			type="submit"
			class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			on:click={saveChanges}>Save Changes</button
		>
	</div>
{:else}
	<Error big={true} type={'error'}>In order to access this page, you must login!</Error>
{/if}
