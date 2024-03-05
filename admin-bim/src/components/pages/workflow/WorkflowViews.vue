<template>
    <v-container pt-0 fluid fill-height text-xs-center class="page-container marker">
        <div class="views-secondary-wrap">

            <!-- заголовок -->
            <div class="project-wrapper">
                <span class="project-title">
                    Виды
                </span>

                <!-- выбор space -->
                <div class="views-space-select" style="margin-left: auto; margin-right: 16px;">
                    <el-select
                        value-key="id"
                        v-model="current_space"
                        placeholder="Выберите пространство">
                        
                        <el-option
                            v-for="space in spaces"
                            :key="space.id"
                            :value="space"
                            :label="space.title">
                        </el-option>

                    </el-select>
                </div>
            </div>

            <!-- замещение вкладки для совпадения по высоте -->
            <div class="tabs-blank"></div>

            <!-- обертка -->
            <div class="views-main-body">
               
                <div class="table-and-details">
                    <div class="left-wrap">
                        <ub-table
                            :data="testViews"
                            :headers="[
                                {name: 'name', title: 'название вида', width: '250', icon: null, click: null, }, 
                                {name: 'save_to_docs', title: 'сохранить', width: '200', icon: null, click: null, },
                                {name: 'last_save', title: 'последнее сохранение', width: '230', icon: null, click: null, },
                                {name: 'created_by', title: 'создатель', width: '250', icon: null, click: null, },
                                {name: 'updated_at', title: 'обновлено', width: '200', icon: null, click: null, },
                                {name: 'privacy', title: 'доступ', width: '80', icon: null, click: null, },
                                {name: 'details', title: 'детали', width: '80', icon: null, click: null, },
                                {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
                            ]"
                            :savedcolumnwidth="loadColumnWidth()"
                            @save_columns_width="saveColumnsWidth">

                            <!-- name / название -->
                            <template v-slot:column1="{ item }">
                                <el-tooltip 
                                    effect="dark" 
                                    :disabled="!needs_tooltip"
                                    placement="right">
                                        <template #content>
                                            {{ item.title }}
                                        </template>
                                        <span class="truncate-text" 
                                            @mouseover="checkIfNeedsTooltip">
                                            {{ item.title }}
                                        </span>
                                </el-tooltip>   
                            </template>

                            <!-- save_to_docs / сохранить -->
                            <template v-slot:column2="{ item }">
                                <span 
                                    class="link-like-text truncate-text" 
                                    @mouseover="checkIfNeedsTooltip"
                                    @click="saveToDocs(item)">
                                            Сохранить в документы
                                    </span>
                            </template>

                            <!-- last_save / последнее сохранение -->
                            <template v-slot:column3="{ item }">
                                <el-tooltip 
                                    effect="dark" 
                                    :disabled="!needs_tooltip"
                                    placement="right">
                                        <template #content>
                                            {{ getDate(item.todoc_at) }}
                                        </template>
                                        <span class="truncate-text" 
                                            @mouseover="checkIfNeedsTooltip">
                                            {{ getDate(item.todoc_at) }}
                                        </span>
                                </el-tooltip>   
                            </template>

                            <!-- created_by / создатель -->
                            <template v-slot:column4="{ item }">
                                <v-img
                                class="avatar"
                                :src="getUser(item.owner).avatar"
                                ></v-img>
                                <el-tooltip 
                                    effect="dark" 
                                    :disabled="!needs_tooltip"
                                    placement="right">
                                        <template #content>
                                            {{ getUser(item.owner).name }}
                                        </template>
                                        <span class="truncate-text" 
                                            @mouseover="checkIfNeedsTooltip">
                                            {{ getUser(item.owner).name }}
                                        </span>
                                </el-tooltip>   
                            </template>

                            <!-- updated_at / обновлено -->
                            <template v-slot:column5="{ item }">
                                <el-tooltip 
                                    effect="dark" 
                                    :disabled="!needs_tooltip"
                                    placement="right">
                                        <template #content>
                                            {{ getDate(item.updated_at) }}
                                        </template>
                                        <span class="truncate-text" 
                                            @mouseover="checkIfNeedsTooltip">
                                            {{ getDate(item.updated_at) }}
                                        </span>
                                </el-tooltip>   
                            </template>

                            <!-- privacy / доступ -->
                            <template v-slot:column6="{ item }">
                                <div class="private">
                                    <i style="font-size: 24px;" v-if="item && item.public" class="el-icon-s-custom"></i>
                                    <i style="font-size: 24px;" v-if="item && !item.public" class="el-icon-s-custom"></i>
                                </div>
                            </template>

                            <!-- details / детали -->
                            <template v-slot:column7="{ item }">
                                <div class="details-box" @click="showDetails">
                                    <div class="details-btn">
                                        <i class="el-icon-arrow-right"></i>
                                    </div>
                                </div>
                            </template>

                            <!-- menu / техническая колонка -->
                            <template v-slot:column8="{ item }">
                            </template>


                        </ub-table>
                    </div>

                    <div :class="show_details ? '' : 'shrink'" class="right-wrap">
                        <div class="details-header">
                            <span>
                                Детали
                            </span>
                            <v-btn
                                text
                                icon
                                @click="closeDetails"
                                color="#7f7f7f">
                                <v-icon size="16"> close </v-icon>
                            </v-btn>
                        </div>
                        <div class="details-body">
                            <div class="body-title">
                                <div class="title-plate">
                                    Название
                                    <span v-if="current_view"> {{ current_view.title }} </span>
                                </div>
        
                                <div class="btn-wrap">
                                    <div class="centered">
                                        <i style="font-size: 24px;" v-if="current_view && current_view.public" class="el-icon-s-custom"></i>
                                        <i style="font-size: 24px;" v-if="current_view && !current_view.public" class="el-icon-s-custom"></i>
                                        <span> {{ current_view && current_view.public ? 'Открытый доступ' : 'Приватный доступ' }} </span> 
                                    </div>
                                    
                                    <span class="save"> 
                                        Сохранить
                                    </span>
                                </div>
                            </div>
                            <div class="body-scrollable">

                                <div class="details-field">
                                    <span v-if="current_view" class="df-header">
                                       Файлы
                                    </span>
                                    <span v-if="current_view && current_view.models && current_view.models.files">
                                        <span 
                                            class="truncate-text"
                                            v-for="file, index in current_view.models.files">
                                            {{ file.title }} {{index < current_view.models.files.length ? ',' : '' }}
                                        </span>
                                    </span>
                                    <span v-else>
                                        --
                                    </span>
                                </div>

                                <div class="details-field">
                                    <span class="df-header">
                                       Обновлено
                                    </span>
                                    <span v-if="current_view">
                                        {{ getDate(current_view.updated_at) }}
                                    </span>
                                    <span v-else>
                                        --
                                    </span>
                                </div>

                                <div class="details-field">
                                    <span class="df-header">
                                       Последняя дата сохранения
                                    </span>
                                    <span v-if="current_view" class="todoc">
                                        {{ getDate(current_view.todoc_at) }}
                                    </span>
                                    <span v-else>
                                        --
                                    </span>
                                </div>

                                <div class="details-field">
                                    <span class="df-header">
                                       Кем создано
                                    </span>
                                    <span v-if="current_view" class="view_owner">
                                        <v-img
                                            class="avatar"
                                            :src="getUser(4).avatar"
                                        ></v-img>
                                        <!-- current_view.owner -->
                                        {{ getUser(4).name }}
                                    </span>
                                    <span v-else>
                                        --
                                    </span>
                                </div>

                                <div class="details-field">
                                    <span class="df-header">
                                       Описание
                                    </span>
                                    <span v-if="current_view && current_view.dscr">
                                        {{ current_view.dscr }}
                                    </span>
                                    <span class="no-description" v-else>
                                        Описания нет
                                    </span>
                                </div>


                            </div>
                            <div class="body-footer">
                                <el-button type="main" @click="openView">
                                    Открыть
                                </el-button>
                                <el-button style="margin: 0;" type="redtext" @click="deleteView">
                                    Удалить
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </v-container>
</template>


