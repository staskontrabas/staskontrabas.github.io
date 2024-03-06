<template>
    <div class="admin-orders pa-0">
                <drop-down
                    :item="{category: category}"
                    @selectCategory="selectCategory"
                    />
        <div
            class="admin-order toggle-active pa-0"
            >

            <div class="is-active-enabled toggle-active"
                >

                <div class="admin-reports-control" style="flex-direction: column;">
                    <div class="admin-reports-control-times">
                        <div class="admin-reports-control-date">
                            <div class="admin-reports-control-label">Наименование</div>
                            <div class="relative w-100">
                                <input
                                    v-model="name"
                                    type="text"
                                    class="admin-input  w-100"
                                    >
                            </div>
                        </div>
                    </div>
                </div>

                <div class="admin-reports-control" style="flex-direction: column;">
                    <div class="admin-reports-control-times">
                        <div class="admin-reports-control-date">
                            <div class="admin-reports-control-label">Закупочная цена</div>
                            <div class="relative w-100">
                                <InputNumber
                                    v-model="cost"
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
                                    v-model="price"                                    mode="decimal"
                                    class="inputnumber-input"
                                    :useGrouping="false" />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="admin-reports-control">
                    <div class="admin-reports-control-times">
                        <div class="admin-reports-control-date">
                            <div class="admin-reports-control-label">Категория</div>
                            <!-- <drop-down
                                :item="{category: category}"
                                @selectCategory="selectCategory"
                                /> -->
                                <select
                                    v-model="category" class="admin-input w-100">
                                    <option
                                        v-for="cat in categorylist"
                                        :value="cat.code">{{cat.name}}</option>
                                </select>
                        </div>
                    </div>
                </div>

                <div class="admin-reports-control">
                    <div class="admin-reports-control-text">
                        <div class="admin-reports-control-date w-100">
                            <div class="admin-reports-control-label">Описание</div>
                            <div class="relative w-100">
                                <textarea
                                    v-model="description"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="admin-reports-control">
                    <div class="admin-reports-control-text">
                        <div class="admin-reports-control-date w-100">
                            <div class="admin-reports-control-label">Полное описание</div>
                            <div class="relative w-100">
                                <textarea
                                    v-model="full_description"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="admin-order-items admin-order-items--slider">
                    <div class="admin-slider">
                        <span>Happy</span>
                        <vue-slider
                            :ref="'slideradd0'"
                            v-model="extra0"
                            v-bind="sliderOptions"/>
                    </div>
                    <div class="admin-slider">
                        <span>Relaxed</span>
                        <vue-slider
                            :ref="'slideradd1'"
                            v-model="extra1"
                            v-bind="sliderOptions"/>
                    </div>
                    <div class="admin-slider">
                        <span>Euphoric</span>
                        <vue-slider
                            :ref="'slideradd2'"
                            v-model="extra2"
                            v-bind="sliderOptions"/>
                    </div>
                </div>

                <div class="admin-order-items admin-order-items--slider">
                    <div
                        class="admin-characters--block">
                        <div class="admin-characters--wrap">
                            <div class="admin-characters--title">Character</div>
                            <div class="admin-characters--items">
                                <character-item
                                    :value="extra3"
                                    :index="3"
                                    :title="'#marijuana'"
                                    @setCharacter="setCharacter"
                                />
                                <character-item
                                    :value="extra4"
                                    :index="4"
                                    :title="'#bong'"
                                    @setCharacter="setCharacter"
                                />
                                <character-item
                                    :value="extra5"
                                    :index="5"
                                    :title="'#shovel'"
                                    @setCharacter="setCharacter"
                                />
                            </div>
                        </div>
                        <div class="admin-characters--wrap">
                            <div class="admin-characters--title">Flavors</div>
                            <div class="admin-characters--items">
                                <character-item
                                    :value="extra6"
                                    :index="6"
                                    :title="'#blueberry'"
                                    @setCharacter="setCharacter"
                                />
                                <character-item
                                    :value="extra7"
                                    :index="7"
                                    :title="'#mango'"
                                    @setCharacter="setCharacter"
                                />
                                <character-item
                                    :value="extra8"
                                    :index="8"
                                    :title="'#sweet'"
                                    @setCharacter="setCharacter"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button
            :class="{'btn--disabled': !checkDiff}"
            @click="addMenu"
            class="admin-auth-btn btn btn--green btn--fill mt-2 w-100">Сохранить</button>
    </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import CharacterItem from "./CharacterItem"
import InputNumber from 'primevue/inputnumber'
import DropDown from "@/components/common/DropDown"

export default {
    name: 'AddMenu',
    components: {
        VueSlider,
        CharacterItem,
        DropDown,
        InputNumber
    },
    props: ['displayAdd'],
    data(){
        return {
            name: "",
            price: 0,
            cost: 0,
            description: "",
            full_description: "",
            category: 2,
            extra0: 0,
            extra1: 0,
            extra2: 0,
            extra3: 0,
            extra4: 0,
            extra5: 0,
            extra6: 0,
            extra7: 0,
            extra8: 0,
            sliderOptions: {
                height: '1rem',
                dotSize: 24,
                clickable: true,
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
            },
            category: '',
            categorylist: [
                {name: 'Indica', code: 0},
                {name: 'Sativa', code: 1},
                {name: 'Hash', code: 2},
                {name: 'Canafood', code: 3}
            ]
        }
    },
    computed: {
        checkDiff(){
            let diff = false
            if(this.name
                && this.price
                && this.cost
                && this.description){
                    diff = true
            }
            return diff
        }
    },
    methods: {
        setCharacter(props){
            this['extra' + props.ind] = props.val
        },
        selectCategory(item, data){
            this.category = data.value.code
        },
        changeCategory(item, data){
            this.category = data.value.code
        },
        addMenu(){
            this.$store.dispatch('shops/add_menu', {
                name: this.name,
                price: this.price,
                cost: this.cost,
                category: this.category,
                description: this.description,
                full_description: this.full_description,
                extra: [this.extra0, this.extra1, this.extra2, this.extra3, this.extra4, this.extra5, this.extra6, this.extra7, this.extra8, 2],
                shopid: 0
            })
            .then(res => {
                this.$store.dispatch('shops/getReports', ['get_menu', 'get_menu_shop'])
            })
            this.$emit('update:displayAdd', false)
        }
    }
}
</script>
