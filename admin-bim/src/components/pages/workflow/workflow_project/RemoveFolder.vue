<template>
    <v-dialog :value="removeFolderFlag" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">Удалить {{node.isLeaf ? 'папку' : 'папку'}} {{node.title}}?
                <v-spacer></v-spacer>
                <v-btn
                    text
                    icon
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-actions class="pa-5">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    @click="removeNode">Удалить</v-btn>
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
        props: ['removeFolderFlag', 'node'],
        name: 'RemoveFolder',
        watch: {
            removeFolderFlag(v){
                if(v){
                    document.addEventListener('keyup', this.enter, false)
                }
                else{
                    document.removeEventListener('keyup', this.enter, false)
                }
            }
        },
        methods: {
            cancel(){
                this.$emit('update:removeFolderFlag', false)
            },
            removeNode(){
                this.$emit('removeNode')
                this.cancel()
            },
            enter(e){
                if(e.keyCode === 13){
                    e.preventDefault()
                    this.removeNode()
                }
            }
        }
    }
</script>
