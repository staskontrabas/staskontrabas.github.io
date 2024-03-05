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
                            Тип {{ type && type.title ? type.title : '' }} 
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
                            <div class="edit-problem-button-panel">
                                <el-button class="remove-margin-right" type="main" @click="saveChanges">
                                    <div class="el-btn-wrap">
                                        <span> Сохранить </span>
                                    </div>
                                </el-button>
                                <el-button class="remove-margin-right" type="default">
                                    <div class="el-btn-wrap delete" @click="deleteType">
                                        <inline-svg :src="delete_icon"></inline-svg>
                                        <span> Удалить тип </span>
                                    </div>
                                </el-button>
                            </div>

                            <div class="edit-problem-scrollable">
                                <ub-type-form
                                    v-if="show"
                                    ref="form"
                                    :type="type"
                                    :data="data"
                                    :form_data.sync="form_data"
                                />
                            </div>

                        </el-tab-pane>

                        
                        <!-- Пользовательские поля -->
                        <el-tab-pane label="Пользовательские поля" name="fields">

                            <div class="field-draggable">
                                <div class="field-drag-handle">
                                </div>
                                <span class="field-drag-title truncate-text">
                                    Название поля
                                </span>
                                <div class="field-drag-checkbox">
                                    <el-tooltip 
                                        effect="dark" 
                                        :disabled="!needs_tooltip"
                                        placement="right">
                                            <template #content>
                                                Обязательное
                                            </template>
                                            <span 
                                                class="field-drag-check-span truncate-text" 
                                                @mouseover="checkIfNeedsTooltip">
                                                Обязательное
                                            </span>
                                    </el-tooltip>  
                                </div>
                                <div class="field-drag-eye">
                                    <el-tooltip 
                                        effect="dark" 
                                        :disabled="!needs_tooltip"
                                        placement="right">
                                            <template #content>
                                                Видимое
                                            </template>
                                            <span 
                                                class="field-drag-check-span truncate-text" 
                                                @mouseover="checkIfNeedsTooltip">
                                                Видимое
                                            </span>
                                    </el-tooltip>  
                                </div>

                            </div>

                            <div class="edit-problem-scrollable">
                                <Container 
                                    drag-handle-selector=".field-drag-handle"
                                    :get-child-payload="getChildPayload"
                                    @drop="onDrop"
                                    style="height: 100%;">
                                    <Draggable 
                                        v-for="field in fields"
                                        :drag-not-allowed="true"
                                        :key="field.id">
                                        <div class="field-draggable">
                                            <div class="field-drag-handle">
                                                <inline-svg v-if="field.editable" :src="drag_icon"/>
                                            </div>
                                            <el-tooltip 
                                                effect="dark" 
                                                :disabled="!needs_tooltip"
                                                placement="right">
                                                    <template #content>
                                                        {{ field.title }}
                                                    </template>
                                                    <span 
                                                        class="field-drag-title truncate-text" 
                                                        @mouseover="checkIfNeedsTooltip">
                                                        {{ field.title }}
                                                    </span>
                                            </el-tooltip>  
                                            <div class="field-drag-checkbox">
                                                <el-checkbox 
                                                    v-model="field.required"
                                                    :disabled="!field.editable"
                                                    @change="updateField(field)"/>
                                            </div>
                                            <div class="field-drag-eye">
                                                <inline-svg 
                                                    :src="getVisible(field.visible).icon"
                                                    :style="{ 'fill': getVisible(field.visible && field.editable).color, 'width': '24px', 'height': '24px',}"
                                                    @click="field.editable ? toggleVisible(field): null"/>                                
                                            </div>
                                        </div>
                                    </Draggable>
                                </Container>
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
                        Удалить тип?
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
                        Вы собираетесь удалить 1 тип. Вы уверены? 
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
                        @click="confirmDeleteType">
                        Удалить тип
                    </el-button>
                </div>
            </div>
        </v-dialog>


    </v-navigation-drawer>
    
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubTypeForm from "@/components/custom/ubTypeForm.vue"
import { Container, Draggable } from "vue-dndrop"