<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"

export default {
    name: 'WorkflowViews',
    components: {
        InlineSvg,
        ubTable,
    },
    data() {
        return {
            spaces: [],
            current_space: null,

            views: [],
            current_view: null,

            show_details: false,

            needs_tooltip: false,

            testViews: [
                {
                    "cons": {
                    "doc_files_chd": [
                        "1",'2','3','4',
                    ],
                    "folder": "1", // string_id
                    "folder_url": "1", // string_id
                    "todoc_at": "string", // data
                    "url": "string" // string_id
                    },
                    "dscr": "Описание вида 1",
                    "id": 0,
                    "models": {
                        "files": [
                            {
                            "folder_url": "string",
                            "id": "string",
                            "owner": 4,
                            "path": "string",
                            "title": "string",
                            "updated_at": "string",
                            "url": "string",
                            "ver": 0
                            }
                        ],
                        "files_chd": [
                            "string"
                        ]
                    },
                    "owner": 4, // id создателя вида
                    "prj_id": "string", // id проекта
                    "public": true, // ???
                    "space": {  // данные по space
                        "created_at": "string", // дата создания space
                        "id": 0,    // space.id
                        "mod_view": true,   // показывать ли пространство в просмотрщике
                        "models": "string", // 
                        "owner": 0, // создатель space
                        "path": "string",   // путь к папке
                        "prj_id": "string", // id проекта
                        "title": "string",
                        "url": "string"
                    },
                    "title": "string",
                    "updated_at": "string"
                }
            ]
          }
    },
    watch: {
        'spaces'(newval, oldval) {
            if (!oldval.length && newval.length) {
                this.current_space = newval[0]
                this.getViews(newval[0])
            }
        },
    },
    methods: {
    /////////////////// загрузка данных с сервисов ///////////////////
        async getSpaces() {
            if (!this.project) {
                return []
            }
            this.$store.dispatch('workflow/getSpaces', this.project.id)
            .then( res => {
            
                let list = res.filter(obj => obj.mod_view == true) // только активные пространства
                this.spaces = list
            
                if (this.current_space == null || this.current_space == undefined) {
                    this.current_space = this.spaces[0]
                }

                if (!this.current_space) {
                    return null // необходимо, если список spaces пустой
                }
            })
            .catch( res => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    message: 'Не удалось получить данные о пространствах.',
                    text: 'Не удалось получить данные о пространствах.',
                })
            }) 
        },
        async getViews(v) {

            let space = v || this.current_space
            if (!space) {
                return null
            }

            this.$store.dispatch('workflow/getViews', {
                project_id: this.project.id,
                space_id: space.id,
            })
            .then( res => {
                console.log('res', res)
                this.views = res ? res : []
            })
            .catch( res => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    message: 'Не удалось получить данные о видах.',
                    text: 'Не удалось получить данные о видах.',
                })
            }) 
        },
        /////////////////// управление таблицей ///////////////////
        showDetails(item) {
            this.current_view = item
            this.show_details = !this.show_details //true
        },
        closeDetails() {
            this.current_view = null
            this.show_details = false
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
        saveToDocs(item) {
            console.log('must save to docs', item)
        },
        getDate(d) {
            if (!d) {
                return '--'
            }
            let options = {year: 'numeric', month: 'short', day: '2-digit'}
            return (new Date(d)).toLocaleDateString("ru-RU", options) 
        },
        getUser(id) {
            // console.log('id', id)
            if (!this.managers) {
                return ''
            }
            if (!id) {
                return '--'
            }
            let manager = this.managers.find(obj => obj.id == id)
            return manager ? manager : { name: 'Неизвестный пользователь' }
        },
        openView() {
            // open view
        },
        deleteView() {
            // open delete dialog
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-views-table'

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
            const item = 'workflow-views-table'
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
    computed: {
        managers(){
            let users = this.$store.state.administration.company.users || []
            
            let list = users.map(u => ({
                value: u.id,
                id: u.id,
                email: u.email,
                avatar: u.avatarSrc,
                name: u.first_name + ' ' + u.last_name,
                role: u.profession,
                status: u.status,
                birthday: u.birth_day,
            }))
            return list
        },
        project() {
            if (!this.$route || !this.$route.params) {
                return null
            }
            let workflow = this.$store.state.workflow
            let project = workflow.projects.filter(i => i.id == this.$route.params.id)
            return project[0] || null
        },
    },
    mounted() {
        this.getSpaces()
    },
}
 
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: 0;
}

