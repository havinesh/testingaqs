<svelte:options tag="auth-main"/>

<script>
  // export let app_id = 'IOy7oP2xeXarQCl8U_kA6WfjmTIcGkrqaBptZk_L4n4uCrIONXUyajnIfiwJ1Ujyiaw_AGh-Qz7-DYQkuIe7cQ';
  // export let app_secret = 'X1c5G4VbK-Rc-upH16bgYPFXVAg8kCYtXQy6uoc6kwClikZh-VngbsOpZvzIYGVhCzcIaGFP3UCKCjgJ0XxSKyU-X2FlTQlTSBX00BVnI82qoJjTatRXZLd0SYqn7IdZKJa8rVyGFZ9dIERccs2cZVe_dl4GDsOwEstNW-ZVBRU';
  // export let customer_id = '12345678';


  export let app_id;
  export let app_secret
  export let customer_id;

  import axios from "axios";
  import { onMount } from "svelte";
  import { getAuthKey, getPersonId, getPersonOrgOfficeId, setAuthKey, setPersonId, setPersonOrgOfficeId } from "../utils/cookie/user";
  import { isAuthenticated, userDetails } from '../stores/authStores.js';
  import { chatSocket } from "../socket";


  const authHeaderConfig = {
    headers: { 'x-client-id': app_id, 'x-client-secret': app_secret }
  };

  console.log(getAuthKey(), 'getAuthKey()')
  // onMount(() => {
  //   if(!!getAuthKey() === false) {

  //     // TODO uncomment this
  //     console.log(app_id, app_secret, customer_id, 'authmain')

  //     axios.post('https://test.cleandesk.co.in/api/v1/rl/generate/gateway/auth/token',{ customer_id: customer_id }, authHeaderConfig)
  //     .then(response => {
  //       console.log('this is working from authMain')
  //       setAuthKey(response.data.rows.token)
  //       setPersonId(response.data.rows.person_id)
  //       setPersonOrgOfficeId(response.data.rows.organisation_office_id)
  //       if (response.data.statusCode === 'S10001') isAuthenticated.set(true);

  //       console.log(response.data);
  //     })
  //     .catch(error => {
  //       console.error(error);
  //     });
  //   }
  // })

  $: {
    if ($isAuthenticated) {
      const headers = { 'Authorization': 'Token ' + getAuthKey() };

      axios.post('https://test.cleandesk.co.in/api/v1/user/profile/',{ person_id: null }, { headers })
      .then(response => {
        // Handle the response data
        if (response.data.statusCode === 'S10001') {
          chatSocket.on("connect", () => {
            // console.log(chatSocket.connected);
          });
          userDetails.set(response?.data?.rows);
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
      })
      .catch(error => {
        // Handle the error
        console.error(error);
      });


    }
  }

  $: console.log($userDetails?.user_id, 'userDetails')



</script>