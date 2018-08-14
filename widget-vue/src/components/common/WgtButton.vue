<template>
  <div class="k50_widget_button"
    v-bind:class="{'active': classActive}"
    @click="send">Отправить</div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'WgtButton',
    props: ['ar', 'sended'],
    computed: mapState({
      classActive: function(state){
        let ready = true
        for(let i = 0, len = this.ar.length; i < len; i++){
          if(this.ar[i] == 'phone'){
            if(state.user.phone.length < 18){
              ready = false
              break
            }
          }
          else{
            if(!state.user[this.ar[i]].length){
              ready = false
              break
            }
          }
        }
        return ready
      }
    }),
    methods: {
      send: function(){
        this.$emit('confirm', !this.sended)
      }
    }
  }
</script>
