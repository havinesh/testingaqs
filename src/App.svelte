<svelte:options tag="chat-widget" />

<script>
  export let app_id;
  export let app_secret
  export let customer_id;

  // import './styles/WidgetStyles.css'
  import './styles/WidgetStyles.css'

  import ChatHeader from './components/ChatHeader.svelte';

  import { onMount } from 'svelte';
  import { chatSocket } from "./socket";
  import { writable } from 'svelte/store';
  import CookieMap from './CookieMap.svelte';
  import { DOMAIN } from './config/api-variables';

  import axios from 'axios';
  import Auth from './Auth.svelte';

  import AuthMain from './components/AuthMain.svelte';
  import { getAuthKey, getPersonId, getPersonOrgOfficeId } from './utils/cookie/user';

  import { isAuthenticated, userDetails } from './stores/authStores.js';

  const headers = { 'Authorization': 'Token 828a55aed395aeb1b9092d0a82f7aea31b3241ee713587f22648d025559e7fc3' };

  const CustomAuthHeader = { 'CLIENT_ID': '1', 'CLIENT_SECRET': '1'}

  const config = {
    headers: { 'x-client-id': app_id, 'x-client-secret': app_secret }
  };

  $: console.log($userDetails, 'userDetails')


  // axios.post('https://test.cleandesk.co.in/api/v1/rl/send-otp/',{ app_type: 'CITIZEN', otp_reason: 'LOGIN', mobile: '7555629124', mobile_country_code: '91' })
  // .then(response => {
  //   // Handle the response data
  //   console.log(response.data);
  // })
  // .catch(error => {
  //   // Handle the error
  //   console.error(error);
  // });

//   const loginCred = () => {
//     axios.post('https://test.cleandesk.co.in/api/v1/rl/login/',{
//     mobile: "7555629124",
//     mobile_country_code: "91",
//     app_type: "CITIZEN",
//     mobile_otp: "755562"
// })
//   .then(response => {
//     // Handle the response data
//     console.log(response.data);
//   })
//   .catch(error => {
//     // Handle the error
//     console.error(error);
//   });
//   }

  // axios.post('https://test.cleandesk.co.in/api/v1/user/profile/',{ person_id: null }, { headers })
  // .then(response => {
  //   // Handle the response data
  //   console.log(response.data);
  // })
  // .catch(error => {
  //   // Handle the error
  //   console.error(error);
  // });

  // axios.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token',{ customer_id: customer_id }, config)
  // .then(response => {
  //   // Handle the response data
  //   console.log(response.data);
  // })
  // .catch(error => {
  //   // Handle the error
  //   console.error(error);
  // });

  let isVisible = false;
  let authFormVisible = false;
  let firstOpen = false;
  // const message = writable();
  let messages = []

  let ticketMainId = null;
  let textareaValue = '';

  function signInForm() {
    authFormVisible= true
    console.log('signInForm')
  }

  function showChatWidget() {
    isVisible = !isVisible;
    firstOpen = true;
  }
  if(!!getAuthKey() === false) console.log('null')

  console.log(getPersonId(), 'personId')

  let havinesh;
  // $: {
  //   console.log($isAuthenticated, 'isAuthenticated')
  //   if ($isAuthenticated && firstOpen) {
  //     chatSocket.emit("chat_ai_ticket_message_v2", {
  //     app_type: "CITIZEN",
  //     organisation_office_id: "1673436078069",
  //     constituency_id: 1,
  //     ticket_main_id: null,
  //     person_id: getPersonId(),
  //     content: null,
  //     is_media_available: null,
  //     is_location_available: null,
  //     latitude: null,
  //     longitude: null,
  //     locality: null,
  //     address: null,
  //     category_id: null,
  //     required_inputs: null,
  //     ticket_id: null,
  //   });
  //     console.log('should run this')
  //   } else console.log('should not run this')
  // }

  // const cookieData = document.cookie;
  // console.log(cookieData)

  //  let decodedCookie = decodeURIComponent(document.cookie);
  //   let ca = decodedCookie.split(';');
  //   for(let i = 0; i < ca.length; i++) {
  //       let c = ca[i];
  //       while (c.charAt(0) == ' ') {
  //           c = c.substring(1);
  //           console.log(c, ' c')
  //       }
  //       // if (c.indexOf(cookieName) == 0) {
  //       //     return c.substring(cookieName.length, c.length);
  //       // }
  //   }

  // let cookieValue = '';

  // onMount(() => {
  //   // Retrieve the cookie on component mount


  //   const cookies = document.cookie.split(';');
  //   for (let i = 0; i < cookies.length; i++) {
  //     const cookie = cookies[i].trim();
  //     console.log(cookie, 'cookie')
  //     if (cookie.startsWith('beta_userToken=')) {
  //       cookieValue = cookie.substring('beta_userToken='.length, cookie.length);
  //       console.log(cookieValue, ' cookieValue')
  //       break;
  //     }
  //   }
  // });

  onMount(() => {
    // cookieData = cookies.get('yourCookieName')

    // const session = cookies.get('session');

    // if(getAuthKey !== null) {
    //   isAuthenticated.set(true);
    // }

    if(!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);

    chatSocket.on("connect", () => {
      // console.log(chatSocket.connected);
    });
    // chatSocket.emit("chat_ai_ticket_message_v2", {
    //   app_type: "CITIZEN",
    //   organisation_office_id: "1673436078069",
    //   constituency_id: 1,
    //   ticket_main_id: null,
    //   person_id: getPersonId(),
    //   content: null,
    //   is_media_available: null,
    //   is_location_available: null,
    //   latitude: null,
    //   longitude: null,
    //   locality: null,
    //   address: null,
    //   category_id: null,
    //   required_inputs: null,
    //   ticket_id: null,
    // });
	})

  chatSocket.on('chat_ai_ticket_message_v2', data => {
    if (data.person_id !== parseInt(getPersonId())) {
      console.log('different id')
      messages = [...messages, data]
    } else console.log('same id')
    if (messages.length === 1) {
      ticketMainId = data.ticket_main_id;
    }
    console.log(messages)
  });

  const sendMessage = () => {
    chatSocket.emit("chat_ai_ticket_message_v2", {
      app_type: "CITIZEN",
      organisation_office_id: "1668510062923",
      constituency_id: 1,
      ticket_main_id: ticketMainId,
      person_id: getPersonId(),
      content: textareaValue,
      is_media_available: null,
      is_location_available: null,
      latitude: null,
      longitude: null,
      locality: null,
      address: null,
      category_id: null,
      required_inputs: null,
      ticket_id: null,
    });
    messages = [...messages, { content: textareaValue, person_id: parseInt(getPersonId()) }]
    textareaValue = '';
  };
  console.log(messages)

