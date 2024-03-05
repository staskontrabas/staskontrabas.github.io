<template>
    <v-dialog overlay-opacity="0" :value="clueBox" scrollable :max-width="step == 1 ? '' :  '700px'" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-12 pl-4 m-modal--title">
                <span>Подсказка Классификатор Строительной Информации: {{getElem.name}}</span>

                <v-spacer></v-spacer>
                <v-btn
                    text
                    icon
                    class="m-btn--close"
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>

            <v-card-text class="pt-5 px-4 pb-0">
                <v-data-table
                    :headers="headers"
                    :items="getItems"
                    class="m-table--simple"
                    disable-pagination
                    hide-default-footer
                >
                </v-data-table>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions
                class="pa-5 px-4">
                <v-spacer></v-spacer>
                <v-btn outlined color="grey" class="m-btn" @click="cancel">Отмена</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'ClueSp333Attribute',
    props: {
        clueBox: {
            type: Boolean,
            default: false
        },
        SP333JSON: {
            type: Object,
            default: {
                list: [],
                clue: []
            }
        },
        clueInfo: {
            type: Object,
            default: null
        },
        step: {
            type: Number,
            default: 1
        }
	},
    data(){
        return {
            headersCom: [
                {
                    text: 'Наименование компонента',
                    align: 'center',
                    sortable: false,
                    value: 'name'
                },
                { text: 'Определение компонента', value: 'definition', align: 'center', sortable: false },
                { text: 'Источник', value: 'source', align: 'center', sortable: false },
                { text: 'Примеры компонентов по ISO 81346-2:2019', value: 'examples_ISO', align: 'center', sortable: false },
                { text: 'Примеры компонентов (НТД РФ)', value: 'examples_NTD', align: 'center', sortable: false }
            ],
            headersTeS: [
                {
                    text: 'Наименование характеристики',
                    align: 'center',
                    sortable: false,
                    value: 'name'
                },
                { text: 'Определение', value: 'definition', align: 'center', sortable: false },
                { text: 'Источник', value: 'source', align: 'center', sortable: false },
                // { text: 'Тип данных', value: 'type', align: 'center', sortable: false },
                // { text: 'Список значений', value: 'list', align: 'center', sortable: false }
            ]
        }
    },
    computed: {
        headers(){
            return this.step == 1 ? this.headersCom : this.headersTeS
        },
        getElem(){
            if(!this.clueInfo){
                return {
                    name: ''
                }
            }
            else{
                return this.clueInfo
            }
        },
        getItems(){
            if(!this.clueInfo){
                return []
            }
            else{
                let info = this.clueInfo.info.map(i => {
                    return {
                        ...i,
                        type: i.datatype
                            ? i.datatype.type
                            : null
                    }
                })
                return info
            }
        }
    },
    methods: {
        cancel(){
            this.$emit('update:clueBox', false)
        }
    }
}
</script>
