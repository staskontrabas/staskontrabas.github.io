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
import Fields from "./Fields"
import TFinance from "./TFinance"

export default {
    name: 'TFinances',
    components: {
        Fields,
        TFinance
    },
    props: ['name'],
    data(){
        return {
            item: {
                name: 'finances',
                title: 'Описание источников финансирования',
                active: false,
                items: [{
                    name: 'sources',
                    title: 'Источник финансирования',
                    type: 'combo',
                    component: 'TFinance',
                    value: '',
                    multiple: true
                },{
                    name: 'commentary',
                    title: 'Замечания по источникам финансирования',
                    type: 'text',
                    value: ''
                }]
            }
        }
    }
}
</script>
