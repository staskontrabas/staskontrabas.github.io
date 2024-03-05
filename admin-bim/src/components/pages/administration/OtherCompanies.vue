<template>
    <div pt-0 class="page-container">
        <div class="secondary-wrap">

            <!-- заголовок -->
            <div class="project-wrapper">
                <span class="project-title">
                    Компании в рамках учетной записи
                </span>
            </div>

            <!-- замещение вкладки для совпадения по высоте -->
            <div class="tabs-blank"></div>

            <!-- обертка -->
            <div class="main-body">

                <div class="body-wrap">

                    <!-- поиск, кнопки -->
                    <div class="table-header">

                        <!-- левые -->
                        <div class="left">

                            <!-- кнопка добавить компанию -->
                            <el-button 
                                type="main" 
                                class="problem-create-btn" 
                                @click="handleCreate">
                                <div>
                                    <i class="el-icon-plus"></i> 
                                    <span> 
                                        Добавить компанию
                                    </span>
                                </div>
                            </el-button>
                        </div>

                        <!-- правые -->
                        <div class="right">

                            <!--  ввод поиска -->
                            <div class="input-wrapper">
                                <v-text-field
                                    v-model="search"
                                    prepend-icon="search"
                                    placeholder="Поиск по имени"
                                    single-line
                                    hide-details
                                    class="m-table-toolbar--search ml-2"
                                ></v-text-field>
                            </div>
                        </div>
                    </div>

                    <!-- обертка таблицы -->
                    <div class="table-wrapper">

                        <div class="cs-loading vm-progress" v-if="loading">
                            <inline-svg class="inline-svg" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
                        </div>
                        
                        <!-- сама таблица с френдлистом компаний -->
                        <ub-table 
                            ref="administration-companies-table"
                            v-if="other_companies && other_companies.length"
                            :data="filtered_companies"
                            :headers="[
                                {name: 'name', title: 'имя', width: '340', icon: null, click: null, }, 
                                {name: 'official_name', title: 'имя ответственного лица', width: '340', icon: null, click: null, }, 
                                {name: 'menu', title: '', width: '48', icon: null, click: null,}
                            ]"
                            :savedcolumnwidth="loadColumnWidth()"
                            @save_columns_width="saveColumnsWidth">
                        
                            <!-- name / имя -->
                            <template v-slot:column1="{ item }">
                                    <el-tooltip 
                                        effect="dark" 
                                        :disabled="!needs_tooltip"
                                        placement="right">
                                            <template #content>
                                                {{ item.name }}
                                            </template>
                                            <span class="truncate-text" 
                                                @click="summonDrawer(item)"
                                                style="cursor: pointer;"
                                                @mouseover="checkIfNeedsTooltip">
                                                {{ item.name }}
                                            </span>
                                    </el-tooltip>   
                            </template>

                            <!-- official_name / ответственное лицо -->
                            <template v-slot:column2="{ item }">
                                    <el-tooltip 
                                        effect="dark" 
                                        :disabled="!needs_tooltip"
                                        placement="right">
                                            <template #content>
                                                {{ item.official_name ? item.official_name : '--' }}
                                            </template>
                                            <span class="truncate-text" 
                                                @click="summonDrawer(item)"
                                                style="cursor: pointer;"
                                                @mouseover="checkIfNeedsTooltip">
                                                {{ item.official_name ? getCorrectName(item.official_name) : '--' }}
                                            </span>
                                    </el-tooltip>   
                            </template>

                            <template v-slot:column11="{ item }">
                            <!-- Последняя колонка должна присутствовать для правильного отображения ширины  -->
                                <div v-if="item.id !== current_company.id" class="trash" @click="removeCompanyFromFriends(item)">
                                    <inline-svg :src="require(`@/assets/icons/remove_node.svg`)"></inline-svg>
                                </div>
                            </template>
                        
                        </ub-table>

                        <!-- заглушка при отсутствии добавленных компаний -->
                        <div v-if="!(other_companies && other_companies.length)" class="huston-we-got-no-problem">
                            <inline-svg :src="require(`@/assets/images/problem_empty.svg`)"></inline-svg>
                            <span class="no-problem-h1">
                                Компаний пока не добавлено.
                            </span>
                            <span class="no-problem-h2">
                                Добавьте новые компании из списка зарегистрированных компаний.
                            </span>
                        </div>
                    </div>
                    </div>

            </div>

        </div>


        <!-- Диалог добавления во френдлист -->
        <v-dialog 
            content-class="issue-create-category" 
            v-model="show_create"
            width="600px" 
            max-width="600px" 
            @click:outside="cancel">

            <div class="category-create-header">
                <span> Добавить компании </span>
                <v-btn
                    text
                    icon
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </div>
            
            <div class="category-create-form-wrapper issues--outer-wrap">

                <el-form 
                    class="issue-mainform"
                    ref="form"
                    :model="form_data" 
                    label-position="top">
                
                    <el-form-item label="Зарегистрированные компании" prop="companies">
                        <el-select 
                            v-model="form_data.companies"
                            multiple
                            filterable
                            remote
                            value-key="id" 
                            :remote-method="remoteMethod"
                            :loading="search_loading"
                            placeholder="Выберите компанию или несколько" 
                            popper-class="issue-selector-observers ub-issue-form-popper"
                            @visible-change="setPoppersWidth">

                            <el-option
                                v-for="item in options_filtered_companies"
                                :key="item.id"
                                :label="item.name ? item.name : 'Имя компании не указано'"
                                :value="item">
                                <template>
                                    <div class="issue-selector-observers option">
                                        <div class="problems-form-row-wrap">
                                            <div class="false-checkbox" :class="form_data.companies.includes(item) ? 'false-checkbox-checked' : '' "></div>
                                            <span> {{ item.name ? item.name : 'Имя компании не указано' }} </span>
                                        </div>
                                    </div>
                                </template>
                            </el-option>

                        </el-select>
                    </el-form-item>

                </el-form>

            </div>
            
            <div class="category-create-footer">
                <el-button type="default" @click="cancel"> 
                    <span>
                        Отмена
                    </span>
                </el-button>

                <el-button :disabled="!(form_data && form_data.companies && form_data.companies.length)" type="main" @click="create">
                    <span>
                        Добавить
                    </span>
                </el-button>
            </div>
        </v-dialog>

        <v-dialog 
            content-class="issue-create-category" 
            v-model="show_delete_dialog" 
            width="450px" 
            max-width="450px">

            <div class="category-create-header">
                <span> Удалить компанию из списка? </span>
                <v-btn
                    text
                    icon
                    @click="cancelDelete"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </div>

            <div class="category-create-form-wrapper delete">
                <span>
                    Вы собираетесь удалить компанию из списка дружественных. Продолжить?
                </span>
            </div>

            <div class="category-create-footer">
                <el-button type="default" @click="cancelDelete"> 
                    <span>
                        Отмена
                    </span>
                </el-button>

                <el-button type="red" @click="confirmDelete">
                    <span>
                        Удалить
                    </span>
                </el-button>
            </div>

        </v-dialog>

    </div>
