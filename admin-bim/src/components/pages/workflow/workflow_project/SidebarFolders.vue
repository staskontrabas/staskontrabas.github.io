<template>
    <div class="side-folder-wrapper">
        <el-tree
            ref="tree"
            :key="treekey"
            :expand-on-click-node="false"
            :data="folderslist"
            node-key="id"
            highlight-current
            :current-node-key="selectednode"
            :default-expand-all="true"
            :default-expanded-keys="expandedlist"
            :auto-expand-parent="true"
            empty-text="Нет данных"
            @node-expand="expand"
            @node-collapse="expand"
            @current-change="nodeSelected">

            <template slot-scope="{ node, data }">
                <!-- В data находится объект верхнего уровня, в котором содержатся объекты foldersList -->
                <div class="eltree-node-wrapper">
                    <div class="eltree-node-textarea">
                        <inline-svg min-width="24" min-height="24" :src="folderIcon" style="min-height:24px; min-width:24px;"/>
                        <el-tooltip effect="dark" :content="node.label" :disabled="!needs_tooltip" placement="right">
                            <span ref="eltree-node-spans" class="eltree-node-span" @mouseover="checkIfNeedsTooltip">
                                {{ node.label }}
                            </span>
                        </el-tooltip>
                    </div>
                    <div class="eltree-menu-wrapper">
                        <edit-menu
                            :node="node.data"
                            :editNode.sync="editNode"
                            :creatingBranchId.sync="creatingBranchId"
                            :isFile.sync="isFile"
                            :nodelevel="data.nodelevel"
                            :current_permissions="current_permissions"
                            @newFolderAction="newFolderAction"
                            @uploadFolderAction="uploadFolderAction"
                            @editFolderAction="editFolderAction"
                            @removeFolderAction="removeFolderAction"
                            @accessFolderAction="accessFolderAction"
                            @shareFolderAction="shareFolderAction"
                        />
                    </div>
                </div>
            </template>
        </el-tree>

        <create-group
            :newGroup.sync="newGroup"
            @createGroup="createGroup"
            />
        <create-folder
            :newFolder.sync="newFolder"
            @createFolder="createFolder"
            />
        <edit-folder
            :editFolder.sync="editFolder"
            :node="editNode"
            @renameNode="renameNode"
            />
        <remove-folder
            :removeFolderFlag.sync="removeFolderFlag"
            :node="editNode"
            @removeNode="removeNode"
            />
    </div>
</template>

<script>
import SlVueTree from 'sl-vue-tree'
import { service} from '@/utils/services'
import { v4 as uuidv4 } from 'uuid'

