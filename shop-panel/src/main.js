import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "@/assets/css/index.css"
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
// import '@mathieustan/vue-datepicker/dist/vue-datepicker.min.css';
import 'vue-slider-component/lib/theme/default.scss';

import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import PrimeVue from 'primevue/config'

Vue.use(PrimeVue)
Vue.component('Dialog', Dialog)
Vue.component('Dropdown', Dropdown)

Vue.config.productionTip = false

new Vue({
    PrimeVue,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
