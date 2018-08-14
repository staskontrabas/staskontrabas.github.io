<template>
  <div class="k50_chat" v-show="tab == 'w-chat'">
    <div class="k50_chat_container">
      <div class="k50_chat_content">
        <div class="k50_chat_table_row">
          <div class="k50_chat_log_wrap">
            <WgtChatLog/>
          </div>
        </div>
        <WgtChatSend/>
    </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import WgtChatLog from "@/components/chat/WgtChatLog.vue"
  import WgtChatSend from "@/components/chat/WgtChatSend.vue"

  export default {
    name: 'WgtChat',
    components: {
      WgtChatLog,
      WgtChatSend
    },
    computed: mapState({
      tab: function(state){
        return state.panel.name
      }
    })
  }
</script>

<style lang="less">
.k50_chat{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    &.active{
        display: block;
    }
    &_container{
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }
    &_content {
        height: ~'calc(100% - 0px)';
        width: 100%;
        overflow: hidden;
        font-size: 13px;
        max-height: 100%;
        display: table;
    }
    &_content:after{
        content: '';
        display: none;
        position: relative;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 15px;
    }
    &_table_row{
        display: table-row;
    }
    &_log_wrap {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: table-cell;
        vertical-align: bottom;
        padding-top: 20px;
    }
    &_log {
        max-height: 100%;
        width: 100%;
        overflow-y: auto;
        bottom: 0;
    }
    &_note {
        width: 100%;
        border-top: 0px solid #cccccc;
        z-index: 6;
        min-height: 20px;
        max-height: 140px;
        display: table-row;
        position: relative;
        padding: 0 20px;

        &_val{
            display: none;
            padding: 3px 20px;
            cursor: pointer;
            background-color: rgba(0,0,0,0.05);

            &.active{
                display: inline-block;
            }

            &:hover{
                background-color: rgba(0,0,0,0.1);
            }
        }
    }
    &_send_wrap {
        width: 100%;
        border-top: 0px solid #cccccc;
        z-index: 6;
        min-height: 20px;
        max-height: 140px;
        display: table-row;
        position: relative;

        &:before{
            content: '';
            display: block;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            position: relative;
            width: 100%;
            height: 0;
            top: 0;
            left: 0;
        }
    }
    &_send_input_wrap {
        position: relative;
        height: 100%;
        margin-right: 40px;
    }
    &_send_input {
        width: 100%;
        position: relative;
        outline: none;
        min-height: 18px;
        max-height: 130px;
        height: 100%;
        bottom: 0;
        padding: 10px 0px 10px 40px;
        z-index: 1;
        color: #000000;
        overflow-y: scroll;
        overflow-x: hidden;
        line-height: 18px;
        font-size: 13px;
        word-wrap: break-word;
        white-space: -moz-pre-line;
        white-space: pre-line;
        word-break: break-all;
    }
    &_send_input:not(:empty) ~ &_send_ph {
        display: none;
    }
    &_send_input:focus ~ &_send_ph {
        display: none;
    }
    &_send_ph {
        width: 100%;
        position: absolute;
        height: 20px;
        bottom: 11px;
        padding: 0px 40px;
        color: rgba(0, 0, 0, 0.25);
        -o-transition: color 0.2s ease;
        transition: color 0.2s ease;
    }
    &_send_emoji_box {
        position: absolute;
        width: 200px;
        height: 100px;
        background-color: #fff;
        right: 10px;
        bottom: 40px;
        box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.4);
        -webkit-box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.4);
        padding: 5px;
        z-index: 3;
        display: none;

        &:hover, &.active{
            display: block;
        }
    }
    &_send_emoji {
        position: absolute;
        width: 30px;
        height: 30px;
        bottom: 10px;
        right: 47px;
        cursor: pointer;
        z-index: 2;
        padding: 0;
        /*
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'%3E%3Cpath d='M9 0a9 9 0 1 1 0 18A9 9 0 0 1 9 0zm0 1C4.589 1 1 4.589 1 9s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zM5 6.999a1 1 0 1 1 2.002.004A1 1 0 0 1 5 6.999zm5.999 0a1.002 1.002 0 0 1 2.001 0 1 1 0 1 1-2.001 0zM8.959 13.5c-.086 0-.173-.002-.26-.007-2.44-.132-4.024-2.099-4.09-2.182l-.31-.392.781-.62.312.39c.014.017 1.382 1.703 3.37 1.806 1.306.072 2.61-.554 3.882-1.846l.351-.356.712.702-.35.356c-1.407 1.427-2.886 2.15-4.398 2.15z' fill='%23adadad'  fill-rule='evenodd'%3E%3C/path%3E%3C/svg%3E");
        */
        display: block;
        background-color: transparent;
        border: 0;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        outline: none;

        &_icon {
            background-image: url(/widget/images/emojisprite_0.png);
            outline: none;
            float: left;
            width: 26px;
            height: 26px;
            cursor: pointer;
            padding: 5px 5px;
            border: 0;
            margin-right: 5px;
            background-color: transparent;
            background-repeat: no-repeat;
            background-size: 702px 182px;
            vertical-align: middle;
            display: inline-block;

            &.inside {
                width: 18px;
                height: 18px;
                display: inline-block;
                float: none;
                margin: 0;
                padding: 0;
                background-size: 512px 126px;
                cursor: text;
                pointer-events: none;
            }
        }
    }

    &_send_emoji:hover  ~ &_send_emoji_box{
        display: block;
    }

    &_send_submit {
        position: absolute;
        right: -34px;
        top: 6px;
        width: 30px;
        height: 30px;
        cursor: pointer;
        text-align: center;
        padding: 0px;
        z-index: 2;
        background-color: transparent;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;

        svg{
            width: 30px;
            height: 30px;
    -webkit-transition: width .2s ease;
    -moz-transition: width .2s ease;
    -ms-transition: width .2s ease;
    -o-transition: width .2s ease;
    transition: width .4s ease;
        }
        &.change svg{
          /*
            width: 0px;
            height: 0px;
    -webkit-transition: width .2s ease;
    -moz-transition: width .2s ease;
    -ms-transition: width .2s ease;
    -o-transition: width .2s ease;
    transition: width .4s ease;
    */
        }
    }

    &_message{
        &_item {
            width: 100%;
            padding: 4px 15px 4px 60px;
            position: relative;
            margin-bottom: 15px;

            &:last-child {
                padding-bottom: 20px;
            }
            &:after {
                content: '';
                display: block;
                clear: both;
                float: none;
            }
            &:hover{
                background-color: rgba(0,0,0,0.05);
            }
        }

        &_body {
            padding: 5px 10px 25px;
            min-width: 120px;
            max-width: 100%;
            position: relative;
            font-size: 14px;
            word-wrap: break-word;
            white-space: -moz-pre-line;
            white-space: pre-line;
            word-break: break-all;

            /* arrow
            &:after, &:before {
                top: 15px;
                border: solid transparent;
                content: " ";
                height: 0;
                width: 0;
                position: absolute;
                pointer-events: none;
            }
            */
        }

        &_item.edit &_body{
            box-shadow: 0px 0px 5px 1px #31a900;
        }

        &_out &_body {
            float: right;
            background-color: #0088E0;
            word-wrap: break-word;
            color: #ffffff;
            text-align: right;
        }

        &_in &_body {
            float: left;
            background-color: rgba(0, 0, 0, 0.1);
            word-wrap: break-word;
            color: #333333;
            text-align: left;
        }

        &_out &_bottom {
            text-align: left;
            left: 10px;
        }
        &_in &_bottom {
            text-align: right;
            right: 10px;
        }
        &_bottom {
            position: absolute;
            bottom: 5px;
            font-size: 10px;
        }
        &_bottom:after {
            content: '';
            display: block;
            float: none;
            clear: both;
        }
        &_date {
            display: inline-block;
            color: #505050;
        }
        &_out &_time {
            display: inline-block;
            color: rgba(255, 255, 255, 0.5);
        }
        &_in &_time {
            display: inline-block;
            color: rgba(0, 0, 0, 0.5);
        }

        &_avatar{
            position: absolute;
            width: 30px;
            height: 30px;
            top: 5px;
            left: 20px;
            border-radius: 50%;
            overflow: hidden;

            img{
                width: 100%;
                height: 100%;
                outline: none;
            }
        }
    }
    &_edit_panel {
        position: absolute;
        width: 100%;
        height: 50px;
        background-color: #fff;
        z-index: 10;
        bottom: 0;
        left: 0;
        padding: 10px 20px;
        display: none;

        &.active{
            display: block;
        }

        .k50_btn{
            height: 30px;
            line-height: 1em;
            padding: 0 10px;
            cursor: pointer;
            line-height: 30px;
            display: inline-block;

            &.k50_r{
                float: right;
            }
            &.k50_l{
                float: left;
                margin-right: 6px;
            }
            &.k50_blue{
                background-color: #0088E0;
                color: #fff;
            }
            &.k50_def{
                background-color: #fff;
                color: #0088E0;
            }
        }

        &:after{
            content: '';
            float: none;
            clear: both;
        }
    }
}
</style>
