<!--        
0.  Путь для импорта: // import ubTypeForm from "@/components/custom/ubTypeForm.vue"

1.  Соглашение по именованию классов для редактируемых пользователем элементов: class="cat-{element_type}-element_name} {option}", где {option}: display | header | option

 -->

<template>
    <div class="issues--outer-wrap">
    <div class="issues--inner-wrap">

        <!-- Форма -->
        <el-form 
            class="form"
            ref="form"
            :model="form_data" 
            :rules="ValidationRules"
            label-position="top"
            popper-class="ub-issue-form-popper">


            <!-- parent category -->
            <el-form-item label="Категория" prop="cat">

                <el-select 
                    v-model="form_data.cat" 
                    value-key="id"
                    :placeholder="form_data.cat !== null ? '' : 'Выберите категорию'"
                    popper-class="ub-issue-form-popper"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.cat !== null" slot="prefix">
                        <div class="ub-issue-form-popper display">
                            <span> {{ form_data.cat.title }} </span>
                        </div>
                    </template>

                    <!-- options -->
                    <el-option
                        v-for="cat in categories"
                        :label="cat.title"
                        :key="cat.id"
                        :value="cat">
                        <template>
                            <div class="ub-issue-form-popper option">
                                <span> {{ cat.title }} </span>
                            </div>
                        </template>
                    </el-option>
                </el-select>

            </el-form-item>


            <!-- title -->
            <el-form-item label="Название типа" prop="title">
                <el-input 
                    v-model="form_data.title"
                ></el-input>
            </el-form-item>


            <!-- status / act_sts -->
            <el-form-item label="Статус" prop="folder">
                <el-select 
                    v-model="form_data.act_sts" 
                    :placeholder="form_data.act_sts !== null ? '' : 'Выберите статус'"
                    popper-class="ub-issue-form-popper"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.act_sts !== null" slot="prefix">
                        <div class="ub-issue-form-popper display">
                            <i  class="status-icon"
                                :class="getStatus(form_data.act_sts).icon" 
                                :style="{'color': getStatus(form_data.act_sts).color, 'margin-right': '0px',}">
                            </i>
                            <span> {{ getStatus(form_data.act_sts).title }} </span>
                        </div>
                    </template>

                    <!-- options -->
                    <el-option
                        v-for="item in [true, false]"
                        :label="getStatus(item).title"
                        :value="item">
                        <template>
                            <div class="ub-issue-form-popper active-status option">
                                <i 
                                    class="status-icon"
                                    :class="getStatus(item).icon" 
                                    :style="{'color': getStatus(item).color, 'margin-right': '0px',}">
                                </i>
                                <span> {{ getStatus(item).title }} </span>
                            </div>
                        </template>
                    </el-option>

                </el-select>
            </el-form-item>


            <!-- mark -->
            <el-form-item label="Закрепить метку" prop="mark">
                <div class="mark-row">
                    <div 
                        class="problem-category-mark-28"
                        :style="{ 
                                'background-color': 'orange', 
                                'color': 'black', 
                        }">
                        <span v-if="form_data.mark">
                            {{ form_data.mark }}
                        </span>
                        <i v-else class="el-icon-check" style="font-size: 22px;"></i>  
                        </div>
                    <el-input 
                        v-model="form_data.mark"
                        maxlength="3"
                    ></el-input>
                </div>
                
            </el-form-item>


            <!-- fields / пользовательские поля -->
            <el-form-item v-if="!typeHasId" label="Пользовательские поля" prop="types">
                <div v-if="form_data.new_fields && form_data.new_fields.length">
                    <div v-for="el, elindex in form_data.new_fields">
                        <span class="field-label"> 
                            {{ el.title }} 
                        </span>
                        <div class="field">

                            <!-- просто поле -->
                            <el-input 
                                v-if="el.type !== 'list'" 
                                v-model="el.value"> 
                            </el-input>

                            <!-- список значений -->
                            <el-select 
                                v-if="el.type == 'list'"
                                v-model="form_data.new_fields[elindex].value"
                                :placeholder="form_data.new_fields[elindex].value ? '' : 'Выберите статус'"
                                popper-class="ub-issue-form-popper"
                                @visible-change="setPoppersWidth">

                                <!-- selected -->
                                <template v-if="form_data.new_fields[elindex].value" slot="prefix">
                                    <div class="ub-issue-form-popper display">
                                        <span> {{ form_data.new_fields[elindex].value }} </span>
                                    </div>
                                </template>

                                <!-- options -->
                                <el-option
                                    v-for="opt, opt_index in form_data.new_fields[elindex].value_list"
                                    :label="opt"
                                    :key="opt_index"
                                    :value="opt">
                                    <template>
                                        <div class="ub-issue-form-popper option">
                                            <span> {{ opt }} </span>
                                        </div>
                                    </template>
                                </el-option>

                            </el-select>
                            <inline-svg @click="removeNewField(elindex)" :src="require(`@/assets/icons/remove_node.svg`)"></inline-svg>
                        </div>
                        
                    </div>
                </div>
                <div class="separate-span">
                    <span class="link-like-text" @click="showCustomDialog">
                        Добавить пользовательское поле
                    </span>
                </div>

                <!-- диалог создания пользовательского поля -->
                <v-dialog 
                    v-model="show_custom_create"
                    width="550px" max-width="550px" 
                    @click:outside="cancel">
                    
                    <div class="custom-create-header">
                        <span> Создать пользовательское поле </span>
                        <v-btn
                            text
                            icon
                            @click="cancel"
                            color="#7f7f7f">
                            <v-icon size="20">close</v-icon>
                        </v-btn>
                    </div>
                    
                    <div class="custom-create-form-wrapper">
                        <el-form 
                            ref="form-addition"
                            :model="custom_create_form_data"
                            :rules="additionValidationRules" 
                            label-position="top" 
                            class="custom-container">

                            <el-form-item label="Название поля" prop="title">
                                <el-input 
                                    v-model="custom_create_form_data.title">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="Тип" prop="type">
                                <el-select 
                                    fit-input-width 
                                    v-model="custom_create_form_data.type" 
                                    placeholder="Тип">
                                    <el-option
                                        v-for="item in fieldTypes"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.value">
                                    <span style="float: left"> {{ item.name }} </span>
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="Список значений" prop="value_list"
                                v-if="custom_create_form_data.type && custom_create_form_data.type == 'list'">
                                <el-select
                                    v-model="custom_create_form_data.value_list"
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

                            <el-form-item label="Значение" prop="value"
                                v-if="custom_create_form_data.type && (custom_create_form_data.type == 'string' || custom_create_form_data.type == 'number')">
                                <el-input v-model="custom_create_form_data.value"></el-input>
                            </el-form-item>
                            
                        </el-form>
                    </div>

                    <div class="custom-create-footer">
                        <el-button type="default" @click="cancel"> 
                            <span>
                                Отмена
                            </span>
                        </el-button>

                        <el-button type="main" @click="create">
                            <span>
                                Создать
                            </span>
                        </el-button>
                    </div>

                </v-dialog>
                

            </el-form-item>

        </el-form>

    </div>
    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"

