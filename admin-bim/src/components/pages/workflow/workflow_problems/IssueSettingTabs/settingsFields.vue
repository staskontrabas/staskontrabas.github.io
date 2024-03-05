<template>
    <div class="issues-settingsTabs-wrap">

        <div class="table-header">

            <!-- левые -->
            <div class="left">
                <el-button 
                    class="problem-icon-btn" 
                    type="main"
                    @click="showCreateField">
                    <div>
                        <i class="el-icon-plus"></i> 
                        <span> 
                            Создать 
                        </span>
                    </div>
                </el-button>
            </div>

            <!-- правые -->
            <div class="right">
            </div>

        </div>

        <div class="table-wrapper" :style="{'max-height': wrapContainerHeight ? wrapContainerHeight + 'px' : 'unset' }" id="problem-type-fields-table">

            <div
                v-if="loading"
                class="m-back m-back--trans">
                <div class="vm-progress">
                    <inline-svg class="inline-svg" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
                </div>
            </div>

            <ub-table 
                v-if="!loading"
                :data="table_data"
                :headers="[
                    {name: 'title', title: 'название пользовательского поля', width: '350', icon: null, click: null, }, 
                    {name: 'parent', title: 'принадлежность поля', width: '350', icon: null, click: null, },
                    {name: 'type', title: 'тип', width: '150', icon: null, click: null, },
                    {name: 'values', title: 'значения', width: '250', icon: null, click: null, },
                    {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
                ]"
                :savedcolumnwidth="loadColumnWidth()"
                @save_columns_width="saveColumnsWidth">
            
                <!-- title / имя -->
                <template v-slot:column1="{ item }">

                    <template>
                        <el-tooltip 
                            effect="dark" 
                            :disabled="!needs_tooltip"
                            placement="right">
                            <template #content>
                                {{ item.field.title }}
                            </template>
                            <span class="truncate-text" 
                                style="cursor: pointer;"
                                @click="setCurrentField(item)"
                                @mouseover="checkIfNeedsTooltip">
                                {{ item.field.title }}
                            </span>
                        </el-tooltip>  
                    </template>
                    
                </template>


                <!-- parent / принадлежность поля -->
                <template v-slot:column4="{ item }">
                    <el-tooltip 
                        effect="dark" 
                        :disabled="!needs_tooltip"
                        placement="right">
                        <template #content>
                            <template>
                                {{ item.cat_title }} <i class="el-icon-arrow-right"></i> {{ item.type_title }}
                            </template>
                        </template>
                        <span class="truncate-text" 
                            @mouseover="checkIfNeedsTooltip">
                            {{ item.cat_title }} <i class="el-icon-arrow-right"></i> {{ item.type_title }}
                        </span>
                    </el-tooltip>  
                </template>


                <!-- type / тип -->
                <template v-slot:column2="{ item }">
                    <el-tooltip 
                        effect="dark" 
                        :disabled="!needs_tooltip"
                        placement="right">
                        <template #content>
                            {{ getFieldType(item.field.value.type) }} 
                        </template>
                        <span class="truncate-text" 
                            @mouseover="checkIfNeedsTooltip">
                            {{ getFieldType(item.field.value.type) }} 
                        </span>
                    </el-tooltip>  
                </template>


                <!-- values / значения -->
                <template v-slot:column3="{ item }">
                    <el-tooltip 
                        effect="dark" 
                        :disabled="!needs_tooltip"
                        placement="right">
                        <template #content>
                            <template v-if="[3,9,11].includes(item.field.value.type)">
                                <template v-for="elem in item.field.value.value.list">
                                    {{ elem }}; <br/>
                                </template>
                            </template>
                        </template>
                        <span class="truncate-text" 
                            @mouseover="checkIfNeedsTooltip">
                            <template v-if="[3,9,11].includes(item.field.value.type) && item.field.value.value.length > 1">
                                <template v-for="elem in item.field.value.value.slice(1)">
                                    {{ elem }}; &nbsp;
                                </template>
                            </template>
                            <template v-if="[3,9,11].includes(item.field.value.type) && item.field.value.value.length <= 1">
                                --
                            </template>
                            <template v-if="![3,9,11].includes(item.field.value.type) && item.field.value.value">
                                {{ item.field.value.value }}
                            </template>
                            <template v-if="![3,9,11].includes(item.field.value.type) && !item.field.value.value">
                                --
                            </template>
                        </span>
                    </el-tooltip>  
                </template>


                <!-- техническая колонка -->
                <template v-slot:column5="{ item }">
                </template>


            </ub-table>
        </div>

        <!-- Create new reason dialogue -->
        <create-new-field
            v-if="show_create_field"
            :showdialogue="show_create_field"
            :data="data"
            @cancel="cancelCreateField"
            @create="createNewField">
        </create-new-field>

    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"

import createNewField from "./settingsFields/createNewField.vue"

