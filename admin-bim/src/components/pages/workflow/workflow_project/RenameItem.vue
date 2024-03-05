<template>
    <v-dialog :value="renameItem" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">{{getTitle}}
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
                    :label="getTitle"
                    :value="item ? createShortName(item.name) : ''"
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
                    @click="rename">Переименовать</v-btn>
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
    props: {
        renameItem: {
            type: Boolean,
            default: false
        },
        item: {
            type: Object,
            default: null
        }
    },
    name: 'RenameItem',
    data(){
        return {
            name: '',
            type: ''
        }
    },
    computed: {
        getTitle(){
            let title = this.item   ? "Имя " + (this.item.type == 'folder'
                                                            ? 'папки'
                                                            : 'файла')
                                    : "Имя"
            return title
        }
    },
    watch: {
        renameItem(v){
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
            if(!this.item){
                return true
            }
            let check = !this.name || this.name == this.item.name
            let list = this.$store.state.workflow.foldersMap.filter(i => i.parent == this.item.parent).map(i => {
                if(i.name == this.name){
                    check = true
                }
            })
            return check
        },
        cancel(){
            this.name = ''
            this.type = ''
            this.$emit('update:renameItem', false)
        },
        editName(v){
            this.name = v
        },
        createShortName(str){
            if(this.item.type == 'folder'){
                return str
            }
            else{
                str = str.split('.')
                let type = str.splice(-1, 1)[0]
                if(!this.type){
                    this.type = type
                }
                return str.join('.')
            }
            return ''
        },
        rename(){
            if(this.item.type == 'folder'){
                if(!this.item.group){
                    let list = this.$store.state.workflow.foldersMap
                    let folder = list.find(i => i.id == this.item.id)
                    this.$store.dispatch('workflow/addFolder', {
                        id: this.item.id,
                        parent: folder.parent || this.item.id,
                        name: this.name,
                        order: folder.order
                    })
                    .then(res => {
                        list = list.map(i => i.id == this.item.id ? {...i, name: res.name} : i)
                        this.$store.commit('workflow/setFoldersMap', list)
                    })
                }
                else{
                    let group = this.$store.state.workflow.foldersMap.find(i => i.id == this.item.id)
                    let body = {
                        name: group.name,
                        order: group.order,
                        created_at: group.created_at,
                        created_by: group.created_by,
                        updated_at: group.updated_at,
                        updated_by: group.updated_by,
                        folders: group.folders || null
                    }
                    this.$store.dispatch('workflow/removeGroup', body)
                    body = {
                        name: this.name,
                        order: group.order,
                        folders: group.folders || null
                    }

                    this.$store.dispatch('workflow/addGroup', body)
                    .then(() => {
                        return this.$store.dispatch('workflow/getFolders')
                    })
                    .then(res => {
                        return new Promise((resolve) => {
                            resolve(this.$store.dispatch('workflow/createFoldersMap'))
                        })
                    })
                }
            }
            else{
                let file = this.$store.state.workflow.listDocs.find(i => i.id == this.item.id)
                this.$store.dispatch('workflow/addDoc', {
                    id: this.item.id,
                    name: this.name + '.' + this.type,
                    order: file.order,
                    folder: file.folder
                })
                .then(res => {
                    this.$store.dispatch('workflow/updateDocInState', {
                        ...res,
                        name_short: this.createShortName(res.name)
                    })
                })
            }
            this.cancel()
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.rename()
            }
        }
    }
}
</script>
