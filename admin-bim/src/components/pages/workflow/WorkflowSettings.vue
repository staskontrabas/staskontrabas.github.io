<template>
<div pt-0 fluid fill-height text-xs-center class="page-container marker">

    <div class="project-wrapper">
      <span class="project-title">
        Параметры
      </span>
    </div>

    <!-- tabs / вкладки  -->
    <div class="ws-tabs-wrapper">
        <el-tabs v-model="activeName">

            <!-- Панель настроек проекта -->
            <el-tab-pane label="Проект" name="first"> 
            
            <div class="button-wrapper">
                <el-button v-show="!editing" type="main" @click.stop="toggleEditing"> Редактировать </el-button>
                <el-button v-show="editing" type="default" @click.stop="toggleEditing"> Отмена </el-button>
                <el-button v-show="editing" type="main" :disabled="!hasunsavedchanges" @click.stop="saveChanges"> Сохранить </el-button>
            </div>

            <v-divider class="mx-4"/>

            <div class="scrollzone">

            <div class="d-flex flex-column">
                <div class="wfsettings">
                <div class="wfsettings-info">
                    <span class="wfsettings-header">
                    Общие настройки
                    </span>
                    <span class="wfsettings-note">
                    Настройки, видимые всем участникам проекта
                    </span>
                </div>

                <div class="wfsettings-settings overflow-y-auto">
                    <el-form 
                    ref="form-project"
                    :model="project_form_data"
                    label-position="top"
                    :rules="validationRules"
                    >
                    <el-form-item label="Название проекта" prop="name">
                        <el-input v-if="editing" v-model="project_form_data.name"></el-input>
                        <div class="project-form-item" v-else > <span> {{ project_form_data.name }} </span> </div>
                    </el-form-item>

                    <el-form-item label="Заказчик" prop="client">
                        <el-input v-if="editing" v-model="project_form_data.client" prop="client"></el-input>
                        <div class="project-form-item" v-else > {{ project_form_data.client }} </div>
                    </el-form-item>

                    <el-form-item label="Ответственный за проект" prop="manager">
                        <el-select fit-input-width v-if="editing" v-model="project_form_data.manager" placeholder="Выберите ответственного за проект">
                        <el-option
                            v-for="item in managers"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                            <span style="float: left"> {{ item.name }} </span>
                        </el-option>
                        </el-select>
                        
                        <div class="project-form-item" v-else> 
                            <div v-if="getManager(project_form_data.manager)">
                                <v-img class="avatar" :src="getManager(project_form_data.manager).avatar"/>
                            </div>
                            <span v-if="getManager(project_form_data.manager)">
                                {{ getManager(project_form_data.manager).name }}
                            </span>
                            <span v-else>
                                Ошибка: менеджер не найден.
                            </span>
                        </div>
                    </el-form-item>

                    <el-form-item label="Номер проекта">
                        <el-input v-if="editing" v-model="project_form_data.number"></el-input>
                        <div class="project-form-item" v-else > <span> {{ project_form_data.number }} </span> </div>
                    </el-form-item>

                    <el-form-item label="Описание">
                        <el-input
                            v-if="editing"
                            type="textarea"
                            :autosize="{ minRows: 2, maxRows: 4}"
                            placeholder="Описание"
                            v-model="project_form_data.description">
                        </el-input>
                        <div class="project-form-item" v-else > {{ project_form_data.description }} </div>
                    </el-form-item>

                    </el-form>
                </div>
                </div>

                <v-divider v-if="addition.length || editing" class="mx-4"/>

                <div v-if="addition.length || editing" class="wfsettings">
                <div class="wfsettings-info">
                    <span class="wfsettings-header">
                    Дополнительные настройки
                    </span>
                    <span class="wfsettings-note">
                    Видимы только администраторам аккаунтов и проектов 
                    </span>
                </div>

                <div class="wfsettings-settings overflow-y-auto">
                    <el-form label-position="top">
                    <!-- additions -->
                    <el-form-item  v-for="(i, j) in addition"
                                    :key="j"
                                    :label="i.name"
                    >
                        <div class="d-flex flex-row add-input">
                        <el-input
                            v-if="i.type == 'string' && editing"
                            placeholder=" "
                            :label="i.name"
                            v-model="i.value">
                        </el-input>
                        <el-input
                            v-if="i.type == 'number' && editing"
                            placeholder=" "
                            :label="i.name"
                            v-model="i.value">
                        </el-input>
                        <el-select
                            fit-input-width
                            v-if="i.type == 'list' && editing"
                            v-model="i.params.value"
                        >
                            <el-option
                                v-for="item in i.params.list"
                                :key="item.id"
                                :label="item.name"
                                :value="item.value">
                            <span style="float: left"> {{ item.name }} </span>
                            </el-option>
                        </el-select>
                        <div v-if="(i.type == 'string' || i.type == 'number') && !editing" class="project-form-item"> 
                            {{ addition[j].value }} 
                        </div>
                        <div v-if="i.type == 'list' && !editing">
                            {{ addition[j].params.list.find(obj => obj.value === addition[j].params.value).name }}
                        </div>
                        <v-icon class="edit" v-if="editing" @click="editCustom(i.id)">
                            mdi-pencil
                        </v-icon>
                        </div>
                    </el-form-item>
                    <el-button v-if="editing" type="default" @click="editCustom(null)">
                        Добавить параметр
                    </el-button>
                    </el-form>
                </div>
                </div>
            </div>
            </div>
            </el-tab-pane>


            <!-- Панель настроек согласований -->
            <el-tab-pane 
                v-if="tab_type == 'consolidation'"
                label="Пространства консолидаций" name="second">
                <div v-if="activeName == 'second'" class="settings-main-wrap">
                    <coordination-spaces
                    :project="project">  
                    </coordination-spaces>
                </div>
            </el-tab-pane>

        </el-tabs>
    </div>

    <!-- add custom elements dialog -->
    <v-dialog v-model="show_custom_dialog" scrollable max-width="700px" @input="v => v || cancel()">
    <v-card>
    <v-card-title class="m-modal--title"> Добавление параметров проекта
        <v-spacer></v-spacer>
        <el-button
            text
            icon
            @click="show_custom_dialog = false"
            color="#7f7f7f">
            <v-icon size="20"> close </v-icon>
        </el-button>
    </v-card-title>
    <v-divider></v-divider>
    <el-form 
        ref="form-addition"
        :model="addition_form_data"
        :rules="additionValidationRules" 
        label-position="top" 
        class="custom-container">

        <el-form-item label="Название параметра" prop="custom_name">
        <el-input v-model="addition_form_data.custom_name"></el-input>
        </el-form-item>

        <el-form-item label="Тип" prop="custom_type">
        <el-select fit-input-width v-model="addition_form_data.custom_type" placeholder="Тип">
            <el-option
                v-for="item in types"
                :key="item.id"
                :label="item.name"
                :value="item.value">
            <span style="float: left"> {{ item.name }} </span>
            </el-option>
        </el-select>
        </el-form-item>

        <el-form-item label="Список значений" prop="custom_list" :key="keyforlist"
        v-if="addition_form_data.custom_type && addition_form_data.custom_type == 'list'">
        <el-select
            v-model="addition_form_data.custom_list"
            multiple
            filterable
            allow-create
            fit-input-width
            default-first-option
            placeholder="Введите элемент списка">
            <template #empty>
            Введите название элемента списка и нажмите 'Enter'.
            </template>
        </el-select>
        </el-form-item>

        <el-form-item label="Значение" prop="custom_value" :key="keyforvalue"
        v-if="addition_form_data.custom_type && (addition_form_data.custom_type == 'string' || addition_form_data.custom_type == 'number')">
        <el-input v-model="addition_form_data.custom_value"></el-input>
        </el-form-item>
    </el-form>

    <v-divider></v-divider>

    <v-card-actions class="pa-5 px-4">
        <div class="buttons-wrapper">
        <el-button
            v-if="custom_id"
            type="default"
            @click="deleteCustom"> Удалить </el-button>
        <el-button
            v-if="!custom_id"
            :disabled="!validateAddition()"
            type="default"
            @click="saveCustom"> Добавить </el-button>
        <el-button
            v-if="custom_id"
            :disabled="!validateAddition()"
            type="default"
            @click="saveCustom"> Изменить </el-button>
        <el-button 
            type="default"
            @click="closeCustom"> Отмена </el-button>
        </div>
    </v-card-actions>
    </v-card>
    </v-dialog>

