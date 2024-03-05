<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Добавить группу правил
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

        <v-card-text class="px-4" style="background-color: #fbfbfb;">


            <div class="m-text--size12 m-text--color-black pt-4">
                Название группы
            </div>
            <v-text-field
                v-model="getItemName"
                class="m-text--size14"
                dense
            ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-spacer></v-spacer>
            <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="setComponent">Отмена</v-btn>
            <v-btn
                outlined
                color="primary"
                class="m-btn"
                :disabled="!checkName"
                @click="save">Сохранить
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
export default {
    name: 'SectionAdd',
    props: ['temp'],
    data(){
        return {
            name: ''
        }
    },
    computed: {
        getSectionsMap(){
            let collisions = this.$store.state.common.meta.collisions
            let sections = collisions ? collisions.sections || {} : {}
            return sections
        },
        getSectionsList(){
            let sections = Object.entries(this.getSectionsMap).map(([k, v]) => {
                return v
            })
            return sections
        },
        getItemName: {
            get(){
                if(this.temp.editType == 'section'){
                    return this.name || this.getSectionsMap[this.temp.editId].name
                }
                else{
                    return this.name
                }
            },
            set(v){
                this.name = v
            }
        },
        checkName(){
            return this.name
        }
    },
    methods: {
        cancel(){
            this.$emit('cancel')
        },
        setComponent(){
            if(this.temp.editType == 'section'){
                let update = JSON.parse(JSON.stringify(this.temp))
                delete update.editType
                delete update.editId

                this.$emit('setParams', update)
            }
            this.$emit('setComponent')
        },
        save(){
            let update
            if(this.temp.editType == 'section'){
                update = this.getSectionsMap
                update[this.temp.editId].name = this.name
            }
            else{
                let ID = uuidv4()
                let name = this.getSectionsList.some(s => s.name == this.name)
                    ? this.name + '_' + ID
                    : this.name
                update = {...this.getSectionsMap, [ID]: {
                    id: ID,
                    name: name,
                    status: -1,
                    type: 'section'
                }}
            }
            this.$emit('save', {sections: update})
            this.setComponent()
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.cancel()
            }
        }
    },
    mounted(){
        document.addEventListener('keyup', this.enter, false)
    },
    beforeDestroy(){
        document.removeEventListener('keyup', this.enter, false)
    }
}
</script>
