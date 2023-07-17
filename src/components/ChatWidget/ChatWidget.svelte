<svelte:options tag="chat-widget-container" />

<script>
  export let isVisible;

  import io from "socket.io-client";
  import { onMount } from "svelte";
  // import { chatSocket } from "../../utils/socket/socketConfig";
  import { getAuthKey, getPersonId, getPersonOrgOfficeId } from "../../utils/cookie/user";
  import { userDetails } from "../../stores/authStores";
  // import { messages } from "../../stores/chatStores";
  import { DOMAIN } from "../../config/api-variables";
  import ChatHeader from "../ChatHeader.svelte";
  import ReverseInfiniteScroll from "../../common/ReverseInfiniteScroll.svelte";
  import axios from "axios";
  import InfiniteScroll from "../../common/InfiniteScroll.svelte";
  import ChatListing from "./components/ChatListing/ChatListing.svelte";
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  const chatSocket = io("https://support.foop.com", {
    query: {
      token: getAuthKey(),
    },
  });

  let messages = [];
  let messageLoading = false;
  let ticketMainId = null;
  let textareaValue = '';
  let page = 1;
  let totalMessages = 0;
  let newBatch = [];

  let isChatListVisible = false;

  let selectedMessage = null;

  let chatContainer;

  let scrollTop = 0;
  let scrollHeight = 0;
  let clientHeight = 0;

  // $: console.log(selectedMessage, 'selectedMessage')

  $: {
    if (!!selectedMessage) {
      messages =[];
      page = 1;
      ticketMainId = selectedMessage.id;
      console.log(ticketMainId, 'ticketMainId')
      fetchMessageList();
    } else {
      console.log('from else')
      let exectuted = false;
      if (!exectuted) {
        exectuted = true;
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
      }
    }
  }

  const startNewConversation = () => {
    page=1;
    messages=[];
    selectedMessage=null;
    chatSocket.emit("chat_ai_ticket_message_v2", {
      app_type: "CITIZEN",
      organisation_office_id: getPersonOrgOfficeId(),
      constituency_id: 1,
      ticket_main_id: null,
      person_id: getPersonId(),
      content: null,
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
  }

  let exectuted = false;
      if (!exectuted) {
        exectuted = true;
        chatSocket.emit("chat_ai_ticket_message_v2", {
          app_type: "CITIZEN",
          organisation_office_id: getPersonOrgOfficeId(),
          constituency_id: 1,
          ticket_main_id: null,
          person_id: getPersonId(),
          content: null,
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
      }
  onMount(() => {
    chatContainer.addEventListener('scroll', handleScroll);

    console.log(chatSocket, 'chatSocket')
    chatSocket.on("connect", () => {
        console.log(chatSocket.connected);
      });
    console.log('onMount')
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
    // console.log('hi from chat widget')
  })

  chatSocket.on('chat_ai_ticket_message_v2', data => {
    if (data.person_id !== parseInt(getPersonId())) {
      console.log('different id')
      messageLoading = false;
      messages = [data, ...messages]
      // messages = [...messages, data]
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
      // ticket_main_id: 1689543928886,
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
    messages = [{ content: textareaValue, person_id: parseInt(getPersonId()), title: $userDetails?.first_name + ' ' + $userDetails?.last_name, person_avatar: $userDetails?.profile_image, id: new Date().getTime(), created_at: new Date().getTime()}, ...messages]
    // messages = [...messages, { content: textareaValue, person_id: parseInt(getPersonId()), title: $userDetails?.first_name + ' ' + $userDetails?.last_name, person_avatar: $userDetails?.profile_image, id: new Date().getTime(), created_at: new Date().getTime()}]
    textareaValue = '';
    messageLoading = true;
    console.log(messages)
  };

  // const scrollToBottom = node => {
	// 	const scroll = () => node.scroll({
	// 		top: node.scrollHeight,
	// 		behavior: 'smooth',
	// 	});
	// 	scroll();

	// 	return { update: scroll }
	// };

  function handleScroll(event) {
    scrollTop = chatContainer.scrollTop;
    scrollTop = Math.abs(scrollTop);
    scrollHeight = chatContainer.scrollHeight;
    clientHeight = chatContainer.clientHeight;

    let havinesh = scrollHeight - clientHeight;

    if (scrollTop === havinesh && newBatch.length > 0) {
      console.log('load more')
      page++;
      fetchMessageList();
    }
  }


  const fetchMessageList = () => {
     const headers = { 'Authorization': 'Token 8379abbf7b54c8c7fff828719c8df3deb909cb7029ee5545b3bc8586fef6a245' };

     const payload = {
      search_val: null,
      page_size: 10,
      page_number: page,
      // ticket_main_id: 1689543928886,
      ticket_main_id: ticketMainId,
      applicable_to: "citizen"
    }
    axios.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list',{ ...payload }, { headers })
        .then(response => {
          console.log(response.data);
          newBatch = response.data.rows;
          // messages.update((data) => {
          //   return [...data, ...newBatch];
          // });
          messages = [...messages, ...newBatch];
          totalMessages = response.data.total;
          console.log(messages);
          // messages = [...messages, response.data.rows];
        })
        .catch(error => {
          console.error(error);
        });
    console.log('fetchTicketList')
  }

  function infiniteHandler({ detail: { loaded, complete } }) {
		fetch(`${api}&page=${page}`)
			.then(response => response.json())
			.then(data => {
					console.log(data)
        if (data.length) {
          page += 1;
					list = [...data.reverse(), ...list];
          loaded();
        } else {
          complete();
        }
      });
      const headers = { 'Authorization': 'Token 8379abbf7b54c8c7fff828719c8df3deb909cb7029ee5545b3bc8586fef6a245' };

     const payload = {
      search_val: null,
      page_size: 5,
      page_number: page,
      ticket_main_id: 1689543928886,
      // ticket_main_id: item.id,
      applicable_to: "citizen"
    }
    axios.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list',{ ...payload }, { headers })
        .then(response => {
          if (response.data.rows.length) {
          page += 1;
          // messages.update((data) => {
          //   return [ ...response.data.rows.reverse(), ...messages];
          // });
          messages = [...messages, ...newBatch];

          loaded();
        } else {
          complete();
        }
          // console.log(response.data);
          // messages.update((data) => {
          //   return [...data, ...response.data.rows];
          // });
          // totalMessages = response.data.total;
          // console.log(messages);
          // messages = [...messages, response.data.rows];
        })
    console.log('fetchTicketList')
	}

</script>

<div class="chat-widget-container" style="{isChatListVisible ? 'right: 320px' : 'right: 20px'}">
    <ChatHeader />

    <div class="smith-chat-body" style="height: 424px; ">
    <!-- <div use:scrollToBottom={messages} class="smith-chat-body" style="height: 424px; "> -->
      <!-- <div class="smith-conversation-container" style="display: flex; overflow-y: scroll; flex-direction: column-reverse" bind:this={chatContainer}> -->
      <div class="smith-conversation-container" style="display: flex; overflow-y: scroll; flex-direction: column-reverse" bind:this={chatContainer} on:scroll={handleScroll}>
        {#if messageLoading === true}
            <div style="background-color: #f3f2f2; padding: 12px; margin: 10px; width: 50px; border-radius: 8px">
              <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
              </div>
            </div>
          {/if}
        {#each messages as message}
          {#if message.media_type === 'application/pdf'}
            <div style="cursor: pointer; font-size: 12px; justify-content: center; display: flex; margin-bottom: 10px;">
              <a href={DOMAIN + message.media_url} target="_blank" rel="noopener noreferrer">Click here to open pdf</a>
            </div>
          {/if}
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
            <!-- <InfiniteScroll
              hasMore={totalMessages}
              threshold={100}
              on:loadMore={() => {page++; fetchMessageList()}} /> -->
        {/each}


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
            <button on:click={() => isChatListVisible = !isChatListVisible} type="button" class="btn send-btn" style="border-radius: 50%;"> + </button>

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

  {#if isChatListVisible}
    <ChatListing
      on:selectedItem={item => selectedMessage = item.detail}
      on:startNewChat={startNewConversation}
      />
  {/if}


{#if isVisible}

  <button on:click={() => dispatch('closeWidget', true)} class="close-widget-button" style="{isChatListVisible ? 'right: 320px' : 'right: 20px'}" >
    x
  </button>
{/if}

<style>
  .havinesh {
    background-color: red;
  }
</style>
