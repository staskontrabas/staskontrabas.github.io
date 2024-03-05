<template>
<v-container class="m-container ma-0 pb-10 pt-4">
    <v-container fluid px-3 pb-10 pt-0 ref="wrap" style="max-height: 100%; overflow-y: scroll;">

        <v-toolbar flat height="auto">
            <v-text-field
                v-model="search"
                prepend-icon="search"
                placeholder="Поиск..."
                single-line
                hide-details
                class="m-table-toolbar--search ml-2"
                ></v-text-field>

            <v-spacer></v-spacer>
            <v-btn
                text
                @click.stop="onRemove(null, 'trash')"
                class="ma-0 m-btn--text_icon">
                <v-icon
                    size="16"
                    left>mdi-trash-can-outline</v-icon>Очистить корзину
            </v-btn>
        </v-toolbar>

        <!--  @toggle-select-all="selectRow"  - ?  -->
        <ub-table
            :data="getRemoved"
            :headers = "[
                {name: 'name', title: 'имя файла', width: '280', icon: null, click: null, }, 
                {name: 'projectName', title: 'проект', width: '100', icon: null, click: null, },
                {name: 'trash_time', title: 'дата удаления', width: '150', icon: null, click: null, },
                {name: 'deleted_by', title: 'удалил', width: '200', icon: null, click: null, },
                {name: 'upload_date', title: 'дата загрузки', width: '150', icon: null, click: null, },
                {name: 'status', title: 'статус', width: '170', icon: null, click: null, },
                {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
            ]"
            @toggle-select-all="selectRow" 
            :savedcolumnwidth="loadColumnWidth()"
            @save_columns_width="saveColumnsWidth"
            disablefooter>

            <!-- needs_tooltip  @mouseover="checkIfNeedsTooltip" -->
                <template v-slot:column1="{ item }">
                    <el-tooltip effect="dark" 
                        :content="item.name" 
                        :disabled="!needs_tooltip" placement="right">
                        <span
                            class="truncate-text"
                            @click=""
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.name }}
                        </span>
                    </el-tooltip>
                </template>

                <template v-slot:column2="{ item }">
                    <el-tooltip effect="dark" 
                        :content="item.projectName" 
                        :disabled="!needs_tooltip" placement="right">
                        <span
                            class="truncate-text"
                            @click=""
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.projectName }}
                        </span>
                    </el-tooltip>
                </template>

                <template v-slot:column3="{ item }">
                    <el-tooltip effect="dark" 
                        :content="item.trash_time" 
                        :disabled="!needs_tooltip" placement="right">
                        <span
                            class="truncate-text"
                            @click=""
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.trash_time }}
                        </span>
                    </el-tooltip>
                </template>

                <template v-slot:column4="{ item }">
                    <el-tooltip effect="dark" 
                        :content="item.deleted_by" 
                        :disabled="!needs_tooltip" placement="right">
                        <span
                            class="truncate-text"
                            @click=""
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.deleted_by }}
                        </span>
                    </el-tooltip>
                </template>

                <template v-slot:column5="{ item }">
                    <el-tooltip effect="dark" 
                        :content="item.upload_date" 
                        :disabled="!needs_tooltip" placement="right">
                        <span
                            class="truncate-text"
                            @click=""
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.upload_date }}
                        </span>
                    </el-tooltip>
                </template>
                
                <template v-slot:column6="{ item }">
                    <el-tooltip effect="dark" 
                        :content="status[item.status]" 
                        :disabled="!needs_tooltip" placement="right">
                        <span
                            class="truncate-text"
                            @click=""
                            @mouseover="checkIfNeedsTooltip">
                            {{ status[item.status] }}
                        </span>
                    </el-tooltip>
                </template>

                <template v-slot:column7="{ item }">
                    <action-menu
                        @onRemove="onRemove"
                        @onRestore="onRestore"
                        :item="item"
                    />
                </template>
        </ub-table>

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
                    @click="onRestoreSelected">
                    <v-icon size="20" class="mr-1" color="#0070e0">mdi-trash-can-outline</v-icon>
                    Восстановить
                </v-btn>
                <v-btn
                    text
                    color="primary"
                    class="m-btn"
                    @click="onRemoveSelected">
                    <v-icon size="20" class="mr-1" color="#0070e0">mdi-trash-can-outline</v-icon>
                    Удалить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</v-container>
