<template>
  <div class="k50_chat_message_item k50_chat_message_out">
    <div class="k50_chat_message_body">
      <div v-html="msg.value"></div>
      <div class="k50_chat_message_bottom">
        <div class="k50_chat_message_time">{{msg.time}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'WgtMessage',
    props: ['msg']
  }
</script>

<style lang="less">
</style>
