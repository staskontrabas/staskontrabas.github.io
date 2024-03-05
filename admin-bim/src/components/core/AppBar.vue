<template>
    <el-header
        :style="{display: 'flex', 'flex-direction': 'row', height: '48px', width: '100%', 'align-items': 'center', 'padding-right': '8px', 'border-bottom': '1px solid #cccccd', 'justify-content': showContent ? 'end' : 'start'}"
        class="m-toolbar" id="core-header" :flat="true">

        <promise />

        <logobar
            v-if="!part.drawer"
            :style="{overflow: showContent ? 'hidden' : 'initial'}"
            :part="part" />

        <hr v-if="!part.drawer && showContent" class="divider">

        <div v-show="showContent"  class="data-wrapper">
            
            <!-- Кнопка навигации по двум главным вкладкам -->
            <div v-if="isMain && isMain.main && !isInvite" class="nav-button" @click="handleChangeMainTab(isMain.page)">
                <inline-svg :src="mainNav[isMain.page].icon" height="24" />
                <span> {{ mainNav[isMain.page].title }} </span>
            </div>

            <hr class="divider">

            <!-- Навигация по проекту -->
            <el-select 
                v-show="isMain && !isMain.main && !isInvite"
                class="tabs-select" :placeholder="tabs ? '' : 'Выберите вкладку'" no-match-text="" no-data-text=""
                v-model="tabs"
                :style="{'min-width': !side_mini ? '200' + 'px' : '45' + 'px', 'max-width': !side_mini ? '225' + 'px' : '45' + 'px'}"
                @change="handleTypeChange">

                <!-- Выбранный элемент -->
                <template v-if="tabs" v-slot:prefix>
                    <div class="tab-option-wrapper display">
                        <div>
                            <inline-svg class="prefix-icon" :src="tabs.icon" height="24" />
                        </div>
                        <span class="tab-option-text"> {{ tabs.title }} </span>
                        <v-spacer></v-spacer>
                        <div class="triangle-wrapper">
                            <inline-svg class="triangle" :src="triangle" />
                        </div>
                    </div>
                </template>

                <!-- Список опций вкладок -->
                <div v-for="tab in navigationOptions">
                    <v-divider style="margin: 10px 0px;" v-if="tab.id.toString().startsWith('divider')" />

                    <el-option v-else :key="tab.id" :value="tab">
                        <div class="tab-option-wrapper">
                            <inline-svg :src="tab.icon" height="24" color="black" />
                            <span> {{ tab.title }} </span>
                        </div>
                    </el-option>
                </div>

            </el-select>

            <hr class="divider">

            <!-- Выбор проекта -->
            <el-select 
                ref="project-select"
                v-if="show_project_selector" 
                class="project-select" 
                :placeholder="current_project ? '' : 'Выберите проект'" 
                v-model="current_project"
                @change="pushCurrentProject">
                <!-- Выбранный элемент -- проекты -->
                <template v-if="current_project" v-slot:prefix>
                    <div class="project-option-wrapper display">
                        <span>
                            {{ current_project.info.name }}
                        </span>
                        <v-spacer />
                        <div class="triangle-wrapper">
                            <inline-svg class="triangle" :src="triangle" />
                        </div>
                    </div>
                </template>

                <!-- Список опций -- проекты -->
                <!-- Фильтр для проектов -->
                <div class="project-filter-options">
                    <el-input class="project-filter" v-model="project_filter" placeholder="Искать по названию" clearable />
                    <span class="project-filter-found" v-if="project_filter && filtered_projects.length">
                        Найдено совпадений: {{ filtered_projects.length }} </span>
                    <span class="project-filter-title"> Проекты </span>
                </div>
                <v-divider/>
                <!-- Генерируемые варианты + заглушка на случай отсутствия совпадений -->
                <div class="project-filter-body">
                    <el-option class="no-hit" v-if="!filtered_projects.length"
                        :value="{ id: null, info: { name: 'Проект не выбран' } }">
                        <div class="no-hit-box">
                            Нет совпадений по текущему имени
                        </div>
                    </el-option>
                    <el-option v-for="project in filtered_projects" :key="project.id" :value="project">
                        <div class="project-option-wrapper"
                            :class="current_project && current_project.id == project.id ? 'current' : ''">
                            <span> {{ project.info.name }} </span>
                        </div>
                    </el-option>
                </div>
                <v-divider />

                <!-- Футер -- проекты -->
                <div class="project-select-footer" @click="routeToProjectlist">
                    <span>
                        Просмотреть все проекты
                    </span>
                </div>
            </el-select>

            <v-spacer />
            <hr class="divider" />

        </div>

        <div v-show="showContent" class="profile-wrapper">
            <Profile />
        </div>

    </el-header>
