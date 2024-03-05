<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Расстояние до компонента
            <v-spacer></v-spacer>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4" style="background-color: #fbfbfb;" ref="body">
            <div class="m-text--size14 m-text--color-black pb-3">
                Укажите между какими элементами нужно найти геометрический коллизии.
            </div>
            <div class="m-text--size12 m-text--color-black ">
                Выбрать набор правил
            </div>
            <v-select
                class="m-text--size14"
                dense
                label=""
                placeholder=" "
                v-model="group"
                :items="groupList"
                item-text="name"
                item-value="id"
                return-object
                append-outer-icon="trd-group-add"
                @input="onInputGroup"
                @click:append-outer="groupAdd()"
                hide-details
            />
            <div class="m-text--size12 m-text--color-black pt-4">
                Название проверки
            </div>
            <v-text-field
                v-model="ruleName"
                @input="onInputName"
                class="m-text--size14"
                dense
            ></v-text-field>
            <div class="m-text--size12 m-text--color-black pt-4">
                Описание
            </div>
            <v-textarea
                placeholder=" "
                label=""
                v-model="description"
                @input="onInputDesc"
                multi-line
                rows="2">
            </v-textarea>
            <div class="m-text--size12 m-text--color-black ">
                Выбрать тип стандарта
            </div>
            <v-select
                class="m-text--size14"
                dense
                label=""
                placeholder=" "
                v-model="standart"
                :items="standartList"
                @change="setStandart"
                item-text="title"
                item-value="value"
            />
            <div class="m-text--size12 m-text--color-black pt-4">
                Тег / Код проверки
            </div>
            <v-text-field
                v-model="tagCode"
                class="m-text--size14"
                dense
            ></v-text-field>
            <div class="m-text--size12 m-text--color-black pt-4 fillline">
                <span>Параметры</span>
            </div>
            <v-row>
                <v-col :cols="8">
                    <div class="m-text--size12 m-text--color-black pt-4">
                        Метод расчета расстояний
                    </div>
                    <v-select
                        class="m-text--size14"
                        dense
                        label=""
                        placeholder=" "
                        v-model="method"
                        :items="methodList"
                        @change="setMethod"
                        item-text="title"
                        item-value="value"
                    />
                    <div class="m-text--size12 m-text--color-black pt-4">
                        Поверхность компонента
                    </div>
                    <v-select
                        class="m-text--size14"
                        dense
                        label=""
                        placeholder=" "
                        v-model="side"
                        :items="getSideList"
                        @change="setSide"
                        item-text="title"
                        item-value="value"
                    />
                </v-col>
                <v-col :cols="4" class="px-8">
                    <v-img
                        :src="getImgSrc"
                    ></v-img>
                </v-col>
            </v-row>
            <v-col>
                <v-row align="center">
                    <v-checkbox
                        v-model="max.check"
                        @change="onChangeMax"
                        hide-details
                        class="shrink mr-0 mt-0 pt-0"
                        ></v-checkbox>
                    <span class="m-text--color-black pr-4 mt-1">{{max.title}}</span>
                    <v-text-field
                        class="mt-0 pt-0"
                        :disabled="!max.check"
                        @input="onChangeMax"
                        suffix="мм"
                        hide-details
                        v-model="max.value">
                    </v-text-field>
                </v-row>
                <v-row align="center">
                    <v-checkbox
                        v-model="min.check"
                        @change="onChangeMin"
                        hide-details
                        class="shrink mr-0 mt-0 pt-0"
                        ></v-checkbox>
                    <span class="m-text--color-black pr-4">{{min.title}}</span>
                    <v-text-field
                        :disabled="!min.check"
                        @input="onChangeMin"
                        suffix="мм"
                        v-model="min.value">
                    </v-text-field>
                </v-row>
            </v-col>
            <div class="m-text--size12 m-text--color-black pt-4 fillline">
                <span>Исходные компоненты для проверки</span>
            </div>

            <element-parameters
                :temp="temp"
                :componentNames="componentNames"
                :listName="'source'"
                @setParams="setParams"
                @setComponent="setComponent"
            />

            <div class="m-text--size12 m-text--color-black pt-4 fillline">
                <span>Целевые компоненты для проверки</span>
            </div>
            <element-parameters
                :temp="temp"
                :componentNames="componentNames"
                :listName="'target'"
                @setParams="setParams"
                @setComponent="setComponent"
            />

        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-btn
                :disabled="!verify"
                outlined
                color="primary"
                class="m-btn"
                @click="saveTemplate">Сохранить как шаблон
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="back">Отмена</v-btn>
            <v-btn :disabled="!verify" outlined color="primary" class="m-btn" @click="saveRules">Сохранить
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import {html2text} from '@/utils/services'
import ElementParameters from './common/ElementParameters'

