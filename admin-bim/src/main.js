import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import Notifications from 'vue-notification'
import ElementUI from 'element-ui'
import locale_ru from 'element-ui/lib/locale/lang/ru-RU.js'
import 'element-ui/lib/theme-chalk/index.css'

import { http } from './utils/define'

import VueDraggable from 'vue-draggable'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import "@/assets/less/index.less"
import "@/assets/element/index.scss"
import { I18n } from 'i18n'



Vue.config.productionTip = false
Vue.prototype.$url = http.server
Vue.prototype.$urllocal = http.local

Vue.use(Notifications)
Vue.use(VueDraggable)
Vue.use(ElementUI , { locale: locale_ru })


new Vue({
    router,
    store,
    vuetify,
    ElementUI,
    render: h => h(App)
}).$mount('#app')
