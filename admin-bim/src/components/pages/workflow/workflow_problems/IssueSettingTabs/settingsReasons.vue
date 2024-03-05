<template>
    <div class="issues-settingsTabs-wrap">

        <div class="table-header">

            <!-- левые -->
            <div class="left">

                <el-dropdown trigger="click" :hide-on-click="true" @command="handleCommand">
                    <el-button 
                        class="problem-icon-btn" 
                        type="main">
                        <div>
                            <i class="el-icon-plus"></i> 
                            <span> 
                                Создать 
                            </span>
                        </div>
                    </el-button>

                    <el-dropdown-menu class="test-class" slot="dropdown" >
                        <el-dropdown-item command="showCreateReason"> Создать причину </el-dropdown-item>
                        <el-dropdown-item command="showCreateReasonType"> Создать тип </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            
            </div>

            <!-- правые -->
            <div class="right">
            </div>

        </div>

        <div class="table-wrapper" id="problem-type-fields-table">
            <ub-table 
                :data="table_data"
                :headers="[
                    {name: 'name', title: 'категория основной причины и основная причина', width: '450', icon: null, click: null, }, 
                    {name: 'status', title: 'статус', width: '200', icon: null, click: null, },
                    {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
                ]"
                :savedcolumnwidth="loadColumnWidth()"
                @save_columns_width="saveColumnsWidth">
            
                <!-- title / имя -->
                <template v-slot:column1="{ item }">

                    <!-- if category -->
                    <template v-if="item.cat_id === undefined">
                        <i 
                        class="el-icon-arrow-right toggle-icon" 
                        :style="getArrowIcon(item.id) ? { 'transform': 'rotate(90deg)'} : {}"
                        @click="toggleUnfoldTypes(item.id)"
                        ></i>
                        <el-tooltip 
                            effect="dark" 
                            :disabled="!needs_tooltip"
                            placement="right">
                            <template #content>
                                {{ item.title }}
                            </template>
                            <span class="truncate-text" 
                                style="cursor: pointer;"
                                @click="setCurrentReason(item)"
                                @mouseover="checkIfNeedsTooltip">
                                {{ item.title }}
                            </span>
                        </el-tooltip>  
                    </template>

                    <!-- if type -->
                    <template v-if="item.cat_id !== undefined">
                        <div class="type-cell">
                            <el-tooltip 
                                effect="dark" 
                                :disabled="!needs_tooltip"
                                placement="right">
                                <template #content>
                                    {{ item.title }}
                                </template>
                                <span class="truncate-text" 
                                    style="cursor: pointer;"
                                    @mouseover="checkIfNeedsTooltip"
                                    @click="setCurrentReasonType(item)">
                                    {{ item.title }}
                                </span>
                            </el-tooltip>  
                        </div>
                    </template>
                    
                </template>


                <!-- status / статус -->
                <template v-slot:column2="{ item }">
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
                <template v-slot:column4="{ item }">
                </template>


            </ub-table>
        </div>

        <!-- Create new reason dialogue -->
        <create-new-reason
            v-if="show_create_reason"
            :showdialogue="show_create_reason"
            :data="{}"
            @cancel="cancelCreateReason"
            @create="createNewReason">
        </create-new-reason>

        <!-- Create new reason dialogue -->
        <create-new-reason-type
            v-if="show_create_reason_type"
            :showdialogue="show_create_reason_type"
            :data="{ reasons : data.reasons }"
            @cancel="cancelCreateReasonType"
            @create="createNewReasonType">
        </create-new-reason-type>

    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"
import createNewReason from "./settingsReasons/createNewReason.vue"
import createNewReasonType from "./settingsReasons/createNewReasonType.vue"

