import router from '@/router'
import { http, api } from '@/utils/define'

const localstorage = {
    auth: localStorage.getItem('user-auth') ? JSON.parse(localStorage.getItem('user-auth')) : false,
    props: localStorage.getItem('user-props') ? JSON.parse(localStorage.getItem('user-props')) : false,
}

const hostKeys = Object.keys(http)
let host = !localstorage.auth ? hostKeys[0]
    : !hostKeys.filter(item => localstorage.auth.host == item).length ? hostKeys[0]
    : localstorage.auth.host

const state = {
    login: '',
    username: '',
    password: '',
    authorized: false,
    host: host,
    locale: localstorage.auth ? localstorage.auth.locale : 'ru',
    user: localstorage.props ? localstorage.props : {code: 0},
    status: {
      loggingIn: false
    },
    error_login: false
}

const mutations = {
    setUsername(state, payload){
        state.username = payload.username
    },
    setPass(state, payload){
        state.password = payload.password
    },
    setHost(state, payload){
        state.host = payload.id
    },
    setLocal(state, payload){
        state.locale = payload.id
    },
    loginRequest(state, user) {
        state.status = { loggingIn: true }
        state.username = user
    },
    loginSuccess(state, user) {
        state.status = { loggedIn: true }
        state.authorized = true
        state.user = user
    },
    loginFailure(state) {
        state.status = {}
        state.user = {code: 0}
        state.authorized = false
    },
    errorLogin(state, payload){
        state.error_login = payload.status
    },
    logout(state){
        state.username = ''
        state.password = ''
        state.status = {}
        state.user = {code: 0}
        state.authorized = false
    },
    error(state, message) {
        state.type = 'alert-danger'
        state.message = message
    }
}

const  actions = {
    login({commit, state, rootState}){//, {username, password}) {
        //commit('loginRequest', {username})
        if(!(state.username && state.password))
            return

        api.post(http[rootState.auth.host], api['login'],
            {"login": state.username, "password": state.password, "time": new Date().getTime()})
        .then(user => {
            commit('loginSuccess', user)
            localStorage.setItem('user-auth', JSON.stringify({
                host: state.host,
                locale: state.locale
            }))
            localStorage.setItem('user-props', JSON.stringify(user))
            return user
        },
        error => {
            commit('loginFailure', error)
            //dispatch('error', error, { root: true })
            return error
        })
        .then(user => {
            if(user.hasOwnProperty('code')){
                commit('loginFailure')
                commit('errorLogin', {status: true})
            }
            else{
                commit('errorLogin', {status: false})
                router.push({name: 'menu'})
            }
        })
    },
    logout({commit, rootState}){
        api.post(http[rootState.auth.host], api['logout'], {})
        .then(() => {
            localStorage.removeItem('user-props')
            commit('logout')
        })
        .then(() => {
            router.push({name: 'login'})
        })
    },
    logcheck({rootState}){
        return new Promise(resolve => {
            api.get(http[rootState.auth.host], api['logcheck'], {})
            .then(res => {
                resolve(res)
            })
        })
    },
    setLocal({commit}, payload){
        let lstore = JSON.parse(localStorage.getItem('user-auth'))
        localStorage.setItem('user-auth', JSON.stringify({
            host: lstore.host,
            locale: payload.id
        }))
        commit('setLocal', payload)
    },
    error({commit}, message) {
        commit('error', message)
    },
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
