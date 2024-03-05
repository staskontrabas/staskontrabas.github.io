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
                        <el-dropdown-item command="showCreateCategory"> Создать категорию </el-dropdown-item>
                        <el-dropdown-item command="showCreateType"> Создать тип </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            
            </div>

            <!-- правые -->
            <div class="right">
            </div>

        </div>

        <div class="table-wrapper">
            <ub-table 
                :data="table_data"
                :headers="[
                    {name: 'name', title: 'категория и тип проблем', width: '340', icon: null, click: null, }, 
                    {name: 'status', title: 'статус', width: '200', icon: null, click: null, },
                    {name: 'fields', title: 'пользовательские поля', width: '200', icon: null, click: null, },
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
                                @click="selectAsCurrentCategory(item)"
                                @mouseover="checkIfNeedsTooltip">
                                {{ item.title }}
                            </span>
                        </el-tooltip>  
                    </template>

                    <!-- if type -->
                    <template v-if="item.cat_id !== undefined">
                        <div class="type-cell" style="">
                            <div class="problem-category-mark-28 st-mark">
                                <span v-if="item.mark">
                                    {{ item.mark }}
                                </span>
                                <i v-else class="el-icon-check" style="font-size: 20px;"/>
                            </div>
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
                                    @click="selectAsCurrentType(item)">
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


                <!-- fields / пользовательские поля -->
                <template v-slot:column3="{ item }">

                    <!-- if category -->
                    <template v-if="item.cat_id === undefined">
                        --
                    </template>

                    <!-- if type -->
                    <template v-if="item.cat_id !== undefined">
                        <el-tooltip 
                            effect="dark" 
                            :disabled="!needs_tooltip"
                            placement="right">
                                <template #content>
                                    <span v-for="elem in getCustomFieldsForType(item.id)">
                                        {{ elem.title }} <br/>
                                    </span>
                                </template>
                                    <span 
                                        v-if="all_fields.filter(obj => obj.id == item.id)"
                                        class="truncate-text" 
                                        @mouseover="checkIfNeedsTooltip"> 
                                        <template v-for="elem in getCustomFieldsForType(item.id)">
                                            {{ elem.title }};&nbsp;
                                        </template>
                                    </span>
                        </el-tooltip>
                    </template>
  
                </template>

                <!-- техническая колонка -->
                <template v-slot:column4="{ item }">
                </template>


            </ub-table>
        </div>

        <!-- Create category dialogue how_create_category -->
        <create-new-category
            v-if="show_create_category"
            :showdialogue="show_create_category"
            @cancel="cancelCreateCategory"
            @create="createNewCategory">
        </create-new-category>


        <!-- Create type dialogue -->
        <create-new-type
            v-if="show_create_type"
            :showdialogue="show_create_type"
            :data="{ categories: data.categories }"
            @cancel="cancelCreateType"
            @create="createNewType">
        </create-new-type>

    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"

import createNewCategory from "./settingsType/createNewCategory.vue"
import createNewType from "./settingsType/createNewType.vue"


