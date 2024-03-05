<template>
    <v-list-group
        v-model="item.active"
        no-action
    >
        <v-divider></v-divider>
        <template v-slot:activator>
            <v-list-item-content>
                <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
        </template>

        <v-list-item class="px-1">
            <v-list-item-content>

                <component
                    v-for="item in item.items"
                    :is="item.component"
                    :item.sync="item" />
            </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
    </v-list-group>
</template>

<script>
import TEngineeringSurveyAddress from "./TEngineeringSurveyAddress"
import TDeclarantItem from "./TDeclarantItem"
import TTechnicalCustomerItem from "./TTechnicalCustomerItem"

export default {
    name: 'TEngineeringSurvey',
    props: ['items'],
    components: {
        TEngineeringSurveyAddress,
        TDeclarantItem,
        TTechnicalCustomerItem
    },
    data(){
        return {
            item: {
                name: 'object',
                title: 'Описание объекта строительства',
                active: false,
                items: [{
                    name: 'address',
                    title: 'Местоположение района (площадки, трассы) проведения инженерных изысканий',
                    type: 'combo',
                    component: 'TEngineeringSurveyAddress',
                    value: '',
                    multiple: true
                },{
                    name: 'developer',
                    title: 'Застройщик, обеспечивший проведение инженерных изысканий',
                    type: 'combo',
                    component: 'TDeclarantItem',
                    value: ''
                },{
                    name: 'customer',
                    title: 'Технический заказчик, обеспечивший проведение инженерных изысканий',
                    type: 'combo',
                    component: 'TTechnicalCustomerItem',
                    value: ''
                }]
            }
        }
    }
}
</script>
