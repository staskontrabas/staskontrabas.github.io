import Vue from 'vue'
import Vuex from 'vuex'
import common from './modules/common'
import auth from './modules/auth'
import menu from './modules/menu'
import stock from './modules/stock'
import expenses from './modules/expenses'
import operations from './modules/operations'
import orders from './modules/orders'
import statistics from './modules/statistics'
import settings from './modules/settings'
import serv from './modules/serv'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        common,
        auth,
        menu,
        stock,
        expenses,
        operations,
        orders,
        statistics,
        settings,
        serv
    }
})
