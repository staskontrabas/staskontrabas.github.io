<template>
    <v-dialog
        :value="uploadF"
        scrollable
        max-width="800px"
        @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-0 pl-4 m-modal--title"> 
                
                Загрузить файлы

                <v-spacer></v-spacer>

                <div
                    :class="{limit: limit.status}"
                    class="m-card-title--desc"> 
                    
                    Размер файлов {{ bytesToSize(getTotalSize) ? bytesToSize(getTotalSize) : '0 Mb' }}
                    <!--  / {{checkSize}} -->

                    <!-- <v-tooltip v-if="checkSize != 2000" top right color="#fff" max-width="250px" content-class="m-tooltip--info">
                        <template v-slot:activator="{ on }">
                            <v-icon
                                size="20"
                                v-on="on"
                                class="mr-1 m-info--file"
                                color="#0070e0">mdi-information-outline
                            </v-icon>
                        </template>
                        <template v-slot:default>
                            <span class="">
                                Максимальный размер файлов 20 Мб, для того чтобы снять ограничения, перейдите на пакет «Профи»
                            </span>
                        </template>
                    </v-tooltip> -->
                </div>
                <v-divider
                  class="mx-0"
                  inset
                  vertical
                ></v-divider>
                <v-btn
                    text
                    icon
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">
                        close
                    </v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>

            <div style="border: 1px solid grey; display: flex; flex-direction: row;  margin: 16px 16px 0px 16px;">
                <el-button
                    outlined
                    style="width: 100%; margin: 0;"
                    @click="inputFiles">
                    <i class="el-icon-monitor" style="font-size: 16px;"></i>
                    С компьютера
                </el-button>
            </div>

            <v-card-text style="background-color: #fbfbfb; height: 650px;" class="pt-5 px-4">
                <v-layout
                    column
                    align-center
                    justify-center
                    class="m-drop-area"
                    :class="[{'m-dragging': dragging}, {over: !mouseOver}]"
                    @drop.stop.prevent="onChange"
                    @dragenter.stop.prevent="dragging = true"
                    @dragleave.stop.prevent="dragging = false"
                    @dragover.stop.prevent=""
                    @mouseenter.stop.prevent="mouseEnter"
                    @mouseleave.stop.prevent="mouseLeave"
                    >

                    <div
                        v-show="!items.length"
                        class="m-img--file-wrap"
                        >
                        <inline-svg :src="file_to_upload_icon" />
                    </div>

                    <div v-show="!items.length"> 
                        Перетащите сюда файлы для загрузки или выберите параметр выше
                    </div>

                    <div
                        class="list"
                        v-show="items.length"
                    >
                        <div
                            v-for="(i, j) in items"
                            :key="'file-' + j"
                            class="item"
                            :class="{selected: i.selected}"
                        >
                            <div
                                @click="removeFile(i)"
                                class="close">
                                <v-icon
                                    size="20"
                                    left>close</v-icon>
                            </div>
                            <v-icon
                                size="80"
                                left>imw-upload</v-icon>
                            {{i.item.name}}
                        </div>
                    </div>
                </v-layout>
            </v-card-text>

            <v-divider></v-divider>
            <v-card-actions class="pa-5 px-4">
                <input
                    type="file"
                    v-show="false"
                    ref="input-files"
                    id="items"
                    name="items[]"
                    required
                    multiple
                    @change="onChange">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    :disabled="!items.length || limit.status"
                    @click="submit"> 
                    Подтвердить 
                </v-btn>
                <v-btn outlined color="#2c2c2c" class="m-btn m-btn-normal" @click="cancel">
                    Отмена
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import { sortObj, checklicense } from '@/utils/services'
import InlineSvg from "vue-inline-svg"

