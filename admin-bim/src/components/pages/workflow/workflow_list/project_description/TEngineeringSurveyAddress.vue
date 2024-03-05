<template>
    <v-col cols="12" sm="12" md="12" class="pb-0">
        <v-list-item-title slot="combo" v-text="item.title"></v-list-item-title>

    <div class="d-flex flex-wrap">
        <fields :item.sync="item" v-for="item in items" :size="'6'"/>
    </div>

        <v-btn v-if="item.multiple" outlined color="primary" class="m-btn mb-3" @click="add">
            Добавить адрес
        </v-btn>
    </v-col>
</template>

<script>
import Fields from "./Fields"

export default {
    name: 'TEngineeringSurveyAddress',
    props: ['item'],
    components: {
        Fields
    },
    data(){
        return {
            items: [{
                name: 'region',
                title: 'Код субъекта Российской Федерации',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'district',
                title: 'Описание района изысканий (Наименование муниципального района, в случае проведения изысканий на территории Российской Федерации)',
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
