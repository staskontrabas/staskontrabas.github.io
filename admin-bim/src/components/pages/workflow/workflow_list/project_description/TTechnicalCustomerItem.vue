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

export default {
    name: 'TTechnicalCustomerItem',
    components: {
        TOrganization,
        TForeignOrganization
    },
    data(){
        return {
            selected: '',
            item: {
                name: 'customer',
                title: 'Технический заказчик',
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
                }]
            }
        }
    }
}
</script>