.views-secondary-wrap {
    height: 100%;
    width: 100%;
}

.views-space-select {
    margin-right: 8px;
}

.tabs-blank {
    --blank-height: 40px;
    min-height: var(--blank-height);
    max-height: var(--blank-height);
    margin: 0px 16px;
    border-bottom: 2px solid #e4e7ed;
}

.views-main-body {
    display: flex; 
    flex-direction: column; 
    padding: 0; 
    height: 100%;
    // border: 3px solid blue;
}

.table-and-details {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: start;
    height: calc(100% - 130px);
    padding: 16px 16px 0px;
    // border: 3px solid green;
}

.left-wrap {
    height: calc(100%);
    width: calc(100% - 358px);
    flex: 1 1;
}

.right-wrap {
    height: calc(100% - 40px);
    width: 350px;
    max-width: 350px;
    transition: all 0.3s;
    // border: 1px solid blue;
    margin-left: 8px;
    overflow: hidden;
    flex: 1 1;

    box-shadow: (1px 3px 5px rgba(102, 102, 102, 0.7));

    font-size: 14px;
    font-family: "Artifakt Element", sans-serif;
}

.shrink {
    max-width: 0;
    transition: all 0.3s;
}

.link-like-text {
    color: #006eaf;
    cursor: pointer;
    // &:hover {
    //     text-decoration: underline;
    // }
}

