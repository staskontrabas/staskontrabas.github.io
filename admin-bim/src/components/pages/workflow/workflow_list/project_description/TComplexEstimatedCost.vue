<template>
    <v-col cols="12" sm="12" md="12" class="pb-0">
        <v-list-item-title slot="combo" v-text="item.title"></v-list-item-title>

        <fields :item.sync="item" v-for="item in items"/>

    </v-col>
</template>

<script>
import Fields from "./Fields"

export default {
    name: 'TComplexEstimatedCost',
    props: ['item'],
    components: {
        Fields
    },
    data(){
        return {
            items: [{
                name: 'cost_basic',
                title: 'Сметная стоимость в базисном уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'works_cost_basic',
                title: 'Сметная стоимость строительно-монтажных работ в базисном уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'hardware_cost_basic',
                title: 'Сметная стоимость оборудования в базисном уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'other_cost_basic',
                title: 'Сметная стоимость прочих затрат в базисном уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'project_works_cost_basic',
                title: 'Сметная стоимость проектно-изыскательских работ в базисном уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'back_sum_cost_basic',
                title: 'Возвратные суммы в базисном уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'cost',
                title: 'Сметная стоимость в текущем уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'works_cost',
                title: 'Сметная стоимость строительно-монтажных работ в текущем уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'hardware_cost',
                title: 'Сметная стоимость оборудования в текущем уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'other_cost',
                title: 'Сметная стоимость прочих затрат в текущем уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'project_works_cost',
                title: 'Сметная стоимость проектно-изыскательских работ в текущем уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'nds_cost',
                title: 'Сумма налога на добавленную стоимость (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'back_sum_cost',
                title: 'Возвратные суммы в текущем уровне цен (в тысячах рублей)',
                type: 'string',
                value: '',
                required: true,
                rules: [
                    v => (/(Не требуется)|(Отсутствует)|(-{0,1}\d*\.{0,1}\d*)/.test(v)) || 'Неверный ввод'
                ]
            },{
                name: 'cost_basic_comment',
                title: 'Комментарий к сметной стоимости в базисном уровне цен',
                type: 'text',
                value: ''
            },{
                name: 'cost_comment',
                title: 'Комментарий к сметной стоимости в текущем уровне цен',
                type: 'text',
                value: ''
            }]
        }
    },
    methods: {

    }
}
</script>
