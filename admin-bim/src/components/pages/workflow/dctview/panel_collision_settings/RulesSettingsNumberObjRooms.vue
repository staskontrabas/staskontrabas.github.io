<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Количество компонентов в помещении
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
                <span>Помещение</span>
            </div>

            <element-parameters
                :temp="temp"
                :componentNames="componentNames"
                :componentType="['RZo']"
                :elems_json="elems_json"
                :listName="'rooms'"
                @setParams="setParams"
                @setComponent="setComponent"
            />

            <div class="m-text--size12 m-text--color-black pt-4 fillline">
                <span>Компоненты для проверки</span>
            </div>

            <div class="m-text--size12 m-text--color-black pt-4">
                Количество
            </div>
            <v-text-field
                v-model="ncontrol"
                class="m-text--size14"
                suffix="шт."
                @input="onInputNumber"
                dense
            ></v-text-field>

            <element-parameters
                :temp="temp"
                :componentNames="componentNames"
                :componentType="['Com']"
                :elems_json="elems_json"
                :listName="'obj'"
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
    name: 'RulesSettingsNumberObjRooms',
    components: {
        ElementParameters
    },
    props: ['temp', 'model', 'componentNames', 'elems_json'],
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
            ncontrol: this.temp.ncontrol || 0
        }
    },
    computed: {
        groupList(){
            let collisions = this.$store.state.common.meta.collisions
            let groups = collisions ? collisions.groups || [] : []
            return groups
        },
        elementsrooms(){
            if(!this.standart){
                return []
            }
            else{
                let list = this.temp.list_rooms || []
                let elements = this.temp.elementsrooms || []
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
        elementsobj(){
            if(!this.standart){
                return []
            }
            else{
                let list = this.temp.list_obj || []
                let elements = this.temp.elementsobj || []
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
            return !!this.group && !!this.ruleName && !!this.elementsrooms.length && !!this.elementsobj.length
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
        onInputNumber(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    ncontrol: v
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
                        c.tcode = this.tagCode
                        c.elementsrooms = this.elementsrooms.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        })
                        c.elementsobj = this.elementsobj.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        })
                        c.ncontrol = parseInt(this.ncontrol)
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
                                part: 'numberobj',
                                std: this.standart,
                                name: this.ruleName,
                                status: -1,
                                elemstype: this.temp.elemstype,
                                desc: this.description,
                                tcode: this.tagCode,
                                elementsrooms: this.elementsrooms.map(e => {
                                    return {
                                        name: e.name,
                                        values: e.values
                                    }
                                }),
                                elementsobj: this.elementsobj.map(e => {
                                    return {
                                        name: e.name,
                                        values: e.values
                                    }
                                }),
                                ncontrol: parseInt(this.ncontrol)
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
                        part: 'numberobj',
                        std: this.standart,
                        name: ruleName,
                        tcode: this.tagCode,
                        status: -1,
                        elemstype: this.temp.elemstype,
                        elementsrooms: this.elementsrooms.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        }),
                        elementsobj: this.elementsobj.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        }),
                        ncontrol: parseInt(this.ncontrol),
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
                        part: 'numberobj',
                        std: this.standart,
                        name: this.ruleName,
                        tcode: this.tagCode,
                        status: -1,
                        elemstype: this.temp.elemstype,
                        elementsrooms: this.elementsrooms.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        }),
                        elementsobj: this.elementsobj.map(e => {
                            return {
                                name: e.name,
                                values: e.values
                            }
                        }),
                        ncontrol: parseInt(this.ncontrol),
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
            this.scrollTop = e.target.scrollTop
            // let top = e.target.scrollTop
        }
    },
    mounted(){
        this.$refs['body'].scrollTop = this.scrollTop
        this.$refs['body'].addEventListener('scroll', this.scrollTo, false)
    },
    beforeDestroy(){
        // let update = JSON.parse(JSON.stringify(this.temp))
        // update = {...update,
        //     scrollTop: this.scrollTop
        //     }
        // this.$emit('setParams', update)
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
