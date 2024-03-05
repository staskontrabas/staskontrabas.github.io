<template>
    <v-card
        class="m-card-scrollable"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Ресурсы
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

        <v-card-title class="pr-0 pl-4 py-2 m-modal--title-size14 m-card-scrollable__title">
            <v-btn
                outlined
                :color="level ? 'primary' : 'normal'"
                class="m-btn m-btn--float mr-2"
                :class="{'m-btn-normal': !level}"
                @click="filterRun('level')">Местоположение</v-btn>
            <v-btn
                outlined
                :color="cat ? 'primary' : 'normal'"
                class="m-btn m-btn--float"
                :class="{'m-btn-normal': !cat}"
                @click="filterRun('cat')">Конструктив</v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text
            class="pa-0 pt-2 pb-5 m-card-scrollable__text">

            <v-skeleton-loader
                v-show="!getLevels.length"
                type="list-item-three-line, list-item-three-line"
            ></v-skeleton-loader>

            <v-treeview
                v-show="getLevels.length"
                :key="tree_id"
                :items="getLevels"
                class="m-resource m-panel__collision--tree m-text--size12"
                dense
                multiple-active
                activatable
                return-object
                expand-icon="mdi-chevron-down"
                transition
                item-key="id"
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
import { sortObj } from '@/utils/services'

