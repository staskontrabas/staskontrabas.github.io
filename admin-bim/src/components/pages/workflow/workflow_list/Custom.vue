<template>
    <v-card>
        <v-card-title class="m-modal--title"> Добавление параметров проекта
            <v-spacer></v-spacer>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20"> close </v-icon>
            </v-btn>
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

        <!-- %%%%%%%%%% -->

        <v-divider></v-divider>

        <v-card-actions class="pa-5 px-4">
            <div class="buttons-wrapper">
            <el-button
                v-if="custom_id"
                type="default"
                @click="removeCustom"> Удалить </el-button>
            <el-button
                v-if="!custom_id"
                :disabled="!validateAddition()"
                type="default"
                @click="addCustom"> Добавить </el-button>
            <el-button
                v-if="custom_id"
                :disabled="!validateAddition()"
                type="default"
                @click="addCustom"> Изменить </el-button>
            <el-button 
                type="default"
                @click="cancel"> Отмена </el-button>
            </div>
        </v-card-actions>
    </v-card>
</template>

<script>
export default {
    props: ['addition', 'additionID'],
    name: 'Custom',
        data () {
            return {
                custom_id : '',

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

                addition_form_data: {
                    custom_name: '',
                    custom_type: '',
                    custom_value: '',
                    custom_list: [],
                    custom_listvalue: '',
                },
                keyforvalue: 'keycustomvalue',
                keyforlist: 'keycutomlist',
        }
    },
    methods: {
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
        removeCustom(){
            let addition = this.addition.filter(a => a.id != this.additionID)
            this.$emit('update:addition', addition)
            this.cancel()
        },
        addCustom(){
            if (!this.validateAddition()) {
            console.log('addition form is invalid, aborting saving changes')
            return null
            }

            let custom = {}
            let source = this.addition_form_data

            custom.name = source.custom_name
            custom.type = source.custom_type

            if(source.custom_type == 'string' || source.custom_type == 'number'){
                custom.value = source.custom_value 
            }
            else if(source.custom_type == 'list') {
                custom.params = {
                    list: source.custom_list.map((l, i) => ({name: l, value: '' + i})),
                }
                custom.params.value = custom.params.list.indexOf(source.custom_listvalue) > 0
                                    ? custom.params.list.indexOf(source.custom_listvalue).toString()
                                    : '0'
            }
            if(this.additionID){
                this.$emit('update:addition', this.addition.map(a => a.id == this.additionID
                                                    ? {...a, ...custom, id: this.additionID}
                                                    : a))
            }
            else{
                custom.id = '' + this.addition.length
                this.$emit('update:addition', [...this.addition, {...custom, id: 'f-' + this.addition.length}])
            }
            this.cancel()
        },
        editMode(){
            this.custom_id = this.additionID
            let val = this.addition.find(a => a.id == this.additionID)
            let target = this.addition_form_data

            target.custom_name = val.name
            target.custom_type = val.type
            if(val.type == 'string' || val.type == 'number'){
                target.custom_value = val.value
            }
            else if(val.type == 'list'){
                target.custom_listvalue = val.params.value
                target.custom_list = createList(val.params.list)
            }

            function createList(source) {
                let list = []
                for (let elem of source) {
                    list.push(elem.name)
                }
                return list
            }
        },
        cancel(){
            this.addition_form_data = {
                custom_name: '',
                custom_type: '',
                custom_value: '',
                custom_list: [],
                custom_listvalue: '',
            },
            this.custom_id = ''
            this.$emit('update:component', 'edit')
        },
    },
    computed: {
        additionValidationRules() {
            return {
                custom_name: [{ required: true, message: 'Название параметра не может быть пустым', trigger: 'blur', }],
                custom_type: [{ required: true, message: 'Необходимо выбрать тип', trigger: 'blur', }],
                custom_value: [{ required: true, message: 'Введите значение параметра', trigger: 'blur', }],
                custom_list: [{ required: true, message: 'Добавьте допустимые значения элементов', trigger: 'blur', }],
            }
        },
    },
    created(){
        console.log('addition', this.addition)
        console.log('add id', this.additionID)
        if(this.additionID){
            this.editMode()
        }
    }
}
</script>



<style lang="scss" scoped>

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

</style>