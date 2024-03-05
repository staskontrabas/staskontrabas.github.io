<template>
    <v-dialog :value="replaceItem" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">Переместить
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
            <v-card-text style="height: 200px;" class="pt-4">
                <sl-vue-tree
                    ref="tree"
                    v-model="folderslist"
                    @select="selectNode">

                    <template slot="title" slot-scope="{ node }">
                        <span
                            v-if="node.level > 1"
                            class="level-gap" v-for="i in node.level - 1"
                            >
                        </span>
                        <span
                            class="leaf-icon pl-1"
                            :class="'level-' + node.level"
                            v-if="!node.data.group">
                            <v-icon size="18">imw-folder</v-icon>
                        </span>
                        <span
                            class="sl-vue-tree-title--name"
                            :class="[{'sl-group': node.data.group}, 'level-' + node.level]"
                            >
                            {{ node.title }}
                        </span>
                    </template>

                    <template
                        slot="toggle"
                        slot-scope="{ node }">
                        <span
                            v-if="node.data.group || (node.level != 3 && node.children.length)"
                            :class="[{expanded: node.isExpanded}, 'level-' + node.level]">
                            <v-icon size="18">mdi-chevron-down</v-icon>
                        </span>
                        <span
                            v-if="node.level == 2 && !node.children.length">
                        </span>
                    </template>

                </sl-vue-tree>
            </v-card-text>

            <v-divider></v-divider>

            <div class="py-1 px-4 m-card--subtitle">Выбранные папки или файлы:</div>

            <v-card-text class="pa-4 pt-1">
                <div
                    class="mb-1"
                    v-for="item in getSelected()"
                >
                    <v-icon
                        v-if="item.type == 'folder'"
                        size="18">imw-folder</v-icon>
                    <v-icon
                        v-else
                        size="18">ft-{{item.type == 'type' ? 'unknown' : item.type}}</v-icon>
                    <span class="m-card--filename">{{item.name}}</span>
                </div>
            </v-card-text>

            <v-divider></v-divider>
            <div class="py-2 px-4 m-card--subtitle">Текущая папка</div>
            <div class="py-0 px-4 m-card--subtitle m-card--text-blue">{{currentPath()}}</div>
            <div class="py-2 px-4 m-card--subtitle">Переместить в</div>
            <div class="py-0 px-4 m-card--subtitle m-card--text-blue">{{pathName}}</div>
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    :disabled="!checkFolder"
                    @click="replace">Переместить</v-btn>
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
import SlVueTree from 'sl-vue-tree'
import { service } from '@/utils/services'

