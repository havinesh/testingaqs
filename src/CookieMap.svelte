<!-- CookieMap.svelte -->
<svelte:options tag="cookie-map"/>

<!-- <script>
  import { onMount } from 'svelte';

  let cookies = [];

  let cookieValue = '';

  onMount(() => {
    // Retrieve all cookies on component mount
    const cookiesString = document.cookie;
    const cookiesArray = cookiesString.split(';');

    cookies = cookiesArray.map(cookie => {
      const [name, value] = cookie.split('=');
      return { name: name.trim(), value: value.trim() };
    });
    // for (let i = 0; i < cookiesArray.length; i++) {
    //   const cookie = cookiesArray[i].trim();
    //   if (cookie.startsWith('beta_token=')) {
    //     cookieValue = cookie.substring('beta_token='.length, cookie.length);
    //     break;
    //   }
    // }
  });
</script>

{#each cookies as cookie}
  <div>
    <p>Name: {cookie.name}</p>
    <p>Value: {cookie.value}</p>
  </div>
{/each}

<div>Cookie value = {cookieValue}</div> -->

<!-- <script>
  import { onMount } from 'svelte';
  import getAuthKey from './utils/cookie/user.js';

  console.log('hi')

  console.log(getAuthKey())

  let cookieData = {};

  onMount(() => {
    // Function to parse cookie string into an object
    function parseCookies() {
      const cookies = document.cookie.split(';');
      const cookieObject = {};

      cookies.forEach((cookie) => {
        const [name, value] = cookie.split('=');
        cookieObject[name.trim()] = value.trim();
      });

      return cookieObject;
    }
    cookieData = parseCookies();
  });
</script>

<main>
  <h1>Cookie Data:</h1>
  <ul>
    {#each Object.keys(cookieData) as key}
      <li>{key}: {cookieData[key]}</li>
    {/each}
  </ul>
</main> -->

<!-- <h2>{getAuthKey()}</h2> -->


<script lang="ts">
  export let propValue
  import Cookies from 'js-cookie';
  import { onMount } from 'svelte';
  import { setCookie, getAuthKey } from './utils/cookie/user';
  // import {getCookie} from './utils/cookie/user.js';

  let varhi = 0;
  let allCookies = {};
  onMount(() => {
    Cookies.remove('yourCookieName', {path: '/'});
    const cookies = Cookies.get();

    // Store all the cookies in the globally accessible variable
    // allCookies = { ...cookies };
    // console.log(cookies)
  });

  const setTestCookie = () => {
    Cookies.set('testCookie', 'testValue', { expires: 7, path: '/' });
  };

  const havinesh = () => {
    // Cookies.set('beta_appType', 'CITIZEN', { expires: 7, path: '/' });
    setCookie('userToken','a0ac5ca8e5c705697fa1421a425a0a7f61e29dc24eaa106e787448ac07784261')
  }

  const scooby = () => {
    varhi = Math.random();
  }
  $: {
    console.log(varhi)
  }
</script>

<button on:click={() => console.log(Cookies.get())}>Get all cookies</button>

<button on:click={setTestCookie}>Set test cookies</button>

<button on:click={havinesh}>testing user.js setcookie</button>

<h1>{getAuthKey()}</h1>

<button on:click={scooby}>hiasclkanl</button>

<h1 class="tets">{propValue}</h1>

<style>
  .tets {
    color: red;
  }
</style>