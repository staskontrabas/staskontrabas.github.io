<template>
  <div class="k50_button"
    v-show="active"
    v-on:click.stop="onClick">
    <span class="k50_button_ripple"></span>
    <span class="k50_button_ripple"></span>
    <span class="k50_button_circle">
      <svg width="60" height="60" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>Panels</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(1758 -2268)"> <g id="Ellipse"> <use xlink:href="#path0_fill" transform="translate(-1758 2268)" fill="#f0f0f0"> </use> </g> <g id="Union"> <use xlink:href="#path1_fill" transform="translate(-1738 2290)" fill="#333333"></use> </g> </g> <defs> <path id="path0_fill" d="M 60 30C 60 46.5685 46.5685 60 30 60C 13.4315 60 0 46.5685 0 30C 0 13.4315 13.4315 0 30 0C 46.5685 0 60 13.4315 60 30Z"></path> <path id="path1_fill" fill-rule="evenodd" d="M 2 0C 0.895386 0 0 0.895432 0 2L 0 14L 0 18L 3.5 16L 18 16C 19.1046 16 20 15.1046 20 14L 20 2C 20 0.895432 19.1046 0 18 0L 2 0ZM 7 14L 3 14C 2.44775 14 2 13.5523 2 13L 2 3C 2 2.44772 2.44775 2 3 2L 17 2C 17.5522 2 18 2.44772 18 3L 18 13C 18 13.5523 17.5522 14 17 14L 7 14ZM 16 4L 4 4L 4 6L 16 6L 16 4ZM 14 7L 4 7L 4 9L 14 9L 14 7ZM 4 10L 11 10L 11 12L 4 12L 4 10Z"></path> </defs>
      </svg>
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ButtonMain',
  computed: mapState({
    active: function(state){
      return !state.status
    }
  }),
  methods: {
    onClick: function(){
      this.$store.dispatch({type: 'openStatus'})
    }
  }
}
</script>

<style lang="less">
@duration: .3s;
@size: 60px;
@keyframes spin {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(1.5);
    }
}

.k50_button {
    bottom: @size * .75;
    height: @size;
    opacity: 1;
    position: absolute;
    left: @size * 1.75 * (-1);
    transition: opacity @duration / 2 linear;
    width: @size;
    z-index: 9999;
    cursor: pointer;
    &_circle {
        border-radius: 50%;
        height: 100%;
        position: absolute;
        width: 100%;
    }
    &_ripple {
        animation: spin 2s infinite linear forwards;
        background-color: rgba(0, 0, 0, .3);
        border-radius: 50%;
        height: @size;
        left: 0;
        position: absolute;
        top: 0;
        transition: background-color @duration*4;
        width: @size;
        &:nth-last-of-type(2n) {
            animation-delay: 1s;
        }
    }
    &:after {
        height: @size * 1.5;
        width: @size * 1.5;
    }
    &:hover &_ripple {
        background-color: rgba(255, 0, 0, .5);
        transition: background-color @duration;
    }
    &.k50_active {
        opacity: 0;
    }
    &.k50_active &_ripple {
        animation: none;
    }
}
</style>
