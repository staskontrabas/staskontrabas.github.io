import { http, api } from '@/utils/define'

const state = {
    shops: [],
    cashiers: [],
    orders: [],
    menu: {},
    menushop: {},
    menuList: []
}

const mutations = {
    setShops(state, pld){
        state.shops = pld
    },
    setCashiers(state, pld){
        state.cashiers = pld
    },


    setOrdersOne(state, pld){
        state.orders = pld
    },
    setMenuMap(state, pld){
        state.menu = pld
    },
    setMenuList(state, pld){
        state.menuList = pld
    },
    setReports(state, pld){
        state.orders = pld.getorders || []
        state.menu = pld.getmenu || {}
        state.cashiers = pld.getcashiers || []
        state.menushop = pld.getmenushop || {}
    },
    setChecks(state, pld){
        state.orders = pld.getorders || []
        state.menu = pld.getmenu || {}
        state.cashiers = pld.getcashiers || []
        state.shops = pld.getshops || []
        state.menushop = pld.getmenushop || {}
    },
    setOrders(state, pld){
        state.orders = pld.getorders || []
        state.menu = pld.getmenu || {}
        state.cashiers = pld.getcashiers || []
        state.menushop = pld.getmenushop || {}
    },
    setShopsCashiers(state, pld){
        state.shops = pld.getshops || []
        state.cashiers = pld.getcashiers || []
    }
}

