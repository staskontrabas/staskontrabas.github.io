<template>
    <div class="admin-container">
        <div class="admin-orders">

            <search
                :plholder="'наименование'"
                :search_val.sync="search_val"
            />

            <div class="admin-checks-table">
                <div class="admin-checks-tr admin-checks-thead">
                    <div class="admin-checks-cell admin-checks-cell-date">Название</div>
                    <div class="admin-checks-cell admin-checks-cell-employe">Категория</div>
                    <div class="admin-checks-cell admin-checks-cell-client">Цена</div>
                    <div class="admin-checks-cell admin-checks-cell-type">Себестоимость</div>
                    <div class="admin-checks-cell admin-checks-cell-total">Остаток</div>
                    <div class="admin-checks-cell admin-checks-cell-total"></div>
                </div>

                <div
                    v-for="item in getMenu.menu"
                    class="admin-checks-tr">
                    <div class="admin-checks-cell">
                        {{item.name}}</div>
                    <div class="admin-checks-cell">
                        {{getCategoryName(item.category)}}</div>
                    <div
                        @click="changeProp(item.id, 'price')"
                        class="admin-checks-cell admin-checks-cell--edit relative"
                        >
                        <confirm-popup
                            v-if="focusid == item.id && focusprop == 'price'"
                            @cancelProp="cancelProp"
                            :value="item.price"
                            :item="item"
                            :propname="'price'"
                            />
                        {{item.price}}</div>
                    <div
                        @click="changeProp(item.id, 'cost')"
                        class="admin-checks-cell admin-checks-cell--edit relative">
                        <confirm-popup
                            v-if="focusid == item.id && focusprop == 'cost'"
                            @cancelProp="cancelProp"
                            :value="item.cost"
                            :item="item"
                            :propname="'cost'"
                            />
                        {{item.cost}}</div>
                    <div
                        @click="changeProp(item.id, 'count')"
                        class="admin-checks-cell admin-checks-cell--edit relative">
                        <confirm-popup
                            v-if="focusid == item.id && focusprop == 'count'"
                            @cancelProp="cancelProp"
                            :value="item.count"
                            :item="item"
                            :propname="'count'"
                            />
                        {{item.count}}
                    </div>
                    <div class="admin-checks-cell">
                        <toggle-button
                            :color="switch_color"
                            :height="20"
                            :width="45"
                            :value="item.added"
                            @change="setItemActive(item)"
                            />
                    </div>
                </div>
            </div>

            <pagination
                :v-if="true"
                :length="getMenu.count"
                :perPage.sync="perPage"
                @paginator="onPage"/>
        </div>

        <Dialog
            :showHeader="false"
            :modal="true"
            :dismissableMask="false"
            :closable="true"
            :visible.sync="displayAdd"
            class="addmenu"
            >
            <div class="header">
                <span
                    @click="closeAdd"
                    class="btn-close">&#10005;</span>
            </div>
            <div class="popup">
                <div class="popup__title">Добавить позицию меню</div>
                <div class="popup-fields">
                    <add-menu
                        :displayAdd.sync="displayAdd"/>
                </div>
            </div>
        </Dialog>

    </div>
</template>

<script>
import Search from "@/components/common/Search"
import Pagination from "@/components/common/Pagination"
import DropDown from "@/components/common/DropDown"
import VueSlider from 'vue-slider-component'
import { ToggleButton } from 'vue-js-toggle-button'
import CharacterItem from "./CharacterItem"
import AddMenu from "./AddMenu"
import InputNumber from 'primevue/inputnumber'
import ConfirmPopup from "./ConfirmPopup"

