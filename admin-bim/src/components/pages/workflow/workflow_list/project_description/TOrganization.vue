<template>
    <v-col cols="12" sm="12" md="12" class="pb-0">
        <v-list-item-title slot="combo" v-text="item.title"></v-list-item-title>

        <fields :item.sync="item" v-for="item in items"/>

    </v-col>
</template>

<script>
import Fields from "./Fields"
import TAddress from "./TAddress"

export default {
    name: 'TOrganization',
    props: ['item'],
    components: {
        Fields,
        TAddress
    },
    data(){
        return {
            items: [{
                name: 'name',
                title: 'Полное наименование юридического лица',
                type: 'string',
                value: ''
            },{
                name: 'ogrn',
                title: 'Основной государственный регистрационный номер юридического лица',
                type: 'string',
                value: ''
            },{
                name: 'inn',
                title: 'Индивидуальный номер налогоплательщика - юридического лица',
                type: 'string',
                value: ''
            },{
                name: 'kpp',
                title: 'Код причины постановки на учет юридического лица',
                type: 'string',
                value: ''
            },{
                name: 'addresses',
                title: 'Адрес (местонахождение) юридического лица',
                type: 'combo',
                component: 'TAddress',
                value: ''
            },{
                name: 'email',
                title: 'Адрес электронной почты юридического лица',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)) || 'Неверный email'
                ]
            }]
        }
    },
    methods: {

    }
}
</script>
