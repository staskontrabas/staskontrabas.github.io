<template>
  <div class="k50_chat_log k50_custom-scroll">
    <WgtMessage v-for="(msg, index) in messages"
                v-bind:msg="msg"
                v-bind:index="index"
                v-bind:key="index"/>
  </div>
</template>

<script>
  import { mapState } from "vuex"
  import WgtMessage from "@/components/chat/WgtMessage.vue"

  export default {
    name: 'WgtChatLog',
    components: {
      WgtMessage
    },
    computed: mapState({
      messages: function(state){
        return state.msgs
      }
    })
  }
</script>

<style lang="less">
</style>
