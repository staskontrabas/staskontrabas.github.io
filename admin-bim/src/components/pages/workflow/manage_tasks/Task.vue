<template>

    <!-- main v-card -->
    <v-card class="cursor-pointer no-overflow white ma-1 mb-4 rounded-lg">

        <!-- task-hoverable area, when hovered over '+ Добавить этап' button changes to task-actions -->
        <div class="task-wrap-hoverable task-hoverable-display" 
        @mouseover="actionsShow = true" 
        @mouseleave="actionsShow = false"> 

            <!-- Task image -->
            <div class="py-0 px-0" 
            v-if="item.src !==''">
                <v-img :src="item.src" height="135px"></v-img>
            </div>

            <!-- Project title -->
            <div class="d-flex">
                <v-card-title class="max-width-100 m-text--color-4a5568 pt-1 pb-0">
                    <div class="truncate m-text--size13">
                       {{ getProjectName(item.project) }} <span v-if="item.dname"> &rsaquo; {{item.dname}} </span>
                    </div>
                </v-card-title>
            </div>

            <!-- Task description container -->
            <div class="max-width-100 d-flex mb-0 pb-0">

                <!-- Task name/status and description -->
                <v-card-subtitle class="pt-1 pb-1 ma-0">
                    <!-- task name -->
                    {{ item.name }} 

                    <!-- clip icon; unused atm; api not done; -->
                    <v-btn class="dscr-btn invisible" depressed>
                        <v-icon class="icon-tint tilt" dense>
                            mdi-paperclip
                        </v-icon>
                    </v-btn>
                    
                    <!-- description text of the task -->
                    <v-menu open-on-hover right offset-x >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="dscr-btn" 
                            v-bind="attrs" 
                            v-on="on" 
                            depressed>
                                <v-icon class="icon-tint" dense>
                                    mdi-text
                                </v-icon>
                            </v-btn>
                        </template>
                        <v-card class="description rounded-lg" >
                            <v-card-subtitle class="description-text pa-0 ma-0 black--text">{{getTaskDescription(item.dscr)}}</v-card-subtitle>
                        </v-card>
                    </v-menu>

                    <!-- shown if prioritized -->
                    <v-btn class="dscr-btn" :class="{'invisible': !this.prioritised}" depressed plain :ripple="false">
                            <v-icon :style="{ color: this.taskActions[1].activeColor }" dense>
                                mdi-flag-variant
                            </v-icon>
                    </v-btn>
                    <!-- shown if completed -->
                    <v-btn class="dscr-btn" :class="{'invisible': !this.completed}" depressed plain :ripple="false">
                            <v-icon :style="{ color: this.taskActions[6].activeColor }" dense>
                                mdi-check
                            </v-icon>
                    </v-btn>
                </v-card-subtitle>

                <!-- spacer separator -->
                <v-spacer />

                <!-- badge and avatar -->
                <v-badge bordered dot color="green" offset-x="20" offset-y="15">
                    <v-avatar class="mx-3 mt-1 mb-1" size="25">
                        <img :src="item.avatar">
                    </v-avatar>
                </v-badge>
            </div>

            <!-- tag plaques mounting point -->
            <div class="py-1 px-4 ma-0 tags-wrap " v-show="taskTags.length">
                <div class="pa-0 ma-0 m-text--size12 inner-tags-container">
                    <div class="px-1 tag-plaque" 
                    v-for="tag of taskTags"
                    :class="formTagColorClass(tag.color)">

                        <!-- box with menu and close icons; note that v-btns geometry is different -->
                        <div class="pr-1 inner-tag-appear-on-hover"> 
                            <v-btn class="ma-0 pa-0 inner-tag-btn " 
                            tile plain depressed
                            :class="formTagColorClass(tag.color)"  
                            :ripple=false >
                                <v-icon class="font-size-14px">
                                    mdi-dots-horizontal
                                </v-icon>
                            </v-btn>
                            <v-btn class="ma-0 pa-0 inner-tag-btn border-inherit" 
                            tile plain depressed 
                            :class="formTagColorClass(tag.color)" 
                            :ripple=false
                            @click="removeTagFromTask(tag.text);">
                                <v-icon class="font-size-14px">
                                    mdi-close
                                </v-icon>
                            </v-btn>
                        </div>
                        <span class="truncate max-width-100">
                            {{ tag.text }}
                        </span>
                    </div> 
                </div>
            </div>
            
            <!-- actions shown when hovering mouse over task card -->
            <div v-show="keepActionsVisible">

                <!-- task-actions -->
                <v-card-subtitle class="actions-onhover pb-1 pt-1">

                    <!-- v-if - actions_item; task-actions menu mounting point -->
                    <!-- Sh: most actions are disabled via v-if due to api not being finished for them -->
                    <v-menu offset-y 
                    :close-on-content-click=false 
                    v-for="actions_item in taskActions" 
                    :key="actions_item.id" 
                    v-if="
                    actions_item.title !== 'spacer' && 
                    !disabledButtons.includes(actions_item.title)
                    "
                    v-model="vMenuModels[actions_item.title]">
                        <template v-slot:activator="{ on: menu }">
                            <div>
                                <v-tooltip top :disabled="actions_item.pop === ''">
                                    <template v-slot:activator="{ on: tooltip }">
                                        <v-icon class="icon-tint task-card-icons px-0"
                                        v-on="{ ...tooltip, ...menu }" 
                                        :color="actions_item.activeColor" 
                                        dense 
                                        @click="handleTaskActions(actions_item.title, $event);">
                                            {{ actions_item.pic }}
                                        </v-icon>
                                    </template>
                                    <span>{{ actions_item.pop }}</span>
                                </v-tooltip>
                            </div>
                        </template>

                        <!-- menu mounting v-card -->
                        <v-card class="ma-0 pa-0 menu-mounting-point" 
                        @mouseover="actionsShow = true" 
                        @mouseleave="actionsShow = false"> 

                            <!-- date menu -->
                            <div class="d-flex m-text--size13" v-if="actions_item.title == 'calendar'">
                                <v-date-picker ref="picker" 
                                v-model="date" 
                                :show-current="dateForPicker(item.deadline)"
                                first-day-of-week="1"
                                flat no-title scrollable
                                locale="ru" 
                                max="2050-01-01" 
                                min="1950-01-01"
                                @input="updateTaskDeadline();"
                                >
                                </v-date-picker>
                            </div>

                            <!-- tag menu -->
                            <div class="mounted-menu-card gutter" v-if="actions_item.title == 'tags'">

                                <!-- text input part -->
                                <input class="px-4 py-0 ma-0 width-100 no-outline tag-item-height" 
                                placeholder="Введите название тэга"
                                v-model="inputTagText"
                                :disabled="savedTagText" 
                                @keyup.enter="saveTagText(inputTagText);"> 

                                <v-divider/>
                                
                                <!-- existing tags mounting point -->
                                <div v-if="filteredTags.length">
                                    <v-list-item-title class="px-0 ma-0" 
                                    v-for="tag in filteredTags" 
                                    :key="tag.id" >
                                        <v-btn class="ma-0 py-1 no-uppercase tag-btn max-width-100" 
                                        tile depressed plain 
                                        @click="updateTaskTags(tag.text,tag.color);">
                                            <span class="closespacing truncate max-width-80 border-box" 
                                            :style="{'color': tag.color}">
                                                {{ tag.text }}
                                            </span>
                                            <v-menu offset-x :close-on-content-click=true>
                                                <template v-slot:activator="{ on: tagEdit }">
                                                    <v-icon class="max-width-20 icon-tint tag-icon" 
                                                    :color="tag.color" 
                                                    v-on="{ ...tagEdit }"
                                                    @click="$event.stopPropagation();">
                                                        mdi-dots-horizontal
                                                    </v-icon>
                                                </template>
                                                <v-card class="pa-2 d-flex flex-column tagEdit-menu">
                                                    <v-btn class="white ma-0 pa-0 no-uppercase tag-item-height" 
                                                    small depressed
                                                    @click="handleTagColorChange(tag.text)">
                                                        <v-icon class="ma-0 px-1 icon-tint" dense>
                                                            mdi-water-outline
                                                        </v-icon>
                                                        <span class="closespacing"> 
                                                            Сменить цвет 
                                                        </span>
                                                        <v-spacer/>
                                                    </v-btn>
                                                    <v-btn class="white ma-0 pa-0 no-uppercase tag-item-height" 
                                                    small depressed 
                                                    @click="renameTag(tag.text)">
                                                        <v-icon class="ma-0 px-1 icon-tint" dense>
                                                            mdi-pencil-outline
                                                        </v-icon>
                                                        <span class="closespacing"> 
                                                            Переименовать 
                                                        </span>
                                                        <v-spacer/>
                                                    </v-btn>
                                                    <v-btn class="white red--text ma-0 pa-0 no-uppercase tag-item-height" 
                                                    small depressed>
                                                        <v-icon dense class="ma-0 px-1 red--text">
                                                            mdi-trash-can-outline
                                                        </v-icon>
                                                        <span class="closespacing"> 
                                                            Удалить тэг 
                                                        </span>
                                                        <v-spacer/>
                                                    </v-btn>
                                                </v-card>
                                            </v-menu>
                                        </v-btn>
                                        <v-divider></v-divider>
                                    </v-list-item-title>
                                </div>
                                <div v-else>
                                    <v-list-item-title class="px-0 ma-0 tag-item-height tag-hint">
                                        <span class="icon-tint m-text--size13">
                                            Нажмите Enter, чтобы создать новый тэг
                                        </span>
                                    </v-list-item-title>
                                </div>
                                <div v-if="savedTagText">
                                    <v-list-item-title class="d-flex justify-space-between px-0 ma-0 tag-item-height tag-hint">
                                        <span class="ml-4 mr-2 icon-tint m-text--size13">
                                            Выберите цвет для тэга: 
                                        </span>
                                        <div class="d-flex">
                                            <v-icon class="green--text ma-0 pa-0" dense
                                            @click="updateTaskTags(savedTagText,'green')">
                                                mdi-circle
                                            </v-icon>
                                            <v-icon class="blue--text ma-0 pa-0" dense
                                            @click="updateTaskTags(savedTagText,'blue')">
                                                mdi-circle
                                            </v-icon>
                                            <v-icon class="red--text ma-0 pa-0" dense
                                            @click="updateTaskTags(savedTagText,'red')">
                                                mdi-circle
                                            </v-icon>
                                            <v-icon class="purple--text ma-0 pa-0" dense
                                            @click="updateTaskTags(savedTagText,'purple')">
                                                mdi-circle
                                            </v-icon>
                                        </div>
                                    </v-list-item-title>
                                </div>

                            </div>

                            <!-- time estimate menu -->
                            <v-card class="tag-data-card flex-column" v-if="actions_item.title == 3">
                                <div class="ma-0 pa-0 d-flex flex-nowrap tag-item-height align-center">
                                    <div class="ml-2 d-flex flex-nowrap takes-half no-text-wrap">  
                                        <!-- Повесить тултип на иконку -- not done -->
                                        <span class="m-text--size13"> Оцените время </span>
                                        <v-divider vertical class="mx-1"/>
                                        <v-icon class="icon-tint" dense> mdi-help-circle </v-icon>
                                    </div>
                                    <div class="mr-2 takes-half">
                                        <input class="m-text--size13 px-1 tag-item-height width-100 no-outline" 
                                        v-model="timeEstimate"
                                        placeholder="Начните вводить"
                                        @keyup.enter="enterTimeEstimate"/>
                                    </div>
                                </div>

                                <v-divider class="width-100"/>
                                
                                <!-- hint shown when no existing tag matches user input -->
                                <div class="tag-item-height width-100 d-flex flex-nowrap align-center justify-end">
                                    <span class="m-text--size13 px-2 mx-2 italic"> Нажмите Enter для ввода </span>
                                </div>
                            </v-card>

                        </v-card>
                    </v-menu>
                    <!-- v-else-if - 'spacer'; spacer -->
                    <v-spacer v-else-if="actions_item.title == 'spacer'"></v-spacer>

                </v-card-subtitle>

            </div>
            <!-- Task actions-onhover end -->
        </div>
        <!-- div task-wrap-hoverable end -->

        <!-- buttons '+ Добавить этап' & 'Редактировать' -->
        <!-- Sh: button '+ Добавить этап' is disabled due to api not being finished -->
        <div v-show="!keepActionsVisible">
            <v-card-subtitle class="add-subtask pb-1 pt-0">
                <v-btn class="add-subtask-buttons white ma-0 px-1 invisible" small depressed>
                    <v-icon class="ma-0 pa-0 icon-15"> mdi-plus </v-icon> Добавить этап
                </v-btn>

                <v-spacer class="invisible"/>

                <v-btn class="white ma-0 px-1" 
                small depressed 
                @click="editTask(item)">
                    <v-icon class="ma-0 pa-0 icon-15"> 
                        mdi-pencil-outline 
                    </v-icon> 
                    {{ checkOwner(item.owner) ? 'Редактировать' : 'Подробнее' }}
                </v-btn>
            </v-card-subtitle>
        </div>

        <v-divider/>

        <!-- Creation and Due date-->
        <v-card-actions class="py-1 pr-2 pl-0">
            <div>
                <v-card-subtitle class="py-0">
                    Создан: {{ getDate(item.create) }}
                </v-card-subtitle>
                <v-card-subtitle class="py-0" v-if="checkDeadlineValidity()">
                    До: {{ getDate(item.deadline) }}
                </v-card-subtitle>
            </div>
            <v-spacer></v-spacer>
        </v-card-actions>

    </v-card>
