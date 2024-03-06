import { http, api } from '@/utils/define'
import API from '@/utils/api/'
import { sortObj } from '@/utils/services'

const state = {
    countries: [],
    regions: [],
    uploadFileNames: [],
    uploadFileMap: {},
    meta: {}
}

const mutations = {
    setCountries(state, payload){
        state.countries = payload
    },
    setRegions(state, payload){
        state.regions = payload
    },
    setUploadNote(state, list){
        state.uploadFileNames = [...list]
    },
    setUploadMap(state, map){
        state.uploadFileMap = map
    },
    setMeta(state, meta){
        state.meta = meta
    }
}
const actions = {
    getFileMeta({rootState, state, commit}, pld){
        let token = rootState.auth.access_token
        const uuid = rootState.workflow.activeProject.id
        const type_id = 'c'
        const id = rootState.administration.company.id
        let params = type_id + '/' + id + '/' + uuid + '/attachment/' + pld.id + '/meta'
        return new Promise((resolve) => {
            api.get(http['cloud'], api['projects'] + params, {}, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                let meta = JSON.parse(res)
                if(meta){
                    if(meta.collisions){
                        commit('setMeta', meta)
                    }
                }
                resolve(res)
            },
                er => {
                    resolve({...er, error: true})
                }
            )
            .catch(er => {
                resolve({...er, error: true})
            })
        })
    },
    setFileMeta({rootState, state, commit}, pld){
        let token = rootState.auth.access_token
        const uuid = rootState.workflow.activeProject.id
        const type_id = 'c'
        const id = rootState.administration.company.id
        let params = type_id + '/' + id + '/' + uuid + '/attachment/' + pld.id + '/meta'
        return new Promise((resolve) => {
            api.post(http['cloud'], api['projects'] + params, pld.body, {
                authorization: 'Bearer ' + token,
            }, 'PUT')
            .then(res => {
                resolve(res)
            },
                er => {
                    resolve({...er, error: true})
                }
            )
            .catch(er => {
                resolve({...er, error: true})
            })
        })
    },
    getJsonXml({rootState, commit}){
        let token = rootState.auth.access_token

        return new Promise((resolve, reject) => {
            api.get(http['doc_xml'], '/public/doc.json', {}, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    reject(er)
                }
            )
        })
    },
    getFileInfo({rootState, commit}, payload){
        let token = rootState.auth.access_token

        return new Promise((resolve, reject) => {
            api.get(http['cloud'], api['getfile'] + payload.id, {}, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    reject(er)
                }
            )
        })
    },
    getCountries({rootState, commit}){
        let token = rootState.auth.access_token

        api.get(http['account'], api['countries'], {}, {
            authorization: 'Bearer ' + token
        })
        .then(res => {
            commit('setCountries', sortObj(res, 'name'))
        })
    },
    getRegions({rootState, commit}, payload){
        if(!payload){
            commit('setRegions', [])
        }
        else{
            let token = rootState.auth.access_token
            let path = '/' + payload.id + '/regions'

            api.get(http['account'], api['regions'] + path, {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                commit('setRegions', sortObj(res, 'name'))
            })
        }
    },
    setUploadNote({state, commit}, fileList){
        let list = JSON.parse(JSON.stringify(state.uploadFileNames))
        let map = state.uploadFileMap

        return new Promise((resolve) => {
            fileList = fileList.map(l => {
                if(l.pushin){
                    list = [{
                            name: l.name,
                            uuid: l.uuid,
                            action: l.action
                        },
                        ...list
                    ]
                    let c = new AbortController()
                    map = {...map, [l.uuid]: c}
                }
                else{
                    list = list.filter(n => n.uuid != l.uuid)
                    map = Object.fromEntries((Object.entries(map)
                        .filter(([k, v]) => k != l.uuid)))
                }
                return l
            })
            resolve(commit('setUploadNote', list), commit('setUploadMap', map))
        })
    },
    abortFetch({state, dispatch}, {uuid}){
        let map = state.uploadFileMap
        map[uuid].abort()
        dispatch('setUploadNote', [{
            uuid: uuid,
            pushin: false
        }])
    },
    uploadFile({rootState, state, dispatch}, payload){
        let token = rootState.auth.access_token
        payload.append('company_id', rootState.administration.company.id)
        let signal = state.uploadFileMap[payload.get('uuid')].signal

        return api.post(http['cloud'], api['upload'], payload, {
            authorization: 'Bearer ' + token,
            'content-type': false
        }, 'POST', signal)
        .then(res => {
            return {...res, uuid: payload.get('uuid')}
        })
        .catch(err => {
            return {
                name: payload.get('name'),
                uuid: payload.get('uuid'),
                error: err
            }
        })
    },
    importXml({rootState, state, dispatch}, payload){
        let token = rootState.auth.access_token
        payload.append('company_id', rootState.administration.company.id)
        let signal = state.uploadFileMap[payload.get('uuid')].signal

        return api.post(http['cloud'], api['upload_xml'], payload, {
            authorization: 'Bearer ' + token,
            'content-type': false
        }, 'POST', signal)
        .then(res => {
            return {...res, uuid: payload.get('uuid')}
        })
        .catch(err => {
            return {
                name: payload.get('name'),
                uuid: payload.get('uuid'),
                error: err
            }
        })
    },
    checkImportXml({rootState, dispatch}, payload){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.get(http['cloud'], api['upload_xml'], {
                id: payload.task_id
            }, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    console.log('check create_xml er', er)
                    resolve(er)
                }
            )
        })
    },
    sendClassError({rootState, state, dispatch}, body){
        let token = rootState.auth.access_token

        return api.post(http['cloud'], api['class_error'], body, {
            authorization: 'Bearer ' + token,
        }, 'POST')
        .then(res => {
            return res
        })
        .catch(err => {
            return err
        })
    },
    getFile({rootState, dispatch, commit}, payload){
        let token = rootState.auth.access_token
        let typeBlob = payload.typeBlob || 'url'
        let signal = payload.uuid
            ? state.uploadFileMap[payload.uuid].signal
            : false

        return new Promise((resolve, reject) => {
            api.get(http['cloud'], api['getfile'] + payload.id, {}, {
                authorization: 'Bearer ' + token,
            }, typeBlob, {signal})
            .then(res => {
                resolve({id: payload.id, file: res, uuid: payload.uuid})
            })
            .catch(err => {
                if(err.name === 'AbortError'){
                    dispatch('setUploadNote', {
                        uuid: payload.uuid,
                        action: 'download',
                        pushin: false
                    })
                }
                return {
                    uuid: payload.uuid,
                    error: err
                }
            })
        })
    },
    async getFileDelta({rootState, dispatch, commit}, file_id){
        const api_ = new API(rootState.auth.access_token)
        return await api_.getFileDelta(file_id)
    }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
