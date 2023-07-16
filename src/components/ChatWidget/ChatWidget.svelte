<svelte:options tag="chat-widget-container" />

<div class="hi from chat widget">

  hi from chat widget
</div>

<script>
  import io from "socket.io-client";
  import { onMount } from "svelte";
  // import { chatSocket } from "../../utils/socket/socketConfig";
  import { getAuthKey, getPersonId, getPersonOrgOfficeId } from "../../utils/cookie/user";
  import { userDetails } from "../../stores/authStores";
  import { DOMAIN } from "../../config/api-variables";
  import ChatHeader from "../ChatHeader.svelte";

  const chatSocket = io("https://support.foop.com", {
    query: {
      token: getAuthKey(),
    },
  });

  let messages = [];
  let messageLoading = false;
  let ticketMainId = null;
  let textareaValue = '';

  onMount(() => {
    console.log(chatSocket, 'chatSocket')
    chatSocket.on("connect", () => {
        console.log(chatSocket.connected);
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
  })

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
  console.log('hi from chat widget')

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

  const scrollToBottom = node => {
		const scroll = () => node.scroll({
			top: node.scrollHeight,
			behavior: 'smooth',
		});
		scroll();

		return { update: scroll }
	};

</script>

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
          <input placeholder="Type your message" rows="1" name="message-to-send" id="message-to-send" bind:value={textareaValue} style="width: 100%; border: none; outline:none;"/>
          <!-- <textarea placeholder="Type your message" rows="1" name="message-to-send" id="message-to-send" bind:value={textareaValue}/> -->
            <button type="button" class="btn send-btn" style="border-radius: 50%;"> + </button>

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

<style>
  .havinesh {
    background-color: red;
  }
</style>
