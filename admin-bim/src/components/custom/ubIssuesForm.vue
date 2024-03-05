<!--    Компонент для отображения и задания полей проблем (сущностей из workflow / issues)
        Предназначен для подстановки в элемент-обертку, должен быть универсальным.
    
0.  Путь для импорта: // import ubIssuesForm from "@/components/custom/ubIssuesForm.vue"

1.  Соглашение по именованию классов для редактируемых пользователем элементов: class="issue-{element_type}-element_name} {option}", где {option}: display | header | option

2.  Поля (fields) пришлось отделить от основных данных из-за особенностей поведения el-form-item. 
    Позже нужно попробовать объединить обратно с добавлением искуственного поля id в fields.
    Поле upfields нужно для правльного обновления данных в элементе-обертке.



 -->

<template>
    <div class="issues--outer-wrap">
    <div class="issues--inner-wrap">

        <!-- Форма -->
        <el-form 
            class="issue-mainform"
            ref="form"
            :model="form_data" 
            label-position="top">


            <!-- template - отключено -->
            <!-- <el-form-item 
            v-if="false"
            label="Использовать шаблон" prop="template">
                <el-select 
                    v-model="form_data.template" 
                    placeholder="Выбор шаблона"
                    popper-class="issue-selector-templates ub-issue-form-popper">
                    <el-option
                        v-for="item in templates"
                        :key="item.id"
                        :label="item.title"
                        :value="item">
                    <span> {{ item }} </span>
                    </el-option>
                </el-select>
            </el-form-item> -->


            <!-- title -->
            <el-form-item label="Название проблемы" prop="title"
                :rules="{ required: true, message: 'Название проблемы не может быть пустым', trigger: 'blur',}">
                <el-input v-model="form_data.title"></el-input>
            </el-form-item>


            <!-- status -->
            <el-form-item label="Статус" prop="sts">
                <el-select 
                    v-model="form_data.sts" 
                    value-key="id"
                    :placeholder="form_data.sts ? '' : 'Выберите статус'"
                    popper-class="issue-selector-status ub-issue-form-popper"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.sts" slot="prefix">
                        <div class="issue-selector-status display">
                            <div class="issue--status-plate" 
                                :style="{ 'background-color': getCurrentStatusColor() }">
                            </div>
                            <span> {{ form_data.sts.title }} </span>
                        </div>
                    </template>

                    <!-- options -->
                    <el-option
                        v-for="item in statuses"
                        :key="item.id"
                        :label="item.title"
                        :value="item">
                        <template>
                            <div class="issue-selector-status option">
                                <div class="issue--status-plate" :style="{ 'background-color': item.color }"></div>
                                <span> {{ item.title }} </span>
                            </div>
                        </template>
                    </el-option>

                </el-select>
            </el-form-item>


            <!-- categories / types -->
            <el-form-item label="Тип" prop="type">
                <el-select 
                    v-model="form_data.type" 
                    value-key="id"
                    :placeholder="form_data.type ? '' : 'Выбор типа'" 
                    popper-class="issue-selector-type ub-issue-form-popper"
                    @change="handleTypeChange"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.type" slot="prefix">
                        <div class="issue-selector-type display"> 
                            <div 
                                class="problem-category-mark-24"
                                :style="{ 
                                        'background-color': getCurrentStatusColor(), 
                                        'color': getCurrentStatusTextColor(), 
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


            <!-- reasons -->
            <el-form-item label="Основная причина" prop="reason_type">
                <el-select 
                    v-model="form_data.reason_type" 
                    value-key="id"
                    :placeholder="form_data.reason_type ? '' : 'Выбор причины'" 
                    popper-class="issue-selector-reason ub-issue-form-popper"
                    @change="changeCurrentReason"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.reason_type" slot="prefix">
                        <div class="issue-selector-reason display"> 
                            <!-- <div 
                                class="problem-category-mark-24"
                                :style="{ 
                                        'background-color': form_data.sts ? form_data.sts.color : 'orange', 
                                        'color': form_data.sts ? form_data.sts.textcolor : 'black', 
                                }">
                                <span v-if="form_data.reason_type.mark">
                                    {{ form_data.reason_type.mark }}
                                </span>
                                <i v-else class="el-icon-check" style="font-size: 18px;"></i>  
                            </div> -->
                            <span class="composite"> 
                                {{ form_data.reason.title }}  
                                <i class="el-icon-arrow-right"></i> 
                                {{ form_data.reason_type.title }} 
                            </span>
                        </div>
                    </template>

                    <!-- options -->
                    <div
                        v-for="rsn in reasons"
                        :key="rsn.id"
                        :label="rsn.title">
                        <div 
                        class="issue-selector-reason header">
                            <span> {{ rsn.title }} </span>
                        </div>
                        <el-option
                            v-for="item in rsn.types" 
                            :key="item.id"
                            :value="item">
                            <template>
                                <div class="issue-selector-reason option">
                                    <span> {{ item.title }} </span>
                                    <i class="el-icon-check" 
                                    v-if="form_data.reason_type && (form_data.reason_type.id == item.id)"></i>
                                </div>
                            </template>
                        </el-option>
                    </div>

                </el-select>
            </el-form-item>


            <!-- description -->
            <el-form-item label="Описание" prop="dscr">
                <el-input
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 4}"
                    placeholder="Опишите проблему"
                    v-model="form_data.dscr">
                </el-input>
            </el-form-item>


            <!-- user -->
            <el-form-item label="Назначено пользователю" prop="user">
                <el-select 
                v-model="form_data.user" 
                placeholder="Выберите участника" 
                popper-class="issue-selector-user ub-issue-form-popper"
                @visible-change="setPoppersWidth">
                    <el-option
                        v-for="item in managers"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                        <template>
                            <div class="issue-selector-user option">
                                <span> {{ item.name }} </span>
                                <i class="el-icon-check" v-if="form_data.user && form_data.user == item.id"></i>
                            </div>
                        </template>
                    </el-option>
                </el-select>
            </el-form-item>


            <!-- observers -->
            <el-form-item label="Наблюдатели" prop="observers">
                <el-select 
                    v-model="form_data.observers" 
                    multiple 
                    placeholder="Выберите участника" 
                    popper-class="issue-selector-observers ub-issue-form-popper"
                    @visible-change="setPoppersWidth">
                    <el-option
                        v-for="item in managers"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                        <template>
                            <div class="issue-selector-observers option">
                                <div class="problems-form-row-wrap">
                                    <div class="false-checkbox" :class="form_data.observers.includes(item.id) ? 'false-checkbox-checked' : '' "></div>
                                    <span> {{ item.name }} </span>
                                </div>
                            </div>
                        </template>
                    </el-option>
                </el-select>
            </el-form-item>


            <!-- deadline_at -->
            <el-form-item label="Срок выполнения" prop="deadline_at">
                <el-date-picker
                    v-model="form_data.deadline_at" 
                    type="date"
                    placeholder="Выберите дату" 
                    format="dd/MM/yyyy">
                </el-date-picker>
            </el-form-item>


            <!-- created_at date -->
            <el-form-item label="Дата начала" prop="created_at">
                <el-date-picker
                    v-model="form_data.created_at" 
                    type="date"
                    placeholder="Выберите дату" 
                    format="dd/MM/yyyy">
                </el-date-picker>
            </el-form-item>

            <div style="position: relative;">
                <div class="issues--fields-loading" v-if="fields_loading"> Идет загрузка данных... </div>


                <el-form-item 
                v-for="(field, findex) of form_data.fields" 
                    :label="field.title" 
                    :rules="{ required: field.required, message: 'Обязательное поле не может быть пустым', trigger: 'blur', }"
                    :prop="'fields.' + findex + '.value.value'">

                    <!-- 1 -->
                    <!-- field value {{ form_data.fields[findex].value.value }} -->
                    <el-input
                        v-if="getFieldType(field.value.type) == 'FieldTypeString'"
                        v-model="form_data.fields[findex].value.value">
                    </el-input>

                    <!-- 2 -->
                    <el-input
                        v-if="getFieldType(field.value.type) == 'FieldTypeText'"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 4}"
                        v-model="form_data.fields[findex].value.value">
                    </el-input>
                   
                    <!-- 3 -->
                    <el-select 
                        v-if="getFieldType(field.value.type) == 'FieldTypeStringArray'"
                        v-model="form_data.fields[findex].value.value.value"
                        :placeholder="field.value.value.value ? '' : 'Выберите вариант'" 
                        popper-class="ub-issue-form-popper"> 

                        <!-- selected -->
                        <template v-if="field.value.value.value" slot="prefix">
                            <div class="display"> 
                                <span> 
                                    {{ field.value.value.value }}  
                                </span>
                            </div>
                        </template>

                        <!-- options -->
                        <el-option
                            v-for="item, index in form_data.fields[findex].value.value.list" 
                            :key="index"
                            :value="item">
                            <template>
                                <div class="ub-issue-form-popper option">
                                    <span> {{ item }} </span>
                                    <i class="el-icon-check" 
                                    v-if="form_data.fields[findex].value.value.value  == item"></i>
                                </div>
                            </template>
                        </el-option>
                    </el-select>

                    <!-- 4 -->
                    <el-input
                        v-if="getFieldType(field.value.type) == 'FieldTypeFloat'"
                        v-model="form_data.fields[findex].value.value">
                    </el-input>

                    <!-- 5 -->
                    <el-date-picker
                        v-if="getFieldType(field.value.type) == 'FieldTypeFloat'"
                        v-model="form_data.fields[findex].value.value"
                        type="date"
                        placeholder="Выберите дату" 
                        format="dd/MM/yyyy">
                    </el-date-picker>

                    <!-- 6 -->
                    <el-input
                        v-if="getFieldType(field.value.type) == 'FieldTypeURL'"
                        v-model="form_data.fields[findex].value.value">
                    </el-input>

                    <!-- 7 - особый случай, массив текстовых ссылок на документ, не редактируемый пользователем, создается автоматически при создании из файла -->
                    <div 
                        style="padding-left: 16px; font-size: 14px; line-height: 24px; color: rgb(102, 102, 102);"
                        v-if="getFieldType(field.value.type) == 'FieldTypeURLArray'">
                        <span v-if="field.value.value.length && field.value.value[0]" class="link-like">
                            <a :href="getHref(field.value.value)" target="_blank"> {{ getNameForFiles(field.value.value) }} </a> 
                        </span>
                        <span v-else>
                            {{ 'Не назначено' }}
                        </span>
                    </div>

                    <!-- 8 -->
                    <el-input
                        v-if="getFieldType(field.value.type) == 'FieldTypeNumber'"
                        v-model="form_data.fields[findex].value.value">
                    </el-input>

                    <!-- 9 -->
                    <el-select 
                        v-if="getFieldType(field.value.type) == 'FieldTypeNumberArray'"
                        v-model="form_data.fields[findex].value.value.value"
                        :placeholder="field.value.value.value ? '' : 'Выберите вариант'" 
                        popper-class="ub-issue-form-popper"> 

                        <!-- selected -->
                        <template v-if="field.value.value.value" slot="prefix">
                            <div class="display"> 
                                <span> 
                                    {{ field.value.value.value }}  
                                </span>
                            </div>
                        </template>

                        <!-- options -->
                        <el-option
                            v-for="item, index in form_data.fields[findex].value.value.list" 
                            :key="index"
                            :value="item">
                            <template>
                                <div class="ub-issue-form-popper option">
                                    <span> {{ item }} </span>
                                    <i class="el-icon-check" 
                                    v-if="form_data.fields[findex].value.value.value  == item"></i>
                                </div>
                            </template>
                        </el-option>
                    </el-select>

                    <!-- 10 -->
                    <el-input
                        v-if="getFieldType(field.value.type) == 'FieldTypeFile'"
                        v-model="form_data.fields[findex].value.value">
                    </el-input>

                    <!-- 11 -->
                    <el-select 
                        v-if="getFieldType(field.value.type) == 'FieldTypeFileArray'"
                        v-model="form_data.fields[findex].value.value.value"
                        :placeholder="field.value.value.value ? '' : 'Выберите вариант'" 
                        popper-class="ub-issue-form-popper"> 

                        <!-- selected -->
                        <template v-if="field.value.value.value" slot="prefix">
                            <div class="display"> 
                                <span> 
                                    {{ field.value.value.value }}  
                                </span>
                            </div>
                        </template>

                        <!-- options -->
                        <el-option
                            v-for="item, index in form_data.fields[findex].value.value.list" 
                            :key="index"
                            :value="item">
                            <template>
                                <div class="ub-issue-form-popper option">
                                    <span> {{ item }} </span>
                                    <i class="el-icon-check" 
                                    v-if="form_data.fields[findex].value.value.value  == item"></i>
                                </div>
                            </template>
                        </el-option>
                    </el-select>
                </el-form-item>

            </div>

        </el-form>

    </div>
    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"

