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

                <v-col cols="12" sm="12" md="12" class="pb-0">
                    <v-autocomplete
                        :label="item.title"
                        placeholder=" "
                        :items="item.items"
                        v-model="selected"
                        return-object
                        item-text="title"
                        item-value="name"
                        >
                    </v-autocomplete>

                    <component
                        :is="selected.component"
                        :item.sync="selected" />
                </v-col>
            </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
    </v-list-group>
</template>

<script>
import Fields from "./Fields"
import TComplexEstimatedCost from "./TComplexEstimatedCost"

export default {
    name: 'TEstimatedCost',
    components: {
        Fields,
        TComplexEstimatedCost,
    },
    data(){
        return {
            selected: '',
            item: {
                name: 'cost',
                title: 'Сведения о сметной стоимости',
                active: false,
                items: [{
                    name: 'sum',
                    title: 'Описание сумм при указании сметной стоимости',
                    type: 'string',
                    component: 'Fields',
                    value: '',
                    required: true,
                    rules: [
                        v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                    ]
                },{
                    name: 'detail',
                    title: 'Сметная стоимость (расшифровка по составляющим)',
                    type: 'combo',
                    component: 'TComplexEstimatedCost',
                    value: ''
                }]
            }
        }
    }
}
</script>
