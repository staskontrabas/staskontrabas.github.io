<template>
    <div class="issues--outer-wrap">
    <div class="issues--inner-wrap">

        <!-- Форма -->
        <el-form 
            class="form"
            ref="form"
            :model="form_data" 
            :rules="validationRules"
            label-position="top"
            popper-class="ub-issue-form-popper">


            <!-- category && type selector - for new fields only -->
            <el-form-item v-if="field === null" label="Принадлежность поля" prop="type">
                <el-select 
                    v-model="form_data.type" 
                    value-key="id"
                    :placeholder="form_data.type ? '' : 'Выбор расположения поля'" 
                    popper-class="issue-selector-type ub-issue-form-popper"
                    @change="handleTypeChange"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.type" slot="prefix">
                        <div class="issue-selector-type display"> 
                            <div 
                                class="problem-category-mark-24"
                                :style="{ 
                                        'background-color': form_data.sts ? form_data.sts.color : 'orange', 
                                        'color': form_data.sts ? form_data.sts.textcolor : 'black', 
                                }">
                                <span v-if="form_data.type.mark">
                                    {{ form_data.type.mark }}
                                </span>
                                <i v-else class="el-icon-check" style="font-size: 18px;"></i>  
                            </div>
                            <span class="composite"> 
                                {{ form_data.cat.title }}  
                                <i class="el-icon-arrow-right"></i> 
                                {{ form_data.type.title }} 
                            </span>
                        </div>
                    </template>

                    <!-- options -->
                    <div
                        v-for="cat in categories"
                        :key="cat.id"
                        :label="cat.title">
                        <div 
                        class="issue-selector-type header">
                            <span> {{ cat.title }} </span>
                        </div>
                        <el-option
                            v-for="item in cat.types" 
                            :key="item.id"
                            :value="item">
                            <template>
                                <div class="issue-selector-type option">
                                    <div class="row-no-wrap">
                                        <div 
                                            class="problem-category-mark-24"
                                            :style="{ 
                                                    'background-color': form_data.sts ? form_data.sts.color : 'orange', 
                                                    'color': form_data.sts ? form_data.sts.textcolor : 'black', 
                                                    'font-weight': '400',
                                            }">
                                            <span v-if="item.mark">
                                                {{ item.mark }}
                                            </span>
                                            <i v-else class="el-icon-check" style="font-size: 18px;"></i>  
                                        </div>
                                        {{ item.title }}
                                    </div>
                                    <i class="el-icon-check" 
                                    v-if="form_data.type && (form_data.type.id == item.id)"></i>
                                </div>
                            </template>
                        </el-option>
                    </div>

                </el-select>
            </el-form-item>


            <!-- title -->
            <el-form-item label="Название поля" prop="title">
                <el-input 
                    v-model="form_data.title"
                ></el-input>
            </el-form-item>


            <!-- type / тип пользовательского поля -->
            <el-form-item label="Тип поля">
                <el-select 
                    v-model="form_data.value_type" 
                    :placeholder="form_data.value_type !== null ? '' : 'Выберите тип'"
                    popper-class="ub-issue-form-popper"
                    @visible-change="setPoppersWidth"
                    @change="setFieldType">

                    <!-- selected -->
                    <template v-if="form_data.value_type !== null" slot="prefix">
                        <div class="ub-issue-form-popper display">
                            <span> {{ fieldTypes[form_data.value_type].title }} </span>
                        </div>
                    </template>

                    <!-- options -->
                    <el-option
                        v-for="item in fieldTypes"
                        :label="item.title"
                        :value="item.id">
                        <template>
                            <div class="ub-issue-form-popper active-status option">
                                <span> {{ item.title }} </span>
                            </div>
                        </template>
                    </el-option>
                </el-select>
            </el-form-item>


            <!-- value / значение -->
            <el-form-item
                v-if="form_data.value_type !== 'list'" 
                label="Значение поля">
                
                <!-- строка и число -->
                <el-input 
                    v-if="form_data.value_type !=='list'"
                    v-model="form_data.selected_value"
                ></el-input>

                <!-- список -->
                <el-select 
                    v-if="form_data.value_type === 'list'"
                    v-model="form_data.selected_value" 
                    :placeholder="form_data.selected_value !== null ? '' : 'Выберите значение'"
                    popper-class="ub-issue-form-popper"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.selected_value !== null" slot="prefix">
                        <div class="ub-issue-form-popper display">
                            <span> {{ form_data.selected_value }} </span>
                        </div>
                    </template>

                    <!-- options -->
                    <el-option
                        v-for="item in form_data.values_list"
                        :label="item"
                        :value="item">
                        <template>
                            <div class="ub-issue-form-popper active-status option">
                                <span> {{ item }} </span>
                            </div>
                        </template>
                    </el-option>
                </el-select>
            </el-form-item>

            <!-- список значений  -->
            <el-form-item 
                v-if="form_data.value_type == 'list'"
                label="Список допустимых значений"
                prop="values_list">
                <el-select
                    v-model="form_data.values_list"
                    multiple
                    filterable
                    allow-create
                    fit-input-width
                    default-first-option
                    placeholder="Введите элемент списка">
                    <template #empty>
                        Введите название элемента списка и нажмите 'Enter'.
                    </template>
                </el-select>
            </el-form-item>

            <!-- видимость / visible  -->
            <!-- <el-form-item label="Видимость" prop="visible">
                <el-select 
                    v-model="form_data.visible" 
                    :placeholder="form_data.visible !== null ? '' : 'Выберите статус'"
                    popper-class="ub-issue-form-popper"
                    @visible-change="setPoppersWidth">

                    <template v-if="form_data.visible !== null" slot="prefix">
                        <div class="ub-issue-form-popper display">
                            <inline-svg 
                                :src="getVisible(form_data.visible).icon" 
                                :style="{'fill': getVisible(form_data.visible).color, 'margin-right': '0px', 'height': '24px', 'width': '24px',}" />
                            <span> {{ getVisible(form_data.visible).title }} </span>
                        </div>
                    </template>

                    <el-option
                        v-for="item in [true, false]"
                        :label="getVisible(item).title"
                        :value="item">
                        <template>
                            <div class="ub-issue-form-popper active-status option">
                                <inline-svg 
                                    :src="getVisible(item).icon" 
                                    :style="{'fill': getVisible(item).color, 'margin-right': '0px', 'height': '24px', 'width': '24px',}" />
                                <span> {{ getVisible(item).title }} </span>
                            </div>
                        </template>
                    </el-option>

                </el-select>
            </el-form-item> -->
            

            <!-- обязательное / required  -->
            <!-- <el-form-item label="Обязательное" prop="required">
                <div class="row-no-wrap">
                    <el-checkbox 
                    v-model="form_data.required"/>
                    <span> {{ form_data.required ? 'Поле обязательно для заполнения' : 'Поле необязательно для заполнения' }} </span>
                </div>
                
            </el-form-item> -->

        </el-form>
    

    </div>
    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"

