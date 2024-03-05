<template>
    <v-card
        class="m-panel__property m-card-scrollable"
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

        <v-card-title class="pa-0">
            <div class="pr-0 pl-1 py-1 m-panel__collision--options">
                <v-btn
                    class="m-btn"
                    text
                    tile
                    dense
                    :disabled="!active.length || !activeClsn"
                    :color="activeBox ? 'primary' : 'default'"
                    @click="turnActiveBox">
                    <v-icon
                        left
                        size="20">trd-section</v-icon><span class="m-text--size12">Показать</span>
                </v-btn>

                <icon-botton
                    class="mr-3"
                    :disabled="!active.length"
                    :color="(activeClsn && active.length) ? 'primary' : 'default'"
                    @onClick="turnActiveClsn"
                    >trd-cube_hide
                </icon-botton>

                <icon-botton
                    class="mr-3"
                    :disabled="!active.length"
                    :color="(activeOnly && active.length) ? 'primary' : 'default'"
                    @onClick="turnActiveOnly"
                    >trd-cube_show
                </icon-botton>

                <v-btn
                    class="m-btn px-2"
                    text
                    tile
                    dense
                    @click="onVisibleAll(false)">
                    <v-icon
                        left
                        :color="'#757575'"
                        size="20">mdi-eye-off</v-icon><span class="m-text--size12">Скрыть все</span>
                </v-btn>

                <v-btn
                    class="m-btn px-1"
                    text
                    tile
                    dense
                    @click="onVisibleAll(true)">
                    <v-icon
                        left
                        :color="'#757575'"
                        size="20">mdi-eye</v-icon><span class="m-text--size12">Показать все</span>
                </v-btn>

            </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-title class="pr-0 pl-4 py-2 m-modal--title-size14 m-card-scrollable__title">
            <v-checkbox
                class="ma-0"
                v-model="selectMode"
                @change="onSelect"
                color="primary"
                label="Выбор элемента"
                hide-details
            ></v-checkbox>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text
            class="pa-0 pt-2 pb-5 m-card-scrollable__text">

            <v-skeleton-loader
                v-show="!getLevels.length && load"
                type="list-item-three-line, list-item-three-line"
            ></v-skeleton-loader>

            <v-treeview
                v-show="getLevels.length"
                :key="tree_id"
                :items="getLevels"
                :active.sync="active"
                class="m-resource m-panel__collision--tree m-text--size12"
                dense
                activatable
                return-object
                expand-icon="mdi-chevron-down"
                transition
                item-key="id"
                @update:active="onActive"
                >
                <template v-slot:label="{item}">
                    {{item.name}}
                </template>
                <template v-slot:prepend="{item}">
                    <icon-botton
                        class="mr-4"
                        stop
                        @onClick="onVisibile(item, !item.hidden)"
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
import { http, api } from '@/utils/define'

