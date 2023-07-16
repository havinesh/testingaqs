<svelte:options tag="cleandesk-chat-widget" />

<script>
  import { onMount } from "svelte";

  import { getAuthKey, getPersonId, getPersonOrgOfficeId, setAuthKey, setPersonId, setPersonOrgOfficeId } from "./utils/cookie/user";
  import AuthMainFinal from "./components/AuthMainFinal.svelte";
  import Test from "./Test.svelte";
  import { isAuthenticated, userDetails } from "./stores/authStores";
  // import ChatWidget from "./components/ChatWidget/ChatWidget.svelte";
  import ChatListing from "./components/ChatListing/ChatListing.svelte";

  export let app_id = 1;
  export let app_secret = 2;
  export let customer_id = 4;

  // let element = document.querySelector("route-package-tracker");
  // function setShadowStyle(host, styleContent) {
  //   var style = document.createElement("style");
  //   style.innerHTML = styleContent;
  //   host.shadowRoot.appendChild(style);
  // }

  // setShadowStyle(element, "@import './bundle.css'");

  let cssKeep = "";
  let cssJsKeep = "";

  onMount(() => {
    if(!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);
    console.log(app_id, app_secret, customer_id, 'finalapp')
  })
  // console.log(app_id, app_secret, customer_id, 'final app')

  if(!!app_id === true) console.log('hi')


  let isVisible = false;
  let firstOpen = false;

  function showChatWidget() {
    isVisible = !isVisible;
    firstOpen = true;
  }

  // onMount(() => {
  //   if(!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);
  // })

  let isUserAuthenticated = false;

  $: {
    isUserAuthenticated = $isAuthenticated;
    console.log($isAuthenticated, 'isAuthenticated')
  }

  console.log(isUserAuthenticated, 'isUserAuthenticated')
</script>

<!-- *************************************** -->
<!-- <button on:click={showChatWidget} class="cleandesk-launcher-frame">Chat</button> -->




{#if firstOpen === true}
<AuthMainFinal {app_id} {app_secret} {customer_id} />
{/if}

<!-- {#if $isAuthenticated === true}
  <div style="{isVisible ? 'display: block' : 'display: none'}">
    <ChatWidget />
  </div>
{/if} -->

<ChatListing />

<span style="display: none;" class={cssKeep}><span class={cssKeep} /><div></div><div id={cssJsKeep}></div><p></p><ul></ul> <li></li> </span>



<!-- *************************************** -->

<style>
  body :global(body) {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }
  .havinesh{
    color: red;
  }
  .cleandesk-launcher-frame {
    box-shadow: 0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 2px 16px rgba(0, 18, 26, 0.16);
    z-index: 2147482999 !important;
    position: fixed !important;
    bottom: 20px;
    right: 20px;
    height: 56px !important;
    width: 56px !important;
    border-radius: 100px !important;
    overflow: hidden !important;
    background: #0000ff !important;
    color: #fff !important;
    opacity: 0.9;
    transition: box-shadow 0.26s cubic-bezier(0.38, 0, 0.22, 1),
      opacity 0.26s ease-in-out;
  }

  .cleandesk-launcher-frame:hover {
    cursor: pointer;
    box-shadow: 0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 3px 12px rgba(0, 18, 26, 0.16), 0 2px 14px 0 rgba(0, 18, 26, 0.2);
    opacity: 1;
  }

  p {
    font-weight: 400;
    font-family: sans-serif;
  }
  .chat-widget-container {
    /* position: absolute; */
    position: fixed !important;
    bottom: calc(100px);
    z-index: 999999 !important;
    right: 20px;
    width: 400px !important;
    height: 560px !important;
    /* min-height: 300px !important;
    max-height: 520px !important; */
    border-radius: 8px !important;
    box-shadow: 0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);
    overflow: hidden;
    opacity: 1 !important;
  }
  /* #chat-header-container .chat-header {
    padding: 12px;
    display: flex;
    align-items: center;
    background-color: aqua;
  }
  #chat-header-container .chat-header-avatar {
    display: flex;
    align-items: center;
  }
  #chat-header-container .chat-header-avatar img {
    height: 20px;
    border-radius: 50%;
    margin-right: 8px;
  } */
/* copy from app.svelte */

  .smith-chat-bar {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: #f3f2f2;
  }

  .smith-chat-bar-message {
    padding: 12px;
    display: flex;
    align-items: center;
  }

  .smith-chat-bar-message textarea {
    background-color: transparent;
    border-radius: 0;
    border: none;
    font-size: 14px;
    flex: 2;
    line-height: 1.25rem;
    max-height: 100px;
    outline: none;
    overflow-x: hidden;
    resize: none;
    padding: 0;
    margin: 0px 8px;
  }
  .smith-chat-bar-message input {
    background-color: transparent;
    border-radius: 0;
    border: none;
    font-size: 14px;
    flex: 2;
    line-height: 1.25rem;
    max-height: 100px;
    outline: none;
    overflow-x: hidden;
    resize: none;
    padding: 0;
    margin: 0px 8px;
  }
 .btn {
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 14px;
    line-height: 1.5;
    border-radius: 2px;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .send-btn {
    color: rgba(0, 18, 26, 0.59);
    background-color: #fff;
    border-color: #fff;
    /* background-color: #edf1f2;
    border-color: #edf1f2; */
    /* min-width: 72px; */
  }

  .send-btn:hover {
    cursor: pointer;
    color: rgba(0, 18, 26, 0.93);
    background-color: #fff;
    border-color: #fff;
    /* background-color: #d4dadd;
    border-color: #d4dadd; */
  }

  .smith-chat-body {
    position: relative;
    flex: 1;
    background-color: #fff;
    overflow: hidden auto;
    /* height: 100%; */
  }
  .smith-conversation-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .smith-launcher-frame {
    box-shadow: 0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 2px 16px rgba(0, 18, 26, 0.16);
    z-index: 2147482999 !important;
    position: fixed !important;
    bottom: 20px;
    right: 20px;
    height: 56px !important;
    width: 56px !important;
    border-radius: 100px !important;
    overflow: hidden !important;
    background: #0000ff !important;
    color: #fff !important;
    opacity: 0.9;
    transition: box-shadow 0.26s cubic-bezier(0.38, 0, 0.22, 1),
      opacity 0.26s ease-in-out;
  }

  .smith-launcher-frame:hover {
    cursor: pointer;
    box-shadow: 0px 2px 4px rgba(0, 18, 26, 0.08),
      0px 3px 12px rgba(0, 18, 26, 0.16), 0 2px 14px 0 rgba(0, 18, 26, 0.2);
    opacity: 1;
  }

  .header-profile-name {
    font-size: 14px;
    font-weight: 200;
    font-family: sans-serif;
  }

  @keyframes bouncedelay {
  0%,
  80%,
  100% {
    transform: scale(0);
    -webkit-transform: scale(0);
  }
  40% {
    transform: scale(1);
    -webkit-transform: scale(1);
  }
}

@keyframes message-bounce {
  0% {
    transform: scale(0.9);
    -webkit-transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
    -webkit-transform: scale(1.1);
  }
  100% {
    transform: scale(0.9);
    -webkit-transform: scale(0.9);
  }
}

/* @mixin flex($justify, $align) {
  display: flex;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  justify-content: $justify;
  -webkit-justify-content: $justify;
  align-items: $align;
  -webkit-align-items: $align;
} */

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 45px;
  height: 9px;
  margin-left: -22px;
  margin-top: -13px;
  text-align: center;
}

.spinner > div {
  width: 9px;
  height: 9px;
  /* background-color: #dcdcdc; */
  background-color: red;
  border-radius: 100%;
  display: inline-block;
  animation: bouncedelay 1400ms ease-in-out infinite;
  animation-fill-mode: both;
}

.spinner .bounce1 {
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  animation-delay: -0.16s;
}

#container {
  background-color: #2e66bd;
  height: 40px;
  /* position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  justify-content: space-around;
  -webkit-justify-content: space-around;
  align-items: center;
  -webkit-align-items: center; */
}