</div>
</template>


<script>
import CoordinationSpaces from './workflow_settings/CoordinationSpaces.vue'

export default {
  name: 'WorkflowSettings',
  components: {
    CoordinationSpaces,
  },
  data() {
        return {
            activeName: 'first',
            tab_type: '',
            editing: false,
            hasunsavedchanges: false,

            project_form_data: {
              name: 'test name',
              client: 'test client',
              manager: 'test manager',
              number: 'test number',
              description: 'test desc',
            },
            name: 'Тест имя',
            client: 'Тест клиент',
            manager: 'Тест манагер',
            number: 'Тест номер',
            description: 'Тест описание ',
            addition: [],
            
            show_custom_dialog: false,
            custom_id : '',
            addition_form_data: {
              custom_name: '',
              custom_type: '',
              custom_value: '',
              custom_list: [],
              custom_listvalue: '',
            },
            keyforvalue: 'keycustomvalue',
            keyforlist: 'keycutomlist',

            
            custom_name: '',
            custom_type: '',
            custom_value: '',
            custom_list: [],
            custom_listvalue: '',
            

            types: [{
                    value: 'string',
                    name: 'Текст'
                },{
                    value: 'number',
                    name: 'Число'
                },{
                    value: 'list',
                    name: 'Список'
                }],
        }
  },
  methods: {
    toggleEditing() {
      if (this.editing) {
        // обновление информации при отключении редактирования без сохранения изменений
        this.setProjectInfo(this.project)
      }
      this.editing = !this.editing
      this.hasunsavedchanges = false // нужно для обновления watcher
    },
    saveChanges() {
      
      if (!this.validateProject()) {
        console.log('validation failed, saving aborted')
        return null
      }

      // сохраняет изменения в проект через dispatch('workflow/updateProject')
      let source = this.project_form_data
      let body = {
                name: source.name,
                description: source.description,
                number: source.number,
                client: source.client,
                in_charge_id: source.manager ? source.manager + '' : source.manager,
                // addition обрабатывается отдельно из-за отличий в данных
                addition: this.addition.map(a => ({
                    name: a.name,
                    value: a.type == 'string'
                        ? a.value
                        : a.type == 'number'
                            ? parseInt(a.value)
                            : {
                                value: a.params.list.find(f => f.value == a.params.value).name,
                                list: a.params.list.map(p => p.name)
                            }
                })) || null
            }
            console.log('body addition', body.addition)
            let type_id = 'c'
            let id = this.$store.state.administration.company.id
            if(this.project){
                let uuid = this.project.id
                this.$store.dispatch('workflow/updateProject', {type_id, id, uuid, body})
                .then(res => {
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        title: 'Успешно!',
                        message: 'Проект ' + body.name + ' изменен.',
                        text: 'Проект ' + body.name + ' изменен.',
                    })
                })
            this.toggleEditing()
            }
    },
    validateProject() {
      let verdict = false
      this.$refs['form-project'].validate((valid) =>
        {
          verdict = valid
          console.log('form validation triggered', valid)
        }
      )
      return verdict
    },
    validateAddition() {
        if (!this.$refs['form-addition']) {
            return false
        }
        let verdict = false
        this.$refs['form-addition'].validate((valid) =>
            {
            verdict = valid
            console.log('addition validation triggered', valid)
            }
        )
        return verdict
    },
    setProjectInfo(project) {
      if (!project) {
        return null
      }
      let pi = project.info
      let target = this.project_form_data
      target.name = pi.name
      target.client = pi.client
      target.manager = pi.in_charge_id
      target.description = pi.description
      target.number = pi.number
      this.addition = getAddition(pi.addition) // addition обрабатывается отдельно из-за своих отличий от других полей

      function getAddition(addition){
            if (!addition) {
              return []
            }
            let list = []
            addition.map((a, ind) => {
                if(typeof a.value === 'object' && a.value.list){
                    list.push({
                        id: 'f-' + ind,
                        name: a.name,
                        type: 'list',
                        params: {
                            value: a.value.list.indexOf(a.value.value).toString(),
                            list: a.value.list.map((l, i) => ({name: l, value: '' + i}))
                        }
                    })
                }
                else{
                    list.push({
                        id: 'f-' + ind,
                        name: a.name,
                        type: typeof a.value == 'number'
                            ? 'number'
                            : 'string',
                        value: a.value
                    })
                }
            })
            return list
        }
    },
    editCustom(v) {
      // v -- передает элемент из this.addition; его значение - id параметра
      let target = this.addition_form_data
      if (!v) {
        // параметр v == null - пустой addition
        target.custon_name = ''
        target.custom_type = ''
        target.custom_value = ''
        target.custom_list = []
        target.custom_listvalue = ''
        this.custom_id = ''
      }
      else {
        // параметр v == id - id одного из полей addition 
        let item = this.addition.find(obj => obj.id == v)
        target.custom_name = item.name
        target.custom_type = item.type
        this.custom_id = v
        // создаем лист значений для отображения в el-select (в el-select нужно подавать массив строк, а не массив объектов)
        target.custom_type == 'list'
        ? (
          target.custom_listvalue = item.params.value,
          target.custom_list = createList(item.params.list)
        ) 
        : (target.custom_value = item.value)
      }

      function createList(source) {
        let list = []
        for (let elem of source) {
          list.push(elem.name)
        }
        return list
      }

      this.show_custom_dialog = true // включает диалог
    },
    saveCustom() {
      // сохраняет кастомное поле в addition или добавляет новое
        if (!this.validateAddition()) {
            console.log('addition form is invalid, aborting saving changes')
            return null
        }
      
        let source = this.addition
        const alreadyexists = (this.custom_id) 

        let replacement = {}
        let replacementsource = this.addition_form_data
        replacement.name = replacementsource.custom_name
        replacement.type = replacementsource.custom_type
        if (replacementsource.custom_type == 'list') {
            // собрать из листа 
            replacement.params = {
                          list: replacementsource.custom_list.map((l, i) => ({name: l, value: '' + i})),
            }
            replacement.params.value = replacement.params.list.indexOf(replacementsource.custom_listvalue) > 0
                                    ? replacement.params.list.indexOf(replacementsource.custom_listvalue).toString()
                                    : '0'
        }
        else {
          replacement.value = replacementsource.custom_value
        }

        if (alreadyexists) {
            // ищем элемент по id и замещаем его поля в зависимости от типа
            replacement.id = this.custom_id
            source.splice(source.indexOf(source.find(obj => obj.id === this.custom_id)), 1, replacement)
        }
        else {
            replacement.id = 'f-' + source.length
            source.push(replacement)
        }

         this.show_custom_dialog = false
    },
    deleteCustom() {
      // удаляет существующее поле из addition
      let source = this.addition
      source.splice(source.indexOf(source.find(obj => obj.id === this.custom_id)), 1)
      this.show_custom_dialog = false
    },
    closeCustom() {
      // Закрывает диалог по редактированию кастомного поля в addition
      // .resetFields()
      this.$refs['form-addition'].resetFields()
      this.show_custom_dialog = false
    },
    getManager(arg) {
        const source = this.managers
        const manager = source.filter( obj => obj.id == arg ).length ? source.find( obj => obj.id == arg ) : null
        return manager
    },
    getTabType(type) {
        this.$root.$emit('get_current_nav_tab')
    },
    setTabType(type) {
        if (!type) {
            this.tab_type = ''
        }
        this.tab_type = type.name
        // console.log('tab type', type.name)
    },
  },
  computed: {
    managers() {
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
    avatar() {
        return this.$store.state.administration.userAvatar
    },
    project() {
      if (!this.$route || !this.$route.params) {
        return null
      }
      let workflow = this.$store.state.workflow
      let project = workflow.projects.filter(i => i.id == this.$route.params.id)
      return project[0] || null
    },
    unsavedChangesWatcher() {
      let target = this.project_form_data
      return `${target.name}|${target.client}|${target.manager}|${target.number}|${target.description}`
    },
    changesInAddition() {
      return this.addition
    },
    updatedProjects() {
      return this.$store.state.workflow.projects
    },
    validationRules() {
      return {
              name: [{ required: this.editing ? true : false, message: 'Название проекта не может быть пустым', trigger: 'blur', }],
              manager: [{ required: this.editing ? true : false, message: 'Необходимо назначить ответственного', trigger: 'blur', }],
              client: [{ required: this.editing ? false : false, message: 'Необходимое поле', trigger: 'blur', }],
              number: [{ required: this.editing ? false : false, message: 'Необходимое поле', trigger: 'blur', }],
              description: [{ required: this.editing ? false : false, message: 'Необходимое поле', trigger: 'blur', }],
            }
    },
    additionValidationRules() {
      return {
        custom_name: [{ required: true, message: 'Название параметра не может быть пустым', trigger: 'blur', }],
        custom_type: [{ required: true, message: 'Необходимо выбрать тип', trigger: 'blur', }],
        custom_value: [{ required: true, message: 'Введите значение параметра', trigger: 'blur', }],
        custom_list: [{ required: true, message: 'Добавьте допустимые значения элементов', trigger: 'blur', }],
      }
    }
  },
  watch: {
    changesInAddition: {
      handler() {
        this.hasunsavedchanges = true // включает наличие изменений
        return null
      },
    deep: true
    },
    unsavedChangesWatcher: {
      handler() {
        this.hasunsavedchanges = true // включает наличие изменений
        return null
      }
    },
    updatedProjects: {
      handler(newVal) {
        let project = newVal.find(obj => obj.id === this.$route.params.id)
        if (!project) {
          return null
        }
        this.setProjectInfo(project)
      }
    }
  },
  mounted() {
    this.$root.$on('exposing_current_nav_tab', this.setTabType)
    this.getTabType()
    this.setProjectInfo(this.project)
  },
  destroy() {
    this.$root.$off('exposing_current_nav_tab')
  },
}
</script>

