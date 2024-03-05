<template>
    <div class="issues-settingsTabs-wrap">

        <div class="table-header">

            <!-- левые -->
            <div class="left">

                <el-button class="problem-icon-btn" type="main">
                    <div>
                        <i class="el-icon-plus"></i> 
                        <span> 
                            Создать шаблон проблемы
                        </span>
                    </div>
                </el-button>
            
            </div>

            <!-- правые -->
            <div class="right">
            </div>

        </div>

        <div class="table-wrapper">
            <ub-table 
                :data="table_data"
                :headers="[
                    {name: 'name', title: 'заголовок шаблона', width: '450', icon: null, click: null, }, 
                    {name: 'category', title: 'категория проблем', width: '200', icon: null, click: null, },
                    {name: 'type', title: 'тип проблемы', width: '200', icon: null, click: null, }, 
                    {name: 'user', title: 'назначено пользователю', width: '200', icon: null, click: null, },
                    {name: 'owner', title: 'создано пользователем', width: '450', icon: null, click: null, }, 
                    {name: 'status', title: 'статус шаблона', width: '200', icon: null, click: null, },
                    {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
                ]"
                :savedcolumnwidth="loadColumnWidth()"
                @save_columns_width="saveColumnsWidth">
            
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
                            style="cursor: pointer;"
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.title }}
                        </span>
                    </el-tooltip>  
                </template>


                <!-- category / категория -->
                <template v-slot:column2="{ item }">
                    <el-tooltip 
                        effect="dark" 
                        :disabled="!needs_tooltip"
                        placement="right">
                        <template #content>
                            {{ item.cat.title }}
                        </template>
                        <span class="truncate-text" 
                            style="cursor: pointer;"
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.cat.title }}
                        </span>
                    </el-tooltip>  
                </template>


                <!-- type / тип -->
                <template v-slot:column3="{ item }">
                    <el-tooltip 
                        effect="dark" 
                        :disabled="!needs_tooltip"
                        placement="right">
                        <template #content>
                            {{ item.cat.types[0].title }}
                        </template>
                        <span class="truncate-text" 
                            style="cursor: pointer;"
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.cat.types[0].title }}
                        </span>
                    </el-tooltip>  
                </template>


                <!-- user / назначено пользователю -->
                <template v-slot:column4="{ item }">
                    <el-tooltip 
                        effect="dark" 
                        :disabled="!needs_tooltip"
                        placement="right">
                        <template #content>
                            {{ item.user }}
                        </template>
                        <span class="truncate-text" 
                            style="cursor: pointer;"
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.user }}
                        </span>
                    </el-tooltip>  
                </template>


                <!-- owner / создано пользователем -->
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
                </template>


                <!-- status / статус шаблона -->
                <template v-slot:column6="{ item }">
                    <div class="cat-type-status">
                        <i 
                        class="status-icon"
                        :class="getStatus(item.act_sts).icon" 
                        :style="{'color': getStatus(item.act_sts).color}"
                        >
                        </i>
                        <el-tooltip 
                            effect="dark" 
                            :disabled="!needs_tooltip"
                            placement="right">
                                <template #content>
                                    {{ getStatus(item.act_sts).title }}
                                </template>
                                <span class="truncate-text" 
                                    style="cursor: pointer;"
                                    @mouseover="checkIfNeedsTooltip">
                                    {{ getStatus(item.act_sts).title }}
                                </span>
                        </el-tooltip>   
                    </div>
                </template>


                <!-- техническая колонка -->
                <template v-slot:column7="{ item }">
                </template>


            </ub-table>
        </div>

    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"

export default {
    name: 'SettingsTemplates',
    components: {
        InlineSvg,
        ubTable,
    },
    props: ['data', 'project',],
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
        getStatus(sts) {
            if (sts) {
                return { icon: 'el-icon-circle-check', title: 'Активно', color: 'darkgreen', }
            }
            return { icon: 'el-icon-circle-close', title: 'Неактивно', color: 'black', }
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-templates-table'

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
            const item = 'workflow-templates-table'
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
                avatar: u.avatarSrc,
                name: u.first_name + ' ' + u.last_name,
                role: ''
            }))
            return list
        },
        table_data() {
            const source = this.data.templates
            if (!source) {
                return []
            }
            let list = []
            for (const tmplt of source) {
                list.push(tmplt)
            }
            return list
        },
        
    },
    mounted() {
        console.log('data tmplt', this.data)
    },
}
</script>


<style scoped lang="scss">

.issues-settingsTabs-wrap {
    display: flex; 
    flex-direction: column; 
    padding: 0; 
    height: 100%;
    // border: 3px solid green;
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

.input-wrapper {
    & .v-text-field {
        padding-top: 0px;
    }
}

.table-wrapper {
    height: calc(100% - 157px); // записать формулу для 157
    padding: 0px 16px;
    // border: 3px blue solid;
}

.toggle-icon {
    font-size: 18px;
    margin-right: 8px;
    transition: all 0.15s;
}

.type-cell {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    padding-left: 40px;
    max-width: 100%;
}

.cat-type-status {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    max-width: 100%;
}

.status-icon {
    font-size: 24px;
    margin-right: 8px;
}

.st-mark {
    background-color: #faa21b; 
    margin-right: 8px;
}

</style>