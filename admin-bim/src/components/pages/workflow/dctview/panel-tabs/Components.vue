<template>
    <v-card-text
        class="pa-0 m-card-scrollable__text">

        <v-skeleton-loader
            v-show="!load"
            type="list-item-three-line, list-item-three-line"
        ></v-skeleton-loader>

        <v-data-table
            v-show="load"
            :headers="headers"
            :items="getList"
            item-key="id"
            disable-pagination
            hide-default-footer
            dense
            class="panel-tabs--table"
            >

            <template v-slot:item="{ item }">
                <tr
                    :class="['panel-tabs--back-' + item.type]"
                    >
                    <td v-for="i in headers">
                        <template v-if="i.value == 'node'">
                            <v-icon
                                v-if="!!item.node"
                                size="30"
                                :class="'ml-' + item.levelNode * 3"
                                @click="expand(item)">
                                {{item.expand ? 'mdi-minus-circle-outline' : 'mdi-plus-circle-outline'}}
                            </v-icon>
                        </template>

                        <template v-else-if="i.value == 'name'">
                            <span
                                :class="'ml-' + item.levelNode * 4">
                                {{item.name}}
                            </span>
                        </template>
                        <template v-else>
                            {{item[i.value]}}
                        </template>
                    </td>
                </tr>
            </template>

        </v-data-table>
    </v-card-text>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
    name: 'Components',
    props: ['part', 'level', 'cname', 'elems'],
    data(){
        return {
            items: [],
            elements: [],
            load: false,
            headers: [
                {
                    text: '',
                    value: 'node',
                    class: 'panel-tabs--back-group'
                },
              {
                text: 'Имя компонента',
                align: 'start',
                sortable: false,
                value: 'name',
                class: 'panel-tabs--back-group'
              },
              { text: 'Наименование компонента',sortable: false, value: 'class',class: 'panel-tabs--back-group' },
              { text: 'Количество, шт.',sortable: false, value: 'count',class: 'panel-tabs--back-group' },
              { text: 'Местоположение',sortable: false, value: 'level',class: 'panel-tabs--back-group' },
              { text: 'Объем',sortable: false,value: 'volume',class: 'panel-tabs--back-group' },
              { text: 'Площадь',sortable: false, value: 'area',class: 'panel-tabs--back-group' },
              { text: 'Длина',sortable: false, value: 'length',class: 'panel-tabs--back-group' },
              { text: 'Высота',sortable: false, value: 'height',class: 'panel-tabs--back-group' }
            ],
            propsList: {
                part: [],
                level: [],
                cname: []
            }
        }
    },
    computed: {
        getList: {
            get(){
                let list = []
                let map = Object.fromEntries(this.items
                    .map(i => {return [i.id, i]}))

                this.items.map(v => {
                        if(!v.parent){
                            list.push(v)
                        }
                        else{
                            if(v.path.every(s => map[s].expand)){
                                // && map[v.parent].expand
                                list.push(v)
                            }
                        }

                    })

                return list
            },
            set(i){

            }
        }
    },
    watch: {
        elems(v){
            this.elements = this.setElements(this.elems)
            this.applyFilters()
            this.load = true
        },
        part(v){
            this.applyFilters()
        },
        level(v){
            this.applyFilters()
        },
        cname(v){
            this.applyFilters()
        }
    },
    methods: {
        rowClass(i){
            let style = {}
            switch(i.type){
                case 'group': style['background-color'] = '#eff6ff'
                    break
                case 'item': style['background-color'] = '#f7f7f7'
                    break
                default: ;
            }
            return style
        },
        applyFiltersCycle(elements, propsList, filterTypes, len, idList = [], filters = []){
            let list = []
            let filterType = filterTypes[filterTypes.length - len]
            let stack = []
            propsList[filterType].map(p => {
                let id = uuidv4()
                let filterList = [...filters, {
                    type: filterType,
                    value: p
                }]
                if(len - 1){
                    stack = this.applyFiltersCycle(elements, propsList, filterTypes, (len - 1), [...idList, id], filterList)
                    if(stack.length){
                        list.push({
                            id: id,
                            type: 'group',
                            name: p,
                            node: 1,
                            expand: false,
                            parent: idList.length ? idList[idList.length - 1] : 0,
                            path: idList,
                            levelNode: filterTypes.length - len
                        })
                    }
                    list = [...list, ...stack]
                }
                else{
                    stack = elements
                        .filter(e => e.node && filterList.every(s => e[s.type] == s.value))
                        .map(i => {
                            return {
                                ...i,
                                parent: id,
                                path: [...idList, id],
                                levelNode: filterTypes.length - len + 1
                            }
                        })
                    if(stack.length){
                        list.push({
                            id: id,
                            type: 'group',
                            name: p,
                            node: 1,
                            expand: false,
                            parent: idList[idList.length - 1],
                            path: idList,
                            levelNode: filterTypes.length - len
                        })
                    }
                    stack.map(st => {
                        list.push(st)
                        list = [...list, ...elements.filter(e => !e.node
                                && filterList.every(s => e[s.type] == s.value)
                                && e.parent == st.id).map(i => {
                                    return {
                                        ...i,
                                        path: [...idList, id, st.id],
                                        levelNode: filterTypes.length - len + 2
                                    }
                                })]
                    })
                }
            })
            return list
        },
        applyFilters(){
            let list = []
            let filters = []
            if(this.level) filters.push('level')
            if(this.part) filters.push('part')
            if(this.cname) filters.push('cname')
            if(filters.length){
                this.load = false
                list = this.applyFiltersCycle(this.elements, this.propsList, filters, filters.length)
                // list = this.setList(this.elements, filters)
                this.load = true

                this.items = list
            }
            else{
                this.items = this.elements
            }
        },
        expand(i){
            i.expand = !i.expand
            // this.items[i.id].expand = !i.expand
            // let id = i.id
            // this.items.map(i => {
            //     if(i)
            //     return i
            // })
        },
        setElements(o, level = 0, parent = 0, path = []){
            if(!o){
                return []
            }
            let list = []
            Object.entries(o).map(([k, v]) => {
                    let id = uuidv4()
                    if(!this.propsList.level.some(s => s == v.Level) && !!v.Level && !!v.Items){
                        this.propsList.level.push(v.Level)
                    }
                    if(!this.propsList.part.some(s => s == v.GrouppedByCategories) && v.GrouppedByCategories && !!v.Items){
                        this.propsList.part.push(v.GrouppedByCategories)
                    }
                    if(!this.propsList.cname.some(s => s == v.Class) && v.Class && !!v.Items){
                        this.propsList.cname.push(v.Class)
                    }

                    list.push({
                        id: id,
                        type: v.Items ? 'elem' : 'item',
                        elementId: k,
                        name: v.Name,
                        node: v.Items ? 1 : 0,
                        expand: false,
                        parent: parent,
                        path: path,
                        levelNode: level,
                        part: v.GrouppedByCategories || null,
                        level: v.Level || null,
                        class: v.Class || null,
                        cname: v.Class || null,
                        classification: v.Classification || null,
                        tech: v.TechnicalSystem || null,
                        count: v.Count ? v.Count + ' шт.' : null,
                        volume: v.Volume && v.VolumeUnit
                            ? (v.Volume || null) + (v.VolumeUnit || null)
                            : v.Volume
                                ? v.Volume
                                : null,
                        area: v.Area && v.AreaUnit
                            ? (v.Area || null) + (v.AreaUnit || null)
                            : v.Area
                                ? v.Area
                                : null,
                        length: v.Length && v.LengthUnit
                            ? (v.Length || null) + (v.LengthUnit || null)
                            : v.Length
                                ? v.Length
                                : null,
                        height: v.Height && v.HeightUnits
                            ? (v.Height || null) + (v.HeightUnits || null)
                            : v.Height
                                ? v.Height
                                : null,
                        levelId: v.LevelId || null
                    })
                    if(v.Items){
                        let children = this.setElements(
                            v.Items,
                            (level + 1),
                            id,
                            [id]
                        )
                        list = [...list, ...children]
                    }
                })
            return list
        }
    }
}
</script>

<style lang="less">
.panel-tabs--back{
    &-group{
        background-color: #eff6ff;
    }
    &-item{
        background-color: #f7f7f7;
    }
}
.panel-tabs--table{
    height: 100%;
    table tbody tr td, table thead tr th{
        &:first-child{
            // max-width: 20px !important;
            padding-right: 4px !important;
        }
    }
    .v-data-table__wrapper {
        overflow-x: auto;
        overflow-y: auto;
        height: inherit;
    }
}
.ml-16{
    margin-left: 64px;
}
</style>
