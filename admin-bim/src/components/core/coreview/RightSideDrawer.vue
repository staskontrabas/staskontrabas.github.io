<template>
    <edit-issue
        :show="show"
        :issue="issue"
        :data="data"
        :loading="loading"
        @cancel="cancel"
        @save="updateProblem"
        @create="createNewProblem"
        @delete="deleteProblem"
    />
</template>

<script>
import EditIssue from "./EditIssue.vue"

export default {
    name: 'RightSideDrawer',
    components: {
        EditIssue,
    },
    props: ['task_id','type_id','cat_id'],
    data() {
        return {
            show: false,
            data: null,
            issue: null,
            loading: true,
        }
    },
    watch: {
        'task_id'(newval) {
            if (newval == null) {
                return null
            }
            console.log('setting task_id', newval)
            this.show = true
            this.getDataOnIssues()
            .then(() => {
                // существующая проблема
                if (Number(newval)>0) {
                    console.log('all problems', this.data.problems)
                    this.issue = this.data.problems.find(obj => obj.id == newval)
                    this.loading = false
                }
                else if (Number(newval)<0) {
                    // новая проблема
                    let category = this.data.categories.find(obj => obj.id == this.cat_id)
                    let type = category.types.find(obj => obj.id == this.type_id)
                    let sts = this.data.statuses.find(obj => obj.base_id == 2) || this.data.statuses[0] 
                    this.issue = {
                        id: this.task_id,
                        cat: category,            
                        created_at: null,
                        deadline_at: null,
                        description: '',
                        fields: [],
                        observers: [],
                        reason: null,
                        reason_type: null,
                        sts: sts,
                        title: '',
                        type: type,
                        user: null,
                    }
                    this.loading = false
                }
            })
        },
        'show'(newval,oldval) {
            // уведомить wasm-модуль об изменении видимости меню редактирования проблемы (Module в этот момент должен быть уже объявлен)
            Module.notifyTaskEditorVisibilityChanged(newval)
        },
    },
    methods: {
        cancel() {
            this.show = false
            this.loading = true
            this.$emit('clear')
        },
        getDataOnIssues() {
            const project_uuid =  this.$route.params.id
            if (!project_uuid) {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удается определить текущий проект.' ,
                        message: 'Не удается определить текущий проект.' ,
                })
                return null
            }
            
            let task_data = {}

            return Promise.all([
                this.$store.dispatch('workflow/getProblems', project_uuid).then(res => { 
                    task_data.problems = res; 
                }),
                this.$store.dispatch('workflow/getProblemStatuses', project_uuid).then(res => { 
                    task_data.statuses = res; 
                }),
                this.$store.dispatch('workflow/getProblemCategories', project_uuid).then(res => { 
                    task_data.categories = res; 
                }),
                this.$store.dispatch('workflow/getProblemTemplates', project_uuid).then(res => { 
                    task_data.templates = res 
                }),
                this.$store.dispatch('workflow/getProblemReasons', project_uuid).then(res => { 
                    task_data.reasons = res; 
                }),
            ])
            .then(() => {
                this.data = task_data
            }) 
        },
        updateProblem(problem) {
            // сохраняет проблему после редактирования в правом дравере; сюда должна приходить уже полностью собранная проблема
            const project_id = this.project.id
            this.show = false

            this.$store.dispatch('workflow/updateProblem', { uuid: project_id, body: problem, })
            .then( res =>  {
                console.log('success', res )
                this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проблема "' + problem.title + '" успешно изменена.',
                        message: 'Проблема "' + problem.title + '" успешно изменена.',
                })
            })
            .catch( err => {
                console.log('error', err )
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Произошла ошибка при редактировании проблемы со стороны сервиса.',
                        message: 'Произошла ошибка при редактировании проблемы со стороны сервиса.',
                })
                this.cancel()
            } )
        },
        createNewProblem(problem) {
            // отправляет запрос на создание проблемы, запрашивает и обновляет список проблем, обновляет проблему в дравере и уведомляет wasm-модуль
            const project_id = this.project.id
            const oldId = this.task_id
            let newId = null

            this.$store.dispatch('workflow/createProblem', { uuid: project_id, body: problem, })
            .then(res => {
                console.log('created problem', res) // закомментировать позже

                newId = res.id
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Проблема "' + problem.title + '" успешно создана.' ,
                    message: 'Проблема "' + problem.title + '" успешно создана.',
                })
                return res
            })
            .then(task => {
                this.$store.dispatch('workflow/getProblems', project_id).then(res => { 
                    this.data.problems = res
                    Module.notifyTaskCreated(oldId,newId)
                    this.show = false
                })
            })
            .catch(er => {
                console.log('err',er)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'При создании проблемы "' + problem.title + '" произошла ошибка.' ,
                    message: 'При создании проблемы "' + problem.title + '" произошла ошибка.' ,
                })
            })
        },
        deleteProblem(problem) {
            if (!problem && !problem.id) {
                return null
            }
            const project_uuid =  this.$route.params.id
            this.$store.dispatch('workflow/removeProblem', { uuid: project_uuid, problem_id: problem.id })
            .then( res => {
                this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проблема "' + problem.title + '" успешно удалена.' ,
                        message: 'Проблема "' + problem.title + '" успешно удалена.',
                })
                this.show = false
                
            })
            .then(() => {
                // уведомить модуль wasm об удалении проблемы
                Module.notifyTaskRemoved(problem.id)
            })
            .catch( err => {
                console.log('deleting error', err)
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'При удалении проблемы "' + problem.title + '" произошла ошибка.' ,
                        message: 'При удалении проблемы "' + problem.title + '" произошла ошибка.' ,
                    })}
            )
        },
        checkIfWasmModuleIsDefined() {
            return typeof Module !== 'undefined'
        },
        showAgain() {
            this.show = true
            this.loading = false
        },
        hide() {
            this.show = false
            this.loading = true
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
    },
    mounted() {
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
    &.delete {
        color: var(--deep-red-color);
    }
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

.status-plate {
    --border-raduis: 3px;
    height: 18px;
    margin-right: 8px;
    border-top-left-radius: var(--border-raduis);
    border-top-right-radius: var(--border-raduis);
    border-bottom-right-radius: var(--border-raduis);
    border-bottom-left-radius: var(--border-raduis);
    max-width: 6px;
    min-width: 6px;
}

.edit-problem-title-plate {
    max-width: 85%;
    font-family: "Artifakt Element", sans-serif;
    font-weight: 400;
    font-size: 20px;
    line-height: 26px;
}


.status-row-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 !important;
    min-height: fit-content;
}

</style>