export default{
    name: 'ubFieldForm',
    props: ['field', 'data', ],
    components: {
        InlineSvg,
    },
    data() {
        return {

            form_data: {
                cat: null,
                type: null,
                title: '',
                act_sts: true,
                custom: true,
                required: false,
                editable: true,
                value: {
                    type: 'string',
                    value: '',
                },
                visible: true,
                value_type: 'string',
                selected_value: '',
                values_list: [],
            },

            open_eye: require(`@/assets/icons/show.svg`),
            closed_eye: require(`@/assets/icons/hide.svg`),
        }
    },
    watch: {
        'form_data': {
            handler: function update() {
                console.log('detected change')
                this.$emit('update:form_data', this.form_data)
            },
            deep: true,
        },
        'field'() {
            console.log('field changed')
            this.setData()
        }, 
    },
    methods: {
        setData() {
            if (this.field && this.field.id) {
                this.setExisting()
            }
            else {
                this.setNew() 
            }
        },
        getStatus(sts) {
            if (sts) {
                return { icon: 'el-icon-circle-check', title: 'Активно', color: 'darkgreen', }
            }
            return { icon: 'el-icon-circle-close', title: 'Неактивно', color: 'black', }
        },
        getVisible(vis) {
            if (vis) {
                return { icon: this.open_eye, title: 'Видимое поле', color: '#006eaf', }
            }
            return { icon: this.closed_eye, title: 'Невидимое поле', color: '#666666', }
        },
        setNew() {
            console.log('setting new')
            this.form_data = Object.assign({}, 
                {
                    cat: this.categories && this.categories.length ? this.categories[0] : null,
                    type: this.categories && this.categories.length ? 
                            (this.categories[0].types && this.categories[0].types.length ? this.categories[0].types[0] : null) : 
                            null,
                    title: '',
                    act_sts: true,
                    custom: true,
                    required: false,
                    editable: true,
                    value: {
                        type: 'string',
                        value: '',
                    },
                    visible: true,

                    value_type: 'string',
                    selected_value: '',
                    values_list: [],
                }
            )
        },
        setExisting() {
            console.log('setting existing')
            if (!this.field) {
                return null
            }
            let source = JSON.parse(JSON.stringify(this.field))
            let field_type = this.getFieldType(source.value.type)

            // let erzatz_cat = this.categories.find(obj => obj.types.find(typ => typ.id == source.type_id))
            // let erzatz_type = erzatz_cat.types.find(obj => obj.id == source.type_id)

            this.form_data = Object.assign({}, 
                {
                    // type: erzatz_type,
                    // cat: erzatz_cat,
                    title: source.title,
                    custom: source.custom,
                    required: source.required,
                    editable: source.editable,
                    visible: source.visible,
                    type_id: source.type_id,
                    value_type: 'string',
                    selected_value: '',
                    values_list: [],
                }
            )
            if (field_type === 'list') {
                this.form_data.value = {
                    type: field_type,
                    value: makeObjectFromList(source.value.value)
                }
                this.form_data.value_type = 'list'
                this.form_data.selected_value = makeObjectFromList(source.value.value).value
                this.form_data.values_list = makeObjectFromList(source.value.value).list
            }
            else {
                this.form_data.value = {
                    type: field_type,
                    value: source.value.value,
                }
                this.form_data.value_type = field_type
                this.form_data.selected_value = source.value.value
                this.form_data.values_list = []
            }

            function makeObjectFromList(list) {
                let new_list = [...list]
                const val = new_list.length ? new_list.shift() : ''
                return { value: val, list: new_list } 
            }
        },
        validateForm() {
            // вроде бы универсальная процедура для валидации формы
            if (this.$refs['form'] == undefined) {
                return false
            }
            let verdict = false
            this.$refs['form'].validate((valid) =>
                {
                    verdict = valid
                }
            )       
            return verdict      
        },
        setPoppersWidth() {
            // для обобщения процедуры должно быть достаточно заменить класс обертки, содержащей el-select (здесь 'issues--inner-wrap')
            const ref = document.getElementsByClassName('issues--inner-wrap')[0]
            const real_width = ref ? ref.offsetWidth : null

            if (!real_width) {
                return null
            }
            let targets = document.querySelectorAll('.ub-issue-form-popper:not(.display)')
            for (let elem of targets) {
                elem.style['min-width'] = real_width + 'px'
            }
        },
        setFieldType(type) {
            console.log('fieldtype', type)
            if (type == 'list') {
                this.form_data.selected_value = ''
                this.form_data.values_list = []
            }
            else {
                this.form_data.selected_value = ''
                this.form_data.values_list = []
            }
        },
        getFieldType(type) {
            const fieldTypes = [
                'string',    // "FieldTypeString",       //  1: "Текст. Текстовый"
                'string',    // "FieldTypeText",         //  2: "Абзац. Текстовый"
                'list',       // "FieldTypeStringArray",  //  3: "Список. Текстовый"
                'number',    // "FieldTypeFloat",        //  4: "Число. С плавающей точкой"
                'string',    // "FieldTypeDate",         //  5: "Дата."
                'string',    // "FieldTypeURL",          //  6: "Ссылка. Текстовый."
                'list',       // "FieldTypeURLArray",     //  7: "Список. Ссылка. Текстовый."
                'number',    // "FieldTypeNumber",       //  8: "Число. Целое"
                'list',       // "FieldTypeNumberArray",  //  9: "Список. Целое"
                'string',    // "FieldTypeFile",         // 10: "ID файла. Текстовый"
                'list',       // "FieldTypeFileArray",    // 11: "Список. ID файла. Текстовый"
            ]
            return fieldTypes[type - 1]
        },
        handleTypeChange(v) {
            this.changeCurrentCategory(v)
            if (this.field !== null) {
                return null
            }
            this.fields_loading = true
        },
        changeCurrentCategory(v) {
            this.form_data.cat = this.data.categories.find(obj => obj.id == v.cat_id)
        },
    },
    computed: {
        validationRules() {
            return {
                title: [{ required: true, message: 'Введите название категории', trigger: 'blur', }], 
                values_list: [
                    { type: 'array', required: true, message: 'Список значений должен содержать как минимум одно значение', trigger: 'change' },
                    { type: 'array', min: 1, message: 'Список значений должен содержать как минимум одно значение', trigger: 'change'}
                ],
                // status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
        },
        fieldTypes() {
            return {
                'string': {
                    title: 'Строка',
                    id: 'string',
                },
                'number': {
                    title: 'Число',
                    id: 'number'
                },
                'list': {
                    title: 'Список',
                    id: 'list',
                },
            }
        },
        categories() {
            return this.data.categories || []
        },
    },
    mounted() {
        this.setData()    
    },
}
</script>

<style lang="scss" scoped>

.separate-span {
    margin-top: 8px;
}

.status-icon {
    font-size: 24px;
    margin-right: 8px;
}

.icon_with_input {
    display: flex; 
    flex-direction: row; 
    flex-wrap: nowrap; 
    align-items: center;
    margin-bottom: 8px;
    & svg {
        max-width: 24px;
        max-height: 24px;
        min-width: 24px;
        min-height: 24px;
        margin: 0px 16px;
        font-size: 24px;
        &:hover {
            color: #006eaf;
        }
    }
}

.row-no-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
}

</style>
