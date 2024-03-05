<template>
    <v-container pt-0 fluid fill-height text-xs-center class="page-container marker">
        <div class="models-secondary-wrap">

            <!-- заголовок -->
            <div class="project-wrapper">
                <span class="project-title">
                    Модели
                </span>

                <!-- выбор space -->
                <div class="models-space-select" style="margin-left: auto; margin-right: 16px;">
                    <el-select
                        value-key="id"
                        v-model="current_space"
                        placeholder="Выберите пространство">

                        <el-option
                            v-for="space in spaces"
                            :key="space.id"
                            :value="space"
                            :label="space.title">
                        </el-option>

                    </el-select>
                </div>
            </div>

            <!-- замещение вкладки для совпадения по высоте -->
            <div class="tabs-blank"></div>

            <!-- обертка -->
            <div class="models-main-body">

                <div class="table-header">

                    <!-- левая часть -->
                    <div class="left">
                        <!-- кнопка открыть в просмотрщике -->
                        <el-button
                            :disabled="!rows_selected.length"
                            ref="open-button"
                            type="main"
                            class="open-viewer-btn"
                            @click="openInViewer">
                            <div>
                                <inline-svg :src="require(`@/assets/icons/export.svg`)"/>
                                <span>
                                    Открыть для просмотра
                                </span>
                            </div>
                        </el-button>

                    </div>

                    <!-- правая часть -->
                    <div class="right">

                        <!--  строка поиска в таблице -->
                        <!-- <div class="input-wrapper">
                            <v-text-field
                                v-model="search"
                                prepend-icon="search"
                                placeholder="Поиск по моделям"
                                single-line
                                hide-details
                                class="m-table-toolbar--search ml-2"
                            ></v-text-field>
                        </div> -->
                    </div>
                </div>

                <!-- обертка таблицы -->
                <div class="table-wrapper">

                    <!-- сама таблица -->
                    <ub-table
                        ref="models-table"
                        :data="table_data"
                        :preselect="rows_selected"
                        :headers="[
                            {name: 'name', title: 'модель', width: '340', icon: null, click: null, },
                            {name: 'version', title: 'версия', width: '80', icon: null, click: null, },
                            {name: 'path', title: 'путь', width: '250', icon: null, click: null, },
                            {name: 'contributor', title: 'загрузил', width: '200', icon: null, click: null, },
                            {name: 'updated_at', title: 'обновлено', width: '200', icon: null, click: null, },
                            {name: 'collisions', title: 'коллизии', width: '100', icon: null, click: null, },
                            {name: 'menu', title: '', width: '48', icon: null, click: 'tableMenu',}
                        ]"
                        @selected_change="manageSelectedChange"
                        :savedcolumnwidth="loadColumnWidth()"
                        @save_columns_width="saveColumnsWidth"
                        multiselectable>

                        <!-- name / название -->
                        <template v-slot:column1="{ item }">
                            <el-tooltip
                                effect="dark"
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ item.title }}
                                    </template>
                                    <span class="truncate-text"
                                        @mouseover="checkIfNeedsTooltip">
                                        {{ item.title }}
                                    </span>
                            </el-tooltip>
                        </template>

                        <!-- version / версия -->
                        <template v-slot:column2="{ item }">

                            <div style="cursor: default !important;" class="ub-version-plaque" v-if="item.ver">
                                <span>
                                V{{ item.ver }}
                                </span>
                            </div>
                            <div class="ub-version-dashes" v-else>
                                <span>
                                    --
                                </span>
                            </div>

                        </template>

                        <!-- path / путь к файлу -->
                        <template v-slot:column3="{ item }">
                            <el-tooltip
                                effect="dark"
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ item.path }}
                                    </template>
                                        <span class="truncate-text"
                                            @mouseover="checkIfNeedsTooltip">
                                            {{ item.path }}
                                        </span>
                            </el-tooltip>
                        </template>

                        <!-- contributor / кем загружено -->
                        <template v-slot:column4="{ item }">
                            <v-img
                                class="avatar"
                                :src="getUser(item.owner).avatar"
                            ></v-img>
                            <el-tooltip
                                effect="dark"
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ getUser(item.owner).name }}
                                    </template>
                                    <span class="truncate-text"
                                        @mouseover="checkIfNeedsTooltip">
                                        {{ getUser(item.owner).name }}
                                    </span>
                            </el-tooltip>
                        </template>

                        <!-- updated_at / обновлено -->
                        <template v-slot:column5="{ item }">
                            <el-tooltip
                                effect="dark"
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        {{ getDate(item.updated_at) }}
                                    </template>
                                        <span class="truncate-text"
                                            @mouseover="checkIfNeedsTooltip">
                                            {{ getDate(item.updated_at) }}
                                        </span>
                            </el-tooltip>
                        </template>

                        <!-- collisions / коллизии -->
                        <template v-slot:column6="{ item }">
                            <el-tooltip
                                effect="dark"
                                :disabled="!needs_tooltip"
                                placement="right">
                                    <template #content>
                                        <span>
                                            --
                                        </span>
                                    </template>
                                        <span class="truncate-text"
                                            @mouseover="checkIfNeedsTooltip">
                                            <template>
                                                --
                                            </template>
                                        </span>
                            </el-tooltip>
                        </template>

                        <template v-slot:column7="{ item }">
                        <!-- Последняя колонка должна присутствовать для правильного отображения ширины -->
                        </template>

                    </ub-table>
                </div>


            </div>



        </div>
    </v-container>
