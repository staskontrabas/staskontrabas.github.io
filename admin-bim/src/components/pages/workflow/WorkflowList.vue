<template>
<v-container id="wf-top-container" class="m-container pl-8 pr-4 ma-0 pb-10">
    <div ref="wrap" style="background: white;">

        <div
            v-show="loading"
            class="m-back m-back--trans"
            >
            <div class="vm-progress">
                <inline-svg class="inline-svg" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
            </div>
        </div>

        <div class="project-wrapper">
          <span class="project-title">
            Добро пожаловать, {{ user.first_name }} {{ user.last_name }}
          </span>
        </div>

        <el-tabs v-model="activeName" class="tabs">
        <el-tab-pane label="Проекты" name="first">

            <v-layout
            v-if="!projectList.length && !loading"
            fluid
            fill-height
            column
            align-center
            justify-center
            >
            <template>
                <div class="m-dummy--title-2"> У вас пока нет проектов, создайте его! </div>
                <div class="py-3">
                    <el-button
                        outlined
                        type="main"
                        :disabled="!isOwner"
                        @click.stop="onProject(false)"
                        class=" m-btn--text_icon mr-4">
                        <v-icon
                            size="16"
                            left> mdi-plus </v-icon> Создать проект
                    </el-button>
                </div>
                <el-tooltip effect="dark" placement="top">
                    <template #content>
                        На текущий момент только владелец компании может создавать проекты. Для того, чтобы другие пользователи могли видеть файлы проектов, владелец компании должен выдать соответствующее разрешение на вкладке управления проектом.
                    </template>
                    <div class="m-dummy--link-info mt-2"> Как создать проект? </div>
                </el-tooltip>
                
            </template>
        </v-layout>

        <div v-if="projectList.length" class="toolbar">
            <el-button
                type="main"
                :disabled="!isOwner"
                @click.stop="onProject(false)">
              <v-icon
                  size="20"
                  left> mdi-plus </v-icon> Создать проект
            </el-button>
          <div class="input-wrapper">
            <v-text-field
                v-model="search"
                clearable
                prepend-icon="search"
                placeholder="Поиск..."
                single-line
                hide-details
                class="m-table-toolbar--search"
            ></v-text-field>
          </div>

        </div>

        <div v-show="projectList.length" :style="{'max-height': wrapContainerHeight.result}" id="wf-projectlist">
            <ub-table
                :data="filteredProjectList"
                :headers = "headersForUbTable"
                :savedcolumnwidth="loadColumnWidth()"
                @save_columns_width="saveColumnsWidth"
                disablefooter>

                    <template v-slot:column1="{ item }">
                        <el-tooltip effect="dark" 
                            :content="item.info.name" 
                            :disabled="!needs_tooltip" placement="right">
                            <span
                                class="m-text--hover truncate-text"
                                @click="getProject(item)"
                                @mouseover="checkIfNeedsTooltip">
                                {{item.info.name}}
                            </span>
                        </el-tooltip>
                    </template>

                    <template v-slot:column2="{ item }">
                        <el-tooltip effect="dark" 
                            :content="item.info.in_charge_name" 
                            :disabled="!needs_tooltip" placement="right">
                            <span class="truncate-text"
                                @mouseover="checkIfNeedsTooltip">
                                {{ item.info.in_charge_name }}
                            </span>
                        </el-tooltip>
                    </template>

                    <template v-slot:column3="{ item }">
                        <el-tooltip effect="dark" 
                            :content="item.info.client" 
                            :disabled="!needs_tooltip" placement="right">
                            <span class="truncate-text"
                            @mouseover="checkIfNeedsTooltip">
                                {{ item.info.client }}
                            </span>
                        </el-tooltip>
                    </template>

                    <template v-slot:column4="{ item }">
                        <el-tooltip effect="dark" 
                            :content="getDate(item.info.created_at)" 
                            :disabled="!needs_tooltip" placement="right">
                            <span class="truncate-text"
                            @mouseover="checkIfNeedsTooltip">
                                {{ getDate(item.info.created_at) }}
                            </span>
                        </el-tooltip>
                    </template>

                    <template v-slot:column5="{ item }">
                        <el-tooltip effect="dark" 
                            :content="item.info.number_of_files.toString()" 
                            :disabled="!needs_tooltip" placement="right">
                            <span class="truncate-text"
                            @mouseover="checkIfNeedsTooltip">
                                {{ item.info.number_of_files }}
                            </span>
                        </el-tooltip>
                    </template>
                    
                    <!-- Техническая колонка, не удалять -->
                    <template v-slot:column6="{ item }">
                    </template>
            </ub-table>
        </div>

        </el-tab-pane>
        </el-tabs>

        <edit-project
            :editProject.sync="editProject"
            :item="itemCurrent"
            />
        <project-description
            :projectDescription.sync="projectDescription"
            />
        <create-xml
            :create_xml.sync="create_xml"
            :item="itemCurrent"
            @createXml="createXml"
            />
    </div>
