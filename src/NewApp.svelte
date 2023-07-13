<svelte:options tag="new-chat-widget" />

<script>
  // export let app_id = 'IOy7oP2xeXarQCl8U_kA6WfjmTIcGkrqaBptZk_L4n4uCrIONXUyajnIfiwJ1Ujyiaw_AGh-Qz7-DYQkuIe7cQ';;
  // export let app_secret = 'X1c5G4VbK-Rc-upH16bgYPFXVAg8kCYtXQy6uoc6kwClikZh-VngbsOpZvzIYGVhCzcIaGFP3UCKCjgJ0XxSKyU-X2FlTQlTSBX00BVnI82qoJjTatRXZLd0SYqn7IdZKJa8rVyGFZ9dIERccs2cZVe_dl4GDsOwEstNW-ZVBRU';
  // export let customer_id = '12345678';
  export let app_id;
  export let app_secret;
  export let customer_id;

  import axios from "axios";
  import ChatHeader from "./components/ChatHeader.svelte";
  import MessageBox from "./components/MessageBox.svelte";
  import MessageItem from "./components/MessageItem.svelte";
  import AuthMain from './components/AuthMain.svelte';
  import { chatSocket } from "./socket";
  import { getAuthKey, getPersonId, getPersonOrgOfficeId, setAuthKey, setPersonId, setPersonOrgOfficeId } from "./utils/cookie/user";
  import { onMount } from "svelte";
  import { DOMAIN } from "./config/api-variables";
  import { userDetails, isAuthenticated } from "./stores/authStores";

  import Child from './Child.svelte'
  let message = 'Hello from parent!';

  let isVisible = false;

  let firstOpen = false;
  let messages = [];

  console.log(app_id, 'app_id')
  // let app_id = 'IOy7oP2xeXarQCl8U_kA6WfjmTIcGkrqaBptZk_L4n4uCrIONXUyajnIfiwJ1Ujyiaw_AGh-Qz7-DYQkuIe7cQ';
  // let app_secret = 'X1c5G4VbK-Rc-upH16bgYPFXVAg8kCYtXQy6uoc6kwClikZh-VngbsOpZvzIYGVhCzcIaGFP3UCKCjgJ0XxSKyU-X2FlTQlTSBX00BVnI82qoJjTatRXZLd0SYqn7IdZKJa8rVyGFZ9dIERccs2cZVe_dl4GDsOwEstNW-ZVBRU';
  // let customer_id = '12345678';
// [
//     {
//         "id": 1688673476816,
//         "ticket_main_id": 1688673476720,
//         "person_id": 1668509937389,
//         "content_type": "text",
//         "content": "Hey Sanjeev Dutt, we hope you're doing well. We appreciate your decision to contact Timbl Broadband. It appears that you've encountered an issue that requires our attention. Could you please share the issue in as much detail as possible?",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1688673476719,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "title": "Ankush Guglani",
//         "person_avatar": "/media/person/profile/1668509937389/1685011029653_1819.jpg",
//         "applicable_to": "citizen"
//     },
//     {
//         "content": "im missing my invoice of may",
//         "person_id": "1673244394359"
//     },
//     {
//         "id": 1688673612220,
//         "person_id": 1668509937389,
//         "content_type": "text",
//         "content": "Invoice is generated successfully.",
//         "media_type": "application/pdf",
//         "media_url": "/media/person/feed/1668511823013/1688673612031_4696.pdf",
//         "created_at": 1688673612219,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "title": "Ankush Guglani",
//         "person_avatar": "/media/person/profile/1668509937389/1685011029653_1819.jpg"
//     }
// ]

  let ticketMainId = null;
  let textareaValue = '';

  function showChatWidget() {
    isVisible = !isVisible;
    firstOpen = true;
  }

  // onMount(() => {
  //   // cookieData = cookies.get('yourCookieName')

  //   // const session = cookies.get('session');

  //   // if(getAuthKey !== null) {
  //   //   isAuthenticated.set(true);
  //   // }



  //   // chatSocket.on("connect", () => {
  //   //   // console.log(chatSocket.connected);
  //   // });
  //   // chatSocket.emit("chat_ai_ticket_message_v2", {
  //   //   app_type: "CITIZEN",
  //   //   organisation_office_id: "1673436078069",
  //   //   constituency_id: 1,
  //   //   ticket_main_id: null,
  //   //   person_id: getPersonId(),
  //   //   content: null,
  //   //   is_media_available: null,
  //   //   is_location_available: null,
  //   //   latitude: null,
  //   //   longitude: null,
  //   //   locality: null,
  //   //   address: null,
  //   //   category_id: null,
  //   //   required_inputs: null,
  //   //   ticket_id: null,
  //   // });
	// });

  onMount(() => {
    if(!!getAuthKey() && getPersonId() && getPersonOrgOfficeId() !== false) isAuthenticated.set(true);

    // if(!!getAuthKey() === false) {

    //   // TODO uncomment this
    //   console.log(app_id, app_secret, customer_id, 'authmain')

    //   axios.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token',{ customer_id: customer_id }, authHeaderConfig)
    //   .then(response => {
    //     setAuthKey(response.data.rows.token)
    //     setPersonId(response.data.rows.person_id)
    //     setPersonOrgOfficeId(response.data.rows.organisation_office_id)
    //     if (response.data.statusCode === 'S10001') isAuthenticated.set(true);

    //     console.log(response.data);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
    // }
  })

  $: {
    if (firstOpen === true) {
      if(!!getAuthKey() === false) {

      // TODO uncomment this
      console.log(app_id, app_secret, customer_id, 'new app')


      const authHeaderConfig = {
        headers: { 'x-client-id': app_id, 'x-client-secret': app_secret }
      };


      axios.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token',{ customer_id: customer_id }, authHeaderConfig)
      .then(response => {
        console.log('this is working from newApp')
        setAuthKey(response.data.rows.token)
        setPersonId(response.data.rows.person_id)
        setPersonOrgOfficeId(response.data.rows.organisation_office_id)
        if (response.data.statusCode === 'S10001') isAuthenticated.set(true);

        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
        console.log('this is not working from newApp')
      });
    }
    }
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
    messages = [...messages, { content: textareaValue, person_id: parseInt(getPersonId()), title: $userDetails.first_name + ' ' + $userDetails.last_name, person_avatar: $userDetails.profile_image, id: new Date().getTime(), created_at: new Date().getTime()}]
    textareaValue = '';
    console.log(messages)
  };

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

