<template>
    <v-navigation-drawer
        :value="show"
        :permanent="show"
        absolute
        right
        width="400"
        height="calc(100vh - 50px)"
        style="z-index: 1000;">
        <template>
            <div
                v-show="loading"
                class="m-back m-back--trans">
                <div class="vm-progress">
                    <inline-svg class="inline-svg" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
                </div>
            </div>

            <div class="edit-problem-wrapper">

                <div class="edit-problem-header">
                    <div class="edit-problem-title-field">
                        <span class="truncate-text edit-problem-title-plate">
                            Проблема № {{ issue ? issue.order : '' }}
                        </span>
                        <el-button 
                            type="other" 
                            icon="el-icon-close" 
                            circle
                            @click="cancel">
                        </el-button>
                    </div>

                </div>

                <div class="edit-problem-content">
                    <el-tabs v-model="activeName">
                        <el-tab-pane label="Подробности" name="details">
                            <div class="edit-problem-button-panel">
                                <el-button 
                                    :disabled="!enable_save"
                                    class="remove-margin-right" 
                                    type="main" 
                                    @click="changeIssue">
                                    <div class="el-btn-wrap">
                                        <span> Сохранить </span>
                                    </div>
                                </el-button>
                                <el-button 
                                    :disabled="isTemporary"
                                    class="remove-margin-right" type="deletetask">
                                    <div 
                                        class="el-btn-wrap" 
                                        @click="deleteProblem">
                                        <inline-svg :src="delete_icon"></inline-svg>
                                        <span> Удалить проблему </span>
                                    </div>
                                </el-button>
                            </div>

                            <div class="edit-problem-scrollable">
                                <ub-issues-form
                                    v-if="show"
                                    ref="issue-create-form"
                                    :data="data"
                                    :form_data.sync="form_data"
                                    :issue="issue"
                                    :needslink="true"
                                />
                            </div>

                        </el-tab-pane>

                    </el-tabs>
                </div>

            </div>
        </template>

        <v-dialog v-model="show_delete_dialog" width="450px" max-width="450px">
            <div class="edit-problem-dialogue-wrapper">
                <div class="epd-header">
                    <span>
                        Удалить проблему?
                    </span>
                    <el-button 
                        type="other" 
                        icon="el-icon-close" 
                        circle
                        @click="show_delete_dialog = false">
                    </el-button>
                </div>
                <div class="epd-body">
                    <span style="text-align: center; display: table-cell;">
                        Вы собираетесь удалить 1 проблему. Это приведет к удалению проблемы из журнала и листа или модели. Вы уверены? 
                    </span>
                </div>
                <div class="epd-footer">
                    <el-button 
                        type="outlined" 
                        @click="show_delete_dialog = false">
                        Отмена
                    </el-button>
                    <el-button 
                        type="red" 
                        @click="confirmDeleteProblem">
                        Удалить проблему
                    </el-button>
                </div>
            </div>
        </v-dialog>


    </v-navigation-drawer>
    
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubIssuesForm from "@/components/custom/ubIssuesForm.vue"

