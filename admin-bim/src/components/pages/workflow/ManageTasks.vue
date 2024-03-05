<template>
    <v-container class="m-container ma-0 pb-10 pt-0">
        <v-container fluid px-3 pt-0 pb-10 class="overflow-x-auto gutter work-place">

            <div class="task-header pr-8 mr-0" ref="header">

                <div class="m-flex pt-6 pb-3 pselect">
                    <span class="m-flex--item__auto pr-3 m-text--size13"> Выберите проект: </span>
                    <div class="pselect-field m-flex--item">
                        <v-autocomplete 
                        class="pa-0 ma-0 m-text--size16" 
                        v-model="project" 
                        :items="projects"
                        item-text="name" 
                        item-value="id" 
                        persistent-hint 
                        placeholder=" " 
                        dense
                        @change="
                        getTasks(project); 
                        unfoldAllCategories();
                        getProjectFoldersMap(project);
                        " />
                    </div>
                </div>
                
                <!-- Task category main header -->
                <div class="task-wrap pr-0 mr-0" ref="taskwrap">

                    <!-- In final version only statusList or tasks111 must remain -->
                    <div class="task-category ma-0" v-for="group in statusList" >

                            <v-card class="min-height-35px ma-0"  >
                                
                                <!-- top color bar -->
                                <v-progress-linear value="100" :color="categoryColors[group.value]"/>
                                        
                                        <!-- unfold button -->
                                        <v-tooltip top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn class="white invisible unfold-btn ma-0 pa-0" 
                                                v-bind="attrs" 
                                                v-on="on" 
                                                depressed 
                                                :id="'uncollapse-btn'+group.value" 
                                                @click="unfoldCategory(group.value)">
                                                    <v-icon :color="categoryColors[group.value]">
                                                        mdi-chevron-right
                                                    </v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Развернуть</span>
                                        </v-tooltip>
                                
                                <div class="title-wrap fill-height d-flex" 
                                :id="'category'+group.value" >
                                    
                                    <!-- task category name & amount of tasks in category -->
                                    <div class="task-category-status max-width-70">
                                        <v-card-title class="m-text--size16 m-text--color-4a5568 py-0 px-1">
                                            <div class="truncate">
                                                {{group.name}}
                                            </div>
                                        </v-card-title>

                                        <div class="task-amount">
                                            {{tasks111[group.value].items.length}}
                                        </div>
                                    </div>

                                    <v-spacer />
                                    
                                    <!-- task category buttons & menu -->
                                    <div class="task-category-buttons py-0 px-1">

                                        <v-tooltip top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn class="white collapse cat-btn ma-0 pa-0"
                                                v-bind="attrs" 
                                                v-on="on"  
                                                depressed>
                                                    <v-icon :color="categoryColors[group.value]" @click="foldCategory(group.value)">
                                                        mdi-chevron-left
                                                    </v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Свернуть</span>
                                        </v-tooltip>

                                        <v-menu class="pa-0" offset-y>
                                            <template v-slot:activator="{ on: menu, attrs }">
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on: tooltip }">
                                                        <v-btn class="white cat-btn ma-0 pa-0" 
                                                        v-bind="attrs" 
                                                        v-on="{ ...tooltip, ...menu }"
                                                        depressed >
                                                            <v-icon :color="categoryColors[group.value]">
                                                                mdi-dots-horizontal
                                                            </v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>Меню</span>
                                                </v-tooltip>
                                            </template>

                                            <!-- Category header menu -->
                                            <v-card class="ma-0 pa-1">
                                                <div v-for="(item, index) in categoryMenu" :key="index">
                                                    <v-list-item-title>
                                                        <v-btn class="ma-0 pa-0 pr-1 no-uppercase menu-btn"
                                                        small rounded depressed
                                                        @click="handleCategoryMenuButtons(index, group.value);">
                                                            <v-icon dense class="icon-tint ma-0 px-1">
                                                                {{ item.pic }}
                                                            </v-icon>
                                                            <span>{{ item.title }}</span>
                                                            <v-spacer></v-spacer>
                                                        </v-btn>
                                                    </v-list-item-title>
                                                </div>
                                            </v-card>
                                        </v-menu>

                                        <v-tooltip top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn class="white cat-btn ma-0 pa-0" 
                                                v-bind="attrs" 
                                                v-on="on" 
                                                depressed
                                                @click="newTask(group.value)">
                                                    <v-icon :color="categoryColors[group.value]">
                                                        mdi-plus
                                                    </v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Добавить</span>
                                        </v-tooltip>

                                    </div>
                                </div>
                            </v-card>
                        <!-- Category header ENDS here -->

                    </div>
                </div>
            </div>


            <!-- main task container, wrapping all categories -->
            <div class="task-wrap task-wrap-body">
                
                <!-- individual category containers -->
                <Container class="task task-scroll gutter" 
                v-for="group in tasks111" 
                :key="group.name" 
                :id="'tasks'+group.group" 
                group-name="1"
                @drop="onDrop(group.group, $event)" 
                @drop-ready="onEnter($event)">

                    <!-- task card mounting point: draggable must be first otherwise task_id index error occurs -->
                    <Draggable class="taskbox" 
                    v-for="item in group.items" 
                    :key="item.task_id">
                        <div class="draggable-item card-fit">
                            <task ref="taskItems" 
                            :item="item" 
                            :editItem.sync="editItem" />
                        </div>
                    </Draggable>

                    <v-btn class="taskbox mx-2 mb-4 m-text--color-4a5568 m-text--size16" 
                    plain depressed :ripple="false"  
                    @click="newTask(group.group);">
                        <span>+ Новая задача</span>
                    </v-btn>

                    <!-- vertical column replacing category when folded -->
                    <v-card class="taskfold fill-height invisible" 
                    @click="unfoldCategory(group.group);">
                        <v-progress-linear value="100" :color="categoryColors[group.group]"/>
                        <div class="my-2 updown-text">
                            {{group.name}}                                                 
                            <div class="task-amount task-amount-rotated my-1">
                                {{tasks111[group.group].items.length}}
                            </div></div>
                    </v-card>
                    
                </Container>

            </div>

            <!-- editItem element mounting point -->
            <tools v-if="editItem" 
            :editItem.sync="editItem" 
            :h_style="editItem_style" 
            :projectFoldersMap="projectFoldersMap"/>
            <div v-if="editItem" class="overlay" />

        </v-container>
    </v-container>
