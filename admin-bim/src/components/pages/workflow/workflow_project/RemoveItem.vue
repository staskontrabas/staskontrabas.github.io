<template>
    <v-dialog :value="remove_item" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">Вы действительно хотите удалить {{getItem.type == 'folder' ? ' папку' : ' файл'}}?
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
                <span v-if="getItem.type == 'folder'">После удаления папки вложенные файлы в течение 30 дней будут находится в корзине, по истечению срока они будут удалены окончательно, без возможности восстановления. </br>Удаленные папки восстановлению не подлежат.
                </span>
                <span v-else>После удаления файл в течение 30 дней будет находится в корзине, по истечению срока он будет удален окончательно, без возможности восстановления.
                </span>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions class="pa-5">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    @click="remove">Да</v-btn>
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
        props: ['remove_item', 'item'],
        name: 'RemoveItem',
        computed: {
            getItem(){
                return this.item
                    ? {
                        type: this.item.type,
                        name: this.item.name
                    }
                    : {
                        type: '',
                        name: ''
                    }
            }
        },
        watch: {
            remove_item(v){
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
                this.$emit('update:remove_item', false)
            },
            remove(){
                if(this.item.type == 'folder'){
                    this.$emit('removeFolder', this.item)
                }
                else{
                    this.$emit('removeDct', this.item)
                }
                this.cancel()
            },
            enter(e){
                if(e.keyCode === 13){
                    e.preventDefault()
                    this.remove()
                }
            }
        }
    }
</script>
