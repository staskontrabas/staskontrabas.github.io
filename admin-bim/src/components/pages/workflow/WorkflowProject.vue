<template>
<v-container fluid fill-height text-xs-center class="m-container pt-0">
<v-flex xs12>
    <v-container fluid pt-0 class="" ref="wrap">
      <div class="project-wrapper">
            <span class="project-title"> Файлы </span>
            <div class="beta-plack">
                <span> БЕТА </span>
            </div>
      </div>

        <!-- экран загрузки -->
        <div v-show="loading"  class="m-back m-back--trans">
            <div class="vm-progress">
                <inline-svg class="inline-svg" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
            </div>
        </div>

        <!-- кнопки управления на панели вкладок  -->
        <div class="tabs-buttons">
            <div v-show="activeName == 'first'" class="tabs-buttons__wrapper">
                <el-button type="blue-text" @click="toggleRemoved">
                    <inline-svg :src="show_removed ? require(`@/assets/icons/docs.svg`) : require(`@/assets/icons/trash-icon.svg`)"/>
                    {{ show_removed ? 'Файлы проекта' : 'Удаленные элементы' }}
                </el-button>
                <el-button type="blue-text"><inline-svg :src="require(`@/assets/icons/filter-icon.svg`)"></inline-svg> Параметры </el-button>
            </div>
        </div>


        <el-tabs v-model="activeName" class="tabs">
            <el-tab-pane label="Папки" name="first">

            <div v-if="!show_removed" class="table-wrapper" @mousemove="resizeFileMenu"
                @mouseup="endResize">
                <div class="file-menu-wrapper" ref="fileMenuWrapper" :style="{'width': `${resizeFileMenuControl.currentWidth}px`}">

                <SidebarFolders
                    class="file-menu"
                    @access_folder_action="showAccessSettings"
                    @upload_folder_action="upload"
                    :current_permissions="current_permissions"
                    />

                <div class="file-menu-size-control"
                        @mousedown="startResize"
                >
                    <div class="file-menu-size-control__icon-wrapper">
                    <inline-svg :src="require(`@/assets/icons/horisontal-resize-icon.svg`)"></inline-svg>
                    </div>
                </div>
                </div>

                <div class="file-table-wrapper" :style="{'width': `calc(100% - ${resizeFileMenuControl.currentWidth}px)`, 'padding-left': '10px',}">
                <div class="toolbar">

                    <div style="display: flex; align-items: center;">
                    <el-button
                        :disabled="!(checkFolder && checkPermission('create'))"
                        type="main"
                        @click.stop="upload">
                        <div class="el-btn-wrap">
                            <inline-svg class="svg-24" :src="upload_icon" />
                            Выгрузить файлы
                        </div>
                    </el-button>
                    <el-button
                        text
                        type="default"
                        :disabled="!(checkIfCanCreateFolders && checkPermission('create'))"
                        @click.stop="newFolder = true">
                        <div class="el-btn-wrap">
                            <div class="el-btn-svg">
                                <inline-svg width="14px" height="14px" fill="currentColor" :src="require(`@/assets/icons/plus.svg`)" />
                            </div>
                            <span> Создать папку </span>
                        </div>
                    </el-button>
                    </div>

                    <v-spacer></v-spacer>

                    <div class="input-wrapper">
                    <v-text-field
                        v-model="search"
                        prepend-icon="search"
                        placeholder="Поиск..."
                        single-line
                        hide-details
                        class="m-table-toolbar--search ml-2"
                    ></v-text-field>
                    </div>

                </div>

                <ub-table
                    :data="filteredDocs"
                    :headers="[
                        {name: 'name', title: 'имя', width: '150', icon: { type: 'file_type', type_data_path: 'type', is_solo: false }, click: 'returnitem', path: 'name', },
                        {name: 'version', title: 'версия', width: '100', icon: null, click: null, path: 'type', },
                        {name: 'size', title: 'размер файла', width: '100', icon: null, click: null, path: '' },
                        {name: 'user', title: 'владелец', width: '200', icon: null, click: null, path: 'user',},
                        {name: 'date', title: 'создано', width: '200', icon: null, click: null, path: 'date', },
                        {name: 'updated', title: 'изменено', width: '200', icon: null, click: null, path: 'updated', },
                        {name: 'menu', title: '', width: '48', icon: null, click: null, path: '', },
                    ]"
                    fixedside="left"
                    fixedcolumn="name"
                    :savedcolumnwidth="loadColumnWidth()"
                    @save_columns_width="saveColumnsWidth"
                    multiselectable>

                    <!-- Имя файла -->
                    <template v-slot:column1="{ item }">
                        <div class="ub-table-name-column">

                            <div class="svg-24">
                                <inline-svg class="svg-24" :src="getSvgSrc(item.type)"/>
                            </div>

                            <el-tooltip
                                    effect="dark"
                                    :content="item.name"
                                    :disabled="!needs_tooltip" placement="right">
                                <span
                                    v-if="item.type == 'folder'"
                                    class="m-text--hover truncate-text"
                                    :class="{'m-item--sub': item.sub}"
                                    @click="openFolder(item)"
                                    @mouseover="checkIfNeedsTooltip">
                                        {{item.name}}
                                </span>
                                <span
                                    v-else-if="item.type != 'folder'
                                        && !item.inwork"
                                    class="truncate-text"
                                    :class="[{'m-text--hover': item.status_file !== 3},{'m-item--sub': item.sub}]"
                                    @click="item.status_file !== 3 ? getDct(item) : ';'"
                                    @mouseover="checkIfNeedsTooltip">
                                        {{ item.name_short }}
                                </span>
                                <span
                                    v-else-if="item.type != 'folder' && item.inwork"
                                    class="truncate-text"
                                    :class="{'m-item--sub': item.sub}"
                                    @mouseover="checkIfNeedsTooltip">
                                        {{ item.name_short }}
                                </span>
                                <span
                                    v-else
                                    class="truncate-text"
                                    :class="{'m-item--sub': item.sub}"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{item.name_short || item.name}}
                                </span>
                            </el-tooltip>


                            <div class="gear-loader-wrap" v-if="item.inwork === true" >
                            <el-image
                                :class="{'m-item--sub': item.sub}"
                                :src="inwork"
                                fit="fill">
                            </el-image>
                            </div>
                            <el-tooltip
                                effect="dark"
                                placement="top">
                                    <div slot="content" style="text-align: center;">
                                        При обработке файла произошла ошибка. Проверьте файл и загрузите его еще раз.
                                    </div>
                                    <v-icon
                                        v-if="item.status_file === 3"
                                        size="20"
                                        class="mr-1 m-info--file"
                                        color="#ff0000">
                                        mdi-alert-outline
                                    </v-icon>
                            </el-tooltip>
                        </div>
                    </template>

                    <!-- Версия -->
                    <template v-slot:column2="{ item }">
                        <div class="ub-version-plaque" v-if="item.version" @click="versionJournal(item)">
                        <span>
                            V{{ item.version }}
                            </span>
                        </div>
                        <div class="ub-version-dashes" v-else>
                            <span>
                                --
                            </span>
                        </div>
                    </template>

                    <!-- Вес  -->
                    <template v-slot:column3="{ item }">
                        <el-tooltip
                            effect="dark"
                            :disabled="!needs_tooltip"
                            placement="right">
                                <template #content>
                                    {{ getSizeOfLastFile(item.files) }}
                                </template>
                                <span class="truncate-text"
                                    v-if="item.files"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{ getSizeOfLastFile(item.files) }}
                                </span>
                        </el-tooltip>
                        <div class="ub-version-dashes" v-if="!item.files">
                            <span>
                                --
                            </span>
                        </div>
                    </template>

                    <!-- Ответственный -->
                    <template v-slot:column4="{ item }">
                        <el-tooltip
                            effect="dark"
                            :content="item.user"
                            :disabled="!needs_tooltip" placement="right">
                                <span class="truncate-text"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{ item.user }}
                                </span>
                        </el-tooltip>
                    </template>

                    <!-- Дата создания -->
                    <template v-slot:column5="{ item }">
                        <el-tooltip
                            effect="dark"
                            :content="getDate(item.date)"
                            :disabled="!needs_tooltip" placement="right">
                                <span class="truncate-text"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{ getDate(item.date) }}
                                </span>
                        </el-tooltip>
                    </template>

                    <!-- Дата последнего обновления -->
                    <template v-slot:column6="{ item }">
                        <el-tooltip
                            effect="dark"
                            :content="getDate(item.updated)"
                            :disabled="!needs_tooltip" placement="right">
                                <span class="truncate-text"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{ getDate(item.updated) }}
                                </span>
                        </el-tooltip>
                    </template>

                    <!-- Меню файла -->
                    <template v-slot:column7="{ item }">
                        <action-menu
                        v-if="item.inwork !== true && !checkSelected(item)"
                        @download="downloadFile"
                        @convertationIFCXML="convertationIFCXML"
                        @getDct="getDct"
                        @removeItem="removeItem"
                        @openFolder="openFolder"
                        @replaceItems="replaceItems"
                        @copyItems="copyItems"
                        @renameitem="renameitem"
                        @accessRights="accessRights"
                        @versionJournal="versionJournal"
                        @errorIFCXML="errorIFCXML"
                        @onSpecificationXml="onSpecificationXml"
                        @share="showShareFolderLinks"
                        :item="item"
                        :access="item.access"
                        :current_permissions="current_permissions"
                        />
                    </template>
                </ub-table>

                </div>
            </div>

            <!-- панель удаленных файлов -->
            <div v-if="show_removed" class="removed-files">
                <removed-files/>
            </div>

            </el-tab-pane>

        </el-tabs>

        <table-grid
            v-if="workflow_project == 'grid'"
            :list="getDocs"
            :headers="headers"
            :actions="[getDct]"
        >

            <template v-slot:name="{item}">
                <div>
                    {{item.name}}
                </div>
            </template>
        </table-grid>

        <upload-files
            :uploadF.sync="uploadF"
            :project_id="id"
            @get_access="getAccessForFolders"
        />

        <v-card
            class="m-table-custom--action"
            :style="cardActionStyle"
            v-show="selected.length"
            >
            <v-card-actions>
                <v-btn
                    text
                    color="primary"
                    class="m-btn"
                    @click="download">
                    <v-icon size="20" class="mr-1" color="#0070e0">mdi-download</v-icon>Скачать</v-btn>
                <v-btn
                    text
                    color="primary"
                    class="m-btn"
                    @click="removeSelectedFlag = true">
                    <v-icon size="20" class="mr-1" color="#0070e0">mdi-trash-can-outline</v-icon>
                    Удалить
                </v-btn>
                <v-btn
                    text
                    color="primary"
                    class="m-btn"
                    @click="copyItem = true">
                    <v-icon size="20" class="mr-1" color="#0070e0">mdi-content-copy</v-icon>
                    Копировать
                </v-btn>
                <v-btn
                    text
                    color="primary"
                    class="m-btn"
                    @click="replaceItem = true">
                    <v-icon size="20" class="mr-1" color="#0070e0">mdi-file-replace-outline</v-icon>
                    Переместить
                </v-btn>
                <v-btn
                    v-show="checkTypeFiles({
                        type: ['rvt', 'ifc'],
                        count: 'lot'
                        })"
                    text
                    color="primary"
                    class="m-btn"
                    @click="setConsolidations">
                    <v-icon size="20" class="mr-1" color="#0070e0">trd-conect</v-icon>
                    Консолидация
                </v-btn>

            </v-card-actions>
        </v-card>

        <remove-selected
            :removeSelectedFlag.sync="removeSelectedFlag"
            @removeSelected="removeSelected"
            />

        <replace-item
            :replaceItem.sync="replaceItem"
            :selected="getReplaceItems"
            :items="getDocs"
            @clearSelected="clearSelected"
            />
        <copy-item
            :copyItem.sync="copyItem"
            :selected="getReplaceItems"
            :items="getDocs"
            @clearSelected="clearSelected"
            />
        <rename-item
            :renameItem.sync="renameItem"
            :item="workItem"
            />
        <remove-item
            @removeFolder="removeFolder"
            @removeDct="removeDct"
            :remove_item.sync="remove_item"
            :item="workItem"
            />
        <create-folder
            :newFolder.sync="newFolder"
            @createFolder="createFolder"
            />
        <create-xml
            :createXml.sync="createXml"
            @createFolder="createFolder"
            />
        <new-access-rights
            :accessrights.sync="show_accesss_settings"
            :item="access_node"
            />
        <version-journal
            :versionjournal.sync="versionjournal"
            :item="workItem"
            />
        <error-ifcxml
            :error_ifcxml.sync="error_ifcxml"
            />
        <set-sp333-attribute
            :SP333attr.sync="SP333attr"
            :SP333JSON="SP333JSON"
            :item="workItem"
            />
        <collisions
            :collisions.sync="collisions"
            :collisionsJSON.sync="collisionsJSON"
            />
        <specification-xml
            :specification_xml.sync="specification_xml"
            :item="workItem"
            />
        <shared-access
            :shared.sync="shared"
            :item="workItem"
        />
    </v-container>
