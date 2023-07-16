<svelte:options tag="auth-main-final" />

<script>
  import { onMount } from "svelte";
  import { getAuthKey, getPersonId, getPersonOrgOfficeId, setAuthKey, setPersonId, setPersonOrgOfficeId } from "../utils/cookie/user";
  import axios from "axios";
  import { isAuthenticated, userDetails } from "../stores/authStores";

  export let app_id;
  export let app_secret
  export let customer_id;

  onMount(() => {
    console.log(app_id, app_secret, customer_id, 'authmainfinal')
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
  })


  $: {
    if ($isAuthenticated) {
      const headers = { 'Authorization': 'Token ' + getAuthKey() };

      axios.post('https://test.cleandesk.co.in/api/v1/user/profile/',{ person_id: null }, { headers })
      .then(response => {
        // Handle the response data
        if (response.data.statusCode === 'S10001') {
          userDetails.set(response?.data?.rows);
          // chatSocket.on("connect", () => {
          //   // console.log(chatSocket.connected);
          // });
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
      })
      .catch(error => {
        // Handle the error
        console.error(error);
      });
    }
  }

  console.log('hi from authmainfinal')

</script>

<style>
  .testHavinesh {
    color: blue;
  }
</style>