</script>

{#if isVisible}
  <div id="smith-container">
    <div class="smith-chat-frame">
      <div id="smith-chat-container">
        <div class="smith-chat">
          <div class="smith-chat-header">
            <div class="smith-header-profile">
              <div class="smith-avatar">
                <div class="smith-avatar">
                  <!-- <img src="https://test.cleandesk.co.in/media/person/profile/1668509937389/1685011029653_1819.jpg" alt="avatar"> -->
                </div>
              </div>
              <div class="smith-header-profile-name">Timbl Broadband</div>
              <div class="smith-header-profile-intro">
                <span>Conversational AI provides community service. APP ID {app_id}</span>
              </div>
              <div class="smith-header-profile-cta">
                <!-- <a href="">Sign up</a> -->
                <!-- <button type="link" on:click={signInForm}>Sign in</button>
                {#if authFormVisible === true}
                  <div class="auth-form-container">
                    <input type="text" placeholder="Enter your email or phone" />
                    <input type="password" placeholder="Enter your password" />
                    <button type="button" on:click={loginCred}>Sign in</button>
                  </div>
                {/if} -->
                <!-- <Auth /> -->
              </div>
            </div>
          </div>
          <!-- <ChatHeader /> -->
          <div class="smith-chat-body">
            <div class="smith-conversation-container">
              <div class="smith-conversation-body-parts">
                <div class="smith-conversation-parts-wrapper">
                  {#each messages as message}

                  <div class="smith-conversation-parts">
                    <div
                      class="smith-conversation-part smith-conversation-part-admin"
                    >
                      <div
                        class="smith-comment-container smith-comment-container-admin"
                      >
                        <div class="smith-comment-container-admin-avatar">
                          <div class="smith-avatar">
                            {#if message.person_id !== '1668509937389'}
                            <img
                              src={'https://test.cleandesk.co.in' + message.person_avatar} alt="avatar"
                            />
                            <!-- <img
                              src="https://prod-smith-dynamic.imgix.net/static/logos/smith-footer-logo.png"
                            /> -->
                            <!-- <h3>ai</h3> -->
                            {:else}
                            <img
                              src='https://test.cleandesk.co.in/media/person/profile/1668511823013/1685110291504_7316.jpg'
                            />
                            {/if}
                          </div>
                        </div>
                          <div class="smith-comment">
                            <div class="smith-blocks">
                              <div class="smith-block smith-block-paragraph">
                                {message.content}
                              </div>
                            </div>
                          </div>
                          {#if message.media_type === 'application/pdf'}
                          <div style="cursor: pointer; font-size: 12px;">
                            <a class="smith-block smith-block-paragraph" on:click={() => window.open('https://test.cleandesk.co.in' + message.media_url, '_blank')}>Click here to open pdf</a>
                          </div>
                          {/if}
                      </div>
                    </div>
                  </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="smith-chat-bar">
      <div class="smith-chat-bar-message">
        <textarea bind:value={textareaValue} placeholder="Type your message" rows="1" name="message-to-send" id="message-to-send" />
        <button on:click={sendMessage} type="button" class="btn send-btn"> Send </button>
      </div>
    </div>
  </div>
{/if}

<!-- <div id="launch" class="smith-launcher-frame"> -->
<div class="smith-launcher" />
<button on:click={showChatWidget} class="smith-launcher-frame">click</button>

<button on:click={() => isAuthenticated.set(false)}>set isauth false</button>
<!-- </div> -->

<CookieMap propValue='hi' />
{#if firstOpen === true}
<AuthMain />
{/if}

{#if getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== null}
  <div>authKey = {getAuthKey()}</div>
  <div>personId = {getPersonId()}</div>
  <div>personOrgOfficeId = {getPersonOrgOfficeId()}</div>
{/if}

{#if $isAuthenticated}
  <p>User is authenticated.</p>
{:else}
  <p>User is not authenticated.</p>
{/if}


  <div class="havinesh">
    hi
  </div>

<style>
  body {
    font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  #smith-container {
    width: 0px;
    height: 0px;
    bottom: 0px;
    right: 0px;
    z-index: 999999;
  }

  #smith-chat-container {
    overflow: hidden;
  }

  .smith-chat-frame {
    z-index: 999999 !important;
    position: fixed !important;
    bottom: 20px;
    right: 20px;
    height: calc(100% - 20px - 20px);
    width: 400px !important;
    min-height: 250px !important;
    max-height: 480px !important;
    box-shadow: 0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);
    border-radius: 2px !important;
    overflow: hidden !important;
    opacity: 1 !important;
  }

  .smith-chat-bar {
    z-index: 999999 !important;
    position: fixed !important;
    bottom: calc(20px + 56px + 16px);
    right: 20px;
    height: 60px;
    width: 400px !important;
    box-shadow: 0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);
    border-radius: 2px !important;
    overflow: hidden !important;
    opacity: 1 !important;
    background: #fff;
  }

  #smith-container {
    /*   display: none; */
  }

  #smith-container .smith-chat-frame {
    height: 100%;
    width: 100%;
    height: calc(100% - 20px - 76px - 20px);
    bottom: calc(20px + 56px + 16px + 60px + 8px);
  }

  #smith-container .smith-chat {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
  }

  #smith-container .smith-chat-header {
    background: #fff;
    border-top: 16px solid #1e9fd6;
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    transition: height 0.16s ease-out;
  }

  #smith-container .smith-header-profile {
    box-sizing: border-box;
    text-align: center;
  }

  #smith-container .smith-header-profile-name {
    color: rgba(0, 18, 26, 0.93);
    font-size: 20px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 14px;
  }

  #smith-container .smith-header-profile-intro {
    color: rgba(0, 18, 26, 0.59);
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 4px;
  }

  #smith-container .smith-header-profile-cta a {
    color: #1e9fd6;
    font-size: 14px;
    text-decoration: none;
    opacity: 0.9;
    transition: opacity 0.15s ease-in-out;
  }

  #smith-container .smith-team-profile-full-cta a:hover {
    opacity: 1;
  }

  #smith-container .smith-chat-body {
    position: relative;
    flex: 1;
    background-color: #fff;
  }

  #smith-container .smith-conversation-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  #smith-container .smith-conversation-body-parts {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  #smith-container .smith-conversation-parts {
    padding: 0px 20px;
    display: flex;
    flex-flow: row wrap;
  }

  #smith-container .smith-conversation-parts-wrapper {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    justify-content: space-between;
  }

  #smith-container .smith-comment-container {
    position: relative;
    margin-bottom: 24px;
  }

  #smith-container .smith-comment-container-admin {
    float: left;
    padding-left: 40px;
    width: calc(100% - 48px);
  }

  #smith-container .smith-comment-container-admin-avatar {
    position: absolute;
    left: 0;
    bottom: 2px;
  }

  #smith-container .smith-avatar {
    margin: 0 auto;
    border-radius: 50%;
    display: inline-block;
    vertical-align: middle;
  }

  #smith-container .smith-comment-container-admin-avatar .smith-avatar {
    width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 14px;
  }

  #smith-container .smith-avatar img {
    border-radius: 50%;
  }

  #smith-container .smith-comment-container-admin-avatar .smith-avatar img {
    width: 28px;
    height: 28px;
  }

  #smith-container .smith-comment:not(.smith-comment-with-body) {
    padding: 12px 20px;
    border-radius: 20px;
    position: relative;
    display: inline-block;
    width: auto;
    max-width: 75%;
  }

  #smith-container
    .smith-comment-container-admin
    .smith-comment:not(.smith-comment-with-body) {
    color: rgba(0, 18, 26, 0.93);
    background-color: #edf1f2;
  }

  #smith-container .smith-comment .smith-block-paragraph {
    font-size: 14px;
    line-height: 20px;
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
    background-color: #edf1f2;
    border-color: #edf1f2;
    min-width: 72px;
  }

  .send-btn:hover {
    cursor: pointer;
    color: rgba(0, 18, 26, 0.93);
    background-color: #d4dadd;
    border-color: #d4dadd;
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
    background: #1e9fd6 !important;
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

  .auth-form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  #chat-header-container .chat-header {
    padding: 12px;
    display: flex;
  }
  #chat-header-container .chat-header-avatar img {
    height: 20px;
    width: 20px;
    margin-right: 8px;
  }
</style>