</v-flex>
</v-container>
</template>

<script>
import { sortObj, checklicense } from '@/utils/services'
import { v4 as uuidv4 } from 'uuid'
import * as JSZip from 'jszip'
import ubTable from "@/components/custom/ubTable.vue"

import TableGrid from './workflow_project/TableGrid'
import UploadFiles from './workflow_project/UploadFiles'
import ActionMenu from "./workflow_project/ActionMenu"
import RemoveSelected from './workflow_project/RemoveSelected'
import ReplaceItem from './workflow_project/ReplaceItem'
import CopyItem from './workflow_project/CopyItem'
import RenameItem from './workflow_project/RenameItem'
import RemoveItem from './workflow_project/RemoveItem'
import CreateFolder from './workflow_project/CreateFolder'
import CreateXml from './workflow_project/CreateXml'
import newAccessRights from './workflow_project/newAccessRights'
import SharedAccess from './workflow_project/SharedAccess'
import VersionJournal from './workflow_project/Version'
import ErrorIfcxml from './workflow_project/ErrorIfcxml'
import SetSp333Attribute from './workflow_project/SetSp333Attribute'
import Collisions from './workflow_project/Collisions'
import SpecificationXml from './workflow_project/SpecificationXml'
import SidebarFolders from './workflow_project/SidebarFolders'
import InlineSvg from "vue-inline-svg"
import RemovedFiles from './RemovedFiles.vue'

