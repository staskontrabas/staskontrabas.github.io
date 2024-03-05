import { http, api } from '@/utils/define'
import { createAvatarChar, setPermission } from '@/utils/services'

const state = {
    configLicense: {
        collisions: {code: 23, type: 'RouteUserInt'},
        size2000: {code: 23, type: 'RouteUserInt'},
        errorKSI: {code: 23, type: 'RouteUserInt'},
        size2000: {code: 22, type: 'RouteUserPro'},
        consolidation: {code: 22, type: 'RouteUserPro'},
        commentsPDF: {code: 21, type: 'RouteUserBase'},
        tasksPDF: {code: 21, type: 'RouteUserBase'},
        size2000: {code: 21, type: 'RouteUserBase'},
        editRVT: {code: 21, type: 'RouteUserBase'},
        size20: {code: 20, type: 'RouteUserStart'},
    },
    licenseList: [],
    currentLicense: null,
    userAvatar: {
        type: 'default',
        src: '',
        avatar: ''
    },
    companyLogo: {
        type: 'default',
        src: '',
        avatar: ''
    },
    existUser: false,
    user: {
        "id": 0,
        "company": 0,
        "role": '0',
        "type_id": '',
        "country_id": null,
        "region_id": null,
        "city": "",
        "address": "",
        "post_code": "",
        "profession": "",
        "position": "",
        "department": "",
        "university": "",
        "avatar": "",
        "is_deleted": 0,
        "type": "",
        "country": "",
        "region": "",
        "email": "",
        "first_name": "",
        "middle_name": "",
        "last_name": "",
        "gender": "",
        "birth_day": 0,
        "status": 0
    },
    company: {
        "id": 0,
        "name": "",
        "official_name": "",
        "inn": "",
        "kpp": "",
        "ogrn": "",
        "country_id": null,
        "region_id": null,
        "city": "",
        "address": "",
        "post_code": "",
        "logo": "",
        "is_deleted": 0,
        "owner": 0,
        "country": "",
        "region": ""
    },
    history_limit: 3,
    invited: []
}

const mutations = {
    setConfig(state, payload){
        state.configLicense = payload
    },
    setLicense(state, payload){
        state.licenseList = payload
    },
    setCurrentLicense(state, payload){
        state.currentLicense = payload
    },
    existUser(state, payload){
        state.existUser = payload
    },
    setUser(state, payload){
        let user = JSON.parse(JSON.stringify(payload))
        state.user = {...state.user, ...user}
    },
    setUserPermissions(state, payload) {
        // console.log('setting user perm', payload)
        let user = {} 
        user.permissions = JSON.parse(JSON.stringify(payload))
        state.user = {...state.user, ...user}
    },
    setCompany(state, payload){
        let c = JSON.parse(JSON.stringify(payload))
        state.company = {...state.company, ...c}
    },
    setAvatar(state, payload){
        state[payload.name].type = payload.type
        state[payload.name].src = payload.value
        state[payload.name].avatar = payload.avatar
    },
    invited(state, list){
        state.invited = list
    },
    setHistoryLimit(state, limit){
        state.history_limit = limit
    },
}

