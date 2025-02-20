<script lang="ts">
	import logger from '$lib/ui/logger';
	import SideButton from '@components/inputs/button/NavButton.svelte';

	let selected = 0;
</script>

<SideButton current={selected == 0} title="Dashboard" onClick={() => (selected = 0)} />
