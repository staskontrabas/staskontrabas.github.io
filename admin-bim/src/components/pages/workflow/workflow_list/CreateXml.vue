<template>
<v-dialog :value="create_xml" scrollable max-width="700px" @input="v => v || cancel()">
    <v-card>
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Создать xml файл проекта
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

        <v-card-text class="px-4" style="background-color: #fbfbfb;">
            <div class="py-4">Структура проектной документации</div>
            <div class="m-custom--card">
                <div class="m-custom--list__item">
                    {{getProjectName}}
                </div>
                <v-divider></v-divider>
                <v-treeview
                    dense
                    selectable
                    hoverable
                    transition
                    item-key="id"
                    selected-color="primary"
                    expand-icon="mdi-chevron-down"
                    return-object
                    :items="getItems"
                    v-model="selected"

                >
                    <template slot="label" slot-scope="{ item }">
                        <div class="v-treeview-node__label">
                            {{item.name}}

                            <v-tooltip
                                v-if="item.error === -1"
                                top
                                right
                                color="#fff"
                                max-width="250px"
                                content-class="m-tooltip--info">
                                <template v-slot:activator="{ on }">
                                    <v-icon
                                        size="20"
                                        v-on="on"
                                        class="mr-1 m-info--file"
                                        color="#ff0000">mdi-alert-outline
                                    </v-icon>
                                </template>
                                <template v-slot:default>
                                    <span class="">Согласно Постановлению Правительства № 1431 от 15 сентября 2020 года, трехмерная Информационная Модель проекта должна быть предоставлена в xml-схеме. Для это нужно конвертировать исходный файл Информационная Модель.</span>
                                </template>
                            </v-tooltip>
                        </div>
                    </template>
                </v-treeview>
            </div>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-spacer></v-spacer>
            <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="cancel">Отмена</v-btn>
            <v-btn outlined color="primary" class="m-btn" @click="sendXml">Создать
            </v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>
</template>