</template>

<script>
export default {
    name: 'Task',
    props: ['item', 'editItem',],
    data(){
        return {
            duedate: this.checkDeadlineValidity(),
            date: this.item.deadline,
            prioritised: false,
            tags: [],
            timeEstimate: '',
            favorited: false,
            completed: false,
            selected: false,
            actionsShow: false,
            inputTagText: '',
            savedTagText: null,
            taskActionsWithMenus: [],
            testTags: [
                {tag_id: 1, text: 'Test tag 1', color: 'purple',},
                {tag_id: 2, text: 'Test tag 2', color: 'green',},
                {tag_id: 3, text: 'Test tag 3', color: 'blue',},
                {tag_id: 4, text: 'Test tag 4', color: 'red',},
            ],
            vMenuModels: {}, 
            disabledButtons: ['spacer','prioritized','tags','timer','favorite','completion','selection','moreoptions']
        }
    },
    watch: {
        // works only with returned props
        completed: { handler() { console.log('it changed') }, }
    },
    computed: {
        getOwner(){
            return this.$store.state.administration.user.id
        },
        getProjects(){
            return this.$store.state.workflow.projects
        },
        keepActionsVisible() {
            // both taskActionsWithMenus and vMenuModels are calculated on created() based on taskActions()
            let keep = this.actionsShow
            for (let i of this.taskActionsWithMenus) { keep = keep || this.vMenuModels[i] }
            return keep
        },
        taskActions() {
            //action buttons list and functions called when pressed 
            //title is used to determine elements; title 'spacer' is reserved for v-spacer element;
            //pic is icon picture; hasMenu determines if has active menu element connected to button;
            //pop is pop-up tooltip; activeColor determines color of icon when clicked;
            let task_actions = [
                {
                    pic: 'mdi-calendar-check-outline',
                    pop: 'Дата сдачи' + [this.checkDeadlineValidity() ? ': ' + this.getDate(this.item.deadline) : ''],
                    func: 'doesNothing',
                    title: 'calendar',
                    activeColor: this.duedate ? 'gray' : 'gray', 
                    hasMenu: true,
                },
                {
                    pic: this.prioritised ? 'mdi-flag-variant' : 'mdi-flag-variant-outline',
                    pop: 'Отметить приоритетной',
                    func: 'prioritisedClicked',
                    title: 'prioritized',
                    activeColor: this.prioritised ? 'red' : 'gray',
                    hasMenu: false,
                },
                {
                    pic: 'mdi-tag-multiple-outline',
                    pop: 'Добавить теги',
                    func: 'doesNothing',
                    title: 'tags',
                    activeColor: 'gray',
                    hasMenu: true,
                },
                {
                    pic: this.timeEstimate ? 'mdi-timer-sand' : 'mdi-timer-sand-empty',
                    pop: this.timeEstimate ? this.timeEstimate : 'Оценить срок выполнения',
                    func: 'doesNothing',
                    title: 'timer',
                    activeColor: this.timeEstimate ? 'black' : 'gray',
                    hasMenu: true,
                },
                {
                    pic: 'mdi-star-circle-outline',
                    pop: '',
                    func: 'doesNothing',
                    title: 'favorite',
                    activeColor: this.favorited ? 'blue' : 'gray',
                    hasMenu: false,
                },
                {
                    pic: '',
                    pop: 'spacer',
                    func: 'doesNothing',
                    title: 'spacer',
                    activeColor: 'transparent',
                    hasMenu: false,
                },
                {
                    pic: 'mdi-check',
                    pop: 'Отметить выполненной',
                    func: 'completedClicked',
                    title: 'completion',
                    activeColor: this.completed ? '#64DD17' : 'gray',
                    hasMenu: false,
                },
                {
                    pic: this.selected ? 'mdi-checkbox-marked-circle-outline' : 'mdi-checkbox-blank-circle-outline',
                    pop: 'Выбрать несколько задач',
                    func: 'selectionClicked',
                    title: 'selection',
                    activeColor: this.selected ? 'black' : 'gray',
                    hasMenu: false,
                },
                {
                    pic: 'mdi-dots-horizontal',
                    pop: 'Больше опций',
                    func: 'doesNothing',
                    title: 'moreoptions',
                    activeColor: 'gray',
                    hasMenu: true,
                },
            ]
            return task_actions
        },
        taskTags() {
            // tags added from updateTaskTags - needs testing
            let tags = []
            return tags
        },
        filteredTags() {
            // tags filtered to match user input in addTags menu; testTags must be replaced with tagPool avaliable for the project
            let tags = []
            for (let tag of this.testTags) {
                if (tag.text.includes(this.inputTagText) || this.inputTagText === '' ) { tags.push(tag) }
            }
            return tags
        },
    },
    methods: {
        checkOwner(v){
            return this.getOwner == v
        },
        editTask(i){
            this.$emit('update:editItem', i)
        },
        getDate(d){
            let options = {year: 'numeric', month: 'short', day: '2-digit'}
            return (new Date(d)).toLocaleDateString("ru-RU", options)
        },
        getProjectName(v) {
            // v - item.project
            let projectname = this.getProjects.find(a => a.id == v).info.name
            return projectname
        },
        dateForPicker(d) {
            //let options = {year: '4-digit', month: '2-digit', day: '2-digit'}  , options
            return (new Date(d)).toLocaleDateString("en-CA")
        },
        getTaskDescription(str){

            const decodeHtmlCharCodes = str =>
                str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
                    String.fromCharCode(charCode)).replace(/(&amp;)/g,"&").trim();

            return decodeHtmlCharCodes(str)
        },
        handleTaskActions(v,elem) {
            // v - title; elem - $event
            let funcName = this.taskActions.find(a => a.title == v).func
            this[funcName](v,elem)
            // calls element 'this.taskActions.find(a => a.title == v).func' of object 'this', with an argument (v,elem)
        },
        selectionClicked() {
            this.selected = !this.selected
        },
        completedClicked() {
            this.completed = !this.completed
        },
        prioritisedClicked() {
            this.prioritised = !this.prioritised
        },
        getActiveColor(v) {
            // v - title of corresponding cell associated with property; finds activeColor for property associated with title v
	        let cell = this.taskActions.find(item => item.title == v)
            return cell.activeColor
        },
        checkDeadlineValidity() {
            // temp crutch: when a task is created without deadline, deadline is set to at 01.01.1970; when fixed, remove this 
            if (this.item.deadline < this.item.create || this.item.deadline == '') {
                return false
            }
            return true
        },
        updateTaskTags(v,color) {
            // v - tag text string; add color picker later - not done;
            if (!v) { 
                console.log('tag is empty')
                return null
            }
            // should not be reachable, but will stay for safety reasons
            if (!color) { 
                color = 'blue' 
            }

            let formedTag = {text:v, color:color,}

            // if not alredy exists, add; if exists, replace color 
            function updateTag(arr,newTag) {
                let elem = arr.find(el => el.text === newTag.text)
                if (!elem) {
                    arr.push(newTag)
                } else if (elem.color !== newTag.color) {
                    var x = arr.indexOf(elem) 
                    arr.splice(x, 1, newTag)
                }
            }

            updateTag(this.taskTags, formedTag)
            updateTag(this.testTags, formedTag) // FOR TESTING WHEN DONE REPLACE WITH UPDATE $store

            this.inputTagText = ''
            this.savedTagText = null
            this.vMenuModels[2] = false // closing menu after selection
            this.$forceUpdate()
        },
        formTagColorClass(v) {
            // v - string with a general color name from MD vue palette; red green purple etc. 
            // https://vuetifyjs.com/en/styles/colors/#material-colors
            // forms vue-accepted color scheme class for tags;
            let clss = v + ' lighten-3 ' + v + '--text text--darken-4'
            return clss
        },
        handleTagColorChange(v) {
            // v - tag text string;
            this.inputTagText = v
            this.saveTagText(v)
        },
        removeTagFromTask(v) {
            // v - tag text string;
            let tagIndex = this.taskTags.findIndex(el => el.text == v)
            console.log(v, tagIndex)
            if (tagIndex>-1) {this.taskTags.splice(tagIndex,1)}
            this.$forceUpdate()
        },
        saveTagText(v) {
            // v - tag text string;
            if (!v) { 
                console.log('tag string is empty')
                return null
            }
            this.savedTagText = v
            this.$forceUpdate()
        },
        renameTag(v) {
            // v - tag text string; not done
            console.log(v)
        },
        transformDateFromPicker(v) {
            return v + 'T03:00:00+03:00'
        },
        updateTaskDeadline() {

            let formData = new FormData()

            let body = {
                deadline: this.transformDateFromPicker(this.date)
            }
            formData.append('JSON', JSON.stringify(body))
            // updateTask returns 'undefined', so async/await have no effect
            this.$store.dispatch('workflow/updateTask', {
                type_id: 'c',
                id: this.item.company_id,
                project_uuid: this.item.project,
                body: formData,
                task_id: this.item.task_id.toString(),
                filter: {}
            })
            this.vMenuModels[0] = false // closing menu after selection
        },
        enterTimeEstimate() {
            // preliminary version, just closes the menu atm; in future must update the parameters of the task
            this.vMenuModels[3] = false
            this.$forceUpdate()
        },
        /* temporary for testing & debug ; remove when done */
        doesNothing() {
            console.log('called doesNothing, functionality is not done yet')
        },
        /* temporary for testing & debug  */
    },
    created() {
        // forming list of the action buttons with menus; forming v-model list for menus;
        for (let el of this.taskActions) {
            if (el.hasMenu) { this.taskActionsWithMenus.push(el.title) }
            this.vMenuModels[el.title]=false
        }
    },
}
</script>