export default {
    props: ['replaceItem', 'items', 'selected'],
    name: 'ReplaceItem',
    components: {
        SlVueTree
    },
    data(){
        return {
            folder: 0,
            path: '',
            pathName: '/',
            selectedNode: 0,
            done: false
        }
    },
    computed: {
        folderslist: {
            get(){
                let map = this.$store.state.workflow.foldersMap
                    .filter(f => (f.access >> 1) & 1)
                let tree = service.createTreeForSidebar(map, 0, 2, {
                            isDraggable: false,
                            isExpanded: false,
                            isSelected: false
                        })
                return tree
            },
            set(v){
            }
        },
        checkFolder(){
            let state = this.$store.state.workflow
            let currentF = state.currentFolder

            let check = false
            check = this.selectedNode
                ? currentF !== this.selectedNode.id
                : currentF !== this.selectedNode

            return check
        }
    },
    watch: {
        replaceItem(v){
            if(v){
                document.addEventListener('keyup', this.enter, false)
            }
            else{
                document.removeEventListener('keyup', this.enter, false)
            }
        }
    },
    methods: {
        selectNode(v){
            this.selectedNode = v[0].data

            let path = '/'
            this.pathName = path + this.searchPath(v[0].data.id).reverse().join('/')
        },
        currentPath(){
            let state = this.$store.state.workflow
            let currentF = state.currentFolder
            return '/' + this.searchPath(currentF).reverse().join('/')
        },
        searchPath(id){
            let map = this.$store.state.workflow.foldersMap
            let folder = map.filter(i => i.id == id)[0]
            folder = folder || false
            if(!folder){
                return []
            }
            let path = [folder.name]
            if(folder.parent){
                path.push(...this.searchPath(folder.parent))
            }
            return path
        },
        getSelected(){
            let list = this.selected.items
            return list
        },
        cancel(){
            this.path = ''
            this.folder = 0
            this.pathName = '/'
            this.selectedNode = 0
            this.$emit('clearSelected', this.done ? this.selected.type : false)
            this.done = false
            this.$emit('update:replaceItem', false)
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.replace()
            }
        },
        replace(){
            let state = this.$store.state.workflow
            let currentF = state.currentFolder
            let selectedNodeId = this.selectedNode ? this.selectedNode.id : 0
            let countFolders = state.foldersMap.filter(i => i.type === 'folder' && i.group === false && i.parent === selectedNodeId).length
            let countFiles = state.foldersMap.filter(i => i.id === selectedNodeId)
            if(countFiles.length){
                countFiles = countFiles[0].files
                    ? countFiles[0].files.length
                    : 0
            }
            let groupFolders = {
                in: {
                    name: '',
                    order: 0,
                    list: !!this.selectedNode.group
                        ? this.selectedNode.list
                            ? this.selectedNode.list
                            : []
                        : [],
                    length: !!this.selectedNode.group
                        ? this.selectedNode.list
                            ? this.selectedNode.list.length
                            : 0
                        : 0
                },
                out: {
                    id: 0,
                    name: '',
                    order: 0,
                    list: []
                }
            }

            let listPromises = []

            this.selected.items.map(i => {
                if(i.type == 'folder'){
                    if(!i.group){
                        let folder = state.foldersMap.filter(f => f.id == i.id)[0]
                        let body = {
                            id: i.id,
                            name: i.name,
                            parent: selectedNodeId
                                ? !!this.selectedNode.group
                                    ? i.id
                                    : selectedNodeId
                                : i.id,
                            order: countFolders++
                        }

                        listPromises.push(this.$store.dispatch('workflow/addFolder', body))

                        if(!!this.selectedNode.group){
                            let order = groupFolders.in.length
                            groupFolders.in.list.push({
                                folder: i.id,
                                order: order
                            })
                            groupFolders.in.length++
                        }

                        if(!!folder.toGroup){
                            let group = state.foldersMap.filter(g => g.id == folder.toGroup)
                            groupFolders.out.id = group[0].id
                            groupFolders.out.name = group[0].name
                            groupFolders.out.order = group[0].order
                            groupFolders.out.list.push({
                                folder: i.id
                            })
                        }
                    }
                }
                else{
                    if(!this.selectedNode.group && this.selectedNode){
                        listPromises.push(this.$store.dispatch('workflow/addDoc', {
                            id: i.id,
                            name: i.name,
                            order: countFiles++,
                            folder: selectedNodeId
                        }))
                    }
                }
            })

            if(groupFolders.out.list.length){
                let group = state.foldersMap.filter(g => g.id == groupFolders.out.id)
                let list = group[0].folders
                groupFolders.out.list.map(f => {
                    list = list.filter(l => l.folder != f.folder)
                })
                list = list.length ? list : null
                listPromises.push(this.$store.dispatch('workflow/addGroup', {
                    name: groupFolders.out.name,
                    order: groupFolders.out.order,
                    folders: list
                }))
            }

            if(!!this.selectedNode.group){
                let group = state.foldersMap.filter(g => g.id == this.selectedNode.id)
                listPromises.push(this.$store.dispatch('workflow/addGroup', {
                    name: group[0].name,
                    order: group[0].order,
                    folders: groupFolders.in.list.length ? groupFolders.in.list : null
                }))
            }

            Promise.all(listPromises)
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(res => {
                this.$store.dispatch('workflow/createFoldersMap')
            })
            .then(() => {
                this.done = true
                this.cancel()
            })
        }
    }
}
</script>