</script>

<style>
  .chat-widget-container {
    position: absolute;
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

</style>

{#if isVisible}
  <div class="chat-widget-container">
    <ChatHeader />

    <div class="smith-chat-body" style="height: 450px;">
      <div class="smith-conversation-container">
        {#each messages as message}
          {#if message.person_id !== $userDetails?.user_id}
            <div style="background-color: #f3f2f2; padding: 12px; margin: 10px; width: 280px; border-radius: 14px">
              <!-- <MessageItem /> -->
              <div class="chat-header" style="display: flex; align-items: center;">
                <div class="chat-header-avatar" style="display: flex; align-items: center;">
                  <img src={DOMAIN + message?.person_avatar} alt="a" style="height: 28px; border-radius: 50%; margin-right: 8px;">
                </div>
                <div class="smith-header-profile-name" style="">{message?.title}</div>
                <!-- <p style="font-size: 8px; margin-left: 8px;">time ago</p> -->
              </div>
              <div class="message-item-body" style="padding: 8px;">
                <p style="margin: 0; font-size: 12px">{message?.content}</p>
              </div>
            </div>
            {:else}

            <!-- my message -->
            <div style="background-color: #e2e7fb; padding: 12px; margin: 10px 10px 10px auto; width: 280px; border-radius: 14px">
              <div class="chat-header" style="display: flex; align-items: center;">
                <div class="chat-header-avatar" style="display: flex; align-items: center;">
                  <img src={DOMAIN + message?.person_avatar} alt="a" style="height: 28px; border-radius: 50%; margin-right: 8px;">
                </div>
                <div class="smith-header-profile-name" style="">{message?.title}</div>
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
      </div>
    </div>
    <!-- <MessageBox /> -->
    <div class="smith-chat-bar">
        <div class="smith-chat-bar-message">
          <div style="margin-right: 20px; border-radius: 20px; height: 35px;
      display: flex; background-color: #fff; align-items: center; width: 100%" >
        <button type="button" class="btn send-btn" style="border-radius: 50%;"> 😊 </button>
        <textarea placeholder="Type your message" rows="1" name="message-to-send" id="message-to-send" bind:value={textareaValue}/>
        <button type="button" class="btn send-btn" style="border-radius: 50%;"> + </button>

      </div>
      <button on:click={sendMessage} type="button" class="btn send-btn" style="height: 35px; border-radius: 50%">➤</button>
    </div>
      </div>
  </div>
{/if}


{#if firstOpen === true}
<AuthMain app_id={app_id} app_secret={app_secret} customer_id={customer_id} />
{/if}


<button on:click={showChatWidget} class="smith-launcher-frame">Chat</button>

<!-- <Child {message} /> -->
<!-- <h1>Havi</h1> -->