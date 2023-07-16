<script>

  const chatSocket = io("https://support.foop.com", {
      query: {
        token: getAuthKey(),
      },
    });


</script>