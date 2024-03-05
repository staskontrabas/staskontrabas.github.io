
<template>
    <v-dialog 
        content-class="issue-create-type issues--outer-wrap" 
        :value="showdialogue" 
        width="600px" max-width="600px" 
        @click:outside="cancel">

        <div class="type-create-header">
            <span> Создать тип </span>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </div>

        <div class="type-create-form-wrapper">
            <ub-type-form
                ref="form"
                :data="data"
                :type="null"
                :form_data.sync="form_data">
            </ub-type-form>
            
        </div>
        <div class="type-create-footer">
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
</template>

<script>
import ubTypeForm from "@/components/custom/ubTypeForm.vue"

export default {
    name: 'createNewType',
    components: {
        ubTypeForm,
    },
    props: ['showdialogue', 'data',],
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
        create() {
            if (!this.$refs['form']) {
                return null
            }
            if (!this.$refs['form'].validateForm()) {
                return null
            }

            let data = JSON.parse(JSON.stringify(this.form_data))
            this.$emit('create', data )
        },
    },
    computed: {
    },
    mounted() {
    }
}
</script>


<style scoped lang="scss">
/////////////////// диалог создания типа ///////////////////

::v-deep .issue-create-type {
    --issue-create-header-height: 70px;
    --issue-create-footer-height: 70px;
    --issue-create-form-height: calc(70vh - var(--issue-create-header-height) - var(--issue-create-footer-height));
 }

.type-create-header {
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

.type-create-form-wrapper {
    padding: 12px 16px;
    max-height: var(--issue-create-form-height);
    height: var(--issue-create-form-height);
    overflow-y: auto;
}

.type-create-footer {
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