export default {
    name: 'SettingsReasons',
    components: {
        InlineSvg,
        ubTable,
        createNewReason,
        createNewReasonType,
    },
    props: ['data', 'project',],
    data() {
        return { 
            needs_tooltip: false,
            unfolded_reasons: [],

            show_create_reason: false,

            show_create_reason_type: false,
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
        toggleUnfoldTypes(category_id) {
            // процедура должна менять подаваемый в таблицу список данных, чтобы отображать / скрывать типы
            let target = this.unfolded_reasons
            if(!target.includes(category_id)) {          
                target.push(category_id)               
            } else {
                target.splice(target.indexOf(category_id), 1) 
            }
        },
        getArrowIcon(id) {
            return this.unfolded_reasons.includes(id)
        },
        getStatus(sts) {
            if (sts) {
                return { icon: 'el-icon-circle-check', title: 'Активно', color: 'darkgreen', }
            }
            return { icon: 'el-icon-circle-close', title: 'Неактивно', color: 'black', }
        },
        handleCommand(command) {
            switch(command) {
                case 'showCreateReason': {
                    this.showCreateReason()
                    break
                }
                case 'showCreateReasonType': {
                    this.showCreateReasonType()
                    break
                }
                default: {
                    return null
                }
            }
        },
        showCreateReason() {
            this.show_create_reason = true
        },
        cancelCreateReason() {
            this.show_create_reason = false
        },
        showCreateReasonType() {
            this.show_create_reason_type = true
        },
        cancelCreateReasonType() {
            this.show_create_reason_type = false
        },
        createNewReason(reas) {
            console.log('creating reason', reas)
            let source = reas
            let reason = {}
            let types = []

            for (const elem of source.types) {
                if (!elem.title) {
                    continue
                }
                types.push({
                    title: elem.title,
                    editable: true,
                    mark: elem.mark,
                    act_sts: elem.act_sts,
                })
            }

            reason.title = source.title
            reason.act_sts = source.act_sts
            reason.editable = true

            this.$store.dispatch('workflow/createReason', { project_id: this.project.id, body: reason, })
            .then(res => {
                let promises = []
                for (let elem of types) {
                    elem.cat_id = res.id
                    promises.push(this.$store.dispatch('workflow/createReasonType', { project_id: this.project.id, body: elem, }))
                }

                Promise.all(promises)
                .then( () => {
                    this.cancelCreateReason()
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Причина ' + reason.title + ' была успешно создана.',
                        message: 'Причина ' + reason.title + ' была успешно создана.',
                    })
                    this.callUpdateReasons()
                    this.cancelCreateReason()
                })
                .catch(err => {
                    console.log('cant create types', err )
                })
            })
            .catch( res => {
                this.cancelCreateReason()
                console.log('error create reason', res)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось создать причину.',
                    message: 'Не удалось создать причину.',
                })
            })
        },
        setCurrentReason(reason) {
            this.$emit('set_edit_reason', reason)
        },
        callUpdateReasons() {
            this.$emit('update_reasons')
        },
        setCurrentReasonType(reason_type) {
            this.$emit('set_edit_reasontype', reason_type)
        },
        createNewReasonType(reason_type) {
            console.log('creating new reason type', reason_type)

            let source = reason_type
            let type = { }

            type.title = source.title
            type.editable = source.editable
            type.act_sts = source.act_sts
            type.cat_id = source.reason.id
            
            this.$store.dispatch('workflow/createReasonType', { project_id: this.project.id, body: type, })
            .then( () => {
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Тип ' + type.title + ' был успешно создан.',
                    message: 'Тип ' + type.title + ' был успешно создан.',
                })
                this.callUpdateReasons()
                this.cancelCreateReasonType()
            })
            .catch( () => {
                this.cancelCreateReasonType()
                console.log('error create reason type', res)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось создать тип причины.',
                    message: 'Не удалось создать тип причины.',
                })
            })
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-reasons-table'

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
            const item = 'workflow-reasons-table'
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
            if (!(this.data && this.data.reasons)) {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось загрузить данные для отображения.',
                    message: 'Не удалось загрузить данные для отображения.',
                })
                return []
            }
            const source = this.data.reasons
            let list = []
            const unfolded = this.unfolded_reasons
            for (const cat of source) {
                list.push(cat)
                if (unfolded.includes(cat.id)) {
                    if (!cat.types) {
                        continue
                    }
                    for (const type of cat.types) {
                        list.push(type)
                    }
                }
            }
            return list
        },
        
    },
    mounted() {
        // console.log('data cat', this.data)
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