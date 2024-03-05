<template>
    <v-container pt-0 pb-0 fluid fill-height text-xs-center>
        <v-layout row wrap>
        <v-container fluid px-3 pt-0 pb-0 class="problems-main-wrap">
            
            <!-- титульная страница -->
            <div class="problems-secondary-wrap" v-if="!settings_mode">

                <!-- заголовок -->
                <div class="project-wrapper">
                    <span class="project-title">
                        Проблемы
                    </span>
                </div>

                <!-- кнопка настроек справа от названий вкладки -->
                <div class="tabs-buttons">
                    <div v-show="activeName == 'first'" class="tabs-buttons__wrapper" >
                        <el-dropdown placement="bottom-end" trigger="click" @command="handleCommand">
                            <el-button type="blue-text">
                                <inline-svg :src="require(`@/assets/icons/filter-icon.svg`)"/> 
                                    Настройки
                            </el-button>
                            <el-dropdown-menu class="settings" slot="dropdown">
                                <el-dropdown-item command="types"> Типы </el-dropdown-item>
                                <el-dropdown-item command="custom"> Пользовательские поля </el-dropdown-item>
                                <el-dropdown-item command="permissions"> Разрешения </el-dropdown-item>
                                <el-dropdown-item command="main"> Основные причины </el-dropdown-item>
                                <el-dropdown-item command="templates"> Шаблоны </el-dropdown-item>
                                <el-dropdown-item command="statuses"> Статусы </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </div>

                <!-- диалог редактирования проблемы -->
                <edit-issue
                    :data="drawer_data"
                    :issue="edit_issue"
                    :show="show_right_drawer"
                    @save="updateProblem"
                    @delete="deleteProblem"
                    @cancel="cancelDrawer">
                </edit-issue>

                <!-- содержимое вкладки -->
                <el-tabs v-model="activeName">

                    <!-- вкладка "Проблемы" -->
                    <el-tab-pane label="Проблемы" name="first"> 

                        <!-- обертка -->
                        <div class="problems-main-body">

                            <!-- поиск, кнопки -->
                            <div class="table-header">

                                <!-- левые -->
                                <div class="left">

                                    <!-- кнопка создать проблему -->
                                    <el-button 
                                        type="main" 
                                        class="problem-create-btn" 
                                        @click="handleCreate">
                                        <div>
                                            <i class="el-icon-plus"></i> 
                                            <span> 
                                                Создание проблемы 
                                            </span>
                                        </div>
                                    </el-button>
                                </div>

                                <!-- правые -->
                                <div class="right">

                                    <!--  ввод поиска -->
                                    <div class="input-wrapper">
                                        <v-text-field
                                            v-model="search"
                                            prepend-icon="search"
                                            placeholder="Поиск по имени"
                                            single-line
                                            hide-details
                                            class="m-table-toolbar--search ml-2"
                                        ></v-text-field>
                                    </div>
                                </div>
                            </div>

                            <!-- обертка таблицы -->
                            <div class="table-wrapper">
                                
                                <!-- сама таблица -->
                                <ub-table 
                                    ref="workflow-issues-table"
                                    v-if="computed_problems && computed_problems.length && activeName == 'first'"
                                    :data="computed_problems"
                                    :headers="[
                                        {name: 'name', title: 'имя', width: '340', icon: null, click: null, }, 
                                        {name: 'id', title: 'ИД', width: '100', icon: null, click: null, },
                                        {name: 'status', title: 'статус', width: '200', icon: null, click: null, },
                                        {name: 'type', title: 'тип', width: '200', icon: null, click: null, },
                                        {name: 'user', title: 'назначено пользователю', width: '200', icon: null, click: null, },
                                        {name: 'observers', title: 'наблюдатели', width: '200', icon: null, click: null, },
                                        {name: 'deadline_at', title: 'Срок выполнения', width: '200', icon: null, click: null, },
                                        {name: 'created_at', title: 'Дата начала', width: '200', icon: null, click: null, },
                                        {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
                                    ]"
                                    :savedcolumnwidth="loadColumnWidth()"
                                    @save_columns_width="saveColumnsWidth"
                                    multiselectable>
                                
                                    <!-- title / имя -->
                                    <template v-slot:column1="{ item }">
                                            <el-tooltip 
                                                effect="dark" 
                                                :disabled="!needs_tooltip"
                                                placement="right">
                                                    <template #content>
                                                        {{ item.title }}
                                                    </template>
                                                    <span class="truncate-text" 
                                                        @click="summonDrawer(item)"
                                                        style="cursor: pointer;"
                                                        @mouseover="checkIfNeedsTooltip">
                                                        {{ item.title }}
                                                    </span>
                                            </el-tooltip>   
                                    </template>

                                    <!-- order / порядковый номер проблемы -->
                                    <template v-slot:column2="{ item }">
                                        <el-tooltip 
                                            effect="dark" 
                                            :disabled="!needs_tooltip"
                                            placement="right">
                                                <template #content>
                                                    #{{ item.order }}
                                                </template>
                                                <span class="truncate-text" 
                                                    @mouseover="checkIfNeedsTooltip">
                                                    #{{ item.order }}
                                                </span>
                                        </el-tooltip>
                                    </template>

                                    <!-- status / статус -->
                                    <template v-slot:column3="{ item }">
                                        <div class="issue--status-plate" :style="{ 'background-color': getStatusData(item.sts.base_id).color, 'margin-right': '8px', }"></div>
                                        <el-tooltip 
                                            effect="dark" 
                                            :disabled="!needs_tooltip"
                                            placement="right">
                                                <template #content>
                                                    {{ item.sts.title }}
                                                </template>
                                                    <span class="truncate-text" 
                                                        @mouseover="checkIfNeedsTooltip"> 
                                                        {{ item.sts.title }} 
                                                    </span>
                                        </el-tooltip>
                                    </template>

                                    <!-- type / тип проблемы -->
                                    <template v-slot:column4="{ item }">
                                        <div 
                                            class="problem-category-mark-28" 
                                            style="margin-right: 8px;"
                                            :style="{ 
                                                'background-color': getStatusData(item.sts.base_id).color, 
                                                'color': getStatusData(item.sts.base_id).textcolor, 
                                            }">
                                            <span v-if="item.cat.types[0].mark">
                                                {{ item.cat.types[0].mark }}
                                            </span>
                                            <i v-else class="el-icon-check" style="font-size: 20px;"/>
                                        </div>
                                        <el-tooltip 
                                            effect="dark" 
                                            :disabled="!needs_tooltip"
                                            placement="right">
                                                <template #content>
                                                    {{ item.cat.types[0].title }}
                                                </template>
                                                    <span class="truncate-text" 
                                                        @mouseover="checkIfNeedsTooltip"> 
                                                        {{ item.cat.types[0].title }} 
                                                    </span>
                                        </el-tooltip>
                                    </template>

                                    <!-- user / пользователь -->
                                    <template v-slot:column5="{ item }">
                                        <el-tooltip 
                                            effect="dark" 
                                            :disabled="!needs_tooltip"
                                            placement="right">
                                                <template #content>
                                                    {{ getUser(item.user) }}
                                                </template>
                                                    <span class="truncate-text" 
                                                        @mouseover="checkIfNeedsTooltip"> 
                                                        {{ getUser(item.user) }}
                                                    </span>
                                        </el-tooltip>
                                    </template>

                                    <!-- observers / налюдатели -->
                                    <template v-slot:column6="{ item }">
                                        <el-tooltip 
                                            effect="dark" 
                                            :disabled="!needs_tooltip"
                                            placement="right">
                                                <template #content>
                                                    <span v-for="user in item.observers">
                                                        {{ getUser(user) }}&nbsp;
                                                    </span>
                                                </template>
                                                    <span class="truncate-text" 
                                                        @mouseover="checkIfNeedsTooltip"> 
                                                        <template v-for="user in item.observers">
                                                            {{ getUser(user) }}&nbsp;
                                                        </template>
                                                        <span v-if="!(item.observers && item.observers.length)"> -- </span>
                                                    </span>
                                        </el-tooltip>
                                    </template>

                                    <!-- deadline_at / дедлайн -->
                                    <template v-slot:column7="{ item }">
                                        <el-tooltip 
                                            effect="dark" 
                                            :disabled="!needs_tooltip"
                                            placement="right">
                                                <template #content>
                                                    {{ getDate(item.deadline_at) }}
                                                </template>
                                                    <span class="truncate-text" 
                                                        @mouseover="checkIfNeedsTooltip"> 
                                                        {{ getDate(item.deadline_at) }}
                                                    </span>
                                        </el-tooltip>
                                    </template>

                                    <!-- created_at / дата начала -->
                                    <template v-slot:column8="{ item }">
                                        <el-tooltip 
                                            effect="dark" 
                                            :disabled="!needs_tooltip"
                                            placement="right">
                                                <template #content>
                                                    {{ getDate(item.created_at) }}
                                                </template>
                                                    <span class="truncate-text" 
                                                        @mouseover="checkIfNeedsTooltip"> 
                                                        {{ getDate(item.created_at) }}
                                                    </span>
                                        </el-tooltip>
                                    </template>

                                    <template v-slot:column11="{ item }">
                                       <!-- Последняя колонка должна присутствовать для правильного отображения ширины -->
                                    </template>
                                
                                </ub-table>

                                <!-- заглушка при отсутствии проблем -->
                                <div v-if="!(computed_problems && computed_problems.length)" class="huston-we-got-no-problem">
                                    <inline-svg :src="require(`@/assets/images/problem_empty.svg`)"></inline-svg>
                                    <span class="no-problem-h1">
                                        В этом проекте проблемы отсутствуют
                                    </span>
                                    <span class="no-problem-h2">
                                        Здесь будут отображаться все проблемы, созданные для этого проекта. Создайте новые проблемы на этой странице или непосредственно на листе либо в модели.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Создание новой проблемы -->
                        <new-issue-dialogue
                            v-if="showdialogue"
                            :showdialogue="showdialogue"
                            :data="dialogue_data"
                            :issue="dialogue_problem"
                            @cancel="toggleDialogOff"
                            @create_issue="createIssue"
                        />

                    </el-tab-pane>
                </el-tabs>
            </div>

            <div class="problems-secondary-wrap" v-if="settings_mode">

                <div class="project-wrapper">
                    <span class="project-title">
                        Настройки
                    </span>
                    <span class="overhead-link">
                        <span class="m-text--hover" @click="goToProblems"> 
                            Проблемы 
                        </span> 
                        <i class="el-icon-arrow-right"></i>
                    </span>
                </div>


                <!-- диалог редактирования категорий -->
                <edit-category
                    :category="edit_category"
                    :show="show_edit_category_dialog"
                    @save="changeCategory"
                    @delete="deleteCategory"
                    @cancel="cancelEditCategory">
                </edit-category>

                <!-- диалог редактирования типов -->
                <edit-type
                    :type="edit_type"
                    :show="show_edit_type_dialog"
                    :data="{ categories: categories }"
                    @save="changeType"
                    @delete="deleteType"
                    @cancel="cancelEditType">
                </edit-type>

                <!-- диалог редактирования статуса -->
                <edit-status
                    :status="edit_status"
                    :show="show_edit_status_dialog"
                    :data="{ statuses: statuses }"
                    @save="changeStatus"
                    @cancel="cancelEditStatus">
                </edit-status>

                <!-- диалог редактирования причины -->
                <edit-reason
                    :reason="edit_reason"
                    :show="show_edit_reason_dialog"
                    :data="{ reasons: reasons }"
                    @save="changeReason"
                    @delete="deleteReason"
                    @cancel="cancelEditReason">
                </edit-reason>

                <!-- диалог редактирования типа причины -->
                <edit-reason-type
                    :reason_type="edit_reason_type"
                    :show="show_edit_reason_type_dialog"
                    :data="{ reasons: reasons }"
                    @save="changeReasonType"
                    @delete="deleteReasonType"
                    @cancel="cancelEditReasonType">
                </edit-reason-type>


                <!-- диалог редактирования поля -->
                <edit-field
                    :field="edit_field"
                    :parent="edit_field_parent"
                    :show="show_edit_field_dialog"
                    :data="{ 
                        problems: problems,
                        categories: categories,
                        }"
                    @save="changeField"
                    @delete="deleteField"
                    @cancel="cancelEditField">
                </edit-field>


                <!-- основные вкладки -->
                <el-tabs v-model="activeName">

                    <!-- вкладка "типы" - types -->
                    <el-tab-pane label="Типы" name="types"> 
                        <settings-types
                            v-if="activeName == 'types'"
                            :data="{ categories: categories, }"
                            :project="project"
                            @set_edit_category="setEditCategory"
                            @set_edit_type="setEditType"
                            @update_cats="getCategoriesForCurrentProject">
                        </settings-types>
                    </el-tab-pane>


                    <!-- пользовательские поля custom -->
                    <el-tab-pane label="Пользовательские поля" name="custom"> 
                        <settings-fields 
                            v-if="activeName == 'custom'"
                            :data="{ 
                                problems: problems,
                                categories: categories, 
                                }"
                            :project="project"
                            @set_edit_field="setEditField"
                            @update_fields="getCategoriesForCurrentProject">
                        </settings-fields>
                    </el-tab-pane>



                    <!-- разрешения permissions -->
                    <el-tab-pane label="Разрешения" name="permissions"> 

                        <div class="problems-main-body">

                            <div class="table-header">
                            </div>

                            <div class="table-wrapper">
                                <ub-table v-if="false"/>
                                
                                <div class="temp-wrapper" style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
                                    <div class="m-dummy--wrap mb-5">
                                        <img
                                            width="100%"
                                            src="@/assets/images/in_work.svg"/>
                                    </div>
                                    <div class="m-dummy--title"> Раздел "Разрешения" в разработке </div>
                                    <div class="m-dummy--desc"> Мы скоро завершим работы! </div>
                                </div>
                            </div>
                        </div>

                    </el-tab-pane>


                    <!-- основные причины main -->
                    <el-tab-pane label="Основные причины" name="main"> 
                        <settings-reasons
                            v-if="activeName == 'main'"
                            :data="{ reasons: reasons, }"
                            :project="project"
                            @update_reasons="getReasonsForCurrentProject"
                            @set_edit_reason="setEditReason"
                            @set_edit_reasontype="setEditReasonType">
                        </settings-reasons>
                    </el-tab-pane>


                    <!-- шаблоны templates -->
                    <!-- <el-tab-pane label="Шаблоны" name="templates"> 
                        <settings-templates
                            v-if="activeName == 'templates'"
                            :data="{ templates: templates, }"
                            :project="project">
                        </settings-templates>
                    </el-tab-pane> -->


                    <!-- вкладка статусы / statuses -->
                    <el-tab-pane label="Статусы" name="statuses"> 
                        <settings-status
                            v-if="activeName == 'statuses'"
                            :data="{ statuses: statuses, }"
                            :base_pool="base_status_pool"
                            :project="project"
                            @set_edit_status="setEditStatus">
                        </settings-status>
                    </el-tab-pane>

                </el-tabs>

            </div>

        </v-container>
        </v-layout>
    </v-container>
