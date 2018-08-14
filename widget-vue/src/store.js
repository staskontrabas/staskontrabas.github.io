import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: false,
    panel: {
      name: '',
      title: ''
    },
    user: {
      name: '',
      phone: '',
      message: '',
      email: ''
    },
    msgstack: '',
    msgs: []
  },
  actions: {
      openStatus({commit}) {
        commit('OPEN_STATUS')
      },
      closeStatus({commit}) {
        commit('CLOSE_STATUS', {name: '', title: ''})
      },
      selectTab({commit}, payload){
        commit('SELECT_TAB', payload)
      },
      defaultTab({commit}){
        commit('SELECT_TAB', {name: '', title: ''})
      },
      fieldChange({commit}, payload){
        commit('FIELD_CHANGE', payload)
      },
      sendmessage({commit}, payload){
        let date = new Date()
        date = date.getHours() + ':' + date.getMinutes()
        payload = {type: 'out', value: payload, time: date}
        commit('SEND_MESSAGE', payload)
      }
  },
  mutations: {
      OPEN_STATUS(state, payload) {
        state.status = true
      },
      CLOSE_STATUS(state, payload) {
        state.status = false
        state.panel = Object.assign({}, state.panel, payload)
      },
      SELECT_TAB(state, payload) {
        state.panel = Object.assign({}, state.panel, payload)
      },
      FIELD_CHANGE(state, payload) {
        state.user = Object.assign({}, state.user, payload)
      },
      SEND_MESSAGE(state, payload) {
        state.msgs.push(payload)
      }
  }
})
