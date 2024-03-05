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

            
            <!-- account -->
            <el-form-item label="Добавить">
                <el-select
                    v-model="form_data.entities"
                    multiple
                    filterable
                    remote
                    reserve-keyword
                    value-key="id"
                    placeholder="Начните вводить имя"
                    popper-class="ub-issue-form-popper entities"
                    class="role-selector"
                    :remote-method="remoteMethod"
                    :loading="loading"
                    @visible-change="setPoppersWidth"
                    @change="setPoppersWidth">

                    <!-- Сделать темплейт для отображения выбранных величин -->

                    <!-- список сотрудников -->
                    <div
                        v-if="filtered_managers && filtered_managers.length"
                        class="role-entities-header">
                        <span> Сотрудники </span>
                    </div>
                    
                    <el-option
                        v-for="manager in filtered_managers"
                        :key="manager.id"
                        :label="manager.name"
                        :value="manager">
                        <template>
                            <div class="ub-issue-form-popper entities option">
                                <div style="display: flex; flex-direction: column;">
                                    <span style="font-size: 13px;">
                                        {{ manager.name }}
                                    </span>   
                                    <span style="font-size: 12px;">
                                        {{ manager.email }}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </el-option>

                    <!-- компания пользователя -->
                    <div 
                        v-if="filtered_company && filtered_company.length"
                        class="role-entities-header">
                        <span> Компания </span>
                    </div>
                    <el-option
                        v-for="company in filtered_company"
                        :key="'company' + company.id"
                        :label="company.name"
                        :value="company">
                        <template>
                            <div class="ub-issue-form-popper option">
                                {{ company.name }}
                            </div>
                        </template>
                    </el-option>

                    <!-- список ролей -->
                    <div 
                        v-if="filtered_roles && filtered_roles.length"
                        class="role-entities-header">
                        <span> Роли </span>
                    </div>
                    <el-option
                        v-for="role in filtered_roles"
                        :key="'role' + role.id"
                        :label="role.title"
                        :value="role">
                        <template>
                            <div class="ub-issue-form-popper option">
                                {{ role.title }}
                            </div>
                        </template>
                    </el-option>

                        
                </el-select>
            </el-form-item>

            <!-- permissions / разрешения -->
            <el-form-item label="Уровень доступа">
                <el-select 
                    v-model="form_data.permissions" 
                    :placeholder="form_data.permissions ? '' : 'Выберите уровень доступа'"
                    value-key="rel"
                    popper-class="ub-issue-form-popper access-selector"
                    @visible-change="setPoppersWidth">

                    <!-- selected -->
                    <template v-if="form_data.permissions" slot="prefix">
                        <div class="ub-issue-form-popper display">
                            <span> {{ form_data.permissions ? form_data.permissions.title : '' }} </span>
                        </div>
                    </template>

                    <!-- options -->
                    <el-option
                        v-for="item in access_options"
                        :label="item.title"
                        :key="item.rel"
                        :value="item">
                        <template>
                            <div class="ub-issue-form-popper access-level-card">
                                <div class="visual-indicator">
                                    <div class="visual-cell" v-for="index in 4" :class="getVisualCellClass(index,item.rel)"></div>
                                </div>
                                <div class="description">
                                    <span class="d-title"> 
                                        {{ item.title }} 
                                    </span>
                                    <span class="d-text">
                                        {{ item.dscr }}
                                    </span>
                                </div>
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

