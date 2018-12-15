import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import AuthLayout from '../components/auth/AuthLayout'
import AppLayout from '../components/app/AppLayout'

import Login from '@/components/auth/login/Login'
import AppMenu from '@/components/app/menu/AppMenu'
import AppStock from '@/components/app/stock/AppStock'
import AppExpenses from '@/components/app/expenses/AppExpenses'
import AppOperations from '@/components/app/operations/AppOperations'
import AppOrders from '@/components/app/orders/AppOrders'
import AppSettings from '@/components/app/settings/AppSettings'
import AppStatistics from '@/components/app/statistics/AppStatistics'
import AppAnalytics from '@/components/app/analytics/AppAnalytics'

import DraftBeer from '@/components/app/statistics/components/parts/DraftBeer'
import BottledBeer from '@/components/app/statistics/components/parts/BottledBeer'
import Products from '@/components/app/statistics/components/parts/Products'
import Dishes from '@/components/app/statistics/components/parts/Dishes'
import Cards from '@/components/app/statistics/components/parts/Cards'
import ExpenseCategories from '@/components/app/statistics/components/parts/ExpenseCategories'
import Alcohol from '@/components/app/statistics/components/parts/Alcohol'
import Revenue from '@/components/app/statistics/components/parts/Revenue'
import DishesByHours from '@/components/app/statistics/components/parts/DishesByHours'
import OrdersByHours from '@/components/app/statistics/components/parts/OrdersByHours'
import Additions from '@/components/app/statistics/components/parts/Additions'
import Karaoke from '@/components/app/statistics/components/parts/Karaoke'
import Promo from '@/components/app/statistics/components/parts/Promo'

import Users from '@/components/app/settings/components/parts/Users'
import DiscountCards from '@/components/app/settings/components/parts/DiscountCards'
import Expenses from '@/components/app/settings/components/parts/Expenses'
import Preferences from '@/components/app/settings/components/parts/Preferences'

import Discount100 from '@/components/app/analytics/components/parts/Discount100'
import RevenueAdmin from '@/components/app/analytics/components/parts/RevenueAdmin'
import BuisnessLanch from '@/components/app/analytics/components/parts/BuisnessLanch'
import PrincessPromoDishes from '@/components/app/analytics/components/parts/PrincessPromoDishes'
import PrincessPromoSessions from '@/components/app/analytics/components/parts/PrincessPromoSessions'
import OrdersByCustomHours from '@/components/app/analytics/components/parts/OrdersByCustomHours'

Vue.use(Router)

const ifAuthenticated = (to, from, next) => {
    store.dispatch('auth/logcheck')
    .then(res => {
        if(res.status){
            next()
            return
        }
        next('/auth/login')
    })
    //const user = store.state.auth.user
}
const ifNoAuthenticated = (to, from, next) => {
    store.dispatch('auth/logcheck')
    .then(res => {
        if(!res.status){
            next()
            return
        }
        next('/menu')
    })
    //const user = store.state.auth.user
}

export default new Router({
  //mode: 'history',
  //base: "/",
  routes: [
    {
      path: '*',
      redirect: '/auth/login' ,
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          name: 'login',
          path: 'login',
          component: Login,
          beforeEnter: ifNoAuthenticated
        },
        {
          path: '',
          redirect: { name: 'login' },
        },
      ]
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          name: 'menu',
          path: 'menu',
          component: AppMenu,
          beforeEnter: ifAuthenticated
        },
        {
          name: 'stock',
          path: 'stock',
          component: AppStock,
          beforeEnter: ifAuthenticated
        },
        {
          name: 'expenses',
          path: 'expenses',
          component: AppExpenses,
          beforeEnter: ifAuthenticated
        },
        {
          name: 'operations',
          path: 'operations',
          component: AppOperations,
          beforeEnter: ifAuthenticated
        },
        {
          name: 'orders',
          path: 'orders',
          component: AppOrders,
          beforeEnter: ifAuthenticated
        },
        {
          path: 'statistics',
          component: AppStatistics,
          children: [
              {
                  path: '',
                  redirect: { name: 'draft_beer' },
              },
              {
                  path: 'draft_beer',
                  name: 'draft_beer',
                  component: DraftBeer,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'bottled_beer',
                  name: 'bottled_beer',
                  component: BottledBeer,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'products',
                  name: 'products',
                  component: Products,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'dishes',
                  name: 'dishes',
                  component: Dishes,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'discount_cards',
                  name: 'discount_cards',
                  component: Cards,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'expense_categories',
                  name: 'expense_categories',
                  component: ExpenseCategories,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'alcohol',
                  name: 'alcohol',
                  component: Alcohol,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'revenue',
                  name: 'revenue',
                  component: Revenue,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'dishes_by_hours',
                  name: 'dishes_by_hours',
                  component: DishesByHours,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'orders_by_hours',
                  name: 'orders_by_hours',
                  component: OrdersByHours,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'additions',
                  name: 'additions',
                  component: Additions,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'karaoke',
                  name: 'karaoke',
                  component: Karaoke,
                  beforeEnter: ifAuthenticated
              },
              {
                  path: 'promo',
                  name: 'promo',
                  component: Promo,
                  beforeEnter: ifAuthenticated
              }
          ]
      },
      {
        path: 'analytics',
        component: AppAnalytics,
        children: [
                {
                    path: '',
                    redirect: { name: 'discount100' },
                },
                {
                    path: 'discount100',
                    name: 'discount100',
                    component: Discount100,
                    beforeEnter: ifAuthenticated
                },
                {
                    path: 'cash2safe',
                    name: 'cash2safe',
                    component: RevenueAdmin,
                    beforeEnter: ifAuthenticated
                },
                {
                    path: 'buisnesslanch',
                    name: 'buisnesslanch',
                    component: BuisnessLanch,
                    beforeEnter: ifAuthenticated
                },
                {
                    path: 'princess_promo_dishes',
                    name: 'princess_promo_dishes',
                    component: PrincessPromoDishes,
                    beforeEnter: ifAuthenticated
                },
                {
                    path: 'princess_promo_sessions',
                    name: 'princess_promo_sessions',
                    component: PrincessPromoSessions,
                    beforeEnter: ifAuthenticated
                },
                {
                    path: 'orders_by_custom_hours',
                    name: 'orders_by_custom_hours',
                    component: OrdersByCustomHours,
                    beforeEnter: ifAuthenticated
                }
          ]
      },
      {
        path: 'settings',
        component: AppSettings,
        children: [
            {
                path: '',
                redirect: { name: 'preferences' },
            },
            {
                path: 'users',
                name: 'users',
                component: Users,
                beforeEnter: ifAuthenticated
            },
            {
                path: 'cards',
                name: 'cards',
                component: DiscountCards,
                beforeEnter: ifAuthenticated
            },
            {
                path: 'expense',
                name: 'expense',
                component: Expenses,
                beforeEnter: ifAuthenticated
            },
            {
                path: 'preferences',
                name: 'preferences',
                component: Preferences,
                beforeEnter: ifAuthenticated
            }
        ]
      },
        /*
        {
          name: 'salary',
          path: 'salary',
          component: lazyLoading('app/salary/Salary')
        },
        {
          name: 'royalties',
          path: 'royalties',
          component: lazyLoading('app/royalties/Royalties')
        },
        */

        {
          path: '',
          redirect: { name: 'login' },
      }
      ]
    }
  ]
})