</template>

<script>
import { Container, Draggable } from "vue-dndrop"
import Task from "./manage_tasks/Task"
import Tools from "./manage_tasks/Tools"

export default {
    name: 'ManageTasks',
    components: {
        Container,
        Draggable,
        Task,
        Tools
    },
    data(){
        return {
            project: '',
            header_style: {},
            editItem_style: {},
            statusList: [
                {name: 'Новая задача', value: 0},
                {name: 'В работе', value: 1},
                {name: 'На рассмотрение', value: 2},
                {name: 'Выполненное', value: 3}
            ],
            removedIndex: null,
            addedIndex: null,
            editItem: null,
            projectFoldersMap: null,
        }
    },
    watch: {
        removedIndex(v){
            if(v != null && this.addedIndex != null){
                this.setTasks()
            }
        },
        addedIndex(v){
            if(v != null && this.removedIndex != null){
                this.setTasks()
            }
        },
    },
    computed: {
        projects(){
            return this.$store.state.workflow.projects.map(p => {
                return {
                    id: p.id,
                    name: p.info.name
                }
            })
        },
        getOwner(){
            return this.$store.state.administration.user.id
        },
        tasks111(){
            let list = this.$store.state.workflow.taskList
            let tasks = [{
                group: 0,
                name: 'Новая задача',
                items: [],
            },{
                group: 1,
                name: 'В работе',
                items: [],
            },{
                group: 2,
                name: 'На рассмотрении',
                items: [],
            },{
                group: 3,
                name: 'Выполненное',
                items: [],
            }]
            list.map((t, i) => {
                let avatar = this.$store.state.administration.company.users
                    .find(a => a.id == t.owner)
                t.avatar = avatar
                    ? avatar.avatarSrc
                    : '',
                tasks[t.status].items.push(t)
            })
            return tasks
        },
        categoryColors(){
            // Sh: colors used for each task category headers; hardcoded for now; probably need to rebase into tasks111/StatusList
            let category_colors = {
                0:'#008000',
                1:'#AFD600',
                2:'#FF7F50',
                3:'#7B68EE',
                }
            return category_colors
        },
        categoryMenu() {
            //Sh: functions doesNothing are to be replaced with appropriate functions in the future
            //Sh: some buttons are disabled dut to api not being ready; enable when functionality is done
            let category_menu = [
                //{ title: 'Переименовать категорию', pic: 'mdi-pencil-outline', func: 'doesNothing' },
                //{ title: 'Редактировать категории', pic: 'mdi-circle-box-outline', func: 'doesNothing' },
                { title: 'Добавить новую задачу', pic: 'mdi-plus', func: 'newTask' },
                //{ title: 'Архивировать все задачи', pic: 'mdi-tray-arrow-down', func: 'doesNothing' },
                { title: 'Свернуть категорию', pic: 'mdi-arrow-collapse-left', func: 'foldCategory' },
                //{ title: 'Выделить все задачи', pic: 'mdi-check-all', func: 'selectAllInCategory' },
            ]
            return category_menu
        },
    },
    methods: {
        checkOwner(v){
            return this.getOwner == v
        },
        setTasks(){
            let elem = this.tasks111[this.removedIndex.grp].items[this.removedIndex.ind]

            let list = this.$store.state.workflow.taskList
            list = list.map(l => {
                if(elem.task_id == l.task_id){
                    elem.status = this.addedIndex.grp
                    l.status = this.addedIndex.grp
                }
                return l
            })
            this.$store.commit('workflow/setTaskList', list)
            this.removedIndex = null
            this.addedIndex = null

            let formData = new FormData()
            let body = {
                status: elem.status
            }
            formData.append('JSON', JSON.stringify(body))
            this.$store.dispatch('workflow/updateTask', {
                type_id: 'c',
                id: elem.company_id,
                project_uuid: elem.project,
                body: formData,
                task_id: elem.task_id.toString(),
                filter: {}
            })
        },
        onDrop(v, e){
            const { removedIndex, addedIndex } = e
            if((removedIndex === null && addedIndex === null) || (removedIndex != null && addedIndex != null)) return

            if(removedIndex !== null){
                this.removedIndex = {
                    grp: v,
                    ind: removedIndex
                }
            }
            if(addedIndex !== null){
                this.addedIndex = {
                    grp: v,
                    ind: addedIndex
                }
            }
        },
        onEnter(v, g, t){
            // console.log('vbwer', v, g, t)
        },
        getTasks(v){
            this.editItem = null
            this.$store.dispatch('workflow/getTaskList', {
                type_id: 'c',
                id: this.$store.state.administration.company.id,
                project_uuid: v,
                filter: {}
            })
        },
        getFoldableElements(v) {
            // v - category index
            let elements = []
            elements.category = document.getElementById('category' + v)
            elements.unfoldbtn = document.getElementById('uncollapse-btn' + v)
            elements.tasks = document.getElementById('tasks' + v)
            elements.taskbox = elements.tasks.querySelectorAll('.taskbox')
            elements.taskfold = elements.tasks.querySelector('.taskfold')

            return elements
        },
        foldCategory(v) {
            // v - category index
            var elements = this.getFoldableElements(v)

            elements.category.classList.add("invisible")
            elements.unfoldbtn.classList.remove("invisible")
            elements.category.parentElement.parentElement.classList.add("folded")

            elements.tasks.classList.add("folded")
            elements.tasks.classList.remove("task-scroll")
            elements.tasks.classList.remove("gutter")

            for (let unit of elements.taskbox) {
                unit.classList.add("invisible")
            }
            elements.taskfold.classList.remove("invisible")

        },
        unfoldCategory(v) {
            // v - category index

            var elements = this.getFoldableElements(v)

            elements.category.classList.remove("invisible")
            elements.unfoldbtn.classList.add("invisible")
            elements.category.parentElement.parentElement.classList.remove("folded")

            elements.tasks.classList.remove("folded")
            elements.tasks.classList.add("task-scroll")
            elements.tasks.classList.add("gutter")

            for (let unit of elements.taskbox) {
                unit.classList.remove("invisible")
            }
            elements.taskfold.classList.add("invisible")

        },
        unfoldAllCategories() {
            // Sh: crutch - expands all categories when changing the project for the correct display of cards
            for (let category of this.tasks111) {
                let groupNumber = category.group
                this.unfoldCategory(groupNumber)
            }
        },
        handleCategoryMenuButtons(v, category) {
            // v - button index; category - category index (status);
            let funcName = this.categoryMenu[v].func
            this[funcName](category) 
            // calling a function '.func' of object 'this.categoryMenu[v]', which runs with arguments (category)
        },
        selectAllInCategory(category) {
            // category - category index;
            if (!this.$refs.taskItems) { return null }
            let tasksInCategory = this.$refs.taskItems.filter(task => task.item.status == category)
            if (tasksInCategory.length) { for (let task of tasksInCategory) { task.selected = true; } }
        },
        newTask(v){
            // v - category index (status);
            // Sh: probably needs authorization & ownership check to be added
            if (!this.project) {
                return null // when no project is selected 
            }
            let newtask = {
                name: "",
                status: (v || 0),
                deadline: "",
                dscr: "",
                owner: this.getOwner,
                user: this.getOwner,
                company_id: this.$store.state.administration.company.id,
                project: this.project,
                task_id: "",
                src: "",
                file: "",
                dname: "",
                docid: "",
            }
            this.editItem = newtask
        },
        console(v) {
            console.log(v)
        },
        getProjectFoldersMap(projectId) {
            this.$store.dispatch('workflow/getFoldersByProjectId', projectId)
            .then( result => {
                this.projectFoldersMap = result
                //console.log("The result is",this.projectFoldersMap)
            })
            .catch( err => {
                console.log(err)
            })
        },        
        /* placeholder function for testing & debug  */
        doesNothing(v) {
            //console.log('doesNothing in category '+ v)
        },
        /* end temporary */
    },
    mounted(){
        this.$nextTick(() => {
            let header = this.$refs['header']
            this.header_style = {
                top: header.getBoundingClientRect().top + 0 + 'px'
            }
            this.editItem_style.top = this.header_style.top
            this.editItem_style.height = "calc(100% - " + this.header_style.top + ")"
        })
    },
    beforeDestroy(){
        this.$store.commit('workflow/setTaskList', [])
    },
}
</script>

