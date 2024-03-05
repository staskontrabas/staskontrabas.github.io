<template>
        <v-dialog :value="dialogCustom" scrollable max-width="600px" @input="v => v || cancel()">
            <v-card>
                <v-card-title class="pr-0 pl-4 m-modal--title">Добавление параметров проекта
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
                <v-card-text style="background-color: #fbfbfb; min-height: 120px;" class="pt-5 px-0">
                <v-text-field
                    label="Название параметра"
                    v-model="custom_name"
                    :autocomplete="'off'"
                ></v-text-field>
                <v-select
                    v-show="!editCustomMode"
                    v-model="custom_type"
                    :items="types"
                    item-text="name"
                    item-value="value"
                    persistent-hint
                    label="Тип"
                ></v-select>

                <v-text-field
                    v-if="custom_type && custom_type == 'string'"
                    label="Значение"
                    v-model="custom_value"
                    :autocomplete="'off'"
                ></v-text-field>
                <v-combobox
                    v-if="custom_type && custom_type == 'list'"
                    v-model="model"
                    :filter="filter"
                    :hide-no-data="!search"
                    :items="items"
                    :search-input.sync="search"
                    :autocomplete="'off'"
                    hide-selected
                    label="Список значений"
                    multiple
                    small-chips
                >
                    <template v-slot:no-data>
                        <v-list-item>
                            <span class="subheading">Создайте и нажмите ввод</span>
                            <v-chip
                                :color="`${colors[nonce - 1]} lighten-3`"
                                label
                                small
                            >
                            {{ search }}
                            </v-chip>
                        </v-list-item>
                    </template>
                    <template v-slot:selection="{ attrs, item, parent, selected }">
                        <v-chip
                            v-if="item === Object(item)"
                            v-bind="attrs"
                            :color="`${item.color} lighten-3`"
                            :input-value="selected"
                            label
                            small
                        >
                            <span class="pr-2">
                                {{ item.text }}
                            </span>
                            <v-icon
                                small
                                @click="parent.selectItem(item)"
                            >close</v-icon>
                        </v-chip>
                    </template>
                    <template v-slot:item="{ index, item }">
                        <v-text-field
                            v-if="editing === item"
                            v-model="editing.text"
                            autofocus
                            flat
                            background-color="transparent"
                            hide-details
                            solo
                            @keyup.enter="edit(index, item)"
                        ></v-text-field>
                        <v-chip
                            v-else
                            :color="`${item.color} lighten-3`"
                            dark
                            label
                            small
                        >
                            {{ item.text }}
                        </v-chip>
                        <div class="flex-grow-1"></div>
                        <v-list-item-action @click.stop>
                            <v-btn
                                icon
                                @click.stop.prevent="edit(index, item)"
                            >
                                <v-icon>{{ editing !== item ? 'mdi-pencil' : 'mdi-check' }}</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </template>
                </v-combobox>
            </v-card-text>

            <v-divider></v-divider>
            <v-card-actions class="pa-5 px-0">
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    v-if="editCustomMode"
                    @click="removeCustom">Удалить</v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    v-if="!editCustomMode"
                    outlined
                    color="primary"
                    class="m-btn"
                    :disabled="checkChange()"
                    @click="addCustom">Добавить</v-btn>
                <v-btn
                    v-if="editCustomMode"
                    outlined
                    color="primary"
                    class="m-btn"
                    :disabled="checkEditChange()"
                    @click="addCustom">Изменить</v-btn>
                <v-btn outlined color="#2c2c2c" class="m-btn m-btn-normal" @click="cancel">Отмена</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: ['project', 'dialogCustom', 'paramsCustom', 'editCustomMode'],
        name: 'Edit',
            data () {
                return {
                    custom_name: '',
                    custom_value: '',
                    custom_type: null,

                    types: [{
                        value: 'string',
                        name: 'Текст'
                    },{
                        value: 'list',
                        name: 'Список'
                    }],

                    colors: [],
                    editing: null,
                    index: -1,
                    items: [
                        {header: 'Выберите или создайте новое'},
                    ],
                    nonce: 1,
                    menu: false,
                    model: [],
                    x: 0,
                    search: null,
                    y: 0,
            }
        },
        watch: {
            paramsCustom(val){
                this.custom_name = val.name
                this.custom_type = val.type
                if(val.type == 'string'){
                    this.custom_value = val.value
                }
                else if(val.type == 'list'){
                    for(let i =0, len = val.params.list.length; i < len; i++){
                        this.model.push({text: val.params.list[i].name})
                        this.items.push({text: val.params.list[i].name})
                    }
                }
            },
            model (val, prev) {
                if (val.length === prev.length) return

                this.model = val.map(v => {
                    if (typeof v === 'string') {
                        v = {
                            text: v,
                            color: this.colors[this.nonce - 1],
                        }
                        this.items.push(v)
                        this.nonce++
                    }

                return v
                })
            },
        },
        methods: {
            checkChange(){
                if(this.custom_type == 'string'){
                    return !(this.custom_type && this.custom_name && this.custom_value)
                }
                else if(this.custom_type == 'list'){
                    return !(this.custom_type && this.custom_name && this.model.length)
                }
                else{
                    return true
                }
            },
            checkEditChange(){
                if(this.custom_type == 'string'){
                    return !((this.custom_name != this.paramsCustom.name)
                        || (this.custom_value != this.paramsCustom.value))
                }
                else if(this.custom_type == 'list'){
                    if(this.model.length != this.paramsCustom.params.list.length){
                        return false
                    }
                    else{
                        for(let i = 0, len = this.model.length; i < len; i++){
                            if(this.model[i].text != this.paramsCustom.params.list[i].name){
                                return false
                            }
                        }
                        return true
                    }
                }
                else{
                    return true
                }
            },
            edit (index, item) {
                if (!this.editing) {
                    this.editing = item
                    this.index = index
                }
                else{
                    this.editing = null
                    this.index = -1
                }
            },
            filter(item, queryText, itemText){
                if (item.header) return false

                const hasValue = val => val != null ? val : ''

                const text = hasValue(itemText)
                const query = hasValue(queryText)

                return text.toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1
            },
            removeCustom(){
                for(let i = 0, len = this.project.custom.length; i < len; i++){
                    if(this.project.custom[i].id == this.paramsCustom.id){
                        this.project.custom.splice(i, 1)
                        break
                    }
                }
                this.cancel()
                this.$emit('disabledSave')
            },
            addCustom(){
                let custom = {}

                if(this.custom_type == 'string'){
                    custom.name = this.custom_name
                    custom.value = this.custom_value
                    custom.type = this.custom_type
                }
                else if(this.custom_type == 'list'){
                    custom.name = this.custom_name
                    custom.type = this.custom_type
                    custom.params = {}
                    custom.params.value = '0'
                    custom.params.list = []

                    for( let i = 0, len = this.model.length; i < len; i++){
                        custom.params.list.push({
                            name: this.model[i].text,
                            value: '' + i
                        })
                    }
                }
                if(this.editCustomMode){
                    for(let i = 0, len = this.project.custom.length; i < len; i++){
                        if(this.project.custom[i].id == this.paramsCustom.id){
                            Object.assign(this.project.custom[i], custom)
                            break
                        }
                    }
                }
                else{
                    custom.id = '' + this.project.custom.length
                    this.project.custom.push(custom)
                }
                this.cancel()
                this.$emit('disabledSave')
            },
            cancel(){
                this.custom_name = ''
                this.custom_value = ''
                this.custom_type = null
                this.model = []
                this.items.splice(1)
                this.$emit('update:dialogCustom', false)
                this.$emit('update:paramsCustom', {})
                this.editCustomMode && this.$emit('update:editCustomMode', false)
            },
        }
    }
</script>
