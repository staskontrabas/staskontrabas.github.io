<template>
  <div class="k50_widget_header">
    <div class="k50_widget_header_nav_icon" v-show="tab != ''" @click.stop="toPanel">
      <svg width="30" height="30" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g> <rect width="30" height="30" fill="black" fill-opacity="0.05"></rect> </g> <g id="Union"> <path fill-rule="evenodd" clip-rule="evenodd" d="M 0 7L 8 0L 8 2.5L 4.11108 6L 16 6L 16 8L 4.11108 8L 8 11.5L 8 14L 0 7Z" transform="translate(7 8)" fill="#333333"></path> </g> </svg>
    </div>
    <div class="k50_widget_header_title">{{title}}</div>
    <WgtHeaderClose />
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import WgtHeaderClose from './WgtHeaderClose.vue'

  export default {
    name: 'WgtHeader',
    components: {
      WgtHeaderClose
    },
    computed: mapState({
      title: function(state){
        return state.panel.title
      },
      tab: function(state){
        return state.panel.name
      }
    }),
    methods: {
      toPanel: function() {
        this.$store.dispatch({type:'defaultTab'})
      }
    }
  }
</script>

<style lang="less">

.k50_widget_header {
    position: relative;
    width: 100%;
    height: 50px;
    padding: 20px 20px 0;
    color: #333333;
    text-align: left;
    z-index: 1;
    background-color: #f0f0f0;
    line-height: 30px;

    &_nav_icon{
        display: inline-block;
        width: 30px;
        height: 30px;
        vertical-align: middle;
        cursor: pointer;
    }

    &_title{
        display: inline-block;
        vertical-align: middle;
        padding-left: 10px;
        font-size: 13px;
        font-weight: bold;
    }

    &_close {
        position: absolute;
        right: 0px;
        top: 0px;
        cursor: pointer;
        height: 30px;
        width: 30px;
        z-index:1;
    }
}
</style>
