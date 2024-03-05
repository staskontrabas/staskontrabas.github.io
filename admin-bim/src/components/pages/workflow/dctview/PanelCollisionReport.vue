<template>
    <v-card
        class="m-card-scrollable m-report"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Результаты проверки
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

        <v-card-title class="pa-0">
            <div class="pr-0 pl-1 py-1 m-panel__collision--options">

                <v-btn
                    class="m-btn"
                    text
                    tile
                    dense
                    :disabled="!selected.length || !activeClsn || !compute_ready"
                    :color="activeBox ? 'primary' : 'default'"
                    @click="turnActiveBox">
                    <v-icon
                        left
                        size="20">trd-section</v-icon><span class="m-text--size12">Показать</span>
                </v-btn>

                <v-btn
                    class="m-btn"
                    text
                    tile
                    dense
                    :disabled="!getReports.length"
                    @click="jsonToXlsx">
                    <v-icon
                        left
                        size="20">trd-download</v-icon><span class="m-text--size12">Отчет</span>
                </v-btn>

                <icon-botton
                    class="mr-4"
                    :disabled="!selected.length || !compute_ready"
                    :color="(activeClsn && selected.length) ? 'primary' : 'default'"
                    @onClick="turnActiveClsn"
                    >trd-cube_hide
                </icon-botton>

                <icon-botton
                    class="mr-4"
                    :disabled="!selected.length || !compute_ready"
                    :color="(activeOnly && selected.length) ? 'primary' : 'default'"
                    @onClick="turnActiveOnly"
                    >trd-cube_show
                </icon-botton>

                <v-spacer></v-spacer>
            </div>
        </v-card-title>

        <v-divider class="pb-2"></v-divider>

        <v-card-text
            class="pa-0 pb-5 m-card-scrollable__text">

            <v-skeleton-loader
                v-show="!compute_ready"
                type="list-item-three-line, list-item-three-line"
            ></v-skeleton-loader>

            <v-treeview
                v-show="compute_ready"
                :active.sync="selected"
                :items="getReports"
                class="m-panel__collision--tree m-text--size12"
                dense
                activatable
                return-object
                expand-icon="mdi-chevron-down"
                transition
                item-key="id"
                @update:active="checkSelected"
                >
                <template v-slot:label="{item, index}">
                    <span>
                    {{item.type == 'group' || item.type == 'subgroup'
                        ? item.name + ' [' + item.len + ']'
                        : item.type == 'rules'
                            ? item.name + ' [' + item.pair + '/' + item.pairs + ']'
                            : item.name
                    }}
                        <span v-if="item.valueRule" class="m-text--color-red">
                            {{item.valueRule}}
                        </span>
                    </span>
                </template>
                <template v-slot:prepend="{item}">
                    <v-icon size="20">
                        {{'trd-' + item.type}}
                    </v-icon>
                </template>
            </v-treeview>
        </v-card-text>
    </v-card>
</template>

<script>
import IconBotton from '@/components/custom/IconBotton'

