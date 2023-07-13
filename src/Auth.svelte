<svelte:options tag="auth-component"/>

<script>
  import { setCookie } from "./utils/cookie/user";
  import axios from "axios";

  let phone = '7555629124';
  let password = '';
  let mobile_otp = '755562';
  let authFormVisible = false;
  let isOtpSent = false;

  const signInForm = () => {
    authFormVisible = true;
  }
  const handleSubmit = () => {
    axios.post('https://test.cleandesk.co.in/api/v1/rl/send-otp/',{ app_type: 'CITIZEN', otp_reason: 'LOGIN', mobile: phone, mobile_country_code: '91' })
    .then(response => {
      // Handle the response data
      isOtpSent = true;
      authFormVisible = false;
      console.log(response.data);
    })
    .catch(error => {
      // Handle the error
      console.error(error);
    });
    console.log(phone)
  }

  const handleOtp = () => {
    axios.post('https://test.cleandesk.co.in/api/v1/rl/login/',{
    mobile: phone,
    mobile_country_code: "91",
    app_type: "CITIZEN",
    mobile_otp: mobile_otp
})
  .then(response => {
    // Handle the response data
    // if (response.data.statusCode === 'S10001') {
    //   console.log(response.rows.token)
    //   setCookie('beta_userToken', response.data.rows.token);
    // }
    // isOtpSent = false;
    setCookie('beta_userToken', response.data.rows.token);
    console.log(response.data.rows.token, 'token');
    console.log(response.data.statusCode, 'statusCode');
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });
  }

</script>

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
  {#if authFormVisible === false}
  <button type="link" on:click={signInForm}>Sign in</button>
  {/if}
  {#if authFormVisible === true}
  <form on:submit|preventDefault="{handleSubmit}">
    <input
      class="form-field"
      bind:value="{phone}"
      type="phone"
      placeholder="Enter your phone number"
    />
    <button class="form-field">
      send otp
    </button>
  </form>
  {/if}
  {#if isOtpSent === true}
  <form on:submit|preventDefault="{handleOtp}">
    <input
      class="form-field"
      bind:value="{mobile_otp}"
      type="mobile_otp"
      placeholder="Enter your otp"
    />
    <button class="form-field">
      submit
    </button>
  </form>
  {/if}
</div>