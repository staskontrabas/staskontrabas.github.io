<template>
  <div class="k50_widget_wrap"
    v-bind:class="{active: active}"
    v-show="active">
    <WgtHeader/>
    <WgtContent/>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import WgtHeader from '@/components/header/WgtHeader.vue'
  import WgtContent from '@/containers/WgtContent.vue'

  export default {
    name: 'WidgetWrap',
    components: {
      WgtHeader,
      WgtContent
    },
    computed: mapState({
      active: function(state){
        return state.status
      }
    })
  }
</script>

<style lang="less">

.k50_widget_wrap {
    width: 360px;
    height: 500px;
    /*height: 100%;*/
    position: absolute;
    z-index: 10000000;
    /*bottom: 45px;*/
    top: 10px;
    right: -999px;
    background-color: #f0f0f0;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 20px 0px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    font-family: 'Open Sans';
    overflow: hidden;
    -webkit-transition: left .2s ease;
    -moz-transition: left .2s ease;
    -ms-transition: left .2s ease;
    -o-transition: left .2s ease;
    transition: box-shadow 0.3s linear;

    &.active{
        display: block;
        right: 45px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    }
    & * {
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      font-family: 'Open Sans';
  }
}
</style>