export default {
    props: ['uploadF', 'project_id'],
    name: 'UploadFiles',
    components: {
        InlineSvg,
    },
    data () {
        return {
            dragging: false,
            mouseOver: false,
            items: [],
            file: false,
            fileName: '',
            itemsNames: [],
            itemsSizes: [],
            limit: {
                value: 20,
                unit: 2,
                status: false
            },
            totalSize: 0,
            formData: '',
            successMsg: '',
            errorMsg: '',
            file_format: ['.rvt', '.stp', '.iges', '.stl', '.pdf', '.ifc', '.zip', '.ply', '.dae', '.fbx', '.skp', '.obj', '.nwd', '.3ds', '.dwg', '.dxf', '.pln', '.bd1', '.max', '.rfa', '.ifcxml'],
            file_to_upload_icon: require(`@/assets/icons/file_to_upload.svg`),
        }
        
    },
    computed: {
        isSelected(){
            let list = this.items.filter(i => i.selected)
            return list.length
        },
        getTotalSize(){
            let size = 0
            this.items.map(i => {
                size += i.item.size
            })
            return size
        },
        // checkSize(){
        //     return checklicense('size2000') ? 2000 : 20
        // }
    },
    watch: {
        uploadF(v){
            if(v){
                document.addEventListener('keyup', this.enter, false)
            }
            else{
                document.removeEventListener('keyup', this.enter, false)
            }
        }
    },
    methods: {
        removeFile(item){
            this.items = this.items.filter(i => i.id != item.id)
            let total = 0
            this.items.map(i => {
                total += i.item.size
            })
            this.totalSize = total
        },
        removeFileAll(){
            this.items = []
            this.totalSize = 0
        },
        fileSelected(item){
            this.items = this.items.map(i => i.id == item.id ? {...i, selected: !i.selected} : i)
        },
        inputFiles(){
            this.$refs['input-files'].click()
        },
        mouseEnter(e){
            this.mouseOver = true
        },
        mouseLeave(){
            this.mouseOver = false
        },
        bytesToSize(bytes){
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
            if(bytes === 0){
                this.limit.status = false
                return 0
            }

            let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
            if(i === 0){
                this.limit.status = false
                return bytes + ' ' + sizes[i]
            }

            let total = (bytes / Math.pow(1024, i)).toFixed(2)
            // TODO: отключено ограничение по размеру по требованию Тараса 01.11.23
            // let limitValue = this.checkSize
            // if(i >= this.limit.unit && total > limitValue){
            //     this.limit.status = true
            // }
            // else{
                this.limit.status = false
            // }

            return total + sizes[i]
        },
        onChange(e){
            this.dragging = false
            this.fileOver = false
            this.successMsg = ''
            this.errorMsg = ''
            let files = e.target.files || e.dataTransfer.files
            for(let x in files){
                if(!isNaN(x)){
                    let file = {
                        id: new Date().getTime(),
                        selected: false,
                        item: files[x]
                    }
                    if(!this.items.some(s => s.item.name == files[x].name)){
                        this.items = [...this.items, file]
                    }
                }
            }
        },
        cancel(){
            this.items = []
            this.totalSize = 0
            this.$refs['input-files'].value = ''
            this.$emit('update:uploadF', false)
        },
        getMetaTag(meta){
            meta = meta != '' ? JSON.parse(meta) : {}
            return meta
        },
        setMetaTag(o, meta = {}){
            meta = {...meta, ...o}
            meta = JSON.stringify(meta)
            return meta
        },
        submit(){
            let state = this.$store.state.workflow
            let currentF = state.currentFolder
            let listPromises = []
            let filesList = []
            let docID = []
            let formDataList = []

            let folder = null
            if(currentF){
                folder = state.foldersMap.filter(i => i.id == currentF)[0] || null
                if(folder && !folder.group){
                    filesList = folder.files ? folder.files.filter(i => !i.is_deleted) : []
                    filesList = sortObj(filesList, 'order')
                    formDataList = this.items.map(i => {
                        let formData = new FormData()
                        formData.append('file', i.item)
                        formData.append('name', i.item.name)
                        formData.append('project_id', this.project_id)
                        formData.append('is_attachment', true)
                        formData.append('uuid', uuidv4())
                        return formData
                    })
                }
            }

            let uploadNoteList = []
            this.$store.dispatch('common/setUploadNote', formDataList.map(d => {
                return {
                    name: d.get('name'),
                    uuid: d.get('uuid'),
                    action: 'upload',
                    pushin: true
                }
            }))
            .then(() => {
                formDataList.map(d => {
                    listPromises.push(this.$store.dispatch('common/uploadFile', d))
                })
                return Promise.all(listPromises)
            })
            .then(files => {
                let list = []
                files
                .filter(f => !f.error)
                .map((i, j) => {
                    uploadNoteList.push({
                        name: i.name,
                        uuid: i.uuid,
                        action: 'upload',
                        pushin: false
                    })
                    let update = filesList.filter(s => s.name == i.name)
                    if(update.length){
                        filesList = filesList.filter(s => s.name != i.name)
                        list.push(this.$store.dispatch('workflow/addDoc', {
                            id: update[0].id,
                            name: i.name,
                            order: j,
                            folder: folder.id || null,
                            version: null,
                            files: [{
                                url: i.id,
                                size: i.size,
                                created_at: i.created_at,
                                created_by: i.created_by
                            }]
                        }))
                    }
                    else{
                        list.push(this.$store.dispatch('workflow/addDoc', {
                            id: uuidv4(),
                            name: i.name,
                            order: j,
                            folder: folder.id || null,
                            files: [{
                                url: i.id,
                                size: i.size,
                                created_at: i.created_at,
                                created_by: i.created_by
                            }]
                        }))
                    }
                })

                return Promise.all(list)
            })
            .then(() => {
                this.$store.dispatch('workflow/getFolders')
                .then(() => {
                    this.$store.dispatch('workflow/createFoldersMap')
                    this.$store.dispatch('common/setUploadNote', uploadNoteList)
                })
                this.$emit('get_access')
            })
            this.cancel()
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                if(!this.items.length || this.limit.status){
                    return
                }
                this.submit()
            }
        }
    }
}
</script>
