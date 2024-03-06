// import router from '@/router'
import { http, api } from '@/utils/define'

const state = {
    userid: null,
    role: '',
    fullPath: null,
    shopid: '',
    shop: {}
}

const mutations = {
    login(state, pld){
        state.role = pld.role
        state.userid = pld.userid
        state.shopid = pld.shopid
    },
    setShop(state, pld){
        state.shop = pld
    },
    setFullPath(state, pld){
        state.fullPath = pld
    }
}

const actions = {
    login({commit, dispatch}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['auth'], pld)
            .then(res => {
                commit('login', {
                    role: res.role,
                    userid: res.userid
                })
                localStorage.setItem('userid', res.userid)
                localStorage.setItem('role', res.role)
// document.cookie = encodeURIComponent('userid') + '=' + encodeURIComponent(res.userid)
// // document.cookie = encodeURIComponent('authtoken') + '=' + encodeURIComponent(res.authtoken)
                dispatch('shops/get_shops', {}, {root: true})
                .then(shops => {
                    const shop = shops.data.find(shop => shop.admin_id == res.userid)
                    const shopid = res.role == 'superadmin'
                        ? 0
                        : shop.shop_id
                    localStorage.setItem('shopid', shopid)

                    commit('setShop', {
                        shop: shop
                    })
                    commit('shops/setShops', shops.data, {root: true})
                })
                resolve(res)
            })
        })
    },
    reg_user({state, commit}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['registration'], pld, {userid: state.userid})
            .then(res => {
                resolve(res)
            })
        })
    },
    delete_cashier({state, commit}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['deletecashier'], pld, {userid: state.userid})
            .then(res => {
                resolve(res)
            })
        })
    },
    change_password({state, commit}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['changepassword'], pld, {userid: state.userid})
            .then(res => {
                resolve(res)
            })
        })
    },
    registershop({state, commit}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['registershop'], pld, {userid: state.userid})
            .then(res => {
                if(res.status == 'success'){
                    resolve(res)
                }
                else{
                    console.log('register shop ERROR: ', res.error)
                }
            })
        })
    },
    setFullPath({commit}, pld){
        commit('setFullPath', pld)
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