<script>
import { http, api } from '@/utils/define'
import { v4 as uuidv4 } from 'uuid'
export default {
    name: 'CreateXml',
    props: ['create_xml', 'item'],
    data(){
        return {
            getProjectName: '',
            selected: [],
            items: [],
            extensions: ['rvt', 'ifc', 'pdf']
        }
    },
    computed: {
        getItems(){
            const transTree = (tree) => {
                return tree.map(tre => {
                    if(tre.type == 'file'){
                        if(tre.tags && tre.tags.hasOwnProperty('ifcxml.zip')){
                            tre.error = tre.tags['ifcxml.zip']
                        }
                    }
                    else{
                        tre.children = transTree(tre.children)
                    }
                    return tre
                }).filter(f => f.sts != 2)
            }
            let list = transTree(this.items)
            return list
        }
    },
    watch: {
        create_xml(v){
            if(v){
                document.addEventListener('keyup', this.enter, false)
                this.getProjectName = this.item.info.name
                this.setItems(this.item)
            }
            else{
                document.removeEventListener('keyup', this.enter, false)
                this.items = []
                this.getProjectName = ''
            }
        }
    },
    methods: {
        cancel(){
            this.$emit('update:create_xml', false)
        },
        setItems(project){
             Promise.all([
                this.$store.commit('workflow/setActiveProject', project),
                this.$store.dispatch('workflow/getFolders')
            ])
            .then(() => {
                this.items = this.createTree(this.$store.state.workflow.folders)
            })
        },
        createTree(folders, path = []){
            let list = []
            if(folders){
                folders.map(fol => {
                    list.push({
                        ...fol,
                        sts: 1,
                        tags: null,
                        type: 'folder',
                        error: null,
                        children: [
                            ...this.createTree(fol.folders, [...path, fol.name]),
                            ...this.getFiles(fol.files, [...path, fol.name])
                        ]
                    })
                })
            }
            return list
        },
        getFiles(files, path){
            let list = []
            if(files){
                list = files.map(f => {
                    return this.checkFile(f)
                })
                .filter(f => f != null)
                .map(m => {
                    return {
                        ...m,
                        path: path.join('/') + '/'
                    }
                })
            }
            return list
        },
        checkFile(f){
            let file = null
            let type = f.name.split('.').splice(-1, 1)[0] || null
            if(this.extensions.some(s => s == type) && f.consolidations == null){
                file = {
                    ...f,
                    type: 'file',
                    sts: 1,
                    tags: null,
                    error: null
                }
            }
            file = this.getTags(file, type)
            this.selected.push(file)
            return file
        },
        getTags(file, type){
            if(type != 'pdf' && file != null){
                file.sts = null
                let token = this.$store.state.auth.access_token
                file.socket = new WebSocket(http['socket_files']
                        + api['socket_files']
                        + file.files[0].url
                )
                file.socket.onmessage = (e) => {
                    let response = JSON.parse(e.data)
                    this.items = this.transTree(this.items, file, response.sts, response.tags)
                }
                file.socket.onopen = function(e){
                    file.socket.send(token)
                }
            }
            return file
        },
        transTree(list, file, sts, tags){
            list = list.map(l => {
                if(l.type == 'folder'){
                    l.children = this.transTree(l.children, file, sts, tags)
                }
                else{
                    if(l.id == file.id){
                        l.sts = sts
                        l.tags = tags
                    }
                }
                return l
            })
            return list
        },
        sendXml(){
            let item = JSON.parse(JSON.stringify(this.item))
            this.cancel()
            let body = {
                project_id: item.id,
                folders: (() => {
                    let map = {}
                    this.selected.map(s => {
                        let tags = ''
                        let type = s.name.split('.').splice(-1, 1)[0] || null
                        if(type == 'rvt'){
                            if(s.tags && s.tags['ifcxml.zip'] == 1){
                                tags = 'ifcxml.zip'
                            }
                        }
                        return {[s.path]: {id: [s.id], tags: tags}}
                    })
                    .map(i => {
                        Object.entries(i).map(([k, v]) => {
                            map[k] = map[k]
                                ? {...map[k], [v.id]: v.tags}
                                : {[v.id]: v.tags}
                        })
                    })
                    return map
                })()
            }
            let uuid = uuidv4()
            this.$store.dispatch('common/setUploadNote', [{
                    name: item.info.name,
                    uuid: uuid,
                    action: 'createxml',
                    pushin: true
            }])
            .then(() => {
                return this.$store.dispatch('workflow/createXml', body)
            })
            .then(task_id => {
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        this.$store.dispatch('workflow/checkCreateXml', task_id)
                        .then(res => {
                            if(res.sts != 0){
                                clearInterval(interval)
                                resolve(res)
                            }
                        })
                    }, 5000)
                })
            })
            .then(res => {
                this.$store.dispatch('common/setUploadNote', [{
                    uuid: uuid,
                    pushin: false
                },{
                    name: item.info.name + '.xml',
                    uuid: uuid = uuidv4(),
                    action: 'download',
                    pushin: true
                }])
                this.$store.dispatch('common/getFile', {
                    id: res.file_id,
                    uuid: uuid,
                    typeBlob: 'blob'
                })
                .then(res => {
                    this.$store.dispatch('common/setUploadNote', [{
                        uuid: uuid,
                        action: 'download',
                        pushin: false
                    }])
                    if(!res.error){
                        let a = document.createElement("a")
                        let objectURL = URL.createObjectURL(res.file)
                        a.href = objectURL
                        a.download = item.info.name + '.zip'
                        document.body.appendChild(a)
                        a.click()
                        URL.revokeObjectURL(objectURL)
                        a.remove()
                    }
                    else{
                        console.log('download xml error', err)
                    }
                })
                .catch(err => {
                    console.log('downloadFile xml', err)
                })
            })
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.sendXml()
            }
        }
    }
}
</script>
