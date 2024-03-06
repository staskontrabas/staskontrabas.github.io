<template>
    <div class="admin-checks">
        <div class="admin-container">

            <div class="admin-reports-control">
                <div class="admin-reports-control-times">
                    <div class="admin-reports-control-date">

                        <div class="admin-reports-control-label">Дата начала</div>
                        <vue-date-picker
                            format="DD MM YYYY"
                            :color="'#87c03d'"
                            v-model="datestart.date">
                            <template #activator="{ date }">
                                <div ref="activator" class="relative w-100">
                                    <div class="admin-input-icon">
                                        <span class="a-calendar" style="color: #fff;font-size: 26px;"></span>
                                    </div>
                                    <input type="text" :value="date" class="admin-input admin-input--whith-icon w-100 no-event">
                                </div>
                            </template>
                        </vue-date-picker>
                    </div>
                    <div class="relative admin-reports-control-time">
                        <input
                            type="number"
                            v-model="datestart.hours"
                            @input="inputDateStart('datestart','hours')"
                            @change="changeDateTime('datestart','hours')"
                            class="admin-input w-100">
                    </div>
                    <div class="relative admin-reports-control-time">
                        <input
                            type="number"
                            v-model="datestart.minutes"
                            @input="inputDateStart('datestart','minutes')"
                            @change="changeDateTime('datestart','minutes')"
                            class="admin-input w-100">
                    </div>
                </div>

                <div class="admin-reports-control-times">
                    <div class="admin-reports-control-date">
                        <div class="admin-reports-control-label">Дата окончания</div>

                        <vue-date-picker
                            format="DD MM YYYY"
                            :color="'#87c03d'"
                            v-model="dateend.date">
                            <template #activator="{ date }">
                                <div ref="activator" class="relative w-100">
                                    <div class="admin-input-icon">
                                        <span class="a-calendar" style="color: #fff; font-size: 26px;"></span>
                                    </div>
                                    <input type="text" :value="date" class="admin-input admin-input--whith-icon w-100 no-event">
                                </div>
                            </template>
                        </vue-date-picker>
                    
                    </div>
                    <div class="relative admin-reports-control-time">
                        <input
                            type="number"
                            v-model="dateend.hours"
                            @input="inputDateStart('dateend','hours')"
                            @change="changeDateTime('dateend','hours')"
                            class="admin-input w-100">
                    </div>
                    <div class="relative admin-reports-control-time">
                        <input
                            type="number"
                            v-model="dateend.minutes"
                            @input="inputDateStart('dateend','minute')"
                            @change="changeDateTime('dateend','minutes')"
                            class="admin-input w-100">
                    </div>
                </div>
            </div>

            <div class="admin-reports-date-control">
                <button
                    v-for="btn in filter_btn"
                    @click="onClickFilter(btn)"
                    class="btn btn--green btn--contur">{{btn.title}}</button>
                <div
                    v-if="getRole == 'superadmin'"
                    class="admin-reports-control-select relative">
                    <select
                        v-model="selectedshopid"
                        class="admin-input w-100">
                        <option
                            v-for="shop in getShopList"
                            :value="shop.shop_id">{{shop.shop_name}}</option>
                    </select>
                </div>
            </div>

            <div class="admin-reports-card">
                <div class="admin-reports-titles">
                    <div
                        v-for="item in reports"
                        :class="{active: item.active}"
                        class="admin-reports-title"
                        @click="setActiveReport(item)"
                        >
                        <div class="admin-reports-title-sign">{{item.title}}</div>
                        <div class="admin-reports-title-total">{{formatspace({text: getOrders[item.name]})}}</div>
                    </div>
                </div>
            </div>

            <div class="admin-checks-table">
                <div class="admin-checks-tr admin-checks-thead">
                    <div class="admin-checks-cell admin-checks-cell-number">№ чека</div>
                    <div class="admin-checks-cell admin-checks-cell-date">Дата</div>
                    <div class="admin-checks-cell admin-checks-cell-employe">Сотрудник</div>
                    <div class="admin-checks-cell admin-checks-cell-client">Клиент</div>
                    <div class="admin-checks-cell admin-checks-cell-type">Тип</div>
                    <div class="admin-checks-cell admin-checks-cell-total">Сумма</div>
                </div>

                <div
                    v-for="item in getOrders.orders"
                    @click="onClickCheck(item)"
                    class="admin-checks-tr">
                    <div class="admin-checks-cell admin-checks-cell-number">{{item.id}}</div>
                    <div class="admin-checks-cell admin-checks-cell-date">{{formatDate(item.time)}}</div>
                    <div class="admin-checks-cell admin-checks-cell-employe">{{item.cashierlogin}}</div>
                    <div class="admin-checks-cell admin-checks-cell-client">--</div>
                    <div class="admin-checks-cell admin-checks-cell-type">
                        {{status[item.status]}}
                    </div>
                    <div class="admin-checks-cell admin-checks-cell-total">{{formatspace({text: item.paidsum})}}</div>
                </div>
            </div>

            <pagination
                :v-if="true"
                :length="getOrders.len"
                :perPage.sync="perPage"
                @paginator="onPage"/>
        </div>

        <Dialog
            :showHeader="false"
            :modal="true"
            :dismissableMask="true"
            :closable="true"
            :visible.sync="displayBasic">
            <div class="header">
                <span
                    @click="closeBasic"
                    class="btn-close">&#10005;</span>
            </div>
            <div class="popup">
                <div class="check-popup">
                    <div class="check-popup-title">
                        {{formatspace({text: checkActive.paidsum})}}฿
                    </div>
                    <div class="check-popup-sign">Итого</div>

                    <div class="check-popup-separator"></div>
                    <div>
                        Сотрудник: {{checkActive.cashierlogin}}<br>
                        Касса:
                    </div>
                    <div class="check-popup-separator"></div>

                    <div class="check-popup-position" v-for="mitem in checkActive.menu">
                        <div class="check-popup-position-left">
                            <div class="check-popup-position-name">{{mitem.name}}</div>
                            <div class="check-popup-position-count">{{mitem.count}} x {{formatspace({text: mitem.price})}}฿</div>
                        </div>
                        <div class="check-popup-position-cost">{{formatspace({text: mitem.summ})}}฿</div>
                    </div>

                    <div class="check-popup-separator"></div>
                    <div class="check-popup-total">
                        <span>Итого</span>
                        <span>{{formatspace({text: checkActive.paidsum})}}฿</span>
                    </div>
                    <div class="check-popup-pay">
                        <span>Картой</span>
                        <span>{{formatspace({text: checkActive.paidsum})}}฿</span>
                    </div>
                    <div class="check-popup-separator"></div>
                    <div class="check-popup-info">
                        <span>{{formatDate(checkActive.time)}}</span>
                        <span>№{{checkActive.id}}</span>
                    </div>
                    <div class="check-popup-separator"></div>

                    <div
                        v-if="getRole == 'admin' && checkActive.status != 2"
                        class="popup__buttons">
                        <button class="popup__btn btn btn--red btn--light"
                            @click="changeStatus(2)">Отменить</button>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script>
