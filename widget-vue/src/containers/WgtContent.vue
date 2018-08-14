<template>
  <div class="k50_widget_content">
    <WgtPanel/>
    <WgtChat/>
    <WgtCallback/>
    <WgtFeedback/>
  </div>
</template>

<script>
  import WgtPanel from '@/components/panel/WgtPanel.vue'
  import WgtChat from '@/components/chat/WgtChat.vue'
  import WgtCallback from '@/components/callback/WgtCallback.vue'
  import WgtFeedback from '@/components/feedback/WgtFeedback.vue'

  export default {
    name: 'WgtContent',
    data: function(){
      return {
        heightHeader: 50
      }
    },
    components: {
      WgtPanel,
      WgtChat,
      WgtCallback,
      WgtFeedback
    }
  }
</script>

<style lang="less">
.k50_widget_content {
    width: 100%;
    position: relative;
    height: ~'calc(100% - 50px)';
}
</style>
