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
import TAddress from "./TAddress"
import TTei from "./TTei"
import TCadastralNumber from "./TCadastralNumber"
import TObjectPart from "./TObjectPart"

export default {
    name: 'TObject',
    props: ['items'],
    components: {
        Fields,
        TAddress,
        TTei,
        TCadastralNumber,
        TObjectPart
    },
    data(){
        return {
            item: {
                name: 'object',
                title: 'Описание объекта строительства',
                active: false,
                items: [{
                    name: 'name',
                    title: 'Наименования объекта строительства',
                    type: 'string',
                    component: 'Fields',
                    value: ''
                },{
                    name: 'addresses',
                    title: 'Адреса объекта строительства',
                    type: 'combo',
                    component: 'TAddress',
                    value: '',
                    multiple: true
                },{
                    name: 'type',
                    title: 'Тип объекта',
                    type: 'list',
                    component: 'Fields',
                    value: '0',
                    list: ['Объект производственного назначения', 'Объект непроизводственного назначения', 'Линейный объект']
                },{
                    name: 'functions',
                    title: 'Функциональное назначение (или код классификатора)',
                    type: 'string',
                    component: 'Fields',
                    value: ''
                },{
                    name: 'teis',
                    title: 'Технико-экономические показатели объекта капитального строительства',
                    type: 'combo',
                    component: 'TTei',
                    value: '',
                    multiple: true
                },{
                    name: 'cadastral_numbers',
                    title: 'Кадастровые номера земельных участков',
                    type: 'string',
                    component: 'TCadastralNumber',
                    value: '',
                    multiple: true
                },{
                    name: 'parts',
                    title: 'Описание частей объекта строительства',
                    type: 'combo',
                    component: 'TObjectPart',
                    value: '',
                    multiple: true
                }]
            }
        }
    }
}
</script>
