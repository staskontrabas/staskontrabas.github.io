
<template>
    <v-dialog content-class="issue-create-dialog" :value="showdialogue" width="600px" max-width="600px" @input="v => v || cancel()">
        <div class="issue-create-header">
            <span> Создать проблему </span>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </div>
        <div class="issue-create-form-wrapper">
            <ub-issues-form
                ref="issue-create-form"
                :data="data"
                :form_data.sync="form_data"
                :issue="issue"
                :needslink="false"
                >
            </ub-issues-form>
        </div>
        <div class="issue-create-footer">
            <el-button type="default" @click="cancel"> 
                <span>
                    Отмена
                </span>
            </el-button>

            <el-button type="main" @click="createIssue">
                <span>
                    Создать
                </span>
            </el-button>
        </div>
    </v-dialog>
</template>

<script>
import ubIssuesForm from "@/components/custom/ubIssuesForm.vue"

export default {
    name: 'newIssueDialogue',
    components: {
        ubIssuesForm,
    },
    props: ['showdialogue', 'data', 'issue',],
    data() {
        return {
            form_data: null,
        }
    },
    watch: {
    },
    methods: {
        cancel() {
            this.$emit('cancel')
            this.form_data = null
        },
        createIssue() {
            if (!this.$refs['issue-create-form']) {
                return null
            }
            if (!this.$refs['issue-create-form'].validateForm()) {
                return null
            }
            let data = JSON.parse(JSON.stringify(this.form_data))
            this.$emit('create_issue', { data: data, id: this.data.id })
        },
    },
    computed: {
    },
    updated() {
        // console.log('updated form',this.form_data)
    },
    mounted() {
    }
}
</script>


<style scoped lang="scss">

::v-deep .issue-create-dialog {
    --issue-create-header-height: 70px;
    --issue-create-footer-height: 70px;
    --issue-create-form-height: calc(70vh - var(--issue-create-header-height) - var(--issue-create-footer-height));
}

.issue-create-header {
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

.issue-create-form-wrapper {
    padding: 12px 16px;
    max-height: var(--issue-create-form-height);
    height: var(--issue-create-form-height);
    overflow-y: auto;
}

.issue-create-footer {
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
</style>