</template>

<script>
import { mapState } from "vuex"
import Logobar from '@/components/core/Logobar'
import Menu from '@/components/core/appbar/Menu'
import Profile from '@/components/core/appbar/Profile'
import Promise from '@/components/core/appbar/Promise'
import InlineSvg from 'vue-inline-svg'
import sidebarJS from "@/components/core/sidebar/sidebar.js"
// import Translations from '@/components/core/appbar/Translations'

export default {
    name: 'AppBar',
    props: ['part','side_mini','side_type'],
    components: {
        Logobar,
        Promise,
        Menu,
        Profile,
        InlineSvg,
        // Translations
    },
    data() {
        return {
            bg_color: '#fbfbfb',
            bg_color_list: {
                normal: '#fbfbfb',
                white: '#fff'
            },
            logo: require('@/assets/images/Logo_icon.svg'),
            logo_text: require('@/assets/images/Logo_text.svg'),
            triangle: require('@/assets/icons/triangle.svg'),

            tabs: null, // el-select tabs
            current_project: null, // el-select projects
            show_project_selector: false,
            project_filter: '',
        }
    },
    watch: {
        '$route'(to, from) {
            this.setBG()
            this.display()
            this.setCurrentProject()
            // console.log('part', this.part)
            // console.log('side_menu_tabs',this.tabs)
            // console.log('nav_options', this.navigationOptions)

            // устанавливает нужные значения типа для сайдбара. костыль, нужно переделывать после реорганизации структуры сайта
            if (from.path == '/workflow/projects' && to.path !== '/administration/account' ) {
                this.setSideType('shared')
                this.tabs = this.navigationOptions.find(obj => obj.name == 'shared')
            }
            if (from.path.startsWith('/workflow') && to.path.startsWith('/administration')) {
                this.setSideType('accountadmin')
                this.tabs = this.navigationOptions.find(obj => obj.name == 'accountadmin')
            }

        },
        'projects'() {
            this.setCurrentProject()
        },
        'tabs'(newval,oldval) {
            this.$root.$emit('appbar_doc_current_tab_change', newval)
        },
    },
    computed: mapState({
        showContent(state){
            const check = !(state.workflow.pdfPage || state.workflow.viewerPage)
            return check
        },
        title(state) {
            return state.toolbar.title
        },
        user() {
            return this.$store.state.administration.user
        },
        projects() {
            return this.$store.state.workflow.projects
        },
        filtered_projects() {
            const comp_id = this.$store.state.administration.company.id
            let list = this.projects
            list = list.filter(obj => obj.info.company == comp_id)
            let filtered_list = []
            
            // TODO: пока только для текущей компании!
            // console.log('comp_id', comp_id)

            let search_str = this.project_filter.toLowerCase()
            if (!search_str) {
                return list
            }

            for (const elem of list) {
                if (elem.info.name.toLowerCase().indexOf(search_str) > -1) {
                    filtered_list.push(elem)
                }
            }

            return filtered_list
        },
        isMain() {
            let path = this.$route.path
            let page = this.$route.path.split('/')
            // console.log('isMain', path, page[1])
            //https://prodoc.ubdev.ru/invite?code=2051915f-2b59-4454-be74-bfe36264d8f31f9819aa-2a9f-46be-99a9-7a3d2b2d87dd
            return {
                main: path == '/workflow/projects', // || path.startsWith('/administration')
                page: page[1]
            }
        },
        isInvite() {
            let verdict = false
            verdict = (this.$route.fullPath.toLowerCase().indexOf('invite') > -1) 
                    && !this.$route.fullPath.toLowerCase().endsWith('invite')
                    && !(this.$route.fullPath.toLowerCase().indexOf('invite') > -1)
            // console.log('not invite verdict', verdict)
            return verdict
        },
        mainNav() {
            return {
                administration: {
                    title: 'Проекты',
                    icon: require('@/assets/icons/home.svg'),
                    path: '/workflow/projects',
                },
                workflow: {
                    title: 'Администрирование',
                    icon: require('@/assets/icons/settings.svg'),
                    path: '/administration/account',
                },
            }
        },
        navigationOptions() {
            let page = this.$route.path.split('/')[1]
            switch(page) {
                case 'workflow':
                    return [
                    {
                        id: 0,
                        name: 'workflow-project',
                        title: 'Проекты',
                        icon: require('@/assets/icons/home.svg'),
                        path: '/workflow/projects',
                        root: '/workflow/'
                    },
                    {
                        id: 'divider-top',
                        title: '',
                        icon: '',
                        path: '',
                        root: '',
                    },
                    {
                        id: 2,
                        name: 'shared',
                        title: 'Среда общих данных',
                        icon: require('@/assets/icons/cloud.svg'),
                        path: '/workflow/projects',
                        root: '/workflow/'
                    },
                    {
                        id: 3,
                        name: 'workflow',
                        title: 'Документооборот',
                        icon: require('@/assets/icons/docs.svg'),
                        path: '/workflow/projects',
                        root: '/workflow/'
                    },
                    {
                        id: 4,
                        name: 'consolidation',
                        title: 'Консолидация',
                        icon: require('@/assets/icons/consolidation.svg'),
                        path: '/workflow/projects',
                        root: '/workflow/'
                    },
                    {
                        id: 5,
                        name: 'expert',
                        title: 'Эксперт',
                        icon: require('@/assets/icons/expert.svg'),
                        path: '/workflow/projects',
                        root: '/workflow/'
                    },
                    {
                        id: 'divider-bottom',
                        title: '',
                        icon: '',
                        path: '',
                        root: '',
                    },
                    {
                        id: 99,
                        name: 'administration',
                        title: 'Администрирование',
                        icon: require('@/assets/icons/settings.svg'),
                        path: '/administration/account',
                        root: '/administration/',
                    },
                    ]
                case 'administration':
                    return [
                    {
                        id: 0,
                        name: 'workflow-project',
                        title: 'Проекты',
                        icon: require('@/assets/icons/home.svg'),
                        path: '/workflow/projects',
                        root: '/workflow/'
                    },
                    {
                        id: 'divider-top',
                        title: '',
                        icon: '',
                        path: '',
                        root: '',
                    },
                    {
                        id: 98,
                        name: 'projectadmin',
                        title: 'Администрирование проекта',
                        icon: require('@/assets/icons/settings.svg'),
                        path: '/administration/company',
                        root: '/administration/',
                    },
                    {
                        id: 99,
                        name: 'accountadmin',
                        title: 'Администрирование учетной записи',
                        icon: require('@/assets/icons/settings.svg'),
                        path: '/administration/account',
                        root: '/administration/',
                    },
                    ]
                default:
                    console.log('Error in path for navigationOptions')
                    return []
            }
        },
    }),
    methods: {
        setBG() {
            if (!this.$route.name) {
                return null
            }
            if (this.$route.name == 'workflow-view') {
                this.bg_color = this.bg_color_list.white
            }
            else {
                this.bg_color = this.bg_color_list.normal
            }
        },
        display: function () {
            if (this.$route.name.startsWith('workflow')) {
                this.show_project_selector = true
            }
            else {
                this.show_project_selector = false
            }

        },
        setCurrentProject() {
            if (this.$route && this.$route.params && this.$route.params.id) {
                this.current_project = this.projects.find(obj => obj.id == this.$route.params.id)
            }
        },
        pushCurrentProject() {
            if (this.current_project && this.current_project.id) {
                this.$store.commit('workflow/setActiveGroup', false)
                this.$store.commit('workflow/setActiveFolder', false)
                this.$router.push('/workflow/projects') // костыль, но иначе не почистить состояние компонента и vue его не перерисовывает
                    .then(
                        this.$nextTick( () => {
                        this.$router.push('/workflow/'+ this.current_project.id + '/list')
                    }))
            }
        },
        routeToProjectlist() {
            this.$refs['project-select'].blur() // иначе дропдаун остается на экране
            this.$router.push('/workflow/projects')
        },
        setDefaultSideType(page) {
            let def = ''
            switch (page) {
                case '/workflow/projects':
                    def = 'shared'
                    break
                case '/administration/account':
                    def = 'accountadmin'
                    break
                default:
                    break
            }
            this.setSideType(def)
        },
        pushCurrentTab(path) {
            // console.log('pushing to route', this.$route)
            this.$store.commit('workflow/setActiveGroup', false)
            this.$store.commit('workflow/setActiveFolder', false)
            this.$router.push(path)
        },
        toggleSideMini() {
            this.$emit('update:side_mini', !this.side_mini)
        },
        handleTypeChange(v) {
            // console.log('type',v)
            let main = ['workflow-project', 'administration', ]
            if (!main.includes(v.name)) {
                this.setSideType(v.name)
            }
            else {
                this.setDefaultSideType(v.path)
                this.pushCurrentTab(v.path)
            }
        },
        setSideType(v) {
            this.$emit('update:side_type', v)
        },
        handleChangeMainTab(page) {
            let source = this.mainNav[page]
            // console.log('source', source)
            this.setDefaultSideType(source.path)
            this.pushCurrentTab(source.path)
        },
        getTabFromRoute() {
            // если нет роута, то его надо собрать из адресной строки
            // сейчас это жуткий костыль, надо такого избегать при рефакторинге
            if (!this.$route) {
                return null
            }
            let path = this.$route.path.split('/')
            let crumb = ''
            switch (path[1]) {
                case 'administration': {
                    if (path.length > 2)  {
                        crumb = path[2]
                        const tab = sidebarJS['administration'].list.find(obj => obj['link'].endsWith(crumb))
                        const option = this.navigationOptions.find(obj => obj.name == tab.belongs_to[0])
                        if (option) { 
                            this.tabs = option 
                            this.handleTypeChange(option)
                        }
                        // console.log('opt adm', option)
                    }
                    break
                }
                case 'workflow': {
                    if (path.length > 3) {
                        crumb = path[3]
                        const tab = sidebarJS['workflow-project'].list.find(obj => obj['link'].endsWith(crumb))
                        if (!tab) {
                            return null
                        }
                        const option = this.navigationOptions.find(obj => obj.name == tab.belongs_to[0])
                        if (option) { 
                            this.tabs = option 
                            this.handleTypeChange(option)
                        }
                    }
                    break
                }
                default: {
                    return null
                }
            }
        },
        exposeTabType() {
            this.$root.$emit('exposing_current_nav_tab', this.tabs)
        },
    },
    created() {

        // let workflow = this.$store.state.workflow
        this.$store.dispatch('workflow/getProjects', {
            type_id: 'c',
            id: this.$store.state.administration.company.id
        })
        

        this.setBG()
        this.display()
        this.$nextTick(() => {
            this.setCurrentProject()
        })
    },
    mounted() {
        this.$root.$on('get_current_nav_tab', this.exposeTabType)
        if (this.tabs == null) {
            this.getTabFromRoute()
        }
        
    },
    beforeUpdate() {
        this.setCurrentProject()
    },
    beforeDestroy() {
        this.$root.$off('get_current_nav_tab')
    },
}
</script>


<style scoped lang="scss">
.custom-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    background-color: white;
    border-bottom: 1px solid grey;
}

.logo-wrapper {
    display: flex;
    margin-left: 20px;
    align-items: center;
}

.data-wrapper {
    display: flex;
    align-items: center;
    justify-content: start;
    width: 100%;
}

.profile-wrapper {
    display: flex;
    flex-direction: row;
    min-width: 200px;
    align-items: center;
    margin-right: 8px;
}

.divider {
    display: block;
    background-color: rgb(220, 220, 220);
    border: 0px;
    width: 1px;
    min-width: 1px;
    height: 32px;
    margin: 0;
}

.nav-btn-wrapper{
    margin: 0px 8px;
}

.nav-button {
   display: flex;
   flex-direction: row;
   gap: 8px;
   width: 225px;
   padding: 0px 15px;
   color: #3b3c3c;
   cursor: pointer;

   &:hover {
    color: #006eaf;
   }

}

</style>
