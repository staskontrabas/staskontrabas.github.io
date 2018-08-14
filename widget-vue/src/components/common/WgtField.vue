<template>
  <div v-bind:class="className">
    <div class="k50_input_label">{{field.label}}</div>
    <input class="k50_input"
            v-if="field.typefield == 'input'"
            v-model="val"
            @focus="maskInit"
            @blur="maskClear"
            :type="field.type">
    <textarea class="k50_textarea"
            v-if="field.typefield == 'textarea'"
            v-model="val"/>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'WgtField',
    props: ['field'],
    computed: {
      val: {
        get(){
          return this.$store.state.user[this.field.name]
        },
        set(value){
          this.$store.dispatch('fieldChange', {[this.field.name]: this.field.type == 'tel' ? this.maskChecker(value) : value})
        }
      },
      className: function(){
        return "k50_widget_row k50_widget_" + this.field.typefield
      }

    },
    methods: {
      maskChecker:
          function(v){
              const mask = '+7(___)-___-__-__';
              const maskParts = mask.match(/(_)+/g);
              let regExParts = '';

              for(let i = 0; i < maskParts.length; i++){
                  regExParts += '([0-9]{0,' + maskParts[i].length + '})';
              }

              const regexpPattern = new RegExp(regExParts);
                  const x = v.replace(/(\+\d+|\D)/g, '').match(regexpPattern);
                  const emptyValues = v.match(/(_)+$/g);
                  const value = '+7 (' + (x[1] ? x[1] :'')  + (x[2] ? ') ' + x[2] : '') + (x[3] ? '-' + x[3] : '') + (x[4] ? '-' + x[4] :'') ;
              return value;
           },
      maskInit:
          function(){
            if(this.field.name != 'phone') return true
            const phone = this.$store.state.user.phone
            if(!phone || phone == ''){
                const value = '+7 ('
                this.$store.dispatch('fieldChange', {phone: value})
            }
          },
      maskClear:
          function(o){
            if(this.field.name != 'phone') return true
            const phone = this.$store.state.user.phone
            if(phone == '+7 ('){
              this.$store.dispatch('fieldChange', {phone: ''})
            }
          }
    }
  }
</script>

<style lang="less">
</style>
