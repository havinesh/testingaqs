<script>
  import axios from "axios";
	import {onMount} from "svelte";
  import InfiniteScroll from "../../common/InfiniteScroll.svelte";
  import MessageListing from "../ChatWidget/components/MessageListing.svelte";
  import { messages } from "../../stores/chatStores";

  let page = 1;
	// but most likely, you'll have to store a token to fetch the next page
	let nextUrl = '';
	// store all the data here.
	let data = [
  {
    id: 1689256846764,
    organisation_office_id: 1668510062923,
    person_id: 1673244394359,
    title: "Havinesh  Saravanann",
    person_avatar: '/media/person/profile/1668509937389/1685011029653_1819.jpg',
    citizen_designation: null,
    citizen_department: null,
    subject: null,
    content: null,
    current_status_id: null,
    category_id: null,
    priority_id: null,
    priority_name: null,
    tier_id: null,
    current_status_name: null,
    category_name: null,
    ticket_id: null,
    tier_color: null,
    priority_color: null,
    created_at: 1689256846763,
    mobile: "971771037723",
    agent_name: " ",
    agent_avatar: null,
    agent_responsible_id: null,
    tier_name: null,
    timespan: null,
    unread_count: 1,
    is_picked: false,
    last_comment: {
      id: 1689256913911,
      content: "hi",
      is_reply: 0,
      media_url: null,
      person_id: 1673244394359,
      created_at: 1689256913910,
      media_type: null,
      content_type: "text",
      ticket_main_id: 1689256846764,
      media_mime_type: null,
      original_comment_id: null,
      original_comment_content: null,
      original_comment_media_url: null,
      original_comment_media_type: null,
      original_comment_content_type: null,
      original_comment_media_mime_type: null,
    },
    rating_given_by_customer: "0",
    rating_given_by_agent: "0",
    app_type: "CITIZEN",
    last_comment_created_at: 1689256913910,
  },
];
	// store the new batch of data here.
	let newBatch = [];

	// async function fetchData() {
	// 	const response = await fetch(`https://api.openbrewerydb.org/breweries?by_city=los_angeles&page=${page}`);
	// 	newBatch = await response.json();
	// 	console.log(newBatch)
	// };
  const headers = { 'Authorization': 'Token 8379abbf7b54c8c7fff828719c8df3deb909cb7029ee5545b3bc8586fef6a245' };

  const fetchData = () => {

    const payload = {
      organisation_office_id: 1668510062923,
      // organisation_office_id: parseInt(getPersonOrgOfficeId()),
      app_type: "CITIZEN",
      is_partner: false,
      list_type : "all",
      page_number : page,
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

      // axios.post('https://test.cleandesk.co.in/api/v2/hd/ticket/list',{ ...payload }, { headers })
      //   .then(response => {
      //     console.log(response.data);
      //     newBatch = response.data.rows;
      //   })
      //   .catch(error => {
      //     console.error(error);
      //   });
  }

	onMount(()=> {
		// load first batch onMount
    // TODO uncomment this and all fetchData() calls
		fetchData();
	})

  $: data = [
		...data,
    ...newBatch
  ];

  console.log(messages);

  const fetchMessageList = item => {
    const payload = {
      search_val: null,
      page_size: 20,
      page_number: 1,
      ticket_main_id: item.id,
      applicable_to: "citizen"
    }

    axios.post('https://test.cleandesk.co.in/api/v1/hd/ticket/comments/list',{ ...payload }, { headers })
        .then(response => {
          console.log(response.data);
          messages.set(response.data.rows);
        })
        .catch(error => {
          console.error(error);
        });
  }
</script>
<svelte:options tag="chat-listing" />

<div style="height: 100%; width: 300px; background-color: #f3f2f2; position: relative; float: right;">
  <div class="chat-listing-header" style="display: flex;">
    <h2 style="margin: 0; padding: 12px">Timbl broadband</h2>
    <h2 style="margin: 0 1px 0 0; padding: 12px">X</h2>
  </div>
  <div style="padding: 0 12px;">
    <input type="text" id="myInput" onkeyup="myFunction()" placeholder="Search for names.." title="Type in a name">
  </div>
  <div style="height: 70vh;">
    <!-- <div style="width: 100%; max-width: 300px;">
      <h2>Timbl Broadband</h2>
      <input type="text" placeholder="Search" style="width: 100%; padding: 8px"/>
    </div> -->
    <ul>
      {#each data as item}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li on:click={fetchMessageList(item)}>
          <div style="display: flex; align-items: center;     border-bottom: 1px solid #d6c7c7;">
            <img class="list-img" src={'https://test.cleandesk.co.in' + item.person_avatar} alt="A" style="width: 42px; border-radius: 50%;"/>
            <div>
              <h5>{item.title}</h5>
              <p>{item.last_comment.content}</p>
            </div>
          </div>
        </li>
      {/each}
      <InfiniteScroll
        hasMore={newBatch.length}
        threshold={100}
        on:loadMore={() => {page++; fetchData()}} />
    </ul>
  </div>
</div>