<template>
    <v-dialog :value="editProject" scrollable max-width="700px" @input="v => v || cancel()">
        <component
            :is="component"
            :component.sync="component"
            :addition.sync="addition"
            :additionID.sync="additionID"
            :project="item"
            :open="editProject"
            :storeage.sync="storeage"
            @cancel="cancel"
        />
    </v-dialog>
</template>

<script>
import Custom from './Custom'
import Edit from './Edit'

export default {
    name: 'EditProject',
    components: {
        Edit,
        Custom
    },
    props: ['editProject', 'item'],
    data(){
        return {
            component: null,
            addition: [],
            additionID: null,
            storeage: null
        }
    },
    watch: {
        editProject(v){
            if(v){
                this.component = 'edit'
                this.addition = this.getAddition()
            }
        }
    },
    methods: {
        decodeHtmlCharCodes(str){
            return str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
                String.fromCharCode(charCode)
            )
        },
        getAddition(){
            let addition = this.item
                ? this.item.info.addition || []
                : []
            let list = []
            addition.map((a, ind) => {
                    // let field = JSON.parse(this.decodeHtmlCharCodes(a.value))
                    // if(field.hasOwnProperty('value') || field.hasOwnProperty('params')){
                    //     list.push(field)
                    // }
                if(typeof a.value === 'object' && a.value.list){
                    list.push({
                        id: 'f-' + ind,
                        name: a.name,
                        type: 'list',
                        params: {
                            value: a.value.list.indexOf(a.value.value).toString(),
                            list: a.value.list.map((l, i) => ({name: l, value: '' + i}))
                        }
                    })
                }
                else{
                    list.push({
                        id: 'f-' + ind,
                        name: a.name,
                        type: typeof a.value == 'number'
                            ? 'number'
                            : 'string',
                        value: a.value
                    })
                }
            })
            return list
        },
        cancel(){
            this.addition = []
            this.component = null
            this.additionID = null
            this.storeage = null
            this.$emit('update:editProject', false)
        }
    }
}
</script>
