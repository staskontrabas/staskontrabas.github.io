<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Добавить правило
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


            <div class="m-text--size12 m-text--color-black ">
                Выбрать набор правил
            </div>
            <v-select
                class="m-text--size14"
                dense
                label=""
                placeholder=" "
                v-model="section"
                :items="getSectionsList"
                item-text="name"
                item-value="id"
                return-object
                hide-details
            >
                <template v-slot:append-outer>
                    <icon-botton
                        @onClick="sectionAdd"
                        :size="'30'"
                        >trd-books
                    </icon-botton>
                </template>

            </v-select>
            <div class="m-text--size12 m-text--color-black pt-4">
                Название правила
            </div>
            <v-text-field
                v-model="getName"
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
                :disabled="!check"
                @click="save">Сохранить
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import IconBotton from '@/components/custom/IconBotton'
export default {
    name: 'GroupAdd',
    props: ['temp'],
    components: {
        IconBotton
    },
    data(){
        return {
            name: '',
            selectSection: null
        }
    },
    computed: {
        getGroups(){
            let collisions = this.$store.state.common.meta.collisions
            let groups = collisions ? collisions.groups || [] : []
            return groups
        },
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
        section: {
            get(){
                let item
                if(this.temp.editType == 'group'){
                    let group = this.getGroups.find(g => g.id == this.temp.editId)
                    item = this.selectSection || this.getSectionsMap[group.section]
                }
                else{
                    item = this.selectSection
                }

                return item
            },
            set(v){
                this.selectSection = v
            }
        },
        getName: {
            get(){
                if(this.temp.editType == 'group'){
                    let item = this.getGroups.find(g => g.id == this.temp.editId)
                    return this.name || item.name
                }
                else{
                    return this.name
                }
            },
            set(v){
                this.name = v
            }
        },
        check(){
            return this.getName
        }
    },
    methods: {
        cancel(){
            this.$emit('cancel')
        },
        setComponent(){
            if(this.temp.editType == 'group'){
                let update = JSON.parse(JSON.stringify(this.temp))
                delete update.editType
                delete update.editId

                this.$emit('setParams', update)
            }
            this.$emit('setComponent')
        },
        sectionAdd(){
            this.$emit('setComponent', 'SectionAdd')
        },
        save(){
            let update = []
            let ID = uuidv4()
            if(this.temp.editType == 'group'){
                update = this.getGroups.map(g => {
                    if(g.id == this.temp.editId){
                        if(!this.getGroups.some(s => s.name == this.name)){
                            g.name = this.getName
                        }
                        g.section = this.section.id || null
                    }
                    return g
                })
            }
            else{
                let name = this.getGroups.some(s => s.name == this.getName)
                    ? this.getName + '_' + ID
                    : this.getName
                update = [...this.getGroups, {
                    id: ID,
                    name: name,
                    status: -1,
                    section: this.selectSection
                        ? this.selectSection.id
                        : null,
                    type: 'group',
                    children: []
                }]
            }
            this.$emit('save', {groups: update})
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