/* #loading-bubble {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  justify-content: center;
  -webkit-justify-content: center;
  align-items: center;
  -webkit-align-items: center;
  width: auto;
  height: auto;
  min-width: calc(146px * 0.5);
  min-height: calc(80px * 0.5);
  border-radius: calc(10px * 0.5);
  box-sizing: border-box;
  position: relative;
  background-color: #2e66bd;
}

#loading-bubble.grey {
  background-color: #a5b0b5;
}

#loading-bubble.grey:before {
  border-color: transparent #a5b0b5 transparent transparent;
}

#loading-bubble:before {
  display: block;
  content: " ";
  width: 0;
  height: 0;
  border-style: solid;
  border-width: calc(16px * 0.5) calc(16px * 0.5) calc(16px * 0.5) 0;
  border-color: transparent #2e66bd transparent transparent;
  position: absolute;
  left: calc(-14px * 0.5);
  top: calc(26px * 0.5);
} */

.spinner {
  position: static !important;
  margin-top: -11px;
  margin-left: 0px;
}

.spinner div {
  background-color: #E0DEDE;
  /* background-color: #fff; */
}

@-webkit-keyframes message-bounce {
  0% {
    transform: scale(0.9);
    -webkit-transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
    -webkit-transform: scale(1.1);
  }
  100% {
    transform: scale(0.9);
    -webkit-transform: scale(0.9);
  }
}

@keyframes message-bounce {
  0% {
    transform: scale(0.9);
    -webkit-transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
    -webkit-transform: scale(1.1);
  }
  100% {
    transform: scale(0.9);
    -webkit-transform: scale(0.9);
  }
}

  #myInput {
    background-image: url('https://www.w3schools.com/css/searchicon.png');
    background-position: 10px 12px;
    background-repeat: no-repeat;
    width: 216px;
    font-size: 16px;
    padding: 12px 20px 12px 40px;
    border: 1px solid #ddd;
    margin-bottom: 12px;
  }


  ul {
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
      0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    border-radius: 2px;
    width: 100%;
    max-width: 300px;
    max-height: 100%;
		background-color: white;
    overflow-x: scroll;
    list-style: none;
    padding: 0;
  }

  li {
    padding: 15px;
    box-sizing: border-box;
    transition: 0.2s all;
    font-size: 14px;
  }

  li:hover {
    background-color: #eeeeee;
  }
  h5 {
    margin: 12px ;
    /* padding: 12px; */
  }
  p {
    margin: 0 12px 12px 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .list-img {
    margin-left: 12px;
  }

</style>