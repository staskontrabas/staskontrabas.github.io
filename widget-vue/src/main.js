import Vue from 'vue'
import Widget from './widget.vue'
import store from './store'

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(Widget)
}).$mount('#app')
