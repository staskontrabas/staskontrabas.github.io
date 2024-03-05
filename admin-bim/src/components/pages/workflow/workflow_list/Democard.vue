<template>
    <v-card class="d-flex flex-column pb-8"> 
        <!-- is="ObligatoryValue" -->
        <component v-for="element of content" 
        :is="element.typeofelement"
        :propset="element.props"
        :number="number"
        />
            
    </v-card>
</template>

<script>

import SectionHeader from "./democard/section_header.vue"
import IgnoreMark from "./democard/ignore_mark.vue"
import CodeTable from "./democard/code_table.vue"
import ObligatoryValue from "./democard/obligatory_value.vue"
import Choice from "./democard/choice.vue"

export default {
    components: {
        ObligatoryValue,
        SectionHeader,
        IgnoreMark,
        CodeTable,
        Choice,
    },
    props: ['content', 'number'],
    data: () => ({
    }),

}
</script>

<style scoped>

</style>