export default {
    name: 'SettingsFields',
    components: {
        InlineSvg,
        ubTable,

        createNewField,
    },
    props: ['data', 'project',],
    data() {
        return { 
            needs_tooltip: false,

            show_create_field: false,

            show_create_field: false,

            table_data: [],

            window_height: 500, // переменная для установки размера обертки ubTable, 500 - заглушка на случай непредвиденного
            loading: false, // переменная для загрузчика

        }
    },
    watch: {
        'data.categories'() {
            this.getAllCustomFields()
        },
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
        showCreateField() {
            this.show_create_field = true
        },
        cancelCreateField() {
            this.show_create_field = false
        },
        createNewField(field) {
            console.log('creating field', field)
            let source = field
            let new_field = {}

            new_field.title = source.title
            new_field.custom = source.custom
            new_field.editable = source.editable
            new_field.required = source.required
            new_field.visible = source.visible
            new_field.type_id = source.type.id

            let value = {
                type: getType(source.value.type),
                value: source.value.type == 'list'
                        ? (source.value.value.hasOwnProperty('list') ? makeListFromObject(source.value.value) : addValue(source.value.value)) 
                        : source.value.value
            }
            new_field.value = value

            function makeListFromObject(obj) {
                return [obj.value ? obj.value : '', ...obj.list]
            }

            function addValue(list) {
                if (!list.length) {
                    return []
                }
                let value = list[0]
                return [value, ...list]
            }

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
            this.$store.dispatch('workflow/createTypeField', { project_id: this.project.id, type_id: new_field.type_id, body: new_field, })
            .then(res => {
                this.cancelCreateField()
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Поле ' + new_field.title + ' было успешно создано.',
                    message: 'Поле ' + new_field.title + ' было успешно создано.',
                })
                this.callUpdateFields()
            })
            .catch( res => {
                this.cancelCreateField()
                console.log('error create reason', res)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось создать поле.',
                    message: 'Не удалось создать поле.',
                })
            })
        },
        setCurrentField(field_data) {
            this.$emit('set_edit_field', { field: field_data.field, parent: field_data.type_id })
        },
        callUpdateFields() {
            this.$emit('update_fields')
        },
        getAllCustomFields() {
            let all_fields = []

            if(!(this.data && this.data.categories)) {
                return null
            }

            let promices = []
            for (const cat of this.data.categories) {
                if (!cat.types) {
                    continue
                }
                for (const type of cat.types) {
                    promices.push(
                        this.$store.dispatch('workflow/getFields', { uuid: this.project.id, type_id: type.id, })
                        .then(res => { 
                            for (const field of res) {
                                if (field.custom) {
                                    all_fields.push({
                                        cat_id: cat.id,
                                        cat_title: cat.title,
                                        type_title: type.title,
                                        type_id: type.id,
                                        field: field,
                                    })
                                }
                            }
                        })
                    )
                }
            }

            Promise.all(promices)
            .then(() => {
                this.table_data = all_fields
                this.handlePageResize()
                this.loading = false
            })
            .then(() => {
                this.handlePageResize()
            })

        },
        getFieldType(type) {
            const fieldTypes = [
                'строковый',    // "FieldTypeString",       //  1: "Текст. Текстовый"
                'строковый',    // "FieldTypeText",         //  2: "Абзац. Текстовый"
                'список',       // "FieldTypeStringArray",  //  3: "Список. Текстовый"
                'численный',    // "FieldTypeFloat",        //  4: "Число. С плавающей точкой"
                'строковый',    // "FieldTypeDate",         //  5: "Дата."
                'строковый',    // "FieldTypeURL",          //  6: "Ссылка. Текстовый."
                'список',       // "FieldTypeURLArray",     //  7: "Список. Ссылка. Текстовый."
                'численный',    // "FieldTypeNumber",       //  8: "Число. Целое"
                'список',       // "FieldTypeNumberArray",  //  9: "Список. Целое"
                'строковый',    // "FieldTypeFile",         // 10: "ID файла. Текстовый"
                'список',       // "FieldTypeFileArray",    // 11: "Список. ID файла. Текстовый"
            ]
            return fieldTypes[type - 1]
        },
        handlePageResize() {
            this.window_height = window.innerHeight
            let target = document.getElementById('problem-type-fields-table')
            if (target !== null) {
                target.style['height'] = this.wrapContainerHeight + 'px' // forced resize re-calculation, don't remove
            }
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-fields-table'

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
            const item = 'workflow-fields-table'
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
        wrapContainerHeight() {
            let table_wrap = document.getElementById('problem-type-fields-table') // при начальной загрузке элемент не успевает загрузится в DOM, а после загрузки не срабатывает computed
            let viewportHeight = this.window_height
            let t_top = table_wrap ? table_wrap.getBoundingClientRect().top : 240 // хардкод для верха таблицы
            if (t_top == 0) { t_top = 240 }
            let result = viewportHeight - t_top
            this.tableheight = result > 0 ? result : 0
            return result
        },
    },
    mounted() {
        this.loading = true
        this.getAllCustomFields()
    },
    created() {
        window.addEventListener('resize', this.handlePageResize) // для расчета высоты el-table
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handlePageResize)
    }
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