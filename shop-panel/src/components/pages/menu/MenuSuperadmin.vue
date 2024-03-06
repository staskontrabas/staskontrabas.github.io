<template>
    <div class="admin-container">

        <div class="admin-orders">

            <search
                :plholder="'наименование'"
                :search_val.sync="search_val"
            />

            <div
                v-for="item in getMenu.menu"
                class="admin-order"
                :class="{'toggle-active': item.active}"
                >
                <div class="admin-order-header admin-order-header--menu">
                    <button
                        @click="toggleCard(item)"
                        class="admin-order-header-expand btn btn--green btn--contur btn--icon"
                        :class="{'toggle-active': item.active}"
                        >
                        <span class="active-enabled">-</span>
                        <span class="active-disabled">+</span>
                    </button>
                    <div class="admin-order-id">#{{item.sku}}</div>
                    <div class="admin-header-logo">{{item.name}}</div>
                    <div class="admin-order-header-status">
                        {{item.cost}} / {{item.price}}
                    </div>
                    <div class="admin-order-header-status">
                        <toggle-button
                            v-if="getRole !== 'superadmin'"
                            :color="switch_color"
                            :height="30"
                            :width="65"
                            :value="item.added"
                            @change="setItemActive(item)"
                            />
                    </div>
                </div>

                <div
                    class="is-active-enabled"
                    :class="{'toggle-active': item.active}"
                    >

                    <div
                        class="admin-reports-control pt-3">
                        <div
                            v-if="getRole == 'superadmin'"
                            class="admin-reports-control-times">
                            <div class="admin-reports-control-date">
                                <div class="admin-reports-control-label">Наименование</div>
                                <div class="relative w-100">
                                    <input
                                        :value="item.name"
                                        type="text"
                                        class="admin-input w-100"
                                        @input="inputProp($event, item, 'name', 'text')"
                                        >
                                </div>
                            </div>
                        </div>
                        <div class="admin-reports-control-times">
                            <div class="admin-reports-control-date">
                                <div class="admin-reports-control-label">Остатки на складе</div>
                                <div class="relative w-100">
                                    <InputNumber
                                        :value="item.count"
                                        @input="inputProp($event, item, 'count', 'num')"
                                        mode="decimal"
                                        class="inputnumber-input"
                                        :useGrouping="false" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="admin-reports-control">
                        <div class="admin-reports-control-times">
                            <div class="admin-reports-control-date">
                                <div class="admin-reports-control-label">Закупочная цена</div>
                                <div class="relative w-100">
                                    <InputNumber
                                        :value="item.cost"
                                        @input="inputProp($event, item, 'cost', 'num')"
                                        mode="decimal"
                                        class="inputnumber-input"
                                        :useGrouping="false" />
                                </div>
                            </div>
                        </div>
                        <div class="admin-reports-control-times">
                            <div class="admin-reports-control-date">
                                <div class="admin-reports-control-label">Стоимость</div>
                                <div class="relative w-100">
                                    <InputNumber
                                        :value="item.price"
                                        @input="inputProp($event, item, 'price', 'num')"
                                        mode="decimal"
                                        class="inputnumber-input"
                                        :useGrouping="false" />
                                </div>
                            </div>
                        </div>
                        <div
                            v-if="getRole == 'admin'"
                            class="admin-reports-control-times"
                            style="padding-top: calc(1rem + 10px);">
                            <button
                                class="btn btn--fill btn--green admin-search-btn"
                                :class="{'btn--disabled': !item.diff}"
                                @click="updateMenu(item)"
                                >Сохранить</button>
                            </div>
                    </div>

                    <div
                        v-if="getRole == 'superadmin'"
                        class="admin-reports-control">
                        <div class="admin-reports-control-times">
                            <div class="admin-reports-control-date">
                                <div class="admin-reports-control-label">Категория</div>
                                <drop-down
                                    :item="item"
                                    @selectCategory="selectCategory"
                                    />
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="getRole == 'superadmin'"
                        class="admin-reports-control">
                        <div class="admin-reports-control-text">
                            <div class="admin-reports-control-date w-100">
                                <div class="admin-reports-control-label">Описание</div>
                                <div class="relative w-100">
                                    <textarea
                                        :value="item.description"
                                        @input="inputProp($event, item, 'description', 'text')"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="getRole == 'superadmin'"
                        class="admin-reports-control">
                        <div class="admin-reports-control-text">
                            <div class="admin-reports-control-date w-100">
                                <div class="admin-reports-control-label">Полное описание</div>
                                <div class="relative w-100">
                                    <textarea
                                        :value="item.full_description"
                                        @input="inputProp($event, item, 'full_description', 'text')"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="getRole == 'superadmin'"
                        class="admin-order-items admin-order-items--slider">
                        <div class="admin-slider">
                            <span>Happy</span>
                            <vue-slider
                                :ref="'slider' + item.sku + 0"
                                :value="item.extra[0]"
                                @drag-start="sliderSart"
                                @change="setSliderVal(item, 0)"
                                @drag-end="sliderEnd(item, 0)"
                                v-bind="sliderOptions"/>
                        </div>
                        <div class="admin-slider">
                            <span>Relaxed</span>
                            <vue-slider
                                :ref="'slider' + item.sku + 1"
                                :value="item.extra[1]"
                                @drag-start="sliderSart"
                                @change="setSliderVal(item, 1)"
                                @drag-end="sliderEnd(item, 1)"
                                v-bind="sliderOptions"/>
                        </div>
                        <div class="admin-slider">
                            <span>Euphoric</span>
                            <vue-slider
                                :ref="'slider' + item.sku + 2"
                                :value="item.extra[2]"
                                @drag-start="sliderSart"
                                @change="setSliderVal(item, 2)"
                                @drag-end="sliderEnd(item, 2)"
                                v-bind="sliderOptions"/>
                        </div>
                    </div>

                    <div
                        v-if="getRole == 'superadmin'"
                        class="admin-order-items admin-order-items--slider">
                        <div
                            class="admin-characters"
                            :style="{'pointer-events': getRole == 'superadmin' ? 'auto' : 'none'}">
                            <div class="admin-characters--wrap">
                                <div class="admin-characters--title">Character</div>
                                <div class="admin-characters--items">
                                    <character-item
                                        :value="item.extra[3]"
                                        :index="3"
                                        :item="item"
                                        :title="'#marijuana'"
                                        @setCharacter="setCharacter"
                                    />
                                    <character-item
                                        :value="item.extra[4]"
                                        :index="4"
                                        :item="item"
                                        :title="'#bong'"
                                        @setCharacter="setCharacter"
                                    />
                                    <character-item
                                        :value="item.extra[5]"
                                        :index="5"
                                        :item="item"
                                        :title="'#shovel'"
                                        @setCharacter="setCharacter"
                                    />
                                </div>
                            </div>
                            <div class="admin-characters--wrap">
                                <div class="admin-characters--title">Flavors</div>
                                <div class="admin-characters--items">
                                    <character-item
                                        :value="item.extra[6]"
                                        :index="6"
                                        :item="item"
                                        :title="'#blueberry'"
                                        @setCharacter="setCharacter"
                                    />
                                    <character-item
                                        :value="item.extra[7]"
                                        :index="7"
                                        :item="item"
                                        :title="'#mango'"
                                        @setCharacter="setCharacter"
                                    />
                                    <character-item
                                        :value="item.extra[8]"
                                        :index="8"
                                        :item="item"
                                        :title="'#sweet'"
                                        @setCharacter="setCharacter"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="getRole == 'superadmin'"
                        class="admin-order-items--aciton">
                        <div></div>
                        <div class="admin-order-header-status">
                            <button
                                class="btn btn--fill btn--red admin-search-btn"
                                @click="removeMenu(item)"
                                >Удалить</button>
                        </div>
                        <div class="admin-order-header-status">
                            <button
                                class="btn btn--fill btn--green admin-search-btn"
                                :class="{'btn--disabled': !item.diff}"
                                @click="updateMenu(item)"
                                >Сохранить</button>
                        </div>
                    </div>

                </div>
            </div>

            <pagination
                :v-if="true"
                :length="getMenu.count"
                :perPage.sync="perPage"
                @paginator="onPage"/>
        </div>

        <div class="admin-stores">
            <div
                v-if="getRole == 'superadmin'"
                class="admin-store-form">
                <div class="admin-auth-logo">добавить позицию меню</div>
                <div class="admin-store-form-fields" style="justify-content: center;">
                    <button
                        @click="displayAdd=true"
                        class="btn btn--green btn--fill">добавить</button>
                </div>
            </div>
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

export default {
    name: 'MenuSuperadmin',
    components: {
        Search,
        Pagination,
        DropDown,
        VueSlider,
        ToggleButton,
        CharacterItem,
        AddMenu,
        InputNumber
    },
    data(){
        return {
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
            // const description = this.description

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
                        full_description: elem.full_description || '',
                        // active:  menuMap[pos.sku].active,
                        // extra: menuMap[pos.sku].extra,
                        // diff: menuMap[pos.sku].diff
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
            // this.$store.dispatch('shops/toggleMenuActive', {
            //     sku: item.sku,
            //     active: !item.active
            // })
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
