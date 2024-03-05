<template>
    <v-dialog :value="projectDescription" scrollable max-width="700px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-0 pl-4 m-modal--title">
                Описание проекта
                <v-spacer></v-spacer>
                <v-btn
                    text
                    icon
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pt-5 px-0">

                <v-list dense>
                    <t-object />
                    <t-declarant
                        :name="'declarant'"
                        :title="'Кто подает'"/>
                    <t-declarant
                        :name="'developer'"
                        :title="'Кто разработал'"/>
                    <t-technical-customer />
                    <t-finances />
                    <t-estimated-cost />
                    <t-climate-conditions />
                    <t-designer />
                    <t-engineering-survey />

                </v-list>

            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-5 px-4">
                <v-spacer></v-spacer>
                <v-btn outlined color="primary" class="m-btn" @click="">
                    Сохранить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import TObject from "./project_description/TObject"
import TDeclarant from "./project_description/TDeclarant"
import TTechnicalCustomer from "./project_description/TTechnicalCustomer"
import TFinances from "./project_description/TFinances"
import TEstimatedCost from "./project_description/TEstimatedCost"
import TClimateConditions from "./project_description/TClimateConditions"
import TDesigner from "./project_description/TDesigner"
import TEngineeringSurvey from "./project_description/TEngineeringSurvey"

export default {
    name: 'ProjectDescription',
    components: {
        TObject,
        TDeclarant,
        TTechnicalCustomer,
        TFinances,
        TEstimatedCost,
        TClimateConditions,
        TDesigner,
        TEngineeringSurvey
    },
    props: ['projectDescription'],
    data(){
        return {
            project_description: {}
        }
    },
    methods: {
        cancel(){
            this.$emit('update:projectDescription', false)
        }
    }
}
</script>
