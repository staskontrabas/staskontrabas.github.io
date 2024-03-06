<template>
    <div class="admin-reports">
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
                                        <span class="a-calendar" style="color: #fff;font-size: 26px;"></span>
                                        <!-- <img :src="require('@/assets/svg/calendar.svg')" alt=""> -->
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
                        <div class="admin-reports-title-total">{{item.code}}</div>
                        <div class="admin-reports-title-total">{{formatspace({text: getReports[item.name]})}}</div>
                    </div>
                </div>

                <div class="admin-reports-chart">
                    <chart
                     :key="keyid"
                        :options="getReports.chartOptions"></chart>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
// import {VueDatePicker} from '@mathieustan/vue-datepicker'
import {VueDatePicker} from '@/utils/vue-datepicker.esm.js'
import { Chart } from 'highcharts-vue'
import {formatspace} from "@/utils/services"

export default {
    name: 'Reports',
    components: {
        VueDatePicker,
        Chart
    },
    data(){
        return {
            keyid: Date.now(),
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
            reports: [{
                title: 'Продажи',
                name: 'sales',
                code: 'THB',
                value: '',
                status: 1,
                active: true
            },
            {
                title: 'Возвраты',
                name: 'returns',
                code: 'THB',
                value: '',
                status: 2,
                active: false
            },
            {
                title: 'Скидки',
                name: 'discount',
                code: 'THB',
                value: '',
                status: null,
                active: false
            },
            {
                title: 'Выручка',
                name: 'revenue',
                code: 'THB',
                value: '',
                status: 1,
                active: false
            }
            ],
            activeStatus: 1,
            selectedshopid: -1
        }
    },
    computed: {
        getReports(){
            let count = 0
            let sales = 0
            let returns = 0
            let discount = 0
            let revenue = 0
            let chart = {

            }
            //0, 1,2 - открыт закрыт (оплачен ) и неоплачен (отменен )
            const role = this.$store.state.auth.role
            const orders = this.$store.state.shops.orders
            const menu = this.$store.state.shops.menu
            const cashiers = this.$store.state.shops.cashiers
            const status = this.activeStatus
            const report_active = this.reports.find(rep => rep.active)

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
                if(time >= startDay && time <= endDay && (cashiers.some(cas => cas.cashier_id == order.cashierid) || role == 'superadmin')){
                    count += 1
                    discount += order.discount
                    if(order.status == 1){
                        sales += order.paidsum
                        order.menu_info.map(item => {
                            if(menu[item.menuid]){
                                revenue += (menu[item.menuid].price - menu[item.menuid].cost - (order.discount || 0)) * item.count
                            }
                        })
                    }
                    if(order.status == 2){
                        returns += order.paidsum
                    }
                    if(status == null || (status != null && order.status == status)){
                        if(((report_active.name == 'sales' || report_active.name == 'revenue') && order.status == 1)
                            || (report_active.name == 'returns' && order.status == 2)
                            || (report_active.name == 'discount' && order.discount)){
                                return order
                        }
                    }
                }
            })

            let ind = 0

            list.map(order => {
                    if(!chart[+new Date(this.transDate(+new Date(order.time * 1000)).date)]){
                        ind = 0
                    }

                        if(report_active.name == 'revenue'){
                            order.menu_info.map(item => {
                                if(menu[item.menuid]){
                                    ind += (menu[item.menuid].price - menu[item.menuid].cost - (order.discount || 0)) * item.count
                                }
                            })
                        }
                        else{
                            ind += order.paidsum
                        }
                    chart[+new Date(this.transDate(+new Date(order.time * 1000)).date)] = ind
                })

            let cat = Object.keys(chart).map(key => {
                return this.formatDate(key / 1000, 'dmy')
            })
            let sdata = Object.values(chart)

            return {
                count: count,
                sales: sales,
                returns: returns,
                discount: discount,
                revenue: revenue,
                orders: list,
                chartOptions: {
                    title: {
                        text: report_active.title
                    },
                    xAxis: {
                        categories: cat
                    },
                    yAxis: {
                        title: {
                            text: ""
                        }
                    },
                    series: [{
                        type: 'column',
                        color: '#87c03d',
                        name: '',
                        data: sdata
                    }],
                    accessibility: {
                        enabled: false
                    }
                }
            }
        },
        getShopList(){
            return this.$store.state.shops.shops
        },
        getRole(){
            return this.$store.state.auth.role
        },
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
                    startDay += new Date(today.getFullYear(), today.getMonth(), today.getDate() - (today.getDay() ? today.getDay() - 1 : 6))
                    endDay = +new Date()
                }
                else if(this.filter_active == 'btn_month'){
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
            return {
                milisec: formatdate.getTime(),
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
        this.$store.dispatch('shops/getChecks', ['get_cashiers', 'get_menu', 'get_orders', 'get_shops'])
    },
    beforeDestroy(){
        this.$store.dispatch('shops/clearChecks')
    }
}
</script>