export default {
    name: 'WorkflowProject',
    components: {
        TableGrid,
        UploadFiles,
        ActionMenu,
        RemoveSelected,
        ReplaceItem,
        CopyItem,
        RenameItem,
        RemoveItem,
        CreateFolder,
        newAccessRights,
        SharedAccess,
        VersionJournal,
        ErrorIfcxml,
        SetSp333Attribute,
        Collisions,
        SpecificationXml,
        CreateXml,
        InlineSvg,
        SidebarFolders,
        RemovedFiles,
        ubTable,
    },
    props: ['id', 'path'],
    data() {
        return {
            loading: true,
            show_removed: false,

            newFolder: false,
            createXml: false,
            accessrights: false,
            shared: false,          // shared access dialogue
            folderTree: [],         // folder tree for SidebarFolders
            search: '',             // search field variable
            inwork: require('@/assets/images/gear.gif'),

            table_type_list: [{
                name: 'list',
                icon: 'mdi-format-list-bulleted'
            },{
                name: 'grid',
                icon: 'mdi-view-grid'
            }],
            headers: [
                { text: '', value: 'sub', grid: false, class: 'px-0', cellClass: 'px-0', sortable: false },
                {
                    text: '',
                    align: 'left',
                    sortable: false,
                    value: 'src',
                    grid: false
                },
                { text: 'Название', value: 'name', grid: true },
                { text: 'Дата создания', value: 'date', grid: false },
                { text: 'Изменено', value: 'updated', grid: false },
                { text: 'Создал', value: 'creator', grid: false },
                { text: 'Версия', value: 'version', grid: true, align: 'center', sortable: false},
                { text: 'tasks', value: 'tasks', grid: true, align: 'center', sortable: false },
                { text: 'КСИ/СП', value: 'sp333', grid: true, align: 'center', sortable: false },
                { text: '', value: 'action', sortable: false, grid: false },
                ],
            status: {
                '0': 'На рассмотрении',
                '1': 'На исправлении',
                '2': 'Принят',
                '3': 'Отказ'
            },
            noData: 'Нет данных',
            uploadF: false,
            selected: [],
            sublist: [],
            expandedlist: [],
            removeSelectedFlag: false,
            replaceItem: false,
            remove_item: false,
            replace_items: [],
            copyItem: false,
            renameItem: false,
            workItem: null,
            versionjournal: false,
            error_ifcxml: false,
            SP333JSON: {
                list: [],
                clue: []
            },
            SP333attr: false,
            collisions: false,
            collisionsJSON: null,
            fileTypeList: ['ifc', 'rvt', 'zip', 'ifcxml', 'consolidations', 'pdf', 'dwg', 'dxf', 'svg'],
            specification_xml: false,
            activeName: 'first',
            resizeFileMenuControl: {
              isResizing: false,
              currentWidth: 200,
            },

            needs_tooltip: false,
            upload_icon: require(`@/assets/icons/uploadFile.svg`),

            show_accesss_settings: false,
            access_node: null,

            current_permissions: ['view',],
            all_permissions: null,
        }
    },
    watch: {
        '$store.state.workflow.currentFolder'(newval) {
            // console.log('curr perms', this.current_permissions)
            if (this.all_permissions !== null && this.all_permissions !== undefined) {
                this.current_permissions = this.all_permissions[newval]
            }
            else {
                this.getAccessForFolders()
                .then(res => {
                    this.current_permissions = this.all_permissions[newval]
                })
            }
        }
    },
    computed: {
        managers(){
            let users = this.$store.state.administration.company.users || []
            users = users
                .map(u => ({
                    id: u.id + '',
                    avatar: u.avatarSrc,
                    email: u.email,
                    name: u.first_name + ' ' + u.last_name,
            }))
            return users
        },
        getHeaders() {
            let list = []
            this.headers.map(h => {
                switch(h.value){
                    case 'sp333': (checklicense('errorKSI') && list.push(h))
                        break
                    case 'tasks': (checklicense('tasksList') && list.push(h))
                        break
                    default: list.push(h)
                }
            })
            return list
        },
        workflow_project() {
            let state = this.$store.state
            let type = state.workflow.workflow_project
            type = type ? type : 'list'
            return type
        },
        checkFolder() {
            let state = this.$store.state
            let currentF = state.workflow.currentFolder
            let folder = false
            let item = state.workflow.foldersMap.filter(i => i.id == currentF)
            if(item.length && !item[0].group){
                folder = true
            }
            return folder
        },
        checkIfCanCreateFolders() {
            // Это костыль, предотвращающий создание папок в проекте, в котором не создана папка верхнего уровня "Файлы проекта".
            // Создано для избежания проблем с разрешениями при создании папок верхнего уровня.
            const folders = this.$store.state.workflow.foldersMap
            if (!folders) {
                return false
            }
            let verdict = !!folders.filter(obj => obj.name == 'Файлы проекта').length
            return verdict
        },
        getPath() {
            let state = this.$store.state
            let currentF = state.workflow.currentFolder

            let root = state.workflow.activeProject
                ? state.workflow.activeProject.info.name
                : ''
            let path = [{
                id: 0,
                name: root,
                link: false
            }]
            if(currentF){
                path[0].link = true
                path.push(...this.searchPath(currentF).reverse())
            }
            this.selected = []
            return path
        },
        getDocs() {
            let state = this.$store.state
            let project = state.workflow.activeProject
            let users = state.administration.company.users
            state = state.workflow
            let currentF = state.currentFolder
            let folders = state.foldersMap


            let foldersList = folders.filter(f => f.parent == currentF)
                .map(i => {
                    let creator = ''
                    users.map(u => {
                        if(u.id == i.created_by){
                            creator = u.first_name + ' ' + u.last_name
                        }
                    })
                    let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
                    let date = new Date(i.created_at)
                    let updated = new Date(i.updated_at)

                    return {
                        access: i.access,
                        id: i.id,
                        name: i.name,
                        type: 'folder',
                        group: i.group,
                        sublist: !!i.group
                            ? i.folders
                                ? i.folders.map(p => p.folder)
                                : []
                            : [],
                        inwork: false,
                        user: project.info.in_charge_name,
                        date: date.toLocaleDateString("ru-RU", options),
                        updated: updated.toLocaleDateString("ru-RU", options),
                        creator: creator,
                        sp333: {
                            type: '',
                            value: ''
                        }
                    }
                })


            let foldersListTemp = JSON.parse(JSON.stringify(foldersList))
            foldersList.map(f => {
                if(!!f.group){
                    f.sublist.map(s => {
                        let elem = folders.find(e => e.id == s)
                        if(elem){
                            let creator = ''
                            users.map(u => {
                                if(u.id == elem.created_by){
                                    creator = u.first_name + ' ' + u.last_name
                                }
                            })
                            let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
                            let date = new Date(elem.created_at)
                            let updated = new Date(elem.updated_at)

                            let folder = {
                                access: elem.access,
                                id: elem.id,
                                name: elem.name,
                                type: 'folder',
                                group: elem.group,
                                sublist: !!elem.group ? elem.folders.map(p => p.folder) : [],
                                inwork: false,
                                user: project.info.in_charge_name,
                                date: date.toLocaleDateString("ru-RU", options),
                                updated: updated.toLocaleDateString("ru-RU", options),
                                creator: creator,
                                sp333: {
                                    type: '',
                                    value: ''
                                }
                            }
                            foldersListTemp.push(folder)
                        }
                    })
                }
                return f
            })
            .map(f => {
                if(!!f.group){
                    let subs = f.sublist.reverse()
                    foldersListTemp = foldersListTemp.map(i => i.id == f.id
                            ? {...i, expanded: this.expandedlist.some(s => s == f.id)}
                            : i
                        )
                    subs.map(c => {
                        let index = foldersListTemp.map(t => t.id).indexOf(c)
                        let elem = foldersListTemp.splice(index, 1)[0]
                        elem.sub = true
                        if(this.sublist.some(s => s == c)){
                            index = foldersListTemp.map(t => t.id).indexOf(f.id)
                            foldersListTemp.splice((index + 1), 0, elem)
                        }
                    })
                }
            })

            let docs = state.listDocs.filter(i => i.folder == currentF && !i.is_deleted)
            docs = sortObj(docs, 'created_at')
            let tasks = state.taskList
            docs = docs.map((d, j) => {
                let task = tasks.find(t => t.docid == d.id)
                d.task = task ? true : false
                let creator = ''
                users.map(u => {
                    if(u.id == d.created_by){
                        creator = u.first_name + ' ' + u.last_name
                    }
                })
                let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
                let date = new Date(d.created_at)
                let updated = new Date(d.updated_at)
                return {...d,
                    creator: creator,
                    version: d.version
                        ? (() => {
                            let vers = d.files.filter(f => f.id == d.version)
                            return vers ? vers[0].version : d.files[0].version
                        })()
                        : d.files && d.files.length
                            ? d.files[0].version
                            : 1,
                    versionID: d.version || d.files && d.files.length
                        ? d.files[0].id
                        : 1,
                    date: date.toLocaleDateString("ru-RU", options),
                    updated: updated.toLocaleDateString("ru-RU", options),
                    // meta: JSON.parse(this.decodeHtmlCharCodes(d.meta)),
                    user: project.info.in_charge_name,
                    sp333: function(){
                        if(!d.tags){
                            return {
                                type: '',
                                value: ''
                            }
                        }
                        if(d.tags.hasOwnProperty('class.error.json')){
                            return {
                                type: 'class.error',
                                value: d.tags['class.error.json'],
                                title: 'Классификатор Строительной Информации'
                            }
                        }
                        if(d.tags.hasOwnProperty('attribute.error.json')){
                            return {
                                type: 'attribute.error',
                                value: d.tags['attribute.error.json'],
                                title: 'Классификатор Строительной Информации'
                            }
                        }
                        if(d.tags.hasOwnProperty('classerror.json')){
                            return {
                                type: 'classerror',
                                value: d.tags['classerror.json'],
                                title: 'Классификатор Строительной Информации'
                            }
                        }
                        if(d.tags.hasOwnProperty('classerror.onlyempty.json')){
                            return {
                                type: 'classerror.onlyempty',
                                value: d.tags['classerror.onlyempty.json'],
                                title: 'Классификатор Строительной Информации'
                            }
                        }
                        if(d.tags.hasOwnProperty('warning.json')){
                            return {
                                type: 'warning',
                                value: d.tags['warning.json'],
                                title: 'СП333'
                            }
                        }
                        if(d.tags.hasOwnProperty('error.json')){
                            return {
                                type: 'error',
                                value: d.tags['error.json'],
                                title: 'СП333'
                            }
                        }
                        return {
                            type: '',
                            value: ''
                        }
                    }(),
                    collisions: (() => {
                        if(!d.tags){
                            return 0
                        }
                        if(d.tags.hasOwnProperty('collisions.json')){
                            return d.tags['collisions.json']
                        }
                        return 0
                    })()
                }
            })
            let tempDocs = JSON.parse(JSON.stringify(docs))
            docs.map(d => {
                if(d.consolidations){
                    let subs = d.consolidations.reverse()
                    tempDocs = tempDocs.map(i => i.id == d.id
                            ? {...i, sublist: d.consolidations, expanded: this.expandedlist.some(s => s == d.id)}
                            : i
                        )
                    subs.map(c => {
                        let index = tempDocs.map(t => t.id).indexOf(c)
                        let elem = tempDocs.splice(index, 1)[0]
                        elem.sub = true
                        if(this.sublist.some(s => s == c)){
                            index = tempDocs.map(t => t.id).indexOf(d.id)
                            tempDocs.splice((index + 1), 0, elem)
                        }
                    })
                }
            })

            let list = [...foldersListTemp, ...tempDocs]

            return list
        },
        filteredDocs() {
            return this.getDocs.filter(data => !this.search || data.name.toLowerCase().includes(this.search.toLowerCase()))
        },
        cardActionStyle(){
            let width = 0
            let left = 0
            if(this.selected.length){
                let box = this.$refs['wrap'].getBoundingClientRect()
                width = box.width
                left = box.x
            }
            return {width: width + 'px', left: left + 'px'}
        },
        getReplaceItems(){
            let replaced = {
                type: '',
                items: []
            }
            if(!this.replace_items.length){
                replaced.items = this.selected
                replaced.type = 'selected'
            }
            else{
                replaced.items = this.replace_items
                replaced.type = 'pointer'
            }
            return replaced
        },
    },
    methods: {
        getFoldersAAAA() {
            this.$store.dispatch('workflow/getFoldersByProjectId',this.$route.params.id)
            .then( result => {
                console.log('got all folders', result)
                //console.log("The result is",this.projectFoldersMap)
            })
            .catch( err => {
                console.log(err)
            })
        },
        checkIfNeedsTooltip(arg) {
            let target = arg.target
            if (target.offsetWidth < target.scrollWidth) {
                this.needs_tooltip = true
                return true
            }
            this.needs_tooltip = false
            return false
        },
        getSvgSrc(type) {
            switch(type) {
                case 'folder': {
                    return require(`@/assets/icons/file-icon.svg`)
                }
                case 'consolidations':
                case 'dwg':
                case 'excel':
                case 'ifc':
                case 'pdf':
                case 'rvt':
                case 'word':
                case 'xlsx':
                case 'jpg':
                case 'png':
                case 'txt':
                case 'xml':
                case 'zip':
                {
                    return require(`@/assets/icons/file-format/${type}.svg`)
                }

                default: {
                    return require(`@/assets/icons/view.svg`)
                }
            }
        },
        getDate(d){
            if (!d) {
                return 'Не назначено'
            }
            // let options = {year: 'numeric', month: 'short', day: '2-digit'}
            return d
        },
        getSizeOfLastFile(files) {
            if (!files || !files.length) {
                return '--'
            }
            let last_file = files[files.length-1]
            let size = last_file.size

            return formatBytes(size)

            function formatBytes(bytes, decimals = 2) {
                // возвращает строку с размером файла
                if (!+bytes) return '0b'
                const k = 1024
                const dm = decimals < 0 ? 0 : decimals
                const sizes = ['b', 'Kb', 'Mb', 'Gb', ]
                const i = Math.floor(Math.log(bytes) / Math.log(k))
                return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
            }
        },
        checkLicense(v){
            let type_file = v || 'all_type_file'
            return checklicense(type_file)
        },
        decodeHtmlCharCodes(str){
            return str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
                String.fromCharCode(charCode)
            )
        },
        checkTypeFiles(o){
            let checkTypes = this.$store.state.workflow.fileTypeConversion
            let len = false
            switch(o.count){
                case 'one': len = this.selected.length == 1
                    break
                case 'lot': len = this.selected.length > 1
                    break
                default:
                    len = true
            }
            if(this.selected.some(s => s.type == 'folder')
                    // || !this.selected.some(s => checkTypes.some(c => s.type == c))
                    || !this.selected.some(s => o.type.some(c => s.type == c))
                    || !this.selected.every((e, i, ar) => e.type == ar[0].type)
                    || !len){
                return false
            }
            else{
                return true
            }
        },
        onSpecificationXml(i){
            this.workItem = i
            this.specification_xml = true
        },
        convertationIFCXML(i){
            let file = i.version ? i.files.find(f => f.version == i.version) : i.files[0]
            this.$store.dispatch('workflow/convertationTag', {
                uuid: file.url,
                tag: 'ifcxml.zip'
            })
            .then(res => {
                let list = this.$store.state.workflow.listSocket
                list = list.map(s => {
                    if(s.inworkId == i.id){
                        s.url = i.files.find(f => f.version == i.version).url
                    }
                    return s
                })
                Promise.all([
                    this.$store.commit('workflow/setListSocket', list)
                ])
                .then(() => {
                    this.$store.dispatch('workflow/onSocket')
                })
            })
        },
        setCollisions(i){
            this.workItem = i
            this.collisionsJSON = null
            this.collisions = true
            let url = i.files.filter(f => f.id == i.versionID)[0].url

            this.$store.dispatch('common/getFileInfo', {
                id: url + '/collisions.json'
            })
            .then(res => {
                this.collisionsJSON = res
            })
        },
        // setSP333Attr(i){
        //     this.workItem = i
        //     this.SP333JSON = {
        //         list: [],
        //         clue: []
        //     }
        //     this.SP333attr = true
        // },
        replaceItems(ar = []){
            this.replace_items = ar
            this.replaceItem = true
        },
        copyItems(ar = []){
            this.replace_items = ar
            this.copyItem = true
        },
        renameitem(i){
            this.workItem = i
            this.renameItem = true
        },
        checkSelected(i){
            return this.selected.some(s => s.id == i.id)
        },
        searchPath(id, link = false){
            let map = this.$store.state.workflow.foldersMap
            let folder = map.filter(i => i.id == id)[0]
            folder = folder || false
            if(!folder){
                return []
            }
            let path = [{
                id: folder.id,
                name: folder.name,
                link: link
            }]
            if(folder.parent){
                path.push(...this.searchPath(folder.parent, true))
            }
            return path
        },
        getVersionFile(model){
            if(model.version == null){
                return 1
            }
            let vers = model.files.find(fl => fl.id == model.version)
            if(!vers){
                return 1
            }
            else{
                return vers.version
            }
        },
        getFileUrl(doc){
            let list = []
            if(doc.type == 'consolidations'){
                list = doc.consolidations
            }
            else{
                list = [(doc.files.find(fl => fl.id == doc.version) || doc.files[0]).url]
            }
            return list
        },
        getDct(i){
            if(!this.fileTypeList.some(s => s == i.type)){
                return
            }

            console.log('file id', i)

            this.$store.dispatch('common/getFileInfo', {
                id: this.getFileUrl(i)[0] + '/info'
            })
            .then(res => {
                let type = ''
                switch(i.type){
                    case 'pdf':
                    case 'zip':
                        type = 'view-pdf'
                        break
                    case 'svg.pdf.zip':
                    case 'svg':
                        type = 'view-svg'
                        break
                    case 'ifc':
                    case 'rvt':
                    default:
                        type = 'view-obj'
                }
                if(res.tags['pdf.svg.zip'] && res.tags['pdf.svg.zip'] == 1){
                    type = 'view-svg'
                }

                let delta = 0
                const files = this.getFileUrl(i)
                if(files.length == 1){
                    if(i.files.length > 1 && this.getVersionFile(i) != 1){
                        delta = 1
                    }
                }
                if(type == 'view-svg'){
                    const params = '?token=' + this.$store.state.auth.access_token + '&' +
                        'fileid=' + files[0] + '&' +
                        'projectid=' + this.id + '&' +
                        'docid=' + i.id
                    // let w = 
                    window.open('/viewerSVG' + params, '_blank', 'noreferrer')
                    // window.open('/viewsvg.html' + params, '_blank', 'noreferrer')
                    return
                }

                this.$router.push({
                    name: 'workflow-view',
                    params: {
                        id: this.$route.params.id,
                        type: type
                    },
                    query: {
                        file: files,
                        delta: delta,
                        doc: i.id
                    }
                })
            })
        },
        setConsolidations(i){
            let state = this.$store.state.workflow
            let parentID = state.currentFolder
            let parentLength = state.foldersMap.filter(f => f.parent == parentID).length
            let parentFiles = state.foldersMap.find(f => f.id == parentID).files
            parentFiles = parentFiles ? parentFiles.length : 0
            parentLength += parentFiles
            let name = this.selected.map((s, i) => {
                return s.name
            }).join(', ')
            let consolidations = this.selected.map((s, i) => {
                return s.id
            })

            let body = {
                id: uuidv4(),
                name: name,
                order: parentLength,
                folder: parentID,
                files: null,
                consolidations: consolidations
            }

            this.$store.dispatch('workflow/addDoc', body)
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(() => {
                this.$store.dispatch('workflow/createFoldersMap')
                this.selected = []
            })
        },
        removeDct(item){
            let listPromises = []

            listPromises.push(this.$store.dispatch('workflow/removeDoc', item))

            Promise.all(listPromises)
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(res => {
                this.$store.dispatch('workflow/createFoldersMap')
            })
        },
        removeFolder(i){
            this.$store.dispatch('workflow/removeFolder', {uuid: i.id})
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(res => {
                this.$store.dispatch('workflow/createFoldersMap')
            })
        },
        removeItem(i){
            this.remove_item = true
            this.workItem = i
        },
        removeSelected(){
            let list = this.selected
            let listPromises = []
            let state = this.$store.state.workflow
            let currentF = state.currentFolder
            currentF = state.foldersMap.filter(f => f.id == currentF)[0]
            let listFiles = currentF
                ? currentF.files
                    ? JSON.parse(JSON.stringify(currentF.files))
                    : []
                : []

            list.map(i => {
                if(i.type == 'folder'){
                    if(!!i.group){
                        let group = state.foldersMap.filter(g => g.id == g.id)[0]
                        let list = group.folders || []
                        list.map((f, j) => {
                            listPromises.push(this.$store.dispatch('workflow/removeFolder', {uuid: f.folder}))
                        })
                        let g_model = {
                            name: group.name,
                            order: group.order,
                            created_at: group.created_at,
                            created_by: group.created_by,
                            updated_at: group.updated_at,
                            updated_by: group.updated_by,
                            folders: group.folders
                        }
                        group = g_model

                        listPromises.push(this.$store.dispatch('workflow/removeGroup', group))
                    }
                    else{
                        listPromises.push(this.$store.dispatch('workflow/removeFolder', {uuid: i.id}))
                    }
                }
                else{
                    listPromises.push(this.$store.dispatch('workflow/removeDoc', i))
                    if(currentF && !currentF.group){
                        listFiles = listFiles.filter(f => f.id != i.id)
                    }
                }
            })

            Promise.all(listPromises)
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(res => {
                return this.$store.dispatch('workflow/createFoldersMap')
            })
            .then(res => {
                this.selected = []
            })
        },
        openFolder(i){
            this.$router.push({
                name: 'workflow-project',
                params: {
                    id: this.$route.params.id,
                    path: i.id
                }
            })
            this.$store.commit('workflow/setCurrentFolder', i.id)
        },
        accessRights(i){
            this.accessrights = true
            this.workItem = i
        },
        versionJournal(i){
            this.versionjournal = true
            this.workItem = i
        },
        errorIFCXML(){
            this.error_ifcxml = true
        },
        setTableType(v){
            this.$store.commit('workflow/setTableType', {
                name: 'workflow_project',
                value: v
            })
        },
        clearSelected(type){
            if(type == 'selected'){
                this.selected = []
            }
            else{
                this.replace_items = []
            }
        },
        upload(){
            // console.log('upload called')
            this.uploadF = true
        },
        downloadFile(f){
            // console.log('downloading f', f)
            let url = ''
            let name = ''
            if(f.type !== 'ifcxml'){
                url = f.file.files[0].url
                name = f.file.name
            }
            else{
                url = f.file.files[0].url + '/ifcxml.zip'
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
        download(){
            let list = this.selected
            let listPromises = []
            let listFilename = []
            list.map(f => {
                if(f.type !== 'folder'){
                    let file = f.files[0]
                    let uuid = uuidv4()
                    this.$store.dispatch('common/setUploadNote', [{
                        name: f.name,
                        uuid: uuid,
                        action: 'download',
                        pushin: true
                    }])
                    listFilename.push({
                        id: file.url,
                        uuid: uuid,
                        name: f.name
                    })
                    listPromises.push(this.$store.dispatch('common/getFile', {
                        id: file.url,
                        name: f.name,
                        uuid: uuid
                    }))
                }
            })

            if(!listFilename.length){
                return
            }
            Promise.all(listPromises)
            .then(res => {
                let zip = new JSZip()
                let resultat = res
                    .filter(f => !f.error)
                    .map((r, j) => {
                        let file = listFilename.find(n => n.id == r.id)
                        this.$store.dispatch('common/setUploadNote', [{
                            uuid: r.uuid,
                            action: 'download',
                            pushin: false
                        }])
                        zip.file(file.name, r.file)
                        URL.revokeObjectURL(r.file)
                        return j
                    })
                return resultat.length ? zip.generateAsync({type: 'base64'}) : null
            })
            .then(res => {
                if(res){
                    let a = document.createElement("a")
                    a.href = "data:application/zip;base64," + res
                    a.download = 'unitbimprojectfiles.zip'
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                }
            })
        },
        searchFolder(tree, folder, list = []){
            for(let i = 0, len = tree.length; i < len ; i++){
                if(tree[i].data.path == folder){
                    list = tree[i].children
                    return list
                }
                else{
                    list = this.searchFolder(tree[i].children, folder, list)
                    if(list.length){
                        return list
                    }
                }
            }
            return list
        },
        createFolder(v){
            let state = this.$store.state.workflow
            let currentF = state.currentFolder
            if(currentF){
                currentF = state.foldersMap.filter(i => i.id == currentF)[0]
            }

            let parent = currentF ? currentF.id : 0
            let list = state.foldersMap.filter(i => i.parent == parent && !i.group)

            let id = uuidv4()
            let folder = {
                id: id,
                parent: currentF
                    ? currentF.group
                        ? id
                        : currentF.id
                    : id,
                name: this.checkTween(list, v.name),
                order: list.length
            }

            let group = false
            if(currentF && currentF.group){
                group = state.foldersMap.filter(i => i.id == currentF.id)[0]

                let g_model = {
                    name: group.name,
                    order: group.order,
                    created_at: group.created_at,
                    created_by: group.created_by,
                    updated_at: group.updated_at,
                    updated_by: group.updated_by,
                    folders: group.folders || []
                }
                group = g_model
            }

            this.loading = true
            this.$store.dispatch('workflow/addFolder', folder)
            .then(res => {
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Папка ' + folder.name + ' была успешно создана.',
                    message: 'Папка ' + folder.name + ' была успешно создана.',
                })
            })
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(() => {
                return this.$store.dispatch('workflow/createFoldersMap')
            })
            .then(() => {
                // this.$store.dispatch('administration/getFoldersPermissions')
                this.getAccessForFolders()
            })
            .catch(er => {
                console.log(er)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'При создании папки ' + folder.name + ' возникли проблемы.',
                    message: 'При создании папки ' + folder.name + ' возникли проблемы.',
                })
            })
            .finally(() => {
                this.loading = false
            })
        },
        checkTween(ar, v){
            let name = v
            ar.map(i => {
                if(i.name == name){
                    name += '0'
                }
            })
            return name
        },
        handleSelectionChange(val) {
            this.selected = val
        },
        resizeFileMenu(event){
          if(this.resizeFileMenuControl.isResizing){
            let startPos = this.$refs.fileMenuWrapper.getBoundingClientRect().left
            let currentPos = event.clientX
            this.resizeFileMenuControl.currentWidth = currentPos - startPos + 1
            if(this.resizeFileMenuControl.currentWidth < 180) {
              this.resizeFileMenuControl.currentWidth = 180
            }
            if(this.resizeFileMenuControl.currentWidth > 500) {
              this.resizeFileMenuControl.currentWidth = 500
            }
          } else {
            this.endResize()
          }
        },
        startResize(){
          this.resizeFileMenuControl.isResizing = true
        },
        endResize() {
          this.resizeFileMenuControl.isResizing = false
        },
        toggleRemoved() {
            this.show_removed = !this.show_removed
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-project-table'

            let table_data = localStorage.getItem('ub-tables-data')
            if (table_data == null || table_data == undefined || table_data == 'null' || table_data == 'undefined' ) {
                table_data = Object.assign({},{})
            }
            else {
                table_data = JSON.parse(table_data)
            }
            table_data[item] = columns
            localStorage.setItem('ub-tables-data', JSON.stringify(table_data))
        },
        loadColumnWidth() {
            const item = 'workflow-project-table'
            let table_data = localStorage.getItem('ub-tables-data')
            if (table_data == null || table_data == undefined || table_data == 'null' || table_data == 'undefined' ) {
                table_data = Object.assign({},{})
            }
            else {
                table_data = JSON.parse(table_data)
            }
            let cols = table_data[item]
            return cols || []
        },
        showAccessSettings(v) {
            // v - нода папки из sidebarFolders
            this.access_node = v
            this.show_accesss_settings = true
        },
        cancelAccessSettings() {
            this.show_accesss_settings = false
            this.access_node = null
        },
        showShareFolderLinks(i) {
            this.workItem = i
            this.shared = true
        },
        getAccessForFolders() {
            // Запрос на права работает по текущему токену, который определяет и компанию, и пользователя.
            return this.$store.dispatch('administration/getAllCurrentUserPermissions')
                .then(res => {
                    let folder_permissions = res.folder
                    console.log('got perm JSON', res)
                    // const company_id = this.$store.state.administration.company.id
                    this.all_permissions = folder_permissions // res[company_id]
                })
                .catch(err => {
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось получить данные о правах доступа пользователя. Проверьте соединение.',
                        message: 'Не удалось получить данные о правах доступа пользователя. Проверьте соединение.',
                    })
                    console.log('got per JSON err', err)
                })
        },
        checkPermission(a) {
            if (!this.current_permissions) {
                return false
            }
            return this.current_permissions.includes(a)
        },
        saveSideBarWidth() {
            // сохраняет ширину дерева папок на странице для удобства пользователя
            localStorage.setItem('workflow-project-sidebar-width', this.resizeFileMenuControl.currentWidth)
        },
        loadSideBarWidth() {
            // устанавливает ширину дерева папок на странице
            let width = localStorage.getItem('workflow-project-sidebar-width')
            this.resizeFileMenuControl.currentWidth = width ? width : 200
        },
    },
    created(){
        let workflow = this.$store.state.workflow

        this.$store.dispatch('workflow/getProjects', {
            type_id: 'c',
            id: this.$store.state.administration.company.id
        })
        .then(res => {
            let project = workflow.projects.filter(i => i.id == this.$route.params.id)
            project = project.length
                ? JSON.parse(JSON.stringify(project[0]))
                : null

            let projectName = project ? project.info.name : ''

            let title = [
                {title: 'Документооборот', path: '/workflow'},
                {title: projectName, path: ''}
            ]

            if(this.path){
                this.$store.commit('workflow/setCurrentFolder', this.path)
            }

            this.$store.commit('toolbar/setTitle', title)

            // TODO Проблема: при получении и отображении проекта чужой компании пользователь не имеет доступа к проблемам (tasks) и группам проекта,
            // так же как и к информации о чужой компании и проектах. Из-за этого не весь интерфейс будет работать корректно!
            return Promise.all([
                this.$store.commit('workflow/setActiveProject', project),
                this.$store.dispatch('workflow/getFolders'),
                this.$store.dispatch('workflow/getTaskProject', {
                    type_id: 'c',
                    id: this.$store.state.administration.company.id,
                    project_uuid: project.id,
                    filter: {}
                })
            ])


        })
        .finally(res => {
            this.$store.dispatch('workflow/createFoldersMap')
            let folderFirstId = this.$store.state.workflow.foldersMap
            let currentFolder = this.$store.state.workflow.currentFolder
            if(!folderFirstId.find(fld => fld.id == currentFolder)){
                folderFirstId = folderFirstId.length
                        ? folderFirstId[0].id
                        : 0
            }
            else{
                folderFirstId = currentFolder
            }
            this.$store.commit('workflow/setCurrentFolder', folderFirstId)
            this.loading = false
        })
    },
    mounted(){
        this.loadSideBarWidth()

        this.getAccessForFolders()
        .then(res => {
            if (this.all_permissions == null || this.all_permissions == undefined) {
                return null
            }
            this.current_permissions = this.all_permissions[this.$store.state.workflow.currentFolder]
            // console.log('setting perms', this.current_permissions)
        })
        // console.log('wfp company',this.$store.state.administration.company)
    },
    updated() {
    },
    beforeCreate(){
        this.$store.commit('workflow/setFoldersMap', [])
        this.$store.commit('workflow/setListDocs', [])
    },
    beforeDestroy(){
        this.$store.commit('workflow/setTaskList', [])
        this.saveSideBarWidth()
    }
}
</script>


