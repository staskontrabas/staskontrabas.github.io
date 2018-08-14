<template>
  <div class="k50_widget_header_close" v-on:click.stop="closeWidget">
    <svg width="30" height="30" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g transform="translate(-697 -154)"> <use xlink:href="#path0_fillcl" transform="translate(706.343 163.343)" fill="#333333"></use> </g> <defs> <path id="path0_fillcl" fill-rule="evenodd" d="M 11.3137 1.41418L 9.89954 0L 5.65686 4.24268L 1.41418 6.10352e-05L 0 1.41425L 4.24268 5.65686L 0 9.89948L 1.41431 11.3137L 5.65686 7.07111L 9.89954 11.3137L 11.3137 9.89954L 7.07104 5.65692L 11.3137 1.41418Z"> </path> </defs>
    </svg>
  </div>
</template>

<script>import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
  export default {
    name: 'WgtHeaderClose',
    methods: {
      closeWidget: function(){
        this.$store.dispatch('closeStatus')
      }
    }
  }
</script>
