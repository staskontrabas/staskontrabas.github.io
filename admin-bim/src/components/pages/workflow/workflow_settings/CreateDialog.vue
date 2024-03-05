<template>
    <v-dialog 
        :value="show" 
        class="cd-wrapper" 
        max-width="600px"
        @click:outside="cancel">

        <div class="cd-dialogwrap">

            <div class="cd-header">
                <span> Создать пространство </span>
                <v-btn
                    text
                    icon
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20"> close </v-icon>
                </v-btn>
            </div>
            
            <div class="cd-scrollable">

                <el-form 
                    class="cd-mainform"
                    ref="form"
                    :model="form_data" 
                    :rules="validationRules"
                    label-position="top">

                    <!-- title -->
                    <el-form-item label="Название пространства" prop="title">
                        <el-input 
                        v-model="form_data.title"
                        @blur="validateAll"
                        ></el-input>
                    </el-form-item>

                    <!-- clash -->
                    <!-- <el-form-item label="Включить коллизии по умолчанию?" prop="clash">
                        <div class="cd-clash" slot="label">

                            <div class="cd-row">
                                <span>
                                    Включить коллизии по умолчанию?
                                </span>
                                <i class="el-icon-warning-outline" style="font-size: 16px; color: #409EFF;"></i>
                                <el-switch
                                    v-model="form_data.clash"
                                ></el-switch>
                            </div>
                            
                            <div class="cd-row">
                                <span class="note"> <span style="font-weight: 600;"> Важно! </span> Эту настройку нельзя будет изменить позже. </span> 
                            </div>
                        </div>
                    </el-form-item> -->

                    <!-- folder selector -->
                    <el-form-item label="Выбор папки" prop="folder">
                        <div class="cd-tree-selector">
                            <div class="cd-loader vm-progress" v-if="loading" >
                                <inline-svg class="inline-svg" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
                            </div>

                            <el-tree
                                v-else
                                ref="tree"
                                :expand-on-click-node="false"
                                :data="folderslist"
                                node-key="id"
                                highlight-current
                                empty-text="Нет данных"
                                @current-change="nodeSelected"
                                >
                            
                                <template slot-scope="{ node, data }">
                                    <div class="eltree-node-textarea">
                                        <inline-svg min-width="24" min-height="24" :src="folder_icon" style="min-height:24px; min-width:24px;"/>
                                        <el-tooltip effect="dark" :content="node.label" :disabled="!needs_tooltip" placement="right">
                                            <span ref="eltree-node-spans" class="eltree-node-span" @mouseover="checkIfNeedsTooltip"> 
                                                {{ node.label }}
                                            </span>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-tree>  
                        </div>
                    </el-form-item>

                </el-form>

            </div>

        </div>

        <div class="cd-btn-wrap">
            <el-button type="outlined" @click="cancel"> 
                <span>
                    Отмена
                </span>
            </el-button>

            <el-button type="main" @click="createSpace" :disabled="!can_create">
                <span>
                    Создать
                </span>
            </el-button>
        </div>

    </v-dialog>
</template>


<script>
import InlineSvg from "vue-inline-svg"
import { service } from '@/utils/services'

