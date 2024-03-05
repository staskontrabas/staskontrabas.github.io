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

                <t-designer-item
                    v-for="item in item.items"
                    :params="item"
                />

                <v-col cols="12" sm="12" md="12" class="pb-0">
                    <v-btn outlined color="primary" class="m-btn mb-3" @click="add">
                        Добавить
                    </v-btn>
                </v-col>

            </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
    </v-list-group>
</template>

<script>
import TDesignerItem from "./TDesignerItem"

export default {
    name: 'TDesigner',
    components: {
        TDesignerItem
    },
    data(){
        return {
            item: {
                name: 'designers',
                title: 'Сведения о тех, кто принимал участие',
                active: false,
                items: [{
                    number: 1,
                    params: {}
                }]
            }
        }
    },
    methods: {
        add(){
            this.item.items = [...this.item.items, {
                number: this.item.items.length + 1,
                params: {}
            }]
        }
    }
}
</script>
