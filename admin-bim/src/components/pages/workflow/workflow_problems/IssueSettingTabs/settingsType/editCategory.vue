<!-- 

    0. Путь для импорта 

    1. Нужны: текущая категория
    2. Данные по типам, доступным в данной категории (проще запросить на месте)

 -->

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
                            Категория
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
                                <el-button class="remove-margin-right" type="main" @click="saveChanges">
                                    <div class="el-btn-wrap">
                                        <span> Сохранить </span>
                                    </div>
                                </el-button>
                                <el-button class="remove-margin-right" type="default">
                                    <div class="el-btn-wrap delete" @click="deleteCategory">
                                        <inline-svg :src="delete_icon"></inline-svg>
                                        <span> Удалить категорию </span>
                                    </div>
                                </el-button>
                            </div>

                            <div class="edit-problem-scrollable">
                                <ub-category-form
                                    v-if="show"
                                    ref="form"
                                    :category="category"
                                    :form_data.sync="form_data"
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
                        Удалить категорию?
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
                        Вы собираетесь удалить 1 категорию. Вы уверены? 
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
                        @click="confirmDeleteCategory">
                        Удалить категорию
                    </el-button>
                </div>
            </div>
        </v-dialog>


    </v-navigation-drawer>
    
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubCategoryForm from "@/components/custom/ubCategoryForm.vue"

export default {
    name: 'EditCategory',
    components: {
        InlineSvg,
        ubCategoryForm,
    },
    props: ['category', 'data', 'show'],
    data() {
        return {
            activeName: 'details',

            has_unsaved_changes: false,

            form_data: null,

            delete_icon: require(`@/assets/icons/trash-icon.svg`),
            show_delete_dialog: false,
            
        }
    },
    watch: {
    },
    methods: {
        cancel() {
            this.$emit('cancel')
        },
        confirmDeleteCategory() {
            this.$emit('delete', this.category)
        },
        deleteCategory() {
            // shows dialog
            this.show_delete_dialog = true
        },
        saveChanges() {
            // cat object {title, id, editable, act_sts, types[object type]}
            if (!this.$refs['form']) {
                return null
            }
            if (!this.$refs['form'].validateForm()) {
                return null
            } 
            let source = this.form_data
            let id = this.category.id

            let cat = {}
            let types = []

            if (source.types) {
                for (const elem of source.types) {
                    if (elem.id) {
                        types.push(elem)
                        continue
                    }
                    if (!elem.title) {
                        continue
                    }
                    types.push({
                        title: elem.title,
                        mark: '',
                        editable: true,
                        act_sts: true,
                        cat_id: id,
                    })
                }
            }

            cat.title = source.title
            cat.id = id
            cat.editable = source.editable
            cat.act_sts = source.act_sts
            cat.types = types

            this.$emit('save', cat)
        },
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