export default {
    name: 'PanelCollisionReport',
    props: ['menuItem', 'collisions', 'planes', 'styleP', 'model', 'compute_ready', 'onLoadsOptions', 'listModel'],
    components: {
        IconBotton
    },
    data(){
        return {
            minimize: false,
            selected: [],
            activated: null,
            mode: [{
                name: 'clsn',
                value: false
            },{
                name: 'box',
                value: false
            },{
                name: 'only',
                value: false
            }]
        }
    },
    computed: {
        activeClsn: {
            get(){
                return this.mode.find(f => f.name == 'clsn').value
            },
            set(v){
                this.mode = this.mode.map(m => {
                    if(m.name == 'clsn'){
                        m.value = v
                    }
                    return m
                })
            }
        },
        activeBox: {
            get(){
                return this.mode.find(f => f.name == 'box').value
            },
            set(v){
                this.mode = this.mode.map(m => {
                    if(m.name == 'box'){
                        m.value = v
                    }
                    return m
                })
            }
        },
        activeOnly: {
            get(){
                return this.mode.find(f => f.name == 'only').value
            },
            set(v){
                this.mode = this.mode.map(m => {
                    if(m.name == 'only'){
                        m.value = v
                    }
                    return m
                })
            }
        },
        getReports(){
            let collisions = this.$store.state.common.meta.collisions
            let groups = collisions ? collisions.groups || [] : []
            if(groups.length){
                let version = collisions.version || null
                if(this.model.version != null && version != this.model.version){
                    groups = []
                }
            }
            let list = []
            groups.map((g, j) => {
                if(g.status == 0){
                    let group = {
                        id: 'g' + j,
                        name: 'Ошибка: ' + g.name,
                        type: 'group',
                        children: []
                    }
                    let items = []
                    g.children
                        .filter(f => f.status == 0)
                        .map((ru, i, a) => {
                            ru.reports.map((r, k) => {
                                if(ru.part == 'geom'){
                                    items.push({
                                        id: 'r_geom' + i + k,
                                        name: 'Ошибка: ' + ru.name,
                                        type: 'rules',
                                        part: 'geom',
                                        idList: [r.first.id, r.second.id],
                                        children: [{
                                            id: 'f_g_' + i + k,
                                            name: 'ID ' + r.first.id + ' | ' + r.first.name,
                                            type: 'cube'
                                        },{
                                            id: 's_g_' + i + k,
                                            name: 'ID ' + r.second.id + ' | ' + r.second.name,
                                            type: 'cube'
                                        }]
                                    })
                                }
                                if(ru.part == 'params'){
                                    items.push({
                                        id: 'r_params' + i + k,
                                        name: 'Ошибка: ' + ru.name,
                                        type: 'rules',
                                        part: 'params',
                                        idList: [r.id],
                                        children: [{
                                            id: 'f_p_' + i + k,
                                            name: 'ID ' + r.id + ' | ' + r.name,
                                            type: 'cube'
                                        },{
                                            id: 's_p_' + i + k,
                                            name: r.property + ' ' + r.value + ' | ',
                                            valueRule: r.valueRule,
                                            type: ''
                                        }]
                                    })
                                }
                                if(ru.part == 'repeat'){
                                    items.push({
                                        id: 'r_repeat' + i + k,
                                        name: 'Ошибка: ' + ru.name,
                                        type: 'rules',
                                        part: 'repeat',
                                        idList: [r.first.id, r.second.id],
                                        children: [{
                                            id: 'f_g_' + i + k,
                                            name: 'ID ' + r.first.id + ' | ' + r.first.name,
                                            type: 'cube'
                                        },{
                                            id: 's_g_' + i + k,
                                            name: 'ID ' + r.second.id + ' | ' + r.second.name,
                                            type: 'cube'
                                        }]
                                    })
                                }
                                if(ru.part == 'space'){
                                    items.push({
                                        id: 'r_space' + i + k,
                                        name: 'Ошибка: ' + ru.name,
                                        type: 'rules',
                                        part: 'space',
                                        // elemId: r.id,
                                        idList: [r.first.id, r.second.id],
                                        children: [{
                                            id: 'f_g_' + i + k,
                                            name: 'ID ' + r.first.id + ' | ' + r.first.name,
                                            type: 'cube'
                                        },{
                                            id: 's_g_' + i + k,
                                            name: 'ID ' + r.second.id + ' | ' + r.second.name,
                                            type: 'cube'
                                        }]
                                    })
                                }
                                if(ru.part == 'distance'){
                                    items.push({
                                        id: 'r_distance' + i + k,
                                        name: 'Ошибка: ' + ru.name,
                                        type: 'rules',
                                        part: 'distance',
                                        // elemId: r.id,
                                        idList: [r.first.id, r.second.id],
                                        children: [{
                                            id: 'f_g_' + i + k,
                                            name: 'ID ' + r.first.id + ' | ' + r.first.name,
                                            type: 'cube'
                                        },{
                                            id: 's_g_' + i + k,
                                            name: 'ID ' + r.second.id + ' | ' + r.second.name,
                                            type: 'cube'
                                        }]
                                    })
                                }
                                if(ru.part == 'numberobj'){
                                    items.push({
                                        id: 'r_numberobj' + i + k,
                                        name: 'Ошибка: ' + ru.name,
                                        type: 'rules',
                                        part: 'numberobj',
                                        idList: [r.id],
                                        children: [{
                                            id: 'f_p_' + i + k,
                                            name: 'ID ' + r.id + ' | ' + r.name,
                                            type: 'cube'
                                        },{
                                            id: 's_p_' + i + k,
                                            name: 'Количество | ',
                                            valueRule: r.count,
                                            type: ''
                                        }]
                                    })
                                }
                            })
                        })
                    items = items.reduce((res, itm) => {
                        res[itm.name] = res[itm.name] || {children: []}
                        res[itm.name].children.push(itm)
                        return res
                    }, {})
                    let len = 0
                    let subgroups = Object.entries(items).map(([key, val], i) => {
                        len += val.children.length
                        return {
                            id: 'sg' + j + i,
                            name: 'Ошибка: ' + key,
                            type: 'subgroup',
                            len: val.children.length,
                            children: val.children.map((c, i, a) => {
                                return {
                                    ...c,
                                    pairs: a.length,
                                    pair: (i + 1)
                                }
                            })
                        }
                    })

                    group.children = subgroups
                    group.len = len
                    list.push(group)
                }
            })

            return list
        }
    },
    watch: {
        menuItem: {
            handler(v){
                if(!v.active){
                    if(this.activeClsn){
                        this.turnActiveClsn()
                    }
                    if(this.activeOnly){
                        this.turnActiveOnly()
                    }
                }
            },
            deep: true
        }
    },
    methods: {
        jsonToXlsx(){
            let collisions = this.$store.state.common.meta.collisions
            let groups = collisions ? collisions.groups || [] : []
            let list = []
            groups.map((g, j) => {
                if(g.status == 0){
                    g.children
                        .filter(f => f.status == 0)
                        .map((ru, i, a) => {
                            ru.reports.map((r, k) => {
                                if(ru.part == 'geom'){
                                    list.push({
                                        part: 'geom',
                                        report: {
                                            elem: {
                                                elemid: r.first.id,
                                                name: r.first.name
                                            },
                                            param: {
                                                elemid: r.second.id,
                                                name: r.second.name
                                            }
                                        }
                                    })
                                }
                                if(ru.part == 'params'){
                                    list.push({
                                        part: 'params',
                                        report: {
                                            elem: {
                                                elemid: r.id,
                                                name: r.name
                                            },
                                            param: {
                                				name: r.property,
                                				value: r.value,
                                				valueRule: r.valueRule
                                            }
                                        }
                                    })
                                }
                                if(ru.part == 'repeat'){
                                    list.push({
                                        part: 'repeat',
                                        report: {
                                            elem: {
                                                elemid: r.first.id,
                                                name: r.first.name
                                            },
                                            param: {
                                                elemid: r.second.id,
                                                name: r.second.name
                                            }
                                        }
                                    })
                                }
                            })
                        })
                }
            })
            this.$store.dispatch('workflow/jsonToXlsx', list)
            .then(res => {
                if(!res.error){
                    let a = document.createElement("a")
                    let objectURL = URL.createObjectURL(res.file)
                    a.href = objectURL
                    a.download = this.model.name_short + '.xlsx'
                    document.body.appendChild(a)
                    a.click()
                    URL.revokeObjectURL(objectURL)
                    a.remove()
                }
                else{
                    console.log('jsonToXlsx error ', res.error)
                }
            })
            .catch(err => {
                console.log('jsonToXlsx error ', err.error)
            })
        },
        cancel(){
            if(this.activeClsn){
                this.turnActiveClsn()
            }
            if(this.activeOnly){
                this.turnActiveOnly()
            }

            this.$emit('setOption', this.menuItem)
        },
        checkSelected(){
            if(this.selected.some(s => s.type == 'cube')){
                return
            }
            else{
                if(!this.selected.length){
                    if(this.activated){
                        this.mode.map(m => {
                            this.onActive(m.name, false)
                        })
                        this.activated = null
                    }
                }
                else{
                    if(this.activeClsn){
                        this.onActive('clsn', false)
                    }
                    this.activated = this.selected[0]

                    this.mode.map(m => {
                        if(m.value){
                            this.onActive(m.name, true)
                        }
                    })
                }
            }
        },
        onOptions(name, active){
            this.$emit('setOption', {
                name: name,
                active: active
            })
        },
        turnActiveClsn(){
            this.activeClsn = !this.activeClsn
            if(this.activeOnly){
                this.onActive('only', false)
                this.activeOnly = false
            }
            if(!this.activeClsn){
                if(this.activeBox){
                    this.turnActiveBox()
                }
            }
            this.onActive('clsn', this.activeClsn)
        },
        turnActiveBox(){
            this.activeBox = !this.activeBox
            if(this.activeOnly){
                this.onActive('only', false)
                this.activeOnly = false
            }
            this.onActive('box', this.activeBox)
        },
        turnActiveOnly(){
            this.activeOnly = !this.activeOnly
            if(this.activeBox){
                this.onActive('box', false)
                this.activeBox = false
            }
            if(this.activeClsn){
                this.onActive('clsn', false)
                this.activeClsn = false
            }
            this.onActive('only', this.activeOnly)
        },
        onActive(mode, a){
            // console.log('onActive', mode, a, this.activated)
            // return
            let items = this.activated
            if(!items){
                return
            }

            let list = {}
            let objectList = []
            let collisionList = []
            if(items.type == 'group'){
                items.children.map(sub => {
                    sub.children.map(itm => {
                        itm.idList.map(i => {
                            list[i] = i
                        })
                    })
                })
            }
            else if(items.type == 'subgroup'){
                items.children.map(c => {
                    c.idList.map(i => {
                        list[i] = i
                    })
                })
            }
            else{
                items.idList.map(i => {
                    list[i] = i
                })
            }
            list = Object.keys(list)
            switch(mode){
                case 'clsn':
                    if(list.length){
                        this.$emit('onObjectsHighlight', {list: list, active: a})
                    }
                    break
                case 'box':
                    if(list.length){
                        this.$emit('onCreateSectionBoxForObjects', {list: list, active: a})
                    }
                    break
                case 'only':
                    if(list.length){
                        this.$emit('onShowObjectsOnly', {list: list, active: a})
                    }
                    break
                default: ;
            }
        }
    }
}
</script>

<style>
.m-report .v-treeview-node__content{
    align-items: start !important;
}
.m-report .v-treeview-node__label{
    overflow: auto !important;
    white-space: normal !important;
}
</style>
