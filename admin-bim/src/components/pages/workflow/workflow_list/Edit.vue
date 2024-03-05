<template>
    <v-card>
        <v-card-title class="m-modal--title">
            {{project ? 'Информация о проекте' : 'Создание нового проекта'}}
            <v-spacer></v-spacer>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-5 px-4" ref="body">
          <el-form 
          ref="form"
          :model="form_data" 
          :rules="validationRules"
          label-position="top">
            <el-form-item label="Название проекта" prop="name">
              <el-input v-model="form_data.name"></el-input>
            </el-form-item>
            <el-form-item label="Заказчик" prop="client">
              <el-input v-model="form_data.client"></el-input>
            </el-form-item>
            <el-form-item label="Ответственный за проект" prop="manager">
              <el-select v-model="form_data.manager" placeholder="Выберите ответственного за проект">
                <el-option
                    v-for="item in managers"
                    :key="item.id"
                    :label="item.name != ' ' ? item.name : item.id "
                    :value="item.id">
                  <span style="float: left"> {{ item.name != ' ' ? item.name : item.id }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Номер проекта" prop="number">
              <el-input v-model="form_data.number"></el-input>
            </el-form-item>
            <el-form-item label="Описание" prop="description">
              <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  placeholder="Описание"
                  v-model="form_data.description">
              </el-input>
            </el-form-item>
            <el-form-item  v-for="(i, j) in addition"
                           :key="j"
                           :label="i.name"
            >
                <div class="add-input">
                    <div>
                        <el-input
                            v-if="i.type == 'string'"
                            placeholder=" "
                            :label="i.name"
                            v-model="i.value">
                        </el-input>
                        <el-input
                            v-if="i.type == 'number'"
                            placeholder=" "
                            :label="i.name"
                            v-model="i.value">
                        </el-input>
                        <el-select
                            v-if="i.type == 'list'"
                            v-model="i.params.value"
                        >
                        <el-option
                            v-for="item in i.params.list"
                            :key="item.id"
                            :label="item.name"
                            :value="item.value">
                            <span style="float: left">{{ item.name }}</span>
                        </el-option>
                        </el-select>
                    </div>

                    <v-icon @click="editCustom(i.id)" class="edit"></v-icon>
                </div>
            </el-form-item>
          </el-form>

        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4 buttons-wrapper">
            <el-button class="btn-custom" @click.stop="editCustom(null)"> Добавить параметр </el-button>
            <el-button class="btn-custom-primary" @click="saveChange">
                {{project ? 'Сохранить' : 'Создать'}}
            </el-button>
        </v-card-actions>
    </v-card>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
    name: 'Edit',
    props: ['component', 'addition', 'additionID', 'project', 'open', 'storeage'],
    data () {
        return {
            check: [v => !!v || 'Необходимое поле'],
            disabledSave: true,
            selectCountry: null,
            selectRegion: null,
            selectCity: null,
            menu: false,
            form_data: {
              name: '',
              client: '',
              manager: null,
              number: '',
              description: '',
            },
        }
    },
    computed: {
        managers(){
            let users = this.$store.state.administration.company.users || []
            let list = users.map(u => ({
                id: u.id,
                avatar: u.avatarSrc,
                name: u.first_name + ' ' + u.last_name,
                role: ''
            }))
            return list
        },
        validationRules() {
            return {
                name: [{ required: true, message: 'Название проекта не может быть пустым', trigger: 'blur', }],
                manager: [{ required: true, message: 'Необходимо назначить ответственного', trigger: 'change', }],
                client: [{ required: false, message: 'Необходимое поле', trigger: 'blur', }],
                number: [{ required: false, message: 'Необходимое поле', trigger: 'blur', }],
                description: [{ required: false, message: 'Необходимое поле', trigger: 'blur', }],
            }
        },
    },
    watch: {
        open(v){
            this.$refs['body'].scrollTop = 0
            if(v){
                document.addEventListener('keyup', this.enter, false)
            }
            else{
                document.removeEventListener('keyup', this.enter, false)
            }
        },
    },
    methods: {
        cancel(){
            let target = this.form_data
            this.disabledSave = true
            target.name = ''
            target.client = ''
            target.manager = null
            target.description = ''
            target.number = ''
            this.$emit('cancel')
        },
        removeChips(){
            this.form_data.manager = null
        },
        saveChange(){
            if (!this.validateProjectForm()) {
                return false
            }

            let source = this.form_data
            let body = {
                name: source.name,
                description: source.description,
                number: source.number,
                client: source.client,
                in_charge_id: source.manager ? source.manager + '' : source.manager,
                template_id: this.template_id,
                addition: this.addition.map(a => ({
                    name: a.name,
                    // value: JSON.stringify(a)
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
            let type_id = 'c'
            let id = this.$store.state.administration.company.id
            if(this.project){
                let uuid = this.project.id
                this.$store.dispatch('workflow/updateProject', {type_id, id, uuid, body})
                .then(() => {
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Проект ' + body.name + ' изменен.',
                        message: 'Проект ' + body.name + ' изменен.',
                    })
                })
            }
            else{
                let uuid = uuidv4()
                this.$store.dispatch('workflow/addProject', {type_id, id, uuid, body})
                .then(() => {
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Создан проект ' + body.name,
                        message: 'Создан проект ' + body.name,
                    })
                })
            }
            this.cancel()
        },
        validateProjectForm(){
            if (this.$refs['form'] == undefined) {
                return false
            }
            let verdict = false
            this.$refs['form'].validate((valid) =>
                {
                    verdict = valid
                    console.log('addition validation triggered', valid)
                }
            )       
            return verdict      
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
            }
        },
        editCustom(id){
            let keys = Object.keys(this.$data).filter(k => k != 'check')
            let storeage = {}
            keys.map(k => {
                storeage[k] = this[k]
            })
            this.$emit('update:storeage', storeage)
            this.$emit('update:component','custom')
            this.$emit('update:additionID', id)
        }
    },
    created(){
        if(this.storeage){
            let keys = Object.keys(this.storeage)
            keys.map(k => {
                this[k] = this.storeage[k]
            })
        }
        else if(this.project){
            let target = this.form_data
            let params = JSON.parse(JSON.stringify(this.project))
            target.name = params.info.name
            target.client = params.info.client
            target.number = params.info.number
            target.description = params.info.description
            target.manager = params.info.in_charge_id
        }
    },
    mounted() {
        console.log('adm users', this.$store.state.administration.company.users)
    },
}
</script>


<style lang="scss" scoped>

.add-input {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    & > div {
        display: flex;
        max-width: calc(100% - 40px);
        width: calc(100% - 40px);
        margin-right: 8px;
    }
}

</style>