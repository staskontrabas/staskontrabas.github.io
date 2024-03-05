<template>
    <v-container pt-0 fluid fill-height text-xs-center class="page-container marker">
        <div class="members-secondary-wrap">

            <!-- заголовок -->
            <div class="project-wrapper">
                <span class="project-title">
                    Участники
                </span>
            </div>

            <!-- замещение вкладки для совпадения по высоте -->
            <div class="tabs-blank"></div>

            <!-- обертка -->
            <div class="members-main-body">

                <ub-table 
                    v-if="managers && managers.length"
                    :data="managers"
                    :headers="[
                        {name: 'name', title: 'имя', width: '300', icon: null, click: null, }, 
                        {name: 'adress', title: 'адрес почты', width: '200', icon: null, click: null, },
                        {name: 'company', title: 'компания', width: '200', icon: null, click: null, },
                        {name: 'role', title: 'роль', width: '150', icon: null, click: null, },
                        {name: 'status', title: 'статус', width: '150', icon: null, click: null, },
                        {name: 'date_added', title: 'Дата рождения', width: '150', icon: null, click: null, },
                        {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
                    ]"
                    :savedcolumnwidth="loadColumnWidth()"
                    @save_columns_width="saveColumnsWidth"
                    multiselectable>


                        <!-- name / имя -->
                        <template v-slot:column1="{ item }">
                            <v-img
                                class="avatar"
                                :src="item.avatar"
                            ></v-img>
                            <el-tooltip 
                                effect="dark" 
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ item.name }}
                                    </template>
                                    <span class="truncate-text" 
                                        @mouseover="checkIfNeedsTooltip">
                                        {{ item.name }}
                                    </span>
                            </el-tooltip>   
                        </template>


                        <!-- address / е-мейл -->
                        <template v-slot:column2="{ item }">
                            <el-tooltip 
                                effect="dark" 
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ item.email }}
                                    </template>
                                    <span class="truncate-text" 
                                        @mouseover="checkIfNeedsTooltip">
                                        {{ item.email }}
                                    </span>
                            </el-tooltip>   
                        </template>


                        <!-- company / компания -->
                        <template v-slot:column3="{ item }">
                            <el-tooltip 
                                effect="dark" 
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ company }}
                                    </template>
                                    <span class="truncate-text" 
                                        @mouseover="checkIfNeedsTooltip">
                                        {{ company }}
                                    </span>
                            </el-tooltip>   
                        </template>


                        <!-- role / роль -->
                        <template v-slot:column4="{ item }">
                            <el-tooltip 
                                effect="dark" 
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ getRole(item.role) }}
                                    </template>
                                    <span class="truncate-text" 
                                        @mouseover="checkIfNeedsTooltip">
                                        {{ getRole(item.role) }}
                                    </span>
                            </el-tooltip>   
                        </template>


                        <!-- status / статус -->
                        <template v-slot:column7="{ item }">
                            <div class="issue--status-plate" :style="{ 'background-color': getUserStatus(item.status).color, 'margin-right': '8px', }"></div>
                            <el-tooltip 
                                effect="dark" 
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ getUserStatus(item.status).title }}
                                    </template>
                                    <span class="truncate-text" 
                                        @mouseover="checkIfNeedsTooltip">
                                        {{ getUserStatus(item.status).title }}
                                    </span>
                            </el-tooltip>   
                        </template>


                        <!-- date_added / дата добавления -->
                        <template v-slot:column8="{ item }">
                            <el-tooltip 
                                effect="dark" 
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ getDate(item.birthday) }}
                                    </template>
                                    <span class="truncate-text" 
                                        @mouseover="checkIfNeedsTooltip">
                                        {{ getDate(item.birthday) }}
                                    </span>
                            </el-tooltip>   
                        </template>

                        <!-- временная колонка под меню и размер, пока не починю последнюю колонку в ubTable -->
                        <template v-slot:column9="{ item }">
                        </template>

                </ub-table>

            </div>
        </div>
    </v-container>
</template>


<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"

export default {
    name: 'WorkflowMembers',
    components: {
        InlineSvg,
        ubTable,
    },
    data() {
        return {
            needs_tooltip: false,
          }
    },
    watch: {

    },
    methods: {
        checkIfNeedsTooltip(arg) {
            let target = arg.target 
            if (target.offsetWidth < target.scrollWidth) {
                this.needs_tooltip = true           
                return true
            }
            this.needs_tooltip = false
            return false
        },
        getDate(d){
            if (!d) {
                return '--'
            }
            let options = {year: 'numeric', month: 'short', day: '2-digit'}
            return (new Date(d)).toLocaleDateString("ru-RU", options)
        },
        getRole(role) {
            if (!role) {
                return '--'
            }
            else {
                return role
            }
        },
        getUserStatus(sts) {
            // цвета взяты из base_status_pool в workflowIssues
            switch(sts) {
                case 0: {
                    return {title: 'Создан',color: '#3c3c3c',}
                }
                case 1:
                case 200: {
                    return {title: 'Активен',color: '#b7d78c',}
                }
                default: {
                    return {title: 'Создан',color: '#3c3c3c',}
                }
            }
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-members-table'

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
            const item = 'workflow-members-table'
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
        company() {
            return this.$store.state.administration.company.official_name
        },
    },
    mounted() {
    }
}
 
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: 0;
}

.members-secondary-wrap {
    height: calc(100%);
    width: 100%;
}

.tabs-blank {
    --blank-height: 40px;
    min-height: var(--blank-height);
    max-height: var(--blank-height);
    margin: 0px 16px;
    border-bottom: 2px solid #e4e7ed;
}

.members-main-body {
    display: flex; 
    flex-direction: column; 
    padding: 0px 16px; 
    height: calc(100% - 130px); // 130px - заголовок + компенсация
}

.avatar {
    max-height: 24px;
    max-width: 24px;
    margin-right: 8px;
}
</style>