<style scoped>

.work-place{
    display: flex;
    flex-direction: column;
}

/* workplace x-scroll */

.work-place::-webkit-scrollbar {
    width: 5px;
    height: 8px;
}

.work-place::-webkit-scrollbar-track {
    border-radius: 10px;
}

.work-place::-webkit-scrollbar-thumb {
    background: #999; 
    border-radius: 10px;
}

.work-place::-webkit-scrollbar-thumb:hover {
    background: #555; 
}

/* workplace x-scroll end */

.task-wrap {
    display: flex;
    flex-flow: row nowrap;
    justify-content: start;
    gap: 20px;
    padding-bottom: 20px;
}

.task-wrap-body{
    flex: 1 0 auto;
}

.task-header{
    position: sticky;
    z-index: 1;
}

.pselect{
    width: 40%;
}

.pselect-field {
	min-width: 160px;
}

.task-category {
	min-width: 280px;  
    width: calc(100% / 4 - 26px);
	border-radius: 10px 10px 0 0;
}

.task-category-status {
	display: flex;
	display: -ms-flexbox;
	display: -webkit-flex;
	align-items: center;
	flex-wrap: nowrap;
	overflow: hidden;
	max-width: 75%;
	text-overflow: ellipsis;
}

.task-category-buttons {
	display: flex;
	display: -ms-flexbox;
	display: -webkit-flex;
	align-items: center;
	flex-wrap: nowrap;
	overflow-x: hidden;
    min-width: 30%; 
	justify-content: flex-end; 
	overflow: visible;
}

