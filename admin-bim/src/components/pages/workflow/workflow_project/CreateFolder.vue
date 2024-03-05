<template>
    <v-dialog :value="newFolder" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">Новая папка
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
                    v-model="folder_name"
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
                    @click="createFolder">Создать</v-btn>
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
    props: ['newFolder'],
    name: 'CreateFolder',
        data () {
            return {
                folder_name: ''
        }
    },
    watch: {
        newFolder(v){
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
            return !this.folder_name
        },
        cancel(){
            this.folder_name = ''
            this.$emit('update:newFolder', false)
        },
        createFolder(){
            this.$emit('createFolder', {name: this.folder_name})
            this.cancel()
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.createFolder()
            }
        }
    }
}
</script>
