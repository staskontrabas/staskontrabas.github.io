<template>
  <div v-show="tab == 'w-callback'">
    <div class="k50_callback_container">
      <div class="k50_callback_content">
        <div class="k50_widget_desc">{{ desc }}</div>
        <WgtField v-for="(field, index) in fields"
          v-bind:field="field"
          v-bind:index="index"
          v-bind:key="index" />
        <WgtButton :ar="['name', 'phone']" :sended="sended" @confirm="confirm"/>
        <WgtConfirm :active="sended" @confirm="confirm"/>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import WgtField from '@/components/common/WgtField.vue'
  import WgtButton from '@/components/common/WgtButton.vue'
  import WgtConfirm from '@/components/common/WgtConfirm.vue'

  export default {
    name: 'WgtCallback',
    components: {
      WgtField,
      WgtButton,
      WgtConfirm
    },
    data: function(){
      return {
        desc: 'Спецусловия на покупку жилья. Оставьте свой номер и мы перезвоним вам',
        sended: false,
        fields: [
          {
            label: 'имя',
            type: 'text',
            typefield: 'input',
            name: 'name'
          },
          {
            label: 'телефон',
            type: 'tel',
            typefield: 'input',
            name: 'phone'
          }
        ]
      }
    },
    methods: {
      confirm: function(sended){
        this.sended = sended
      }
    },
    computed: mapState({
      tab: function(state){
        return state.panel.name
      }
    })
  }
</script>

<style lang="less">
.k50_callback{
    display: none;
    padding-bottom: 50px;

    &_container{
        padding: 30px 20px 20px;
        height: 100%;
    }

    &_span{
        padding-bottom: 20px;
        color: rgba(0,0,0,0.5);
        font-size: 13px;
        line-height: 18px;
    }

    &.active{
        display: block;
    }

    &_timer {
        position: absolute;
        top: -50px;
        left: 0;
        background-color: #f0f0f0;
        z-index: 3;
        padding: 20px;
        width: 100%;
        height: ~'calc(100% + 50px)';
        text-align: center;
        display: none;

        &.active{
            display: block;
        }

        &:before {
            content: '';
            display: inline-block;
            height: 100%;
            vertical-align: middle;
        }

        &_box {
            display: inline-block;
            text-align: center;
            vertical-align: middle;
        }

        &_desc {
            color: #333333;
            font-size: 13px;
            margin-bottom: 20px;
        }

        &_item {
            font-size: 24px;
            color: #000000;
            top: -21px;
            position: relative;
        }
        &_btn {
            background-color: #0088E0;
            color: #fff;
            font-size: 13px;
            width: 120px;
            height: 40px;
            display: block;
            line-height: 40px;
            text-align: center;
            cursor: pointer;
            margin: 30px auto 0;
        }
    }
}
</style>
