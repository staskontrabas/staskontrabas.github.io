import router from '@/router'
import store from '@/store'
import { sha256 } from 'js-sha256'
export const http = {
    host: ''
}

const hashkey = 'HGDFGf#43434s$'

const getHash = async (str) => {
    const utf8 = new TextEncoder().encode(hashkey + str)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', utf8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('')
    return hashHex
}

const post = async (http, api, body, query = {}) => {
    let requestOptions = {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }

    let params = sha256(hashkey + api.split('/').join(''))
    const arKeys = Object.keys(query)
    if(arKeys.length){
        params += '&' + arKeys.map(i => i + '=' + query[i]).join('&')
    }

    return fetch(http + api + '?hash=' + params, requestOptions)
        .then(handleResponse)
}

const get = async (http, api, body = {}, options = {}) => {
    const arKeys = Object.keys(body)
    let params = '?hash=' + sha256(hashkey + api.split('/').join(''))
    if(arKeys.length){
        params += '&' + arKeys.map(i => i + '=' + body[i]).join('&')
    }
    let requestOptions = {
        method: 'GET',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' }
    }
    return fetch(http + api + params, requestOptions)
        .then(handleResponse)
}

function handleResponse(res){
    return res.text().then(text => {
        let data = text
        if(data){
            try{
                data = JSON.parse(text || null)
                if(data.error){
                    if((data.error == 'userid_not_authorized' || data.error =='user_authorization_wrong') && router.currentRoute.path != '/login'){
                        localStorage.setItem('userid', '')
                        localStorage.setItem('role', '')
                        localStorage.setItem('shopid', '')
                        store.commit('auth/login', {
                            role: '',
                            userid: ''
                        })
                        router.push({name: 'auth'})
                    }
                }
            }
            catch(e){
                console.log('Error:', e)
            }
        }
        if(!res.ok){
            console.log('Error:', res)
            return Promise.reject(res)
        }
        return data
    })
}

export const api = {
    'auth': '/auth/user',
    'registration': '/register/user',
    'getshops': '/get/shops',
    'changeshop': '/change/shop',
    'changepassword': '/change/password',
    'registerapp': '/register/app',
    'registershop': '/register/shop',
    'getorders': '/get/orders',
    'changeorder': '/change/order',
    'getmenu': '/get/menu',
    'getreports': '/get/reports',
    'getcashiers': '/get/cashiers',
    'deletecashier': '/delete/cashier',
    'addmenu': '/add/menu',
    'deletemenu': '/delete/menu',
    'changemenu': '/change/menu',

    post: post,
    get: get
}
