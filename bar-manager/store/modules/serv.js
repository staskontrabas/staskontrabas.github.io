import api_v1_auth_login from '@/serv/api.v1.auth.login.json'
import api_v1_auth_logout from '@/serv/api.v1.auth.logout.json'
import api_v1_admin_menu_list from '@/serv/api.v1.admin.menu.list.json'
import api_v1_admin_menu_ingredients from '@/serv/api.v1.admin.menu.ingredients.json'
import api_v1_admin_menu_ingredients_2095 from '@/serv/api.v1.admin.menu.ingredients.2095.json'
import api_v1_admin_menu_create_item from '@/serv/api.v1.admin.menu.create_item.json'
import api_v1_admin_funds from '@/serv/api.v1.admin.funds.json'
import api_v1_admin_expenses_list from '@/serv/api.v1.admin.expenses.list.json'
import api_v1_admin_expenses_categories from '@/serv/api.v1.admin.expenses.categories.json'
import api_v1_admin_stock_categories from '@/serv/api.v1.admin.stock.categories.json'
import api_v1_admin_users_cashiers from '@/serv/api.v1.admin.users.cashiers.json'
import api_v1_admin_orders_list from '@/serv/api.v1.admin.orders.list.json'
import api_v1_admin_orders_12168 from '@/serv/api.v1.admin.orders.12168.json'
import api_v1_admin_statistics_draft_beer from '@/serv/api.v1.admin.statistics.draft_beer'
import api_v1_admin_statistics_orders_by_hoursfrom_0 from '@/serv/api.v1.admin.statistics.orders_by_hours_0'
import api_v1_admin_statistics_orders_by_hoursfrom_1 from '@/serv/api.v1.admin.statistics.orders_by_hours_1'
import api_v1_admin_users_roles from '@/serv/api.v1.admin.users.roles'
import api_v1_admin_users_list from '@/serv/api.v1.admin.users.list'

const state = {
    api_v1_auth_login: api_v1_auth_login,
    api_v1_auth_logout: api_v1_auth_logout,
    api_v1_auth_check: {"status":false,"role":-1},
    api_v1_admin_menu_list: api_v1_admin_menu_list,
    api_v1_admin_menu_ingredients: api_v1_admin_menu_ingredients,
    api_v1_admin_menu_ingredients_2095: api_v1_admin_menu_ingredients_2095,
    api_v1_admin_funds: api_v1_admin_funds,
    api_v1_admin_expenses_list: api_v1_admin_expenses_list,
    api_v1_admin_expenses_categories: api_v1_admin_expenses_categories,
    api_v1_admin_stock_categories: api_v1_admin_stock_categories,
    api_v1_admin_users_cashiers: api_v1_admin_users_cashiers,
    api_v1_admin_orders_list: api_v1_admin_orders_list,
    api_v1_admin_orders_12168: api_v1_admin_orders_12168,
    api_v1_admin_statistics_draft_beer: api_v1_admin_statistics_draft_beer,
    api_v1_admin_statistics_orders_by_hoursfrom_0: api_v1_admin_statistics_orders_by_hoursfrom_0,
    api_v1_admin_statistics_orders_by_hoursfrom_1: api_v1_admin_statistics_orders_by_hoursfrom_1,
    api_v1_admin_users_roles: api_v1_admin_users_roles,
    api_v1_admin_users_list: api_v1_admin_users_list
}