<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: 0;
}

.tabs {
  ::v-deep .el-tabs__content {
    height: calc(100vh - 212px);
  }
  ::v-deep .el-tab-pane {
    height: 100%;
  }
  ::v-deep .el-tabs__header {
    padding: 0px 16px;
    margin-bottom: 0;
  }
}

.tabs-buttons {
  display: flex;
  width: 100%;
  height: 0px;
  justify-content: flex-end;

  .tabs-buttons__wrapper {
    display: flex;
    justify-content: flex-end;
    overflow: visible;
    width: 400px;
    transform: translateY(12px); // костыль, помещает кнопки на один уровень с нужным элементом визуально
    z-index: 1;
    padding-right: 16px;
  }
}

.table-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
}

.file-menu-wrapper {
  flex-direction: row;
  display: flex;
  height: 100%;
  background-color: white;

  .file-menu {
    padding: 16px 0;
    width: calc(100% - 1px);
  }
}

.file-menu-size-control {
  z-index: 1;
  width: 8px;
  height: 100%;
//   margin-right:3px;
  cursor: ew-resize;
  border-left: 1px solid rgb(220 220 220);
  &:hover {
    border-left: 2px solid rgb(106, 192, 231);
  }
  &:not(:hover):not(:active) svg {
    width: 0px;
  }
  & svg {
    width: 0px;
  }

}