<style scoped>

.no-overflow {
    overflow: hidden;
}

.cursor-pointer.v-card {
    cursor: pointer;
}

/* hower transformation & actions */

.actions-onhover {
    display: flex;
	display: -ms-flexbox;
	display: -webkit-flex;
	justify-content: flex-start;
	gap: 0.4em;
    height: 30px;
}

.add-subtask {
	display: flex;
	display: -ms-flexbox;
	display: -webkit-flex;
	height: 30px;
}

.add-subtask-buttons {
	min-width: 0%; 
	min-height: 0%; 
	height: 25px;
}

.dscr-btn.v-btn {
    padding: 2px;
    background-color: transparent;
    min-width: 0% !important;
    width: 22px !important;
    min-height: 0% !important;
    height: 22px !important;
}

/* icons */

.icon-tint {
	color: gray; 
} 

.icon-tint.v-icon {
	color: gray; 
} 

.tilt {
	transform: rotate(45deg) scaleX(-1);
}

.task-card-icons:hover {
	color: black !important;
}

.icon-15 {
    font-size: 15px;
}
/* end icons */

.description {
    padding: 15px;
    min-width: 30vw;
    min-height: 30vh;
    max-width: 30vh;
}

.v-tooltip__content {
	background-color: black;
}

/* action menu slyles */
.menu-mounting-point {
    z-index: 10;
}

