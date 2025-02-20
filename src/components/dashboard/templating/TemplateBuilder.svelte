<script lang="ts">
	import CodeMirrorIde from '@components/CodeMirrorIDE.svelte';
	import Label from '@components/inputs/Label.svelte';
	import { StreamLanguage } from '@codemirror/language';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';
	import BoxButton from '@components/inputs/button/BoxButton.svelte';

	export let id: string;
	export let label: string;
	export let output: string = '';
	export let disabled: boolean = false;

	type Snippet = (current: string) => string;

	export const defaultSnippets: Record<string, Snippet> = {
		'Add Pragma': function (current: string): string {
			return `-- @pragma {"lang":"lua","allowed_caps":["discord:create_message"]}\n${current}`;
		}
	};
</script>

<Label {id} {label} />

{#if disabled}
	<input
		type="text"
		{id}
		class="disabled mt-2 overflow-auto flex transition duration-200 bg-surface-600 opacity-75 text-white font-semibold font-monster rounded-lg border border-primary-200 focus:outline-none py-3 px-3 placeholder:text-white cursor-not-allowed"
		disabled={true}
		aria-disabled={true}
		value={output}
	/>
{:else}
	<CodeMirrorIde
		bind:value={output}
		files={[]}
		isFilesEnabled={false}
		extensions={[StreamLanguage.define(lua).extension]}
		theme={oneDark}
		placeholder="Start typing your code here."
	/>

	{#if output?.length > 0}
		<BoxButton onClick={() => (output = '')}>Clear</BoxButton>
	{/if}
{/if}