export default {
    name: 'ubPermissionForm',
    props: ['account', 'access_options', 'data' ],
    components: {
        InlineSvg,
    },
    data() {
        return {
            loading: false,

            form_data: {
                entities: null,
                permissions: null,
            },

            roles: [],

            filtered_managers: [],
            filtered_company: [],
            filtered_roles: [],

        }
    },
    watch: {
        'form_data': {
            handler: function update() {
                this.$emit('update:form_data', this.form_data)
            },
            deep: true,
        },
        'account'() {
            this.setData()
        }, 
    },
    methods: {
        setData() {
            if (this.account) {
                this.setExisting()
            }
            else {
                this.setNew() 
            }
        },
        setNew() { 
            this.form_data.entities = null
            this.form_data.permissions = this.access_options[0]
        },
        setExisting() {

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
                elem.style['max-width'] = real_width + 'px'
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
        makeObjectFromList(list) {
            let new_list = [...list]
            const val = new_list.length ? new_list.shift() : null
            return { value: val, list: new_list }
        },
        setFieldType(type) {
            console.log('fieldtype', type)
            if (type == 'list') {
                this.form_data.value.value = {
                    value: '',
                    list: [],
                }
            }
            else {
                this.form_data.value.value = ''
            }
        },
        getFieldType(type) {
            // console.log('type is', type)
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
        getVisualCellClass(index,rel) {
            // console.log('rel', rel, index)
            index = index - 1
            if (rel == undefined || rel == null) {
                return ''
            }
            if (index == undefined || index == null) {
                return ''
            }
            switch(rel) {
                case 'folder_viewer': {
                    return ['outlined','','',''][index]
                }
                case 'folder_downloader': {
                    return ['filled','','',''][index]
                }
                case 'folder_publicator': {
                    return ['filled','outlined','',''][index]
                }
                case 'folder_creator': {
                    return ['filled','filled','',''][index]
                }
                case 'folder_editor': {
                    return ['filled','filled','filled',''][index]
                }
                case 'folder_administrator': {
                    return ['filled','filled','filled','filled'][index]
                }
            }
        },
        remoteMethod(query) {
            if (query !== '') {
            this.loading = true;
            setTimeout(() => {
                this.loading = false;
                this.filtered_managers = this.managers.filter(i => {
                    return  i.name.toLowerCase().indexOf(query.toLowerCase()) > -1 
                        ||  i.email.toLowerCase().indexOf(query.toLowerCase()) > -1
                })
                this.filtered_roles = this.roles.filter(i => {
                    return  i.title.toLowerCase().indexOf(query.toLowerCase()) > -1     
                })
                this.filtered_company = this.company.filter(item => {
                    return item.official_name.toLowerCase().indexOf(query.toLowerCase()) > -1 
                        || item.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
                });
            }, 200);
            } else {
                // пустой список, если в поле поиска ничего не введено
                this.filtered_managers = [];
                this.filtered_roles = [];
                this.filtered_company = [];
            }
        },
        getRoles() {
            this.$store.dispatch('administration/getRoles')
            .then(res => {
                this.roles = res
                for (let role of this.roles) {
                    role.id = role.rid
                }
            })
            .catch(err => {
                console.log('error loading roles', err)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удается получить список ролей. Проверьте соединение.',
                    message: 'Не удается получить список ролей. Проверьте соединение.',
                })
            })
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
        managers(){
            let users = this.$store.state.administration.company.users || []
            users = users
                .map(u => ({
                    id: u.id + '',
                    avatar: u.avatarSrc,
                    email: u.email,
                    name: u.first_name + ' ' + u.last_name,
            }))
            return users
        },
        company() {
            let current_company = this.$store.state.administration.company
            let friendlist = current_company.c_friends || []
            friendlist.splice(0,0, {
                id: current_company.id,
                name: current_company.name,
                official_name: current_company.official_name,
            })
            return friendlist
        },
    },
    mounted() {
        this.getRoles()
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

.row-no-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
}

.access-level-card {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    & .visual-indicator {
        min-width: 150px;
        height: 100%;
        padding: 8px;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        & .visual-cell {
            max-width: 30px;
            min-width: 30px;
            height: 8px;
            border-radius: 8px;
            border: 1px solid transparent;
            background-color: #eee;
            &.outlined {
                border-color: #006eaf;
            }
            &.filled {
                background-color: #006eaf;
                border-color: #006eaf;
            }
        }
    }
    & .description {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: start;
        --descr-width: calc(100% - 150px);
        max-width: var(--descr-width);
        padding: 0px 8px;
        font-size: 12px;
        & .d-title {
            font-weight: 600;
            max-width: 100%;

        } 
        & .d-text {
            font-weight: 400;
            max-width: 100%;
            overflow-wrap: break-word;
            white-space: normal;
        }
    }
}

.role-entities-header {
    height: 24px; 
    font-size: 14px; 
    font-weight: 600; 
    display: flex; 
    flex-direction: row; 
    align-items: center;
    padding: 0px 8px; 
    background-color: #f6f6f6;
}



</style>