.file-menu-size-control__icon-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  width: 7px;
  color: #cccccd;
  fill: #cccccd;
  cursor: ew-resize;
  svg {
    transform: translateX(2px);
    height: 24px;
    width: 24px;
    display: flex;
  }
}

.file-table-wrapper {
  display: flex;
  flex-direction: column;
  width: calc(100% - 200px);
//   border-left: 1px solid #cccccd;

  & .toolbar {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    max-height: 56px;
  }

  & .input-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 16px;
    & .v-text-field {
        padding-top: 0px;
    }
  }
}

.removed-files {
    max-height: calc(100% - 40px);
    overflow-y: scroll;
}

.gear-loader-wrap {
    min-width: 35px;
    max-width: 35px;
    min-height: 35px;
    max-height: 35px;
}

.ub-table-name-column {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.ub-version-plaque {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px;
    margin: 0;
    min-height: 18px;
    max-height: 18px;
    min-width: fit-content;
    max-width: fit-content;

    font-family: "Artifakt Element", sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;

    border-radius: 18px;
    border: 1px solid #666666;
    color: rgb(0, 110, 175);
    cursor: pointer;
}

.ub-version-dashes {
   width: 100%;
   padding-left: 10px;
   display: flex;
   flex-direction: row;
   justify-content: start;
}

.el-btn-wrap {
    display: flex;
    align-items: center;
    gap:8px;
}

.el-btn-svg {
    display: flex;
    align-items: center;
    transform: translateY(-2px);
}


</style>
