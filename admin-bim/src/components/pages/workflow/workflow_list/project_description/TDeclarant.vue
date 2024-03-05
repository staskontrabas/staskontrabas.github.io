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

                <t-declarant-item />
            </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
    </v-list-group>
</template>

<script>
import TDeclarantItem from "./TDeclarantItem"

export default {
    name: 'TDeclarant',
    components: {
        TDeclarantItem
    },
    props: ['name', 'title'],
    data(){
        return {
            selected: '',
            item: {
                name: this.name || 'declarant',
                title: this.title || 'Кто подает',
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
