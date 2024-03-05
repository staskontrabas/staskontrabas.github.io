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

            <!-- title -->
            <el-form-item label="Название причины" prop="title">
                <el-input 
                    v-model="form_data.title"
                ></el-input>
            </el-form-item>

            <!-- status / act_sts -->
            <el-form-item label="Статус" prop="act_sts">
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

            <!-- список типов / types -->
            <el-form-item label="Типы причины" prop="types">
                <div v-if="form_data.types && form_data.types.length">
                    <div class="icon_with_input" v-for="el, index in form_data.types">
                        <el-input 
                            placeholder="Введите название типа причины"
                            v-model="el.title"
                        ></el-input>
                        <inline-svg @click="removeType(index)" :src="require(`@/assets/icons/remove_node.svg`)"></inline-svg>
                    </div>
                </div>
                <div class="separate-span">
                    <span class="link-like-text" @click="addNewType(null)">
                        Добавить тип причины
                    </span>
                </div>

            </el-form-item>

        </el-form>

    </div>
    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"

export default{
    name: 'ubReasonForm',
    props: ['reason', 'data'],
    components: {
        InlineSvg,
    },
    data() {
        return{
            form_data: {
                title: '',
                act_sts: true,
                types: [],
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
        'reason'() {
            this.setData()
        }, 
    },
    methods: {
        setData() {
            if (this.reason && this.reason.id) {
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
            this.form_data = Object.assign({}, 
                {
                    // template: null, // поле template временно отключено 
                    title: '',
                    act_sts: true,
                    types: [],
                    editable: true,
                }
            )
        },
        setExisting() {
            if (!this.reason) {
                return null
            }
            let source = JSON.parse(JSON.stringify(this.reason))

            this.form_data = Object.assign({}, 
                {
                    title: source.title,
                    act_sts: source.act_sts,
                    types: source.types ? [...source.types] : [],
                    editable: source.editable,
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
    },
    computed: {
        validationRules() {
            return {
                title: [{ required: true, message: 'Введите название категории', trigger: 'blur', }],
                // status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
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
