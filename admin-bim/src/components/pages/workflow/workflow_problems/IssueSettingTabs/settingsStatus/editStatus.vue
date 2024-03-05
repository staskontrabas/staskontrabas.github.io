<template class="edit-problem">
    <v-navigation-drawer
        :value="show"
        :permanent="show"
        absolute
        right
        width="400"
        style="z-index: 1000;">
        <template>
            <div class="edit-problem-wrapper">

                <div class="edit-problem-header">
                    <div class="edit-problem-title-field">
                        <span class="truncate-text edit-problem-title-plate">
                            Изменить статус
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


                        <!-- Основная вкладка -->
                        <el-tab-pane label="Подробности" name="details">

                            <div class="edit-problem-scrollable">
                                <ub-status-form
                                    v-if="show"
                                    ref="form"
                                    :status="status"
                                    :data="data"
                                    :form_data.sync="form_data"
                                    @change_status="changeStatus"
                                />
                            </div>

                        </el-tab-pane>

                    </el-tabs>
                </div>

            </div>
        </template>

    </v-navigation-drawer>
    
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubStatusForm from "@/components/custom/ubStatusForm.vue"

export default {
    name: 'EditStatus',
    components: {
        InlineSvg,
        ubStatusForm,
    },
    props: ['status', 'data', 'show'],
    data() {
        return {
            activeName: 'details',

            form_data: null,

            needs_tooltip: false,
            
        }
    },
    watch: {
    },
    methods: {
        cancel() {
            this.$emit('cancel')
        },
        checkIfNeedsTooltip(arg) {
            let target = arg.target 
            if (target.offsetWidth < target.scrollWidth) {
                this.needs_tooltip = true           
                return true
            }
            this.needs_tooltip = false
            return false
        },
        changeStatus() {
            console.log('this s', this.status, this.form_data)
            this.$emit('save', {status: this.status, data: this.form_data})
        }
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
        project() {
            if (!this.$route || !this.$route.params) {
                return null
            }
            let workflow = this.$store.state.workflow
            let project = workflow.projects.filter(i => i.id == this.$route.params.id)
            return project[0] || null
        },
        validationRules() {
            return {
                // name: [{ required: true, message: 'Название проблемы не может быть пустым', trigger: 'blur', }],
                status: [{ required: true, message: 'Необходимо указать, активен ли статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
        },
    },
    mounted() {

    }
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
    padding: 0px 0px;
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

.remove-margin-right {
    margin: 0;
}

.edit-problem-scrollable {
    padding-top: 16px;
    overflow-y: auto; 
    overflow-x: hidden;
    height: calc(100% - 48px);
}

.edit-problem-title-plate {
    max-width: 85%;
    font-family: "Artifakt Element", sans-serif;
    font-weight: 400;
    font-size: 20px;
    line-height: 26px;
}


</style>