import CreateMenu from './CreateMenu'
import CreateGroup from './CreateGroup'
import CreateFolder from './CreateFolder'
import EditMenu from './EditMenu'
import EditFolder from './EditFolder'
import RemoveFolder from './RemoveFolder'
import EditMain from './EditMain'
import InlineSvg from "vue-inline-svg"
import tooltip from "@/components/core/tooltip"
// import { set } from 'vue/types/umd'

    export default {
        name: 'SidebarFolders',
        components: {
            SlVueTree,
            CreateMenu,
            CreateGroup,
            CreateFolder,
            EditMenu,
            EditFolder,
            RemoveFolder,
            EditMain,
            InlineSvg,
            tooltip,
        },
        props: ['current_permissions',],
        data () {
            return {

                items: [
                    { title: 'Click Me' },
                    { title: 'Click Me' },
                    { title: 'Click Me' },
                    { title: 'Click Me 2' },
                ],


                folderActive: null,

                folderIcon: require(`@/assets/icons/file-icon.svg`),

                treekey: 0,

                search: '',
                editNode: 0,

                creatingBranchId: false,
                isFile: {
                    parent: 0,
                    file: false,
                    group: false,
                    lvl: 0
                },
                newGroup: false,
                newFolder: false,
                editFolder: null,
                removeFolderFlag: false,
                accessrights: false,

                curentNodeId: '',
                stackTree: [],

                needs_tooltip: false,
            }
        },
        watch: {
            '$store.state.workflow.currentFolder'() {
                // console.log('changing', this.$store.state.workflow)
                this.treekey = this.treekey + 1 // пересоздает элемент и переписывается default expanded keys
            },
        },
        computed: {
            folderslist() {
                let map = this.$store.state.workflow.foldersMap
                let curF = this.$store.state.workflow.currentFolder
                let tree = service.createTreeForSidebar(map, curF)
                makeLabels(tree,0)

                // не нашел способа заставить el-tree читать вложенные ниже первого уровня поля, хотя default-props позволяет переназначать стандартные
                function makeLabels(arr,lvl) {
                    for (let elem of arr) {
                        elem.label = elem.title
                        elem.id = elem.data.id
                        elem.nodelevel = lvl
                        if (elem.children) {
                            makeLabels(elem.children,lvl+1)
                        }
                    }
                }
                return tree
            },
            expandedlist() {
                let list = []

                getExpandedFromTree(this.folderslist, list)

                function getExpandedFromTree(array,list) {
                    for (const elem of array) {
                        if (elem.isExpanded) {
                            list.push(elem.data.id)
                        }
                        if (elem.children) {
                            getExpandedFromTree(elem.children, list)
                        }
                    }
                }

                return list
            },
            selectednode(){
                // console.log('curfol', this.$store.state.workflow.currentFolder)
                return this.$store.state.workflow.currentFolder
            }
        },
        methods: {
            expand() {
                // процедура собирает плоский список id развернутых элементов ['id1',...] из expanded и отдает его в workflow/setExpanded
                // console.log('expand, args', arguments)
                // let list = this.getNodes()
                this.$nextTick(() => {
                    let tree = this.$refs.tree
                    let node_list = Object.values(tree.store.nodesMap)
                    // console.log('nl',node_list)
                    node_list = node_list.filter(obj => obj.expanded)
                    node_list = node_list.map(obj => obj.data.id)
                    this.$store.dispatch('workflow/setExpanded', node_list)
                })
            },
            nodeSelected(n){
                // отображает контент ноды в просмотрщике, выделяя текущую папку
                if(n){
                    let el = n
                    this.folderActive = el

                    // КОСТЫЛЬ, УБРАТЬ ТРУ
                    if(true){
                        this.$router.push({
                            name: 'workflow-project',
                            params: {
                                id: this.$route.params.id,
                                path: el.data.id
                            }
                        })
                        this.$store.commit('workflow/setCurrentFolder', el.data.id)
                    }
                }
            },
        renameNode(v){
            let currentF = JSON.parse(JSON.stringify(this.folderActive))

            let currentFolderId = ''
            let listPromises = []
            let body = {}
            if(!currentF.data.group){
                body = {
                    id: currentF.data.id,
                    name: v,
                    parent: currentF.data.parent == currentF.data.toGroup ? currentF.data.id : currentF.data.parent,
                    order: currentF.data.order
                }
                currentFolderId = currentF.data.id
                listPromises.push(this.$store.dispatch('workflow/addFolder', body))
            }
            else{
                let group = this.$store.state.workflow.foldersMap.filter(i => i.id == currentF.data.id)[0]
                body = {
                    name: group.name,
                    order: currentF.data.order,
                    created_at: group.created_at,
                    created_by: group.created_by,
                    updated_at: group.updated_at,
                    updated_by: group.updated_by,
                    folders: currentF.data.list || null
                }
                listPromises.push(this.$store.dispatch('workflow/removeGroup', body))
                body = {
                    name: v,
                    order: currentF.data.order,
                    folders: currentF.data.list || null
                }
                currentFolderId = 'group_' + v
                listPromises.push(this.$store.dispatch('workflow/addGroup', body))
            }

            Promise.all(listPromises)
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(res => {
                return new Promise((resolve) => {
                    resolve(this.$store.dispatch('workflow/createFoldersMap'))
                })
            })
            .then(() => {
                this.$store.commit('workflow/setCurrentFolder', currentFolderId)
            })
        },
        removeFolderAction(v){
            this.removeFolderFlag = v
        },
        editFolderAction(v){
            this.editFolder = v
        },
        newFolderAction(v){
            this.newFolder = v
        },
        uploadFolderAction(v){
            this.$emit('upload_folder_action', this.editNode) 
        },
        accessFolderAction(v){
            Promise.resolve(
                this.editNode = {
                    ...this.editNode,
                    id: this.editNode.data.id,
                    type: 'folder',
                    name: this.editNode.title
                }
            )
            .then(() => {
                this.$emit('access_folder_action', this.editNode) 
            })
        },
        shareFolderAction(v) {
            this.$emit('share_folder_action', this.editNode) 
        },
        removeNode(){
            let currentF = JSON.parse(JSON.stringify(this.folderActive))
            let listPromises = []
            listPromises.push(this.$store.commit('workflow/setCurrentFolder', currentF.data.parent))

            if(!!currentF.data.group){
                let group = this.$store.state.workflow.foldersMap.filter(i => i.id == currentF.data.id)[0]
                let list = group.folders || []
                list.map((f, i) => {
                    listPromises.push(this.$store.dispatch('workflow/removeFolder', {uuid: f.folder}))
                })
                let g_model = {
                    name: group.name,
                    order: group.order,
                    created_at: group.created_at,
                    created_by: group.created_by,
                    updated_at: group.updated_at,
                    updated_by: group.updated_by,
                    folders: group.folders
                }
                group = g_model

                listPromises.push(this.$store.dispatch('workflow/removeGroup', group))
            }
            else{
                listPromises.push(this.$store.dispatch('workflow/removeFolder', {uuid: currentF.data.id}))
            }

            Promise.all(listPromises)
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(res => {
                return this.$store.dispatch('workflow/createFoldersMap')
            })
            .then(() => {
                let parent = currentF.data.parent
                this.$store.commit('workflow/setCurrentFolder', 0)
                this.$store.commit('workflow/setCurrentFolder', parent)
            })
        },
        createGroup(v){
            let list = this.$store.state.workflow.foldersMap.filter(i => !!i.group)
            let group = {
                name: this.checkTween(list, v.name),
                order: list.length
            }

            this.$store.dispatch('workflow/addGroup', group)
            .then(res => {
                this.$store.dispatch('workflow/createFoldersMap')
            })
        },

        createFolder(v){
            let currentF = JSON.parse(JSON.stringify(this.editNode)) || 0
            let parent = currentF ? currentF.data.id : 0
            let list = this.$store.state.workflow.foldersMap.filter(i => i.parent == parent && !i.group)

            let id = uuidv4()
            let folder = {
                id: id,
                parent: currentF ? currentF.data.group ? id : currentF.data.id : id,
                name: this.checkTween(list, v.name),
                order: list.length
            }

            let group = false
            if(currentF && currentF.data.group){
                group = this.$store.state.workflow.foldersMap.filter(i => i.id == currentF.data.id)[0]

                let g_model = {
                    name: group.name,
                    order: group.order,
                    created_at: group.created_at,
                    created_by: group.created_by,
                    updated_at: group.updated_at,
                    updated_by: group.updated_by,
                    folders: group.folders || []
                }
                group = g_model
            }

            this.$store.dispatch('workflow/addFolder', folder)
            .then(() => {
                return this.$store.dispatch('workflow/getFolders')
            })
            .then(res => {
                return this.$store.dispatch('workflow/createFoldersMap')
            })
        },
        checkTween(ar, v){
            let name = v
            ar.map(i => {
                if(i.name == name){
                    name += '0'
                }
            })
            return name
        },
            traverseTree(ar, list = [], map = [], parent = ''){
                ar.map(i => {
                    let path = parent + '/' + i.title
                    list.push(path)
                    map.push({
                        id: i.data.id,
                        prevPath: i.data.path,
                        nextPath: path
                    })
                    if(i.children.length){
                        this.traverseTree(i.children, list, map, path)
                    }
                })
                return {list, map}
            },
            getGroupsFoldersFromTree(){
                let currentF = JSON.parse(JSON.stringify(this.folderActive))
                let tree = this.$store.state.workflow.folderTree
                let groups = tree.filter(i => i.data.group)
                let folders = []
                let map = []

                let groupList = groups.map(i => {
                    folders = [...folders, ...i.children]
                    let traverse = this.traverseTree(i.children)
                    let group = {
                        group: i.title,
                        folders: traverse.list
                    }
                    map.push({
                        id: i.data.id,
                        prevPath: i.data.path,
                        nextPath: i.data.path
                    })
                    map = [...map, ...traverse.map]
                    return group
                })
                let dontGroupList = tree.filter(i => !i.data.group)
                folders = [...folders, ...dontGroupList]
                let traverse = this.traverseTree(folders)
                let folderList = traverse.list
                map = [...map, ...traverse.map]

                let selectF = '/'
                map.map(i => {
                    if(i.id == currentF.data.id){
                        selectF = i.nextPath
                    }
                })

                Promise.all([
                    this.$store.dispatch('workflow/updateFolders', {
                        paths: folderList,
                        //parent: selectF
                    }),
                    this.$store.dispatch('workflow/updateGroups', groupList)
                ])
                .finally(() => {
                    this.$store.dispatch('workflow/createTree')
                })
            },
            getNodes(){
                // получает список нод (в устаревшем формате)
                let list = []
                const nodeTree = this.$refs.tree
                // console.log('nodeTree',nodeTree)
                list = traverseNodes(nodeTree.children, list)

                function traverseNodes(tree, list) {
                    for (const node of tree) {
                        let blank = {}
                        for (const prop of Object.keys(node)) {
                            if (prop !== 'children') {
                                blank[prop] = node[prop]
                            }
                            blank.children = traverseNodes(node.children,[])
                        }
                        list.push(blank)
                    }
                    return list
                }
                // console.log('getNodes', list)
                return list
            },
            checkIfNeedsTooltip(arg) {
                let target = arg.target
                if (target.offsetWidth < target.scrollWidth) {
                    this.needs_tooltip = true
                    return true
                }
                this.needs_tooltip = false
                return false
            },
        },
        mounted(){
        },
        beforeUpdate() {
            let nodekey = this.$store.state.workflow.currentFolder // Эта черная магия для чего-то нужна, но я забыл, зачем
            this.$refs.tree.setCurrentKey(nodekey)
            this.treekey++
        },
        updated() {
        },
        beforeDestroy(){
        }
    }
</script>


<style lang="scss" scoped>

.side-folder-wrapper {
    flex: 1 0;
    overflow-y: auto;
    overflow-x: hidden;
}


</style>