const actions = {
    getHistoryLimit({rootState, commit}){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.get(http['project'], api['history_limit'], {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                commit('setHistoryLimit', res.history_limit)
                resolve(res.history_limit)
            })
        })
    },
    setHistoryLimit({rootState, commit}, limit){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.post(http['project'], api['history_limit'], {history_limit: limit}, {
                authorization: 'Bearer ' + token
            }, 'PUT')
            .then(res => {
                commit('setHistoryLimit', res.history_limit)
                resolve(res.history_limit)
            })
        })
    },
    defaultAvatar({commit}, payload){
        let char = payload.str ? payload.str.charAt(0) : "U"
        let size = 150
        let fontSize = 90
        let avatar = createAvatarChar(char, size, fontSize)
        let avatarSmall = createAvatarChar(char)

        commit('setAvatar', {name: payload.name, type: 'default', value: avatar, avatar: avatarSmall})
    },
    addUser({rootState, commit, dispatch}){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.post(http['account'], api['account_user'], {}, {
                authorization: 'Bearer ' + token
            }, 'PUT')
            .then(res => {
                commit('setUser', res)
                dispatch('defaultAvatar', {name: 'userAvatar', str: res.first_name})
                dispatch('getConfig')
                dispatch('getLicense')
                return dispatch('setCompany', null)
            })
            .then(res => {
                resolve(res)
            })
        })
    },
    getUser({rootState, commit, dispatch, state}){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.get(http['account'], api['account_user'], {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                
                res.id = res.id + ''

                dispatch('getAllCurrentUserPermissions')
                .then(() => {
                    commit('setUser', res)
                })
                

                let avatar = res.avatar || false

                if(avatar && (avatar.indexOf('data') == -1) && avatar.indexOf('blob') == -1){
                    dispatch('common/getFile', {id: avatar}, {root: true})
                    .then(res => {
                        commit('setAvatar', {name: 'userAvatar', type: 'file', value: res.file, avatar: res.file})
                    },
                        er => {
                            console.log(er)
                        }
                    )
                }
                else{
                    dispatch('defaultAvatar', {name: 'userAvatar', str: res.first_name})
                }

                dispatch('getCompany')
                .then(res => {
                    resolve(res)
                })
            },
                er => {
                    console.log('er',er)
                    if(er.status == 404) {
                        dispatch('addUser')
                        .then(res => {
                            resolve(res)
                        })
                        .then(res => {
                            // TODO: костыль. Перезагружает страницу после первого логина пользователя для корректной установки данных пользователя & компании. 
                            // Необходим рефактор процедуры установки $store.state.
                            // Возможно, потребуется переставить после dispatch('addUser')
                            location.reload()
                        })
                    }
            })
        })
    },
    setCompany({rootState, commit, dispatch}, payload){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.post(http['account'], api['account_company'], {}, {
                authorization: 'Bearer ' + token
            }, 'PUT')
            .then(res => {
                commit('setCompany', res)
                dispatch('defaultAvatar', {name: 'companyLogo', str: ''})
                commit('existUser', true)

                resolve(res)
            })
        })
    },
    getCompany({rootState, state, commit, dispatch}){
        let token = rootState.auth.access_token
        return new Promise((resolve) => {
            api.get(http['account'], api['account_company'], {with_users: true}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                let logo = res.logo || false

                if(logo && (logo.indexOf('data') == -1) && logo.indexOf('blob') == -1){
                    dispatch('common/getFile', {id: logo}, {root: true})
                    .then(res => {
                        commit('setAvatar', {name: 'companyLogo', type: 'file', value: res.file, avatar: res.file})
                    })
                    .catch(e => {
                        dispatch('defaultAvatar', {name: 'companyLogo', str: res.name})
                    })
                }
                else{
                    dispatch('defaultAvatar', {name: 'companyLogo', str: res.name})
                }

                commit('setCompany', res)
                return res
            })
            .then(res => {
                let promisesList = []
                res.users.map(u => {
                    if(u.avatar && (u.avatar.indexOf('data') == -1) && u.avatar.indexOf('blob') == -1){
                        promisesList.push(dispatch('common/getFile', {id: u.avatar}, {root: true}))
                    }
                })
                return Promise.all(promisesList)
            })
            .then(res => {
                let company = JSON.parse(JSON.stringify(state.company))
                company.users = company.users.map(u => {

                    if(u.avatar && (u.avatar.indexOf('data') == -1 && u.avatar.indexOf('blob') == -1)){
                        let src = res.filter(l => l.id == u.avatar)[0]
                        return {...u, avatarSrc: src.file, id: u.id + ''}
                    }
                    else{
                        let name = u.first_name || u.email
                        return {
                            ...u,
                            id: u.id + '',
                            avatarSrc: createAvatarChar(name),
                            avatarFull: createAvatarChar(name, 150, 90)
                        }
                    }
                })
                return company
            })
            .then(company => {
                let promises = []
                // console.log('is suslik?', state)
                // promises.push(dispatch('getRoles'))
                // promises.push(dispatch('getAllCompanyPermissions'))
                Promise.all(promises)
                .then( res => {
                    // company.roles = res[0]
                    // company.permissions = res[1]
                    return company
                })
                .then(res => {
                    commit('setCompany', res)
                    commit('existUser', true)
                    resolve(res)
                })
            })
            
        })
    },
    getCompanyData({rootState},) {
        let token = rootState.auth.access_token

        return api.get(http['account'], api['account_company'], {with_users: true}, {
            authorization: 'Bearer ' + token
        })
    },
    updateCompany({rootState, state, commit, dispatch}, company){
        let token = rootState.auth.access_token
        // let props = Object.keys(company)
        let body = {...state.company, ...company}

        return api.put(http['account'], api['account_company'], body, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                commit('setCompany', res)
                let logo = res.logo || false
                if(logo && (logo.indexOf('data') == -1 && logo.indexOf('blob') == -1)){
                    dispatch('common/getFile', {id: logo}, {root: true})
                    .then(res => {
                        commit('setAvatar', {name: 'companyLogo', type: 'file', value: res.file, avatar: res.file})
                    })
                }
                else {
                    dispatch('defaultAvatar', {name: 'companyLogo', str: res.name})
                }
            })
    },
    getCompaniesList({rootState}) {
        let token = rootState.auth.access_token

        return api.get(http['account'], api['all_companies'], {}, {
            authorization: 'Bearer ' + token
        })
    },
    updateUser({rootState, state, commit, dispatch}, user){
        let token = rootState.auth.access_token
        let body = {...state.user, ...user}

        return new Promise((resolve) => {
            api.put(http['account'], api['account_user'], body, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                commit('setUser', res)

                let avatar = res.avatar || false

                let alert = {
                    status: 'success',
                    text: 'Данные успешно обновлены.'
                }
                if(avatar && (avatar.indexOf('data') == -1) && avatar.indexOf('blob') == -1){
                    dispatch('common/getFile', {id: avatar}, {root: true})
                    .then(res => {
                        commit('setAvatar', {name: 'userAvatar', type: 'file', value: res.file, avatar: res.file})

                        resolve(alert)
                    })
                }
                else{
                    dispatch('defaultAvatar', {name: 'userAvatar', str: res.first_name})

                    resolve(alert)
                }
            },
            er => {
                let alert = {
                    status: 'error',
                    text: er.message
                }
                resolve(alert)
            })
        })
    },
    updateEmployee({rootState, state, commit, dispatch}, user){
        let token = rootState.auth.access_token
        let body = user

        return new Promise((resolve) => {
            api.put(http['account'], api['account_employee'] + body.id, body, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                commit('setUser', res)

                let avatar = res.avatar || false

                let alert = {
                    status: 'success',
                    text: 'Данные успешно обновлены.'
                }
                if(avatar && (avatar.indexOf('data') == -1) && avatar.indexOf('blob') == -1){
                    dispatch('common/getFile', {id: avatar}, {root: true})
                    .then(res => {
                        commit('setAvatar', {name: 'userAvatar', type: 'file', value: res.file, avatar: res.file})

                        resolve(alert)
                    })
                }
                else{
                    dispatch('defaultAvatar', {name: 'userAvatar', str: res.first_name})

                    resolve(alert)
                }
            },
            er => {
                let alert = {
                    status: 'error',
                    text: er.message
                }
                resolve(alert)
            })
        })
    },
    inviteUser({rootState}, invite){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.post(http['account'], api['invite'], invite, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                resolve(res)
            },
            er => {
                let alert = {
                    status: 'error',
                    text: er.message
                }
                resolve(alert)
            })
        })
    },
    noregistredRemove({rootState, state, commit}, email){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.remove(http['account'], api['invite'] + '?email=' + email, {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                resolve(res)
            },
            er => {
                let alert = {
                    status: 'error',
                    text: er.message
                }
                resolve(alert)
            })
        })
    },
    invitedRemove({rootState, state, commit}, id){
        let token = rootState.auth.access_token

        return new Promise((resolve, reject) => {
            api.remove(http['account'], api['invited_user'] + '/' + id, {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                resolve(res)
            },
            er => {
                reject(er)
            })
        })
    },
    invitedList({rootState, commit}){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.get(http['account'], api['invited'], {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                commit('invited', res)
            })
        })
    },
    newpass({state, commit}, pass){
        let id = state.user.id
        return new Promise((resolve) => {
            api.post(http['login'], api['password'], {
                old_password: pass.old_password,
                new_password: pass.new_password,
                user_id: id
            }, {}, 'PUT')
            .then(() => {
                resolve({
                    status: 'success',
                    text: 'Вы успешно сменили пароль.'
                })
            },
            er => {
                let alert = {
                    status: 'error',
                    text: er.data.error
                }
                resolve(alert)
            })
        })
    },
    getConfig({rootState, commit}){
        return new Promise((resolve) => {
            api.get('', '/config/config.json', {}, {})
            .then(res => {
                commit('setConfig', res.configLicense)
            })
        })
    },
    getLicense({rootState, commit}){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.get(http['account'], api['license'] + '/order', {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                let lic = {
                    space: 0,
                    pcode: 0,
                    users: 0
                }
                res.map(itm => {
                    if(itm.pcode / 10 >> 0 == 1){
                        lic.space = itm.space
                    }
                    else if(itm.pcode / 10 >> 0 == 2){
                        lic.users = itm.users
                        lic.pcode = itm.pcode
                    }
                })
                commit('setCurrentLicense', lic)
            })
            .catch(er => {
                commit('setCurrentLicense', null)
            })
        })
    },
    setLicense({rootState, commit}, payload){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.post(http['account'], api['license'] + '/order', payload, {
                authorization: 'Bearer ' + token
            })
        })
    },
    getTemplates({rootState, commit}){
        let token = rootState.auth.access_token

        return api.get(http['cloud'], api['infomodeltemplates'] + '/data', {}, {
                "content-type": "application/json",
                "authorization": 'Bearer ' + token,
            })
    },
    saveTemplate({rootState, commit}, template) {
        let token = rootState.auth.access_token

        return api.post(http['cloud'], api['infomodeltemplates'] + '/data', template,
            {
                "content-type": "application/json",
                "authorization": 'Bearer ' + token,
            })

    },
    verifyProjectByTemplate({rootState, commit}, payload) {
        let token = rootState.auth.access_token
        // console.log('request sent, ','tmplt id', payload.templateid, 'project ', payload.projectid)
        return api.get(http['cloud'], api['infomodeltemplates'] + '/verify/' + payload.templateid + '/' + payload.projectid, {},
            {
                "content-type": "application/json",
                "authorization": 'Bearer ' + token,
            })
    },

    /////////////////// new permissions service ///////////////////
    getFolderPermissions({rootState}, payload) {
        let token = rootState.auth.access_token
        const project_id = payload.project_id
        const folder_id = payload.folder_id

        return api.get(http['cloud'], api['permify'] + '/folder/' + project_id + '/' + folder_id, {}, {
                authorization: 'Bearer ' + token
        })
    },
    getAllCurrentUserPermissions({rootState, commit}) {
        let token = rootState.auth.access_token

        return api.get(http['cloud'], api['permify'] + '/permission', {}, {
                authorization: 'Bearer ' + token
        })
        .then(res => {
            commit('setUserPermissions', res)
            return res
        })
    },
    addFolderPermission({rootState}, payload) {
        let token = rootState.auth.access_token
        const project_id = payload.project_id
        const folder_id = payload.folder_id
        const body = payload.body

        return api.post(http['cloud'], api['permify'] + '/folder/' + project_id + '/' + folder_id, body, {
                authorization: 'Bearer ' + token
        })
    },
    deleteFolderPermission({rootState}, payload) { 
        let token = rootState.auth.access_token
        const project_id = payload.project_id
        const folder_id = payload.folder_id
        const body = payload.body

        return api.remove(http['cloud'], api['permify'] + '/folder/' + project_id + '/' + folder_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    getRoles({rootState}) { 
        let token = rootState.auth.access_token

        return api.get(http['cloud'], api['permify'] + '/role', {}, {
            authorization: 'Bearer ' + token
        })
    },
    addRole({rootState}, payload) { 
        let token = rootState.auth.access_token

        return api.post(http['cloud'], api['permify'] + '/role', {}, {
            authorization: 'Bearer ' + token
        })
    },
    deleteRole({rootState}, payload) { 
        let token = rootState.auth.access_token
        const role_id = payload.role_id

        return api.remove(http['cloud'], api['permify'] + '/role/' + role_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    updateRole({rootState}, payload) {
        let token = rootState.auth.access_token
        const role_id = payload.role_id
        const body = payload.body

        return api.put(http['cloud'], api['permify'] + '/role/' + role_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    addUserToRole({rootState}, payload) {
        let token = rootState.auth.access_token
        const role_id = payload.role_id
        const user_id = payload.user_id

        return api.post(http['cloud'], api['permify'] + '/role/' + role_id + '/user/' + user_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    deleteUserFromRole({rootState}, payload) {
        let token = rootState.auth.access_token
        const role_id = payload.role_id
        const user_id = payload.user_id

        return api.remove(http['cloud'], api['permify'] + '/role/' + role_id + '/user/' + user_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    addCompanyPermission({rootState}, payload) {
        let token = rootState.auth.access_token
        const body = payload.body

        return api.post(http['cloud'], api['permify'] + '/company', body, {
            authorization: 'Bearer ' + token
        })
    },
    deleteCompanyPermission({rootState}, payload) {
        let token = rootState.auth.access_token
        const body = payload.body

        return api.remove(http['cloud'], api['permify'] + '/company', body, {
            authorization: 'Bearer ' + token
        })
    },
    getTokenList({rootState}, payload) { 
        let token = rootState.auth.access_token
        const project_id = payload.project_id
        const file_id = payload.file_id

        return api.get(http['cloud'], api['permify'] + '/company_admin/file/token/' + project_id + '/' + file_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    addToken({rootState}, payload) { 
        let token = rootState.auth.access_token
        const project_id = payload.project_id
        const file_id = payload.file_id
        const body = payload.body

        return api.post(http['cloud'], api['permify'] + '/company_admin/file/token/' + project_id + '/' + file_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    deleteToken({rootState}, payload) { 
        let token = rootState.auth.access_token
        const project_id = payload.project_id
        const file_id = payload.file_id
        const acc_token = payload.token

        return api.remove(http['cloud'], api['permify'] + '/company_admin/file/token/' + project_id + '/' + file_id + '/' + acc_token, {}, {
            authorization: 'Bearer ' + token
        })
    },
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
