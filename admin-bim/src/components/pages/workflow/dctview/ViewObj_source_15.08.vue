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
                    :properties="propertiesObj"
                    :classifications="classifierList"
                    :styleP="getStylePanelsLeft.style"/>

                <panel-resurs
                    v-show="options.resurs.active"
                    :menuItem="options.resurs"
                    :model="model"
                    :source="source"
                    @setOption="setOption"
                    @onHideObject="onHideObject"
                    @onShowObject="onShowObject"
                    @onObjectsHighlight="onObjectsHighlight"
                    @onShowObjectsOnly="onShowObjectsOnly"
                    @onCreateSectionBoxForObjects="onCreateSectionBoxForObjects"
                    @onRemoveSectionBox="onRemoveSectionBox"
                    :postMessage="postMessage"
                    :selectedObjID.sync="selectedObjID"
                    :hiddenList="hiddenList"
                    :styleP="getStylePanelsLeft.style"/>

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
                    @onDispatcher="onDispatcher"
                    @getJsonFile="getJsonFile"
                    :levelsMap="levelsMap"
                    :hiddenList="hiddenList"
                    :postMessage="postMessage"
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

            <panel-search
                    v-show="options.search.active"
                    @setOption="setOption"
                    @onSearch="onSearch"
                    :worker="worker"
                    :ParamSearch.sync="ParamSearch"
                    :styleP="getStylePanels.style"
                    :postMessage="postMessage"
                    :menuItem="options.search"
                    :list.sync="ParamSearchId"
                    />

                <panel-rooms
                    v-show="options.rooms.active"
                    :menuItem="options.rooms"
                    @setOption="setOption"
                    @onRoomVisibilityItem="onRoomVisibilityItem"
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
                    @onComputeSpaceWorker="onComputeSpaceWorker"
                    @onComputeDistanceWorker="onComputeDistanceWorker"
                    @onComputeNumberObjRoomsWrkr="onComputeNumberObjRoomsWrkr"
                    @onComputeRepeat="onComputeRepeat"
                    :collision_settings="collision_settings"
                    :collisions_compiling.sync="collisions_compiling"
                    :styleP="getStylePanels.style"/>

            <!-- for component panel-collision-report
             :collisions="options.collisions.active" -->
                <panel-collision-report
                    v-show="options.collision_reports.active"
                    :menuItem="options.collision_reports"
                    :planes="options.planes.active"
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
                <panel-work-list
                    v-show="options.work_list.active"
                    :menuItem="options.work_list"
                    :model="model"
                    :selectedObjID="selectedObjID"
                    :selectedObjIDList="selectedObjIDList"
                    :propertyJson="properties"
                    :source="source"
                    @setOption="setOption"
                    @onSetSelectionMode="onSetSelectionMode"
                    @onClearSelection="onClearSelection"
                    @onShowObjectsOnly="onShowObjectsOnly"
                    @onSetColorForObjects="onSetColorForObjects"
                    @onSetColorsForObjects="onSetColorsForObjects"
                    @onUnsetColorsForObjects="onUnsetColorsForObjects"
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
                        <!--<div class="vm-progress--percent"><span>{{getPercent}}%</span></div>-->
                    </div>
                    <span>{{preloaderTitle}}</span>
                </div>
            </div>

        </v-layout>
        <!--
		<tools3d
            :toolsbar.sync="toolsbar"
            :document="model"
            :listModel="listModel"
            :project_id="project_id"
            :screen.sync="screen"
            :blob="blob"
            :screenshot="screenshot"
            :selectedObjID="selectedObjID"
            :onLoadsCheck="onLoadsCheck"
            :propertiesObj="propertiesObj"
            :worker="worker"
            @onMarker="onMarker"
            @onScreenShot="onScreenShot"
            @onSetSelectionMode="onSetSelectionMode"
            @getImageData="onMarker"
            ref="tools"
            />
        -->

        <indicator :partial="partialData" />
    </v-container>
</template>

<script>
import { checklicense } from '@/utils/services'
import * as JSZip from 'jszip'
import * as JSZipUtils from 'jszip-utils'
import { v4 as uuidv4 } from 'uuid'
import { http, api } from '@/utils/define'
import Tools3d from "./Tools3d"
import PanelOptions from "./PanelOptions"
import PanelProperty from "./PanelProperty"
import PanelDispatcher from "./PanelDispatcher"
import PanelResurs from "./PanelResurs"
import PanelHidden from "./PanelHidden"
import PanelFilters from "./PanelFilters"
import PanelDelta from "./PanelDelta"
import PanelRooms from "./PanelRooms"
import PanelSearch from "./PanelSearch"
import PanelCollisionSettings from "./PanelCollisionSettings"
import PanelCollisionReport from "./PanelCollisionReport"
import PanelWorkList from "./PanelWorkList"
import PanelTabs from "./PanelTabs"
//import PanelPlanes from "./PanelPlanes"
import Indicator from "./Indicator"

