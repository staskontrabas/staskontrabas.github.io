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
    name: 'TPerson',
    props: ['item'],
    components: {
        Fields,
        TAddress
    },
    data(){
        return {
            items: [{
                name: 'last_name',
                title: 'Фамилия',
                type: 'string',
                value: ''
            },{
                name: 'first_name',
                title: 'Имя',
                type: 'string',
                value: ''
            },{
                name: 'second_name',
                title: 'Отчество',
                type: 'string',
                value: ''
            },{
                name: 'snils',
                title: 'СНИЛС',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/[0-9]{3}-[0-9]{3}-[0-9]{3} [0-9]{2}/.test(v)) || 'Неверный номер'
                ]
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
