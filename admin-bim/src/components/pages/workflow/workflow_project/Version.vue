<template>
    <v-dialog :value="versionjournal" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-0 pl-4 m-modal--title">Журнал версий
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
            <v-card-text class="pt-5 px-4">

                <v-data-table
                    :headers="headers"
                    :items="versions.list"
                    disable-pagination
                    hide-default-footer
                    class="m-table-custom"
                    calculate-widths
                >
                    <template v-slot:no-data>
                        {{noData}}
                    </template>

                    <template v-slot:item.action="{ item }">
                        <v-btn
                            v-if="checkVersion(item)"
                            outlined
                            disabled
                            class="m-btn"
                            color="normal">
                            Текущая версия
                        </v-btn>
                        <v-btn
                            v-else
                            outlined
                            @click="setVersion(item)"
                            class="m-btn m-btn-hidden"
                            color="primary">
                            Сделать текущей
                        </v-btn>
                    </template>
                </v-data-table>

            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-5 px-4">
                <v-spacer></v-spacer>
                <v-btn outlined color="primary" class="m-btn" @click="save">Подтвердить</v-btn>
                <v-btn outlined color="normal" class="m-btn" @click="cancel">Отмена</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'VersionJournal',
    props: ['versionjournal', 'item'],
    data(){
        return {
            version: 0,
            versionID: null,
            headers: [
                { text: 'Имя файла', value: 'name', sortable: false },
                { text: 'Дата загрузки', value: 'date',sortable: false, align: 'center' },
                { text: 'Версия', value: 'version',sortable: false, align: 'center' },
                { text: '', value: 'action', sortable: false, align: 'right' },
            ],
            noData: 'Нет данных',
        }
    },
    computed: {
        versions(){
            let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}

            let name = this.item ? this.item.name : ''
            let version = this.item
                ? this.item.type != 'folder'
                    ? this.item.version
                        ? this.item.version
                        : this.item.files[0].id
                    : 0
                : 0

            let list = this.item
                ? this.item.type != 'folder'
                    ? this.item.files.map((i, j) => {
                        return {
                            id: i.url,
                            name: this.item.name,
                            date: (new Date(i.created_at)).toLocaleDateString("ru-RU", options),
                            version: i.version,
                            versionID: i.id
                        }
                    })
                    : []
                : []
            return {
                version,
                name,
                list
            }
        }
    },
    watch: {
        versionjournal(v){
            if(v){
                document.addEventListener('keyup', this.enter, false)
            }
            else{
                document.removeEventListener('keyup', this.enter, false)
            }
        }
    },
    methods: {
        checkVersion(item){
            if(!this.version){
                if(item.version == this.versions.version){
                    return true
                }
            }
            else{
                if(item.version == this.version){
                    return true
                }
            }

            return false
        },
        setVersion(item){
            this.version = item.version
            this.versionID = item.versionID
        },
        cancel(){
            this.version = 0
            this.$emit('update:versionjournal', false)
        },
        save(){
            if(this.version && this.version != this.versions.version){
                this.$store.dispatch('workflow/addDoc', {
                    id: this.item.id,
                    name: this.versions.name,
                    version: this.versionID,
                    order: this.item.order,
                    folder: this.item.folder
                })
                .then(res => {
                    this.$store.dispatch('workflow/updateDocInState', res)
                    this.cancel()
                })
            }
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.save()
            }
        }
    },
    updated() {
        console.log('item', this.item)
    }
}
</script>
