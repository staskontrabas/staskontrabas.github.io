<template>
    <v-col cols="12" sm="12" md="12" class="pb-0">
        <v-list-item-title slot="combo" v-text="item.title"></v-list-item-title>

        <fields :item.sync="item" v-for="item in items"/>

        <v-btn v-if="item.multiple" outlined color="primary" class="m-btn mb-3" @click="add">
            Добавить показатель
        </v-btn>
    </v-col>
</template>

<script>
import Fields from "./Fields"

export default {
    name: 'TTei',
    props: ['item'],
    components: {
        Fields
    },
    data(){
        return {
            items: [{
                name: 'name',
                title: 'Название',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'measure',
                title: 'Единица измерения показателя',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'value',
                title: 'Значение',
                type: 'string',
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
