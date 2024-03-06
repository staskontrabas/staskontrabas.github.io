import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

import Layout from '@/components/core/Layout.vue'

import Login from '@/components/Login.vue'

import Registration from '@/components/pages/Registration.vue'
import Orders from '@/components/pages/Orders.vue'
import Reports from '@/components/pages/Reports.vue'
import Checks from '@/components/pages/Checks.vue'
import Menu from '@/components/pages/Menu.vue'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    scrollBehavior(){
        return { x: 0, y: 0 }
    },
    routes: [{
        path: '*',
        redirect: { name: 'auth' },
    },
    {
        path: '/login',
        name: 'auth',
        component: Login,
        meta: {
            guest: true
        }
    },
    {
        path: '',
        component: Layout,
        children: [
            {
            path: '/',
            redirect: { name: 'registration' }
        },
        {
            name: 'registration',
            path: '/registration',
            component: Registration,
            meta: {
                requiresAuth: true
            }
        },
        {
            name: 'orders',
            path: '/orders',
            component: Orders,
            meta: {
                requiresAuth: true
            }
        },
        {
            name: 'reports',
            path: '/reports',
            component: Reports,
            meta: {
                requiresAuth: true
            }
        },
        {
            name: 'checks',
            path: '/checks',
            component: Checks,
            meta: {
                requiresAuth: true
            }
        },
        {
            name: 'menu',
            path: '/menu',
            component: Menu,
            meta: {
                requiresAuth: true
            }
        }]
    }]
})

router.beforeEach((to, from, next) => {
    if(to.meta.requiresAuth){
        const userid = localStorage.getItem('userid') || store.state.auth.userid
        const role = localStorage.getItem('role') || store.state.auth.role
        const shopid = localStorage.getItem('shopid') || store.state.auth.shopid

        if(!userid){
            store.dispatch('auth/setFullPath', to.fullPath)
            const prms = {
                path: '/login'
            }
            if(from.path != '/login'){
                next(prms)
            }
            else{
                next()
            }
        }
        else{
            store.commit('auth/login', {
                role: role,
                userid: userid,
                shopid: shopid
            })
            if(to.matched.some(record => record.meta.is_admin)) {
                if(store.state.auth.role == 'superadmin' || store.state.auth.role == 'admin'){
                    next()
                }
                else{
                    next()
                }
            }
            else{
                next()
            }
        }
    }
    else{
        next()
    }
})


export default router
