<template>
    <v-card
        class="m-card-scrollable m-dispatcher"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Диспетчер проекта
            <v-spacer></v-spacer>
            <v-btn
                text
                icon
                @click="minimize = !minimize"
                color="#7f7f7f">
                <v-icon size="20">
                    {{!minimize ? 'mdi-window-minimize' : 'mdi-window-maximize'}}
                </v-icon>
            </v-btn>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <panel-btn-mode-tmpl
            :list="list"
            :selectedItem = "selectedItem"
            :menuItem="menuItem"
            :postMessage="postMessage"
            />

        <v-card-text
            class="pa-0 pt-2 pb-5 m-card-scrollable__text">

            <v-skeleton-loader
                v-show="!levelsMap.length"
                type="list-item-three-line, list-item-three-line"
            ></v-skeleton-loader>

            <v-treeview
                v-show="levelsMap.length"
                :items="levelsMap"
                class="m-panel__collision--tree m-text--size12"
                dense
                return-object
                expand-icon="mdi-chevron-down"
                transition
                item-key="id"
                activatable
                @update:active="getList"
                >
                <template v-slot:label="{item}">
                    {{item.name}}
                </template>
                <template v-slot:prepend="{item}">
                    <icon-botton
                        class="mr-4"
                        @onClick="onSelect(item, !item.hidden)"
                        >{{!item.hidden ? 'mdi-eye' : 'mdi-eye-off'}}
                    </icon-botton>
                </template>
            </v-treeview>
        </v-card-text>
    </v-card>
</template>

<script>
import IconBotton from '@/components/custom/IconBotton'
import PanelBtnModeTmpl from './PanelBtnModeTmpl'

