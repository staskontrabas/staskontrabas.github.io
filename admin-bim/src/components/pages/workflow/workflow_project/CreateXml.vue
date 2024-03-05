<template>
    <v-dialog :value="createXml" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">Документ XML
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
            <v-card-text style="background-color: #fbfbfb; min-height: 120px;" class="pt-5 px-4">
                <v-card
                    outlined
                    tile
                    >
                    <v-list dense>
                        <v-list-item
                            v-for="temple in items"
                        >
                            {{temple}}
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-card-text>

            <v-divider></v-divider>
            <v-card-actions class="pa-5">
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    @click="">Загрузить</v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="#2c2c2c"
                    class="m-btn m-btn-normal"
                    @click="cancel">Отмена</v-btn>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    @click="">Создать</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ['createXml'],
    name: 'CreateXml',
    data () {
        return {
            folder_name: '',
            items: ['First', 'Second', 'Thrrrr']
        }
    },
    watch: {
        createXml(v){
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
            this.$emit('update:createXml', false)
        },
        createFolder(){
            // this.$emit('createFolder', {name: this.folder_name})
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