</template>


<script>
import ubTable from "@/components/custom/ubTable.vue"
import InlineSvg from "vue-inline-svg"

export default {
    name: 'OtherCompanies',
    components: {
        ubTable,
        InlineSvg,
    },
    data() {
        return {
            search: '',     // поиск по основной таблице
            loading: true,  // загрузка для страницы
            search_loading: false, // загрузка для селекта

            show_create: false, // диалог добавления во френдлист

            other_companies: [], // список для таблицы

            companies_list: [], // список для опций
            options_filtered_companies: [], // фильтрованный список для опций

            form_data: {
                companies: [],
            },

            needs_tooltip: false,

            current_company: null, // компания пользователя

            show_delete_dialog: false, // диалог удаления из френдлиста
            item_to_delete: null, // кого удалить из френдлиста
          }
    },
    watch: {
    },
    methods: {
        getAllData() {
            let promises = []
            promises.push(this.$store.dispatch('administration/getCompaniesList'))
            promises.push(this.$store.dispatch('administration/getCompanyData'))

            Promise.all(promises)
            .then(res => {
                console.log('got all data res',res)
                const all_companies = res[0]
                const current_company = res[1]

                // общие данные по компаниям
                this.companies_list = all_companies
                // френдлист текущей
                this.current_company = current_company


                let list = current_company.c_friends ? current_company.c_friends : []
                let curr = all_companies.find(obj => obj.id == current_company.id)
                list.splice(0,0,curr)
                this.other_companies = [...list]

                this.loading = false
            })
            .catch(err => {
                console.log('got err when fetching company data', err)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Что-то пошло не так при получении данных компаний. Пожалуйста, проверьте соединение.',
                    message: 'Что-то пошло не так при получении данных компаний. Пожалуйста, проверьте соединение.',
                })
            })
        },
        getCorrectName(name) {
            let str = unEscape(name)
            function unEscape(htmlStr) {
                htmlStr = htmlStr.replace(/&lt;/g , "<");	 
                htmlStr = htmlStr.replace(/&gt;/g , ">");     
                htmlStr = htmlStr.replace(/&quot;/g , "\"");  
                htmlStr = htmlStr.replace(/&#39;/g , "\'");   
                htmlStr = htmlStr.replace(/&amp;/g , "&");
                htmlStr = htmlStr.replace(/&#34;/g , '"');
                return htmlStr;
            }
            return str
        },
        handleCreate() {
            this.show_create = true
        },
        cancel() {
            this.show_create = false
            this.form_data = {
                companies: [],
            }
        },
        create() {
            // console.log('creating new', this.form_data.companies)
            if (!(this.form_data && this.form_data.companies && this.form_data.companies.length)) {
                return null
            }
            if (!this.current_company) {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удается получить данные о текущей компании. Проверьте соединение и попробуйте перезагрузить страницу.',
                    message: 'Не удается получить данные о текущей компании. Проверьте соединение и попробуйте перезагрузить страницу.',
                })
                return null
            }

            let c_company = {...this.current_company}
            let list = c_company.c_friends ? c_company.c_friends : []
            for (const company of this.form_data.companies) {
                if (c_company.id == company.id) {
                    // do not add current company
                    continue
                }
                if (list.find(obj => obj.id == company.id)) {
                    // do not add what already exists
                    continue
                }
                list.push(company)
            }
            c_company.c_friends = list.filter(obj => obj.id !== c_company.id)

            // console.log('adding',c_company.c_friends)

            this.$store.dispatch('administration/updateCompany', c_company)
            .then(res => {
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Компании добавлены в список дружественных.',
                    message: 'Компании добавлены в список дружественных.',
                })
                this.cancel()
                this.getAllData()
            })
            .catch(err => {
                console.log('got err adding companies', err)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Что-то пошло не так при добавлении компаний в список дружественных.',
                    message: 'Что-то пошло не так при добавлении компаний в список дружественных.',
                })
                this.cancel()
                this.getAllData()
            })
        },
        removeCompanyFromFriends(comp) {
            this.show_delete_dialog = true
            this.item_to_delete = comp
        },
        summonDrawer(item) {
            console.log('summoning drawer with ', item)
        },
        confirmDelete() {
            if (!this.current_company) {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удается получить данные о текущей компании. Проверьте соединение и попробуйте перезагрузить страницу.',
                    message: 'Не удается получить данные о текущей компании. Проверьте соединение и попробуйте перезагрузить страницу.',
                })
                return null
            }
            let del = this.item_to_delete

            let c_company = {...this.current_company}
            let list = c_company.c_friends ? c_company.c_friends : []
            list = list.filter(obj => obj.id !== del.id && obj.id !== c_company.id)
            c_company.c_friends = list
            // this.loading = true

            console.log('updated comp', c_company)

            this.$store.dispatch('administration/updateCompany', c_company)
            .then(res => {
                this.getAllData()
                this.cancelDelete()
            })
            .catch(err => {
                console.log('got err adding companies', err)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Что-то пошло не так при удалении компании из списка.',
                    message: 'Что-то пошло не так при удалении компании из списка.',
                })
                this.getAllData()
                this.cancelDelete()
            })
        },
        cancelDelete() {
            this.show_delete_dialog = false
            this.item_to_delete = null
            this.loading = false
        },
        remoteMethod(query) {
            if (query !== '') {
            this.search_loading = true;
            setTimeout(() => {
                this.search_loading = false;
                this.options_filtered_companies = this.companies_list.filter(item => {
                    return item.official_name.toLowerCase().indexOf(query.toLowerCase()) > -1 
                        || item.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
                });
            }, 200);
            } else {
                // пустой список, если в поле поиска ничего не введено
                this.options_filtered_companies = []
            }
        },

        ////// common methods /////
        setPoppersWidth() {
            // для обобщения процедуры должно быть достаточно заменить класс обертки, содержащей el-select (здесь 'issues--inner-wrap')
            const ref = document.getElementsByClassName('issue-mainform')[0]
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
        checkIfNeedsTooltip(arg) {
            let target = arg.target 
            if (target.offsetWidth < target.scrollWidth) {
                this.needs_tooltip = true           
                return true
            }
            this.needs_tooltip = false
            return false
        },
        loadColumnWidth() {
            const item = 'administration-companies-table'
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
        saveColumnsWidth(columns) {
            // должно сохранять параметры колонок для текущей таблицы в локальном хранилище
            const item = 'administration-companies-table'

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
    },
    computed: {
        managers() {
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
        filtered_companies() {
            let companies = this.other_companies
            let srch = this.search.toLowerCase()
            // const current_company_id = this.$store.state.administration.company.id
            companies = companies.filter(obj => obj.name.toLowerCase().includes(srch) || obj.official_name.toLowerCase().includes(srch))
            return companies
        },
    },
    mounted() { 
        this.getAllData()
        // console.log(this.$store.state.administration)
    },
    beforeDestroy() {
    }
}
 
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: unset !important;
}

.secondary-wrap {
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

.main-body {
    display: flex; 
    flex-direction: row; 
    padding: 0; 
    height: calc(100vh - 195px); // 130 + 60
    & .body-wrap {
        width: 100%;
    }
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

.table-wrapper {
    height: calc(100% - 70px); // TODO: исправить
    padding: 0px 16px;
}

.problem-create-btn {
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

.input-wrapper {
    & .v-text-field {
        padding-top: 0px;
    }
}

.huston-we-got-no-problem {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    padding: 60px 12px;
    height: 100%;

    & .no-problem-h1 {
        font-family: "Artifakt Element", sans-serif;
        font-size: 18px;
        line-height: 1.6;
    }
    & .no-problem-h2 {
        font-family: "Artifakt Element", sans-serif;
        font-size: 14px;
        line-height: 1.6;
        text-align: center;
    }
}


::v-deep .issue-create-category {
    --issue-create-header-height: 70px;
    --issue-create-footer-height: 70px;
    --issue-create-form-height: calc(35vh - var(--issue-create-header-height) - var(--issue-create-footer-height));
 }

.category-create-header {
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

.category-create-form-wrapper {
    padding: 12px 16px;
    max-height: var(--issue-create-form-height);
    height: var(--issue-create-form-height);
    overflow-y: auto;
    &.delete {
        display: flex;
        justify-content: center;
        align-items: center;
        & span {
            text-align: center;
        }
    }
}

.category-create-footer {
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

.trash {
    height: 48px;
    width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    &:hover {
        color: darkred;
        background-color: #dcdcdc;
        cursor: pointer;
    }
}

.cs-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

</style>