export default {
    name: 'CreateDialog',
    props: ['show'],
    components: {
        InlineSvg,
    },
    data() {
        return {
            can_create: false,
            folder_icon: require(`@/assets/icons/file-icon.svg`),

            form_data: {
                title: '',
                collisions: false,
                folder: null,
            },

            folderActive: null,
            needs_tooltip: false,

            loading: true,
        }
    },
    methods: {
        cancel() {
            this.$emit('update:show', false)
            this.$store.commit('workflow/setCurrentFolder', 0)
            this.$store.commit('workflow/setFoldersMap', [])
            this.form_data = Object.assign({}, {
                title: '',
                collisions: false,
                folder: null,
            }) 
        },
        createSpace() {
            let space = {
                title: this.form_data.title, 
                folder_id: this.folderActive.id,
            }
            this.$emit('create', space)
        },
        nodeSelected(n) {
            // отображает контент ноды в просмотрщике, выделяя текущую папку
            console.log('selected node', n)
            this.folderActive = n
            this.validateAll()
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
        validateAll() {
            const form_valid = this.validateForm()
            const folder_chosen = (this.folderActive !== null && this.folderActive.id !== undefined)

            this.can_create = (form_valid && folder_chosen)
        },
        setFolderData() {
            let workflow = this.$store.state.workflow

            this.$store.dispatch('workflow/getProjects', {
                type_id: 'c',
                id: this.$store.state.administration.company.id
            })
            .then(res => {
                let project = workflow.projects.filter(i => i.id == this.$route.params.id)
                project = project.length
                    ? JSON.parse(JSON.stringify(project[0]))
                    : null

                let projectName = project ? project.info.name : ''

                let title = [
                    {title: 'Документооборот', path: '/workflow'},
                    {title: projectName, path: ''}
                ]
                let clearPath = []

                if(this.path){
                    this.$store.commit('workflow/setCurrentFolder', this.path)
                }

                this.$store.commit('toolbar/setTitle', title)

                return Promise.all([
                    this.$store.commit('workflow/setActiveProject', project),
                    ...clearPath,
                    this.$store.dispatch('workflow/getFolders'),
                    this.$store.dispatch('workflow/getTaskProject', {
                        type_id: 'c',
                        id: this.$store.state.administration.company.id,
                        project_uuid: project.id,
                        filter: {}
                    })
                ])
            })
            .finally(res => {
                this.$store.dispatch('workflow/createFoldersMap')
                this.loading = false
            })
        },
    },
    computed: {
        validationRules() {
            return {
                title: [{ required: true, message: 'Введите название пространства', trigger: 'blur', }],
                // status: [{ required: true, message: 'Проблеме должен быть назначен статус', trigger: 'blur', }],
                // type: [{ required: true, message: 'Необходимо выбрать тип проблемы', trigger: 'blur', }],
            }
        },
        folderslist() {
            let map = this.$store.state.workflow.foldersMap
            let curF = this.$store.state.workflow.currentFolder
            console.log('data', map, curF)
            let tree = service.createTreeForSidebar(map, curF)
            makeLabels(tree,0)
            console.log('tree', tree)
            // не нашел способа заставить el-tree читать вложенные ниже первого уровня поля, хотя default-props позволяет переназначать стандартные
            function makeLabels(arr,lvl) {
                for (let elem of arr) {
                    elem.label = elem.title
                    elem.id = elem.data.id
                    elem.nodelevel = lvl
                    if (elem.children) {
                        makeLabels(elem.children,lvl+1)
                    }
                }
            }
            return tree
        },
    },
    mounted(){
        this.setFolderData()
    },
}
</script>

<style lang="scss" scoped>
/////////////////// 
 


.cd-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
} 

.cd-dialogwrap {
    min-height: 600px;
    max-height: 600px;
}

.cd-header {
    height: 70px;
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

.cd-scrollable {
    --cd-height: 600px;
    min-height: calc(var(--cd-height) - 70px);
    max-height: calc(var(--cd-height) - 70px);
    overflow-y: auto;
}

.cd-tree-selector {
    border: 1px solid grey;
    min-height: calc(360px);
    max-height: calc(360px);
    overflow-y: auto;
    overflow-x: auto;
}


.cd-mainform {
    padding: 16px 16px;
}

.cd-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: calc(350px);
    max-height: calc(350px);
    background-color: white;
    & inline-svg {
        fill: blue;
    }
}

.cd-clash {
    font-weight: 400 !important;
    font-size: 14px;

    display: flex;
    flex-direction: column;
    justify-content: start;
    & .cd-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        & .note {
            font-size: 12px;
        }
    }
    & span {
        margin-right: 4px;
    }
    & i {
        margin-right: 16px;
    }
}

.cd-btn-wrap {
    min-height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: end;
    align-items: center;
    padding: 16px;
}


</style>