.task-category-buttons .collapse {
    visibility: hidden;
}

.cat-btn.v-btn {
    min-width: 0% !important;
    width: 25px !important;
    min-height: 0% !important;
    height: 25px !important;
}

.menu-btn.v-btn {
	background-color: white; 
	width: 100%;
}

.unfold-btn {
    display: block;
    min-width: 0% !important;
    min-height: 0% !important;
    height: 31px !important; /* 31px=35px-4px - почему-то неправильно считает 100% родительского элемента */
    width: calc(100%);
    border-radius: 0;
}

.icon-tint.v-icon {
	color: gray;
} 

.title-wrap:hover .task-category-buttons .collapse {
	visibility: visible;
} 

.task-amount {
	display: flex;
	display: -ms-flexbox;
	display: -webkit-flex;
	align-items: center;
	justify-content:center;
	width: 30px;
	min-width: 30px;
	height: 25px;
	max-height: 25px;
	background-color: white;
	border: 1px gray solid;
	border-radius: 30px;
}

.task-amount-rotated {
    width: 25px !important;
	min-width: 25px !important;
	height: 30px !important;
	max-height: 30px !important;
}

.v-tooltip__content {
	background-color: black;
}

/* Sh: probably replace with span + span letterspacing class */
:deep(.v-btn__content) {
	letter-spacing: 0.01em;
}

