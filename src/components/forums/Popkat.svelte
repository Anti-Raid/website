<script lang="ts">
	// Modules
	import { createEventDispatcher } from 'svelte';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { ProgressBar } from '@skeletonlabs/skeleton';

	// Component Arguments
	export let AllowedFileTypes: string[]; // Array of allowed file types
	export let MaxFileSize: number = 100; // in Megabytes
	export let MultipleFilesAllowed: boolean; // Allow multiple files to be uploaded
	export let API_URL: string; // URL of the Upload API
	export let Logo: string; // Logo URL
	export let Open: Boolean = true;
	export let Uploading: boolean = false;

        let userID: string = "unknown";
        let platform: string = "arforums";

	// File variables to make life easier
	interface FileTypings {
		name: string;
		type: string;
		size: string;
		url: string;
		uploaded: boolean;
	}

	interface EventTypes {
		upload_finished: FileTypings[];
		error: Error;
		close: null;
	}

	let files: FileTypings[] | null = null;
	let fileList: FileList;

	// Event Dispatch
	const dispatch = createEventDispatcher<EventTypes>();

	// Global max file size restriction error
	if (MaxFileSize > 100)
		throw new Error(
			"[Restriction] => The global max file size is 100MB; due to Cloudflare's restrictions. This cannot be bypassed."
		);

	const uploadFiles = async (): Promise<void> => {
		// If no files are selected, do nothing
		if (Array.from(fileList).length === 0) return;

		// Loop through files and upload to S3
		Array.from(fileList).forEach(async (p) => {
			// Start uploading bar
			Uploading = true;

			// Create FormData object
			const formData = new FormData();

			// Append file for FormData object
			formData.append('file', p);

			// Create fetch request
			await fetch(`${API_URL}/upload`, {
				method: 'POST',
				body: formData,
                                headers: {
                                    userID: userID,
                                    platform: platform
				},
			})
				.then(async (e) => {
					const resp = await e.json();
					const index = files?.findIndex((a) => p.name === a.name);

					if (files) {
						files[0].url = `${API_URL}/${resp.key}`;
						files[0].uploaded = true;
						Uploading = false;

						if (index && index != 0) {
							files[index].url = `${API_URL}/${resp.key}`;
							files[index].uploaded = true;
							Uploading = false;
						}

						if (files.every((obj) => obj.uploaded === true)) dispatch('upload_finished', files); // cum
					}
				})
				.catch((err) => {
					Uploading = false;
					dispatch('error', err); // god is dead, and we have killed him.
					throw new Error(err);
				});
		});
	};

	const onChangeHandler = (): void => {
		files = Array.from(fileList).map((file) => ({
			name: file.name,
			type: file.type,
			size: (file.size / (1024 * 1024)).toFixed(2),
			url: '',
			uploaded: false
		}));
	};
</script>

{#if Open}
	<div
		class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0"
	>
		<div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-60" />

		<div
			class="bg-surface-600 w-full lg:h-max lg:w-1/2 mx-auto rounded-lg shadow-2xl z-50 overflow-y-auto"
		>
			<div
				class="flex justify-between items-center head bg-surface-800 text-primary-300 py-5 px-8 text-2xl font-extrabold"
			>
				<div class="flex">
					<img class="h-10 rounded-full" src={Logo} alt="AntiRaid Forums" />
					<h2 class="ml-2 mt-1">Upload Files</h2>
				</div>

				<button
					class="p-2 bg-surface-500 hover:bg-surface-600 text-white rounded-full ml-4"
					on:click={() => dispatch('close')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="24px"
						viewBox="0 0 24 24"
						width="24px"
						fill="currentColor"
						class="text-primary-400"
						><path d="M0 0h24v24H0V0z" fill="none" /><path
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
						/></svg
					>
				</button>
			</div>

			<div class="content p-4">
				<FileDropzone
					name="files"
					multiple={MultipleFilesAllowed}
					accept={AllowedFileTypes.join(',')}
					disabled={Uploading}
					class="bg-surface-800 text-primary-400"
					bind:files={fileList}
					on:change={onChangeHandler}
				>
					<svelte:fragment slot="lead"
						><i class="fa-solid fa-file-arrow-up text-4xl" /></svelte:fragment
					>
					<svelte:fragment slot="message"><b>Upload a File</b> or drag and drop!</svelte:fragment>
					<svelte:fragment slot="meta"
						><b>{AllowedFileTypes.map((p) => p.split('/')[1]).join(' | ')} ({MaxFileSize}MB MAX)</b
						></svelte:fragment
					>
				</FileDropzone>

				{#if files}
					<div class="mt-3 grid grid-cols-2 gap-2 {Uploading ? 'opacity-50 cursor-wait' : ''}">
						{#each files as fileData}
							<div class="inline-grid bg-surface-800 rounded-md shadow-md p-3">
								<h1 class="text-primary-400 font-semibold text-sm text-clip overflow-none">
									{fileData.name.split('.')[0]}
								</h1>
								<h2 class="text-primary-300 font-semibold text-xs text-clip overflow-none">
									{fileData.type.split('/')[1].toUpperCase()}
								</h2>
								<p class="text-primary-200 font-semibold text-xs text-clip overflow-none">
									{fileData.size}MB
								</p>

								<p
									class="{fileData.uploaded
										? 'text-green-600'
										: 'text-red-600'} font-semibold text-xs text-clip overflow-none"
								>
									{fileData.uploaded ? 'Uploaded!' : 'Not uploaded, yet.'}
								</p>
							</div>
						{/each}
					</div>
				{/if}

				<div class="flex justify-end">
					{#if files && files.every((p) => p.uploaded === true)}
						<button
							class="mt-3 flex items-center justify-center rounded-full border border-transparent bg-surface-800 px-4 py-3 text-base font-medium text-primary-400 hover:bg-surface-700 disabled:opacity-50 hover:disabled:bg-surface-800 disabled:cursor-wait md:py-4 md:px-10 md:text-lg"
							on:click={() => {
								dispatch('close');
							}}>Finish <i class="ml-2 fa-solid fa-check" /></button
						>
					{:else}
						<button
							class="mt-3 flex items-center justify-center rounded-full border border-transparent bg-surface-800 px-4 py-3 text-base font-medium text-primary-400 hover:bg-surface-700 disabled:opacity-50 hover:disabled:bg-surface-800 disabled:cursor-wait md:py-4 md:px-10 md:text-lg"
							on:click={uploadFiles}
							disabled={Uploading}>Upload <i class="ml-2 fa fa-arrow-right" /></button
						>
					{/if}
				</div>
			</div>

			{#if Uploading}
				<ProgressBar value={undefined} meter="bg-primary-600" track="bg-surface-600" />
			{/if}
		</div>
	</div>
{/if}
