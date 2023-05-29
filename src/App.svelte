<svelte:options tag="chat-widget" />

<script>
  let isVisible = false;
  function showChatWidget() {
    isVisible = !isVisible;
  }
</script>

{#if isVisible}
  <div id="smith-container">
    <div class="smith-chat-frame">
      <div id="smith-chat-container">
        <div class="smith-chat">
          <div class="smith-chat-header">
            <div class="smith-header-profile">
              <div class="smith-header-profile-name">cleandesk.ai</div>
              <div class="smith-header-profile-intro">
                <span>Conversational AI provides community service.</span>
              </div>
              <div class="smith-header-profile-cta">
                <a href="">Sign up</a>
              </div>
            </div>
          </div>
          <div class="smith-chat-body">
            <div class="smith-conversation-container">
              <div class="smith-conversation-body-parts">
                <div class="smith-conversation-parts-wrapper">
                  <div class="smith-conversation-parts">
                    <div
                      class="smith-conversation-part smith-conversation-part-admin"
                    >
                      <div
                        class="smith-comment-container smith-comment-container-admin"
                      >
                        <div class="smith-comment-container-admin-avatar">
                          <div class="smith-avatar">
                            <img
                              src="https://prod-smith-dynamic.imgix.net/static/logos/smith-footer-logo.png"
                            />
                          </div>
                        </div>
                        <div class="smith-comment">
                          <div class="smith-blocks">
                            <div class="smith-block smith-block-paragraph">
                              Hi there! 👋 Let me know if you have any
                              questions!
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="smith-chat-bar">
      <div class="smith-chat-bar-message">
        <textarea placeholder="Type your message" rows="1" />
        <button type="button" class="btn send-btn"> Send </button>
      </div>
    </div>
  </div>
{/if}

<!-- <div id="launch" class="smith-launcher-frame"> -->
<div class="smith-launcher" />
<button on:click={showChatWidget} class="smith-launcher-frame">click</button>

<!-- </div> -->

<style>
  body {
    font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  #smith-container {
    width: 0px;
    height: 0px;
    bottom: 0px;
    right: 0px;
    z-index: 999999;
  }

  #smith-chat-container {
    overflow: hidden;
  }

  .smith-chat-frame {
    z-index: 999999 !important;
    position: fixed !important;
    bottom: 20px;
    right: 20px;
    height: calc(100% - 20px - 20px);
    width: 400px !important;
    min-height: 250px !important;
    max-height: 480px !important;
    box-shadow: 0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);
    border-radius: 2px !important;
    overflow: hidden !important;
    opacity: 1 !important;
  }

  .smith-chat-bar {
    z-index: 999999 !important;
    position: fixed !important;
    bottom: calc(20px + 56px + 16px);
    right: 20px;
    height: 60px;
    width: 400px !important;
    box-shadow: 0px 1px 4px rgba(13, 22, 26, 0.08),
      0px 4px 16px rgba(13, 22, 26, 0.12), 0px 2px 12px rgba(13, 22, 26, 0.08);
    border-radius: 2px !important;
    overflow: hidden !important;
    opacity: 1 !important;
    background: #fff;
  }

  #smith-container {
    /*   display: none; */
  }

  #smith-container .smith-chat-frame {
    height: 100%;
    width: 100%;
    height: calc(100% - 20px - 76px - 20px);
    bottom: calc(20px + 56px + 16px + 60px + 8px);
  }

  #smith-container .smith-chat {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
  }

  #smith-container .smith-chat-header {
    background: #fff;
    border-top: 16px solid #1e9fd6;
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    transition: height 0.16s ease-out;
  }

  #smith-container .smith-header-profile {
    padding: 32px 48px 16px 48px;
    box-sizing: border-box;
    text-align: center;
  }

  #smith-container .smith-header-profile-name {
    color: rgba(0, 18, 26, 0.93);
    font-size: 20px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }

  #smith-container .smith-header-profile-intro {
    color: rgba(0, 18, 26, 0.59);
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 4px;
  }

  #smith-container .smith-header-profile-cta a {
    color: #1e9fd6;
    font-size: 14px;
    text-decoration: none;
    opacity: 0.9;
    transition: opacity 0.15s ease-in-out;
  }

  #smith-container .smith-team-profile-full-cta a:hover {
    opacity: 1;
  }

  #smith-container .smith-chat-body {
    position: relative;
    flex: 1;
    background-color: #fff;
  }

  #smith-container .smith-conversation-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  #smith-container .smith-conversation-body-parts {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  #smith-container .smith-conversation-parts {
    padding: 24px 20px 0;
    display: flex;
    flex-flow: row wrap;
  }

  #smith-container .smith-conversation-parts-wrapper {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    justify-content: space-between;
  }

  #smith-container .smith-comment-container {
    position: relative;
    margin-bottom: 24px;
  }

  #smith-container .smith-comment-container-admin {
    float: left;
    padding-left: 40px;
    width: calc(100% - 48px);
  }

  #smith-container .smith-comment-container-admin-avatar {
    position: absolute;
    left: 0;
    bottom: 2px;
  }

  #smith-container .smith-avatar {
    margin: 0 auto;
    border-radius: 50%;
    display: inline-block;
    vertical-align: middle;
  }

  #smith-container .smith-comment-container-admin-avatar .smith-avatar {
    width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 14px;
  }

  #smith-container .smith-avatar img {
    border-radius: 50%;
  }

  #smith-container .smith-comment-container-admin-avatar .smith-avatar img {
    width: 28px;
    height: 28px;
  }

  #smith-container .smith-comment:not(.smith-comment-with-body) {
    padding: 12px 20px;
    border-radius: 20px;
    position: relative;
    display: inline-block;
    width: auto;
    max-width: 75%;
  }

  #smith-container
    .smith-comment-container-admin
    .smith-comment:not(.smith-comment-with-body) {
    color: rgba(0, 18, 26, 0.93);
    background-color: #edf1f2;
  }

  #smith-container .smith-comment .smith-block-paragraph {
    font-size: 14px;
    line-height: 20px;
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
    background-color: #edf1f2;
    border-color: #edf1f2;
    min-width: 72px;
  }

  .send-btn:hover {
    cursor: pointer;
    color: rgba(0, 18, 26, 0.93);
    background-color: #d4dadd;
    border-color: #d4dadd;
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
    background: #1e9fd6 !important;
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
