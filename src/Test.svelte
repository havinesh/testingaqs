<svelte:options tag="hi-test" />

<script>
  import { onMount } from "svelte";

  export let havinesh;
  onMount(() => {
    console.log(havinesh, 'hi-test')
  })

</script>

<!-- <h1>hi from {havinesh}</h1> -->