export default{
    name: 'ubIssuesForm',
    props: ['issue', 'data', 'needslink' ],
    components: {
        InlineSvg,
    },
    data() {
        return{
            form_data: {
                // основные поля, according to Dima, always present
                title: '',
                sts: null,          // obj
                cat: null,          // obj
                type: null,         // cat.types[0]
                reason: null,       // obj
                reason_type: null,  // reason.types[0]
                dscr: '',
                user: null,         // string
                observers: [],      // array of strings
                deadline_at: null,  // date
                created_at: null,   // date
                fields: [],
            }, 

            fields_loading: true, // loader for fields
        }
    },
    watch: {
        'issue'() {
            this.setData()
        },
        'form_data': {
            handler: function update() {
                this.$emit('update:form_data', this.form_data)
            },
            deep: true,
        }, 
    },
    methods: {
        setData() {
            if (this.issueHasId) {
                this.setExistingIssue()
            }
            else {
                this.setNewIssue() 
            }
        },
        setNewIssue() {
            if (!(this.data && this.statuses && this.categories )) {
                return null
            }
            const source = this.data
            this.form_data = Object.assign({}, 
                {
                    // template: null, // поле template временно отключено 
                    title: '',
                    sts: this.statuses.find(obj => obj.base_id == 2) || this.statuses[0] || null,
                    cat: this.categories && this.categories.length ? this.categories[0] : null,
                    type: this.categories && this.categories.length ? this.categories[0].types[0] : null || null,
                    reason: this.reasons && this.reasons.length ? this.reasons[0] : null || null,
                    reason_type: this.reasons && this.reasons.length ? this.reasons[0].types[0] : null || null,
                    description: '',
                    user: null,
                    observers: [],
                    deadline_at: null,
                    created_at: null,
                    fields: [],
                }
            )
            this.setNewIssueCustomFields(this.form_data.type)
        },
        setExistingIssue() {
            if (!this.issue) {
                return null
            }
            if (!this.data) {
                return null
            }
            let source = JSON.parse(JSON.stringify(this.issue))

            let sts = source.sts || this.statuses.find(obj => obj.base_id == 2)
            let ref = this.base_status_pool[sts.base_id]
            sts.color = ref.color 
            sts.textcolor = ref.textcolor

            this.form_data = Object.assign({}, 
                // вообще говоря, вариант null почти во всем будет вызывать ошибку, и это оставлено намеренно
                {
                    title: source.title,
                    sts: source.sts || this.statuses.find(obj => obj.base_id == 2) || this.statuses[0] || null,
                    cat: source.cat || this.categories[0] || null,
                    type: source.type ? source.type : (source.cat ? source.cat.types[0] : this.categories[0].types[0]),
                    reason: source.reason || this.reasons[0],
                    reason_type: source.reason ? source.reason.types[0] : this.reasons[0].types[0] || null,
                    dscr: source.dscr || '',
                    user: source.user || null,
                    observers: source.observers || [],
                    deadline_at: source.deadline_at || null,
                    created_at: source.created_at || null,
                    fields: [],
                }
            )
            if (Number(this.issue.id)>0) {
                this.setExistingIssueCustomFields(source.fields, source.fields_order)
            }
            if (Number(this.issue.id)<0) {
                this.setNewIssueCustomFields(source.type ? source.type : (source.cat ? source.cat.types[0] : this.categories[0].types[0]))
            }
        },
        getCurrentStatusColor() {
            if (!(this.form_data.sts && this.form_data.sts.base_id)) {
                return 'orange'
            }
            return this.base_status_pool[this.form_data.sts.base_id].color
        },
        getCurrentStatusTextColor() {
            if (!(this.form_data.sts && this.form_data.sts.base_id)) {
                return 'white'
            }
            return this.base_status_pool[this.form_data.sts.base_id].textcolor
        },
        handleTypeChange(v) {
            // v - type of cat.types
            this.changeCurrentCategory(v)
            if (this.issueHasId) {
                return null
            }
            this.fields_loading = true
            this.setNewIssueCustomFields(v)
        },
        changeCurrentCategory(v) {
            // console.log('change curr cat',v)
            this.form_data.cat = this.categories.find(obj => obj.id == v.cat_id)
        },
        changeCurrentReason(v) {
            // console.log('change curr reas',v)
            this.form_data.reason = this.reasons.find(obj => obj.id == v.cat_id)
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
        resetForm() {
            if (this.$refs['form'] == undefined) {
                return null
            }
            this.$refs['form'].resetFields()
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
        setNewIssueCustomFields(v) {
            // получает и выставляет пользовательские поля по типу (type.id) при создании проблемы
            if (!v) {
                return null
            }
            const project_id = this.project.id
            const type_id = v.id

            this.$store.dispatch('workflow/getFields', { uuid: project_id, type_id: type_id, })
            .then( res => {
                console.log('got fields', res)
                let list = []
                for (let item of res) {
                    if (!item.visible) {
                        // не добавляем невидимые поля
                        continue
                    }
                    if ([3,9,11].includes(item.value.type)) {
                        // номера типов, соотствующие спискам, см. в getFieldType - это поля с типом 'xyzArray'
                        // кроме 7
                        item.value.value = this.makeObjectFromList(item.value.value)
                    }
                    else if (item.value.type == 7 && this.needslink) {
                        const link = this.$route.fullPath
                        item.value.value = [link]
                    }
                    else if (item.value.type == 7 && !this.needslink) {
                        item.value.value = []
                    }
                    else {
                        item.value.value = ''
                    }
                    list.push(item)
                }
                // console.log('new res', res)
                this.form_data.fields = list
                
                list.sort((a,b) => { 
                    // сортировка полей по editable -> id; только для новых проблем.
                    const a_ed = a.editable
                    const b_ed = b.editable
                    const a_id = a.id
                    const b_id = b.id
                    if (a_ed == b_ed) {
                        return a_id - b_id
                    }
                    if (!a_ed) {
                        return -1
                    }
                    else {
                        return 1
                    }
                })
                this.fields_loading = false
            })
        },
        setExistingIssueCustomFields(fields, order) {
            // sorting and setting fields
            // console.log('setting existing fields', fields)
            let sorted_fields = [...fields]

            if (order) {
                sorted_fields.sort((a,b) => { order.indexOf(a.id) - order.indexOf(b.id) })
            }

            for (let item of sorted_fields) {
                if ([3,9,11].includes(item.value.type)) {
                    // номера типов, соотствующие спискам, см. в getFieldType - это поля с типом 'xyzArray'
                    item.value.value = this.makeObjectFromList(item.value.value)
                }
            }
            console.log('new fields', sorted_fields)
            
            this.form_data.fields = sorted_fields
            // console.log('set fields', this.form_data.fields)
            this.fields_loading = false
        },
        getFieldType(id) {
            switch(id) {
                case 1: {
                    return 'FieldTypeString' // "Текст. Текстовый"
                }
                case 2: {
                    return 'FieldTypeText' // "Абзац. Текстовый"
                }
                case 3: {
                    return 'FieldTypeStringArray' // "Список. Текстовый." Выбранное значение записывать в нулевую позицию
                }
                case 4: {
                    return 'FieldTypeFloat' // "Число. С плавающей точкой"
                }
                case 5: {
                    return 'FieldTypeDate' // "Дата. Строка."
                }
                case 6: {
                    return 'FieldTypeURL' // "Ссылка. Текстовый."
                }
                case 7: {
                    return 'FieldTypeURLArray' // "Список. Ссылка. Текстовый."
                }
                case 8: {
                    return 'FieldTypeNumber' // "Число. Целое"
                }
                case 9: {
                    return 'FieldTypeNumberArray' // "Список. Целое"
                }
                case 10: {
                    return 'FieldTypeFile' // "ID файла. Текстовый"
                }
                case 11: {
                    return 'FieldTypeFileArray' // "Список. ID файла. Текстовый"
                }
            }
        },
        makeObjectFromList(list) {
            let new_list = [...list]
            const val = new_list.length ? new_list.shift() : null
            return { value: val, list: new_list }
        },
        getHref(arr) {
            // в первом элементе массива должна стоять ссылка на документ
            if (!arr.length) {
                return null
            }
            return arr[0]
        },
        getNameForFiles(arr) {
            if (!arr.length) {
                return 'Не назначено'
            }
            let path = arr[0]
            const start = path.indexOf('?file=') + 6
            let end = path.indexOf('&delta')
            if (end<0) {
                end = path.indexOf('&amp;delta') 
            }
            const first_file_id = path.substring(start,end)
            // console.log('first_file_id', first_file_id)
            let file = this.$store.state.workflow.listDocs.find(obj => obj.files.some(file => file.url == first_file_id))
            // console.log('file', file, this.$store.state.workflow.listDocs)
            if (!file) {
                return 'Имя документа не распознается, либо открыт не единственный документ'
            }
            return file.name_short
        }
    },
    computed: {
        project() {
            if (!this.$route || !this.$route.params) {
                return null
            }
            let workflow = this.$store.state.workflow
            let project = workflow.projects.filter(i => i.id == this.$route.params.id)
            return project[0] || null
        },
        issueHasId() {
            // определяет, имеется ли в текущий момент на руках проблема с назначенным id
            if (!(this.issue && this.issue.id)) {
                return false
            }
            return true
        },
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
        base_status_pool() {
            // Базовые статусы. Порядковый номер совпадает с base_id статуса
            return {
                1: { title: 'Черновик', color: '#3c3c3c', textcolor: 'white', },
                2: { title: 'Открыто', color: '#faa21b', textcolor: 'black', },
                3: { title: 'На рассмотрении', color: '#0696d7', textcolor: 'white', },
                4: { title: 'Выполняется', color: '#a3bcdc', textcolor: 'white', },
                5: { title: 'Завершено', color: '#b7d78c', textcolor: 'white', },
                6: { title: 'Проверка', color: '#a76ef5', textcolor: 'white', },
                7: { title: 'Не утверждено', color: '#ec4a41', textcolor: 'white', },
                8: { title: 'Обсуждается', color: '#ec4a41', textcolor: 'white', },
                9: { title: 'Закрыто', color: '#dcdcdc', textcolor: 'black', },
            }
        },
        statuses() {
            // добавляет цвета из базы статусов // возвращает обновленный лист статусов
            if (!(this.data && this.data.statuses && this.base_status_pool)) {
                return []
            }
            let list = []
            for (const item of this.data.statuses) {
                const ref = this.base_status_pool[item.base_id] 
                let add = Object.assign({}, item) 
                add.color = ref.color
                add.textcolor = ref.textcolor
                list.push(add)
            }
            // console.log('status list', list)
            return list
        },
        categories() {
            let list = this.data ? this.data.categories : []
            // console.log('categories', this.data.categories)
            return list
        },
        reasons() {
            let list = this.data ? this.data.reasons : []
            // console.log('reasons', this.data.reasons)
            return list
        },
        validationRules() {
            return [{ required: true, message: 'Название проблемы не может быть пустым', trigger: 'blur', }]
        },
    },
    mounted() {
        this.setData()    
    }
}
</script>

<style lang="scss" scoped>

.issues--outer-wrap {
    width: 100%;
    height: 100%;
    padding: 0px;
}
.issues--inner-wrap {
    width: 100%;
    height: 100%;
}

.row-no-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
}

.issues--fields-loading {
    position: absolute; 
    z-index: 1; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%; 
    min-height: 60px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}




</style>