export default {
    name: 'ViewObj',
    components: {
        Tools3d,
        PanelOptions,
        PanelProperty,
        PanelDispatcher,
        PanelResurs,
        PanelHidden,
        PanelFilters,
        PanelDelta,
        PanelSearch,
        PanelRooms,
        PanelCollisionSettings,
        PanelCollisionReport,
        PanelWorkList,
        PanelTabs,
        Indicator
//        PanelPlanes
    },
    props: ['model', 'doc', 'project_id', 'filesId'],
    data: () => ({
        canvas: null,
        worker: null,
        screen: '',
        blob: '',
        screenshot: '',
        ready: false,
        ParamSearch: [],
        ParamSearchId: [],
        indexModel: 0,
        listModel: [],
        viewer: '/ubviewer/',
        // viewer: 'http://localhost:8081',
        toolsbar: false,
        scale: 'page-mini',
        properties: [],
        propertyJson: [],
        propertiesObj: {
            Name: '',
            Properties: []
        },
        classifierList: null,
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
        search: {
            list: [],
            colors: [],
            load: false
        },
        rooms: {
            list: [],
            colors: [],
            load: false
        },
        selectedObjID: null,
        selectedObjIDList: null,
        selectionModeCount: 0,
        hiddenList: [],
        levelsMap: [],
        collision_settings: false,
        collisions_version: null,
        collisions_compiling: false,
        compute_ready: true,
        options: {
            '3d-view': {
                name: '3d-view',
                title: '3d виды',
                active: false,
                action: false,
                disabled: false,
                expanded: false,
                children: {
                    left: {
                        parent: '3d-view',
                        name: 'left',
                        title: 'Слева',
                        active: false,
                        action: 'setView',
                        icon: 'trd-left'
                    },
                    right: {
                        parent: '3d-view',
                        name: 'right',
                        title: 'Справа',
                        active: false,
                        action: 'setView',
                        icon: 'trd-right'
                    },
                    top: {
                        parent: '3d-view',
                        name: 'top',
                        title: 'Сверху',
                        active: false,
                        action: 'setView',
                        icon: 'trd-top'
                    },
                    front: {
                        parent: '3d-view',
                        name: 'front',
                        title: 'Спереди',
                        active: false,
                        action: 'setView',
                        icon: 'trd-front'
                    },
                    back: {
                        parent: '3d-view',
                        name: 'back',
                        title: 'Сзади',
                        active: false,
                        action: 'setView',
                        icon: 'trd-back'
                    },
                },
                icon: 'trd-d_view',
                hidden: false,
                divider: false
            },
            grid: {
                name: 'grid',
                title: 'Сетка',
                active: false,
                action: 'displayGrid',
                disabled: false,
                children: null,
                icon: 'trd-grid',
                hidden: false,
                divider: false
            },
            axis: {
                name: 'axis',
                title: 'Ось',
                active: true,
                action: 'displayAxes',
                disabled: false,
                children: null,
                icon: 'trd-axis',
                hidden: false,
                divider: false
            },
            walkview: {
                name: 'walkview',
                title: 'Вид от первого лица',
                active: false,
                action: 'setWalkView',
                disabled: false,
                children: null,
                icon: 'trd-street-view',
                hidden: false,
                divider: true
            },
            /**** FOR MGGT
            '2d': {
                name: '2d',
                title: '2D',
                active: false,
                action: 'set2dViewMode',
                disabled: false,
                children: null,
                icon: 'trd-2d',
                hidden: false,
                divider: true
            },
            ****/
            // marker: {
            //     name: 'marker',
            //     title: 'Marker',
            //     active: false,
            //     action: 'onMarker',
            //     disabled: false,
            //     children: null,
            //     icon: 'mdi-border-style',
            //     hidden: false,
            //     divider: true
            // },

            screenshot: {
                name: 'screenshot',
                title: 'Снимок сцены',
                active: false,
                action: 'onScreenShot',
                children: null,
                icon: 'trd-screenshot',
                divider: false,
                hidden: true
            },
            hidden: {
                name: 'hidden',
                title: 'Скрытые объекты',
                active: false,
                action: 'getHiddenObjects',
                disabled: false,
                children: null,
                icon: 'mdi-eye-off',
                hidden: false,
                divider: false
            },
            property: {
                name: 'property',
                title: 'Свойства объекта',
                active: false,
                action: 'setSelectionMode',
                disabled: false,
                children: null,
                icon: 'trd-propriety',
                hidden: false,
                divider: false
            },
            dispatcher: {
                name: 'dispatcher',
                title: 'Диспетчер проекта',
                active: false,
                action: 'onDispatcher',
                disabled: false,
                children: null,
                icon: 'trd-tree',
                hidden: false,
                divider: false
            },
            filters: {
                name: 'filters',
                title: 'Постановление 87',
                active: false,
                action: 'setFilters',
                disabled: false,
                children: null,
                icon: 'trd-P87',
                hidden: true,
                divider: false
            },
            delta: {
                name: 'delta',
                title: 'Версионность',
                active: false,
                action: 'onDelta',
                disabled: false,
                children: null,
                icon: 'trd-version1',
                hidden: true,
                divider: false
            },
            planes: {
                name: 'planes',
                title: 'Анализ сечения',
                active: false,
                action: 'onSectionParent',
                disabled: false,
                expanded: false,
                children: {
                    planex: {
                        parent: 'planes',
                        name: 'planex',
                        title: 'по X',
                        active: false,
                        action: 'onSection',
                        icon: 'trd-axis_x'
                    },
                    planey: {
                        parent: 'planes',
                        name: 'planey',
                        title: 'по Y',
                        active: false,
                        action: 'onSection',
                        icon: 'trd-axis_y'
                    },
                    planez: {
                        parent: 'planes',
                        name: 'planez',
                        title: 'по Z',
                        active: false,
                        action: 'onSection',
                        icon: 'trd-axis_z'
                    },
                    level: {
                        parent: 'planes',
                        name: 'level',
                        title: 'по "потолку" уровня',
                        active: false,
                        action: 'onSection',
                        icon: 'trd-D_section'
                    }
                },
                icon: 'trd-section1',
                hidden: false,
                divider: false
            },
            rooms: {
                name: 'rooms',
                title: 'Комнаты',
                active: false,
                action: 'onRooms',
                disabled: false,
                children: null,
                icon: 'trd-zone',
                hidden: false,
                divider: false
            },
            tabs: {
                name: 'tabs',
                title: 'Спецификация',
                active: false,
                action: false,
                disabled: false,
                children: null,
                icon: 'trd-table',
                hidden: false,
                minimize: true,
                divider: true
            },
            search: {
                name: 'search',
                title: 'Поиск',
                active: false,
                action: 'onSearch',
                disabled: false,
                children: null,
                icon: 'trd-search',
                hidden: true,
                divider: true
            },
            // collisions: {
            //     name: 'collisions',
            //     title: 'Геометрические коллизии',
            //     active: false,
            //     action: 'setCollisions',
            //     disabled: false,
            //     children: null,
            //     icon: 'mdi-alert-outline',
            //     hidden: false,
            //     divider: false
            // },
            collision_settings: {
                name: 'collision_settings',
                title: 'Правила проверки',
                active: false,
                action: 'onCollisionSettings',
                disabled: false,
                children: null,
                icon: 'trd-collision-settings',
                hidden: false,
                divider: false
            },
            collision_reports: {
                name: 'collision_reports',
                title: 'Результаты проверки',
                active: false,
                action: 'onCollisionReports',
                disabled: false,
                children: null,
                icon: 'trd-report',
                hidden: false,
                divider: true
            },
            resurs: {
                name: 'resurs',
                title: 'Ресурсы',
                active: false,
                action: 'onResurs',
                disabled: false,
                children: null,
                icon: 'trd-source',
                hidden: true,
                divider: false
            },
            work_list: {
                name: 'work_list',
                title: 'Список работ',
                active: false,
                action: 'onWorkList',
                disabled: false,
                children: null,
                icon: 'trd-list-work',
                hidden: true,
                divider: true
            },
            download: {
                name: 'download',
                title: 'Скачать',
                active: false,
                action: false,
                disabled: false,
                children: {
                    original: {
                        parent: 'download',
                        name: 'original',
                        title: 'Скачать файл',
                        active: false,
                        action: 'downloadF',
                        icon: null
                    },
                    ifcxml: {
                        parent: 'download',
                        name: 'ifcxml',
                        title: 'Скачать РСИМ (ifcxmlRUS)',
                        active: false,
                        action: 'downloadI',
                        icon: null
                    },
                },
                icon: 'trd-download',
                hidden: false,
                divider: false
            },
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
        },
        onLoads: {
            model: 0,
            filters: 100,
            applyFilters: 0,
            worker: false,
            property: false,
            classifier: true,
            options: true,
            collisions: true
        },
        preloaderTitle: '',
        preloaderInit: {
            step: 0,
            amount: 1
        },
        marker: null,
        partialData: null
    }),
    computed: {
        getPercent(){
            let amount = this.model.type == 'consolidations'
                ? this.model.consolidations.length
                : 1
            amount = amount * 2 + this.preloaderInit.amount
            // console.log('this.preloaderInit.step', this.preloaderInit.step)
            return Math.round((100 / amount) * this.preloaderInit.step)
        },
        getStylePanelsLeft(){
            let p = [
                this.options.property.active,
                this.options.resurs.active].filter(Boolean).length
            return {
                style: {
                    'margin-bottom': '10px',
                    height: 'calc(' + 100 / (p || 1) + '% - 10px)'
                },
                active: !!p
            }
        },
        getStylePanels(){
            let p = [
                this.options.hidden.active,
                this.options.filters.active,
                this.options.dispatcher.active,
                this.options.delta.active,
                this.options.rooms.active,
                this.options.search.active,
                this.options.collision_settings.active,
                this.options.collision_reports.active,
                this.options.work_list.active].filter(Boolean).length
            return {
                style: {
                    'margin-bottom': '10px',
                    height: 'calc(' + 100 / (p || 1) + '% - 10px)'
                },
                active: !!p
            }
        },
        multy(){
            return this.options.tabs.active && (this.options.property.active || this.getStylePanels.active || this.getStylePanelsLeft.active)
        },
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
                && this.onLoads.worker
                && this.onLoads.property
                && this.onLoads.classifier
                && this.onLoads.options
                && this.onLoads.collisions

            return flag
        },
    },
    watch: {
        // toolsbar: function(v){
        //     if(typeof this.scale === 'number'){
        //         return
        //     }
        //     if(v){
        //         setTimeout(function(){this.scale = 'page-full'}.bind(this), 400)
        //     }
        //     else{
        //         setTimeout(function(){this.scale = 'page-mini'}.bind(this), 400)
        //     }
        // },
        selectedObjID(v){
            console.log('--++selectedObjID', v)
            if(v){
                this.worker.postMessage({
                    action: 'getObjectProperties',
                    id: v
                })
            }
            else{
                this.propertiesObj = {
                    Name: '',
                    Properties: []
                }
                this.classifierList = null
            }
        }
    },
    methods: {
        getObjectProperties(d){
            this.propertiesObj = d.properties
            this.classifierList = d.classifierList
        },
        downloadF(){
            this.downloadFile({
                file: this.model,
                type: 'origin'
            })
        },
        downloadI(){
            if(this.model.tags['ifcxml.zip'] != 1){
                return
            }
            this.downloadFile({
                file: this.model,
                type: 'ifcxml'
            })
        },
        downloadFile(f){
            let url = ''
            let name = ''
            if(f.type !== 'ifcxml'){
                url = this.getFileByVersion(f.file).url
                name = f.file.name
            }
            else{
                url = this.getFileByVersion(f.file).url + '/ifcxml.zip'
                name = f.file.name_short + '.ifcxml.zip'
            }

            let uuid = uuidv4()
            this.$store.dispatch('common/setUploadNote', [{
                name: f.file.name,
                uuid: uuid,
                action: 'download',
                pushin: true
            }])
            this.$store.dispatch('common/getFile', {
                id: url,
                uuid: uuid,
                typeBlob: 'blob'
            })
            .then(res => {
                this.$store.dispatch('common/setUploadNote', [{
                    uuid: uuid,
                    action: 'download',
                    pushin: false
                }])
                if(!res.error){
                    let a = document.createElement("a")
                    let objectURL = URL.createObjectURL(res.file)
                    a.href = objectURL
                    a.download = name
                    document.body.appendChild(a)
                    a.click()
                    URL.revokeObjectURL(objectURL)
                    a.remove()
                }
                else{
                    console.log('downloadFile error', err)
                }
            })
            .catch(err => {
                console.log('downloadFile error', err)
            })
        },
        // initFilters(filters){
        //     let list = []
        //     return list
        // },
        setWalkView(v){
            this.postMessage({
                action: 'setWalkView',
                value: v
            })
        },
        set2dViewMode(val){
            this.postMessage({
                action: 'set2dViewMode',
                value: val
            })
        },
        onSectionParent(val){
        },
        onSection(val){
            this.postMessage({
                action: 'onSection',
                value: val.name,
                sts: val.active
            })
        },
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
        onComputeDistanceWorker(o){
    console.log('<<< value in to worker', o)
            this.compute_ready = false
            this.worker.postMessage({
                action: 'onComputeDistance',
                value: o
            })
        },
        onComputeDistanceUbviewer(o){
    console.log('<<< value in', o)
            // this.loadCollisions()
            let value = {
                lhs: o.lhs,
                rhs: o.rhs,
                Method: o.data.method,
                SubMethod: o.data.submethod,
                group: o.data.group,
                rule: o.data.rule,
                part: 'distance'
            }
            if(o.data.min !== false){
                value.MinDistance = parseFloat(o.data.min)
            }
            if(o.data.max !== false){
                value.MaxDistance = parseFloat(o.data.max)
            }
        console.log('<<< value', value)
            if(value.lhs.length && value.rhs.length){
        console.log('<<<onComputeDistanceUbviewer if')
                this.postMessage({
                    action: 'onComputeDistance',
                    value: value
                })
            }
            else{
        console.log('<<<onComputeDistanceUbviewer else')
                this.collisions_compiling = false
                this.compute_ready = true
            }
        },
        onComputeSpaceWorker(o){
            this.compute_ready = false
            this.worker.postMessage({
                action: 'onComputeSpace',
                value: o
            })
        },
        onComputeSpaceUbviewer(o){
            // this.loadCollisions()
            if(o.lhs.length && o.rhs.length){
                this.postMessage({
                    action: 'onComputeSpace',
                    value: {
                        lhs: o.lhs,
                        rhs: o.rhs,
                        axes: Object.fromEntries(Object.entries(o.data.axes)
                            .filter(([k, v]) => v.check)
                            .map(([k, v]) => {
                                return [k, parseFloat(v.value)]
                            })
                        ),
                        group: o.data.group,
                        rule: o.data.rule,
                        part: 'space'
                    }
                })
            }
            else{
                this.collisions_compiling = false
                this.compute_ready = true
            }
        },
        onComputeNumberObjRoomsWrkr(o){
            console.log('onComputeNumberObjRooms to worker', o)
            this.compute_ready = false
            this.worker.postMessage({
                action: 'onComputeNumberObjRooms',
                value: o
            })
        },
        onComputeNumberObjRooms(o){
            console.log('onComputeNumberObjRooms to wasm', o)
            // this.loadCollisions()
            this.postMessage({
                action: 'checkNumberOfObjectsIntoRooms',
                value: {
                    roomIds: o.roomIds,
                    entityIds: o.entityIds,
                    controlNumber: o.controlNumber,
                    group: o.group,
                    rule: o.rule,
                    part: 'numberobj'
                }
            })
        },
        onComputeRepeat(o){
            this.compute_ready = false
            // this.loadCollisions()
            this.postMessage({
                action: 'onComputeRepeat',
                value: {
                    group: o.group,
                    rule: o.rule,
                    part: 'repeat'
                }
            })
        },
        onComputeCollisions(o){
            console.log('onComputeCollisions to wasm', o)
            this.compute_ready = false
            // this.loadCollisions()
            this.postMessage({
                action: 'onComputeCollisions',
                value: {
                    list_1: o.list_1,
                    list_2: o.list_2,
                    group: o.group,
                    rule: o.rule,
                    part: 'geom'
                }
            })
        },
        onComputeParameters(o){
            this.compute_ready = false
            this.worker.postMessage({
                action: 'onComputeParameters',
                value: {...o, source: this.source}
            })
        },
        onRender(){
            this.onLoads.options = true
        },
        // onMarker(){
        //     console.log('onMarker')
        //     this.postMessage({
        //         action: 'onScreenShot'
        //     })
        // },
        onScreenShot(){
            // this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/info'})
            // .then(res => {
            //     console.log('!! info res', res)
            // })
            this.postMessage({
                action: 'onScreenShot'
            })
        },
        getScreenShot(data){
            console.log('data',data.url)
            this.screenshot = data.url

            this.blob = data.blob
        },
        onCollisionsActive(v){
            this.onLoads.options = false
            this.postMessage({
                action: 'onCollisionsActive',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
            // this.onLoads.options = true
        },
        onShowCollisionsOnly(v){
            this.postMessage({
                action: 'onShowCollisionsOnly',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
        },
        onCreateSectionBoxForCollisions(v){
            this.postMessage({
                action: 'onCreateSectionBoxForCollisions',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
        },
        onSetColorForObjects(v){
            this.postMessage({
                action: 'onSetColorForObjects',
                value: {
                    list: v.list,
                    color: v.color
                }
            })
        },
        onSetColorsForObjects(v){
            this.postMessage({
                action: 'onSetColorsForObjects',
                value: v
            })
        },
        onUnsetColorsForObjects(){
            this.postMessage({
                action: 'onUnsetColorsForObjects',
                value: {}
            })
        },
        onObjectsHighlight(v){
            this.postMessage({
                action: 'onObjectsHighlight',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
        },
        onShowObjectsOnly(v){
            this.postMessage({
                action: 'onShowObjectsOnly',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
        },
        onCreateSectionBoxForObjects(v){
            this.postMessage({
                action: 'onCreateSectionBoxForObjects',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
        },
        onRemoveSectionBox(){
            this.postMessage({
                action: 'onRemoveSectionBox'
            })
        },
        saveCollisionReports(v){
            let meta = JSON.parse(JSON.stringify(this.$store.state.common.meta))
            meta.collisions.version = this.model.version
                console.log('saveCollisionReports', v)
            let ruleName = ''

            meta.collisions.groups = meta.collisions.groups.map(g => {
                if(g.id == v.value.group){
                    g.status = 1
                    g.children = g.children.map(r => {
                        if(r.id == v.value.rule){
                            let reports = []
                            let status = 0
                            ruleName = r.name
                            if(v.value.part == 'geom'){
                                reports = v.value.collision_pairs
                                status = v.value.collision_pairs.length
                                    ? 0
                                    : 1
                            }
                            if(v.value.part == 'params'){
                                reports = v.value.parameters
                                status = v.value.parameters.length
                                    ? 0
                                    : 1
                            }
                            if(v.value.part == 'repeat'){
                                reports = v.value.collision_pairs
                                status = v.value.collision_pairs.length
                                    ? 0
                                    : 1
                            }
                            if(v.value.part == 'space'){
                                reports = v.value.collision_pairs
                                status = v.value.collision_pairs.length
                                    ? 0
                                    : 1
                            }
                            if(v.value.part == 'distance'){
                                reports = v.value.collision_pairs
                                status = v.value.collision_pairs.length
                                    ? 0
                                    : 1
                            }
                            if(v.value.part == 'numberobj'){
                                reports = v.value.badRooms
                                status = v.value.badRooms.length
                                    ? 0
                                    : 1
                            }
                            r.reports = reports
                            r.status = status
                            r.part = v.value.part
                        }
                        return r
                    })
                }
                g.children.map(r => {
                    if(!r.status){
                        g.status = 0
                    }
                })
                return g
            })

// скачать результат проверки

// var myblob = new Blob([JSON.stringify(meta)], {
//     type: 'text/plain'
// });
//                 let a = document.createElement("a")
//                 let objectURL = URL.createObjectURL(myblob)
//                 a.href = objectURL
//                 a.download = 'report.json'
//                 document.body.appendChild(a)
//                 a.click()
//                 URL.revokeObjectURL(objectURL)
//                 a.remove()

            this.$store.dispatch('common/setFileMeta', {
                id: this.model.id,
                body: JSON.stringify(meta)
            })
            .then(res => {
                return  this.$store.dispatch('common/getFileMeta', {
                    id: this.model.id
                })
            })
            .then(res => {
                this.collisions_compiling = false
                this.compute_ready = true
                if(res.error){
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: res.data.error,
                        message: res.data.error,
                    })
                }
                else{
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проверка правила ' + ruleName + ' выполнена.',
                        message: 'Проверка правила ' + ruleName + ' выполнена.',
                    })
                }
            })
            .catch(e => {
                this.collisions_compiling = false
                this.compute_ready = true
            })
        },
        getRooms(d){
            this.rooms.list = d.rooms.list
            this.rooms.load = true
        },
        getRoomsColors(o){
            this.rooms.colors = o.value
        },
        onRoomVisibilityItem(o){
            this.postMessage({
                action: 'onRoomVisibilityItem',
                value: {
                    ids: o.ids,
                    val: o.value
                }
            })
        },
        onRoomVisibility(v){
            this.postMessage({
                action: 'onRoomVisibility',
                value: v.value
            })
        },
        onRooms(v){
            this.onRoomVisibility({value: v})
            if(v){
                this.worker.postMessage({
                    action: 'getRooms'
                })
            }

            return
            if(v){
                return new Promise(resolve => {
                    if(!this.jsonLoad.property){
                        this.onLoads.property = false

                        let promisesList = []
                        if(this.model.type == 'consolidations'){
                            this.listModel.map(l => {
                                // if(l.tags['mini.json'] == 1){
                                //     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/mini.json'}))
                                // }
                                // else
                                if(l.tags['json'] == 1){
                                    promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/json'}))
                                }
                                else if(l.tags['json.zip'] == 1){
                                    promisesList.push(new Promise(resolve => {
                                        this.$store.dispatch('common/getFile', {
                                            id: this.getFileByVersion(l).url + '/json.zip',
                                            typeBlob: 'blob'
                                        })
                                        .then(res => {
                                            return Promise.resolve(res.file)
                                        })
                                        .then(res => JSZip.loadAsync(res))
                                        .then(zip => {
                                            let filesList = Object.keys(zip.files)
                                            return zip.file(filesList[0]).async("string")
                                        })
                                        .then(text => {
                                            resolve(JSON.parse(text))
                                        })
                                    }))
                                }
                            })
                        }
                        else{
                            // if(this.model.tags['mini.json'] == 1){
                            //     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/mini.json'}))
                            // }
                            // else
                            if(this.model.tags['json'] == 1){
                                promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/json'}))
                            }
                            else if(this.model.tags['json.zip'] == 1){
                                promisesList.push(new Promise(resolve => {
                                    this.$store.dispatch('common/getFile', {
                                        id: this.getFileByVersion(this.model).url + '/json.zip',
                                        typeBlob: 'blob'
                                    })
                                    .then(res => {
                                        return Promise.resolve(res.file)
                                    })
                                    .then(res => JSZip.loadAsync(res))
                                    .then(zip => {
                                        let filesList = Object.keys(zip.files)
                                        return zip.file(filesList[0]).async("string")
                                    })
                                    .then(text => {
                                        resolve(JSON.parse(text))
                                    })
                                }))
                            }
                        }

                        Promise.all(promisesList)
                        .then(res => {
                            res.map(r => {
                                this.propertyJson = [
                                    ...this.propertyJson,
                                    ...this.setProperties(r)
                                ]
                                let filters = r.GrouppedByCategories || []
                                this.filters = this.initFilters(filters)
                                this.rooms.list = this.propertyJson
                                    .filter(f => f.object == 'Room')
                                    .map(m => {
                                        return {
                                            ...m,
                                            active: true
                                        }
                                    })
                            })
                            this.rooms.load = true
                            this.jsonLoad.property = true
                            this.onLoads.property = true
                            resolve(true)
                        })
                    }
                    else{
                        this.rooms.list = this.propertyJson
                            .filter(f => f.object == 'Room')
                            .map(m => {
                                return {
                                    ...m,
                                    active: true
                                }
                            })
                        this.rooms.load = true
                        resolve(true)
                    }
                })
            }
        },
        onMarker(data){
            this.postMessage({
                ...data,
                id: data.id || this.selectedObjID
            })
        },
        onCreateMarker(data){
            if(this.$store.state.comments.markerStack){
                // let mrk = this.$store.state.comments.markerStack
                // this.onMarker({
                //     action: 'onHideMarker',
                //     id: mrk.eid
                // })
                // data.marker.act = -1



                // this.$store.dispatch('comments/marker', data.marker)
            }
            // this.$store.commit('comments/updateMarkerStack', data.marker)
            this.onMarker({
                action: 'onShowMarker',
                id: data.marker.eid
            })
            data.marker.act = 1
            this.$store.dispatch('comments/marker', data.marker)



            // if(this.$store.state.comments.markerStack.length){
            //     let mrk = this.$store.state.comments.markerStack[0]
            //     this.onMarker({
            //         action: 'onHideMarker',
            //         id: mrk.id
            //     })
            // }
            // // data.act = 1
            // // this.$store.dispatch('comments/onMarker', data)
            // this.$store.dispatch('comments/updateMarkerStack', data.marker)
            //
            // this.onMarker({
            //     action: 'onShowMarker',
            //     id: data.marker.id
            // })
            // // this.onMarker({
            // //     action: 'onGotoMarker',
            // //     id: data.id
            // // })
        },
        loadFilters(){
            return new Promise(resolve => {
                if(!this.jsonLoad.property){
                    this.onLoads.property = false

                    let promisesList = []
                    if(this.model.type == 'consolidations'){
                        this.listModel.map(l => {
                            // if(l.tags['mini.json'] == 1){
                            //     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/mini.json'}))
                            // }
                            // else
                            if(l.tags['json'] == 1){
                                promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/json'}))
                            }
                            else if(l.tags['json.zip'] == 1){
                                promisesList.push(new Promise(resolve => {
                                    this.$store.dispatch('common/getFile', {
                                        id: this.getFileByVersion(l).url + '/json.zip',
                                        typeBlob: 'blob'
                                    })
                                    .then(res => {
                                        return Promise.resolve(res.file)
                                    })
                                    .then(res => JSZip.loadAsync(res))
                                    .then(zip => {
                                        let filesList = Object.keys(zip.files)
                                        return zip.file(filesList[0]).async("string")
                                    })
                                    .then(text => {
                                        resolve(JSON.parse(text))
                                    })
                                }))
                            }
                        })
                    }
                    else{
                        // if(this.model.tags['mini.json'] == 1){
                        //     promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/mini.json'}))
                        // }
                        // else
                        if(this.model.tags['json'] == 1){
                            promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/json'}))
                        }
                        else if(this.model.tags['json.zip'] == 1){
                            promisesList.push(new Promise(resolve => {
                                this.$store.dispatch('common/getFile', {
                                    id: this.getFileByVersion(this.model).url + '/json.zip',
                                    typeBlob: 'blob'
                                })
                                .then(res => {
                                    return Promise.resolve(res.file)
                                })
                                .then(res => JSZip.loadAsync(res))
                                .then(zip => {
                                    let filesList = Object.keys(zip.files)
                                    return zip.file(filesList[0]).async("string")
                                })
                                .then(text => {
                                    resolve(JSON.parse(text))
                                })
                            }))
                        }
                    }

                    Promise.all(promisesList)
                    .then(res => {
                        res.map(r => {
                            this.propertyJson = [
                                ...this.propertyJson,
                                ...this.setProperties(r)
                            ]
                            let filters = r.GrouppedByCategories || []
                            this.filters = this.initFilters(filters)
                        })

                        this.jsonLoad.property = true
                        this.onLoads.property = true
                        resolve(true)
                    })
                }
                else{
                    resolve(true)
                }
            })
        },
        onWorkList(v){
            if(v){
                this.worker.postMessage({
                    action: 'getParameters',
                    names: ['properties']
                })
            }
            else{
                this.properties = []
            }
        },
        setFilters(v){
            if(!this.filters.length){
                this.worker.postMessage({
                    action: 'getParameters',
                    names: ['filters'],
                    callback: {
                        name: 'initFilters',
                        arg: v
                    }
                })
            }
            else{
                this.initFilters(v)
            }
        },
        onSearch(v){
            if (v){
                console.log(' On Search is Run ');
            }
        },
        initFilters(v){
            this.onPreloader()
            if(v){
                this.filters.map(f => {
                    f.items.map(i => {
                        if(i.active){
                            this.onFilter(i)
                            if(i.items.length){
                                i.items.map(t => {
                                    this.onFilter(i)
                                })
                            }
                        }
                    })
                })
                this.onFilter({filter: 'enable'})
            }
            else{
                this.onFilter({filter: 'clear'})
                this.onFilter({filter: 'disable'})
            }
        },
        onFilter(o){
            this.onPreloader()
            .then(r => {
                this.postMessage({
                    action: 'onFilter',
                    value: o
                })
            })
        },
        setOption(o){
            const keys = Object.keys(this.options[o.name].children || [])
            let childActive = false
            keys.map(key => {
                if(this.options[o.name].children[key].active){
                    childActive = true
                }
            })
            this.options[o.name].expanded = !this.options[o.name].expanded
            if(!childActive){
                this.options[o.name].active = !o.active
                if(this.options[o.name].action){
                    this[this.options[o.name].action](this.options[o.name].active)
                }
            }
        },
        setSubOption(o){
            const keys = Object.keys(this.options[o.name].children)
            keys.map(key => {
                this.options[o.name].children[key].active = false
            })
            this.options[o.name].children[o.sub_name].active = !o.sub_active
            if(this.options[o.name].children[o.sub_name].action){
                this[this.options[o.name].children[o.sub_name].action](this.options[o.name].children[o.sub_name])
            }
            this.setOption(o)
        },
        updateOption(o){
            this.options[o.item.name][o.prop] = o.value
        },
        hideOptions(list){
            list.map(l => {
                if(this.options[l].active){
                    this.setOption({
                        name: l,
                        active: true
                    })
                }
                this.options[l].disabled = true
            })
        },
        showOptions(list = null){
            if(!list){
                Object.keys(this.options)
                    .map(key => {
                        this.options[key].disabled = false
                    })
            }
            else{
                list.map(l => {
                    this.options[l].disabled = false
                })
            }
        },
        onCollisionSettings(v){
            this.collision_settings = v
            if(v){
                this.$store.dispatch('workflow/getCollisionTemplates')
                this.$store.dispatch('common/getFileMeta', {
                    id: this.model.id
                })
                .then(res => {
                    let meta = JSON.parse(res)
                    if(meta){
                        if(meta.collisions){
                            let version = meta.collisions.version || null
                            if(this.model.version != null && this.model.version != version){
                                // this.collisions_compiling = true
                            }
                            // this.params = {...meta.collisions, temp: {}}
                        }
                    }
                })
            }
        },
        onCollisionReports(v){
            // if(this.onLoads.collisions === true){
            //     this.onLoads.collisions = false
            //     this.preloaderTitle = 'Рассчет коллизий.'
            // }
            // this.postMessage({
            //     action: 'onLoadCollisions'
            // })
            if(v){
                this.$store.dispatch('workflow/getCollisionTemplates')
                this.$store.dispatch('common/getFileMeta', {
                    id: this.model.id
                })
                .then(res => {
                    let meta = JSON.parse(res)
                    if(meta){
                        if(meta.collisions){
                            this.collisions_version = meta.collisions.version || null
                            // this.params = {...meta.collisions, temp: {}}
                        }
                    }
                })
            }
        },
        onLoadCollisions(v){
            this.onLoads.collisions = 1
            this.preloaderTitle = ''
        },
        loadCollisions(){
            if(this.onLoads.collisions === true){
                this.onLoads.collisions = false
                this.preloaderTitle = 'Рассчет коллизий.'
            }
            this.postMessage({
                action: 'onLoadCollisions'
            })
        },
        setCollisions(v){
            if(this.onLoads.collisions === true){
                this.onLoads.collisions = false
                this.preloaderTitle = 'Рассчет коллизий.'
            }
            this.postMessage({
                action: 'setCollisions',
                value: v
            })
            // if(this.model.type == 'consolidations'){
            //     if(this.listModel.some(s => s.tags['collisions.json'] == 1)){
            //         this.postMessage({
            //             action: 'setCollisions',
            //             value: v
            //         })
            //     }
            // }
            // else{
            //     if(this.model.tags['collisions.json'] == 1){
            //         this.postMessage({
            //             action: 'setCollisions',
            //             value: v
            //         })
            //     }
            // }
        },
        onResurs(v){
            // this.$store.dispatch('common/getFile', {
            //     id: this.getFileByVersion(this.model).url + '/json.zip',
            //     typeBlob: 'blob'
            // })
            // .then(res => {
            //
            //         let a = document.createElement("a")
            //         let objectURL = URL.createObjectURL(res.file)
            //         a.href = objectURL
            //         a.download = name
            //         document.body.appendChild(a)
            //         a.click()
            //         URL.revokeObjectURL(objectURL)
            //         a.remove()
            // })

            // this.onDispatcher(v)


            // this.postMessage({
            //     action: 'onLoadCollisions'
            // })
            // if(v){
            //     this.$store.dispatch('workflow/getCollisionTemplates')
            //     this.$store.dispatch('common/getFileMeta', {
            //         id: this.model.id
            //     })
            //     .then(res => {
            //         let meta = JSON.parse(res)
            //         if(meta){
            //             if(meta.collisions){
            //                 this.collisions_version = meta.collisions.version || null
            //                 // this.params = {...meta.collisions, temp: {}}
            //             }
            //         }
            //     })
            // }
        },
        getHiddenObjects(v){
            if(v){
                this.postMessage({
                    action: 'onGetHiddenObjects',
                    value: v
                })
            }
        },
        onGetHiddenObjects(v){
            console.log('onGetHiddenObjects', v)
            this.worker.postMessage({
                action: 'onGetHiddenObjects',
                value: v
            })
            // let items = this.propertyJson.filter(c => (c.Guid != undefined && v.some(s => c.Guid == s))
            //     || (c.Id != undefined && v.some(s => c.Id == s)))
            //
            // this.hiddenList = items.map(i => ({name: i.Name, id: i.Id || i.Guid}))
        },
        onHideObject(v){
            this.postMessage({
                action: 'onHideObject',
                value: v
            })
        },
        onShowObject(v){
            this.postMessage({
                action: 'onShowObject',
                value: v
            })
            if(this.selectedObjID){
                this.postMessage({
                    action: 'selectObjectById',
                    value: this.selectedObjID
                })
            }
        },
        getVersionFile(){
            if(this.model.version == null){
                return 1
            }
            let vers = this.model.files.find(fl => fl.id == this.model.version)
            if(!vers){
                return 1
            }
            else{
                return vers.version
            }
        },
        hiddenOptionsBtnInit(){
            let optionKeyList = Object.keys(this.options)
            optionKeyList.map(k => {
                this.options[k].hidden = !checklicense(k)
                    ? true
                    : this.options[k].hidden
            })

            this.options.delta.hidden = !(this.model.files.length > 1)
                || this.getVersionFile() == 1
        },
        onDeltaWorker(data){
            // this.worker.postMessage({
            //     action: 'onDelta',
            //     data: false //data.store.objectsMap
            // })
        },
        onDelta(v){
            if(v){
                this.hideOptions(['hidden', 'property', 'filters', 'planes'])

                this.worker.postMessage({
                    action: 'onDelta'
                })
            }
            else{
                this.showOptions()
            }
            let url = ''
            this.model.files.map(fl => {
                if(fl.version == this.getVersionFile() - 1){
                    url = fl.url
                }
            })
            this.postMessage({
                action: 'onDelta',
                token: this.$store.state.auth.access_token,
                id: url,
                value: v,
                prop: {
                    type: 'rvt'
                }
            })
        },
        onDeltaCallback(data){
            this.deltaList = data.deltalist
        },
        setView(v){
            let name = ''
            switch(v.name){
                case 'left':    name = 'setLeft'
                                break
                case 'right':   name = 'setRight'
                                break
                case 'top':     name = 'setTop'
                                break
                case 'front':   name = 'setFront'
                                break
                case 'back':    name = 'setBack'
                                break
                default: ;
            }
            this.postMessage({
                action: 'setView',
                name: name
            })
            v.active = false
        },
        displayAxes(v){
            this.postMessage({
                action: 'displayAxes',
                value: v
            })
        },
        displayGrid(v){
            this.postMessage({
                action: 'displayGrid',
                value: v
            })
        },
        getJsonFile(){
            let tag = this.source == 'Revit' ? '/json.zip' : '/json'
            this.$store.dispatch('common/getFile', {
                id: this.getFileByVersion(this.model).url + tag,
                typeBlob: 'blob'
            })
            .then(res => {
                let a = document.createElement("a")
                let objectURL = URL.createObjectURL(res.file)
                a.href = objectURL
                a.download = name
                document.body.appendChild(a)
                a.click()
                URL.revokeObjectURL(objectURL)
                a.remove()
            })
        },
        buildDispatcher(d){
            this.levelsMap = d.value
        },
        onDispatcher(v){
            this.worker.postMessage({
                action: 'buildDispatcher',
                fname: this.model.name
            })
            return

            if(!this.levelsMap){
                let promisesList = []
                if(this.model.tags['json'] == 1){
                    promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/json'}))
                }
                else if(this.model.tags['json.zip'] == 1){
                    promisesList.push(new Promise(resolve => {
                        this.$store.dispatch('common/getFile', {
                            id: this.getFileByVersion(this.model).url + '/json.zip',
                            typeBlob: 'blob'
                        })
                        .then(res => {
                            return Promise.resolve(res.file)
                        })
                        .then(res => JSZip.loadAsync(res))
                        .then(zip => {
                            let filesList = Object.keys(zip.files)
                            return zip.file(filesList[0]).async("string")
                        })
                        .then(text => {
                            resolve(JSON.parse(text))
                        })
                    }))
                }
                const getTree = (map, items, level) => {
                    items
                        .filter(f => f.level == level)
                        .map((m, i, a) => {
                            if(level != 'main'){
                                map[level].size = a.length
                            }
                            getTree(map, items.filter(f => f.level != level), m.id)
                        })
                }

                let map = {
                    'all':{
                        id: 'all',
                        name: 'Генплан',
                        level: 'main',
                        hidden: false,
                        type: 'level',
                        size: 0,
                        selected: 0
                    }
                }

                Promise.all(promisesList)
                .then(res => {
                    res.map(r => {
                        this.propertyJson = [
                            ...this.propertyJson,
                            ...this.setProperties(r)
                        ]
                        let levels = r.Levels || []
                        levels.map(l => {
                            map[l.Level.Id] = {
                                name: l.Level.Name,
                                id: l.Level.Id,
                                level: 'all',
                                hidden: false,
                                type: 'level',
                                size: 0,
                                selected: 0
                            }
                            let elemList = this.propertyJson
                                .filter(f => f.Level == l.Level.Id)
                                // .map(m => {
                                //     map[m.Id] = {
                                //         name: m.Name,
                                //         id: m.Id,
                                //         level: l.Level.Id,
                                //         hidden: false,
                                //         type: 'item'
                                //     }
                                //     return m
                                // })

                            let groupList = elemList.reduce((r, i) => {
                                r[i.Name] = r[i.Name] || []
                                r[i.Name].push(i)
                                return r
                            }, {})

                            Object.entries(groupList).map(([key, value], ind) => {
                                let groupId = 'g' + l.Level.Id + '_' + ind
                                map[groupId] = {
                                    name: key,
                                    id: groupId,
                                    level: l.Level.Id,
                                    type: 'level',
                                    size: 0,
                                    selected: 0
                                }
                                value.map(v => {
                                    map[v.Id] = {
                                        name: v.Name,
                                        id: v.Id,
                                        level: groupId,
                                        hidden: false,
                                        type: 'item'
                                    }
                                })
                            })
                        })
                        getTree(map, Object.values(map), 'main')
                        this.levelsMap = map
                    })
                })
            }
        },
        loadPropertyJson(){
            return new Promise(resolve => {
                if(!this.jsonLoad.property){
                    this.onLoads.property = false
                    let promisesList = []
                    if(this.model.type == 'consolidations'){
                        this.listModel.map(l => {
                            if(l.tags['json'] == 1){
                                promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/json'}))
                            }
                        })
                    }
                    else{
                        if(this.model.tags['json'] == 1){
                            promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/json'}))
                        }
                        else if(this.model.tags['json.zip'] == 1){
                            promisesList.push(new Promise(resolve => {
                                this.$store.dispatch('common/getFile', {
                                    id: this.getFileByVersion(this.model).url + '/json.zip',
                                    typeBlob: 'blob'
                                })
                                .then(res => {
                                    return Promise.resolve(res.file)
                                })
                                .then(res => JSZip.loadAsync(res))
                                .then(zip => {
                                    let filesList = Object.keys(zip.files)
                                    return zip.file(filesList[0]).async("string")
                                })
                                .then(text => {
                                    resolve(JSON.parse(text))
                                })
                            }))
                        }
                    }
                        // this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/mini.json'})
                        // .then(res => {
                        //     console.log('mini.json',res)
                        // })

                    Promise.all(promisesList)
                    .then(res => {
                        res.map(r => {
                            this.propertyJson = [
                                ...this.propertyJson,
                                ...this.setProperties(r)
                            ]
                            let filters = r.GrouppedByCategories || []
                            this.filters = this.initFilters(filters)
                            this.source = r.Source || null
                        })

                        this.jsonLoad.property = true
                        this.onLoads.property = true
                        resolve(true)
                    })
                }
                else{
                    resolve(true)
                }
            })
        },
        setSelectionMode(v){
            // if(!this.jsonLoad.classifier){
            //     this.onLoads.classifier = false
            //
            //     let promisesList = []
            //     let no_classifier = false
            //     if(this.model.type == 'consolidations'){
            //         this.listModel.map(l => {
            //             if(l.tags.hasOwnProperty('classifier.json')
            //                 && l.tags['classifier.json'] == 1){
            //                 promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(l).url + '/classifier.json'}))
            //             }
            //             else{
            //                 no_classifier = true
            //             }
            //         })
            //     }
            //     else{
            //         if(this.model.tags.hasOwnProperty('classifier.json')
            //             && this.model.tags['classifier.json'] == 1){
            //             promisesList.push(this.$store.dispatch('common/getFileInfo', {id: this.getFileByVersion(this.model).url + '/classifier.json'}))
            //         }
            //     }
            //
            //     Promise.all(promisesList)
            //     .then(res => {
            //         if(no_classifier){
            //             this.classifierJson = 'none'
            //         }
            //         else{
            //             res.map(r => {
            //                 this.classifierJson = [
            //                     ...this.classifierJson,
            //                     ...this.setProperties(r)
            //                 ]
            //             })
            //         }
            //         this.jsonLoad.classifier = true
            //         this.onLoads.classifier = true
            //     })
            // }
            //
            // this.loadPropertyJson()

            if(!v){
                // this.selectedObjID = null
                // this.selectedObjIDList = null
            }
            this.onSetSelectionMode(v)
        },
        onSetSelectionMode(v){
            if((!v && !(this.selectionModeCount >> 1 & 1))
                || (v && !(this.selectionModeCount & 1))) {

                this.postMessage({
                    action: 'setSelectionMode',
                    value: v
                })
                if(!v){
                    this.onClearSelection()
                }
            }
            if(v){
                this.selectionModeCount = this.selectionModeCount << 1 | 1
            }
            else{
                this.selectionModeCount = this.selectionModeCount >> 1
            }
        },
        onClearSelection(){
            // this.selectedObjID = null
            // this.selectedObjIDList = null
            this.postMessage({
                action: 'clearSelection',
                value: true
            })
        },
        onMouseDown(event){
            event.preventDefault()
        },
        onSelected(v){
            if(v.id.length > 1){
                this.selectedObjIDList = v.id
            }
            else{
                this.selectedObjID = v.id[0]
            }
        },
        setPropertiesModel(data){
            console.log('setPropertiesModel data', data)
            this.worker.postMessage({
                action: 'setPropertiesModel',
                store: data.store
            })
            this.onLoads.worker = true
        },
        initModel(){
            if(this.model.type == 'consolidations'){
                let list = this.$store.state.workflow.listDocs
                this.listModel = list
                    .filter(l => this.model.consolidations.some(s => s == l.id))
                    .map(item => {
                        return {
                            ...item,
                            fileId: this.getFileByVersion(item).url
                        }
                    })
            }
            else{
                this.model.fileId = this.getFileByVersion(this.model).url
                this.listModel = [this.model]
            }
            // this.initWorkerStore()
            // this.preloaderTitle = 'Загрузка файлов модели '
            this.postMessage({
                token: this.$store.state.auth.access_token,
                listId: this.listModel.map(mdl => this.getFileByVersion(mdl).url),
                action: 'loadModel'
            })

            // if(this.model.type == 'consolidations'){
            //     if(!this.listModel.length){
            //         let list = this.$store.state.workflow.listDocs
            //         this.listModel = list.filter(l => this.model.consolidations.some(s => s == l.id))
            //     }
            //     this.preloaderTitle = 'Загрузка файлов модели ' + this.listModel[this.indexModel].name
            //     this.preloaderInit.step++
            //     this.postMessage({
            //         token: this.$store.state.auth.access_token,
            //         id: this.getFileByVersion(this.listModel[this.indexModel]).url,
            //         action: 'loadModel',
            //         prop: {
            //             type: this.model.format,
            //             json: (() => {
            //                     if(this.model.tags['json.zip']){
            //                         return 'json.zip'
            //                     }
            //                     else{
            //                         return 'json'
            //                     }
            //                 })()
            //         }
            //     })
            // }
            // else{
            //     this.preloaderTitle = 'Загрузка файлов модели ' + this.model.name
            //     this.preloaderInit.step++
            //     this.postMessage({
            //         token: this.$store.state.auth.access_token,
            //         id: this.getFileByVersion(this.model).url,
            //         action: 'loadModel',
            //         prop: {
            //             type: this.model.type,
            //             json: (() => {
            //                     if(this.model.tags['json.zip']){
            //                         return 'json.zip'
            //                     }
            //                     else{
            //                         return 'json'
            //                     }
            //                 })()
            //         }
            //     })
            // }
        },
        onLoadModel(v){
            this.onLoads.model = 100
            this.onLoads.applyFilters = 100
            this.onLoads.property = true
            // this.preloaderInit.step++
            // this.onReadyModel(v)
        },
        partialEvent(data){
            console.log('partialEvent', data)
            this.partialData = data
        },
        preloaderStep(data){
            // this.preloaderInit.step++
            // this.preloaderTitle = data.title
        },
        onLoadFilters(v){
            this.onLoads.filters = v
        },
        onLoadApplyFilters(v){
            this.onLoads.applyFilters = 100
        },
        onReadyModel(data){
            if(this.model.type == 'consolidations'){
                if(this.indexModel + 1 == this.listModel.length){
                    if(!data.bindata){
                        this.setWorkerParams()
                    }
                    this.onLoads.model = 100
                    this.onLoads.applyFilters = 100
                    this.onLoads.property = true
                }
                else{
                    this.onLoads.applyFilters = 0
                    this.indexModel += 1
                    this.initModel()
                }
            }
            else{
                if(!data.bindata){
                    this.setWorkerParams()
                }
                this.onLoads.model = 100
                this.onLoads.applyFilters = 100
                this.onLoads.property = true
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
                let file = f.files.find(i => i.id == f.version)
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
            if(this.$refs['viewer']){
                this.$refs['viewer'].contentWindow.postMessage(v, '*')
            }
        },
        receiveMessage(e){
            if(Object.prototype.hasOwnProperty.call(e.data, 'action')){
                switch(e.data.action){
                    case 'ready':
                        this.initWorkerStore()

                        this.onLoads.model = 100
                        this.onLoads.applyFilters = 100
                        this.onLoads.property = true
                        this.initModel()

                        document.addEventListener('keyup', this.onKeyup)
                        document.addEventListener('keydown', this.onKeydown)
                        break
                    case 'onStartLoadFilters': this.preloaderTitle = 'Загрузка свойств модели.'
                        // this.preloaderInit.step++
                        break
                    case 'onSelected': this.onSelected(e.data)
                        break
                    case 'onLoadApplyFilters': this.onLoadApplyFilters(e.data)
                        break
                    case 'onLoadModel': this.onLoadModel(e.data)
                        break
                    case 'onReadyModel': this.onReadyModel(e.data)
                        break
                    case 'getRoomsColors': this.getRoomsColors(e.data)
                        break
                    case 'onGetHiddenObjects': this.onGetHiddenObjects(e.data.value)
                        break
                    case 'saveCollisionReports': this.saveCollisionReports(e.data)
                        break
                    case 'onLoadCollisions': this.onLoadCollisions(e.data)
                        break
                    case 'onRender': this.onRender(e.data)
                        break
                    case 'getScreenShot': this.getScreenShot(e.data)
                        break
                    case 'onCreateMarker': this.onCreateMarker(e.data)
                        break
                    case 'propertiesModel': this.setPropertiesModel(e.data)
                        break
                    case 'onDeltaWorker': this.onDeltaWorker(e.data)
                        break
                    case 'preloaderStep': this.preloaderStep(e.data)
                        break
                    case 'partialEvent': this.partialEvent(e.data)
                        break
                    default: ;
                }
            }
        },
        setCanvasSize(){
            this.canvas = this.$refs['canvas']
            let el = this.$el
            let parent = this.$parent.$el
            const devicePixelRatio = window.devicePixelRatio || 1
            const widthC = parent.offsetWidth// * devicePixelRatio
            const heightC = parent.offsetHeight// * devicePixelRatio
            this.CanvasWidth = widthC * devicePixelRatio
            this.CanvasHeight = heightC * devicePixelRatio
            this.devicePixelRatio = devicePixelRatio

            // this.canvas.style.width  = widthC + "px"
            // this.canvas.style.height = heightC + "px"
            this.canvas.width  = widthC
            this.canvas.height = heightC

            return {
                widthC,
                heightC
            }
        },
        initWorkerStore(){
            // console.log('~~~~~~~~~~~initWorkerStore', this.listModel)
            this.worker.postMessage({
                action: 'init',
                token: this.$store.state.auth.token,
                api: http.cloud + api.getfile,
                model: this.model,
                listModel: this.listModel
            })
        },
        setWorkerParams(){
            this.worker.postMessage({
                action: 'initParams',
                listModel: this.listModel
            })
        },
        getParamSearch(d){
            this.ParamSearch = d.listSearch;
            this.ParamSearchId = d.listSearchId;
        },
        getParameters(d){
            new Promise(resolve => {
                resolve(d.props.map(p => {
                    this[p.name] = p.value
                }))
            })
            .then(r => {
                if(d.callback){
                    this[d.callback.name](d.callback.arg)
                }
            })
        },
        initWorkerParams(d){
            this.onLoads.worker = d.value
            if(!d.value){
                console.warn('initWorkerParams error:', d.msg)
            }
        },
        wubviewerMessage(e){
            if(Object.prototype.hasOwnProperty.call(e.data, 'action')){
                switch(e.data.action){
                    case 'ready': this.onLoads.worker = true
                        break
                    case 'initWorkerParams': this.initWorkerParams(e.data)
                        break
                    case 'getObjectProperties': this.getObjectProperties(e.data)
                        break
                    case 'getParameters': this.getParameters(e.data)
                        break
                    case 'getParamSearch': this.getParamSearch(e.data)
                        break
                    case 'getPropertyJson':  this.getPropertyJson(e.data)
                        break
                    case 'buildDispatcher': this.buildDispatcher(e.data)
                        break
                    case 'saveCollisionReports': this.saveCollisionReports(e.data)
                        break
                    case 'getRooms': this.getRooms(e.data)
                        break
                    case 'onComputeSpaceUbviewer': this.onComputeSpaceUbviewer(e.data)
                        break
                    case 'onComputeDistanceUbviewer': this.onComputeDistanceUbviewer(e.data)
                        break
                    case 'onComputeNumberObjRooms': this.onComputeNumberObjRooms(e.data)
                        break
                    case 'onDeltaCallback': this.onDeltaCallback(e.data)
                        break
                    default: ;
                }
            }
        }
    },
    beforeCreate(){
        this.$store.commit('workflow/setViewerPage', true)
    },
    created(){
        this.preloaderTitle = 'Загрузка просмотрщика.'
        this.hiddenOptionsBtnInit()
    },
    mounted(){
        this.worker = new Worker(window.location.origin + '/js/wubviewer.js')
        this.worker.addEventListener("message", this.wubviewerMessage, false)
        window.addEventListener("message", this.receiveMessage, false)
    },
    beforeDestroy(){
        this.$store.commit('workflow/setViewerPage', false)
        this.ready = false
        window.removeEventListener("message", this.receiveMessage, false)
        this.worker.terminate()
        this.worker = null

        this.$el.removeEventListener('mousedown', this.onMouseDown, false)
        document.removeEventListener('keyup', this.onKeyup)
        document.removeEventListener('keydown', this.onKeydown)
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