// import {VueDatePicker} from '@mathieustan/vue-datepicker'
import {VueDatePicker} from '@/utils/vue-datepicker.esm.js'
import Pagination from "@/components/common/Pagination"
import {formatspace} from "@/utils/services"

export default {
    name: 'Checks',
    components: {
        VueDatePicker,
        Pagination
    },
    data(){
        return {
            displayBasic: false,
            checkActive: {},
            datestart: this.transDate(+new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)),
            dateend: this.transDate(Date.now()),
            filter_btn: [{
                name: 'btn_today',
                title: 'сегодня',
                sts: false,
            },{
                name: 'btn_yest',
                title: 'вчера',
                sts: false,
            },{
                name: 'btn_week',
                title: 'неделя',
                sts: false,
            },{
                name: 'btn_month',
                title: 'месяц',
                sts: false,
            }],
            filter_active: false,
            reports: [
            {
                title: 'Все чеки',
                name: 'count',
                value: 0,
                status: null,
                active: true
            },
            {
                title: 'Продажи',
                name: 'sales',
                value: 0,
                status: 1,
                active: false
            },
            {
                title: 'Возвраты',
                name: 'returns',
                value: 0,
                status: 2,
                active: false
            },
            ],
            activeStatus: null,
            page: 1,
            perPage: 10,
            selectedshopid: -1,
            status: ['Открыт', 'Оплачено', 'Отмена']
        }
    },
    computed: {
        getOrders(){
            let count = 0
            let sales = 0
            let returns = 0
            //0, 1,2 - открыт закрыт (оплачен ) и неоплачен (отменен )
            const role = this.$store.state.auth.role
            const orders = this.$store.state.shops.orders
            const cashiers = this.$store.state.shops.cashiers
            const status = this.activeStatus


            const dstart = this.transDate(+new Date(this.datestart.date))
            const hstart = this.checkHours(this.datestart.hours)
            const mstart = this.checkMinutes(this.datestart.minutes)

            const dend = this.transDate(+new Date(this.dateend.date))
            const hend = this.checkHours(this.dateend.hours)
            const mend = this.checkMinutes(this.dateend.minutes)

            let list = orders.filter(order => {
                if(this.selectedshopid != -1){
                    const cashierlist = this.getShopList.find(shop => shop.shop_id == this.selectedshopid).shop_cashierid_list
                    if(!cashierlist.some(id => order.cashierid == id)){
                        return false
                    }
                }
                if(order.status == 0){
                    return false
                }

                const time = +new Date(order.time * 1000)

                let startDay = +new Date(dstart.year, dstart.month, dstart.day, hstart, mstart)
                let endDay = +new Date(dend.year, dend.month, dend.day, hend, mend, 59)

                // фильтр по дате, кассиру, статусу

                if(time >= startDay && time <= endDay && (cashiers.some(cas => cas.cashier_id == order.cashierid) || role == 'superadmin')){ // || order.cashierid == null
                    count += 1
                    if(order.status == 1){
                        // sales += 1
                        sales += order.paidsum
                    }
                    if(order.status == 2){
                        // returns += 1
                        returns += order.paidsum
                    }

                    const cashier = cashiers.find(cas => cas.cashier_id == order.cashierid)
                    order.cashierlogin = cashier ? cashier.cashier_login : ''

                    if(status == null || (status != null && order.status == status)){
                        return order
                    }
                }
            }).reverse()
            // пагинация
            const list_filtered = list.slice((this.page - 1) * this.perPage, this.perPage
                ? (this.page - 1) * this.perPage + this.perPage
                : list.length)

            return {
                len: list.length,
                count: count,
                sales: sales,
                returns: returns,
                orders: list_filtered
            }
        },
        getRole(){
            return this.$store.state.auth.role
        },
        getShopList(){
            return this.$store.state.shops.shops
        }
    },
    watch: {
        getShopList(val){
            this.selectedshopid = val[0].shop_id
        }
    },
    methods: {
        formatspace(data){
            return formatspace(data)
        },
        type_check(sts){
            if(sts == 1)
                return "Продажа"
            else if(sts == 2)
                return "Воврат"
            else
                return ''
        },
        onClickCheck(order){
            this.openBasic()
            const menu_list = order.menu_info.map(menuitem => {
                const mitem = this.$store.state.shops.menushop[menuitem.menuid]
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
            this.checkActive = {...order, menu: menu_list}
        },
        openBasic(){
            this.displayBasic = true
        },
        closeBasic(){
            this.displayBasic = false
        },
        onPage(pageNum){
            this.page = pageNum
        },
        changeStatus(sts){
            this.$store.dispatch('shops/change_order', {
                id: this.checkActive.id,
                cashierid: this.checkActive.cashierid,
                status: sts
            })
            .then(res => {
                return this.$store.dispatch('shops/get_orders')
            })
            .then(res => {
                this.$store.commit('shops/setOrdersOne', res.data)
                this.closeBasic()
            })
        },
        onClickFilter(btn){
            this.filter_btn = this.filter_btn.map(item => {
                if(item.name == btn.name){
                    item.sts = !btn.sts
                    this.filter_active = item.name
                }
                else{
                    item.sts = false
                }
                return item
            })
            if(this.filter_active){
                let startDay = ''
                let endDay = ''
                let today = new Date()

                if(this.filter_active == 'btn_today'){
                    startDay = +new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
                    endDay = +new Date()
                }
                else if(this.filter_active == 'btn_yest'){
                    endDay = +new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
                    startDay = +new Date(endDay - (24 * 60 * 60 * 1000))
                }
                else if(this.filter_active == 'btn_week'){
                    // endDay = +new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
                    // startDay = +new Date(endDay - (7 * 24 * 60 * 60 * 1000))
                    startDay += new Date(today.getFullYear(), today.getMonth(), today.getDate() - (today.getDay() ? today.getDay() - 1 : 6))
                    endDay = +new Date()
                }
                else if(this.filter_active == 'btn_month'){
                    // endDay = +new Date(today.getFullYear(), today.getMonth(), today.getDate(), 24, 0, 0)
                    // startDay = +new Date(endDay - (31 * 24 * 60 * 60 * 1000))
                    startDay = +new Date(today.getFullYear(), today.getMonth(), 1)
                    endDay = +new Date()
                }
                this.datestart = this.transDate(startDay)
                this.dateend = this.transDate(endDay)
            }
        },
        checkHours(hour){
            const dig = parseInt(hour)
            if(dig >= 0 && dig <= 24){
                return hour
            }
            else{
                return '00'
            }
        },
        checkMinutes(min){
            const dig = parseInt(min)
            if(dig >= 0 && dig < 59){
                return min
            }
            else{
                return '00'
            }
        },
        inputDateStart(param, prop){},
        changeDateTime(param, prop){
            this[param][prop] = String(this[param][prop]).padStart(2, "0")
        },
        setActiveReport(item){
            this.reports.map(rep => {
                if(rep.active){
                    rep.active = false
                }
                if(rep.name == item.name){
                    rep.active = true
                    this.activeStatus = rep.status
                }
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
        transDate(date){
            const formatdate = new Date(date)
            // return formatdate.toLocaleDateString("ru-RU", options)
            return {
                milisec: formatdate,
                date: formatdate.getFullYear() + '-' + (formatdate.getMonth()+1) + '-' + formatdate.getDate(),
                year: formatdate.getFullYear(),
                month: formatdate.getMonth(),
                day: formatdate.getDate(),
                hours: String(formatdate.getHours()).padStart(2, "0"),
                minutes: String(formatdate.getMinutes()).padStart(2, "0")
            }
        },
    },
    created(){
        this.$store.dispatch('shops/getChecks', ['get_cashiers', 'get_menu', 'get_menu_shop', 'get_orders', 'get_shops'])
    },
    beforeDestroy(){
        this.$store.dispatch('shops/clearChecks')
    }
}
</script>

<style>

</style>
