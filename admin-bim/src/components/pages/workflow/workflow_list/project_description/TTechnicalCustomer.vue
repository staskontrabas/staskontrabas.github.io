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

                <t-technical-customer-item />
            </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
    </v-list-group>
</template>

<script>
import TTechnicalCustomerItem from "./TTechnicalCustomerItem"

export default {
    name: 'TDeclarant',
    components: {
        TTechnicalCustomerItem
    },
    data(){
        return {
            selected: '',
            item: {
                name: 'customer',
                title: 'Кто заказал',
                active: false,
                value: '',
                items: [{
                    number: 1,
                    params: {}
                }]
            }
        }
    }
}
</script>