.mounted-menu-card {
    width: 280px;
    min-width: 280px;
    max-width: 280px;
    max-height: 225px;
    overflow-y: scroll;
}

/* scrollbar (tag menu) */
.mounted-menu-card::-webkit-scrollbar {
    width: 5px;
}

.gutter {
    scrollbar-gutter: stable; 
}

.mounted-menu-card::-webkit-scrollbar-track {
    border-radius: 10px;
}

.mounted-menu-card::-webkit-scrollbar-thumb {
    background: #888; 
    border-radius: 10px;
}

.mounted-menu-card::-webkit-scrollbar-thumb:hover {
    background: #555; 
}
/* end scrollbar */

/* tag-related styles */
.tag-data-card {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 280px;
    min-width: 280px;
    max-width: 280px;
    max-height: 225px;
}

.tag-item-height {
    height: 2.5em;
}

.tag-btn {
    display: flex; 
    justify-content: space-between;
}

.tag-btn.v-btn {
	background-color: white; 
    width: 100%;
    height: 2.5em;
}

.tag-icon {
    visibility: hidden;
}

.tag-btn:hover .tag-icon {
	visibility: visible;
}

.inner-tags-container {
    display: flex; 
    flex-direction: row; 
    justify-content: flex-start; 
    flex-wrap: wrap; 
    column-gap: 5%; 
    row-gap: 0.2em; 
    box-sizing: border-box;
}