export default {
    name: 'PanelDispatcher',
    components: {
        IconBotton,
        PanelBtnModeTmpl
    },
    props: ['menuItem', 'levelsMap', 'hiddenList', 'styleP', 'postMessage'],
    data(){
        return {
            minimize: false,
            map: null,
            selected: [],
            list: [],
            selectedItem: {
                id: '',
                type: ''
            }
        }
    },
    computed: {
        // getLevels(){
        //     const getTree = (items, level) => {
        //         let list = [
        //             ...items
        //                 .filter(f => f.level == level)
        //                 .map((m, i, a) => {
        //                     return {
        //                         ...m,
        //                         children: getTree(items, m.id)
        //                     }
        //                 })
        //         ]
        //         return list
        //     }
        //     let levels = this.map || []
        //     if(this.map){
        //         levels = getTree(Object.values(this.map), 'main')
        //     }
        //     return levels
        // }
    },
    watch: {
        // menuItem: {
        //     handler(v){
        //         if(v.active){
        //             if(!this.model.tags['resource.json'] || this.model.tags['resource.json'] != 1){
        //                 return
        //             }
        //             let url = ''
        //             if(this.model.version == null){
        //                 url = this.model.files[0].url
        //             }
        //             else{
        //                 let file = this.model.files.find(i => i.version == this.model.version)
        //                 url = file ? file.url : this.model.files[0].url
        //             }
        //             this.$store.dispatch('common/getFileInfo', {id: url + '/resource.json'})
        //             .then(res => {
        //                 console.log('!! res', res)
        //             })
        //             .catch(er => {
        //                 console.log('!! er', er)
        //             })
        //         }
        //     },
        //     deep: true
        // },
        // levelsMap(v){
        //     this.map = JSON.parse(JSON.stringify(v))
        //     this.hiddenList.map(h => {
        //         if(this.map[h.id]){
        //             // this.onSelect(this.map[h.id], true)
        //             // this.selected.push(h.id)
        //             this.selectItem(this.map[i.id], true)
        //             this.selectDown(this.map[i.id], true)
        //             this.selectUp(this.map[i.id], true)
        //         }
        //     })
        // },
        hiddenList(v){
            this.$emit('onDispatcher')
        }
        //     if(!this.map){
        //         return
        //     }
        //     v.filter(f => !this.selected.some(s => s == f.id))
        //      .map(i => {
        //         if(this.map[i.id]){
        //             // this.selected.push(i.id)
        //             // this.onSelect(this.map[i.id], true)
        //             this.selectItem(this.map[i.id], true)
        //             this.selectDown(this.map[i.id], true)
        //             this.selectUp(this.map[i.id], true)
        //         }
        //     })
        //
        //     // this.selected
        //     //     .filter(f => !v.some(s => s.id == f))
        //     //     .map(i => {
        //     //         if(this.map[i] && this.map[i].type == 'item'){
        //     //             this.onSelect(this.map[i], false)
        //     //         }
        //     //     })
        // }
    },
    methods: {
        getList(i){
            const getItems = (i) => {
                let list = []
                if(i.type == 'group'){
                    list = i.children.map(c => c.id)
                }
                else{
                    i.children.map(c => {
                        list = [...list, ...getItems(c)]
                    })
                }
                return list
            }
            if(!i.length){
                this.list = []
                this.selectedItem.id = ''
                this.selectedItem.type = ''
            }
            else{
                let list = i[0].children
                    ? getItems(i[0])
                    : [i[0].id]
                this.list = list
                this.selectedItem.id = i[0].id
                this.selectedItem.type = i[0].type
            }
        },
        cancel(){
            this.$emit('setOption', this.menuItem)
        },
        checkDev(){
            let host = window.location.hostname
            return host == 'localhost' || 'prodoc.ubdev.ru'
        },
        onSelect(i, hidden){
            let items = []
            const getItems = (i) => {
                let list = []
                if(i.type == 'group'){
                    list = i.children.filter(f => f.hidden != hidden).map(c => c.id)
                }
                else{
                    i.children.map(c => {
                        list = [...list, ...getItems(c)]
                    })
                }
                return list
            }

            if(i.type == 'item'){
                items.push(i.id)
            }
            else{
                items = getItems(i)
            }
            if(items.length){
                if(hidden){
                    this.$emit('onHideObject', items)
                }
                else{
                    this.$emit('onShowObject', items)
                }
            }
        },
        selectItem(i, hidden){
            let item = []
            this.map[i.id].hidden = hidden
            if(hidden){
                if(!this.selected.some(s => s == i.id)){
                    if(this.map[i.id].level != 'main'){
                        this.map[i.level].selected += 1
                    }
                    this.selected.push(i.id)
                    if(i.type == 'item'){
                        item.push(i.id)
                    }
                }
            }
            else{
                if(this.selected.some(s => s == i.id)){
                    if(this.map[i.id].level != 'main'){
                        this.map[i.level].selected -= 1
                    }
                    let ind = this.selected.indexOf(i.id)
                    if(ind != -1){
                        this.selected.splice(ind, 1)
                    }
                    if(i.type == 'item'){
                        item.push(i.id)
                    }
                }
            }
            return item
        },
        // selectDown(i, hidden){
        //     let list = Object
        //         .values(this.levelsMap)
        //         .filter(f => f.level == i.id)
        //         .map(c => {
        //             return [...this.selectItem(c, hidden), ...this.selectDown(c, hidden)]
        //         })
        //     return list.flat()
        // },
        // selectUp(i){
        //     if(this.map[i.id].level == 'main'){
        //         return
        //     }
        //     if(this.map[i.level].size == this.map[i.level].selected){
        //         this.selectItem(this.map[i.level], true)
        //     }
        //     else{
        //         this.selectItem(this.map[i.level], false)
        //     }
        //     this.selectUp(this.map[i.level])
        //
        // }
    }
}
</script>

<style scoped>
.m-dispatcher .v-treeview-node__root{
    align-items: start !important;
}
.m-dispatcher .v-treeview-node__content{
    align-items: flex-start !important;
}
.m-dispatcher .v-treeview-node__prepend{
    padding-top: 2px !important;
}
</style>
