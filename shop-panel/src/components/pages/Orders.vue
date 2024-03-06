<template>
    <div class="admin-container">

        <div class="admin-orders">

            <search
                :search_val.sync="search_val"
            />

            <div
                v-if="getRole == 'admin'"
                class="admin-reports-control-select relative">
                <div style="color: #fff;margin-bottom: 7px;">Кассиры</div>
                <select
                    v-model="selectedCashier"
                    class="admin-input w-100">
                    <option
                        v-for="cashier in cashiersListSelect"
                        :value="cashier.cashier_id">{{cashier.cashier_login}}</option>
                </select>
            </div>
            <div
                v-for="item in getOrders.orders"
                class="admin-order"
                :class="{'toggle-active': item.active}"
                >
                <div class="admin-order-header">
                    <button
                        @click="toggleCard(item)"
                        class="admin-order-header-expand btn btn--green btn--contur btn--icon"
                        :class="{'toggle-active': item.active}"
                        >
                        <span class="active-enabled">-</span>
                        <span class="active-disabled">+</span>
                    </button>
                    <div class="admin-order-id">#{{item.id}}</div>
                    <div class="admin-order-item-counter">
                        <div></div>
                        <div></div>
                        <span class="admin-order-item-variant">{{item.count}}G</span>
                    </div>
                    <div class="admin-order-summ">{{formatspace({text: item.paidsum})}}฿
                    </div>
                    <div class="admin-order-header-status">
                        <select
                            v-if="getRole == 'admin'"
                            @change="changeStatus(item)"
                            v-model="item.status" class="admin-input w-100">
                            <option value="0">Открыт</option>
                            <option value="1">Оплачен</option>
                            <option value="2">Отменен</option>
                        </select>
                        <div
                            v-if="getRole == 'superadmin'"
                            class="admin-input d-flex align-center">
                            <span>{{status[item.status]}}</span>
                        </div>
                    </div>
                </div>

                <div v-for="user in item.delivery_info" class="admin-order-user">
                    <div class="admin-order-user-phone">{{user.phone}}</div>
                    <div class="admin-order-user-name">{{user.name}}</div>
                </div>

                <div
                    class="is-active-enabled"
                    :class="{'toggle-active': item.active}"
                    >

                    <div class="admin-order-items">
                        <div
                            v-for="mitem in item.menu_list"
                            class="admin-order-item">
                            <div class="admin-order-item-name">{{mitem.name}}</div>
                            <div class="admin-order-item-counter">
                                <span class="admin-order-item-count">{{mitem.count}}</span>
                                <span>x</span>
                                <span class="admin-order-item-variant">1G</span>
                            </div>
                            <div class="admin-order-item-cost">{{formatspace({text: mitem.summ})}}฿</div>
                        </div>
                    </div>

                    <div class="admin-order-comment mt-2">
                        {{formatDate(item.time)}}
                    </div>
                </div>
            </div>

            <pagination
                :v-if="true"
                :length="getOrders.count"
                :perPage.sync="perPage"
                @paginator="onPage"/>
        </div>
    </div>
</template>

<script>
import Search from "@/components/common/Search"
import Pagination from "@/components/common/Pagination"
import {formatspace} from "@/utils/services"

export default {
    name: 'Orders',
    components: {
        Search,
        Pagination
    },
    data(){
        return {
            search_val: '',
            page: 1,
            perPage: 10,
            selectedCashier: null,
            status: ['открыт', 'оплачен', 'отменен']
        }
    },
    computed: {
        getOrders(){
            const role = this.$store.state.auth.role
            const orders = this.$store.state.shops.orders
            const cashiers = this.$store.state.shops.cashiers
            const menu = this.$store.state.shops.menushop

            let list = orders.filter(order => ((cashiers.some(cas => cas.cashier_id == order.cashierid) && (order.cashierid == this.selectedCashier || !this.selectedCashier)) || role == 'superadmin')
                // && order.delivery_info[0].fulladdress != 'offlineorder'
                && order.status == 0
                && order.id.toString().includes(this.search_val))
            .reverse()
            const count = list.length

            list = list.slice((this.page - 1) * this.perPage, this.perPage
                ? (this.page - 1) * this.perPage + this.perPage
                : list.length)
            list = list.map(order => {
                if(!order.menu_list){
                    let count = 0
                    order.menu_list = order.menu_info.map(menuitem => {
                        const mitem = menu[menuitem.menuid]
                        count += menuitem.count
                        let temp = {
                            name: '',
                            price: menuitem.price,
                            count: menuitem.count,
                            summ: menuitem.price * menuitem.count || ''
                        }
                        if(mitem){
                            temp = {
                                ...temp,
                                name: mitem.name || ''
                            }
                        }
                        return temp
                    })
                    order.count = count
                }
                return order
            })
            return {
                count,
                orders: list
            }
        },
        getRole(){
            return this.$store.state.auth.role
        },
        cashiersListSelect(){
            return [{cashier_login: 'Все кассиры', cashier_id: null}, ...this.$store.state.shops.cashiers]
        }
    },
    methods: {
        formatspace(data){
            return formatspace(data)
        },
        onPage(pageNum){
            this.page = pageNum
        },
        toggleCard(item){
            item.active = !item.active
        },
        changeStatus(order){
            this.$store.dispatch('shops/change_order', {
                id: order.id,
                cashierid: order.cashierid,
                status: parseInt(order.status)
            })
            .then(res => {
                this.$store.dispatch('shops/get_orders')
                .then(res => {
                    this.$store.commit('shops/setOrdersOne', res.data)
                })
            })
        },
        formatDate(date, type = 'full'){
            let options = {}
            if(type == 'dmy'){
                options = {year: '2-digit', month: '2-digit', day: '2-digit'}
            }
            else{
                options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
            }
            const formatdate = new Date(date * 1000)
            return formatdate.toLocaleDateString("ru-RU", options)
        },
    },
    created(){
        this.$store.dispatch('shops/getOrders', ['get_cashiers', 'get_menu', 'get_menu_shop', 'get_orders'])
    },
    beforeDestroy(){
        this.$store.dispatch('shops/clearChecks')
    }
}
</script>
