<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Выбрать набор правил
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

        <v-card-text class="px-4 pt-4" style="background-color: #fbfbfb;">
            <div class="d-flex" style="height: 100%;">
                <v-card flat outlined min-height="150" style="flex:1;overflow-y: auto;">
                    <v-treeview
                        :items="getListOut"
                        class="m-panel__collision--tree m-text--size12"
                        dense
                        activatable
                        hoverable
                        multiple-active
                        :active.sync="selectedOut"
                        return-object
                        expand-icon="mdi-chevron-down"
                        transition
                        item-key="id"
                        >
                        <template v-slot:prepend="{item}">
                            <v-icon size="20">
                                {{'trd-' + item.type}}
                            </v-icon>
                        </template>
                    </v-treeview>
                </v-card>
                <div class="d-flex flex-column justify-center">
                    <span @click="add" style="cursor: pointer">
                        <v-icon
                            :color="selectedOut.length ? '#000' : '#c7c7c7'"
                            size="30">mdi-chevron-double-right</v-icon>
                    </span>
                </div>
                <v-card flat outlined min-height="150" style="flex:1;overflow-y: auto;">
                    <v-treeview
                        :items="getListIn"
                        class="m-panel__collision--tree m-text--size12"
                        dense
                        hoverable
                        expand-icon="mdi-chevron-down"
                        transition
                        item-key="id"
                        >
                        <template v-slot:prepend="{item}">
                            <v-icon size="20">
                                {{'trd-' + item.type}}
                            </v-icon>
                        </template>
                    </v-treeview>
                </v-card>
            </div>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-btn outlined color="primary" class="m-btn" @click="download">Скачать
            </v-btn>
            <v-btn outlined color="primary" class="m-btn" @click="upload">Загрузить
            </v-btn>
            <v-btn outlined color="primary" class="m-btn" @click="remove">Удалить шаблон
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="cancel">Отмена</v-btn>
            <v-btn outlined color="primary" class="m-btn" @click="submit">Выбрать
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
export default {
    name: 'RulesSelect',
    props: ['temp', 'listModel'],
    data(){
        return {
            selectedOut: [],
            listIn: [],
            selectedIn: []
        }
    },
    computed: {
        getListOut(){
            let list = []
            let templates = JSON.parse(JSON.stringify( this.$store.state.workflow.templates_collision || []))
            templates.map(l => {
                if(this.getListIn.some(s => s.name == l.name)){
                    let group = this.getListIn.find(f => f.name == l.name)
                    if(group){
                        let temp = l.children.filter(f => !group.children.some(s => s.name == f.name))
                        if(temp.length){
                            l.children = temp
                            list.push(l)
                        }
                    }
                }
                else{
                    list.push(l)
                }
            })
            return list
        },
        getListIn(){
            let collisions = this.$store.state.common.meta.collisions
            let groups = collisions ? collisions.groups || [] : []
            groups = JSON.parse(JSON.stringify(groups))
            this.listIn.map(item => {
                if(item.type == 'rules'){
                    let groupOut = this.templates.find(f => f.id == item.parent)
                    let groupIn = groups.find(f => f.name == groupOut.name)
                    if(groupIn){
                        if(!groupIn.children.some(s => s.name == item.name)){
                            groups = groups.map(l => {
                                if(l.name == groupIn.name){
                                    l.children = [...l.children, {...item, id: uuidv4(), parent: l.id}]
                                }
                                return l
                            })
                        }
                    }
                    else{
                        let groupId = uuidv4()
                        groups = [...groups, {...groupOut, status: -1, id: groupId, children: groupOut.children.filter(f => f.id == item.id).map(m => ({...m, id: uuidv4(), parent: groupId}))}]
                    }
                }
                else{
                    let groupIn = groups.find(f => f.name == item.name)
                    let groupId = uuidv4()
                    if(!groupIn){
                        groups = [...groups, {...item, status: -1, id: groupId, children: item.children.map(m => ({...m, id: uuidv4(), parent: groupId}))}]
                    }
                    else{
                        groups = groups.map(l => {
                            if(l.name == groupIn.name){
                                item.children.map(c => {
                                    if(!l.children.some(s => s.name == c.name)){
                                        l.children = [...l.children, {...c, id: uuidv4(), parent: l.id}]
                                    }
                                })
                            }
                            return l
                        })
                    }
                }
            })
            return groups
        },
        templates(){
            let templates = JSON.parse(JSON.stringify( this.$store.state.workflow.templates_collision || []))
            return templates
        }
    },
    methods: {
        cancel(){
            this.$emit('cancel')
        },
        add(){
            if(!this.selectedOut){
                return
            }
            this.addItem(this.selectedOut)
            this.selectedOut = []
        },
        download(){
            let tmpl = JSON.stringify(this.$store.state.workflow.templates_collision)
            let blob = new Blob([tmpl], {type: "application/json"})
            let a = document.createElement("a")
            let objectURL = URL.createObjectURL(blob)
            a.href = objectURL
            a.download = 'Templates'
            document.body.appendChild(a)
            a.click()
            URL.revokeObjectURL(objectURL)
            a.remove()
        },
        upload(){

        },
        remove(){
            if(this.listModel > 1){
                return
            }
            let groupsDel = this.selectedOut.filter(f => f.type == 'group' || f.type == '')
            let rules = this.selectedOut.filter(f => !groupsDel.some(s => s.id == f.parent))

            let list = []
            groupsDel.map(g => {
                list.push(this.$store.dispatch('workflow/deleteCollisionTemplates', {
                    id: g.id
                }))
            })
            let groupsUpd = this.templates
                .filter(f => rules.some(s => f.id == s.parent))
                .map(g => {
                    g.children = g.children.filter(f => !rules.some(s => f.id == s.id))
                    return g
                })
            if(groupsUpd.length){
                list.push(this.$store.dispatch('workflow/updateCollisionTemplates', groupsUpd))
            }

            Promise.all(list)
            .then(res => {
                console.log('remove')
            })
            .catch(er => {
                console.log('remove error', er)
            })

            this.selectedOut = []
        },
        addItem(list){
            this.listIn = [...this.listIn, ...list]
        },
        setComponent(v){
            this.$emit('setComponent', v)
        },
        submit(){
            this.$emit('save', {groups: this.getListIn})
            this.listIn = []
            this.setComponent()
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
