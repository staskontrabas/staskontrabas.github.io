import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        constanta: 1000,
        list: [{
            value: 0,
            title: 'Контрол 1',
            ctrl: 'ctrl1',
            callback: 'sum',
            btn: 'Сумма',
            active: false
        },{
            value: 0,
            title: 'Контрол 2',
            ctrl: 'ctrl2',
            callback: 'constanta',
            btn: 'Константа',
            active: false
        },{
            value: 0,
            title: 'Контрол 3',
            ctrl: 'ctrl3',
            btn: false,
            active: false
        }]
    },
    mutations: {
        setValue(state, payload){
            state.list = state.list.map(item => item.ctrl == payload.ctrl ? Object.assign(item, {value: payload.value}) : item)
        },
        setActive(state, payload){
            state.list = state.list.map(item => item.ctrl == payload.ctrl ? Object.assign(item, {active: payload.active}) : item)
        },
        setSum(state, payload){
            state.list = state.list.map(item => item.ctrl == 'ctrl1' ? Object.assign(item, {value: payload.value}) : item)
        },
        constanta(state, payload){
            state.list = state.list.map(item => item.ctrl != 'ctrl1' ? Object.assign(item, {value: state.constanta}) : item)
        }
    },
    actions: {
        setActive({commit}, payload){
            commit('setActive', payload)
        },
        setValue({commit}, payload){
            if(parseInt(payload.item.value) < 0){
                commit('setValue', {ctrl: payload.item.ctrl, value: 0})
                return
            }
            if(payload.item.ctrl != 'ctrl1'){
                if(!(payload.value === '' && payload.item.ctrl == 'ctrl3')){
                    commit('setValue', {ctrl: 'ctrl2', value: payload.value})
                }
                if(!(payload.value === '' && payload.item.ctrl == 'ctrl2')){
                    commit('setValue', {ctrl: 'ctrl3', value: payload.value})
                }
            }
            else{
                commit('setValue', {ctrl: payload.item.ctrl, value: payload.value})
            }

        },
        sum({commit, state}){
            let sum = 0
            state.list.map(item => {
                if(item.ctrl != 'ctrl1'){
                    sum += parseInt(item.value)
                }
            })
            commit('setSum', {value: sum})
        },
        constanta({commit}){
            commit('constanta')
        },
        tabActive({state}, p){
            return new Promise(resolve => {
                let ind = 0
                state.list.map((item, j) => {
                    if(p.item.ctrl == item.ctrl){
                        ind = j
                    }
                })
                if(p.dir){
                    if(ind == state.list.length - 1){
                        ind = 0
                    }
                    else{
                        ind++
                    }
                }
                else{
                    if(!ind){
                        ind = state.list.length - 1
                    }
                    else{
                        ind--
                    }
                }
                resolve(Object.assign({}, state.list.filter((item, j) => j == ind)[0]))
            })
        }
    }
})
