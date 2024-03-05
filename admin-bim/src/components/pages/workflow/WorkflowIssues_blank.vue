<template>
    <v-container pt-0 fluid fill-height text-xs-center class="page-container marker">
        <v-layout wrap>
                <v-flex xs12>
                    <v-layout
                        fluid
                        fill-height
                        column
                        align-center
                        justify-center
                        >
                        <div class="m-dummy--wrap mb-5">
                            <img
                                width="100%"
                                src="@/assets/images/in_work.svg"/>
                        </div>
                        <div class="m-dummy--title"> Раздел "Проблемы" в разработке </div>
                        <div class="m-dummy--desc"> Мы скоро завершим работы! </div>
                    </v-layout>
                </v-flex>
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

export default {
    name: 'WorkflowIssues',
    components: {
        InlineSvg,
        newIssueDialogue,
        ubTable,
        EditIssue,
        settingsTypes,
        settingsReasons,
        settingsStatus,
        settingsTemplates,
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

            loading: false, // !!! доделать загрузку с лоадером

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
        }
    },
    watch: {
        '$route'(to, from) {
            this.loading = true
        }
    },
    methods: {
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
        setTableData(pane_name) {
            console.log('setting table', pane_name)

            switch(pane_name) {
                case 'first': {
                    //set main page data
                    break
                }
                case 'types': {
                    // types table
                    break
                }
                case 'custom': {
                    // etc.
                    break
                }
                case 'permissions': {
                    break
                }
                case 'main': {
                    break
                }
                case 'templates': {
                    break
                }
                case 'statuses': {
                    break
                }
                default: {
                    console.log('no data for the table')
                    this.table_data = []
                }
            }
        },
        goToProblems() {
            this.toggleSettings()
            this.activeName = 'first'
            this.search = ''
            this.setTableData('first')
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
                    // кроме 7 - содержит ссылку на документ
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
                console.log('success', res )
                this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проблема "' + problem.title + '" успешно создана.',
                        message: 'Проблема "' + problem.title + '" успешно создана.',
                })
                this.toggleDialogOff()
                this.getProblemsForCurrentProject()
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

// Запросы на сервис
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
                    // console.log('statuses', res) 
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
                    // console.log('got reasons', res) 
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
            // запрос на проблемы
            const project_uuid =  this.$route.params.id
            if (project_uuid) {
                this.$store.dispatch('workflow/getProblems', project_uuid)
                .then( res => {
                    this.problems = res
                    // console.log('got problems', res)
                })
                .catch( err => {
                    console.log('error', err)
                })
            }
        },
        getStatusPoolForCurrentProject() {
            // запрос на статусы
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
            // запрос на категории
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
            // запрос на категории
            const project_uuid =  this.$route.params.id
            if (project_uuid) {
                this.$store.dispatch('workflow/getProblemTemplates', project_uuid)
                .then( res => {
                    this.templates = res
                    // console.log('got templates', res)
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
            return res
        },
        computed_statuses() {
            let res = this.statuses
            return res
        },
        computed_templates() {
            let res = this.templates
            return res
        },
        computed_reasons() {
            let res = this.reasons
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

.create-problem-btn-drop {
   height: 36px; 
   width: 36px; 
   border-radius: 0 5px 5px 0;
   border-left: 1px solid var(--white-background); 
   display: flex;
   justify-content: center;
   align-items: center;
}

.problem-icon-btn {
    padding: 0px 20px 0px 10px !important; 
    & div {
        gap: 8px;
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
