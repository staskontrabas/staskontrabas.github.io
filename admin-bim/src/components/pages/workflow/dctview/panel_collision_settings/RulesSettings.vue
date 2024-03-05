<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Общие правила проверки пересечения
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

        <v-card-text class="pa-4" style="background-color: #fbfbfb;">
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
                @click:append-outer="groupAdd()"
                hide-details
            />
            <div class="m-text--size12 m-text--color-black pt-4">
                Название проверки
            </div>
            <v-text-field
                v-model="ruleName"
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
            <v-row dense>
                <v-col
                    :cols="6"
                >
                    <v-card
                        class="mr-2 pa-0"
                        flat
                        min-height="250"
                        outlined
                        >
                        <v-card-text class="m-text--color-black pa-0">
                            <v-list flat dense class="pa-0">
                                <v-list-item-group
                                    v-model="list_1_selected"
                                    multiple
                                    color="primary"
                                    class="pa-0">
                                    <v-list-item
                                        v-for="item in list_1"
                                        class="m-panel__collision--list-item"
                                        dense
                                        :key="item"
                                        :value="item"
                                        >{{item}}
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-card-text>
                    </v-card>
                    <v-card-actions>
                        <v-btn
                            text
                            :disabled="!standart"
                            @click="elementAdd(1)"
                            color="primary"
                            class="m-btn">
                            <v-icon
                                size="20"
                                left>mdi-plus-circle-outline</v-icon>Добавить элемент
                        </v-btn>
                        <v-btn
                            text
                            :disabled="!list_1_selected.length"
                            @click="removeElement('list_1')"
                            class="m-btn">
                            <v-icon
                                size="20"
                                left>trd-trash</v-icon>Удалить
                        </v-btn>
                    </v-card-actions>
                </v-col>

                <v-col
                    :cols="6"
                >
                    <v-card
                        class="ml-2 pa-0"
                        flat
                        min-height="250"
                        outlined
                    >
                        <v-card-text class="m-text--color-black pa-0">
                            <v-list flat dense class="pa-0">
                                <v-list-item-group
                                    v-model="list_2_selected"
                                    multiple
                                    color="primary"
                                    class="pa-0">
                                    <v-list-item
                                        v-for="item in list_2"
                                        class="m-panel__collision--list-item"
                                        dense
                                        :key="item"
                                        :value="item"
                                        >{{item}}
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-card-text>
                    </v-card>
                    <v-card-actions>
                        <v-btn
                            text
                            :disabled="!standart"
                            @click="elementAdd(2)"
                            color="primary"
                            class="m-btn">
                            <v-icon
                                size="20"
                                left>mdi-plus-circle-outline</v-icon>Добавить элемент
                        </v-btn>
                        <v-btn
                            text
                            :disabled="!list_2_selected.length"
                            @click="removeElement('list_2')"
                            class="m-btn">
                            <v-icon
                                size="20"
                                left>trd-trash</v-icon>Удалить
                        </v-btn>
                    </v-card-actions>
                </v-col>
            </v-row>

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
export default {
    name: 'RulesSettings',
    props: ['temp', 'componentNames'],
    data(){
        return {
            group: this.temp.group || '',
            ruleName: this.temp.ruleName || '',
            ruleTitle: this.temp.ruleTitle || '',
            list_1_selected: [],
            list_2_selected: [],
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
            }]
        }
    },
    computed: {
        groupList(){
            let collisions = this.$store.state.common.meta.collisions
            let groups = collisions ? collisions.groups || [] : []
            return groups
        },
        list_1(){
            if(!this.standart){
                return []
            }
            else{
                let list = Object.keys(this.componentNames[this.standart])
                let temp_list = this.temp.list_1 || []
                return list.filter(f => temp_list.some(s => s == f))
            }
        },
        list_2(){
            if(!this.standart){
                return []
            }
            else{
                let list = Object.keys(this.componentNames[this.standart])
                let temp_list = this.temp.list_2 || []
                return list.filter(f => temp_list.some(s => s == f))
            }
        },
        verify(){
            return !!this.group && !!this.ruleName && !!this.list_1.length && !!this.list_2.length
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
        removeElement(l){
            let list = this[l].filter(f => !this[l + '_selected'].some(s => s == f))
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update, [l]: list}
            this[l + '_selected'] = []
            this.$emit('setParams', update)
        },
        setComponent(v){
            this.$emit('setComponent', v)
        },
        setStandart(v){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    std: v
                }
            this.$emit('setParams', update)
        },
        elementAdd(l){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {...update,
                    list: l,
                    ruleName: this.ruleName,
                    group: this.group,
                    desc: this.description
                }
            this.$emit('setParams', update)
            this.setComponent('RulesElement')
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
                        c.list_1 = this.list_1
                        c.list_2 = this.list_2
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
                                part: 'geom',
                                std: this.standart,
                                name: this.ruleName,
                                status: -1,
                                elemstype: this.temp.elemstype,
                                list_1: this.list_1,
                                list_2: this.list_2,
                                desc: this.description
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
                        part: 'geom',
                        std: this.standart,
                        name: ruleName,
                        status: -1,
                        elemstype: this.temp.elemstype,
                        list_1: this.list_1,
                        list_2: this.list_2,
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
                        part: 'geom',
                        std: this.standart,
                        name: this.ruleName,
                        status: -1,
                        elemstype: this.temp.elemstype,
                        list_1: this.list_1,
                        list_2: this.list_2,
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
        }
    },
    mounted(){
        document.addEventListener('keyup', this.enter, false)
    },
    beforeDestroy(){
        document.removeEventListener('keyup', this.enter, false)
    }
}
</script>
