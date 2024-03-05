<template>
    <div class="coordination-space-wrapper">

        <div class="cs-message">

        </div>
        
        <div class="cs-button-wrap">
            <el-button type="main" @click="showDialog">
                Создать пространство
            </el-button>
        </div>

        <div class="cs-table-wrap">
            <div class="cs-loading vm-progress" v-if="loading">
                <inline-svg class="inline-svg" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
            </div>
            <ub-table
                v-else
                :data="spaces"
                :headers = "[
                    {name: 'name', title: 'название', width: '340', icon: null, click: null, }, 
                    {name: 'path', title: 'путь к папке', width: '250', icon: null, click: null, },
                    {name: 'created_at', title: 'создано', width: '150', icon: null, click: null, },
                    {name: 'contributor', title: 'Загрузил', width: '200', icon: null, click: null, },
                    // {name: 'collisions', title: 'коллизии', width: '100', icon: null, click: null, },
                    {name: 'status', title: 'изменить статус', width: '200', icon: null, click: null, },
                    {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
                ]"
                :savedcolumnwidth="loadColumnWidth()"
                @save_columns_width="saveColumnsWidth"
            >

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


                <!-- path / путь к папке -->
                <template v-slot:column2="{ item }">
                        <el-tooltip 
                            effect="dark" 
                            :disabled="!needs_tooltip"
                            placement="right">
                                <template #content>
                                    {{ item.path }}
                                </template>
                                <span class="truncate-text" 
                                    style="cursor: pointer;"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{ item.path }}
                                </span>
                        </el-tooltip>   
                </template>


                <!-- created_at / созадно -->
                <template v-slot:column3="{ item }">
                        <el-tooltip 
                            effect="dark" 
                            :disabled="!needs_tooltip"
                            placement="right">
                                <template #content>
                                    {{ getDate(item.created_at) }}
                                </template>
                                <span class="truncate-text" 
                                    style="cursor: pointer;"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{ getDate(item.created_at) }}
                                </span>
                        </el-tooltip>   
                </template>


                <!-- contributor / загружено -->
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


                <!-- collisions / коллизии
                <template v-slot:column5="{ item }">
                        <el-tooltip 
                            effect="dark" 
                            :disabled="!needs_tooltip"
                            placement="right">
                                <template #content>
                                    {{ item.owner }}
                                </template>
                                <span class="truncate-text" 
                                    style="cursor: pointer;"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{ item.owner }}
                                </span>
                        </el-tooltip>   
                </template> -->


                <!-- status / статус -->
                <template v-slot:column6="{ item }">

                        <div class="inline-loader" v-if="status_changing == item.id">
                            <inline-svg style="color:rgb(6, 150, 215);" class="inline-svg inline-loader" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
                        </div>
                        <el-tooltip 
                            v-else
                            effect="dark" 
                            :disabled="!needs_tooltip"
                            placement="right">
                                <template #content>
                                    {{ getStatus(item.mod_view).title }}
                                </template>
                                <span class="truncate-text" 
                                    :style="{ 'cursor': 'pointer', 'color': getStatus(item.mod_view).color, }"
                                    @mouseover="checkIfNeedsTooltip"
                                    @click="showToggleStatusDialog(item)">
                                    {{ getStatus(item.mod_view).title }}
                                </span>
                        </el-tooltip>   
                </template>


                <!-- техническая колонка -->
                <template v-slot:column7="{ item }">
                </template>

            </ub-table>
        </div>


        <create-dialog
            v-if="show"
            :show.sync="show"
            @create="createSpace">
        </create-dialog>

        <v-dialog
            v-model="show_status_change_dialog"  
            max-width="500px"
            @click:outside="cancel">

            <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 250px;">
                <div class="change-status-header">
                    <span> Изменить статус? </span>
                    <v-btn
                        text
                        icon
                        @click="closeToggleStatusDialog"
                        color="#7f7f7f">
                        <v-icon size="20"> close </v-icon>
                    </v-btn>
                </div>
                
                <div class="change-status-footer">
                    <el-button type="outlined" @click="closeToggleStatusDialog"> 
                        <span>
                            Отмена
                        </span>
                    </el-button>

                    <el-button type="red" @click="toggleStatus(status_to_change)">
                        <span>
                            Изменить
                        </span>
                    </el-button>
                </div>
            </div>

        </v-dialog>
    </div>