.inner-tag-appear-on-hover {
    border-radius: inherit; 
    position: absolute; 
    right: 0px; 
    height: 100%; 
    display: flex; 
    align-items: center;
    visibility: hidden;
}

.inner-tag-btn {
    min-width: 0px !important; 
    min-height: 0px !important; 
    width: fit-content !important; 
    height: 100% !important;
}

.tag-plaque:hover > .inner-tag-appear-on-hover {
    visibility: visible;
}

.tag-plaque {
    position: relative;
    width:45%; 
    height:1.8em; 
    border-radius: 0 1em 1em 0; 
    display: flex; 
    align-items: center;
}

.tag-hint {
    display: flex; 
    justify-content: center; 
    align-items: center;
}

.tagEdit-menu {
    min-width: 15vw;
}

.tag-btn :deep(.v-btn__content){
    max-width: 100%;
}
/* end tag-related */

/* utility classes */
.max-width-100 {
	max-width: 100%;
}

.max-width-80 {
    max-width: 80%;
}

.max-width-20 {
    max-width: 20%;
}

.width-100 {
    width: 100%;
}

.truncate {
	white-space: nowrap; 
	overflow: hidden; 
	text-overflow: ellipsis;
}

.description-text {
    white-space: pre-wrap;
}

.invisible {
    display:none !important;
}

.no-uppercase {
     text-transform: unset !important;
}

.closespacing {
    letter-spacing: 0.01em;
}

.border-box {
    box-sizing: border-box;
}

.takes-half {
    width: 50%;
    max-width: 50%;
}

.italic {
    font-style: italic;
}

.no-text-wrap {
    white-space: nowrap;
}

.no-outline {
    outline: none;
}

.border-inherit {
    border-radius: inherit;
}

.font-size-14px {
    font-size: 14px !important;
}


</style>