</template>


<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"
import newIssueDialogue from "./workflow_problems/newIssueDialogue.vue"
import EditIssue from './workflow_problems/EditIssue'
import settingsTypes from "./workflow_problems/IssueSettingTabs/settingsTypes.vue"
import settingsReasons from "./workflow_problems/IssueSettingTabs/settingsReasons.vue"
import settingsStatus from "./workflow_problems/IssueSettingTabs/settingsStatus.vue"
import settingsTemplates from "./workflow_problems/IssueSettingTabs/settingsTemplates.vue"
import settingsFields from "./workflow_problems/IssueSettingTabs/settingsFields.vue"

import editCategory from "./workflow_problems/IssueSettingTabs/settingsType/editCategory.vue"
import editType from "./workflow_problems/IssueSettingTabs/settingsType/editType.vue"
import editStatus from "./workflow_problems/IssueSettingTabs/settingsStatus/editStatus.vue"
import editReason from "./workflow_problems/IssueSettingTabs/settingsReasons/editReason.vue"
import editReasonType from "./workflow_problems/IssueSettingTabs/settingsReasons/editReasonType.vue"
import editField from "./workflow_problems/IssueSettingTabs/settingsFields/editField.vue"


export default {
    name: 'WorkflowIssues',
    components: {
        InlineSvg,
        
        ubTable,
        EditIssue,
        newIssueDialogue,

        settingsTypes,
        settingsReasons,
        settingsStatus,
        settingsTemplates,
        settingsFields,

        editCategory,
        editType,
        editStatus,
        editReason,
        editReasonType,
        editField,

    },
    data() {
        return {
            activeName: 'first',
            settings_mode: false, // переключатель страница / настройки

            table_data: [], // данные для таблицы; пока одни на все вкладки, возможно, это ошибка

            search: '', // строка поиска; одна на все таблицы -- переделать, внутренности вкладок будут отдельными

            showdialogue: false, // диалог создания проблемы -- переделать, диалоги будут на своих вкладках
            dialogue_data: {},
            dialogue_problem: null,

            main_data: {},

            loading: false, // TODO: доделать загрузку с лоадером

            problems: null, // поля и данные для проблем
            categories: null,
            statuses: null,
            custom_fields: null,
            templates: null,
            reasons: null,

            needs_tooltip: false, // техническое поле под тултипы ячеек таблицы

            show_right_drawer: false, // правый шкаф под отображение проблем
            drawer_data: {},
            edit_issue: null,

            show_edit_category_dialog: false,
            edit_category: null,

            show_edit_type_dialog: false,
            edit_type: null,

            show_edit_status_dialog: false,
            edit_status: null,

            show_edit_reason_dialog: false,
            edit_reason: null,

            show_edit_reason_type_dialog: false,
            edit_reason_type: null,

            show_edit_field_dialog: false,
            edit_field_parent: null,
            edit_field: null,
        }
    },
    watch: {
        '$route'(to, from) {
            this.loading = true
        },
        'activeName'() {
            this.cancelEditCategory()
            this.cancelEditStatus()
            this.cancelEditType()
            this.cancelEditReason() 
            this.cancelEditField()
        },
    },
    methods: {
        /////////////////// category && type edit ///////////////////
        setEditCategory(cat) {
            console.log('editing cat', cat)
            this.edit_category = cat
            this.show_edit_category_dialog = true
        },
        async changeCategory(cat) {
            // console.log('must change category on cloud', cat)

            let erzatz = this.categories.find(obj => obj.id == cat.id)
            let types_to_delete = [] 

            // сравнить эрзатц-список с текущим списком типов, лишние типы удалить
            if (erzatz.types) {
                types_to_delete = erzatz.types.filter(obj => {
                    let res = cat.types.find(el => el.id == obj.id)
                    return !res ? obj : false
                })
                console.log('types_to_delete', types_to_delete)
                for (const type of types_to_delete) {
                    let res = await this.$store.dispatch('workflow/deleteType', { project_id: this.project.id, type_id: type.id, })
                    // console.log('res11', res)
                }
            }

            // добавить не имеющие id и обновить имеющие
            if (cat.types && cat.types.length) {
                for (let elem of cat.types) {
                    if (!elem.id) {
                        let res = await this.$store.dispatch('workflow/createType', { project_id: this.project.id, body: elem, })
                        elem.id = res.id
                    }
                    else {
                        let res = await this.$store.dispatch('workflow/updateType', { project_id: this.project.id, body: elem, })
                    }
                }
            }

            // обновить поля категории
            this.$store.dispatch('workflow/updateCategory', { project_id: this.project.id, body: cat, })
            .then( () => {
                this.cancelEditCategory()
                this.getCategoriesForCurrentProject() 
            })
            .catch( res => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось обновить данные категории.',
                        message: 'Не удалось обновить данные категории.',
                })
            })
        },
        deleteCategory(cat) {
            // console.log('must delete category from cloud')
            this.$store.dispatch('workflow/deleteCategory', { project_id: this.project.id, cat_id: cat.id, })
            .then(() => {
                this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проблема ' + cat.title + ' успешно удалена.',
                        message: 'Проблема ' + cat.title + ' успешно удалена.',
                })
                this.getCategoriesForCurrentProject()
            })
            .catch(() => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось удалить проблему.',
                        message: 'Не удалось удалить проблему.',
                })
            })
            this.show_edit_category_dialog = false
            this.edit_category = null

        },
        cancelEditCategory() {
            this.show_edit_category_dialog = false
            this.edit_category = null
        },
        setEditType(type) {
            console.log('editing type', type)
            this.edit_type = type
            this.show_edit_type_dialog = true
        },
        async changeType(type) {
            console.log('changing type', type)

            let erzatz = this.categories.find(obj => obj.id == type.cat_id)
            if (!erzatz) {
                alert('Не удалось найти родительскую категорию')
            }

            erzatz = erzatz && erzatz.types ? erzatz.types.find(obj => obj.id == type.id) : null
            if (!erzatz) {
                alert('Не удалось найти тип')
            }

            let fields = erzatz && erzatz.fields ? erzatz.fields : []
            let fields_to_delete = [] 

            if (fields) { // удалить убранные поля из типа
                fields_to_delete = fields.filter(obj => {
                    let res = type.fields.find(el => el.id == obj.id)
                    return !res ? obj : false
                })
                for (const field of fields_to_delete) {
                    let res = await this.$store.dispatch('workflow/deleteTypeField', { project_id: this.project.id, type_id: field.id, })
                }
            }
            if (type.fields && type.fields.length) { // добавить не имеющие id поля (добавленные) в тип 
                for (let elem of type.fields) {
                    if (!elem.id) {
                        let res = await this.$store.dispatch('workflow/createTypeField', { project_id: this.project.id, type_id: type.id, body: elem, })
                        elem.id = res.id
                    }
                }
            }

            this.$store.dispatch('workflow/updateType', { project_id: this.project.id, body: type, })
            .then(() => {
                this.cancelEditType()
                this.getCategoriesForCurrentProject() 
            })
            .catch( res => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось обновить данные типа.',
                        message: 'Не удалось обновить данные типа.',
                })
            })
        },
        deleteType(type){
            console.log('delete type')
            this.$store.dispatch('workflow/deleteType', { project_id: this.project.id, type_id: type.id, })
            .then(() => {
                this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Тип' + type.title +' успешно удален.',
                        message: 'Тип' + type.title +' успешно удален.',
                })
                this.getCategoriesForCurrentProject() 
            })
            .catch(() => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось удалить тип.',
                        message: 'Не удалось удалить тип.',
                })
            })
            this.show_edit_type_dialog = false
            this.edit_type = null
        },
        cancelEditType() {
            this.show_edit_type_dialog = false
            this.edit_type = null
        },

        /////////////////// status edit ///////////////////
        setEditStatus(status) {
            this.edit_status = status
            this.show_edit_status_dialog = true
        },
        changeStatus(s) {
            let sts = s.status
            let new_data = s.data 

            sts.act_sts = new_data.act_sts
            delete sts.base_id
            this.$store.dispatch('workflow/updateStatus', { project_id: this.project.id, body: sts })
            .then( () => {
                this.getStatusPoolForCurrentProject()
            })
            .catch(() => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось изменить статус.',
                    message: 'Не удалось изменить статус.',
                })
                this.getStatusPoolForCurrentProject()
            })
        },
        cancelEditStatus() {    
            this.show_edit_status_dialog = false
            this.edit_status = null
        },

        /////////////////// reason edit ///////////////////
        setEditReason(reason) {
            this.edit_reason = reason
            this.show_edit_reason_dialog = true
        },
        async changeReason(reason) {
            console.log('changing reason', reason)

            let erzatz = this.reasons.find(obj => obj.id == reason.id)
            let types_to_delete = [] 

            // сравнить эрзатц-список с текущим списком типов, лишние типы удалить
            if (erzatz.types) {
                types_to_delete = erzatz.types.filter(obj => {
                    let res = reason.types.find(el => el.id == obj.id)
                    return !res ? obj : false
                })
                // console.log('types_to_delete', types_to_delete)
                for (const type of types_to_delete) {
                    let res = await this.$store.dispatch('workflow/deleteReasonType', { project_id: this.project.id, type_id: type.id, })
                }
            }
            // добавить не имеющие id
            if (reason.types && reason.types.length) {
                for (let elem of reason.types) {
                    if (!elem.id) {
                        let res = await this.$store.dispatch('workflow/createReasonType', { project_id: this.project.id, body: elem, })
                        elem.id = res.id
                    }
                    else {
                        let res = await this.$store.dispatch('workflow/updateReasonType', { project_id: this.project.id, body: elem, })
                    }
                }
                
            }

            // обновить поля причины
            this.$store.dispatch('workflow/updateReason', { project_id: this.project.id, body: reason, })
            .then( () => {
                this.cancelEditReason()
                this.getReasonsForCurrentProject() 
            })
            .catch( res => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось обновить данные причины.',
                        message: 'Не удалось обновить данные причины.',
                })
            })
        },
        deleteReason(reason) {
            this.$store.dispatch('workflow/deleteReason', { project_id: this.project.id, cat_id: reason.id, })
            .then(() => {
                this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Причина ' + reason.title + ' успешно удалена.',
                        message: 'Причина ' + reason.title + ' успешно удалена.',
                })
                this.getReasonsForCurrentProject()
            })
            .catch(() => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось удалить причину.',
                        message: 'Не удалось удалить причину.',
                })
            })
            this.show_edit_reason_dialog = false
            this.edit_reason = null
        },
        cancelEditReason() {
            this.show_edit_reason_dialog = false
            this.edit_reason = null
        },
        setEditReasonType(reason_type) {
            this.edit_reason_type = reason_type
            this.show_edit_reason_type_dialog = true
        },
        async changeReasonType(reason_type) {
            console.log('changing reason type', reason_type)

            let erzatz = this.reasons.find(obj => obj.id == reason_type.cat_id)
            if (!erzatz) {
                alert('Не удалось найти родительскую причину')
            }

            erzatz = erzatz && erzatz.types ? erzatz.types.find(obj => obj.id == reason_type.id) : null
            if (!erzatz) {
                alert('Не удалось найти тип')
            }

            this.$store.dispatch('workflow/updateReasonType', { project_id: this.project.id, body: reason_type, })
            .then(() => {
                this.cancelEditReasonType()
                this.getReasonsForCurrentProject() 
            })
            .catch( res => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось обновить данные типа.',
                        message: 'Не удалось обновить данные типа.',
                })
            })
        },
        deleteReasonType(reason_type) {
            console.log('deleting reason type', reason_type)

            this.$store.dispatch('workflow/deleteReasonType', { project_id: this.project.id, type_id: reason_type.id, })
            .then(() => {
                this.cancelEditReasonType()
                this.getReasonsForCurrentProject() 
            })
            .catch( res => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось удалить тип.',
                        message: 'Не удалось удалить тип.',
                })
            })
        },
        cancelEditReasonType() {
            this.show_edit_reason_type_dialog = false
            this.edit_reason_type = null
        },

        /////////////////// field edit ///////////////////
        setEditField(field_data) {
            // в parent передается type_id
            // console.log('field data', field_data)
            this.edit_field = field_data.field
            this.edit_field_parent =  field_data.parent // parent id
            this.show_edit_field_dialog = true
        },
        cancelEditField() {
            this.show_edit_field_dialog = false
            this.edit_field = null
            this.edit_field_parent = null
        },
        async changeField(field) {
            // только для полей типов
            let source = field
            let new_field = {}

            console.log('field s', field)

            let value = {
                type: getType(source.value.type),
                value: source.value.value
            }
            source.value = value

            // function makeListFromObject(obj) {
            //     return [obj.value ? obj.value : '', ...obj.list]
            // }

            function getType(type) {
                // см. список типов полей от Димы, e.g. в ubFieldForm -> getFieldType(type)
                switch(type) {
                    case 'list': {
                        return 3
                    }
                    case 'string': {
                        return 1
                    }
                    case 'number': {
                        return 8
                    }
                    default: {
                        return 1
                    }
                }
            }
            
            // console.log('constructed field', new_field)
            this.$store.dispatch('workflow/updateTypeField', { project_id: this.project.id, type_id: source.type_id, body: source, })
            .then(res => {
                this.cancelEditField()
                this.getCategoriesForCurrentProject()
            })
            .catch( res => {
                this.cancelEditField()
                console.log('error create reason', res)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось изменить поле.',
                    message: 'Не удалось изменить поле.',
                })
            })
        },
        deleteField(field) {
            // console.log('deleting field', field)
            this.$store.dispatch('workflow/deleteTypeField', { project_id: this.project.id, field_id: field.id })
            .then(res => {
                this.cancelEditField()
                this.getCategoriesForCurrentProject()
            })
            .catch( res => {
                this.cancelEditField()
                console.log('error create reason', res)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось удалить поле.',
                    message: 'Не удалось удалить поле.',
                })
            })
        },

        /////////////////// setting page functions ///////////////////
        toggleSettings() {
            this.settings_mode = !this.settings_mode
        },
        handleCommand(command) {
            switch(command) {
                case 'types': 
                case 'custom':
                case 'permissions':
                case 'main':
                case 'templates':
                case 'statuses':
                {
                    // console.log('got command', command)
                    this.settings_mode = true
                    this.activeName = command
                    break
                }
                default: {
                    console.log(`command ${command} has typo or not defined`)
                }
            }
        },
        handleCreate() {
            // Помещает данные, о проекте необходимые для работы формы, в dialogue_data и открывает диалог
            this.showdialogue = true
            // this.show_right_drawer = true
            this.dialogue_data = {
                categories: this.computed_categories, // данные о проекте
                statuses: this.computed_statuses,
                templates: this.computed_templates,
                reasons: this.computed_reasons,
                base_status_pool: this.base_status_pool, // цвета, связанные с base_id статусов
                id: null, // id проблемы, по которому ее будет идентифицировать процедура сохранения
            }
        },
        toggleDialogOff() {
            this.showdialogue = false
            this.dialogue_data = {}
        },
        // setTableData(pane_name) {

        //     switch(pane_name) {
        //         case 'first': {
        //             //set main page data
        //             break
        //         }
        //         case 'types': {
        //             // types table
        //             break
        //         }
        //         case 'custom': {
        //             // etc.
        //             break
        //         }
        //         case 'permissions': {
        //             break
        //         }
        //         case 'main': {
        //             break
        //         }
        //         case 'templates': {
        //             break
        //         }
        //         case 'statuses': {
        //             break
        //         }
        //         default: {
        //             console.log('no data for the table')
        //             this.table_data = []
        //         }
        //     }
        // },
        goToProblems() {
            this.toggleSettings()
            this.activeName = 'first'
            this.search = ''
            // this.setTableData('first')
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
        getStatusData(status) {
            // должен возвращать {title, color, textcolor}
            return this.base_status_pool[status] || {title: 'errtitle', color: 'orange', textcolor: 'black', }
        },
        getDate(d){
            if (!d) {
                return '--'
            }
            let options = {year: 'numeric', month: 'short', day: '2-digit'}
            return (new Date(d)).toLocaleDateString("ru-RU", options)
        },
        createIssue(problemdata) {
            // создает проблему и отсылает ее на сервис
            this.loading = true

            const v = problemdata.data
            
            console.log('creating problem', v)

            let problem = {}

            let status = JSON.parse(JSON.stringify(this.computed_statuses.find(obj => obj.id == v.sts.id)))
            let category = JSON.parse(JSON.stringify(this.computed_categories.find(obj => obj.id == v.type.cat_id))) // категория типа
            let type = JSON.parse(JSON.stringify(v.type))
            let reason_category = JSON.parse(JSON.stringify(this.computed_reasons.find(obj => obj.id == v.reason_type.cat_id)))
            let reason_type = JSON.parse(JSON.stringify(v.reason_type))

            type.base_id = type.id; delete type.id;
            reason_type.base_id = reason_type.id; delete reason_type.id;
             
            const project_id = this.project.id
            const creator = this.$store.state.administration.user.id // id текущего пользователя в компании
            // const template = null // пока отключено

            if (!(category && type && creator)) {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Произошла внутренняя ошибка при создании проблемы.',
                        message: 'Произошла внутренняя ошибка при создании проблемы.',
                })
                return null
            }

            function makeListFromObject(obj) {
                return [obj.value ? obj.value : '', ...obj.list]
            }

            let corrected_fields = []
            for (let item of v.fields) {
                item.base_id = item.id; delete item.id
                if ([3,9,11].includes(item.value.type)) {
                    // номера типов, соотствующие спискам, см. в getFieldType - это поля с типом 'xyzArray'
                    // кроме 7 - список под ссылку
                    item.value.value = makeListFromObject(item.value.value)
                }
                corrected_fields.push(item)
            }
            
            problem.title = v.title 
            problem.sts = {
                act_sts: true, 
                base_id: status.id, 
                prj_id: project_id,
                dscr: v.sts.dscr,
                title: v.sts.title
            },
            problem.cat = {
                act_sts: true,
                base_id: category.id, 
                prj_id: project_id,
                title: category.title,
                types: [type],
            },
            problem.reason = {
                act_sts: true,
                base_id: reason_category.id,
                prj_id: project_id,
                title: reason_category.title,
                types: [reason_type],
            },

            problem.fields = corrected_fields

            problem.dscr = v.dscr || ''
            problem.owner = creator 
            problem.user = v.user || null
            problem.observers = v.observers
            problem.created_at = v.created_at || null
            problem.deadline_at = v.deadline_at || null
            this.$store.dispatch('workflow/createProblem', { uuid: project_id, body: problem, })
            .then( res =>  {
                // заполняем порядок полей и обновляем проблему
                // console.log('got res, res', res)
                if (res.fields && res.fields.length) {
                    let fields_order = res.fields.map(x => x.id)
                    res.fields_order = fields_order
                    this.$store.dispatch('workflow/updateProblem', { uuid: project_id, body: res, })
                    .then(res => {
                        // console.log('updated with fields', res)
                        this.$notify({
                            group: 'note',
                            type: 'success',
                            text: 'Проблема "' + problem.title + '" успешно создана.',
                            message: 'Проблема "' + problem.title + '" успешно создана.',
                        })
                        this.toggleDialogOff()
                        this.getProblemsForCurrentProject()
                    })
                }
            })
            .catch( err => {
                console.log('error', err )
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Произошла ошибка при создании проблемы со стороны сервиса.',
                        message: 'Произошла ошибка при создании проблемы со стороны сервиса.',
                })
                this.toggleDialogOff()
            } )
            .finally(() => {
                this.loading = false
            })
        },
        summonDrawer(problem) {
            this.drawer_data = {
                categories: this.computed_categories, // данные о проекте
                statuses: this.computed_statuses,
                reasons: this.computed_reasons,
                templates: this.computed_templates,
                base_status_pool: this.base_status_pool,
                id: problem.id, // id проблемы, по которому ее будет идентифицировать процедура сохранения
            }
            this.edit_issue = problem
            this.show_right_drawer = true
        },
        cancelDrawer() {
            console.log('drawer is canceled')
            this.drawer_data = {}
            this.show_right_drawer = false
        },
        updateProblem(problem) {
            // сохраняет проблему после редактирования в правом дравере
            const project_id = this.project.id
            this.show_right_drawer = false

            this.$store.dispatch('workflow/updateProblem', { uuid: project_id, body: problem, })
            .then( res =>  {
                console.log('success', res )
                this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проблема "' + problem.title + '" успешно изменена.',
                        message: 'Проблема "' + problem.title + '" успешно изменена.',
                })
                this.getProblemsForCurrentProject()
            })
            .catch( err => {
                console.log('error', err )
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Произошла ошибка при редактировании проблемы со стороны сервиса.',
                        message: 'Произошла ошибка при редактировании проблемы со стороны сервиса.',
                })
                this.toggleDialogOff()
            } )
        },
        deleteProblem(problem) {
            if (!problem && !problem.id) {
                return null
            }
            const project_uuid =  this.$route.params.id
            this.$store.dispatch('workflow/removeProblem', { uuid: project_uuid, problem_id: problem.id })
            .then( res => {
                this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проблема "' + problem.title + '" успешно удалена.' ,
                        message: 'Проблема "' + problem.title + '" успешно удалена.',
                })
                this.show_right_drawer = false
            })
            .then( () => {
                        this.getProblemsForCurrentProject()
                    }
            )
            .catch( err => {
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'При удалении проблемы "' + problem.title + '" произошла ошибка.' ,
                        message: 'При удалении проблемы "' + problem.title + '" произошла ошибка.' ,
                    })}
            )
        },
        getAllProblemData() {
            const project_uuid =  this.$route.params.id
            if (!project_uuid) {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удается определить текущий проект.' ,
                        message: 'Не удается определить текущий проект.' ,
                })
                return null
            }
            Promise.all([
                this.$store.dispatch('workflow/getProblems', project_uuid).then(res => { 
                    this.problems = res; 
                    console.log('got problems', res) 
                }),
                this.$store.dispatch('workflow/getProblemStatuses', project_uuid).then(res => { 
                    this.statuses = res; 
                    console.log('statuses', res) 
                }),
                this.$store.dispatch('workflow/getProblemCategories', project_uuid).then(res => { 
                    this.categories = res; 
                    console.log('got categories', res) 
                }),
                this.$store.dispatch('workflow/getProblemTemplates', project_uuid).then(res => { 
                    this.templates = res 
                }),
                this.$store.dispatch('workflow/getProblemReasons', project_uuid).then(res => { 
                    this.reasons = res; 
                    console.log('got reasons', res) 
                }),
            ])
            .catch( err => {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Произошла ошибка при загрузке данных о проблемах, ассоциированных с проектом.' ,
                        message: 'Произошла ошибка при загрузке данных о проблемах, ассоциированных с проектом.' ,
                })
                console.log('error', err)
            })
                
        },
        getProblemsForCurrentProject() {
            const project_uuid =  this.$route.params.id
            if (project_uuid) {
                this.$store.dispatch('workflow/getProblems', project_uuid)
                .then( res => {
                    this.problems = res
                    console.log('got problems', res)
                })
                .catch( err => {
                    console.log('error', err)
                })
            }
        },
        getStatusPoolForCurrentProject() {
            const project_uuid =  this.$route.params.id
            if (project_uuid) {
                this.$store.dispatch('workflow/getProblemStatuses', project_uuid)
                .then( res => {
                    this.statuses = res
                    console.log('got statuses', res)
                })
                .catch( err => {
                    console.log('error', err)
                })
            }   
        },
        getCategoriesForCurrentProject() {
            const project_uuid =  this.$route.params.id
            if (project_uuid) {
                this.$store.dispatch('workflow/getProblemCategories', project_uuid)
                .then( res => {
                    this.categories = res
                    console.log('got categories', res)
                })
                .catch( err => {
                    console.log('error', err)
                })
            }
        },
        getTemplatesForCurrentProject() {
            const project_uuid =  this.$route.params.id
            if (project_uuid) {
                this.$store.dispatch('workflow/getProblemTemplates', project_uuid)
                .then( res => {
                    this.templates = res
                    console.log('got templates', res)
                })
                .catch( err => {
                    console.log('error', err)
                })
            }
        },
        getReasonsForCurrentProject() {
            const project_uuid =  this.$route.params.id
            if (project_uuid) {
                this.$store.dispatch('workflow/getProblemReasons', project_uuid)
                .then( res => {
                    this.reasons = res
                    // console.log('got reasons', res)
                })
                .catch( err => {
                    console.log('error', err)
                })
            }
        },
        getUser(id) {
            if (!this.managers) {
                return ''
            }
            if (!id) {
                return '--'
            }
            let manager = this.managers.find(obj => obj.id == id)
            return manager ? manager.name : 'Неизвестный пользователь'
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-issues-table'

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
            const item = 'workflow-issues-table'
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
// computed
    computed: {
        project() {
            if (!this.$route || !this.$route.params) {
                return null
            }
            let workflow = this.$store.state.workflow
            let project = workflow.projects.filter(i => i.id == this.$route.params.id)
            return project[0] || null
        },
        computed_problems() {
            let res = this.problems
            return res
        },
        computed_categories() {
            let res = this.categories
            res = res.filter(obj => obj.act_sts == true)
            return res
        },
        computed_statuses() {
            let res = this.statuses
            res = res.filter(obj => obj.act_sts == true)
            // console.log('com sts', res)
            return res
        },
        computed_templates() {
            let res = this.templates
            res = res.filter(obj => obj.act_sts == true)
            return res
        },
        computed_reasons() {
            let res = this.reasons
            res = res.filter(obj => obj.act_sts == true)
            return res
        },

        base_status_pool() {
            return {
                1: { title: 'Черновик', color: '#3c3c3c', textcolor: 'white', },
                2: { title: 'Открыто', color: '#faa21b', textcolor: 'black', },
                3: { title: 'На рассмотрении', color: '#0696d7', textcolor: 'white', },
                4: { title: 'Выполняется', color: '#a3bcdc', textcolor: 'white', },
                5: { title: 'Завершено', color: '#b7d78c', textcolor: 'white', },
                6: { title: 'Проверка', color: '#a76ef5', textcolor: 'white', },
                7: { title: 'Не утверждено', color: '#ec4a41', textcolor: 'white', },
                8: { title: 'Обсуждается', color: '#ec4a41', textcolor: 'white', },
                9: { title: 'Закрыто', color: '#dcdcdc', textcolor: 'black', },
            }
        },
        managers(){
            let users = this.$store.state.administration.company.users || []
            let list = users.map(u => ({
                value: u.id,
                id: u.id,
                avatar: u.avatarSrc,
                name: u.first_name + ' ' + u.last_name,
                role: ''
            }))
            return list
        },
        
    },
    mounted() {
        this.getAllProblemData()
        this.getProblemsForCurrentProject()
    
    },
    updated() {
    },
}
 