export default {
    name: 'PanelResurs',
    components: {
        IconBotton
    },
    props: ['menuItem', 'hiddenList', 'styleP', 'model', 'source', 'selectedObjID', 'postMessage'],
    data(){
        return {
            minimize: false,
            map: null,
            tree_id: 0,
            selectMode: false,
            selected: [],
            active: [],
            level: false,
            cat: false,
            group: true,
            worker: null,
            levels: [],
            load: true,
            visibleItem: false,
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
        },
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
    },
    watch: {
        menuItem: {
            handler(v){
                if(v.active){
                    if(this.worker){
                        this.getResource()
                    }
                    else{
                        this.worker = new Worker(window.location.origin + '/js/wresource.js')
                        // this.worker = new Worker(this.$url + '/js/wresource.js')
                        this.worker.addEventListener("message", this.workerMessage, false)
                    }
                }
                else{
                    if(this.activeClsn){
                        this.turnActiveClsn()
                    }
                    if(this.activeOnly){
                        this.turnActiveOnly()
                    }
                    this.active = []
                }
            },
            deep: true
        },
        hiddenList(v){
            if(!this.levels.length){
                return
            }
            this.load = false
            this.worker.postMessage({
                action: 'onHidden',
                filters: this.getFilters(),
                list: v
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
        getResource(){
            // if(!this.model.tags['resource.json'] || this.model.tags['resource.json'] != 1){
            //     return
            // }

            let urllist = []
            if(this.model.type == 'consolidations'){
                this.$store.state.workflow.listDocs
                    .filter(f => this.model.consolidations.some(s => s == f.id))
                    .map(f => {
                        if(f.version == null){
                            urllist.push(f.files[0].url)
                        }
                        else{
                            let file = f.files.find(i => i.id == f.version)
                            urllist.push(file ? file.url : f.files[0].url)
                        }
                    })
            }
            else{
                if(this.model.version == null){
                    urllist.push(this.model.files[0].url)
                }
                else{
                    let file = this.model.files.find(i => i.id == this.model.version)
                    urllist.push(file ? file.url : this.model.files[0].url)
                }
            }
            // url = http['cloud'] + api['getfile'] + url + '/resource.json'
            this.worker.postMessage({
                action: 'getfile',
                token: this.$store.state.auth.token,
                urllist: urllist,
                api: http['cloud'] + api['getfile'],
                tag: '/resource.json',
                filters: this.getFilters(),
                hiddenList: this.hiddenList
            })
        },
        workerMessage(e){
            if(Object.prototype.hasOwnProperty.call(e.data, 'action')){
                switch(e.data.action){
                    case 'initworker': this.getResource()
                        break
                    case 'buildtree': this.buildtree(e.data)
                        break
                    case 'buildSelected': this.buildSelected(e.data)
                        break
                    case 'onVisibleAll': this.setVisibleAll(e.data)
                        break
                    default: ;
                }
            }
        },
        cancel(){
            if(this.activeClsn){
                this.turnActiveClsn()
            }
            if(this.activeOnly){
                this.turnActiveOnly()
            }
            this.active = []

            this.$emit('setOption', this.menuItem)
        },
        filterRun(v){
            this.tree_id += 1
            this[v] = !this[v]

            this.load = false
            if(this.worker){
                this.worker.postMessage({
                    action: 'buildtree',
                    filters: this.getFilters()
                })
            }
        },
        buildtree(v){
            this.levels = v.map
            this.load = true
        },
        onVisibleAll(v){
            this.worker.postMessage({
                action: 'onVisibleAll',
                value: v
            })
        },
        onVisibile(i, hidden){
            this.load = false
            this.worker.postMessage({
                action: 'onVisibile',
                // filters: this.getFilters(),
                item: i,
                hidden: hidden
            })
            // if(hidden){
            //     this.$emit('onHideObject', [i])
            // }
            // else{
            //     this.$emit('onShowObject', [i])
            // }
        },
        setVisibleAll(d){
            this.buildSelected({
                hidden: !d.value,
                items: d.list
            })
        },
        buildSelected(d){
            // this.buildtree({map: d.levels})
            if(d.hidden){
                this.$emit('onHideObject', d.items)
            }
            else{
                this.$emit('onShowObject', d.items)
            }
        },
        onActive(v){
            let item = v[0]
            if(!item){
                if(this.selected.length){
                    this.mode.map(m => {
                        this.onActiveMode(m.name, false)
                    })
                    this.selected = []
                    //     console.log('444444444')
                    this.postMessage({
                        action: 'clearSelection',
                        value: true
                    })
                }
            }
            else{
                // console.log('55555555')
                // this.postMessage({
                //     action: 'clearSelection',
                //     value: true
                // })
                if(this.activeClsn){
                    this.onActiveMode('clsn', false)
                }
                if(item.type == 'item' && this.selectMode){
                    // this.$emit('update:selectedObjID', item.id)
                        // console.log('55555555', item.id)
                    this.postMessage({
                        action: 'selectObjectById',
                        value: item.id
                    })
                }
                this.selected = this.active

                this.mode.map(m => {
                    if(m.value){
                        this.onActiveMode(m.name, true)
                    }
                })
            }
        },
        onSelect(v){
            if(v){
                if(this.active.length){
                    if(this.active[0].type == 'item'){
                        // this.$emit('update:selectedObjID', this.active[0].id)
                        this.postMessage({
                            action: 'selectObjectById',
                            value: this.active[0].id
                        })
                        // Promise.resolve(
                        //     console.log('11111111111'),
                        // this.postMessage({
                        //     action: 'clearSelection',
                        //     value: true
                        // }))
                        // .then(() => {
                        //     console.log('2222222222')
                        //     this.postMessage({
                        //         action: 'selectObjectById',
                        //         value: this.active[0].id
                        //     })
                        // })
                    }
                }
            }
            else{
                // console.log('33333333')
                this.postMessage({
                    action: 'clearSelection',
                    value: true
                })
            }
        },
        turnActiveClsn(){
            this.activeClsn = !this.activeClsn
            if(this.activeOnly){
                this.onActiveMode('only', false)
                this.activeOnly = false
            }
            if(!this.activeClsn){
                if(this.activeBox){
                    this.turnActiveBox()
                }
            }
            this.onActiveMode('clsn', this.activeClsn)
        },
        turnActiveBox(){
            this.activeBox = !this.activeBox
            if(this.activeOnly){
                this.onActiveMode('only', false)
                this.activeOnly = false
            }
            this.onActiveMode('box', this.activeBox)
        },
        turnActiveOnly(){
            this.activeOnly = !this.activeOnly
            if(this.activeBox){
                this.onActiveMode('box', false)
                this.activeBox = false
            }
            if(this.activeClsn){
                this.onActiveMode('clsn', false)
                this.activeClsn = false
            }
            this.onActiveMode('only', this.activeOnly)
        },
        onActiveMode(mode, a){
            let items = this.selected
            if(!items.length){
                return
            }

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

            let objectList = []
            items.map(i => {
                if(i.type == 'item'){
                    objectList.push(i.id)
                }
                else{
                    objectList = [...objectList, ...getItems(i)]
                }
            })

            switch(mode){
                case 'clsn':
                    if(objectList.length){
                        this.$emit('onObjectsHighlight', {list: objectList, active: a})
                    }
                    break
                case 'box':
                    if(objectList.length){
                        this.$emit('onCreateSectionBoxForObjects', {list: objectList, active: a})
                    }
                    break
                case 'only':
                    if(objectList.length){
                        this.$emit('onShowObjectsOnly', {list: objectList, active: a})
                    }
                    break
                default: ;
            }
        }
    },
    beforeDestroy(){
        if(this.worker){
            this.worker.terminate()
            this.worker = null
            this.load = true
            this.levels = []
        }
    }
}
</script>
<style>
.m-resource .v-treeview-node__root{
    align-items: start !important;
}
.m-resource .v-treeview-node__content{
    align-items: start !important;
    padding-top: 2px !important;
}
.m-resource .v-treeview-node__label{
    overflow: auto !important;
    white-space: normal !important;
}
</style>