export default {
    name: 'SettingsTypes',
    components: {
        InlineSvg,
        ubTable,

        createNewCategory,
        createNewType,
    },
    props: ['data', 'project',],
    data() {
        return {  
            needs_tooltip: false,

            unfolded_categories: [],

            all_fields: [],

            show_create: false,

            show_create_category: false,
            show_create_type: false,
        }
    },
    watch: {
        'data'() {
            this.$nextTick(() => {
                this.getAllCustomFields()
            })
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
        toggleUnfoldTypes(category_id) {
            // процедура должна менять подаваемый в таблицу список данных, чтобы отображать / скрывать типы
            let target = this.unfolded_categories
            if(!target.includes(category_id)) {          
                target.push(category_id)               
            } else {
                target.splice(target.indexOf(category_id), 1) 
            }
        },
        getArrowIcon(id) {
            return this.unfolded_categories.includes(id)
        },
        getStatus(sts) {
            if (sts) {
                return { icon: 'el-icon-circle-check', title: 'Активно', color: 'darkgreen', }
            }
            return { icon: 'el-icon-circle-close', title: 'Неактивно', color: 'black', }
        },
        getAllCustomFields() {
            this.all_fields = []

            if(!(this.data && this.data.categories)) {
                return null
            }

            for (const cat of this.data.categories) {
                if (!cat.types) {
                    continue
                }
                for (const type of cat.types) {

                    this.$store.dispatch('workflow/getFields', { uuid: this.project.id, type_id: type.id, })
                    .then(res => { 
                        // console.log(type.title, 'fields', res)
                        this.all_fields.push({
                            id: type.id,
                            fields: res,
                        })
                    })
                    
                }
            }

        },
        getCustomFieldsForType(type_id) {
            let source = [...this.all_fields.filter(obj => obj.id == type_id)]
            if (!(source && source.length)) {
                return []
            }
            if (!source[0].fields) {
                return []
            }
            let list = source[0].fields
            return list
        },
        handleCommand(command) {
            switch(command) {
                case 'showCreateCategory': {
                    this.showCreateCategory()
                    break
                }
                case 'showCreateType': {
                    this.showCreateType()
                    break
                }
                default: {
                    return null
                }
                
            }
        },
        showCreateCategory() {
            console.log('creatign cat')
            this.show_create_category = true
        },
        showCreateType() {
            console.log('creating type')
            this.show_create_type = true
        },
        cancelCreateCategory() {
            console.log('category cancel')
            this.show_create_category = false
        },
        cancelCreateType() {
            console.log('type cancel')
            this.show_create_type = false
        },
        validateCategoryForm() {
            if (this.$refs['create_category_form'] == undefined) {
                return false
            }
            let verdict = false
            this.$refs['create_category_form'].validate((valid) =>
                {
                    verdict = valid
                }
            )       
            return verdict      
        },
        validateTypeForm() {
            if (this.$refs['create_type_form'] == undefined) {
                return false
            }
            let verdict = false
            this.$refs['create_type_form'].validate((valid) =>
                {
                    verdict = valid
                }
            )       
            return verdict      
        },
        setPoppersWidth() {
            // disabled
            
            const ref = document.getElementsByClassName('category-create-form-wrapper')[0]
            const real_width = ref ? ref.offsetWidth : null

            console.log('setting width', ref, real_width)
            if (!real_width) {
                return null
            }
            let targets = document.querySelectorAll('.ub-issue-form-popper:not(.display)')
            for (let elem of targets) {
                elem.style['min-width'] = real_width - 32 + 'px'
            }
        },
        createNewCategory(form_data) {
            let source = form_data
            let cat = {}
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

            cat.title = source.title
            cat.act_sts = source.act_sts
            cat.editable = true

            // console.log('new_ cat', cat )
            // console.log('proj', this.project)
            this.$store.dispatch('workflow/createCategory', { project_id: this.project.id, body: cat, })
            .then(res => {

                let promises = []
                for (let elem of types) {
                    elem.cat_id = res.id
                    promises.push(this.$store.dispatch('workflow/createType', { project_id: this.project.id, body: elem, }))
                }

                Promise.all(promises)
                .then( () => {
                    this.cancelCreateCategory()
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Категория ' + cat.title + ' была успешно создана.',
                        message: 'Категория ' + cat.title + ' была успешно создана.',
                    })
                    this.callUpdateCategories()
                    this.cancelCreateCategory()
                })
                .catch(err => {
                    console.log('cant create types', err )
                })
            })
            .catch( res => {
                this.cancelCreateCategory()
                console.log('error create cat', res)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось создать категорию.',
                    message: 'Не удалось создать категорию.',
                })
            })
        },
        callUpdateCategories() {
            this.$emit('update_cats')
        },
        createNewType(data) {
            let source = data

            console.log('creating type', source)

            // см. список типов от Димы, в getFieldType компонента ubIssuesForm (вынести отдельно)
            const field_types = {
                'number': 1,
                'string': 1,
                'list': 3,
            }

            let type = {}
            // при создании данные о новых полях приходят в data.new_fields
            let fields_promises = []

            type.mark = source.mark
            type.title = source.title
            type.cat_id = source.cat.id
            type.act_sts = source.act_sts
            type.editable = source.editable
            type.fields = []

            this.$store.dispatch('workflow/createType', { project_id: this.project.id, body: type,})
            .then( res => {
                for (const elem of source.new_fields) {
                    // собираем поле для сервиса
                    let field = {}
                    field.type_id = res.id
                    field.title = elem.title
                    field.custom = true
                    field.editable = elem.editable
                    field.required = elem.required
                    field.visible = elem.visible
                    field.value = {
                        type: field_types[elem.type],
                        value: elem.type == 'list' ? makeListFromObject({value: elem.value, list: elem.value_list}) : elem.value,
                    }
                    fields_promises.push(this.$store.dispatch('workflow/createTypeField', { project_id: this.project.id, type_id: res.id, body: field,}))
                }

                Promise.all(fields_promises)
                .then(() => {
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Тип успешно создан.',
                        message: 'Тип успешно создан.',
                    })
                    this.callUpdateCategories()
                    this.cancelCreateType()
                })
                .catch(() => {
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'При создании типа произошла ошибка.',
                        message: 'При создании типа произошла ошибка.',
                    })
                    this.callUpdateCategories()
                    this.cancelCreateType()
                })
            })

            


            // создает список, предназначенный для хранения на сервисе, из объекта, предназначенного для отображения
            function makeListFromObject(obj) {
                return [obj.value ? obj.value : '', ...obj.list]
            }

            // обратное преобразование, для комплекта
            function makeObjectFromList(list) {
                let new_list = [...list]
                const val = new_list.length ? new_list.shift() : null
                return { value: val, list: new_list }
            }

        },
        selectAsCurrentCategory(cat) {
            this.$emit('set_edit_category', cat)
        },
        selectAsCurrentType(type) {
            this.$emit('set_edit_type', type)
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-types-table'

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
            const item = 'workflow-types-table'
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
            if (!(this.data && this.data.categories)) {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось загрузить данные для отображения.',
                    message: 'Не удалось загрузить данные для отображения.',
                })
                return []
            }
            const source = this.data.categories
            let list = []
            const unfolded = this.unfolded_categories
            for (const cat of source) {
                list.push(cat)
                if (unfolded.includes(cat.id) && cat.types) {
                    for (const type of cat.types) {
                        list.push(type)
                    }
                }
            }
            return list
        },
        activeCategories() {
            let res = this.data.categories
            res = res.filter(obj => obj.act_sts == true)
            return res ? res : []
        },
        typeValidationRules() {
            return {
                cat: [{ required: true, message: 'Необходимо выбрать категорию', trigger: 'blur', }],
                title: [{ required: true, message: 'Введите название типа', trigger: 'blur', }],
                // status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
        },
        
    },
    mounted() {
        // console.log('data cat', this.data)
        this.getAllCustomFields()
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