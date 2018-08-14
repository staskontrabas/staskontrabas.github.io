<template>
  <div class="k50_widget_panel_tab" @click="onClick">
    <div class="k50_tab_icon" v-html="item.svg">
    </div>
    <div class="k50_tab_icon_title">
      {{item.title}}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'WgtPanelItem',
    props: ['item'],
    methods: {
      onClick: function(){
        this.$store.dispatch('selectTab', {name: this.item.name, title: this.item.title})
      }
    }
  }
</script>

<style lang="less">
.k50_widget_panel_tab {
    position: relative;
    cursor: pointer;
    width: 100%;
    height: 48px;
    display: block;
    text-align: left;
    vertical-align: middle;
    padding: 0;
    color: #333333;
    font-size: 14px;
    -webkit-transition: color .2s ease;
    -moz-transition: color .2s ease;
    -ms-transition: color .2s ease;
    -o-transition: color .2s ease;
    transition: color .4s ease;
    vertical-align: top;

    &:hover{
        background-color:#e4e4e4;
    }
}
.k50_tab{
    &_icon{
        display: inline-block;
        width: 48px;
        height: 48px;
        position: relative;
        vertical-align: middle;

        svg{
            width: 48px;
            height: 48px;
            position: absolute;
            display: block;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
        }
        &_title{
            display: inline-block;
            vertical-align: middle;
            font-size: 14px;
        }
    }
}
</style>
