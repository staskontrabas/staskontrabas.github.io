<template>
    <v-container fluid fill-height text-xs-center pa-0 class="m-container">
        <v-layout wrap ma-0 style="position: relative;" id="fullscreen">
            <div
                class="m-3d-wrap"
                ref="canvas-wrap"
                id="canvas-wrap"
                >

                <iframe :src="viewer" ref="viewer" id="viewer" name="viewer" style="height:100%; width:100%; border: 0;"/>

            </div>
        <!--
            <panel-options
                :options="options"
                @setOption="setOption"
                @setSubOption="setSubOption"/>
            <div
                class="m-panel__wrap--left"
                :class="{multy: multy}"
                >
                <panel-property
                    v-show="options.property.active"
                    :menuItem="options.property"
                    @setOption="setOption"
                    @onHideObject="onHideObject"
                    @onShowObject="onShowObject"
                    :hiddenList="hiddenList"
                    :selectedObjID="selectedObjID"
                    :properties="getObjectProperties"
                    :classifications="getClassifications"/>
            </div>

            <div
                class="m-panel__wrap--right"
                :class="{multy: multy}"
                >
                <panel-filters
                    v-show="options.filters.active"
                    :menuItem="options.filters"
                    @onFilter="onFilter"
                    @setFilters="setFilters"
                    @setOption="setOption"
                    :filters.sync="filters"
                    :styleP="getStylePanels.style"/>
                <panel-dispatcher
                    v-show="options.dispatcher.active"
                    :menuItem="options.dispatcher"
                    @setOption="setOption"
                    @onHideObject="onHideObject"
                    @onShowObject="onShowObject"
                    :levelsMap="levelsMap"
                    :hiddenList="hiddenList"
                    :styleP="getStylePanels.style"/>
                <panel-hidden
                    v-show="options.hidden.active"
                    :menuItem="options.hidden"
                    @setOption="setOption"
                    @onShowObject="onShowObject"
                    :hiddenList="hiddenList"
                    :styleP="getStylePanels.style"/>
                <panel-delta
                    v-show="options.delta.active"
                    :menuItem="options.delta"
                    @setOption="setOption"
                    :delta="deltaList"
                    :styleP="getStylePanels.style"/>
                <panel-rooms
                    v-show="options.rooms.active"
                    :menuItem="options.rooms"
                    @setOption="setOption"
                    @onRoomVisibility="onRoomVisibility"
                    :rooms.sync="rooms"
                    :styleP="getStylePanels.style"/>
                <panel-collision-settings
                    v-show="options.collision_settings.active"
                    :menuItem="options.collision_settings"
                    :model="model"
                    :source="source"
                    :compute_ready="compute_ready"
                    @setOption="setOption"
                    @onComputeCollisions="onComputeCollisions"
                    @onComputeParameters="onComputeParameters"
                    :collision_settings="collision_settings"
                    :collisions_compiling.sync="collisions_compiling"
                    :styleP="getStylePanels.style"/>
                <panel-collision-report
                    v-show="options.collision_reports.active"
                    :menuItem="options.collision_reports"
                    :planes="options.planes.active"
                    :collisions="options.collisions.active"
                    :model="model"
                    :compute_ready="compute_ready"
                    :onLoadsOptions.sync="onLoads.options"
                    @setOption="setOption"
                    @onCollisionsActive="onCollisionsActive"
                    @onShowCollisionsOnly="onShowCollisionsOnly"
                    @onCreateSectionBoxForCollisions="onCreateSectionBoxForCollisions"

                    @onObjectsHighlight="onObjectsHighlight"
                    @onShowObjectsOnly="onShowObjectsOnly"
                    @onCreateSectionBoxForObjects="onCreateSectionBoxForObjects"
                    @onRemoveSectionBox="onRemoveSectionBox"
                    :styleP="getStylePanels.style"/>
            </div>
            <div
                v-show="options.tabs.active"
                class="m-panel__wrap--bottom"
                :class="{multy: multy || options.tabs.minimize}"
                >
                <panel-tabs
                    :active="options.tabs.active"
                    :model="model"
                    :menuItem="options.tabs"
                    :minimize="options.tabs.minimize"
                    @setOption="setOption"
                    @updateOption="updateOption"
                     />
            </div>
        -->

            <div
                v-show="!onLoadsCheck"
                class="m-back"
                :class="{'m-back--trans': onLoads.model}"
                >
                <div class="vm-progress">
                    <div class="loader">
                        <svg class="circular" viewBox="25 25 50 50">
                            <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                        </svg>
                    </div>
                    <span>{{preloaderTytle}}</span>
                </div>
            </div>

        </v-layout>
        <!--
		<tools3d
            :toolsbar.sync="toolsbar"
            ref="tools"
            />
        -->
    </v-container>
</template>

<script>
// import * as JSZip from 'jszip'
// import * as JSZipUtils from 'jszip-utils'
// import Tools3d from "./Tools3d"
// import PanelOptions from "./PanelOptions"
// import PanelProperty from "./PanelProperty"
// import PanelDispatcher from "./PanelDispatcher"
// import PanelHidden from "./PanelHidden"
// import PanelFilters from "./PanelFilters"
// import PanelDelta from "./PanelDelta"
// import PanelRooms from "./PanelRooms"
// import PanelCollisionSettings from "./PanelCollisionSettings"
// import PanelCollisionReport from "./PanelCollisionReport"
// import PanelTabs from "./PanelTabs"


//import PanelPlanes from "./PanelPlanes"