</v-container>
</template>

<script>
import { checklicense } from '@/utils/services'
import EditProject from "./workflow_list/EditProject"
import ProjectDescription from "./workflow_list/ProjectDescription"
import ActionMenu from "./workflow_list/ActionMenu"
import CreateXml from './workflow_list/CreateXml'
import InfomodelCheck from './workflow_list/InfomodelCheck'
import InlineSvg from "vue-inline-svg"
import { v4 as uuidv4 } from 'uuid'

import ubTable from "@/components/custom/ubTable.vue"

export default {
    name: 'WorkflowList',
    components: {
        EditProject,
        ProjectDescription,
        ActionMenu,
        CreateXml,
        InfomodelCheck,
        InlineSvg,
        ubTable,
    },
    data(){
        return {
            loading: true,
            
            search: '',
            all_row: false,
            table_type_list: [{
                name: 'list',
                icon: 'mdi-format-list-bulleted'
            },{
                name: 'grid',
                icon: 'mdi-view-grid'
            }],
            headers: [
                { text: 'Имя', value: 'name', grid: false },
                { text: 'Ответственный за проект', value: 'manager', grid: true },
                { text: 'Заказчик', value: 'client', grid: true },
                { text: 'Дата создания', value: 'date', align: 'left', grid: true },
                { text: 'Кол. файлов', value: 'count_files', grid: true, align: 'center'},
                { text: 'Тех. задание EIR', value: 'infomodel', grid: true, align: 'center'},
                { text: '', value: 'action', sortable: false, grid: false },
                ],
            projects: [],
            selected: null,
            newProject: false,
            aboutProject: false,
            editProject: false,
            itemCurrent: null,
            type_id: '',
            company_id: '',
            create_xml: false,
            projectDescription: false,
            companytemplates: [],
            errors: {json: {}, projectid: ''},
            errorlog: [],

            activeName: 'first',

            tableheight: 600,
            window_height: 900,

            needs_tooltip: false,
        }
    },
    watch: {
        '$route'(to, from) {
            this.loading = true
            this.handlePageResize()
        },
    },
    computed: {
        projectList(){
            let list = this.$store.state.workflow.projects
            return list
        },
        headersForUbTable() {
            return [
                    {name: "name", title:'имя', width: '340', icon: null, click: null, }, 
                    {name: 'in_charge_name', title: 'ответственный', width: '250', icon: null, click: null, },
                    {name: 'client', title: 'заказчик', width: '200', icon: null, click: null,},
                    {name: 'created_at', title: 'дата создания', width: '200', icon: null, click: null,},
                    {name: 'number_of_files', title: 'количество файлов', width: '200', icon: null, click: null,},
                    {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
            ]
        },
        filteredProjectList() {
            const company_id = this.$store.state.administration.company.id
            let list = this.$store.state.workflow.projects.filter(data => !this.search || data.info.name.toLowerCase().includes(this.search.toLowerCase()))
            // TODO: выделить проекты от других компаний в отдельную вкладку!
            // TODO: раскомментировать фильтр и поместить отфильтрованные проекты других компаний в отдельную сущность
            list = list.filter(obj => obj.info.company == company_id)
            return list
        },
        cardActionStyle() {
            let width = 0
            let left = 0
            let list = this.selected ? [].push(this.selected) : []
            if(list.length){
                let box = this.$refs['wrap'].getBoundingClientRect()
                width = box.width
                left = box.x
            }
            return {width: width + 'px', left: left + 'px'}
        },
        getPermission(){
            let user = this.$store.state.administration.user
            return user.permission
        },
        user(){
            return this.$store.state.administration.user
        },
        
        wrapContainerHeight() {
            let table_wrap = document.getElementById('wf-projectlist') // элемент не успевает загрузится в DOM, а после загрузки не срабатывает computed
            let viewportHeight = this.window_height
            // console.log('vh', viewportHeight)
            let header_height = 60 // харкод, после согласования лэйаута файлов заменить на высоту хэдера
            let t_top = table_wrap ? table_wrap.getBoundingClientRect().top : 240 // хардкод для верха таблицы
            if (t_top == 0) { t_top = 240 }
            let result = viewportHeight - t_top - header_height
            this.tableheight = result > 0 ? result : 0
            // console.log(result)
            return result
        },
        isOwner() {
            const owner_id = this.$store.state.administration.company.owner
            const user_id = this.$store.state.administration.user.id

            const is_owner = (owner_id && user_id) ? owner_id == user_id : false
            return is_owner
        },
    },
    methods: {
        checklicense(v){
            return checklicense(v)
        },
        onCreateXml(i){
            console.log('open create xml')
            this.itemCurrent = i
            this.create_xml = true
        },
        onProjectDescription(){
            this.projectDescription = true
        },
        createXml(i){
            console.log('create xml')
        },
        getDate(d){
            let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
            return (new Date(parseInt(d) * 1000)).toLocaleDateString("ru-RU", options)
        },
        isSelected(id){
            if (!this.selected) {
                return false
            }
            return this.selected.id == i.id 
            // let i = this.selected.filter(i => id == i.id) // для многоселектной таблицы
            // return i.length ? true : false
        },
        onProject(i){
            if(!i){
                this.itemCurrent = this.getSelectedProject()
            }
            else{
                this.itemCurrent = i
            }
            this.editProject = true
        },
        getSelectedProject(){
            // if(this.selected.length == 1)
            if(this.selected){
                let item = this.projectList.filter(i => i.id == this.selected.id)[0]
                return item
            }
            else{
                return null
            }
        },
        verifyProject(projectid) {
            // выполняет проверку, записывает результат в localstorage и вызывает getErrorLog()
            this.errors = {json: {}, projectid: ''}

            let item = this.projectList.filter(i => i.id == projectid)[0]
            // console.log(item)

            if (!item) { 
                console.log('Project not found! this.projectList does not contain appropriate ID') 
                return null 
            }
            if (!item.info.template_id) {
                console.log('Project has no template associated with the project!')
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Проекту "' + item.info.name + '" не назначен шаблон для проверки.',
                    message: 'Проекту "' + item.info.name + '" не назначен шаблон для проверки.',
                })
                return null
            }

            // надо подумать, нельзя ли из этой процедуры перезапись errorlog в локальное хранилище убрать на какой-нибудь хук при закрытии окна
            this.$store.dispatch('administration/verifyProjectByTemplate', {templateid: item.info.template_id, projectid: projectid})
            .then(res => {
                let erl = this.errorlog.find(obj => obj.id === projectid)
                if (erl && res !== null) { 
                    erl.errlog = res 
                }
                else if (erl && res !== null) { erl.errlog = {} }
            })
            .then(() => { 
                localStorage.setItem('errorlog', JSON.stringify(this.errorlog)) 
            } )
            .then(() => {
                this.getErrorLog()
                // console.log('after verify results log', this.errorlog)
            })
        },
        getTemplateById(id) {
            if (!id) {return {} }
            if (!this.companytemplates) { return {} }
            let tmplt = this.companytemplates.find(t => t.id === id)

            return tmplt
        },
        getErrorLog() {
            // составляет [] результатов с учетом localStorage('errorlog')

            let errorlog = []
            if (localStorage.getItem('errorlog')) {
                errorlog = JSON.parse(localStorage.getItem('errorlog'))
            }

            // теперь есть массив с объектами типа [{id: projectid, errlog: EL}]
            let result = []
            for (const el of this.projectList) {
                // el - {} о проекте с el.id и el.info

                const logres = errorlog.find(obj => obj.id === el.id)
                if (logres) {
                    result.push(logres)
                }
                else {
                    result.push({ id: el.id, errlog: null }) // не найдена запись, создаем ее с null заполнением
                }
            this.errorlog = result
                // сервис присылает null, если ошибок нет. Мы этот null будем заменять на пустой объект, если проверка выполнена. null в переменной errlog зарезервирован для случая, когда проверка не выполнялась либо данные были удалены. 
            }
        },
        getLogById(projectid) {
            // получает лог ошибок для отображения
            const res = this.errorlog.find(obj => obj.id === projectid)
            if (res) { return res.errlog }
            else { return null }
        },
        getProject: function(i){
            this.$store.commit('workflow/setActiveGroup', false)
            this.$store.commit('workflow/setActiveFolder', false)
            
            this.$router.push('/workflow/' + i.id + '/list')
        },
        removeProject: function(i){
            this.$store.dispatch('workflow/removeProject', {uuid: i.id})
            .then(() => {
                this.$store.dispatch('workflow/getProjects', {
                        type_id: this.type_id,
                        id: this.company_id
                    })
            })
            .then(() => {
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Проект ' + i.info.name + ' удален.',
                    message: 'Проект ' + i.info.name + ' удален.',
                })
            })
        },
        removeProjectSelected: function(){
            let list = this.selected ? [].push(this.selected) : [] // костыль от нежелания переписывать процедуру
            let listPromises = []
            list.map(i => {
                listPromises.push(this.$store.dispatch('workflow/removeProject', {uuid: i.id})
                .then(() => {
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проект ' + i.info.name + ' удален.',
                        message: 'Проект ' + i.info.name + ' удален.',
                    })
                }))
            })
            Promise.all(listPromises)
            .then(() => {
                this.$store.dispatch('workflow/getProjects', {
                        type_id: this.type_id,
                        id: this.company_id
                    })
                this.selected = null // []
            })
        },
        inputFiles(){
            this.$refs['input-files'].click()
        },
        onImportXml(e){
            let files = e.target.files || e.dataTransfer.files
            let item
            for(let x in files){
                if(!isNaN(x)){
                    // let file = {
                    //     id: new Date().getTime(),
                    //     selected: false,
                    //     item: files[x]
                    // }
                    item = files[x]
                }
            }

            let formData = new FormData()
            let uuid = uuidv4()
            formData.append('file', item)
            formData.append('name', item.name)
            // formData.append('project_id', this.project_id)
            formData.append('is_attachment', true)
            formData.append('uuid', uuid)

            this.$store.dispatch('common/setUploadNote', [{
                    name: item.name,
                    uuid: uuid,
                    action: 'upload',
                    pushin: true}]
            )
            .then(() => {
                return this.$store.dispatch('common/importXml', formData)
            })
            .then(res => {
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        this.$store.dispatch('common/checkImportXml', {task_id: res.TaskID})
                        .then(res => {
                            if(res.Status != 1){
                                clearInterval(interval)
                                resolve(res)
                            }
                        })
                    }, 2000)
                })
            })
            .then(res => {
                console.log(res)
                this.$store.dispatch('common/setUploadNote', [{
                        uuid: uuid,
                        action: 'upload',
                        pushin: false}]
                )
            })
            .then(() => {
                this.$store.dispatch('workflow/getProjects', {
                    type_id: this.type_id,
                    id: this.company_id
                })
            })

        },
        handleSelectionChange(val) {
            this.selected = val
        },
        handlePageResize() {
            this.window_height = window.innerHeight
            document.getElementById('wf-projectlist').style['height'] = this.wrapContainerHeight + 'px'
             // forced resize re-calculation, don't remove
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
            const item = 'workflow-list-table'

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
            const item = 'workflow-list-table'
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
        makeTarasGreatAgain() {
            let body = {
                rel: 'company_owner',
                sid: '4',
                stype: 'user',
            }
            this.$store.dispatch('administration/addCompanyPermission', { body: body })
            .then(res => {
                console.log('Taras is great again!', res)
            })
            .catch(er => {
                console.log('no greatness yet', er)
            })
        },
    },
    created(){
        // this.makeTarasGreatAgain()

        this.loading = true
        this.type_id = 'c'
        this.company_id = this.$store.state.administration.company.id
        this.$store.dispatch('administration/getTemplates')
        .then(res => { 
                this.companytemplates = res || []
        })
        this.$store.dispatch('workflow/getProjects', {
            type_id: this.type_id,
            id: this.company_id,
        })
        .then(res => {
            if (res == 'ok') {
                this.loading = false
            }
        })
        .then(() => { 
            this.getErrorLog() 
        })
        window.addEventListener('resize', this.handlePageResize) // костыль для расчета высоты el-table
    },
    mounted() {
        this.loading = true
        this.handlePageResize()
    },
    updated() {
        this.getErrorLog()
    },
    beforeDestroy() {
        localStorage.setItem('errorlog', JSON.stringify(this.errorlog)) 
        window.removeEventListener('resize', this.handlePageResize);
    },
}
</script>

<style lang="scss" scoped>

.toolbar {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding-left: 16px;
    max-height: 56px;
}

.input-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    & .v-text-field {
        padding-top: 0px;
    }
}

#wf-projectlist {
    display: flex;
    flex-direction: column;
    padding-left: 16px;
}


</style>