<style lang="scss" scoped>

.page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
}

.ws-tabs-wrapper {
    height: 100%;
}

.scrollzone {
    overflow-y: auto;
    height: 100%;
}

// control buttons

.button-wrapper {
    padding: 16px 16px;
}

// project information wrappers

.wfsettings {
    margin: 16px 16px;
    display: flex;
}

.wfsettings-info {
    margin: 0;
    padding: 0;
    min-width: 150px;
    width: 300px;
    display: flex;
    flex-direction: column;
}

.wfsettings-settings {
    margin: 0;
    padding: 0 20px;
    flex-grow: 1;
    height: 450px;
}

// v-dialog for custom elements
.custom-container {
    display: flex;
    padding: 20px;
    flex-direction: column;
 }

 .edit {
    display: flex;
    margin-left: 12px;
    width: 40px;
}

// элементы

.wfsettings-note {
    font-size: 12px;
    line-height: 18px;
    color: rgb(128, 128, 128);
    font-weight: 500;
}

.wfsettings-header {
    font-family: "Artifakt Element", sans-serif;
    font-size: 16px;
    line-height: 26px;
}

.project-form-item {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 8px;
    color: rgb(60, 60, 60);
}

.avatar {
    display: flex;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    margin-right: 0px;
}


/////////////////// Области согласования (versions) ///////////////////
.settings-main-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100%); // ?? какого черта 49? Что с наследованием у этих элементов?
    padding: 0px 16px;
}


</style>
