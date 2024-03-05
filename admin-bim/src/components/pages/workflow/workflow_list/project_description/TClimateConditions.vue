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

export default {
    name: 'TClimateConditions',
    props: ['items'],
    components: {
        Fields
    },
    data(){
        return {
            item: {
                name: 'climate_conditions',
                title: 'Климатические условия',
                active: false,
                items: [{
                    name: 'climate_district',
                    title: 'Климатический район, подрайон',
                    type: 'select',
                    component: 'Fields',
                    list: ['I', 'IА', 'IБ', 'IВ', 'IГ', 'IД', 'II', 'IIА', 'IIБ', 'IIВ', 'IIГ', 'III', 'IIIА', 'IIIБ', 'IIIВ', 'IV', 'IVА', 'IVБ', 'IVВ', 'IVГ'
                    ],
                    multiple: true,
                    value: ''
                },{
                    name: 'geological_conditions',
                    title: 'Категория сложности инженерно-геологических(геокриологических) условий',
                    type: 'select',
                    component: 'Fields',
                    list: ['I', 'II', 'III'],
                    multiple: true,
                    value: ''
                },{
                    name: 'wind_district',
                    title: 'Ветровой район',
                    type: 'select',
                    component: 'Fields',
                    list: ['Iа', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'],
                    multiple: true,
                    value: ''
                },{
                    name: 'snow_district',
                    title: 'Снеговой район',
                    type: 'select',
                    component: 'Fields',
                    list: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
                    multiple: true,
                    value: ''
                },{
                    name: 'seismic_activity',
                    title: 'Интенсивность сейсмических воздействий',
                    type: 'select',
                    component: 'Fields',
                    list: [5, 6, 7, 8, 9, 10],
                    multiple: true,
                    value: ''
                },{
                    name: 'climate_conditions_note',
                    title: 'Дополнительные сведения о природных и техногенных условиях территории, на которой планируется осуществлять строительство, реконструкцию, капитальный ремонт объекта капитального строительства',
                    type: 'text',
                    component: 'Fields',
                    value: ''
                }]
            }
        }
    }
}
</script>