.private {
    display: flex; 
    justify-content: center; 
    align-items: center; 
    flex-direction: row; 
    height: 100%; 
    width: 100%; 
    max-width: 65px;
}

.details-box {
    display: flex; 
    justify-content: center; 
    align-items: center; 
    flex-direction: row; 
    height: 100%; 
    width: 100%; 
    max-width: 65px;
}
.details-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: auto;
    height: calc(100% - 8px);
    min-width: 40px;
    max-width: 40px;
    border: 2px solid rgba(6, 150, 215, 0.5);
    border-radius: 4px;
    &:active {
        box-shadow: (0px 0px 5px rgba(6, 150, 215, 0.7));;
    }
    &:hover i {
        filter: drop-shadow(0px 0px 1px rgb(0 0 0 / 0.7));
    }
    & i {
        font-size: 20px;
    }
}

.avatar {
    max-height: 24px;
    max-width: 24px;
    margin-right: 8px;
}

.details-header {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    font-weight: 600;
    height: 48px;
    border-bottom: 1px solid #eee;
}

.details-body {
    display: flex;
    flex-direction: column;
    height: calc(100% - 48px); // header height
    padding: 0px 16px;
    & .body-title {
        height: 96px;
        display: flex;
        flex-direction: column;
        & .title-plate {
            display: flex;
            flex-direction: row;
            justify-content: start;
            align-items: center;
            height: 48px;
            padding: 16px 0px;
        }
        & .btn-wrap {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            height: 48px;
            & .centered {
                display: flex;
                font-weight: 600;
                gap: 8px;
                align-items: center;
            }
            & .save {
                color: #006eaf;
                cursor: pointer;
                &:active {
                    color: rgb(6, 150, 215);
                }
            }
        }
    }
    & .body-scrollable {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        height: calc(100%);
        // border: 1px solid darkred;
        & .details-field {
            display: flex;
            flex-direction: column;
            line-height: 18px;
            margin-bottom: 16px;
            & .df-header {
                margin-bottom: 8px;
                font-weight: 600;
            }
            & .todoc {
                color: #006eaf;
            }
            & .view_owner {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
            }
        }
    }

    & .body-footer {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        gap: 12px;
        height: 150px;
        // border: 1px goldenrod solid;
        padding: 16px 0px;
    }

}

.no-description {
    color: #666666;
}


</style>
