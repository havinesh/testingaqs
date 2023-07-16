<svelte:options tag="new-chat-widget" />

<script>
  // export let app_id = 'BnQ2qF9E81yy9WZoDdN3HRm3-L4YsGFE9ZrXPZnsufPQo9rNOaVH4iXB0XaQeuaVrIuwexhDbfDn_vwXPXMnpg';
  // export let app_secret = 'Bsf1qIfxvSaPyUDA4TDwEjxqdYMTl7Ql_S8dwmHF7g1ZT0o1Zstgwq3CZLIIXGFxzFcvDBfq3rU8V7YxRZzN43ZzOdBEskfcTCKz8vgDg8wosMPPCmzJ0jNYgs9sc3Uhq5z6kutVI5a_hHzJUKnogSM78tNAldp6fcYk8HXgxDg';
  // export let customer_id = '22004668';
  // export let app_id = 'IOy7oP2xeXarQCl8U_kA6WfjmTIcGkrqaBptZk_L4n4uCrIONXUyajnIfiwJ1Ujyiaw_AGh-Qz7-DYQkuIe7cQ';;
  // export let app_secret = 'X1c5G4VbK-Rc-upH16bgYPFXVAg8kCYtXQy6uoc6kwClikZh-VngbsOpZvzIYGVhCzcIaGFP3UCKCjgJ0XxSKyU-X2FlTQlTSBX00BVnI82qoJjTatRXZLd0SYqn7IdZKJa8rVyGFZ9dIERccs2cZVe_dl4GDsOwEstNW-ZVBRU';
  // export let customer_id = '12345678';
  export let app_id;
  export let app_secret;
  export let customer_id;

  import io from "socket.io-client";
  import axios from "axios";
  import ChatHeader from "./components/ChatHeader.svelte";
  import MessageBox from "./components/MessageBox.svelte";
  import MessageItem from "./components/MessageItem.svelte";
  import AuthMain from './components/AuthMain.svelte';
  // import { chatSocket } from "./utils/socket/socketConfig.js";
  import { getAuthKey, getPersonId, getPersonOrgOfficeId, setAuthKey, setPersonId, setPersonOrgOfficeId } from "./utils/cookie/user";
  import { onMount } from "svelte";
  import { DOMAIN } from "./config/api-variables";
  import { userDetails, isAuthenticated } from "./stores/authStores";
  import { HELPDESK_MODULE_V2 } from "./config/api-variables";

  // TODO set to false
  let isVisible = false;

  let firstOpen = false;
  let messages = [];

  let ticketMainId = null;
  let textareaValue = '';

  let messageLoading = true;

  function showChatWidget() {
    isVisible = !isVisible;
    firstOpen = true;
  }

  onMount(() => {
    if(!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);
  })

  // const socketFunction = () => {
    const chatSocket = io("https://support.foop.com", {
      query: {
        token: getAuthKey(),
      },
    });
    // chatSocket.emit("chat_ai_ticket_message_v2", {
    //   app_type: "CITIZEN",
    //   organisation_office_id: getPersonOrgOfficeId(),
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
    // chatSocket.on('chat_ai_ticket_message_v2', data => {
    //   if (data.person_id !== parseInt(getPersonId())) {
    //     console.log('different id')
    //     messages = [...messages, data]
    //   } else console.log('same id')
    //   if (messages.length === 1) {
    //     ticketMainId = data.ticket_main_id;
    //   }
    //   console.log(messages)
    // });
    // };



  if ($isAuthenticated && firstOpen === true) {
    socketFunction()
  }

  $: {
    if (firstOpen === true) {
      if(!!getAuthKey() === false) {

      const authHeaderConfig = {
        headers: { 'x-client-id': app_id, 'x-client-secret': app_secret }
      };

      axios.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token',{ customer_id: customer_id }, authHeaderConfig)
      .then(response => {
        setAuthKey(response.data.rows.token)
        setPersonId(response.data.rows.person_id)
        setPersonOrgOfficeId(response.data.rows.organisation_office_id)
        if (response.data.statusCode === 'S10001') isAuthenticated.set(true);

        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
    }
    }
  }

  // $: {
  //   if(!!$userDetails === true) {
  //     setTimeout(() => {
  //       console.log('userDetails', $userDetails)
  //       chatSocket.emit("chat_ai_ticket_message_v2", {
  //         app_type: "CITIZEN",
  //         organisation_office_id: getPersonOrgOfficeId(),
  //         constituency_id: 1,
  //         ticket_main_id: null,
  //         person_id: getPersonId(),
  //         content: null,
  //         is_media_available: null,
  //         is_location_available: null,
  //         latitude: null,
  //         longitude: null,
  //         locality: null,
  //         address: null,
  //         category_id: null,
  //         required_inputs: null,
  //         ticket_id: null,
  //       });
  //     }, 2000);
  //   }
  // }

  // $: {
  //   if ($isAuthenticated) {
  //     const headers = { 'Authorization': 'Token ' + getAuthKey() };

  //     axios.post('https://test.cleandesk.co.in/api/v1/user/profile/',{ person_id: null }, { headers })
  //     .then(response => {
  //       // Handle the response data
  //       if (response.data.statusCode === 'S10001') {
  //         chatSocket.on("connect", () => {
  //           console.log(chatSocket.connected);
  //         });
  //         userDetails.set(response?.data?.rows);
  //         chatSocket.emit("chat_ai_ticket_message_v2", {
  //           app_type: "CITIZEN",
  //           organisation_office_id: getPersonOrgOfficeId(),
  //           constituency_id: 1,
  //           ticket_main_id: null,
  //           person_id: getPersonId(),
  //           content: null,
  //           is_media_available: null,
  //           is_location_available: null,
  //           latitude: null,
  //           longitude: null,
  //           locality: null,
  //           address: null,
  //           category_id: null,
  //           required_inputs: null,
  //           ticket_id: null,
  //         });
  //       }
  //     })
  //     .catch(error => {
  //       // Handle the error
  //       console.error(error);
  //     });


  //   }
  // }

  const fetchTicketList = () => {
    const headers = { 'Authorization': 'Token 190ed4a86868b2ae1b72da19d479149615be2dbfff7be0e7fc311f4acb50c5c1' };

    const payload = {
      organisation_office_id: 1668510062923,
      // organisation_office_id: parseInt(getPersonOrgOfficeId()),
      app_type: "CITIZEN",
      is_partner: false,
      list_type : "all",
      page_number : 1,
      page_size : 20,
      is_partner: false,
      status: null,
    }

    // axios.post( HELPDESK_MODULE_V2 + '/ticket/list',{ ...payload }, headers)
    //   .then(response => {
    //     console.log(response.data);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });

      axios.post(HELPDESK_MODULE_V2 + '/ticket/list',{ ...payload }, { headers })
  }

  const sendMessage = () => {
    console.log(textareaValue)
    chatSocket.emit("chat_ai_ticket_message_v2", {
      app_type: "CITIZEN",
      organisation_office_id: getPersonOrgOfficeId(),
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
    messages = [...messages, { content: textareaValue, person_id: parseInt(getPersonId()), title: $userDetails?.first_name + ' ' + $userDetails?.last_name, person_avatar: $userDetails?.profile_image, id: new Date().getTime(), created_at: new Date().getTime()}]
    textareaValue = '';
    messageLoading = true;
    console.log(messages)
  };

  chatSocket.on('chat_ai_ticket_message_v2', data => {
    if (data.person_id !== parseInt(getPersonId())) {
      console.log('different id')
      messageLoading = false;
      messages = [...messages, data]
    } else console.log('same id')
    if (messages.length === 1) {
      ticketMainId = data.ticket_main_id;
    }
    console.log(messages)
  });

  const scrollToBottom = node => {
		const scroll = () => node.scroll({
			top: node.scrollHeight,
			behavior: 'smooth',
		});
		scroll();

		return { update: scroll }
	};


</script>

<style>
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


</style>

{#if isVisible}
  <div class="chat-widget-container">
    <ChatHeader />

    <div use:scrollToBottom={messages} class="smith-chat-body" style="height: 424px; padding-bottom: -25px;">
      <div class="smith-conversation-container">
        {#each messages as message}
          <!-- {#if message.person_id === 1668509937389} -->
          {#if message.person_id !== $userDetails?.id}
          <!-- {#if message.person_id !== $userDetails?.user_id} -->
            <div style="background-color: #f3f2f2; padding: 12px; margin: 10px; width: 280px; border-radius: 8px">
              <!-- <MessageItem /> -->
              <div class="chat-header" style="display: flex; align-items: center;">
                <div class="chat-header-avatar" style="display: flex; align-items: center;">
                  <img src={DOMAIN + message?.person_avatar} alt="a" style="height: 24px; border-radius: 50%; margin-right: 8px;">
                </div>
                <div class="header-profile-name" style="">{message?.title}</div>
                <!-- <p style="font-size: 8px; margin-left: 8px;">time ago</p> -->
              </div>
              <div class="message-item-body" style="padding: 8px;">
                <p style="margin: 0; font-size: 12px">{message?.content}</p>
              </div>
            </div>
          <!-- {/if}
          {#if message.person_id === $userDetails?.user_id} -->
            {:else}

            <!-- my message -->
            <div style="background-color: #e2e7fb; padding: 12px; margin: 10px 10px 10px auto; width: 280px; border-radius: 8px">
              <div class="chat-header" style="display: flex; align-items: center;">
                <div class="chat-header-avatar" style="display: flex; align-items: center;">
                  <img src={DOMAIN + message?.person_avatar} alt="a" style="height: 24px; border-radius: 50%; margin-right: 8px;">
                </div>
                <div class="header-profile-name" style="">{message?.title}</div>
                <!-- <p style="font-size: 8px; margin-left: 8px;">time ago</p> -->
              </div>
              <div class="message-item-body" style="padding: 8px;">
                <p style="margin: 0; font-size: 12px">{message?.content}</p>
              </div>
            </div>
          {/if}
          {#if message.media_type === 'application/pdf'}
            <div style="cursor: pointer; font-size: 12px; justify-content: center; display: flex;">
              <a href={DOMAIN + message.media_url} target="_blank" rel="noopener noreferrer">Click here to open pdf</a>
            </div>
          {/if}
        {/each}

          {#if messageLoading === true}
            <div style="background-color: #f3f2f2; padding: 12px; margin: 10px; width: 50px; border-radius: 8px">
              <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
              </div>
            </div>
            <!-- <div>message loading</div>
            <div id="container">
              <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
              </div>
            </div> -->
          {/if}
      </div>
    </div>
    <!-- <MessageBox /> -->
    <div class="smith-chat-bar">
      <div class="smith-chat-bar-message">
        <!-- <form on:submit|preventDefault={sendMessage}>
          <label for="message">Message:</label>
          <input id="message" bind:value={textareaValue} />
          <button type="submit">Submit</button>
        </form> -->
        <form on:submit|preventDefault={sendMessage} style="display: flex; width:100%;">
        <div style="margin-right: 20px; border-radius: 20px; height: 35px;
        display: flex; background-color: #fff; align-items: center; width: 100%" >
          <button type="button" class="btn send-btn" style="border-radius: 50%;"> 😊 </button>
          <input placeholder="Type your message" rows="1" name="message-to-send" id="message-to-send" bind:value={textareaValue}/>
          <!-- <textarea placeholder="Type your message" rows="1" name="message-to-send" id="message-to-send" bind:value={textareaValue}/> -->
            <button on:click={fetchTicketList} type="button" class="btn send-btn" style="border-radius: 50%;"> + </button>

            </div>
            <button type="sumbit" class="btn send-btn" style="height: 35px; border-radius: 50%">➤</button>
            </form>
      </div>
      <div class="widget-footer" style="background-color: #E0DEDE; height: 20px padding: 10px; display: flex; align-items: center; justify-content: end;">
        <a href="https://cleandesk.co.in" style="text-decoration:none; color: #000; display: flex; align-items: center;">
          <p style="padding: 6px; margin: 0px; font-size: 12px">Powered by CleanDesk Ai</p>
          <img src='https://hsbd.test.cleandesk.co.in/logo96tranparent.png?x=10000000' style="height: 24px; margin-right: 8px" alt='' />
        </a>
      </div>
    </div>

  </div>
{/if}


{#if $isAuthenticated && firstOpen === true}
<AuthMain app_id={app_id} app_secret={app_secret} customer_id={customer_id} />
{/if}


<button on:click={showChatWidget} class="smith-launcher-frame">Chat</button>
