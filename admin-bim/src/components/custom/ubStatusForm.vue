<!--        
0.  Путь для импорта: // import ubStatusForm from "@/components/custom/ubStatusForm.vue"

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


            <!-- title -->
            <el-form-item label="Название статуса" prop="title">
                <!-- <el-input 
                    v-model="form_data.title"
                ></el-input> -->
                <div class="name-plate">
                    {{ form_data.title }}
                </div>
            </el-form-item>


            <!-- status / act_sts -->
            <el-form-item label="Статус" prop="folder">
                <el-select 
                    v-model="form_data.act_sts" 
                    :placeholder="form_data.act_sts !== null ? '' : 'Выберите статус'"
                    popper-class="ub-issue-form-popper"
                    :disabled="!status.editable"
                    @change="changeStatus"
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
    name: 'ubStatusForm',
    props: ['data', 'status',],
    components: {
        InlineSvg,
    },
    data() {
        return {
            form_data: {
                title: '',
                dscr: '',
                editable: true,
                act_sts: true,
                base_id: null,
                prj_id: null,
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
        'status'() {
            this.setData()
        }, 
    },
    methods: {
        setData() {
            if (this.status && this.status.id) {
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
            this.form_data = Object.assign({}, 
                {
                    title: '',
                    dscr: '',
                    editable: true,
                    act_sts: true,
                    base_id: null,
                    prj_id: null,
                }
            )
        },
        setExisting() {
            if (!(this.status && this.status.id)) {
                return null
            }
            let source = JSON.parse(JSON.stringify(this.status))

            this.form_data = Object.assign({}, 
                {
                    title: source.title,
                    dscr: source.dscr,
                    editable: source.editable,
                    act_sts: source.act_sts,
                    base_id: source.base_id,
                    prj_id: source.prj_id,
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
            for (let elem of targets) {
                elem.style['min-width'] = real_width + 'px'
            }
        },
        cancel() {
            this.show_custom_create = false
            this.setNew()
        },
        showCustomDialog() {
            this.show_custom_create = true
        },
        changeStatus() {
            this.$emit('change_status')
        }
    },
    computed: {
        ValidationRules() {
            return {
                // title: [{ required: true, message: 'Введите название типа', trigger: 'blur', }],
                status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
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
    },
    mounted() {
        this.setData()    
    }
}
</script>

<style lang="scss" scoped>

.name-plate {
    padding-left: 16px;
}

.status-icon {
    font-size: 24px;
    margin-right: 8px;
}

</style>