</template>


<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"
import CreateDialog from "./CreateDialog.vue"

export default {
    name: 'CoordinationSpaces',
    props: ['project'],
    components: {
        ubTable,
        CreateDialog,
        InlineSvg,
    },
    data() {
        return {
            show: false,
            spaces: [],

            needs_tooltip: false,

            show_status_change_dialog: false,
            status_to_change: null,
            status_changing: null,
            loading: false,
        }
    },
    methods: {
        createSpace(space) {
            // creates space
            let body = {
                title: space.title,
                url: space.folder_id,
                mod_view: true,
                models: {
                    files: []
                }
            }

            this.$store.dispatch('workflow/createSpace', {
                project_uuid: this.project.id,
                body: body
            })
            .then(res => {
                this.$notify({
                    group: 'note',
                    type: 'success',
                    message: 'Пространство ' + body.title + ' успешно создано.',
                    text: 'Пространство ' + body.title + ' успешно создано.',
                })
                this.getSpaces()
                this.show = false
            })
            .catch( res => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    message: 'Не удалось создать пространство.',
                    text: 'Не удалось создать пространство.',
                })
            })

        },
        showDialog() {
            this.show = true
            // console.log('setting show', this.show)
        },
        cancel() {
            this.show = false
        },
        getSpaces() {
            this.$store.dispatch('workflow/getSpaces', this.project.id)
            .then( res => {
                this.spaces = res
                this.loading = false
                this.status_changing = null
                console.log('got spaces', res)
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
        getDate(d) {
            if (!d) {
                return '--'
            }
            let options = {year: 'numeric', month: 'short', day: '2-digit'}
            return (new Date(d)).toLocaleDateString("ru-RU", options) 
        },
        getUser(id) {
            if (!this.managers) {
                return ''
            }
            if (!id) {
                return '--'
            }
            let manager = this.managers.find(obj => obj.id == id)
            return manager ? manager : { name: 'Неизвестный пользователь' }
        },
        getStatus(sts) {
            if (sts) {
                return { title: 'Деактивировать', color: 'darkred', }
            }
            return { title: 'Активировать', color: '#0696d7', }
        },
        showToggleStatusDialog(item) {
            this.status_to_change = item
            this.show_status_change_dialog = true
        },
        closeToggleStatusDialog() {
            this.show_status_change_dialog = false
        },
        toggleStatus(item) {
            if (!item) {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    message: 'Не удалось изменить статус.',
                    text: 'Не удалось изменить статус.',
                })
                this.closeToggleStatusDialog()
                return null
            }
            this.status_changing = item.id
            let newBody = JSON.parse(JSON.stringify(item))
            newBody.mod_view = !newBody.mod_view
            // console.log(item)
            this.$store.dispatch('workflow/changeSpace', {
                project_uuid: this.project.id,
                body: newBody,
            })
            .then( res => {
                // console.log('finished')
                this.closeToggleStatusDialog()
                this.getSpaces()
            })
            .catch( res => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    message: 'Не удалось изменить статус.',
                    text: 'Не удалось изменить статус.',
                })
                this.closeToggleStatusDialog()
                this.status_changing = null
            })
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-coordinationspaces-table'

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
            const item = 'workflow-coordinationspaces-table'
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
    },
    watch: {
        'show'() {
            console.log('show changed', this.show)
        }
    },
    mounted() {
        this.loading = true
        this.getSpaces()
    }
}
</script>

<style lang="scss" scoped>
/////////////////// 

.coordination-space-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: hidden;
}

.cs-button-wrap {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: calc(60px);
}

.cs-table-wrap {
    height: calc(100% - 60px);
}

.cs-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.avatar {
    max-height: 24px;
    max-width: 24px;
    margin-right: 8px;
}

.inline-loader {
    display: flex;
    justify-content: start;
    max-height: 24px;
    max-width: 24px;
}


.change-status-header {
    height: 70px;
    font-weight: 400;
    font-size: 24px;
    line-height: 30px;
    color: #3c3c3c;
    min-height: 70px;
    max-height: 70px;
    border-bottom: 1px solid #dcdcdc;
    background-color: #fdfdfd;
    padding: 20px 24px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.change-status-footer {
    min-height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: end;
    align-items: center;
    padding: 16px;
}
</style>
