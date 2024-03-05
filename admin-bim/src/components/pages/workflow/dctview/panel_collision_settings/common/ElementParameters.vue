<template>
    <v-row dense>
        <v-col :cols="12" v-for="item in getElements">
            <div class="m-text--size12 m-text--color-black pt-4">
                Название элемента
            </div>
            <div
                class="d-flex">
                <v-text-field
                    :value="item.name"
                    class="m-text--size14"
                    readonly
                    dense
                ></v-text-field>
                <v-btn
                    text
                    @click="removeElement(item)"
                    class="m-btn">
                    <v-icon
                        size="20"
                        left>trd-trash</v-icon>Удалить
                </v-btn>
            </div>
            <v-card
                class="pa-0"
                min-height="30"
                outlined
            >
                <v-card-text class="m-text--color-black pa-0">
                    <v-list flat dense class="pa-0">
                            <v-list-item
                                v-for="value in item.values"
                                class="m-panel__collision--list-item"
                                dense
                                :color="'primary'"
                                :class="{'v-list-item--active': item.selected.some(s => s == value.name)}"
                                :key="value.name"
                                :value="value.name"
                                >
                                <div class="m-flex">
                                    <span
                                        class="m-flex--item"
                                        style="cursor: pointer"
                                        @click="selectParameter(item, value.name)"> {{value.name}}
                                    </span>
                                    <span
                                        class="m-flex--item m-card-list__cell select-cell">
                                        <v-select
                                            class="m-flex--item"
                                            hide-details
                                            persistent-hint
                                            :items="equalList(value.type)"
                                            item-text="title"
                                            item-value="value"
                                            :value="value.equal"
                                            @change="equalParameter($event, item, value.name)"
                                            dense
                                        />
                                    </span>
                                    <span
                                        class="m-flex--item py-0 px-4 m-card-list__cell parameter-cell">
                                        <v-simple-checkbox
                                            v-if="value.type == 'boolean'"
                                            v-model="value.value"
                                            class="ma-0"
                                            dense
                                            placeholder=" "
                                            hide-details
                                            color="primary"
                                        ></v-simple-checkbox>
                                        <v-autocomplete
                                            v-else-if="value.type == 'list'"
                                            class="pa-0 ma-0"
                                            v-model="value.value"
                                            :items="value.list"
                                            item-text="name"
                                            item-value="name"
                                            persistent-hint
                                            placeholder=" "
                                            hide-details
                                            dense
                                            />
                                        <input
                                            v-else-if="value.type == 'integer'"
                                            class="ma-0 pa-0 m-input--noattr"
                                            :value="value.value"
                                            @input="onlyInteger($event, item, value.name)"
                                        ></input>
                                        <input
                                            v-else-if="value.type == 'float'"
                                            class="ma-0 pa-0 m-input--noattr"
                                            :value="value.value"
                                            @input="onlyFloat($event, item, value.name)"
                                        ></input>
                                        <v-text-field
                                            v-else-if="value.type == 'string'"
                                            class="ma-0 pa-0"
                                            placeholder=" "
                                            hide-details
                                            :value="value.value"
                                            @input="valueParameter($event, item, value.name)"
                                            >
                                        </v-text-field>
                                        <v-text-field
                                            v-else
                                            class="ma-0 pa-0"
                                            placeholder=" "
                                            hide-details
                                            :value="value.value"
                                            @change="valueParameter($event, item, value.name)"
                                            >
                                        </v-text-field>
                                    </span>
                                </div>
                            </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
            <v-card-actions>
                <v-btn
                    text
                    @click="parametersAdd(item)"
                    color="primary"
                    class="m-btn">
                    <v-icon
                        size="20"
                        left>mdi-plus-circle-outline</v-icon>Добавить параметр
                </v-btn>
                <v-btn
                    text
                    :disabled="!item.selected.length"
                    @click="removeParameter(item)"
                    class="m-btn">
                    <v-icon
                        size="20"
                        left>trd-trash</v-icon>Удалить
                </v-btn>
            </v-card-actions>

        </v-col>
        <v-col :cols="12">
            <div class="m-text--size12 m-text--color-black pt-4">
                Название элемента
            </div>
            <div
                class="d-flex">
                <v-text-field
                    :disabled="!getStandart"
                    :value="''"
                    class="m-text--size14"
                    readonly
                    dense
                ></v-text-field>
                <v-btn
                    :disabled="!getStandart"
                    text
                    @click="elementAdd(listName)"
                    color="primary"
                    class="m-btn">
                    <v-icon
                        size="20"
                        left>mdi-plus-circle-outline</v-icon>Добавить элемент
                </v-btn>
            </div>
        </v-col>
    </v-row>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import {html2text} from '@/utils/services'

