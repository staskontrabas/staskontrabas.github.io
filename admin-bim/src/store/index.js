import Vue from 'vue'
import Vuex from 'vuex'
import common from './modules/common'
import auth from './modules/auth'
import comments from './modules/comments'
import workflow from './modules/workflow'
import administration from './modules/administration'
import toolbar from './modules/toolbar'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        common,
        auth,
        comments,
        workflow,
        administration,
        toolbar
    }
})
