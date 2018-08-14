<template>
  <div class='k50_widget'>
    <WidgetButton/>
    <WidgetWrap/>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import WidgetButton from '@/containers/WidgetButton.vue'
  import WidgetWrap from '@/containers/WidgetWrap.vue'

  export default {
    name: 'widget',
    components: {
      WidgetButton,
      WidgetWrap
    },
    computed: mapState({
      status: function(state){
        return state.status
      }
    }),
    mounted: function(){
      document.addEventListener('click', function(event){
        if(this.status && !(event.target == this.$el || this.$el.contains(event.target))){
          this.$store.dispatch({type: 'closeStatus'})
          //this.$store.dispatch('defaultTab')
        }
      }.bind(this), false)
    }
  }
</script>

<style lang="less">
.k50_widget {
    position: fixed;
    top: 0;
    height: 100%;
    right: 0;
    z-index: 9999;
}
.k50{
    &_clear:after{
        content: '';
        display: block;
        width: 0;
        height: 0;
        float: none;
        clear: both;
    }
    &_widget_desc{
        padding-bottom: 20px;
        color: rgba(0,0,0,0.5);
        font-size: 13px;
        line-height: 18px;
    }
    &_input_label{
        border: 0;
        width: 100%;
        color: #333333;
        font-size: 11px;
        line-height: 13px;
        height: 13px;
        text-transform: uppercase;
    }
    &_input{
        border: 0;
        outline: none;
        width: 100%;
        height: 30px;
        background-color: rgba(0,0,0,0.05);
        padding: 0 10px;
        color: #333333;
        font-size: 13px;
        line-height: 18px;

        &:hover, &:focus{
            background-color: rgba(0,0,0,0.1);
        }
    }
    &_input_error{
        display: none;
        border: 0;
        width: 100%;
        color: #C00000;
        font-size: 12px;
        line-height: 13px;
        height: 13px;
    }
    &_textarea {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        height: 50px;
        background-color: rgba(0,0,0,0.05);
        border: 0;
        width: 100%;
        resize: none;
        overflow: hidden;
        font-size: 13px;
        line-height: 18px;
        padding: 8px;
        outline: 0;
        color: #333333;
        display: block;

        &:hover, &:focus{
            background-color: rgba(0,0,0,0.1);
        }
    }
    &_widget_button{
        cursor: pointer;
        width: 100%;
        height: 50px;
        position: absolute;
        left: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.1);
        line-height: 50px;
        text-align: center;
        color: rgba(0, 0, 0, 0.25);
        font-size: 15px;
        pointer-events: none;

        &.active{
            background-color: #0088E0;
            color: #fff;
            pointer-events: auto;
        }
    }
    &_widget_row{
        margin-bottom: 10px;
        position: relative;

        &.error{
            &:after{
                content: '';
                display: block;
                position: absolute;
                width: 30px;
                height: 30px;
                top: 13px;
                right: 0;
                z-index: 1;
                background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='30' height='30' viewBox='0 0 30 30' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cg%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M 14 7C 14 10.866 10.866 14 7 14C 3.134 14 0 10.866 0 7C 0 3.134 3.134 0 7 0C 10.866 0 14 3.134 14 7ZM 12 7C 12 9.76141 9.76141 12 7 12C 4.23859 12 2 9.76141 2 7C 2 4.23859 4.23859 2 7 2C 9.76141 2 12 4.23859 12 7ZM 6 7L 6 4L 8 4L 8 7L 6 7ZM 6 10L 6 8L 8 8L 8 10L 6 10Z' transform='translate(8 8)' fill='%23C00000'/%3e%3c/g%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-size: contain;
                background-position: center;
            }
            .k50_input_error{
                display: block;
            }
        }
    }

    &_hidden{
        display: none !important;
    }

    &_novisible{
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
    }

    &_custom-scroll::-webkit-scrollbar{width:10px;height:7px}
    &_custom-scroll::-webkit-scrollbar-button{width:1px;height:0}
    &_custom-scroll::-webkit-scrollbar-thumb{background:#bbbbbb;border:none;border-radius:50px}
    &_custom-scroll::-webkit-scrollbar-thumb:hover{background:#999999}
    &_custom-scroll::-webkit-scrollbar-thumb:active{background:#999999}
    &_custom-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0);border:none;}
    &_custom-scroll::-webkit-scrollbar-track:hover{background:rgba(0,0,0,0.05)}
    &_custom-scroll::-webkit-scrollbar-track:active{background:rgba(0,0,0,0.05)}
    &_custom-scroll::-webkit-scrollbar-corner{background:0 0}
}

</style>