.task {
    margin: 0;
    min-width: 280px;
    width: calc(100% / 4 - 26px);
    max-height: calc(65vh); /* crutch, should be calculated instead */
    overflow-x: hidden;
    overflow-y: hidden;
}

.task-scroll:hover {
    overflow-y: scroll;  
}

/* scrollbar styles for task category containers */
.task::-webkit-scrollbar {
    width: 5px;
}

.gutter {
    scrollbar-gutter: stable; 
}

.task::-webkit-scrollbar-track {
    border-radius: 10px;
}

.task::-webkit-scrollbar-thumb {
    background: #888; 
    border-radius: 10px;
}

.task::-webkit-scrollbar-thumb:hover {
    background: #555; 
}
/* end task category scrollbar */

.task-wrap-body .task{
    border-radius: 0 0 10px 10px;
}

.draggable-item {
	padding: 10px 15px;
    /*background-color: #ebebeb;*/
}

.overlay {
    position: absolute;
    border-radius: inherit;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    -webkit-transition: inherit;
    transition: inherit;
    height: 100%;
    width: 100%;
    will-change: opacity;
    opacity: 0.46;
    background-color: rgb(33, 33, 33);
    border-color: rgb(33, 33, 33);
    z-index: 1;
}

/* utility styles */

.max-width-70 {
	max-width: 70%;
}

.truncate {
	white-space: nowrap; 
	overflow: hidden; 
	text-overflow: ellipsis;
}

.no-uppercase {
     text-transform: unset !important;
}

.card-fit {
    max-width: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
}

.folded {
    min-width: 50px !important;
    width: 50px !important;
}

.invisible {
    display: none !important;
}

.min-height-35px {
    min-height: 35px;
}

.no-overflow {
    overflow: hidden;
}

.taskfold {
    display: flex; 
    flex-direction: column;
}

.updown-text {
    display: flex;
    writing-mode: vertical-lr;
    text-orientation: mixed;
    margin: auto;
}

.overflow-x-auto {
    overflow-x: auto;
}

</style>
