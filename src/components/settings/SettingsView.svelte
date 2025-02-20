<script lang="ts">
	import { CanonicalConfigOption } from '$lib/generated/types';
	import { Goto } from './Setting.svelte';
	import { SettingsExecuteResponse, UserGuildBaseData } from '$lib/generated/types';
	import SettingsCreateRow from './SettingsCreateRow.svelte';
	import SettingsRow from './SettingsRow.svelte';

	export let configOpt: CanonicalConfigOption;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let settings: SettingsExecuteResponse;
	export let goto: Goto;
	export let prevPageAvailable: boolean;
	export let nextPageAvailable: boolean;
	export let atMaximum: boolean;
</script>

<div class="setting" id={configOpt.id}>
	{#if configOpt?.operations.includes('Create') && !atMaximum}
		<SettingsCreateRow bind:settings {configOpt} {guildData} {guildId} />
	{/if}

	{#each settings?.fields || [] as columnField, i}
		<SettingsRow
			columnField={structuredClone(columnField)}
			index={i}
			{guildData}
			{guildId}
			{configOpt}
			bind:settings
		/>
	{/each}
</div>

{#if prevPageAvailable || nextPageAvailable}
	<div class="grid-cols-2 grid">
		<div
			class="col-span-1 border border-surface-400 p-2 bg-surface-500 hover:bg-surface-500/75 rounded-bl-lg"
		>
			<button
				disabled={!prevPageAvailable}
				aria-disabled={!prevPageAvailable}
				class={prevPageAvailable
					? 'block w-full text-left font-semibold'
					: 'block w-full text-left font-cabin font-extrabold uppercase cursor-not-allowed'}
				on:click|preventDefault={() => {
					if (!prevPageAvailable) return;
					goto = Goto.Previous;
				}}>Back</button
			>
		</div>

		<div
			class="col-span-1 border border-surface-400 p-2 bg-surface-500 hover:bg-surface-500/75 rounded-br-lg"
		>
			<button
				disabled={!nextPageAvailable}
				aria-disabled={!nextPageAvailable}
				class={nextPageAvailable
					? 'block w-full text-left font-semibold'
					: 'block w-full text-left font-cabin font-extrabold uppercase cursor-not-allowed'}
				on:click|preventDefault={() => {
					if (!nextPageAvailable) return;
					goto = Goto.Next;
				}}>Next</button
			>
		</div>
	</div>
{/if}