</template>

<script>
import { sortObj } from '@/utils/services'
import ubTable from "@/components/custom/ubTable.vue"
import ActionMenu from "./removed_files/ActionMenu"
export default {
    name: 'RemovedFiles',
    components: {
        ActionMenu,
        ubTable,
    },
    props: ['id'],
    data(){
        return {
            search: '',
            headers: [
                {
                    text: '',
                    align: 'center',
                    sortable: false,
                    value: 'src',
                    grid: false
                },
                { text: 'Имя файла', value: 'name', grid: true },
                { text: 'Проект', value: 'projectName', grid: false },
                { text: 'Дата удаления', value: 'trash_time', grid: false },
                { text: 'Удалил', value: 'deleted_by', grid: false },
                { text: 'Дата загрузки', value: 'upload_date', grid: false },
                { text: 'Статус', value: 'status', grid: true },
                { text: '', value: 'action', sortable: false, grid: false },
                ],
            status: {
                '0': 'На рассмотрении',
                '1': 'На исправлении',
                '2': 'Принят',
                '3': 'Отказ'
            },
            noData: 'Нет данных',
            selected: [],
            items: [],
            status: {
                '-1': '',
                '0': 'На рассмотрении',
                '1': 'На исправлении',
                '2': 'Принят',
                '3': 'Отказ'
            },
            actionList: ['trash', 'project', 'folder', 'file'],

            needs_tooltip: false,
        }
    },
    computed: {
        getRemoved(){
            let list = []
            let state = this.$store.state
            let projects = state.workflow.projects
            let users = state.administration.company.users
            let dx = 1
            this.items.map(i => {
                projects.map(p => {
                    if(p.id == i.project){
                        let project = {
                            projectId: p.id,
                            projectName: p.info.name
                        }
                        if(i.TrashFolder.folders){
                            i.TrashFolder.folders.map(f => {
                                let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
                                let created_at = new Date(f.created_at)
                                let trash_time = new Date(f.trash_time)
                                let user = users.find(u => u.id == f.deleted_by + '')
                                user = user
                                    ? user.first_name + ' ' + user.last_name
                                    : ''
                                let item = {
                                    ...project,
                                    ...f,
                                    type: 'folder',
                                    trash_time: trash_time.toLocaleDateString("ru-RU", options),
                                    upload_date: created_at.toLocaleDateString("ru-RU", options),
                                    deleted_by: user
                                }
                                list.push(item)
                            })
                        }
                        if(i.TrashFolder.files){
                            i.TrashFolder.files.map(f => {
                                let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
                                let created_at = new Date(f.created_at)
                                let trash_time = new Date(f.trash_time)
                                let user = users.find(u => u.id == f.deleted_by + '')
                                user = user
                                    ? user.first_name + ' ' + user.last_name
                                    : ''

                                let arName = f.name.split('.')
                                let type = arName.splice(-1, 1)[0] || 'type'
                                if(f.consolidations){
                                    type = 'consolidations'
                                }
                                let item = {
                                    ...project,
                                    ...f,
                                    type: type,
                                    trash_time: trash_time.toLocaleDateString("ru-RU", options),
                                    upload_date: created_at.toLocaleDateString("ru-RU", options),
                                    deleted_by: user
                                }
                                list.push(item)
                            })
                        }
                    }
                })
            })
            return list
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
        }
    },
    methods: {
        checkSelected(i){
            return this.selected.some(s => s.id == i.id)
        },
        selectRow(e){
            let list = e.items
            list = list.filter(i => i.inwork !== true)

            if(this.selected.length != list.length){
                this.selected = list
            }
            else{
                this.selected = []
            }
        },
        onRestore(item){
            let type = item.type == 'folder'
                ? 'folder'
                : 'file'
            this.$store.dispatch('workflow/restoreFiles', {
                fileName: item.name,
                fileId: item.id,
                uuid: item.projectId,
                fileType: type
            })
            .then(res => {
                this.$notify({
                    group: 'note',
                    type: res.status ? 'success' : 'error',
                    text: res.status
                        ? res.fileType == 'folder'
                            ? 'Папка ' + res.name + ' восстановлена.'
                            : 'Файл ' + res.name + ' восстановлен.'
                        : res.name + ' ' + res.text,
                    message: res.status
                        ? res.fileType == 'folder'
                            ? 'Папка ' + res.name + ' восстановлена.'
                            : 'Файл ' + res.name + ' восстановлен.'
                        : res.name + ' ' + res.text,
                })
            })
            .then(res => {
                return this.$store.dispatch('workflow/getRemovedFiles')
            })
            .then(res => {
                this.items = res
            })
        },
        onRestoreSelected(){
            let listPromises = []
            this.selected.map(s => {
                let type = s.type == 'folder'
                    ? 'folder'
                    : 'file'
                listPromises.push(
                    this.$store.dispatch('workflow/restoreFiles', {
                        fileName: s.name,
                        fileId: s.id,
                        uuid: s.projectId,
                        fileType: type
                    })
                )
            })

            Promise.all(listPromises)
            .then(res => {
                res.map(r => {
                    this.selected = []
                    this.$notify({
                        group: 'note',
                        type: r.status ? 'success' : 'error',
                        text: r.status
                            ? res.fileType == 'folder'
                                ? 'Папка ' + res.name + '<br/>восстановлена.'
                                : 'Файл ' + res.name + '<br/>восстановлен.'
                            : r.name + '<br/>' + r.text,
                        message: r.status
                            ? res.fileType == 'folder'
                                ? 'Папка ' + res.name + '<br/>восстановлена.'
                                : 'Файл ' + res.name + '<br/>восстановлен.'
                            : r.name + '<br/>' + r.text,
                    })
                })
                return true
            })
            .then(res => {
                return this.$store.dispatch('workflow/getRemovedFiles')
            })
            .then(res => {
                this.items = res
            })
        },
        onRemove(item, action){
            if(action == 'trash' && !this.items.length){
                return true
            }
            this.removeItem(item, action)
            .then(res => {
                return this.$store.dispatch('workflow/getRemovedFiles')
            })
            .then(res => {
                this.items = res
            })
        },
        removeItem(item, action){
            action = this.actionList.some(s => s == action) ? action : 'file'
            return new Promise(resolve => {
                this.$store.dispatch('workflow/removeRemovedFiles', {
                    fileName: item ? item.name : null,
                    fileId: item ? item.id : null,
                    uuid: item ? item.projectId : null,
                    fileType: item
                        ? item.type == 'folder'
                            ? item.type
                            : 'file'
                        : null,
                    action: action
                })
                .then(res => {
                    this.selected = []
                    this.$notify({
                        group: 'note',
                        type: res.status ? 'success' : 'error',
                        text: res.status
                            ? action == 'trash'
                                ? 'Все папки и файлы удалены'
                                : action == 'file'
                                    ? 'Файл ' + res.name + '<br/>удален.'
                                    : 'Папка ' + res.name + '<br/>удалена.'
                            : res.name + '<br/>' + res.text,
                        message: res.status
                            ? action == 'trash'
                                ? 'Все папки и файлы удалены'
                                : action == 'file'
                                    ? 'Файл ' + res.name + '<br/>удален.'
                                    : 'Папка ' + res.name + '<br/>удалена.'
                            : res.name + '<br/>' + res.text,
                    })
                    resolve(true)
                })
            })
        },
        onRemoveSelected(){
            let list = this.selected
            let listPromises = []
            list.map(l => {
                listPromises.push(this.removeItem(l, l.type))
            })
            Promise.all(listPromises)
            .then(res => {
                this.selected = []
                return this.$store.dispatch('workflow/getRemovedFiles')
            })
            .then(res => {
                this.items = res
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
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'removed-files-table'

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
            const item = 'removed-files-table'
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
    },
    created(){
        this.$store.dispatch('workflow/getRemovedFiles').
        then(res => {
            this.items = res
        })
    },
    updated() {
        // console.log(this.getRemoved)
    },
}
</script>