export default {
    name: 'MenuAdmin',
    components: {
        Search,
        Pagination,
        DropDown,
        VueSlider,
        ToggleButton,
        CharacterItem,
        AddMenu,
        InputNumber,
        ConfirmPopup
    },
    data(){
        return {
            cost: 2,
            search_val: '',
            value: 25,
            page: 1,
            perPage: 10,
            slider: {
                start: 0
            },
            switch_color: {
                checked: '#87c03d',
                unchecked: '#525252'
            },
            edit: 0,
            editMenu: {},
            displayAdd: false,
            addMenu: {
                "id":261,
                "name":"",
                "price":0,
                "cost":0,
                "description":"",
                "icon":null,
                "sku":10011,
                "count":0,
                "extra":[0,0,0,0,0,0,0,0,0,2]
            },
            category: '',
            categorylist: [
                {name: 'Indica', code: 0},
                {name: 'Sativa', code: 1},
                {name: 'Hash', code: 2},
                {name: 'Canafood', code: 3},
                {name: 'Soft Drinks', code: 5}
            ],
            focusid: '',
            focus: {},
            config: {
                handler: this.focusInputRemove,
            }
        }
    },
    computed: {
        sliderOptions(){
            const role = this.getRole
            return {
                height: '1rem',
                dotSize: role == 'superadmin' ? 24 : 0,
                clickable: role == 'superadmin' ? true : false,
                railStyle: {
    				'background-color': 'rgb(135 192 61 / 30%)'
                },
                processStyle: {
    				'background-color': '#87c03d'
                },
                tooltipStyle: {
            		'border-color': '#87c03d',
        			'background-color': '#87c03d'
                },
                description: ''
            }
        },
        getMenu(){
            const menu = this.$store.state.shops.menuList
            const menuMap = this.$store.state.shops.menu
            const menuShopMap = this.$store.state.shops.menushop
            const eMenu = this.editMenu
            const edit = this.edit
            const focus = this.focus

            let list = menu
                .filter(pos => pos.name.toString().toLowerCase().includes(this.search_val) && menuMap[pos.sku])
                .map(pos => {
                    const elem = this.getRole == 'superadmin'
                        ? this.editMenu[pos.sku]
                            ? {...menuMap[pos.sku], ...this.editMenu[pos.sku]}
                            : menuMap[pos.sku]
                        : menuShopMap[pos.sku]
                            ? this.editMenu[pos.sku]
                                ? {...menuShopMap[pos.sku], ...this.editMenu[pos.sku]}
                                : menuShopMap[pos.sku]
                            : menuMap[pos.sku]

                    return {
                        ...elem,
                        added: this.getRole == 'superadmin'
                            ? true
                            : menuShopMap[pos.sku] ? true : false,
                        full_description: elem.full_description || ''
                    }
                })
            const count = list.length

            list = list.slice((this.page - 1) * this.perPage, this.perPage
                ? (this.page - 1) * this.perPage + this.perPage
                : list.length)
            return {
                count,
                menu: list
            }
        },
        getMenuMap(){
            const menuMap = this.$store.state.shops.menu
            return menuMap
        },
        getMenuShopMap(){
            const menuShopMap = this.$store.state.shops.menushop
            return menuShopMap
        },
        getRole(){
            return this.$store.state.auth.role
        }
    },
    methods: {
        changeProp(itemid, prop){
            this.focusid = itemid
            this.focusprop = prop
        },
        cancelProp(){
            this.focusid = false
            this.focusprop = false
        },
        getCategoryName(cat){
            let category = this.categorylist.find(category => category.code == cat)
            return category ? category.name : ''
        },
        openAdd(item, type){
            this.displayAdd = true
        },
        closeAdd(){
            this.displayAdd = false
        },
        onPage(pageNum){
            this.page = pageNum
        },
        toggleCard(item){
            if(this.editMenu[item.sku] == undefined){
                this.editMenu[item.sku] = {...item}
            }
            this.editMenu[item.sku].active = !item.active
            this.edit += 1
        },
        checkDiff(sku){
            let diff = false
            const menu = this.getRole == 'superadmin'
                ? this.getMenuMap
                : this.getMenuShopMap
            if((this.editMenu[sku].cost != menu[sku].cost || this.editMenu[sku].cost == 0)
                || this.editMenu[sku].count != menu[sku].count
                || this.editMenu[sku].price != menu[sku].price
                || this.editMenu[sku].name != menu[sku].name
                || this.editMenu[sku].category != menu[sku].category
                || this.editMenu[sku].full_description != menu[sku].full_description
                || this.editMenu[sku].description != menu[sku].description
                || !this.editMenu[sku].extra.every((val, ind) => val == menu[sku].extra[ind])
            ){
                diff = true
            }
            this.edit += 1
            this.editMenu[sku].diff = diff
        },
        inputProp(val, item, prop, type){
            const value = type == 'text'
                ? val.target.value
                : val
            if(this.editMenu[item.sku] == undefined){
                this.editMenu[item.sku] = {...item}
            }
            this.editMenu[item.sku][prop] = value
            this.checkDiff(item.sku)
        },
        setCharacter(props){
            let extra = [...props.item.extra]
            extra[props.ind] = props.val
            if(this.editMenu[props.item.sku] == undefined){
                this.editMenu[props.item.sku] = {...props.item}
            }
            this.editMenu[props.item.sku].extra = extra
            this.checkDiff(props.item.sku)
        },
        sliderSart(){
            this.slider.start = 1
        },
        setSliderVal(item, ind){
            if(this.slider.start){
                return
            }
            let sku = 'slider' + item.sku + ind
            let extra = [...item.extra]
            extra[ind] = this.$refs[sku][0].getValue()
            if(this.editMenu[item.sku] == undefined){
                this.editMenu[item.sku] = {...item}
            }
            this.editMenu[item.sku].extra = extra
            this.checkDiff(item.sku)
        },
        sliderEnd(item, ind){
            this.slider.start = 0
            let sku = 'slider' + item.sku + ind
            let extra = [...item.extra]
            extra[ind] = this.$refs[sku][0].getValue()
            if(this.editMenu[item.sku] == undefined){
                this.editMenu[item.sku] = {...item}
            }
            this.editMenu[item.sku].extra = extra
            this.checkDiff(item.sku)
        },
        setItemActive(item){
            if(this.getRole == 'superadmin'){
                return
            }
            const shop = parseInt(this.$store.state.auth.shopid)
            const active = item.added ? 0 : 1
            this.$store.dispatch('shops/update_menu', {
                menuid: item.sku,
                name: item.name,
                price: item.price,
                cost: item.cost,
                description: item.description,
                extra: item.extra,
                shopid: shop,
                active: active
            })
        },
        updateMenu(item){
            const shop = parseInt(this.$store.state.auth.shopid)
            this.$store.dispatch('shops/update_menu', {
                menuid: item.sku,
                name: item.name,
                count: this.editMenu[item.sku].count,
                price: this.editMenu[item.sku].price,
                cost: this.editMenu[item.sku].cost || 0,
                category: this.editMenu[item.sku].category,
                description: this.editMenu[item.sku].description,
                full_description: this.editMenu[item.sku].full_description,
                extra: this.editMenu[item.sku].extra,
                shopid: this.getRole == 'superadmin' ? 0 : shop
            })
            .then(res => {
                this.editMenu[item.sku].diff = false
                this.$store.dispatch('shops/getReports', ['get_menu', 'get_menu_shop'])
            })
        },
        removeMenu(item){
            const shop = parseInt(this.$store.state.auth.shopid)
            this.$store.dispatch('shops/delete_menu', {
                menuid: item.sku,
                shopid: this.getRole == 'superadmin' ? 0 : shop
            })
            .then(res => {
                this.$store.dispatch('shops/getReports', ['get_menu', 'get_menu_shop'])
            })
        },
        selectCategory(item, data){
            if(this.editMenu[item.sku] == undefined){
                this.editMenu[item.sku] = {...item}
            }
            this.editMenu[item.sku].category = data.value.code
            this.checkDiff(item.sku)
        }
    },
    created(){
        this.$store.dispatch('shops/getReports', ['get_menu', 'get_menu_shop'])
    },
    beforeDestroy(){
        this.$store.dispatch('shops/clearReports')
    }
}
</script>
