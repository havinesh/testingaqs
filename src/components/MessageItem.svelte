<svelte:options tag="message-item"/>

<script>
  export let isMine = false;
  export let propValue;
  console.log(propValue)
  function getInlineStyles() {
    if (isMine === true) {
      return "background-color: #f3f2f2; padding: 12px; margin: 10px; width: 280px; border-radius: 14px";
    } else {
      return "background-color: #e2e7fb; padding: 12px; margin: 10px 10px 10px auto; width: 280px; border-radius: 14px";
    }
  }
</script>

<!-- <div style="{getInlineStyles()}"> -->
<!-- <div style="background-color: #f3f2f2; padding: 12px; margin: 10px; width: 280px; border-radius: 14px"> -->
  <!-- <div class="message-item-header">

  </div> -->
  <div class="chat-header" style="display: flex; align-items: center;">
    <div class="chat-header-avatar" style="display: flex; align-items: center;">
      <img src="https://test.cleandesk.co.in/media/person/profile/1668509937389/1685011029653_1819.jpg" alt="avatar" style="height: 28px; border-radius: 50%; margin-right: 8px;">
    </div>
    <div class="smith-header-profile-name" style="">Havinesh saran</div>
    <p style="font-size: 8px; margin-left: 8px;">time ago</p>
  </div>
  <div class="message-item-body" style="padding: 8px;">
    <p style="margin: 0; font-size: 12px">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets </p>
  </div>
<!-- </div> -->