export default {
    name: 'EditType',
    components: {
        InlineSvg,
        ubTypeForm,
        Container,
        Draggable,
    },
    props: ['type', 'data', 'show'],
    data() {
        return {
            activeName: 'details',

            has_unsaved_changes: false,

            form_data: null,

            delete_icon: require(`@/assets/icons/trash-icon.svg`),
            show_delete_dialog: false,

            fields: null,
            drag_icon: require(`@/assets/icons/drag-handle.svg`),
            eye_icon: require(`@/assets/icons/show.svg`),
            no_eye_icon: require(`@/assets/icons/hide.svg`),


            needs_tooltip: false,
            
        }
    },
    watch: {
        'type'() {
            this.getFieldsForType()
        },
    },
    methods: {
        cancel() {
            this.getFieldsForType()
            this.$emit('cancel')
        },
        confirmDeleteType() {
            this.$emit('delete', this.type)
        },
        deleteType() {
            // shows dialog
            this.show_delete_dialog = true
        },
        saveChanges() {
            // cat object {title, id, editable, act_sts, types[object type]}
            let source = this.form_data
            let id = this.type.id

            let type = {}
            let fields = []

            if (source.fields) {
                for (const elem of source.fields) {
                    if (elem.id) {
                        // уже существующие
                        fields.push(elem)
                        continue
                    }
                    if (!elem.title) {
                        continue
                    }
                    // новые
                    fields.push({
                        title: elem.title,
                        type: elem.type,
                        value: elem.value,
                        value_list: elem.value_list,
                    })
                }
            }

            type.title = source.title
            type.id = id
            type.cat_id = source.cat.id
            type.editable = source.editable
            type.act_sts = source.act_sts
            type.mark = source.mark
            type.fields = source.fields ? [...source.fields] : []

            this.$emit('save', type)
        },
        async getFieldsForType() {
            if (!this.type) {
                return null
            }
            this.$store.dispatch('workflow/getFields', { uuid: this.project.id, type_id: this.type.id, })
            .then(res => { 
                console.log('fields', res)
                let list = res
                list.sort((a,b) => { 
                    // false values first
                    const a_ed = a.editable
                    const b_ed = b.editable
                    const a_id = a.id
                    const b_id = b.id
                    if (a_ed == b_ed) {
                        return a_id - b_id
                    }
                    if (!a_ed) {
                        return -1
                    }
                    else {
                        return 1
                    }
                })
                this.fields = list
            })
        },
        updateField(field) {
            let source = this.fields.find(obj => obj.id == field.id)
            console.log('source', source)
            this.$store.dispatch('workflow/updateTypeField', { project_id: this.project.id, type_id: source.type_id, body: source,})
            .then(() => {
                console.log('updated ' + field.title)
            })
            .catch(() => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Что-то пошло не так при обновлении данных.',
                    message: 'Что-то пошло не так при обновлении данных.',
                })
            })
        },
        onDrop() {
            // manage Drop
            console.log('drop', arguments)
        },
        getChildPayload() {
            console.log('payload', arguments)
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
        getVisible(vis) {
            if (vis) {
                return { icon: this.eye_icon, title: 'Видимое поле', color: '#006eaf', }
            }
            return { icon: this.no_eye_icon, title: 'Невидимое поле', color: '#666666', }
        },
        toggleVisible(field) {
            if (!field) {
                return null
            }
            let f = this.fields.find(obj => obj.id == field.id)
            f.visible = !f.visible
            this.updateField(f)
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
                name: [{ required: true, message: 'Название типа не может быть пустым', trigger: 'blur', }],
                // status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
        },
    },
    mounted() {
        this.getFieldsForType()
    },
    beforeDestroy() {
        // this.getFieldsForType()
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
    overflow-y: auto; 
    overflow-x: hidden;
    height: calc(100% - 48px);
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

.field-draggable {
    --column-width: 64px;
    min-height: 48px;
    padding: 0px 16px;
    border-bottom: 2px solid var(--lower-border-color);


    width: 100%;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;

    

    & .field-drag-title {
        padding-left: 8px;
        max-width: calc(100% - 32px - 32px - var(--column-width) - var(--column-width));
        min-width: calc(100% - 32px - 32px - var(--column-width) - var(--column-width));
    }
    & .field-drag-checkbox { 
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: var(--column-width);
        max-width: var(--column-width);
        margin: 0px 8px;
    }
    & .field-drag-eye {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: var(--column-width);
        max-width: var(--column-width);
        margin: 0px 8px;
    }

    & .field-drag-check-span {
        min-width: var(--column-width);
        max-width: var(--column-width);
        margin: 0px 8px;
    }
}

.field-drag-handle {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;

    max-width: 32px;
    min-width: 32px;

    border-radius: 4px;

}

</style>