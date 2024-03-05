<template>
    <v-dialog :value="editFolder" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">Новая имя папки
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
            <v-card-text style="background-color: #fbfbfb; min-height: 120px;" class="pt-5">
                <v-text-field
                    label="Название папки"
                    :value="node.title"
                    @input="editName"
                    :autocomplete="'off'"
                ></v-text-field>
            </v-card-text>

            <v-divider></v-divider>
            <v-card-actions class="pa-5">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    :disabled="checkChange()"
                    @click="updateNode">Переименовать</v-btn>
                <v-btn
                    outlined
                    color="#2c2c2c"
                    class="m-btn m-btn-normal"
                    @click="cancel">Отмена</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: ['editFolder', 'node'],
        name: 'EditFolder',
            data () {
                return {
                    folder_name: ''
            }
        },
        watch: {
            editFolder(v){
                if(v){
                    document.addEventListener('keyup', this.enter, false)
                }
                else{
                    document.removeEventListener('keyup', this.enter, false)
                }
            }
        },
        methods: {
            checkChange(){
                if(!this.node){
                    return
                }
                let check = !this.folder_name || this.folder_name == this.node.title
                let list = []
                if(this.getType()){
                    list = this.$store.state.workflow.foldersMap.filter(i => !!i.group)
                }
                else{
                    let parent = this.node.data.parent
                    list = this.$store.state.workflow.foldersMap.filter(i => i.parent == parent && !i.group)
                }
                list.map(i => {
                    if(i.name == this.folder_name){
                        check = true
                    }
                })
                return check
            },
            cancel(){
                this.folder_name = ''
                this.$emit('update:editFolder', false)
            },
            editName(v){
                this.folder_name = v
            },
            getType(){
                return this.node && !!this.node.data.group
            },
            updateNode(){
                this.$emit('renameNode', this.folder_name)
                this.cancel()
            },
            enter(e){
                if(e.keyCode === 13){
                    e.preventDefault()
                    this.updateNode()
                }
            }
        }
    }
</script>
