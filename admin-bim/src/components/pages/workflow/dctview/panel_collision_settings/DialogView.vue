<template>
<v-dialog class="m-panel__collision" hide-overlay :value="component" scrollable max-width="800px" @input="v => v || cancel()">
    <component
        :is="component"
        :temp="temp"
        :elementParameters.sync="elementParameters"
        :componentNames.sync="componentNames"
        :elems_json="elems_json"
        :model="model"
        :listModel="listModel"
        :source="source"
        @setComponent="setComponent"
        @setParams="setParams"
        @save="save"
        @cancel="cancel"
    />
</v-dialog>
</template>

<script>
import RulesTypes from "./RulesTypes"
import RulesSettings from "./RulesSettings"
import RulesSettingsParams from "./RulesSettingsParams"
import RulesSettingsRepeat from "./RulesSettingsRepeat"
import RulesSettingsDistance from "./RulesSettingsDistance"
import RulesSettingsSpace from "./RulesSettingsSpace"
import RulesSettingsNumberObjRooms from "./RulesSettingsNumberObjRooms"
import RulesElement from "./RulesElement"
import RulesSelect from "./RulesSelect"
import SectionAdd from "./SectionAdd"
import GroupAdd from "./GroupAdd"
import GetParams from "./GetParams"

export default {
    name: 'DialogView',
    components: {
        RulesTypes,
        RulesSettings,
        RulesSettingsRepeat,
        RulesSettingsParams,
        RulesSettingsDistance,
        RulesSettingsSpace,
        RulesSettingsNumberObjRooms,
        RulesElement,
        GroupAdd,
        GetParams,
        RulesSelect,
        SectionAdd
    },
    props: ['component', 'temp', 'elementParameters', 'source', 'componentNames', 'elems_json', 'model', 'listModel'],
    data(){
        return {
            path: []
        }
    },
    watch: {
        component(v){
            if(v && !this.path.length){
                this.path.push(v)
            }
        }
    },
    methods: {
        cancel(){
            this.path = []
            this.$emit('cancel')
        },
        setComponent(v){
            v = v || false

            if(v){
                this.path.push(v)
            }
            else{
                this.path.pop()
                v = this.path[this.path.length - 1] || false
            }
            this.$emit('update:component', v)
        },
        setParams(v){
            this.$emit('updateTemp', v)
        },
        save(v){
            this.$emit('saveMeta', v)
        }
    }
}
</script>
