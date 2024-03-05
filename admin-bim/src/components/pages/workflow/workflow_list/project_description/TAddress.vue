<template>
    <v-col cols="12" sm="12" md="12" class="pb-0">
        <v-list-item-title slot="combo" v-text="item.title"></v-list-item-title>

    <div class="d-flex flex-wrap">
        <fields @onChange="onChange" :item.sync="item" v-for="item in items" :size="'6'"/>
    </div>

        <v-btn v-if="item.multiple" outlined color="primary" class="m-btn mb-3" @click="add">
            Добавить адрес
        </v-btn>
    </v-col>
</template>

<script>
import Fields from "./Fields"

export default {
    name: 'TAddress',
    props: ['item'],
    components: {
        Fields
    },
    data(){
        return {
            items: [{
                name: 'сountry',
                title: 'Страна',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'region',
                title: 'Регион',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'post_index',
                title: 'Почтовый индекс',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'district',
                title: 'Район',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'city',
                title: 'Город',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'settlement',
                title: 'Населенный пункт',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'street',
                title: 'Улица',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'building',
                title: 'Дом',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'room',
                title: 'Квартира',
                type: 'string',
                value: '',
                number: 0
            },{
                name: 'note',
                title: 'замечания по адресу',
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
        },
        onChange(){
            this.item.value = this.items
        },
    },
    created(){
        this.onChange()
    }
}
</script>