</template>


<script>
import InlineSvg from "vue-inline-svg"
import ubTable from "@/components/custom/ubTable.vue"

export default {
    name: 'WorkflowModels',
    components: {
        InlineSvg,
        ubTable,
    },
    data() {
        return {
            activeName: 'first',
            search: '',
            needs_tooltip: false,

            table_data: [],
            rows_selected: [], // selected items from table
            disabled: false,

            current_space: null,
            spaces: [],

            fileTypeList: ['ifc', 'rvt', 'zip', 'ifcxml', 'consolidations', 'pdf', 'dwg', 'dxf'],
          }
    },
    watch: {
        'current_space'(newval,oldval) {
            if (!newval) {
                return null
            }
            this.table_data = newval.models.files
            // console.log('allfiles', this.table_data)

            const rows = newval.models.files_chd
            this.rows_selected = rows && rows.length ? rows : []

        },
        'project'() {
            this.getSpaces()
        },
    },
    methods: {
        /////////////////// функции для отображения данных в таблице
        getUser(id) {
            // console.log('id', id)
            if (!this.managers) {
                return ''
            }
            if (!id) {
                return '--'
            }
            let manager = this.managers.find(obj => obj.id == id)
            return manager ? manager : { name: 'Неизвестный пользователь' }
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
        getDate(d) {
            if (!d) {
                return '--'
            }
            let options = {year: 'numeric', month: 'short', day: '2-digit'}
            return (new Date(d)).toLocaleDateString("ru-RU", options)
        },

        /////////////////// обработка операций с данными таблицы ///////////////////
        manageSelectedChange(selected) {
            let list = selected.map( (x) => {
                const index = x.slice(3)
                return this.table_data[index].url // Дима сказал, что должен стоять именно url
            })
            // console.log('new_list', list)
            this.changeCheckedFiles(list)
        },
        changeCheckedFiles(list) {
            // выбрать нужный space // this.currentSpace()
            // переписать space.models.files_chd
            // сделать запрос на сервис

            if (!list.length) {
                this.rows_selected.splice(0)
            }
            if (!this.current_space) {
                return null
            }

            let newBody = JSON.parse(JSON.stringify(this.current_space))
            newBody.models.files_chd = list
            this.$store.dispatch('workflow/changeSpace', {
                project_uuid: this.project.id,
                body: newBody,
            })
            .then( res => {
                this.getSpaces()
            })
            .catch( () => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    message: 'Не удалось изменить пространство.',
                    text: 'Не удалось изменить пространство.',
                })
            })
        },
        /////////////////// загрузка данных с сервисов ///////////////////
        getSpaces() {
            if (!this.project) {
                return []
            }
            this.$store.dispatch('workflow/getSpaces', this.project.id)
            .then( res => {
                // console.log('res,', res)
                let list = res.filter(obj => obj.mod_view == true)
                this.spaces = list
                // console.log('got spaces', res)
                if (this.current_space == null || this.current_space == undefined) {
                    this.current_space = this.spaces[0]
                }
                else (
                    this.current_space.models.files_chd = this.spaces.find(obj => obj.id == this.current_space.id).models.files_chd
                    // обновляются данные для активации / деактивации кнопки "Открыть".
                )

                if (!this.current_space) {
                    return null
                }
                let rows = this.current_space.models.files_chd

                this.rows_selected = rows ? rows : []
            })
            .catch( res => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    message: 'Не удалось получить данные о пространствах.',
                    text: 'Не удалось получить данные о пространствах.',
                })
            })
        },
        /////////////////// функции для открытия диалогов / просмотрщика
        async openInViewer() {

            if (!this.rows_selected.length) {
                return null
            }

            console.log('allfiles', this.table_data)

            let files_to_open = []
            let docs_to_open = []

            for (const file of this.rows_selected) {
                let i = this.table_data.find(obj => obj.url == file)
                let type = i.title.split('.')
                type = type.length ? type[type.length - 1] : null
                if (!this.fileTypeList.some(s => s == type)) {
                    return null
                }
                files_to_open.push(i.id) // Ш: возможно, i.id, но Дима утверждал, что все-таки url (i.url)
                docs_to_open.push(i.url)
            }

            if (!files_to_open.length) {
                return null
            }

            let delta = 0
            if (this.rows_selected.length == 1){
                let i = this.table_data.find(obj => obj.url == this.rows_selected[0])
                if (i.ver && i.ver != 1) {
                    let res = await this.$store.dispatch('workflow/getFileInfo', i.id)
                    delta = res && res.tags && res.tags['delta.json'] ? res.tags['delta.json'] : 0
                }
            }

            // console.log('tell me delta', delta)
            this.$router.push({
                name: 'workflow-view',
                params: {
                    id: this.$route.params.id,
                    type: 'view-obj'
                },
                query: {
                    file: files_to_open,
                    delta: delta,
                    doc: docs_to_open
                }
            })
        },
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'workflow-models-table'

            let table_data = localStorage.getItem('ub-tables-data')
            if (table_data == null || table_data == undefined || table_data == 'null' || table_data == 'undefined' ) {
                table_data = Object.assign({},{})
            }
            else {
                table_data = JSON.parse(table_data)
            }
            table_data[item] = columns
            localStorage.setItem('ub-tables-data', JSON.stringify(table_data))
        },
        loadColumnWidth() {
            const item = 'workflow-models-table'
            let table_data = localStorage.getItem('ub-tables-data')
            if (table_data == null || table_data == undefined || table_data == 'null' || table_data == 'undefined' ) {
                table_data = Object.assign({},{})
            }
            else {
                table_data = JSON.parse(table_data)
            }
            let cols = table_data[item]
            return cols || []
        },
    },
    computed: {
        managers(){
            let users = this.$store.state.administration.company.users || []

            let list = users.map(u => ({
                value: u.id,
                id: u.id,
                email: u.email,
                avatar: u.avatarSrc,
                name: u.first_name + ' ' + u.last_name,
                role: u.profession,
                status: u.status,
                birthday: u.birth_day,
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
    },
    mounted() {
        // console.log('project', this.project)
        // console.log('managers', this.managers)
        this.getSpaces()
        console.log('allfiles', this.table_data)
    },
}

</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: 0;
}

.models-secondary-wrap {
    height: 100%;
    width: 100%;
}

.tabs-blank {
    --blank-height: 40px;
    min-height: var(--blank-height);
    max-height: var(--blank-height);
    margin: 0px 16px;
    border-bottom: 2px solid #e4e7ed;
}

.models-main-body {
    display: flex;
    flex-direction: column;
    padding: 0;
    height: 100%;
    // border: 3px solid blue;
}

.table-header {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    padding: 16px;

    & div {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
    }

}

.open-viewer-btn {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 0px 20px 0px 10px;
    & div {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    & span {
        display: block;
        align-items: center;
    }
}

.table-wrapper {
    height: calc(100% - 164px); // ?
    padding: 0px 16px;
}

.avatar {
    max-height: 24px;
    max-width: 24px;
    margin-right: 8px;
}

.models-space-select {
    margin-right: 8px;
}

</style>
