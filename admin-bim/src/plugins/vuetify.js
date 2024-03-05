import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { Ripple } from 'vuetify/lib/directives'

//import VueZoomer from 'vue-zoomer'

Vue.use(Vuetify, {
  directives: {
    Ripple
  }
})
//Vue.use(VueZoomer)

export default new Vuetify({
    icons: {
        iconfont: 'mdi',
    },
})
