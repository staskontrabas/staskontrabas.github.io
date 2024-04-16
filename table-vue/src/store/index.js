import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    cities: [],
    jsondb: []
  },
  mutations: {
    setCities(state, pld){
      state.cities = pld
    },
    setJson(state, pld){
      state.jsondb = pld
    }
  },
  actions: {
    setCities({state, commit}, pld){
      return new Promise((resolve) => {
        resolve(commit('setCities', [...pld, ...state.cities]))
      })
    },
    setJson({state, commit}, pld){
      return new Promise((resolve) => {
        resolve(commit('setJson', pld))
      })
    }
  }
})
