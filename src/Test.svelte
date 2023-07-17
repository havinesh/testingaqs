<svelte:options tag="hi-test" />

<script>
  import axios from "axios";
  import InfiniteScroll from 'svelte-infinite-scroll';
  import ReverseInfiniteScroll from "./common/ReverseInfiniteScroll.svelte";
  import { onMount } from "svelte";

  let items = []; // Your initial data
//   let items = [
//     {
//         "id": 1689543974214,
//         "ticket_main_id": 1689543928886,
//         "content": "ascvn askvc",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543974213,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543973156,
//         "ticket_main_id": 1689543928886,
//         "content": "cajbsvclkajbscv",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543973156,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543972128,
//         "ticket_main_id": 1689543928886,
//         "content": "asbckajbsca",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543972127,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543971147,
//         "ticket_main_id": 1689543928886,
//         "content": "ascbaksjbvc",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543971146,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543970151,
//         "ticket_main_id": 1689543928886,
//         "content": "asvhckasbvc",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543970151,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543969276,
//         "ticket_main_id": 1689543928886,
//         "content": "ajbsclkajhbscv",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543969276,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543965964,
//         "ticket_main_id": 1689543928886,
//         "content": "ajsvcbakjsbva",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543965963,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543964912,
//         "ticket_main_id": 1689543928886,
//         "content": "casjb vckjabscv",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543964911,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543963844,
//         "ticket_main_id": 1689543928886,
//         "content": "asjcbalsjbca",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543963844,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     },
//     {
//         "id": 1689543962859,
//         "ticket_main_id": 1689543928886,
//         "content": "asjcbaljsbc",
//         "content_type": "text",
//         "media_type": null,
//         "media_url": null,
//         "created_at": 1689543962858,
//         "media_mime_type": null,
//         "is_reply": 0,
//         "original_comment_id": null,
//         "original_comment_content": null,
//         "original_comment_content_type": null,
//         "original_comment_media_type": null,
//         "original_comment_media_url": null,
//         "original_comment_media_mime_type": null,
//         "person_id": 1689153829978,
//         "title": "DEVKI NANDAN",
//         "person_avatar": "/media/default/profile/person/default.png",
//         "comment_status": null,
//         "applicable_to": null
//     }
// ]

 let container;
  let page = 1; // The current page
  let newBatch = [];

  onMount(() => {
    container.addEventListener('scroll', handleScroll);
  });

  const headers = { 'Authorization': 'Token 8379abbf7b54c8c7fff828719c8df3deb909cb7029ee5545b3bc8586fef6a245' };

  onMount(() => {
    loadMoreItems();
  });

  // Function to load more data
  async function loadMoreItems() {
    const payload = {
      search_val: null,
      page_size: 10,
      page_number: page,
      ticket_main_id: 1689543928886,
      // ticket_main_id: item.id,
      applicable_to: "citizen"
    }

    axios.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list',{ ...payload }, { headers })
        .then(response => {
          // console.log(response.data);
          newBatch = response.data.rows;
          items = [...items, ...newBatch];
          // $messages = [...$messages, response.data.rows];
        })
        .catch(error => {
          console.error(error);
        });

    // const payload = {
    //   search_val: null,
    //   page_size: 10,
    //   page_number: page,
    //   ticket_main_id: 1689543928886,
    //   // ticket_main_id: item.id,
    //   applicable_to: "citizen"
    // }

    // axios.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list',{ ...payload }, { headers })
    //     .then(response => {
    //       console.log(response.data);
    //       newBatch = response.data.rows;
    //       items = [...items, ...newBatch];

    //       // $messages = [...$messages, response.data.rows];
    //     })
    //     .catch(error => {
    //       console.error(error);
    //     });

    // Append the new data to the existing items
    // items = [...items, ...newBatch];
  }

  let scrollTop = 0;
  let scrollHeight = 0;
  let clientHeight = 0;

  function handleScroll(event) {
    scrollTop = container.scrollTop;
    scrollTop = Math.abs(scrollTop);
    scrollHeight = container.scrollHeight;
    clientHeight = container.clientHeight;

    let havinesh = scrollHeight - clientHeight;

    if (scrollTop === havinesh && newBatch.length > 0) {
      console.log('load more')
      page++;
      loadMoreItems();
    }
  }

  $: console.log(items, 'items')

  // function handleScroll(event) {
  //   if (container.scrollTop === 0) {
  //     console.log('load more');
  //   }
  // }

  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    console.log(document.documentElement, 'document.documentElement')
    console.log(scrollTop, 'scrollTop')
    console.log(scrollHeight, 'scrollHeight')
    console.log(clientHeight, 'clientHeight')
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      console.log(scrollTop, 'scrollTop')
      console.log(scrollHeight, 'scrollHeight')
      console.log(clientHeight, 'clientHeight')
      // Load more items when the user is near the bottom of the page (with a 20px buffer)
      // loadMoreItems();
      console.log('load more')
    }
  });

</script>
hi form test
<div class="chatContainer" style="height: 200px; display: flex; overflow-y: scroll; flex-direction: column-reverse" bind:this={container} on:scroll={handleScroll}>
  {#each items as item}
    <!-- Display your content items here -->
    <div style="padding: 12px;">{item.content}</div>
  {/each}
  <!-- This element will trigger the loading of more content -->
  <!-- <ReverseInfiniteScroll
      hasMore={true}
      reverse
      threshold={100}
      on:loadMore={() => {page++; loadMoreItems()}}
    /> -->
</div>

<p>scrollTop: {scrollTop}</p>
<p>scrollHeight: {scrollHeight}</p>
<p>clientHeight: {clientHeight}</p>

<!-- <h1>hi from {havinesh}</h1> -->