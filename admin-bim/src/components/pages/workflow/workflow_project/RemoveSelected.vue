<template>
    <v-dialog :value="removeSelectedFlag" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">Удалить выбранные элементы?
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
            <v-card-text style="background-color: #fbfbfb; color: #000;" class="pt-5 pl-4">
                После удаления файлы в течение 30 дней будут находится в корзине, по истечению срока они будут удалены окончательно, без возможности восстановления.
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions class="pa-5">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    @click="removeSelected">Да</v-btn>
                <v-btn
                    outlined
                    color="#2c2c2c"
                    class="m-btn m-btn-normal"
                    @click="cancel">Нет</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: ['removeSelectedFlag'],
        name: 'RemoveSelected',
        watch: {
            removeSelectedFlag(v){
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
                this.$emit('update:removeSelectedFlag', false)
            },
            removeSelected(){
                this.$emit('removeSelected')
                this.cancel()
            },
            enter(e){
                if(e.keyCode === 13){
                    e.preventDefault()
                    this.removeSelected()
                }
            }
        }
    }
</script>
