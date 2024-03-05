<!--        
0.  Путь для импорта: // import ubCategoryForm from "@/components/custom/ubCategoryForm.vue"

 -->

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

            <!-- parent reason -->
            <el-form-item label="Причина" prop="cat">

                <el-select 
                    v-model="form_data.reason" 
                    value-key="id"
                    :placeholder="form_data.reason !== null ? '' : 'Выберите причину'"
                    popper-class="ub-issue-form-popper"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.reason !== null" slot="prefix">
                        <div class="ub-issue-form-popper display">
                            <span> {{ form_data.reason.title }} </span>
                        </div>
                    </template>

                    <!-- options -->
                    <el-option
                        v-for="reason in reasons"
                        :label="reason.title"
                        :key="reason.id"
                        :value="reason">
                        <template>
                            <div class="ub-issue-form-popper option">
                                <span> {{ reason.title }} </span>
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

        </el-form>

    </div>
    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"

export default{
    name: 'ubReasonTypeForm',
    props: ['reason_type', 'data'],
    components: {
        InlineSvg,
    },
    data() {
        return{
            form_data: {
                reason: null,
                title: '',
                act_sts: true,
                editable: true,
            },

            show_custom_create: false,

            custom_create_form_data: {
                title: '',
                type: null,
                value: '',
                value_list: [],
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
        'reason_type'() {
            this.setData()
        }, 
    },
    methods: {
        setData() {
            if (this.reason_type && this.reason_type.id) {
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
            if (!(this.data)) {
                return null
            }
            let reason = this.data && this.data.reasons? this.data.reasons[0] : null
            this.form_data = Object.assign({}, 
                {
                    // template: null, // поле template временно отключено 
                    reason: reason,
                    title: '',
                    act_sts: true,
                    editable: true,
                }
            )
        },
        setExisting() {
            if (!this.reason_type) {
                return null
            }
            let source = JSON.parse(JSON.stringify(this.reason_type))
            console.log()
            let reason = this.data.reasons.find(obj => obj.id == this.reason_type.cat_id)

            this.form_data = Object.assign({}, 
                {
                    reason: reason, // parent reason for the type
                    title: source.title,
                    act_sts: source.act_sts,
                    editable: source.editable,
                    // types: source.types ? [...source.types] : [],
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
        setPoppersWidth() {
            // для обобщения процедуры должно быть достаточно заменить класс обертки, содержащей el-select (здесь 'issues--inner-wrap')
            const ref = document.getElementsByClassName('issues--inner-wrap')[0]
            const real_width = ref ? ref.offsetWidth : null

            if (!real_width) {
                return null
            }
            let targets = document.querySelectorAll('.ub-issue-form-popper:not(.display)')
            // console.log('targets', targets)
            for (let elem of targets) {
                elem.style['min-width'] = real_width + 'px'
            }
        },
        addNewType() {
            let target = this.form_data.types
            let new_type = {
                title: '',
                mark: '',
                act_sts: true,
            }
            target.push(new_type)
        },
        removeType(index) {
            let target = this.form_data.types
            target.splice(index,1)
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
    },
    computed: {
        validationRules() {
            return {
                title: [{ required: true, message: 'Введите название категории', trigger: 'blur', }],
                // status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
        },
        reasons() {
            let list = this.data.reasons
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

</style>
