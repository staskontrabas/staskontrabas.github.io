<template>
  <div class="k50_confirm" v-bind:class="{'active': active}">
    <div class="k50_confirm_box">
      <div class="k50_confirm_desc">Ваша заявка на обратный звонок получена.</div>
      <div class="k50_confirm_desc">Мы перезвоним вам как можно скорее.</div>
      <div class="k50_confirm_btn" @click="onClick">ОК</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'WgtConfirm',
    props: ['active'],
    methods: {
      onClick: function(){
        this.$emit('confirm', !this.active)
      }
    }
  }
</script>

<style lang="less">
.k50_confirm {
  position: absolute;
  top: -50px;
  left: 0;
  background-color: #f0f0f0;
  z-index: 3;
  padding: 20px;
  width: 100%;
  height: calc(100% + 50px);
  text-align: center;
  display: none;

  &.active {
    display: block;
  }

  &:before {
    content: '';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }

  &_box{
    display: inline-block;
    text-align: center;
    vertical-align: middle;
  }
  &_desc {
    color: #333333;
    font-size: 13px;
    margin-bottom: 20px;
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
</style>