export default {
    name: 'ViewDwg',
    components: {
        // Tools3d,
        // PanelOptions,
        // PanelProperty,
        // PanelDispatcher,
        // PanelHidden,
        // PanelFilters,
        // PanelDelta,
        // PanelRooms,
        // PanelCollisionSettings,
        // PanelCollisionReport,
        // PanelTabs,
//        PanelPlanes
    },
    props: ['model', 'doc'],
    data: () => ({
        ready: false,
        indexModel: 0,
        listModel: [],
        viewer: '/ubviewer/',
        toolsbar: true,
        propertyJson: [],
        source: null,
        classifierJson: [],
        jsonLoad: {
            classifier: false,
            property: false
        },
        filters: [],
        delta: [],
        deltaList: {
            del: 0,
            mod: 0,
            add: 0,
            list: []
        },
        rooms: {
            list: [],
            colors: [],
            load: false
        },
        selectedObjID: null,
        hiddenList: [],
        levelsMap: null,
        collision_settings: false,
        collisions_version: null,
        collisions_compiling: false,
        compute_ready: true,
        // options: {
        //     '3d-view': {
        //         name: '3d-view',
        //         title: '3d виды',
        //         active: false,
        //         action: false,
        //         disabled: false,
        //         children: {
        //             left: {
        //                 parent: '3d-view',
        //                 name: 'left',
        //                 title: 'Слева',
        //                 active: false,
        //                 action: 'setView',
        //                 icon: 'trd-left'
        //             },
        //             right: {
        //                 parent: '3d-view',
        //                 name: 'right',
        //                 title: 'Справа',
        //                 active: false,
        //                 action: 'setView',
        //                 icon: 'trd-right'
        //             },
        //             top: {
        //                 parent: '3d-view',
        //                 name: 'top',
        //                 title: 'Сверху',
        //                 active: false,
        //                 action: 'setView',
        //                 icon: 'trd-top'
        //             },
        //             front: {
        //                 parent: '3d-view',
        //                 name: 'front',
        //                 title: 'Спереди',
        //                 active: false,
        //                 action: 'setView',
        //                 icon: 'trd-front'
        //             },
        //             back: {
        //                 parent: '3d-view',
        //                 name: 'back',
        //                 title: 'Сзади',
        //                 active: false,
        //                 action: 'setView',
        //                 icon: 'trd-back'
        //             },
        //         },
        //         icon: 'trd-d_view',
        //         divider: false
        //     },
        //     grid: {
        //         name: 'grid',
        //         title: 'Сетка',
        //         active: false,
        //         action: 'displayGrid',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-grid',
        //         divider: false
        //     },
        //     axis: {
        //         name: 'axis',
        //         title: 'Ось',
        //         active: true,
        //         action: 'displayAxes',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-axis',
        //         divider: false
        //     },
        //     walkview: {
        //         name: 'walkview',
        //         title: 'Вид от первого лица',
        //         active: false,
        //         action: 'setWalkView',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-street-view',
        //         divider: true
        //     },
        //     /*
        //     screenshot: {
        //         name: 'screenshot',
        //         title: 'Снимок сцены',
        //         active: false,
        //         action: false,
        //         children: null,
        //         icon: 'trd-screenshot',
        //         divider: false
        //     },
        //     */
        //     hidden: {
        //         name: 'hidden',
        //         title: 'Скрытые объекты',
        //         active: false,
        //         action: 'getHiddenObjects',
        //         disabled: false,
        //         children: null,
        //         icon: 'mdi-eye-off',
        //         divider: false
        //     },
        //     property: {
        //         name: 'property',
        //         title: 'Свойства объекта',
        //         active: false,
        //         action: 'setSelectionMode',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-propriety',
        //         divider: false
        //     },
        //     dispatcher: {
        //         name: 'dispatcher',
        //         title: 'Диспетчер проекта',
        //         active: false,
        //         action: 'onDispatcher',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-tree',
        //         divider: false
        //     },
        //     filters: {
        //         name: 'filters',
        //         title: 'Постановление 87',
        //         active: false,
        //         action: 'setFilters',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-P87',
        //         divider: false
        //     },
        //     delta: {
        //         name: 'delta',
        //         title: 'Версионность',
        //         active: false,
        //         action: 'onDelta',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-version1',
        //         hidden: true,
        //         divider: false
        //     },
        //     planes: {
        //         name: 'planes',
        //         title: '3d сечение',
        //         active: false,
        //         action: 'onSection',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-section',
        //         divider: false
        //     },
        //     rooms: {
        //         name: 'rooms',
        //         title: 'Комнаты',
        //         active: false,
        //         action: 'onRooms',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-zone',
        //         divider: false
        //     },
        //     tabs: {
        //         name: 'tabs',
        //         title: 'Спецификация',
        //         active: false,
        //         action: false,
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-table',
        //         hidden: false,
        //         minimize: true,
        //         divider: true
        //     },
        //     collisions: {
        //         name: 'collisions',
        //         title: 'Геометрические коллизии',
        //         active: false,
        //         action: 'setCollisions',
        //         disabled: false,
        //         children: null,
        //         icon: 'mdi-alert-outline',
        //         hidden: false,
        //         divider: false
        //     },
        //     collision_settings: {
        //         name: 'collision_settings',
        //         title: 'Правила проверки',
        //         active: false,
        //         action: 'onCollisionSettings',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-collision-settings',
        //         hidden: false,
        //         divider: false
        //     },
        //     collision_reports: {
        //         name: 'collision_reports',
        //         title: 'Результаты проверки',
        //         active: false,
        //         action: 'onCollisionReports',
        //         disabled: false,
        //         children: null,
        //         icon: 'trd-report',
        //         hidden: false,
        //         divider: true
        //     },
        //     download: {
        //         name: 'download',
        //         title: 'Скачать',
        //         active: false,
        //         action: false,
        //         disabled: false,
        //         children: {
        //             original: {
        //                 parent: 'download',
        //                 name: 'original',
        //                 title: 'Скачать файл',
        //                 active: false,
        //                 action: false,//'downloadFile',
        //                 icon: null
        //             },
        //             ifcxml: {
        //                 parent: 'download',
        //                 name: 'ifcxml',
        //                 title: 'Скачать РСИМ (ifcxmlRUS)',
        //                 active: false,
        //                 action: false,//'downloadFile',
        //                 icon: null
        //             },
        //         },
        //         icon: 'trd-download',
        //         //divider: true
        //         divider: false
        //     },
            // textures: {
            //     name: 'textures',
            //     title: 'Текстуры',
            //     active: true,
            //     action: 'enableTextures',
            //     children: null,
            //     icon: 'trd-texture',
            //     divider: false
            // },
            // scene_property: {
            //     name: 'scene_property',
            //     title: 'Свойства сцены',
            //     active: false,
            //     action: false,
            //     children: null,
            //     icon: 'trd-settings',
            //     divider: false
            // },
            // fullscreen: {
            //     name: 'fullscreen',
            //     title: 'Во весь экран',
            //     active: false,
            //     action: 'fullScreen',
            //     children: null,
            //     icon: 'trd-fullscreen',
            //     divider: false
            // }
        // },
        onLoads: {
            model: 0,
            filters: 100,
            applyFilters: 0,
            property: true,
            classifier: true,
            options: true
        },
        preloaderTytle: ''
    }),
    computed: {
        // getStylePanels(){
        //     let p = [
        //         this.options.hidden.active,
        //         this.options.filters.active,
        //         this.options.dispatcher.active,
        //         this.options.delta.active,
        //         this.options.rooms.active,
        //         this.options.collision_settings.active,
        //         this.options.collision_reports.active].filter(Boolean).length
        //     return {
        //         style: {
        //             'margin-bottom': '10px',
        //             height: 'calc(' + 100 / (p || 1) + '% - 10px)'
        //         },
        //         active: !!p
        //     }
        // },
        // multy(){
        //     return this.options.tabs.active && (this.options.property.active || this.getStylePanels.active)
        // },
        // getObjectProperties(){
        //     let id = this.selectedObjID
        //
        //     let prop = this.propertyJson.filter(c => (c.Guid != undefined && c.Guid == id)
        //         || (c.Id != undefined && c.Id == id))
        //
        //     return !prop.length
        //         ? {
        //             Name: '',
        //             Properties: []
        //         }
        //         : prop[0]
        // },
        // getClassifications(){
        //     let id = this.selectedObjID
        //     let prop = this.classifierJson != 'none'
        //         ? this.classifierJson.filter(c => (c.Guid != undefined && c.Guid == id)
        //             || (c.Id != undefined && c.Id == id))
        //         : []
        //     return prop.length
        //         ? prop[0]
        //         : this.classifierJson == 'none'
        //             ? id
        //                 ? 'none'
        //                 : null
        //             : null
        // },
        onLoadsCheck(){
            let flag = this.onLoads.model       >= 100
                && this.onLoads.filters         >= 100
                && this.onLoads.applyFilters    >= 100
                && this.onLoads.property
                && this.onLoads.classifier
                && this.onLoads.options

            return flag
        }
    },
    methods: {
        // initFilters(filters){
        //     let list = filters.map(f => {
        //         return {
        //             title: f.title,
        //             name: f.title,
        //             items: f.items.map(i => {
        //                 return {
        //                     name:  i.title,
        //                     title: i.title,
        //                     active: false,
        //                     filter: 'category',
        //                     items: i.grouppedByElementTypes.map(t => {
        //                         return {
        //                             active: false,
        //                             filter: 'type',
        //                             category: i.title,
        //                             name: t.title,
        //                             title: t.title,
        //                             items: []
        //                         }
        //                     })
        //                 }
        //             })
        //         }
        //     })
        //     let e = []
        //     list.map(bi => {
        //         if(this.filters.some(ai => ai.title == bi.title)){
        //         	let e1 = []
        //             this.filters = this.filters.map(ai => {
        //             	if(ai.title != bi.title){
        //                 	return ai
        //                 }
        //                 else{
        //                 	bi.items.map(bi1 => {
        //                     	if(ai.items.some(ai1 => ai1.name == bi1.name)){
        //                     		let e2 = []
        //                             ai.items = ai.items.map(ai1 => {
        //                             	if(ai1.name != bi1.name){
        //                                 	return ai1
        //                                 }
        //                                 else{
        //                                 	bi1.items.map(bi2 => {
        //                                     	if(!ai1.items.some(ai2 => ai2.name == bi2.name)){
        //                                         	e2 = [...e2, bi2]
        //                                         }
        //                                     })
        //                                     ai1.items = [...ai1.items, ...e2]
        //                                     return ai1
        //                                 }
        //                             })
        //                         }
        //                         else{
        //                         	e1 = [...e1, bi1]
        //                         }
        //                     })
        //                     ai.items = [...ai.items, ...e1]
        //                     return ai
        //                 }
        //             })
        //         }
        //         else{
        //         	e = [...e, bi]
        //         }
        //     })
        //     this.filters = [...this.filters, ...e]
        //
        //     return list
        // },
        // setWalkView(v){
        //     this.postMessage({
        //         action: 'setWalkView',
        //         value: v
        //     })
        // },
        // onSection(v){
        //     this.postMessage({
        //         action: 'onSection',
        //         value: v
        //     })
        // },
        onPreloader(){
            if(!this.onLoadsCheck){
                return new Promise(resolve => {
                    resolve(true)
                })
            }
            this.onLoads.applyFilters = 0
            return new Promise(resolve => {

                setTimeout(resolve, 2000)
            })
        },
        // getRoomsColors(o){
        //     this.rooms.colors = o.value
        // },
        // onRoomVisibility(o){
        //     this.postMessage({
        //         action: 'onRoomVisibilityItem',
        //         value: {
        //             id: o.id,
        //             val: o.value
        //         }
        //     })
        // },
        // onComputeCollisions(o){
        //     this.compute_ready = false
        //     this.postMessage({
        //         action: 'onComputeCollisions',
        //         value: {
        //             list_1: o.list_1,
        //             list_2: o.list_2,
        //             group: o.group,
        //             rule: o.rule,
        //             part: 'geom'
        //         }
        //     })
        // },
        // onComputeParameters(o){
        //     this.compute_ready = false
        //     const typeOf = (o, v) => {
        //         let list = []
        //         switch(o.type){
        //             case 'boolean': list = [o.value ? 1 : 0, v == 'Да' ? 1 : 0]
        //                 break
        //             case 'list': ;
        //             case 'string': list = [o.value, v]
        //                 break
        //             case 'integer': list = [parseInt(o.value), parseInt(v)]
        //                 break
        //             case 'float': list = [Number(o.value), Number(v)]
        //                 break
        //             default: ;
        //         }
        //         return list
        //     }
        //     this.loadPropertyJson()
        //     .then(res => {
        //         let list = []
        //         this.propertyJson.map(prop => {
        //             // let test = prop.Parameters.find(param => param.PropertyGroupTitle == 'Dimensions')
        //             let general = prop.Parameters.find(g => g.PropertyGroupTitle == 'Общие')
        //             if(general){
        //                 // let comp = general.PropertyList.find(f => f.Title == 'наименование компонента')
        //                 // if(comp && o.elements.some(s => s.name == comp.Value)){
        //                 //     let elem = o.elements.find(f => f.name == comp.Value)
        //                 let elem = o.elements.find(f => f.list.some(s => s == prop.Id))
        //
        //                     if(elem){
        //                         elem.values.map(v => {
        //                             let dimensions = prop.Parameters.find(d => d.PropertyGroupTitle == 'Размеры')
        //                             let val = false
        //                             if(dimensions){
        //                                 val = dimensions.PropertyList.find(f => f.Title.toLowerCase() == v.name)
        //                             }
        //
        //                             if(val){
        //                                 let equal = false
        //                                 let values = typeOf(v, val.Value)
        //                             console.log('check 1', values, v.equal)
        //                                 switch(v.equal){
        //                                     case 0: equal = values[1] > values[0]
        //                                         break
        //                                     case 1: equal = values[1] == values[0]
        //                                         break
        //                                     case 2: equal = values[1] < values[0]
        //                                         break
        //                                     case 3: equal = values[1] >= values[0]
        //                                         break
        //                                     case 4: equal = values[1] <= values[0]
        //                                         break
        //                                     case 5: equal = values[1] != values[0]
        //                                         break
        //                                     default: ;
        //                                 }
        //                             console.log('check', values, equal)
        //                                 if(!equal){
        //                                     list.push({
        //                                         name: prop.Name,
        //                                         id: prop.Id,
        //                                         property: val.Title,
        //                                         value: val.Value,
        //                                         valueRule: v.type == 'boolean'
        //                                             ? values[0] || 0
        //                                                 ? 'Да'
        //                                                 : 'Нет'
        //                                             : values[0],
        //                                         part: o.part
        //                                     })
        //                                 }
        //                             }
        //                         })
        //                     }
        //                 // }
        //             }
        //         })
        //
        //         this.saveCollisionReports({
        //             value: {
        //                 group: o.group,
        //                 rule: o.rule,
        //                 part: o.part,
        //                 parameters: list
        //             }
        //         })
        //     })
        //
        // },
        // onCollisionsActive(v){
        //     this.postMessage({
        //         action: 'onCollisionsActive',
        //         value: {
        //             list: v.list,
        //             active: v.active
        //         }
        //     })
        // },
        // onShowCollisionsOnly(v){
        //     this.postMessage({
        //         action: 'onShowCollisionsOnly',
        //         value: {
        //             list: v.list,
        //             active: v.active
        //         }
        //     })
        // },
        // onCreateSectionBoxForCollisions(v){
        //     this.postMessage({
        //         action: 'onCreateSectionBoxForCollisions',
        //         value: {
        //             list: v.list,
        //             active: v.active
        //         }
        //     })
        // },
        // onObjectsHighlight(v){
        //     this.postMessage({
        //         action: 'onObjectsHighlight',
        //         value: {
        //             list: v.list,
        //             active: v.active
        //         }
        //     })
        // },
        // onShowObjectsOnly(v){
        //     this.postMessage({
        //         action: 'onShowObjectsOnly',
        //         value: {
        //             list: v.list,
        //             active: v.active
        //         }
        //     })
        // },
        // onCreateSectionBoxForObjects(v){
        //     this.postMessage({
        //         action: 'onCreateSectionBoxForObjects',
        //         value: {
        //             list: v.list,
        //             active: v.active
        //         }
        //     })
        // },
        // onRemoveSectionBox(){
        //     this.postMessage({
        //         action: 'onRemoveSectionBox'
        //     })
        // },
        // saveCollisionReports(v){
        //     let meta = JSON.parse(JSON.stringify(this.$store.state.common.meta))
        //     meta.collisions.version = this.model.version
        //     meta.collisions.groups = meta.collisions.groups.map(g => {
        //         if(g.id == v.value.group){
        //             g.status = 1
        //             g.children = g.children.map(r => {
        //                 if(r.id == v.value.rule){
        //                     let reports = []
        //                     let status = 0
        //                     if(v.value.part == 'geom'){
        //                         reports = v.value.collision_pairs
        //                         status = v.value.collision_pairs.length
        //                             ? 0
        //                             : 1
        //                     }
        //                     if(v.value.part == 'params'){
        //                         reports = v.value.parameters
        //                         status = v.value.parameters.length
        //                             ? 0
        //                             : 1
        //                     }
        //                     r.reports = reports
        //                     r.status = status
        //                     r.part = v.value.part
        //                 }
        //                 return r
        //             })
        //         }
        //         g.children.map(r => {
        //             if(!r.status){
        //                 g.status = 0
        //             }
        //         })
        //         return g
        //     })
        //
        //     this.$store.dispatch('common/setFileMeta', {
        //         id: this.model.id,
        //         body: JSON.stringify(meta)
        //     })
        //     .then(res => {
        //         return  this.$store.dispatch('common/getFileMeta', {
        //             id: this.model.id
        //         })
        //     })
        //     .then(res => {
        //         this.collisions_compiling = false
        //         this.compute_ready = true
        //         if(res.error){
        //             this.$notify({
        //                 group: 'note',
        //                 type: 'error',
        //                 text: res.data.error,
        //                 message: res.data.error,
        //             })
        //         }
        //         else{
        //             this.$notify({
        //                 group: 'note',
        //                 type: 'success',
        //                 text: 'Проверка выполнена.',
        //                 message: 'Проверка выполнена.',
        //             })
        //         }
        //     })
        //     .catch(e => {
        //         this.collisions_compiling = false
        //         this.compute_ready = true
        //     })
        // },
        // onRooms(v){
        //     this.postMessage({
        //         action: 'onRoomVisibility',
        //         value: v
        //     })
        //     if(v){
        //         return new Promise(resolve => {
        //             if(!this.jsonLoad.property){
        //                 this.onLoads.property = false
        //
        //                 let promisesList = []
        //                 if(this.model.type == 'consolidations'){
        //                     this.listModel.map(l => {
        //                         // if(l.tags['mini.json'] == 1){
        //                         //     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/mini.json'}))
        //                         // }
        //                         // else
        //                         if(l.tags['json'] == 1){
        //                             promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/json'}))
        //                         }
        //                         else if(l.tags['json.zip'] == 1){
        //                             promisesList.push(new Promise(resolve => {
        //                                 this.$store.dispatch('common/getFile', {
        //                                     id: this.getFileByVersion(l).url + '/json.zip',
        //                                     typeBlob: 'blob'
        //                                 })
        //                                 .then(res => {
        //                                     return Promise.resolve(res.file)
        //                                 })
        //                                 .then(res => JSZip.loadAsync(res))
        //                                 .then(zip => {
        //                                     let filesList = Object.keys(zip.files)
        //                                     return zip.file(filesList[0]).async("string")
        //                                 })
        //                                 .then(text => {
        //                                     resolve(JSON.parse(text))
        //                                 })
        //                             }))
        //                         }
        //                     })
        //                 }
        //                 else{
        //                     // if(this.model.tags['mini.json'] == 1){
        //                     //     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/mini.json'}))
        //                     // }
        //                     // else
        //                     if(this.model.tags['json'] == 1){
        //                         promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/json'}))
        //                     }
        //                     else if(this.model.tags['json.zip'] == 1){
        //                         promisesList.push(new Promise(resolve => {
        //                             this.$store.dispatch('common/getFile', {
        //                                 id: this.getFileByVersion(this.model).url + '/json.zip',
        //                                 typeBlob: 'blob'
        //                             })
        //                             .then(res => {
        //                                 return Promise.resolve(res.file)
        //                             })
        //                             .then(res => JSZip.loadAsync(res))
        //                             .then(zip => {
        //                                 let filesList = Object.keys(zip.files)
        //                                 return zip.file(filesList[0]).async("string")
        //                             })
        //                             .then(text => {
        //                                 resolve(JSON.parse(text))
        //                             })
        //                         }))
        //                     }
        //                 }
        //
        //                 Promise.all(promisesList)
        //                 .then(res => {
        //                     res.map(r => {
        //                         this.propertyJson = [
        //                             ...this.propertyJson,
        //                             ...this.setProperties(r)
        //                         ]
        //                         let filters = r.GrouppedByCategories || []
        //                         this.filters = this.initFilters(filters)
        //                         this.rooms.list = this.propertyJson
        //                             .filter(f => f.object == 'Room')
        //                             .map(m => {
        //                                 return {
        //                                     ...m,
        //                                     active: true
        //                                 }
        //                             })
        //                     })
        //                     this.rooms.load = true
        //                     this.jsonLoad.property = true
        //                     this.onLoads.property = true
        //                     resolve(true)
        //                 })
        //             }
        //             else{
        //                 this.rooms.list = this.propertyJson
        //                     .filter(f => f.object == 'Room')
        //                     .map(m => {
        //                         return {
        //                             ...m,
        //                             active: true
        //                         }
        //                     })
        //                 this.rooms.load = true
        //                 resolve(true)
        //             }
        //         })
        //     }
        // },
        // loadFilters(){
        //     return new Promise(resolve => {
        //         if(!this.jsonLoad.property){
        //             this.onLoads.property = false
        //
        //             let promisesList = []
        //             if(this.model.type == 'consolidations'){
        //                 this.listModel.map(l => {
        //                     // if(l.tags['mini.json'] == 1){
        //                     //     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/mini.json'}))
        //                     // }
        //                     // else
        //                     if(l.tags['json'] == 1){
        //                         promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/json'}))
        //                     }
        //                     else if(l.tags['json.zip'] == 1){
        //                         promisesList.push(new Promise(resolve => {
        //                             this.$store.dispatch('common/getFile', {
        //                                 id: this.getFileByVersion(l).url + '/json.zip',
        //                                 typeBlob: 'blob'
        //                             })
        //                             .then(res => {
        //                                 return Promise.resolve(res.file)
        //                             })
        //                             .then(res => JSZip.loadAsync(res))
        //                             .then(zip => {
        //                                 let filesList = Object.keys(zip.files)
        //                                 return zip.file(filesList[0]).async("string")
        //                             })
        //                             .then(text => {
        //                                 resolve(JSON.parse(text))
        //                             })
        //                         }))
        //                     }
        //                 })
        //             }
        //             else{
        //                 // if(this.model.tags['mini.json'] == 1){
        //                 //     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/mini.json'}))
        //                 // }
        //                 // else
        //                 if(this.model.tags['json'] == 1){
        //                     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/json'}))
        //                 }
        //                 else if(this.model.tags['json.zip'] == 1){
        //                     promisesList.push(new Promise(resolve => {
        //                         this.$store.dispatch('common/getFile', {
        //                             id: this.getFileByVersion(this.model).url + '/json.zip',
        //                             typeBlob: 'blob'
        //                         })
        //                         .then(res => {
        //                             return Promise.resolve(res.file)
        //                         })
        //                         .then(res => JSZip.loadAsync(res))
        //                         .then(zip => {
        //                             let filesList = Object.keys(zip.files)
        //                             return zip.file(filesList[0]).async("string")
        //                         })
        //                         .then(text => {
        //                             resolve(JSON.parse(text))
        //                         })
        //                     }))
        //                 }
        //             }
        //
        //             Promise.all(promisesList)
        //             .then(res => {
        //         console.log('filters', res)
        //                 res.map(r => {
        //                     this.propertyJson = [
        //                         ...this.propertyJson,
        //                         ...this.setProperties(r)
        //                     ]
        //                     let filters = r.GrouppedByCategories || []
        //                     this.filters = this.initFilters(filters)
        //                 })
        //
        //                 this.jsonLoad.property = true
        //                 this.onLoads.property = true
        //                 resolve(true)
        //             })
        //         }
        //         else{
        //             resolve(true)
        //         }
        //     })
        // },
        // setFilters(v){
        //     this.onPreloader()
        //     .then(r => {
        //         return this.loadFilters()
        //     })
        //     .then(r => {
        //         if(v){
        //             this.filters.map(f => {
        //                 f.items.map(i => {
        //                     if(i.active){
        //                         this.onFilter(i)
        //                         if(i.items.length){
        //                             i.items.map(t => {
        //                                 this.onFilter(i)
        //                             })
        //                         }
        //                     }
        //                 })
        //             })
        //             this.onFilter({filter: 'enable'})
        //         }
        //         else{
        //             this.onFilter({filter: 'clear'})
        //             this.onFilter({filter: 'disable'})
        //         }
        //     })
        // },
        // onFilter(o){
        //     this.onPreloader()
        //     .then(r => {
        //         this.postMessage({
        //             action: 'onFilter',
        //             value: o
        //         })
        //     })
        // },
        // setOption(o){
        //     this.options[o.name].active = !o.active
        //     if(this.options[o.name].action){
        //         this[this.options[o.name].action](this.options[o.name].active)
        //     }
        // },
        // setSubOption(o){
        //     this.options[o.name].children[o.sub_name].active = !o.sub_active
        //     if(this.options[o.name].children[o.sub_name].action){
        //         this[this.options[o.name].children[o.sub_name].action](this.options[o.name].children[o.sub_name])
        //     }
        //     this.setOption(o)
        // },
        // updateOption(o){
        //     this.options[o.item.name][o.prop] = o.value
        // },
        // hideOptions(list){
        //     list.map(l => {
        //         if(this.options[l].active){
        //             this.setOption({
        //                 name: l,
        //                 active: true
        //             })
        //         }
        //         this.options[l].disabled = true
        //     })
        // },
        // showOptions(list = null){
        //     if(!list){
        //         Object.keys(this.options)
        //             .map(key => {
        //                 this.options[key].disabled = false
        //             })
        //     }
        //     else{
        //         list.map(l => {
        //             this.options[l].disabled = false
        //         })
        //     }
        // },
        // onCollisionSettings(v){
        //     this.postMessage({
        //         action: 'onLoadCollisions'
        //     })
        //     this.collision_settings = v
        //     if(v){
        //         this.$store.dispatch('workflow/getCollisionTemplates')
        //         this.$store.dispatch('common/getFileMeta', {
        //             id: this.model.id
        //         })
        //         .then(res => {
        //             let meta = JSON.parse(res)
        //             if(meta){
        //                 if(meta.collisions){
        //                     let version = meta.collisions.version || null
        //                     if(this.model.version != null && this.model.version != version){
        //                         // this.collisions_compiling = true
        //                     }
        //                     // this.params = {...meta.collisions, temp: {}}
        //                 }
        //             }
        //         })
        //     }
        // },
        // onCollisionReports(v){
        //     this.postMessage({
        //         action: 'onLoadCollisions'
        //     })
        //     if(v){
        //         this.$store.dispatch('workflow/getCollisionTemplates')
        //         this.$store.dispatch('common/getFileMeta', {
        //             id: this.model.id
        //         })
        //         .then(res => {
        //             let meta = JSON.parse(res)
        //             if(meta){
        //                 if(meta.collisions){
        //                     this.collisions_version = meta.collisions.version || null
        //                     // this.params = {...meta.collisions, temp: {}}
        //                 }
        //             }
        //         })
        //     }
        // },
        // setCollisions(v){
        //     if(this.model.type == 'consolidations'){
        //         if(this.listModel.some(s => s.tags['collisions.json'] == 1)){
        //             this.postMessage({
        //                 action: 'setCollisions',
        //                 value: v
        //             })
        //         }
        //     }
        //     else{
        //         if(this.model.tags['collisions.json'] == 1){
        //             this.postMessage({
        //                 action: 'setCollisions',
        //                 value: v
        //             })
        //         }
        //     }
        // },
        // getHiddenObjects(v){
        //     if(v){
        //         this.postMessage({
        //             action: 'onGetHiddenObjects',
        //             value: v
        //         })
        //     }
        // },
        // onGetHiddenObjects(v){
        //     let items = this.propertyJson.filter(c => (c.Guid != undefined && v.some(s => c.Guid == s))
        //         || (c.Id != undefined && v.some(s => c.Id == s)))
        //
        //     this.hiddenList = items.map(i => ({name: i.Name, id: i.Id || i.Guid}))
        // },
        // onHideObject(v){
        //     this.postMessage({
        //         action: 'onHideObject',
        //         value: v
        //     })
        // },
        // onShowObject(v){
        //     this.postMessage({
        //         action: 'onShowObject',
        //         value: v
        //     })
        //     if(this.selectedObjID){
        //         this.postMessage({
        //             action: 'selectObjectById',
        //             value: this.selectedObjID
        //         })
        //     }
        // },
        // hiddenOptionsBtn(){
        //     this.options.delta.hidden = !(this.model.files.length > 1)
        //         || !(this.model.tags['delta.json'] || false)
        //     // this.options.collisions.hidden = !(this.model.tags['collisions.json']
        //     //         ? this.model.tags['collisions.json'] == 1
        //     //             ? true
        //     //             : false
        //     //         : false)
        // },
        // onDelta(v){
        //     if(v){
        //         this.hideOptions(['hidden', 'property', 'filters', 'planes'])
        //         this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/delta.json'})
        //         .then(res => {
        //             this.delta = res.Elements
        //             if(!this.propertyJson.length){
        //                 return this.loadFilters()
        //             }
        //             else{return true}
        //         })
        //         .then(() => {
        //             return this.$store.dispatch('common/getFileInfo', {id: this.model.files[1].url + '/info'})
        //         })
        //         .then(res => {
        //             if(res.tags['json.zip']){
        //                 return new Promise(resolve => {
        //                     this.$store.dispatch('common/getFile', {
        //                         id: this.getFileByVersion(this.model).url + '/json.zip',
        //                         typeBlob: 'blob'
        //                     })
        //                     .then(res => {
        //                         return Promise.resolve(res.file)
        //                     })
        //                     .then(res => JSZip.loadAsync(res))
        //                     .then(zip => {
        //                         let filesList = Object.keys(zip.files)
        //                         return zip.file(filesList[0]).async("string")
        //                     })
        //                     .then(text => {
        //                         resolve(JSON.parse(text))
        //                     })
        //                 })
        //             }
        //             else{
        //                 return this.$store.dispatch('common/getFileInfo', {id: this.model.files[1].url + '/json'})
        //             }
        //         })
        //         .then(res => {
        //             return this.setProperties(res)
        //         })
        //         .then(json2 => {
        //             let mod = 0
        //             let del = 0
        //             let add = 0
        //             this.deltaList.list = this.delta.map(d => {
        //                 let elem = {}
        //                 Object.entries(d).map(([key, value]) => {
        //                     elem = {...value}
        //                 })
        //                 return elem
        //             }).map(d => {
        //                 if(d.Status == 'modified'){
        //                     let elem = this.propertyJson.find(p => p.Id == d.Id)
        //                     mod++
        //                     let parameters = []
        //                     if(d.hasOwnProperty('ParametersStatus')){
        //                         d.Parameters.map(p => {
        //                             let group = elem.Parameters.find(f => f.PropertyGroupTitle == p.PropertyGroupTitle)
        //                             p.PropertyList.map(pr => {
        //                                 let param = group.PropertyList.find(epr => epr.Title == pr.Title)
        //                                 parameters.push({
        //                                     name: param.Title,
        //                                     value: param.Value || '---',
        //                                     units: param.Units || ''
        //                                 })
        //                             })
        //                         })
        //                     }
        //                     return {
        //                         id: elem.Id,
        //                         name: elem.Name,
        //                         status: d.Status,
        //                         color: 'yellow',
        //                         parameters: parameters
        //                     }
        //                 }
        //                 else if(d.Status == 'deleted'){
        //                     let elem = json2.find(p => p.Id == d.Id)
        //                     del++
        //                     return {
        //                         id: elem.Id,
        //                         name: elem.Name,
        //                         status: d.Status,
        //                         color: 'red'
        //                     }
        //                 }
        //                 else{
        //                     let elem = this.propertyJson.find(p => p.Id == d.Id)
        //                     add++
        //                     return {
        //                         id: elem.Id,
        //                         name: elem.Name,
        //                         status: d.Status,
        //                         color: 'green'
        //                     }
        //                 }
        //             }).map(d => {
        //                 return {
        //                     ...d,
        //                     name: d.id + ' | ' + d.name,
        //                     active: false,
        //                     quantity: []
        //                 }
        //             })
        //             this.deltaList.mod = mod
        //             this.deltaList.del = del
        //             this.deltaList.add = add
        //         })
        //     }
        //     else{
        //         this.showOptions()
        //     }
        //     this.postMessage({
        //         action: 'onDelta',
        //         token: this.$store.state.auth.access_token,
        //         id: this.model.files[1].url,
        //         value: v,
        //         prop: {
        //             type: 'rvt'
        //         }
        //     })
        // },
        // setView(v){
        //     let name = ''
        //     switch(v.name){
        //         case 'left':    name = 'setLeft'
        //                         break
        //         case 'right':   name = 'setRight'
        //                         break
        //         case 'top':     name = 'setTop'
        //                         break
        //         case 'front':   name = 'setFront'
        //                         break
        //         case 'back':    name = 'setBack'
        //                         break
        //         default: ;
        //     }
        //     this.postMessage({
        //         action: 'setView',
        //         name: name
        //     })
        //     v.active = false
        // },
        // displayAxes(v){
        //     this.postMessage({
        //         action: 'displayAxes',
        //         value: v
        //     })
        // },
        // displayGrid(v){
        //     this.postMessage({
        //         action: 'displayGrid',
        //         value: v
        //     })
        // },
        // onDispatcher(v){
        //     if(!this.levelsMap){
        //         let promisesList = []
        //         if(this.model.tags['json'] == 1){
        //             promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/json'}))
        //         }
        //         else if(this.model.tags['json.zip'] == 1){
        //             promisesList.push(new Promise(resolve => {
        //                 this.$store.dispatch('common/getFile', {
        //                     id: this.getFileByVersion(this.model).url + '/json.zip',
        //                     typeBlob: 'blob'
        //                 })
        //                 .then(res => {
        //                     return Promise.resolve(res.file)
        //                 })
        //                 .then(res => JSZip.loadAsync(res))
        //                 .then(zip => {
        //                     let filesList = Object.keys(zip.files)
        //                     return zip.file(filesList[0]).async("string")
        //                 })
        //                 .then(text => {
        //                     resolve(JSON.parse(text))
        //                 })
        //             }))
        //         }
        //         const getTree = (map, items, level) => {
        //             items
        //                 .filter(f => f.level == level)
        //                 .map((m, i, a) => {
        //                     if(level != 'main'){
        //                         map[level].size = a.length
        //                     }
        //                     getTree(map, items.filter(f => f.level != level), m.id)
        //                 })
        //         }
        //
        //         let map = {
        //             'all':{
        //                 id: 'all',
        //                 name: 'Генплан',
        //                 level: 'main',
        //                 hidden: false,
        //                 type: 'level',
        //                 size: 0,
        //                 selected: 0
        //             }
        //         }
        //
        //         Promise.all(promisesList)
        //         .then(res => {
        //             res.map(r => {
        //                 this.propertyJson = [
        //                     ...this.propertyJson,
        //                     ...this.setProperties(r)
        //                 ]
        //                 let levels = r.Levels || []
        //                 levels.map(l => {
        //                     map[l.Level.Id] = {
        //                         name: l.Level.Name,
        //                         id: l.Level.Id,
        //                         level: 'all',
        //                         hidden: false,
        //                         type: 'level',
        //                         size: 0,
        //                         selected: 0
        //                     }
        //                     this.propertyJson
        //                         .filter(f => f.Level == l.Level.Id)
        //                         .map(m => {
        //                             map[m.Id] = {
        //                                 name: m.Name,
        //                                 id: m.Id,
        //                                 level: l.Level.Id,
        //                                 hidden: false,
        //                                 type: 'item'
        //                             }
        //                         })
        //                 })
        //                 getTree(map, Object.values(map), 'main')
        //                 this.levelsMap = map
        //             })
        //         })
        //     }
        // },
        // loadPropertyJson(){
        //     return new Promise(resolve => {
        //         if(!this.jsonLoad.property){
        //             this.onLoads.property = false
        //             let promisesList = []
        //             if(this.model.type == 'consolidations'){
        //                 this.listModel.map(l => {
        //                     if(l.tags['json'] == 1){
        //                         promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/json'}))
        //                     }
        //                 })
        //             }
        //             else{
        //                 if(this.model.tags['json'] == 1){
        //                     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/json'}))
        //                 }
        //                 else if(this.model.tags['json.zip'] == 1){
        //                     promisesList.push(new Promise(resolve => {
        //                         this.$store.dispatch('common/getFile', {
        //                             id: this.getFileByVersion(this.model).url + '/json.zip',
        //                             typeBlob: 'blob'
        //                         })
        //                         .then(res => {
        //                             return Promise.resolve(res.file)
        //                         })
        //                         .then(res => JSZip.loadAsync(res))
        //                         .then(zip => {
        //                             let filesList = Object.keys(zip.files)
        //                             return zip.file(filesList[0]).async("string")
        //                         })
        //                         .then(text => {
        //                             resolve(JSON.parse(text))
        //                         })
        //                     }))
        //                 }
        //             }
        //                 // this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/mini.json'})
        //                 // .then(res => {
        //                 //     console.log('mini.json',res)
        //                 // })
        //
        //             Promise.all(promisesList)
        //             .then(res => {
        //                 res.map(r => {
        //                     this.propertyJson = [
        //                         ...this.propertyJson,
        //                         ...this.setProperties(r)
        //                     ]
        //                     let filters = r.GrouppedByCategories || []
        //                     this.filters = this.initFilters(filters)
        //                     this.source = r.Source || null
        //                 })
        //
        //                 this.jsonLoad.property = true
        //                 this.onLoads.property = true
        //                 resolve(true)
        //             })
        //         }
        //         else{
        //             resolve(true)
        //         }
        //     })
        // },
        // setSelectionMode(v){
        //     if(!this.jsonLoad.classifier){
        //         this.onLoads.classifier = false
        //
        //         let promisesList = []
        //         let no_classifier = false
        //         if(this.model.type == 'consolidations'){
        //             this.listModel.map(l => {
        //                 if(l.tags.hasOwnProperty('classifier.json')
        //                     && l.tags['classifier.json'] == 1){
        //                     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/classifier.json'}))
        //                 }
        //                 else{
        //                     no_classifier = true
        //                 }
        //             })
        //         }
        //         else{
        //             if(this.model.tags.hasOwnProperty('classifier.json')
        //                 && this.model.tags['classifier.json'] == 1){
        //                 promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/classifier.json'}))
        //             }
        //         }
        //
        //         Promise.all(promisesList)
        //         .then(res => {
        //             if(no_classifier){
        //                 this.classifierJson = 'none'
        //             }
        //             else{
        //                 res.map(r => {
        //                     this.classifierJson = [
        //                         ...this.classifierJson,
        //                         ...this.setProperties(r)
        //                     ]
        //                 })
        //             }
        //             this.jsonLoad.classifier = true
        //             this.onLoads.classifier = true
        //         })
        //
        //
        //         // if(this.model.tags.hasOwnProperty('classifier.json')
        //         //     && this.model.tags['classifier.json'] == 1
        //         // ){
        //         //     this.$store.dispatch('common/getFileInfo', {id: this.model.files[0].url + '/classifier.json'})
        //         //     .then(res => {
        //         //         this.classifierJson = this.setProperties(res)
        //         //         this.jsonLoad.classifier = true
        //         //         this.onLoads.classifier = true
        //         //     })
        //         // }
        //         // else{
        //         //     this.classifierJson = 'none'
        //         //     this.jsonLoad.classifier = true
        //         //     this.onLoads.classifier = true
        //         // }
        //     }
        //
        //     this.loadPropertyJson()
        //
        //     if(!v){
        //         this.selectedObjID = null
        //     }
        //     this.postMessage({
        //         action: 'setSelectionMode',
        //         value: v
        //     })
        // },
        onMouseDown(event){
            event.preventDefault()
        },
        onSelected(v){
            this.selectedObjID = v.id
        },
        initModel(){
            this.preloaderTytle = 'Загрузка файлов модели.'
            this.postMessage({
                token: this.$store.state.auth.access_token,
                id: this.getFileByVersion(this.model).url,
                action: 'loadExt',
                type: this.model.type
            })
        },
        onLoadModel(v){
            // if(this.model.type == 'consolidations'){
            //     if(this.indexModel + 1 == this.listModel.length){
            //         this.onLoads.model = v.value
            //     }
            // }
            // else{
            //     this.onLoads.model = v.value
            // }
        },
        onLoadFilters(v){
            this.onLoads.filters = v
        },
        onLoadApplyFilters(v){
            console.log('onLoadApplyFilters', v)
            // if(this.model.type == 'consolidations'){
            //     if(this.indexModel + 1 == this.listModel.length){
            //         this.onLoads.applyFilters = v.value
            //     }
            //     else{
            //         this.onLoads.applyFilters = 0
            //         this.indexModel += 1
            //         this.initModel()
            //     }
            // }
            // else{
            //     this.onLoads.applyFilters = v.value
            // }


            if(this.onLoads.applyFilters != v.value){
                this.onLoads.applyFilters = v.value
            }
        },
        onReadyModel(v){
            if(this.model.type == 'consolidations'){
                if(this.indexModel + 1 == this.listModel.length){
                    this.onLoads.model = 100
                    this.onLoads.applyFilters = 100
                }
                else{
                    this.onLoads.applyFilters = 0
                    this.indexModel += 1
                    this.initModel()
                }
            }
            else{
                this.onLoads.model = 100
                this.onLoads.applyFilters = 100
            }
        },
        setProperties(o){
            let list = o['Elements']
                .map(e => {
                    let elem = {}
                    Object.entries(e).map(([key, value]) => {
                        elem = {...value, object: key}
                    })
                    return elem
            })
            return list
        },
        updateCanvasSize(){
            this.setCanvasSize()
        },
        getFileByVersion(f){
            if(f.version == null){
                return f.files[0]
            }
            else{
                let file = f.files.find(i => i.version == f.version)
                return file ? file : f.files[0]
            }
        },
        onWindowResize(){
            this.updateCanvasSize()
        },
        onKeyup(e){
            let frame = this.$refs['viewer'].contentWindow.document.getElementById('canvas')
            let newEvent = new Event('keyup', {key: e.key, code: e.code, composed: true, charCode: e.charCode, keyCode: e.keyCode, which: e.which, bubbles: true, cancelable: true, which: e.keyCode})
            newEvent.keyCode = e.keyCode
            newEvent.which = e.keyCode
            frame.dispatchEvent(newEvent)
        },
        onKeydown(e){
            let frame = this.$refs['viewer'].contentWindow.document.getElementById('canvas')
            let newEvent = new Event('keydown', {key: e.key, code: e.code, composed: true, charCode: e.charCode, keyCode: e.keyCode, which: e.which, bubbles: true, cancelable: true, which: e.keyCode})
            newEvent.keyCode = e.keyCode
            newEvent.which = e.keyCode
            frame.dispatchEvent(newEvent)
        },
        postMessage(v){
            this.$refs['viewer'].contentWindow.postMessage(v, '*')
        },
        receiveMessage(e){
            if(Object.prototype.hasOwnProperty.call(e.data, 'action')){
                switch(e.data.action){
                    case 'ready': this.initModel()
                        document.addEventListener('keyup', this.onKeyup)
                        document.addEventListener('keydown', this.onKeydown)
                        break
                    // case 'onStartLoadFilters': this.preloaderTytle = 'Загрузка свойств модели.'
                    //     break
                    // case 'onSelected': this.onSelected(e.data)
                    //     break
                    // case 'onLoadApplyFilters': this.onLoadApplyFilters(e.data)
                    //     break
                    case 'onLoadModel': this.onLoadModel(e.data)
                        break
                    case 'onReadyModel': this.onReadyModel(e.data)
                        break
                    // case 'getRoomsColors': this.getRoomsColors(e.data)
                    //     break
                    // case 'onGetHiddenObjects': this.onGetHiddenObjects(e.data.value)
                    //     break
                    // case 'saveCollisionReports': this.saveCollisionReports(e.data)
                    //     break
                    default: ;
                }
            }
        }
    },
    mounted(){
        // this.$refs['viewer'].src = this.viewer
        window.addEventListener("message", this.receiveMessage, false)
    },
    created(){
        this.preloaderTytle = 'Загрузка просмотрщика.'
        // this.hiddenOptionsBtn()
        //window.addEventListener('keyup', this.onKeyup)
    },
    beforeDestroy(){
        this.ready = false
        window.removeEventListener("message", this.receiveMessage, false)

        this.$el.removeEventListener('mousedown', this.onMouseDown, false)
        window.removeEventListener('keyup', this.onKeyup)
        window.removeEventListener('keydown', this.onKeydown)
    }

}
</script>
<style>
#canvas{
    position: relative;
}
#canvas canvas{
    outline: none;
}
.test{
    position: fixed;
    top: 0;
    left: 0;
    width: 100px;
    height: 100px;
    background-color: #fff;
    z-index: 111111111;
}
</style>