const actions = {
    get_shops({rootState, commit, dispatch}){
        return new Promise((resolve) => {
            api.get(http['host'], api['getshops'], {userid: rootState.auth.userid})
            .then(res => {
                if(res.status == 'success'){
                    const shops = Object.values(res.shops.reduce((r, shop) => ({
                        ...r,
                        [shop.shop_id]: {
                            ...shop,
                            shop_cashierid_list: r[shop.shop_id]
                                ? [...r[shop.shop_id].shop_cashierid_list, shop.shop_cashierid]
                                : [shop.shop_cashierid]
                        }
                    }), {}))
                        .sort((a, b) => (a.shop_id > b.shop_id) ? 1 : ((b.shop_id > a.shop_id) ? -1 : 0))
                    resolve({
                        act: 'getshops',
                        data: shops
                    })
                }
                else{
                    console.log('get shops ERROR: ', res.error)
                }
            })
        })
    },
    change_shop({rootState, commit}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['changeshop'], pld, {userid: rootState.auth.userid})
            .then(res => {
                if(res.status == 'success'){
                    commit('setShops', res.shops)
                    resolve(res)
                }
                else{
                    console.log('change shops ERROR: ', res.error)
                }
            })
        })
    },
    get_cashiers({rootState, commit}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['getcashiers'], {adminid: rootState.auth.userid}, {userid: rootState.auth.userid})
            .then(res => {
                if(res.status == 'success'){
                    const cashiers = (res.cashiers || [])
                        .sort((a, b) => (a.cashier_id > b.cashier_id) ? 1 : ((b.cashier_id > a.cashier_id) ? -1 : 0))
                    resolve({
                        act: 'getcashiers',
                        data: cashiers
                    })
                }
                else{
                    console.log('get cahiers ERROR: ', res.error)
                }
            })
        })
    },
    get_orders({rootState, commit}, pld){
        const sts = pld
            ? pld.sts
            : [0, 1, 2]
        return new Promise((resolve) => {
            api.get(http['host'], api['getorders'], {full: 1, userid: rootState.auth.userid})
            .then(res => {
                const list = (res || [])
                    .filter(item => sts.some(st => st == item.status))
                    .map(item => ({...item, active: false}))
                    .sort((a, b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0))
                resolve({
                    act: 'getorders',
                    data: list
                })
            })
        })
    },
    get_menu({rootState, commit}){
        return new Promise((resolve) => {
            api.get(http['host'], api['getmenu'], {userid: rootState.auth.userid})
            .then(res => {
                const menuList = res
                    .map(i => ({...i, active: false, extra_source: i.extra, diff: false}))
                    .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
                commit('setMenuList', menuList)
                const menuMap = JSON.parse(JSON.stringify(menuList.reduce((r, i) => ({...r, [i.sku]: i}), {})))
                // commit('setMenuMap', menuMap)
                resolve({
                    act: 'getmenu',
                    data: menuMap
                })
            })
        })
    },
    get_menu_shop({rootState, commit}){
        return new Promise((resolve) => {
            api.get(http['host'], api['getmenu'], {shopid: rootState.auth.shopid, userid: rootState.auth.userid})
            .then(res => {
                const menuMap = JSON.parse(JSON.stringify(res.reduce((r, i) => ({...r, [i.sku]: i}), {})))
                resolve({
                    act: 'getmenushop',
                    data: menuMap
                })
            })
        })
    },
    delete_menu({rootState, commit, dispatch}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['deletemenu'], pld, {userid: rootState.auth.userid})
            .then(res => {
                resolve(res)
            })
        })
    },
    add_menu({rootState, commit, dispatch}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['addmenu'], pld, {userid: rootState.auth.userid})
            .then(res => {
                resolve(res)
            })
        })
    },
    update_menu({rootState, commit, dispatch}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['changemenu'], pld, {userid: rootState.auth.userid})
            .then(res => {
                resolve(res)
            })
        })
    },
    change_order({rootState, commit, dispatch}, pld){
        return new Promise((resolve) => {
            api.post(http['host'], api['changeorder'], pld, {userid: rootState.auth.userid})
            .then(res => {
                resolve(res)
            })
        })
    },
    getReports({rootState, commit, dispatch}, pld){
        const promises = []
        pld.map(act => {
            promises.push(dispatch(act))
        })
        Promise.all(promises)
        .then(res => {
            commit('setReports', res.reduce((r, i) => ({...r, [i.act]: i.data}), {}))
        })
    },
    getChecks({rootState, commit, dispatch}, pld){
        const promises = []
        pld.map(act => {
            promises.push(dispatch(act))
        })
        Promise.all(promises)
        .then(res => {
            commit('setChecks', res.reduce((r, i) => ({...r, [i.act]: i.data}), {}))
        })
    },
    getOrders({rootState, commit, dispatch}, pld){
        const promises = []
        pld.map(act => {
            promises.push(dispatch(act))
        })
        Promise.all(promises)
        .then(res => {
            commit('setOrders', res.reduce((r, i) => ({...r, [i.act]: i.data}), {}))
        })
    },
    getShopsCashiers({rootState, commit, dispatch}, pld){
        const promises = [
            dispatch('get_cashiers', {adminid: rootState.auth.userid}),
            dispatch('get_shops')
        ]
        Promise.all(promises)
        .then(res => {
            commit('setShopsCashiers', res.reduce((r, i) => ({...r, [i.act]: i.data}), {}))
        })
    },
    clearReports({commit}){
        commit('setReports', {
            getcashiers: [],
            getorders: [],
            getmenu: {},
            getmenushop: {}
        })
    },
    clearChecks({commit}){
        commit('setReports', {
            getcashiers: [],
            getorders: [],
            getmenu: {},
            getmenushop: {}
        })
    },
    changeMenuExtra({commit}, pld){
        let menu = state.menu
        menu[pld.sku].extra = pld.extra
        menu[pld.sku].diff = !pld.extra.every((val, ind) => val == menu[pld.sku].extra_source[ind])
        commit('setMenuMap', menu)
    },
    changeMenuProp({commit}, pld){
        let menu = state.menu
        if(menu[pld.sku][pld.prop + '_source'] == undefined){
            menu[pld.sku][pld.prop + '_source'] = menu[pld.sku][pld.prop]
        }
        menu[pld.sku][pld.prop] = pld.val
        menu[pld.sku].diff = menu[pld.sku][pld.prop] != menu[pld.sku][pld.prop + '_source']
            || menu[pld.sku][pld.prop] != ''
        commit('setMenuMap', menu)
    },
    toggleMenuActive({commit}, pld){
        let menu = state.menu
        menu[pld.sku].active = pld.active
        commit('setMenuMap', menu)
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
