import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VTooltip from 'v-tooltip'
import i18n from './i18n'
import "@/assets/less/index.less"
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

Vue.use(VTooltip)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