export default {
    name: 'ElementParameters',
    props: {
        temp: {
            type: Object,
            default(){
                return {}
            }
        },
        componentNames: {
            type: Object,
            default(){
                return null
            }
        },
        listName: {
            type: String,
            default: ''
        },
        componentType: {
            type: Array,
            default(){
                return []
            }
        },
        elems_json: {
            type: Object,
            default(){
                return {}
            }
        }
    },
    data(){
        return {
            signList: [{
                title:'>',
                value: 0
            },{
                title: '=',
                value: 1
            },{
                title: '<',
                value: 2
            },{
                title: html2text('&ge;'),
                value: 3
            },{
                title: html2text('&le;'),
                value: 4
            },{
                title: html2text('&ne;'),
                value: 5
            }]
        }
    },
    computed: {
        getListName(){
            return this.listName
                ? 'list_' + this.listName
                : 0
        },
        getStandart(){
            return this.temp.std
        },
        elements(){
            if(!this.getStandart){
                return []
            }
            else{
                let list = this.temp[this.getListName] || []
                let elements = this.temp['elements' + this.listName || ''] || []
                elements = elements.map(e => {
                    return {
                        ...e,
                        selected: e.selected
                            ? e.selected
                            : []
                    }
                })

                list = list
                    .filter(f => !elements.some(s => s.name == f))
                    .map(l => {
                        return {
                            name: l,
                            values: [],
                            selected: []
                        }
                    })
                return [...elements, ...list]
            }
        },
        getElements(){
            if(!this.getStandart){
                return []
            }
            else{
                let componentNames = this.componentNames
                    ? Object.keys(this.componentNames[this.getStandart])
                    : []
                return this.elements.filter(f => componentNames.some(s => s == f.name))
            }
        },
        verify(){
            return !!this.group && !!this.ruleName && !!this.elements.length
        }
    },
    methods: {
        setComponent(v){
            this.$emit('setComponent', v)
        },
        onlyInteger(e, o, n){
            let value = e.target.value.replace(/[^0-9]/g, '')
            this.valueParameter(value, o, n)
        },
        onlyFloat(e, o, n){
            let value = e.target.value.replace(/[^0-9.]/g, '')
            this.valueParameter(value, o, n)
        },
        equalList(type){
            let list = []
            switch(type){
                case 'string': ;
                case 'boolean': ;
                case 'list': list = this.signList.filter(f => f.value == 1 || f.value == 5)
                    break
                case 'integer': ;
                case 'float': list = this.signList
                    break
                default: ;
            }
            return list
        },
        removeElement(i){
            let update = JSON.parse(JSON.stringify(this.temp))
            let list_1 = []
            if(update[this.getListName]){
                list_1 = update[this.getListName].filter(f => f != i.name)
            }
            let elements = []
            if(update['elements' + this.listName || '']){
                elements = update['elements' + this.listName || ''].filter(f => f.name != i.name)
            }
            update = {...update, [this.getListName]: list_1, ['elements' + this.listName || '']: elements}
            this.$emit('setParams', update)
        },
        setStandart(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    std: v
                }
            this.$emit('setParams', update)
        },
        setMethod(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    mtd: v
                }
            this.$emit('setParams', update)
        },
        setSide(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    side: v
                }
            this.$emit('setParams', update)
        },
        elementAdd(l){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    list: l,
                    [this.getListName]: this.elements.map(e => {
                        return e.name
                    }),
                    componentType: this.componentType
                }
            this.$emit('setParams', update)
            this.setComponent('RulesElement')
        },
        parametersAdd(n){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    element: n,
                    list: this.listName,
                    ['elements' + this.listName || '']: this.elements
                }
            this.$emit('setParams', update)
            this.setComponent('GetParams')
        },
        equalParameter(event, i, v){
            let update = JSON.parse(JSON.stringify(this.temp))
            let elements = update['elements' + this.listName || '']
            elements = elements.map(e => {
                return {
                    ...e,
                    values: i.name == e.name
                        ? e.values.map(val => {
                            if(val.name == v){
                                val.equal = event
                            }
                            return val
                        })
                        : e.values
                }
            })

            update = {...update, ['elements' + this.listName || '']: elements}
            this.$emit('setParams', update)
        },
        valueParameter(event, i, v){
            let update = JSON.parse(JSON.stringify(this.temp))
            let elements = this.temp['elements' + this.listName || '']
            elements = elements.map(e => {
                return {
                    ...e,
                    values: i.name == e.name
                        ? e.values.map(val => {
                            if(val.name == v){
                                val.value = event
                            }
                            return val
                        })
                        : e.values
                }
            })

            update = {...update, ['elements' + this.listName || '']: elements}
            this.$emit('setParams', update)
        },
        selectParameter(i, v){
            let update = JSON.parse(JSON.stringify(this.temp))
            // let elements = update['elements' + this.listName || '']
            let elements = this.elements.map(e => {
                return {
                    ...e,
                    selected: i.name == e.name
                        ? e.selected.some(s => s == v)
                            ? e.selected.filter(f => f != v)
                            : [...e.selected, v]
                        : e.selected
                }
            })
            update = {...update, ['elements' + this.listName || '']: elements}
            this.$emit('setParams', update)
        },
        removeParameter(i){
            let update = JSON.parse(JSON.stringify(this.temp))
            let elements = update['elements' + this.listName || '']
            elements = elements.map(e => {
                return {
                    ...e,
                    selected: [],
                    values: i.name == e.name
                        ? e.values.filter(f => !e.selected.some(s => s == f.name))
                        : e.values
                }
            })

            update = {...update, ['elements' + this.listName || '']: elements}
            this.$emit('setParams', update)
        }
    }
}
</script>

<style lang="css" scoped>
.select-cell{
    border-bottom: 0;
    border-left: 1px solid rgba(0, 0, 0, 0.12);
    min-height: auto;
    padding: 0 0 0 14px;
    max-width: 56px;
}
.parameter-cell{
    border: 0;
    min-height: auto;
    height: auto;
}
.fillline{
    display: flex;
    align-items: center;
}
.fillline span{
    padding-right: 10px;
    background-color: #fff;
    white-space: nowrap;
}
.fillline::after{
    content: '';
    display: block;
    height: 1px;
    width: 100%;
    background-color: #707070;
}
</style>