export default {
    name: 'EditIssue',
    components: {
        InlineSvg,
        ubIssuesForm,
    },
    props: ['issue', 'data', 'show', 'loading',],
    data() {
        return {
            activeName: 'details',

            enable_save: false,

            form_data: null,

            delete_icon: require(`@/assets/icons/trash-icon.svg`),
            show_delete_dialog: false,
            
        }
    },
    watch: {
        'data'(newval) {
            if (newval !== null) {
                this.setData()
            }   
        },
        'issue'(newval) {
            if (newval !== null) {
                this.setData()
            }
        },
        'form_data': {
            handler() {
                // уведомить wasm об изменениях - послать JSON.stringify(Issue), которую еще нужно собрать.
                if (!this.issue) {
                    return null
                }

                if (!this.$refs['issue-create-form']) {
                    return null
                }

                if (this.loading) {
                    return null
                }

                this.enable_save = this.$refs['issue-create-form'].validateForm()

                if (window.Module === undefined) {
                    return null
                }

                const json = JSON.stringify(this.createIssueFormFormData())
                const id = this.issue.id
                // console.log('this is json', json)
                Module.notifyTaskUpdated(id, json)
            },
            deep: true
        },
    },
    methods: {
        cancel() {
            this.$emit('cancel')
        },
        changeIssue() {
            if (!this.$refs['issue-create-form'].validateForm()) {
                return null
            }

            if (Number(this.issue.id)> 0) {
                let problem = JSON.parse(JSON.stringify(this.issue))
                let fields = JSON.parse(JSON.stringify(problem.fields))
                const data = this.form_data

                // ниже - список правильных id уже существующей проблемы, должны быть установлены для успешного редактирования
                const sts_id = problem.sts.id  
                const cat_id = problem.cat.id
                const cat_type_id = problem.cat.types[0].id
                const rsn_id = problem.reason.id
                const rsn_type_id = problem.reason.types[0].id

                problem.title = data.title
                problem.sts = data.sts
                problem.sts.id = sts_id
                problem.fields = fields
                delete problem.sts.color
                delete problem.sts.textcolor
                problem.cat = data.cat 
                problem.cat.id = cat_id
                problem.cat.types = [data.type]
                problem.cat.types[0].id = cat_type_id
                problem.reason = data.reason 
                problem.reason.id = rsn_id
                problem.reason.types = [data.reason_type]
                problem.reason.types[0].id = rsn_type_id
                problem.dscr = data.dscr
                problem.user = data.user
                problem.observers = data.observers
                problem.deadline_at = data.deadline_at
                problem.created_at = data.created_at

                this.$emit('save', problem)
                return null
            }
            if (Number(this.issue.id) < 0) {

                let problem = this.createIssueFormFormData()
                this.$emit('create', problem)
                return null
            }
        },
        createIssueFormFormData() {
            // собирает и возвращает объект проблемы в соответствии с шаблоном сервиса бэкэнда
            let problem = {}
            let data = JSON.parse(JSON.stringify(this.form_data))
            let fields = data.fields || []

            for (let item of fields) {
                if ([3,9,11].includes(item.value.type)) {
                    // номера типов, соотствующие спискам, см. в getFieldType - это поля с типом 'xyzArray'
                    // кроме 7, который содержит ссылку на документ
                    item.value.value = makeListFromObject(item.value.value)
                }
            }

            problem.title = data.title
            problem.sts = data.sts
            problem.fields = fields
            if (problem.sts) {
                delete problem.sts.color
                delete problem.sts.textcolor
            }
            problem.cat = data.cat 
            problem.cat.types = [data.type]
            problem.reason = data.reason 
            problem.reason.types = [data.reason_type]
            problem.dscr = data.dscr
            problem.user = data.user
            problem.observers = data.observers
            problem.deadline_at = data.deadline_at
            problem.created_at = data.created_at

            function makeListFromObject(obj) {
                return [obj.value ? obj.value : '', ...obj.list]
            }

            return problem
        },
        confirmDeleteProblem() {
            this.$emit('delete', this.issue)
            this.show_delete_dialog = false
        },
        deleteProblem() {
            this.show_delete_dialog = true
        },
        getCurrentStatusColor() {
            if (!this.statuses.length) {
                return 'orange'
            }
            if (!(this.form_data.sts && this.form_data.sts.color)) {
                return 'orange'
            }
            return this.statuses.find(obj => obj.base_id == this.form_data.sts.base_id).color
        },
        getCategory(id) {
            if (!this.categories) {
                return null
            }
            return this.categories.find(obj => obj.id == id).title
        },
        getReason(id) {
            if (!this.reasons) {
                return null
            }
            return this.reasons.find(obj => obj.id == id).title
        },
        setData() {

            if (!this.issue) {
                return null
            }
            if (!this.data) {
                return null
            }
            let source = JSON.parse(JSON.stringify(this.issue))

            this.form_data = Object.assign({}, 
                {
                    // здесь нет категории, потому что она не выбирается по сути, выбирается только тип
                    title: source.title,
                    sts: this.currentStatus || this.statuses[0] || null,
                    cat: source.cat || null,
                    type: source.cat.types[0] || this.categories[0].types[0] || null,
                    reason: source.reason ? source.reason : this.reasons[0],
                    reason_type: source.reason ? source.reason.types[0] : this.reasons[0].types[0] || null,
                    dscr: source.dscr || '',
                    user: source.user || null,
                    observers: source.observers || [],
                    deadline_at: source.deadline_at || null,
                    created_at: source.created_at || null,
                }
            )
        },
        changeCurrentCategory(v) {
            console.log('change curr cat',v)
            this.form_data.cat = this.categories.find(obj => obj.id == v.cat_id)
        },
        changeCurrentReason(v) {
            console.log('change curr reas',v)
            this.form_data.reason = this.reasons.find(obj => obj.id == v.cat_id)
        },
    },
    computed: {
        isTemporary() {
            let id = this.issue ? this.issue.id : null
            if (id == null) {
                return null
            }
            if (Number(id)>0) {
                return false
            }
            if (Number(id)<0) {
                return true
            }
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
        statuses() {
            // добавляет цвета из базы статусов
            if (!(this.data && this.data.statuses && this.data.base_status_pool)) {
                return []
            }
            let list = []
            for (const item of this.data.statuses) {
                const ref = this.data.base_status_pool[item.base_id] 
                let add = Object.assign({}, item) 
                add.color = ref.color
                add.textcolor = ref.textcolor
                list.push(add)
            }
            // console.log('status list', list)
            return list
        },
        currentStatus() {
            // только для того, чтобы добавить сюда цвет из базового пула
            if (!(this.issue && this.issue.sts)) {
                return null
            }
            if (!(this.data && this.data.base_status_pool)) {
                return null
            }
            let sts = JSON.parse(JSON.stringify(this.issue.sts))
            const ref = this.data.base_status_pool[sts.base_id] 
            sts.color = ref.color
            sts.textcolor = ref.textcolor
            return sts
        },
        categories() {
            // console.log('categories', this.data.categories)
            let list = this.data.categories
            return list
        },
        reasons() {
            let list = this.data.reasons
            return list
        },
        validationRules() {
            return {
                name: [{ required: true, message: 'Название проблемы не может быть пустым', trigger: 'blur', }],
                // status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
        },
    },
}
</script>


<style scoped lang="scss">

.edit-problem-wrapper {
    --edit-problem-wrap-padding: 16px;
    --lower-border-color: #eee;
    --edit-problem-header-height: 60px;
    --deep-red-color: darkred;
    --button-panel-height: 48px;
    display: flex;
    flex-direction: column;
    height: calc(100%);
    width: calc(100%);
    padding: var(--edit-problem-wrap-padding);
}

.edit-problem-header {
    
    display: flex;
    flex-direction: column;
    min-height: calc(var(--edit-problem-header-height) - var(--edit-problem-wrap-padding));
    max-height: calc(var(--edit-problem-header-height) - var(--edit-problem-wrap-padding));

    position: sticky;
    top: 0;
}

.edit-problem-title-field {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.edit-problem-button-panel {
    display: flex; 
    flex-direction: row; 
    height: 48px; 
    align-items: center;
    padding: 0px 16px;
}

.edit-problem-content {
    min-height: calc(100% - var(--edit-problem-header-height));
}

.el-btn-wrap {
    display: flex; 
    align-items: center; 
    gap: 8px;
}

.divider-vertical {
    margin: 0px 8px;
    min-width: 2px;
    background-color: var(--lower-border-color);
    min-height: calc(70%);
    max-height: calc(70%);
}

.remove-margin-right {
    margin: 0;
}

.edit-problem-scrollable {
    overflow-y: auto; 
    overflow-x: hidden;
    height: calc(100% - 48px);
}

.edit-problem-filed-wrap {
    display: flex;
    flex-direction: column;
    justify-content: start;
}

.edit-problem-dialogue-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 200px;
    background-color: white;
    border-radius: 4px;
    padding: 16px;
}

.epd-header {
    display: flex; 
    flex-direction: row; 
    align-items: center; 
    justify-content: space-between; 
    font-family: "Artifakt Element", sans-serif;
    font-size: 24px; 
}

.epd-body {
    display: flex;
    justify-content: center;
    font-family: "Artifakt Element", sans-serif;
    font-size: 12px;
} 

.epd-footer {
    display: flex;
    justify-content: end;
}


.edit-problem-title-plate {
    max-width: 85%;
    font-family: "Artifakt Element", sans-serif;
    font-weight: 400;
    font-size: 20px;
    line-height: 26px;
}

.gray-text {
    color: gray !important;
}



</style>