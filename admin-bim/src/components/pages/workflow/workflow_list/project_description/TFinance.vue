<template>
    <v-col cols="12" sm="12" md="12" class="pb-0">
        <v-list-item-title slot="combo" v-text="item.title"></v-list-item-title>

        <fields :item.sync="item" v-for="item in items"/>

        <v-btn v-if="item.multiple" outlined color="primary" class="m-btn mb-3" @click="add">
            Добавить источник
        </v-btn>
    </v-col>
</template>

<script>
import Fields from "./Fields"
import TTechnicalCustomer from "./TTechnicalCustomer"

export default {
    name: 'TFinance',
    props: ['item'],
    components: {
        Fields,
        TTechnicalCustomer
    },
    data(){
        return {
            items: [{
                name: 'finance_type',
                title: 'Вид источника финансирования',
                type: 'select',
                list: [1,2,3],
                value: '',
                number: 0
            },{
                name: 'budget_type',
                title: 'Уровень бюджета (в случае бюджетного финансирования)',
                type: 'select',
                list: [1,2,3,4,5],
                value: '',
                number: 0
            },{
                name: 'size',
                title: 'Размер финансирования (в % от общей суммы)',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'owner',
                title: 'Сведения о юридическом лице – источнике финансирование',
                type: 'combo',
                component: 'TTechnicalCustomer',
                value: '',
                number: 0
            },{
                name: 'commentary',
                title: 'Замечания по источнику',
                type: 'text',
                value: '',
                number: 0
            }]
        }
    },
    methods: {
        add(){
            let item = JSON.parse(JSON.stringify(this.items.filter(f => f.number == 0)))
            this.items = [...this.items, ...item.map((i, k, a) => {
                return {
                    ...i,
                    number: this.item.length / a.length,
                    value: ''
                }
            })]
        }
    }
}
</script>