export default{
    name: 'ubTypeForm',
    props: ['data', 'type',],
    components: {
        InlineSvg,
    },
    data() {
        return{
            show_custom_create: false,

            custom_create_form_data: {
                title: '',
                type: null,
                value: '',
                value_list: [],
            },

            form_data: {
                cat: null,
                title: '',
                act_sts: true,
                mark: '',
                fields: [],
                new_fields: [],
                editable: true,
            },
        }
    },
    watch: {
        'form_data': {
            handler: function update() {
                this.$emit('update:form_data', this.form_data)
            },
            deep: true,
        },
        'type'() {
            this.setData()
        }, 
    },
    methods: {
        setData() {
            if (this.type && this.type.id) {
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
        setNew() {
            let cat = this.data && this.data.categories ? this.data.categories[0] : null
            this.form_data = Object.assign({}, 
                {
                    cat: cat,
                    title: '',
                    editable: true,
                    act_sts: true,
                    mark: '',
                    fields: [],
                    new_fields: [],
                }
            )
        },
        setExisting() {
            if (!(this.type && this.type.id)) {
                return null
            }
            let source = JSON.parse(JSON.stringify(this.type))
            let cat = this.data.categories.find(obj => obj.id == this.type.cat_id)

            this.form_data = Object.assign({}, 
                {
                    cat: cat,
                    title: source.title,
                    act_sts: source.act_sts,
                    editable: source.editable,
                    mark: source.mark,
                    // fields: source.fields ? [...source.fields] : [],
                }
            )
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
        validateAddition() {
            if (this.$refs['form-addition'] == undefined) {
                return false
            }
            let verdict = false
            this.$refs['form-addition'].validate((valid) =>
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
        cancel() {
            this.show_custom_create = false
            this.custom_create_form_data = Object.assign({}, {
                title: '',
                type: null,
                value: '',
                value_list: [],
            })
        },
        showCustomDialog() {
            this.show_custom_create = true
        },
        create() {
            // создает кастомное поле // тут их просто надо добавлять в тупой список
            if (!this.validateAddition()) {
                return null
            }

            const source = this.custom_create_form_data
            let field = {}

            field.title = source.title
            field.editable = true
            field.visible = true
            field.required = false
            field.value = source.value
            field.value_list = source.value_list
            field.type = source.type

            if (this.form_data && this.form_data.new_fields) {
                this.form_data.new_fields.push(field)
            }
            else {
                this.form_data.new_fields = [field]
            }
            console.log('this is field', field)
            this.cancel()
        },
        removeNewField(index) {
            let target = this.form_data.new_fields
            if (!target) {
                return null
            }
            target.splice(index,1)
        },
    },
    computed: {
        ValidationRules() {
            return {
                title: [{ required: true, message: 'Введите название типа', trigger: 'blur', }],
                // status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
        },
        additionValidationRules() {
            return {
                title: [{ required: true, message: 'Название поля не может быть пустым', trigger: 'blur', }],
                type: [{ required: true, message: 'Необходимо выбрать тип', trigger: 'blur', }],
                value: [{ required: true, message: 'Введите значение параметра', trigger: 'blur', }],
                value_list: [{ required: true, message: 'Добавьте допустимые значения элементов', trigger: 'blur', }],
            }
        },
        categories() {
            let list = this.data.categories
            return list ? list : []
        },
        typeHasId() {
            let type = this.type
            if (type && type.id) {
                return true
            }
            return false
        },
        fieldTypes() {
            return [{
                    value: 'string',
                    name: 'Текст',
                    id: 1,
                },{
                    value: 'number',
                    name: 'Число',
                    id: 2,
                },{
                    value: 'list',
                    name: 'Список',
                    id: 3,
                }]
        },
    },
    mounted() {
        this.setData()    
    }
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

.mark-row {
    display: flex; 
    flex-direction: row; 
    flex-wrap: nowrap; 
    align-items: center; 
    gap: 8px;
}

.separate-span {
    margin-top: 8px;
}

.custom-create-header {
    height: var(--issue-create-header-height);
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


.custom-create-form-wrapper {
    padding: 12px 16px;
    max-height: var(--issue-create-form-height);
    height: var(--issue-create-form-height);
    overflow-y: auto;
}

.custom-create-footer {
    height: var(--issue-create-footer-height);
    padding: 20px 24px;
    border-top: 1px solid #dcdcdc;
    background-color: #fdfdfd;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    gap: 12px;
}


.field-label {
    font-family: "Artifakt Element", sans-serif;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
}

.field {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
}

</style>
