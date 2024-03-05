<template>
    <v-col cols="12" sm="12" md="12" class="pb-0">
        <v-list-item-title slot="combo" v-text="item.title"></v-list-item-title>

        <component
            v-for="item in items"
            :is="item.component"
            :item.sync="item" />

        <v-btn v-if="item.multiple" outlined color="primary" class="m-btn mb-3" @click="add">
            Добавить описание объекта
        </v-btn>
    </v-col>
</template>

<script>
import Fields from "./Fields"
import TAddress from "./TAddress"
import TTei from "./TTei"

export default {
    name: 'TObjectPart',
    props: ['item'],
    components: {
        Fields,
        TAddress,
        TTei,
    },
    data(){
        return {
            items: [{
                name: 'name',
                title: 'Наименование объекта',
                type: 'string',
                component: 'Fields',
                value: '',
                number: 0
            },{
                name: 'addresses',
                title: 'Адреса объекта строительства',
                type: 'combo',
                component: 'TAddress',
                value: '',
                multiple: true,
                number: 0
            },{
                name: 'functions',
                title: 'Функциональное назначение (или код классификатора)',
                type: 'string',
                component: 'Fields',
                value: '',
                number: 0
            },{
                name: 'teis',
                title: 'Технико-экономические показатели объекта капитального строительства',
                type: 'combo',
                component: 'TTei',
                value: '',
                multiple: true,
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
