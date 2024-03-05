<template>
    <v-dialog :value="copyItem" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">Копировать
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
            <div class="py-2 px-4 m-card--subtitle">Копировать в</div>
            <div class="py-0 px-4 m-card--subtitle m-card--text-blue">{{pathName}}</div>
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    :disabled="!checkFolder"
                    @click="copy">Копировать</v-btn>
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
import { v4 as uuidv4 } from 'uuid'

export default {
    props: ['copyItem', 'items', 'selected'],
    name: 'CopyItem',
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

            let check = true

            return check
        }
    },
    watch: {
        copyItem(v){
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
            this.$emit('update:copyItem', false)
        },
        newDoc(s, state, folder, countFiles){
            let doc = state.listDocs.find(d => d.id == s.id)
            let name = s.name
            if(doc.folder == folder.id){
                let listDocs = state.listDocs.filter(d => d.folder == s.folder)
                let filename = this.createShortName(s.name)
                name = this.createCopyNameFile(filename.name, listDocs) + '.' + filename.type
            }
            return {
                id: uuidv4(),
                name: name,
                order: countFiles === false ? doc.order : countFiles++,
                folder: folder.id,
                files: doc.files
            }
        },
        newFolder(s, state, folderIn, countFolders){
            let folder = state.foldersMap.find(f => f.id == s.id)
            let listFiles = []
            let listFolders = []
            let listFolderIn = state.foldersMap.filter(f => f.parent == (folderIn.parent || 0))
            let id = uuidv4()
            let root = {
                id: id,
                parent: folderIn
                            ? folderIn.group
                                ? id
                                : folderIn.id
                            : id,
                name: this.createCopyName(folder.name, listFolderIn),
                order: countFolders === false ? folder.order : countFolders++
            }
            let toGroup = []
            if(folderIn && folderIn.group){
                toGroup = [{folder: id, order: root.order}]
            }

            listFolders.push(root)
            if(folder.files){
                folder.files.map(i => {
                    listFiles.push(this.newDoc(i, state, root, false))
                })
            }
            if(folder.folders){
                folder.folders.map(i => {
                    let res = this.newFolder(i, state, root, false)
                    listFiles = [...listFiles, ...res.listFiles]
                    listFolders = [...listFolders, ...res.listFolders]
                })
            }

            return {
                listFiles: listFiles,
                listFolders: listFolders,
                toGroup: toGroup
            }
        },
        createShortName(str){
            str = str.split('.')
            let type = str.splice(-1, 1)[0]
            return {
                name: str.join('.'),
                type: type
            }
        },
        createCopyNameFile(name, list, count = 1){
            let suf = ' копия ' + count
            let newName = name
            if(list.some(i => this.createShortName(i.name).name == name + suf)){
                newName = this.createCopyName(name, list, count + 1)
            }
            else{
                newName = name + suf
            }
            return newName
        },
        createCopyName(name, list, count = 1){
            let suf = ' копия ' + count
            let newName = name
            if(list.some(i => i.name == name + suf)){
                newName = this.createCopyName(name, list, count + 1)
            }
            else{
                newName = name + suf
            }
            return newName
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.copy()
            }
        },
        copy(){
            let listPromisesFolders = []
            let listPromisesFiles = []
            let listPromisesGroups = []
            let state = this.$store.state.workflow
            let folderIn = state.foldersMap.find(f => f.id == this.selectedNode.id)
            let countFiles = folderIn
                                ? folderIn.files
                                    ? folderIn.files.length
                                    : 0
                                : 0
            let countFolders = folderIn
                                ? folderIn.folders
                                    ? folderIn.folders.length
                                    : 0
                                : state.foldersMap.filter(f => f.id == f.parent && !f.toGroup).length
            let countGroups = state.foldersMap.filter(g => g.group !== false).length

            let groupFolders = []

            this.selected.items.map(s => {
                if(s.type !== 'folder'){
                    if(this.selectedNode && !this.selectedNode.group){
                        listPromisesFiles = [...listPromisesFiles, this.newDoc(s, state, this.selectedNode, countFiles)]
                    }
                }
                else if(s.type === 'folder' && !s.group){
                    let res = this.newFolder(s, state, this.selectedNode || 0, countFolders)
                    res.listFiles.map(i => {
                        listPromisesFiles = [...listPromisesFiles, i]
                    })
                    res.listFolders.map(i => {
                        listPromisesFolders = [...listPromisesFolders, i]
                    })
                    groupFolders = [...groupFolders, ...res.toGroup]
                }
                else{
                    if(!this.selectedNode){
                        let listGroups = state.foldersMap.filter(g => g.group !== false)
                        let group = state.foldersMap.find(g => g.id === s.id)
                        let groupName = this.createCopyName(s.name, listGroups)
                        let listFoldersInGroup = []

                        if(group.folders){
                            group.folders.map(f => {
                                let folder = state.foldersMap.find(i => i.id === f.folder)
                                let res = this.newFolder(folder, state, 0, false)
                                res.listFiles.map(i => {
                                    listPromisesFiles = [...listPromisesFiles, i]
                                })
                                res.listFolders.map(i => {
                                    if(i.id == i.parent){
                                        listFoldersInGroup = [...listFoldersInGroup, {
                                            folder: i.id,
                                            order: i.order
                                        }]
                                    }
                                    listPromisesFolders = [...listPromisesFolders, i]
                                })
                            })
                        }

                        listPromisesGroups = [...listPromisesGroups, {
                            name: groupName,
                            order: countGroups++,
                            folders: listFoldersInGroup.length ? listFoldersInGroup : null
                        }]
                    }
                }
            })

            if(this.selectedNode && this.selectedNode.group){
                let list = this.selectedNode.folders || []
                listPromisesGroups = [...listPromisesGroups, {
                    name: this.selectedNode.name,
                    order: this.selectedNode.order,
                    folders: [...list, ...groupFolders]
                }]
            }

            listPromisesFolders = listPromisesFolders.map(i => {
                return this.$store.dispatch('workflow/addFolder', i)
            })
            Promise.all(listPromisesFolders)
            .then(() => {
                listPromisesFiles = listPromisesFiles.map(i => {
                    return this.$store.dispatch('workflow/addDoc', i)
                })
                return Promise.all(listPromisesFiles)
            })
            .then(() => {
                listPromisesGroups = listPromisesGroups.map(i => {
                    return this.$store.dispatch('workflow/addGroup', i)
                })
                return Promise.all(listPromisesGroups)
            })
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
