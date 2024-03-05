<template>
    <div>
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
        <fields :item.sync="general" :size="'5'"/>
    </div>
</template>

<script>
import Fields from "./Fields"
import TOrganization from "./TOrganization"
import TForeignOrganization from "./TForeignOrganization"
import TIP from "./TIP"

export default {
    name: 'TDesignerItem',
    components: {
        Fields,
        TOrganization,
        TForeignOrganization,
        TIP
    },
    props: ['params'],
    data(){
        return {
            selected: '',
            general: {
                name: 'general',
                title: 'Отметка о роли генерального проектировщика',
                type: 'select',
                list: ['да', 'нет'],
                value: ''
            },
            item: {
                name: 'designers',
                title: 'Сведения о лицах, подготовивших проектную документацию',
                active: false,
                items: [{
                    name: 'organization',
                    title: 'Юридическое лицо',
                    type: 'combo',
                    component: 'TOrganization',
                    value: ''
                },{
                    name: 'foreign_organization',
                    title: 'Иностранное юридическое лицо (филиал, представительство)',
                    type: 'combo',
                    component: 'TForeignOrganization',
                    value: ''
                },{
                    name: 'ip',
                    title: 'Индивидуальный предприниматель',
                    type: 'combo',
                    component: 'TIP',
                    value: ''
                }]
            }
        }
    }
}
</script>
