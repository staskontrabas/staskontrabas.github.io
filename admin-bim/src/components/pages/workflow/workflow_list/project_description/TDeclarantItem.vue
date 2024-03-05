<template>
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
</template>

<script>
import TOrganization from "./TOrganization"
import TForeignOrganization from "./TForeignOrganization"
import TIP from "./TIP"
import TPerson from "./TPerson"

export default {
    name: 'TDeclarantItem',
    components: {
        TOrganization,
        TForeignOrganization,
        TIP,
        TPerson
    },
    data(){
        return {
            selected: '',
            item: {
                title: 'Тип определяющий лицо, участвующее в процессе подготовки документации, РИИ И ПД и подачи на экспертизу',
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
                },{
                    name: 'person',
                    title: 'Физическое лицо',
                    type: 'combo',
                    component: 'TPerson',
                    value: ''
                }]
            }
        }
    }
}
</script>
