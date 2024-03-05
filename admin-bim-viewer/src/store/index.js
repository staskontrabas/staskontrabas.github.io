import { http, api } from '@/utils/define'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
    },
    mutations: {
    },
    actions: {
        getFile({commit}, payload){
            let token = payload.token
            let typeBlob = payload.typeBlob

            return new Promise((resolve, reject) => {
                api.get(http['cloud'], api['getfile'] + payload.url, {}, {
                    authorization: 'Bearer ' + token,
                }, typeBlob)
                .then(res => {
                    resolve({id: payload.id, file: res})
                },
                    er => {
                        reject({id: payload.id, file: false})
                    }
                )
            })
        },
        getBackgroundId({commit}, payload){
            let token = payload.token
            const coord = payload.coord
            return new Promise((resolve, reject) => {
                api.post(http['cloud'], api['background'], coord, {
                    authorization: 'Bearer ' + token,
                }, 'POST')
                .then(res => {
                    resolve(res)
                },
                    er => {
                        reject(er)
                    }
                )
            })
        },
        getBackground({commit}, payload){
            const token = payload.token
            const url = '/' + payload.url || ''
            const typeBlob = payload.typeBlob || null

            return new Promise((resolve, reject) => {
                api.get(http['cloud'], api['background'] + url, {},
                {
                    authorization: 'Bearer ' + token,
                }, typeBlob)
                .then(res => {
                    resolve(res)
                },
                    er => {
                        reject(er)
                    }
                )
            })
        },
        getCollisions({commit}, payload){
            let token = payload.token
            let url = payload.url || ''

            return new Promise((resolve, reject) => {
                api.post(http['cloud'], api['getcollisions'] + url, {
                    files: payload.files
                }, {
                    authorization: 'Bearer ' + token,
                }, 'POST')
                .then(res => {
                    resolve(res)
                },
                    er => {
                        reject(er)
                    }
                )
            })
        },
        getCollisionsJson({commit}, payload){
            let token = payload.token

            return new Promise((resolve, reject) => {
                api.get(http['cloud'], api['getcollisions'] + payload.url, {}, {
                    authorization: 'Bearer ' + token,
                }, 'blob')
                .then(res => {
                    resolve({id: payload.id, file: res})
                },
                    er => {
                        reject(er)
                    }
                )
            })
        },
    }
})