export default {
    name: 'RulesSettingsDistance',
    components: {
        ElementParameters
    },
    props: ['temp', 'model', 'componentNames'],
    data(){
        return {
            scrollTop: this.temp.scrollTop || 0,
            group: this.temp.group || '',
            ruleName: this.temp.ruleName || '',
            tagCode: this.temp.tcode || '',
            description: this.temp.desc || '',
            standart: this.temp.std || '',
            standartList: [{
                    name: 'ksi',
                    value: 'ksi',
                    title: 'Классификатор строительной информации'
                },{
                    name: 'bim',
                    value: 'bim',
                    title: 'BIM Standart'
            }],
            method: this.temp.mtd || 'horizont',
            methodList: [{
                name: 'horizont',
                value: 'horizont',
                title: 'Горизонтальное расстояние между проекциями',
                alias: 'Horizontal Distance Between Projections'
            },{
                name: 'close',
                value: 'close',
                title: 'Кратчайшее расстояние между 3D телами',
                alias: 'Distance between entites'
            },{
                name: 'up',
                value: 'up',
                title: 'Сверху',
                alias: 'To up'
            },{
                name: 'dowm',
                value: 'down',
                title: 'Снизу',
                alias: 'To down'
            },{
                name: 'beside',
                value: 'beside',
                title: 'Рядом в горизонтальной плоскости',
                alias: 'Near in a horizontal plane'
            }],
            side: this.temp.side || 'left.right_left',
            sideList: {
                horizont: [{
                    name: 'left.right_left',
                    value: 'left.right_left',
                    title: 'Слева от правой грани до левой',
                    alias: 'From left of right side A to left side B'
                },{
                    name: 'left.right_right',
                    value: 'left.right_right',
                    title: 'Слева от правой грани до правой',
                    alias: 'From left of right side A to right side B'
                },{
                    name: 'left.left_left',
                    value: 'left.left_left',
                    title: 'Слева от левой грани до левой',
                    alias: 'From left of left side A to left side B'
                },{
                    name: 'left.left_right',
                    value: 'left.left_right',
                    title: 'Слева от левой грани до правой',
                    alias: 'From left of left side A to right side B'
                },{
                    name: 'right.right_left',
                    value: 'right.right_left',
                    title: 'Справа от правой грани до левой',
                    alias: 'From right of right side A to left side B'
                },{
                    name: 'right.right_right',
                    value: 'right.right_right',
                    title: 'Справа от правой грани до правой',
                    alias: 'From right of right side A to right side B'
                },{
                    name: 'right.left_left',
                    value: 'right.left_left',
                    title: 'Справа от левой грани до левой',
                    alias: 'From right of left side A to left side B'
                },{
                    name: 'right.left_right',
                    value: 'right.left_right',
                    title: 'Справа от левой грани до правой',
                    alias: 'From right of left side A to right side B'
                }],
                close: [{
                    name: 'center_center',
                    value: 'center_center',
                    title: 'От центра до центра',
                    alias: 'From center to center'
                }],
                up: [{
                    name: 'up_down',
                    value: 'up_down',
                    title: 'От Верха до Низа',
                    alias: 'From top side A to bottom side B'
                },{
                    name: 'down_up',
                    value: 'down_up',
                    title: 'От Низа до Верха',
                    alias: 'From bottom side A to top side B'
                },{
                    name: 'up_up',
                    value: 'up_up',
                    title: 'От Верха до Верха',
                    alias: 'From top side A to top side B'
                },{
                    name: 'down_down',
                    value: 'down_down',
                    title: 'От Низа до Низа',
                    alias: 'From bottom side A to bottom side B'
                }],
                down: [{
                    name: 'up_down',
                    value: 'up_down',
                    title: 'От Верха до Низа',
                    alias: 'From top side A to bottom side B'
                },{
                    name: 'down_up',
                    value: 'down_up',
                    title: 'От Низа до Верха',
                    alias: 'From bottom side A to top side B'
                },{
                    name: 'up_up',
                    value: 'up_up',
                    title: 'От Верха до Верха',
                    alias: 'From top side A to top side B'
                },{
                    name: 'down_down',
                    value: 'down_down',
                    title: 'От Низа до Низа',
                    alias: 'From bottom side A to bottom side B'
                }],
                beside: [{
                    name: 'left_right',
                    value: 'left_right',
                    title: 'Слева',
                    alias: 'To left'
                },{
                    name: 'right_left',
                    value: 'right_left',
                    title: 'Справа',
                    alias: 'To right'
                }],
            },
            max: {
                value: this.temp.max
                    ? (this.temp.max.value || 0)
                    : 0,
                title: 'Проверка максимального расстояния',
                check: this.temp.max
                    ? this.temp.max.check
                    : true
            },
            min: {
                value: this.temp.min
                    ? (this.temp.min.value || 0)
                    : 0,
                title: 'Проверка минимального расстояния',
                check: this.temp.min
                    ? this.temp.min.check
                    : false
            }
        }
    },
    computed: {
        groupList(){
            let collisions = this.$store.state.common.meta.collisions
            let groups = collisions ? collisions.groups || [] : []
            return groups
        },
        getSideList(){
            return this.sideList[this.method] || []
        },
        getImgSrc(){
            let src = ''
            if(this.method && this.side){
                let name = this.method + '.' + this.side
                src = require(`@/assets/images/distance/${name}.png`)
            }
            return src
        },
        elementssource(){
            if(!this.standart){
                return []
            }
            else{
                let list = this.temp.list_source || []
                let elements = this.temp.elementssource || []
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
        elementstarget(){
            if(!this.standart){
                return []
            }
            else{
                let list = this.temp.list_target || []
                let elements = this.temp.elementstarget || []
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
        verify(){
            return !!this.group && !!this.ruleName && !!this.elementssource.length && !!this.elementstarget.length && (this.max.check || this.min.check)
        }
    },
    methods: {
        cancel(){
            this.$emit('cancel')
        },
        back(){
            this.$emit('setParams', {})
            this.setComponent()
        },
        setComponent(v){
            this.$emit('setComponent', v)
        },
        setParams(v){
            this.$emit('setParams', v)
        },
        setStandart(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    std: v
                }
            this.$emit('setParams', update)
        },
        onChangeMax(){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    max: {value: this.max.value, check: this.max.check}
                }
            this.$emit('setParams', update)
        },
        onChangeMin(){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    min: {value: this.min.value, check: this.min.check}
                }
            this.$emit('setParams', update)
        },
        setMethod(v){
            this.side = this.sideList[v][0].value
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    mtd: v,
                    side: ''
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
        onInputGroup(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    group: v
                }
            this.$emit('setParams', update)
        },
        onInputName(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    ruleName: v
                }
            this.$emit('setParams', update)
        },
        onInputDesc(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    desc: v
                }
            this.$emit('setParams', update)
        },
        groupAdd(){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    ruleName: this.ruleName,
                    group: this.group,
                    desc: this.description
                }
            this.$emit('setParams', update)
            this.setComponent('GroupAdd')
        },
        saveRules(){
            let groups = []
            if(this.temp.editType == 'rule'){
                let groupMap = this.groupList.reduce((r, i) => {
                    r[i.id] = i
                    return r
                }, {})
                let rule = groupMap[this.temp.group.id].children.find(i => i.id == this.temp.editId)

                if(this.group.id != this.temp.group.id){
                    groupMap[this.temp.group.id].children = groupMap[this.temp.group.id].children.filter(i => i.id != this.temp.editId)
                    rule.parent = this.group.id
                    groupMap[this.group.id].children.push(rule)
                }
                groupMap[this.group.id].children =
                groupMap[this.group.id].children.map(c => {
                    if(c.id == this.temp.editId){
                        c.std = this.standart
                        c.name = this.ruleName
                        c.elemstype = this.temp.elemstype
                        c.mtd = this.method
                        c.method = this.methodList.find(f => f.value == this.method).alias
                        c.side = this.side
                        c.submethod = this.sideList[this.method].find(f => f.value == this.side).alias
                        c.tcode = this.tagCode
                        c.max = {value: this.max.value, check: this.max.check}
                        c.min = {value: this.min.value, check: this.min.check}
                        c.elementssource = this.elementssource.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        })
                        c.elementstarget = this.elementstarget.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        })
                        c.status = -1
                        c.desc = this.description
                    }
                    return c
                })
                groups = Object.entries(groupMap).map(([k, v]) => {
                    return v
                })
            }
            else{
                groups = this.groupList.map(g => {
                    if(g.id == this.group.id){
                        return {
                            ...g,
                            children: [...g.children, {
                                id: uuidv4(),
                                parent: g.id,
                                type: 'rules',
                                part: 'distance',
                                std: this.standart,
                                name: this.ruleName,
                                status: -1,
                                elemstype: this.temp.elemstype,
                                desc: this.description,
                                mtd: this.method,
                                method: this.methodList.find(f => f.value == this.method).alias,
                                side: this.side,
                                submethod: this.sideList[this.method].find(f => f.value == this.side).alias,
                                tcode: this.tagCode,
                                max: {value: this.max.value, check: this.max.check},
                                min: {value: this.min.value, check: this.min.check},
                                elementssource: this.elementssource.map(e => {
                                    return {
                                        name: e.name,
                                        values: e.values
                                    }
                                }),
                                elementstarget: this.elementstarget.map(e => {
                                    return {
                                        name: e.name,
                                        values: e.values
                                    }
                                })
                            }]
                        }
                    }
                    else{
                        return g
                    }
                })
            }
            this.$emit('save', {groups: groups})
            this.cancel()
        },
        saveTemplate(){
            let templates = this.$store.state.workflow.templates_collision
            let group = templates.find(f => f.name == this.group.name)
            if(group){
                let ruleName = this.ruleName
                let ruleId = uuidv4()
                group.children.map(c => {
                    if(c.name == ruleName){
                        ruleName += '_' + ruleId
                    }
                })
                group = {
                    ...group,
                    children: [...group.children, {
                        id: ruleId,
                        parent: group.id,
                        type: 'rules',
                        part: 'distance',
                        std: this.standart,
                        name: ruleName,
                        mtd: this.method,
                        method: this.methodList.find(f => f.value == this.method).alias,
                        side: this.side,
                        submethod: this.sideList[this.method].find(f => f.value == this.side).alias,
                        tcode: this.tagCode,
                        max: {value: this.max.value, check: this.max.check},
                        min: {value: this.min.value, check: this.min.check},
                        status: -1,
                        elemstype: this.temp.elemstype,
                        elementssource: this.elementssource.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        }),
                        elementstarget: this.elementstarget.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        }),
                        desc: this.description
                    }]
                }
            }
            else{
                let groupId = uuidv4()
                group = {
                    id: groupId,
                    name: this.group.name,
                    status: -1,
                    type: 'group',
                    children: [{
                        id: uuidv4(),
                        parent: groupId,
                        type: 'rules',
                        part: 'distance',
                        std: this.standart,
                        name: this.ruleName,
                        mtd: this.method,
                        method: this.methodList.find(f => f.value == this.method).alias,
                        side: this.side,
                        submethod: this.sideList[this.method].find(f => f.value == this.side).alias,
                        tcode: this.tagCode,
                        max: {value: this.max.value, check: this.max.check},
                        min: {value: this.min.value, check: this.min.check},
                        status: -1,
                        elemstype: this.temp.elemstype,
                        elementssource: this.elementssource.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        }),
                        elementstarget: this.elementstarget.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        }),
                        desc: this.description
                    }]
                }
            }
            this.$store.dispatch('workflow/updateCollisionTemplates', [group])
            .then(res => {
                if(res.error){
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Ошибка сохранения шаблона. ' + res.data.error,
                        message: 'Ошибка сохранения шаблона. ' + res.data.error,
                    })
                }
                else{
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Шаблон сохранен.',
                        message: 'Шаблон сохранен.',
                    })
                }
            })
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.cancel()
            }
        },
        scrollTo(e){
            let top = e.target.scrollTop
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                scrollTop: top
                }
            this.$emit('setParams', update)
        }
    },
    mounted(){
        this.$refs['body'].scrollTop = this.scrollTop
        this.$refs['body'].addEventListener('scroll', this.scrollTo, false)
    },
    beforeDestroy(){
        document.removeEventListener('keyup', this.enter, false)
        this.$refs['body'].removeEventListener('scroll', this.scrollTo, false)
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
