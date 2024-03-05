import router from '@/router'
import { http, api } from '@/utils/define'

const state = {
    login: '',
    error_login: false,
    id_token: '',
    framer: {
        active: false,
        src: ''
    },
    access_token: false,
    admin_token: 'a81935fe0411eb630e6b7435a7ee5b2f40c1c85bd561eb76fc000967a08aa921',
    invite: false,

    token_state: '',
    token: '',
    expiry: '',
    refresh_token: '',
    token_type: '',
    //initPath: {},
    invite_code: false
}

const mutations = {
    errorLogin(state, payload){
        state.error_login = payload.status
    },
    error(state, message) {
        state.type = 'alert-danger'
        state.message = message
    },
    setTokenId(state, payload){
        state.id_token = payload.id_token
        state.access_token = payload.access_token
    },
    framer(state, payload){
        state.framer = {
            active: true,
            src: payload.src
        }
    },
    setTokenState(state, payload){
        state.token_state = payload.state
    },
    setToken(state, payload){
        state.id_token = payload.id_token
        state.token = payload.access_token
        state.access_token = payload.access_token
        state.expiry = payload.expiry
        state.refresh_token = payload.refresh_token
        state.token_type = payload.token_type
    },
    /*
    rememberRouter(state, router){
        state.initPath = router
    },
    */
    setInviteCode(state, payload){
        state.invite_code = payload
    }
}

const actions = {
    getCodeForToken({commit, dispatch}){
        return new Promise((resolve) => {
            api.get(http['account_stas'], api['pretoken'])
            .then(res => {
                localStorage.setItem('state', JSON.stringify({
                    state: res.state,
                    path: router.currentRoute.path,
                    url: router.currentRoute.fullPath
                }))

                window.location.href = res.redirect_url
                return true
            })
        })
    },
    logout({state, commit}){
        localStorage.removeItem('token')
        window.location.href = http['login'] + api['logout'] + '?id_token_hint=' + state.id_token
    },

    framer({commit}){
        commit('framer', {src: 'https://prodoc.ubdev.ru/api/v1/oauth2/auth'})
    },
    setTokenId({state, dispatch, commit}, payload){
        commit('setToken', payload)

        return new Promise(resolve => {
            dispatch('administration/getUser', null, { root: true })
            .then(res => {
                if(!res || !res.length){
                }
                let localState = JSON.parse(localStorage.getItem('state'))
                resolve(true)
            })
        })
    },
    token({commit}, payload){
        console.log('////  token')
        return new Promise((resolve) => {
            api.get(http['account_stas'], api['token'], payload)
            .then(res => {
                localStorage.setItem('token', JSON.stringify({
                        refresh_token: res.refresh_token
                }))
                commit('setToken', res)
                resolve(res)
            })
        })
    },
    refresh({state, commit}, payload){
        let tokenState = JSON.parse(localStorage.getItem('token')) || {refresh_token: false}
        let refresh_token = state.refresh_token
            || tokenState.refresh_token
            || false

        if(refresh_token){
            return new Promise((resolve) => {
                api.post(http['account_stas'], api['refresh'], {
                    refresh_token: refresh_token
                })
                .then(res => {
                    localStorage.setItem('token', JSON.stringify(res))
                    commit('setToken', res)
                    resolve(res)
                    },
                    er => {
                        console.log('error refresh_token_',er)
                        resolve(false)
                    }
                )
            })
        }
        else{
            return false
        }
    },
    checkInvite({rootState, commit, dispatch}, code){
        let token = rootState.auth.access_token ? rootState.auth.access_token : ''
        return new Promise((resolve, reject) => {

            api.get(http['account_stas'], api['invite'], {code: code.code}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                let status = res.status || false

                if(status){
                    if(status == -1){
                        window.location.href = res.register_url
                            + '&email=' + res.email
                            + '&company=' + res.company.name
                            + '&redirect_url=' + http['server'] +
                                    code.redirect_url
                    }
                    else if(status == 200){
                        //resolve(res)
                        let params = {
                            code: code.code,
                            answer: 'allow'
                        }
                        //let user = rootState.administration.user || false
                        //let email = user.email || false

                        resolve(dispatch('confirmInvite', params))
                    }
                    else{
                        console.log('Неизвестная ошибка.. [status]')
                        resolve(false)
                    }
                }
                else{
                    console.log('Неизвестная ошибка.. [status = false]')
                    resolve(false)
                }
            },
                er => {
                    return dispatch('toLoginAfterRegistration')
            })
        })
    },
    toLoginAfterRegistration({commit}){
        api.get(http['account_stas'], api['invite_redirect'])
        .then(res => {
    /*
            localStorage.setItem('state', JSON.stringify({
                state: res.state,
                path: router.currentRoute.path,
                url: router.currentRoute.fullPath
            }))
            */
            window.location.href = res.redirect_url
        })
    },
    confirmInvite({rootState, commit}, confirm){
        let token = rootState.auth.access_token
        return new Promise((resolve) => {
            api.post(http['account_stas'], api['invite_confirm'], confirm, {
                authorization: 'Bearer ' + token
            }, 'POST')
            .then(res => {
                resolve(res)
            },
                er => {
                    console.log('invite confirm error', er)
            })
        })
    },
    restore({commit}, payload){
        let restore = {status: false, params: {}}
        return new Promise((resolve) => {
            api.post(http['login'], api['restore'], payload)
            .then(() => {
                restore.status = true
                resolve(restore)
            },
            er => {
                restore.params = Object.assign({}, er)
                resolve(restore)
            })
        })
    },
    logcheck({rootState, state}){
      return new Promise(resolve => {
          resolve({status: state.authorized})
      })
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