const mutations = {
    resetOptions(state){
    },
    api_v1_auth_login(state){
        state.api_v1_auth_check.status = true
    },
    api_v1_auth_logout(state){
        state.api_v1_auth_check.status = false
    },
    api_v1_admin_menu_create_item(state, payload){
        state.api_v1_admin_menu_list.push(payload)
    },
    api_v1_admin_menu_delete(state, payload){
        state.api_v1_admin_menu_list = payload
    },
    api_v1_admin_menu_save(state, payload){
        state.api_v1_admin_menu_list = payload
    },
    api_v1_admin_user_create(state, payload){
        state.api_v1_admin_users_list.push(payload)
    },
    api_v1_admin_menu_delete(state, payload){
        state.api_v1_admin_users_list = payload
    }
}
const actions = {
    resize({commit}){
        commit('resize')
    },
    _api_v1_auth_check({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return Object.assign({}, state.api_v1_auth_check)
            }())
        })
    },
    _api_v1_auth_login({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                commit('api_v1_auth_login')
                return state.api_v1_auth_login
            }())
        })
    },
    _api_v1_auth_logout({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                commit('api_v1_auth_logout')
                return {code: 2}
            }())
        })
    },
    _api_v1_admin_menu_list({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_menu_list
            }())
        })
    },
    _api_v1_admin_menu_ingredients_({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_menu_ingredients
            }())
        })
    },
    _api_v1_admin_menu_create_item({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                let item = api_v1_admin_menu_create_item
                item.item_id = 999000 + state.api_v1_admin_menu_list.length
                commit('api_v1_admin_menu_create_item', item)
                return item
            }())
        })
    },
    _api_v1_admin_menu_ingredients_2095({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_menu_ingredients_2095
            }())
        })
    },
    _api_v1_admin_menu_delete({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                let list = state.api_v1_admin_menu_list.filter(item => {
                    let equal = false
                    for(let i = 0, len = payload.items.length; i < len; i++){
                        if(item.item_id == payload.items[i]){
                            equal = true
                            break
                        }
                    }
                    if(!equal)
                        return item
                })
                commit('api_v1_admin_menu_delete', list)
                return null
            }())
        })
    },
    _api_v1_admin_menu_save({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                let item = {}
                const keys = Object.keys(payload)
                keys.map(prop => {
                    item[prop.replace('new_', '')] = payload[prop]
                })
                const list = state.api_v1_admin_menu_list.map(i => {
                    if(i.item_id == payload.item_id){
                        item = Object.assign(i, item)
                        return item
                    }
                    else{
                        return i
                    }
                })
                commit('api_v1_admin_menu_save', list)

                return item
            }())
        })
    },
    _api_v1_admin_menu_create_category({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                const item = {
                    "item_id": 999000 + state.api_v1_admin_menu_list.length,
                    "parent_id": payload.parent_id,
                    "name": payload.name,
                    "description":"",
                    "is_file":false,
                    "last_update":"2017-10-31T21:33:16.897007Z",
                    "type":0,
                    "retail_price":0,
                    "prime_cost":98,
                    "cashback":null,
                    "max_discount":10,
                    "valid_ingredients":1,
                    "status":1,
                    "days":127
                }
                commit('api_v1_admin_menu_create_item', item)
                return item
            }())
        })
    },
    _api_v1_admin_funds({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_funds
            }())
        })
    },
    _api_v1_admin_expenses_list({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                let list = Object.assign({}, state.api_v1_admin_expenses_list)
                list.filtered_records = list.filtered_records.filter(item => !payload.hasOwnProperty('category_id') ? item : item.category_id == payload.category_id && item)
                return list
            }())
        })
    },
    _api_v1_admin_expenses_categories({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_expenses_categories
            }())
        })
    },
    _api_v1_admin_stock_categories({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_stock_categories
            }())
        })
    },
    _api_v1_admin_users_cashiers({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_users_cashiers
            }())
        })
    },
    _api_v1_admin_orders_list({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                let list = Object.assign({}, state.api_v1_admin_orders_list)
                list.orders = list.orders.filter(item => !payload.hasOwnProperty('cashier_id') ? item : state.api_v1_admin_users_cashiers.filter(c => c.user_id == payload.cashier_id)[0].user_name == item.cashier_name && item)
                return list
            }())
        })
    },
    _api_v1_admin_orders_12168({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_orders_12168
            }())
        })
    },
    _api_v1_admin_statistics_draft_beer({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_statistics_draft_beer
            }())
        })
    },
    _api_v1_admin_statistics_orders_by_hours({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                if(!payload.chart_type){
                    return state.api_v1_admin_statistics_orders_by_hoursfrom_0
                }
                else{
                    return state.api_v1_admin_statistics_orders_by_hoursfrom_1
                }
            }())
        })
    },
    _api_v1_admin_users_roles({commit, state}){
        return new Promise((resolve) => {
            resolve(function(){
                return state.api_v1_admin_users_roles
            }())
        })
    },
    _api_v1_admin_users_list({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                let list = state.api_v1_admin_users_list
                list = list.filter(item => !payload.hasOwnProperty('role_id') ? item : item.category_id == payload.role_id && item)
                return list
            }())
        })
    },
    _api_v1_admin_users_create({commit, state}, payload){
        return new Promise((resolve) => {
            let user = {
                active: 1,
                card_id: 878,
                card_number: '',
                category_id: -1,
                discount: 50,
                login: '',
                permissions: "10001111100101000001000100000010",
                registration_date: "2018-11-21T15:14:06Z",
                user_id: 999000 + state.api_v1_admin_users_list.length
            }
            resolve(function(){
                let item = Object.assign(user, payload)
                commit('api_v1_admin_user_create', item)
                return item
            }())
        })
    },
    _api_v1_admin_users_delete({commit, state}, payload){
        return new Promise((resolve) => {
            resolve(function(){
                let list = state.api_v1_admin_users_list.filter(item => item.user_id != payload.user_id)
                commit('api_v1_admin_menu_delete', list)
                return null
            }())
        })
    }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