</script>

<style lang="scss" scoped>
.problems-main-wrap {
  --hover-active-blue: rgb(6, 150, 215);
  --white-background: #ffffff;
  --common-text-color: #666666;
  --hover-background-color: #f6f6f6;
}

.problems-secondary-wrap {
    height: 100%;
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
    transform: translateY(-3px); // костыль, помещает кнопки на один уровень с нужным элементом визуально
    z-index: 1;
    padding: 16px;
  }
}

.problems-main-body {
    display: flex; 
    flex-direction: column; 
    padding: 0; 
    height: 100%;
}

.table-wrapper {
    height: calc(100% - 164px);
    padding: 0px 16px;
}

.huston-we-got-no-problem {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    padding: 60px 12px;
    height: 100%;

    & .no-problem-h1 {
        font-family: "Artifakt Element", sans-serif;
        font-size: 18px;
        line-height: 1.6;
    }
    & .no-problem-h2 {
        font-family: "Artifakt Element", sans-serif;
        font-size: 14px;
        line-height: 1.6;
        text-align: center;
    }
}


.settings {
    &.el-popper.el-dropdown-menu {
        transform: translateY(16px); // костыль, помещает кнопки на один уровень с нужным элементом визуально
        & .el-dropdown-menu__item {
            &:hover {
                // наследуется от верха страницы, невозможно передать цвета из текущего компонента
                background-color: #f6f6f6;
                color: #666666;
            }
        }
    }
}

.table-header {
    display: flex; 
    flex-direction: row; 
    flex-wrap: nowrap; 
    align-items: center; 
    justify-content: space-between;
    padding: 16px;

    & div {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
    }

}

.problem-create-btn {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 0px 20px 0px 10px; 
    & div {
        height: 100%; 
        display: flex; 
        align-items: center;
        gap: 6px; 
    }
    & span {
        display: block;
        align-items: center;
    }
}

.input-wrapper {
    & .v-text-field {
        padding-top: 0px;
    }
}

.overhead-link {
    position: absolute; 
    bottom: 100%; 
    padding-left: 16px; // выравнивание по левому краю плашки-заголовка
    font-size: 14px;
    & span {
        color: #006eaf;
    }
}


</style>