export default {
    name: 'PanelResurs',
    components: {
        IconBotton
    },
    props: ['menuItem', 'propertyJson', 'hiddenList', 'styleP', 'model', 'source'],
    data(){
        return {
            minimize: false,
            map: null,
            type_id: {
                'IFC': 'Guid',
                'Revit': 'Id'
            },
            tree_id: 0,
            selected: [],
            level: false,
            cat: false,
            group: true,
            worker: null,
            levels: []
        }
    },
    computed: {
        // getFilters(){
        //     let filters = []
        //     if(this.level) filters = [...filters, 'level']
        //     if(this.cat) filters = [...filters, 'cat']
        //     if(this.group) filters = [...filters, 'group']
        //     filters = [...filters, 'items']
        //     return filters
        // },
        getLevels(){
            // let levels = this.buildTree(this.getFilters)
            //
            return this.levels
        }
    },
    watch: {
        menuItem: {
            handler(v){
                if(v.active){
                    if(!this.model.tags['resource.json'] || this.model.tags['resource.json'] != 1){
                        return
                    }
                    let url = ''
                    if(this.model.version == null){
                        url = this.model.files[0].url
                    }
                    else{
                        let file = this.model.files.find(i => i.version == this.model.version)
                        url = file ? file.url : this.model.files[0].url
                    }
                    // this.$store.dispatch('common/getFileInfo', {id: url + '/resource.json'})
                    // .then(res => {
                    //     this.map = this.getMap(res.levels)
                    // })
                    // .catch(er => {
                    //     console.log('!! er', er)
                    // })

                    if(!this.worker){
                        this.worker = new Worker(this.$urllocal + '/wresource.js')
                    }
                    if(this.worker){
                        this.worker.addEventListener("message", this.workerMessage, false)

                        this.worker.postMessage({
                            action: 'getfile',
                            token: this.$store.state.auth.token,
                            url: 'url',
                            filters: this.getFilters()
                        })
                    }
                }
            },
            deep: true
        },
        hiddenList(v){
            if(!this.map){
                return
            }
            v.map(i => {
                if(this.map[i.id]){
                    this.map[i.id].hidden = true
                }
            })
        }
    },
    methods: {
        getFilters(){
            let filters = []
            if(this.level) filters = [...filters, 'level']
            if(this.cat) filters = [...filters, 'cat']
            if(this.group) filters = [...filters, 'group']
            filters = [...filters, 'items']
            return filters
        },
        workerMessage(e){
            if(Object.prototype.hasOwnProperty.call(e.data, 'action')){
                switch(e.data.action){
                    case 'buildtree': this.buildtree(e.data)
                        break
                    default: ;
                }
            }
        },
        cancel(){
            this.$emit('setOption', this.menuItem)
        },
        filterRun(v){
            this.tree_id += 1
            this[v] = !this[v]

            if(this.worker){
                this.worker.postMessage({
                    action: 'buildtree',
                    filters: this.getFilters()
                })
            }
        },
        buildtree(v){
            console.log('buildtree', v)
            this.levels = v.map
        },
        buildTree(filters){
            let levels = []
            if(this.map){
                let len = filters.length

                const createTree = (map, filters, values, ind) => {
                    let list = []
                    if(filters[ind] == 'items'){
                        list = Object.values(map.items)
                        list = list.filter(f => values.every(e => {
                            return e.value == f[e.attr]
                        }))
                        list = sortObj(list, 'name')
                    }
                    else{
                        list = map[filters[ind]]
                            .filter(f => (values.every(e => {
                                return e.value == f[e.attr]
                            })))
                            .map(i => {
                                let children = createTree(map, filters, [...values, {
                                    attr: filters[ind],
                                    value: i.name
                                }], (ind + 1))

                                return {
                                    ...i,
                                    hidden: children.every(e => e.hidden),
                                    children
                                }
                            })
                    }
                    return list
                }

                levels = this.map[filters[0]].reduce((r, i) => {
                    r[i.name] = r[i.name] || []

                    r[i.name].push(i)
                    return r
                }, {})

                levels = Object.values(levels).map(l => {
                    let item = l[0]
                    item.children = createTree(this.map, filters, [{
                        attr: filters[0],
                        value: item.name
                    }], 1)
                    item.hidden = item.children.every(e => e.hidden)
                    return item
                })
            }
            return levels
        },
        getMap(ar){
            let map = {
                level: [],
                cat: [],
                group: [],
                items: {}
            }
            ar.map((l, li) => {
                let lid = l.id || 'l-' + li
                map.level.push({
                    id: lid,
                    name: l.lname || '---',
                    type: 'level',
                    parent: 0,
                    hidden: false,
                    node: 'level',
                    size: l.categories.length,
                    selected: 0
                })
                l.categories.map((c, ci) => {
                    let cid = 'c-' + li + ci
                    map.cat.push({
                        id: cid,
                        name: c.cname,
                        type: 'cat',
                        parent: lid,
                        level: l.lname || '---',
                        hidden: false,
                        node: 'level',
                        size: c.items.length,
                        selected: 0
                    })
                    c.items.map((g, gi) => {
                        let gid = 'g-' + li + ci + gi
                        map.group.push({
                            id: gid,
                            name: g.gname,
                            type: 'group',
                            parent: cid,
                            level: l.lname || '---',
                            cat: c.cname,
                            hidden: false,
                            node: 'level',
                            size: g.items.length,
                            selected: 0
                        })
                        g.items.map((e, ei) => {
                            map.items[e] = {
                                id: e,
                                name: g.gname + ' | ' + e,
                                type: 'item',
                                parent: gid,
                                level: l.lname || '---',
                                cat: c.cname,
                                group: g.gname,
                                hidden: false,
                                node: 'item'
                            }
                        })
                    })
                })
            })
            let stack = map.level.reduce((r, i) => {
                r[i.name] = r[i.name] || []
                r[i.name].push(i)
                return r
            }, {})
            stack = Object.values(stack).map(m => {
                let item = m[0]
                let size = 0
                m.map(s => {
                    size += s.size
                })
                item.size = size
                return item
            })
            map.level = sortObj(stack, 'name')
            map.cat = sortObj(map.cat, 'name')
            map.group = sortObj(map.group, 'name')
            this.hiddenList.map(h => {
                map.items[h.id].hidden = true
            })

            return map
        },
        onSelect(i, hidden){
            const getItems = (i) => {
                let  list = []
                if(i.type != 'group'){
                    i.children.map(c => {
                        list = [...list, ...getItems(c)]
                    })
                }
                else{
                    list = i.children.map(c => c.id)
                }
                return list
            }
            let items = []
            if(i.type == 'item'){
                items = [i.id]
                this.map.items[i.id].hidden = hidden
            }
            else{
                items = getItems(i)
                items.map(it => {
                    this.map.items[it].hidden = hidden
                })
            }

            if(hidden){
                this.$emit('onHideObject', items)
            }
            else{
                this.$emit('onShowObject', items)
            }
        }
    }
}
</script>
<style>
.m-resource .v-treeview-node__content{
    align-items: flex-start !important;
    padding-top: 2px !important;
}
.m-resource .v-treeview-node__label{
    overflow: auto !important;
    white-space: normal !important;
}
</style>
