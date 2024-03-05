<template>
    <v-dialog
        :value="uploadF"
        scrollable
        max-width="800px"
        @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-0 pl-4 m-modal--title">Загрузить файл
                <v-spacer></v-spacer>
                <div
                    :class="{limit: limit.status}"
                    class="m-card-title--desc">{{bytesToSize(totalSize)}} / 2Mb

                    <v-tooltip top right color="#fff" max-width="250px" content-class="m-tooltip--info">
                        <template v-slot:activator="{ on }">
                            <v-icon
                                size="20"
                                v-on="on"
                                class="mr-1 m-info--file"
                                color="#0070e0">mdi-information-outline
                            </v-icon>
                        </template>
                        <template v-slot:default>
                            <span class="">Максимальный размер файла 2 Мб</span>
                        </template>
                    </v-tooltip>
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
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
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
                        v-show="!file"
                        >Перетащите сюда файл для загрузки</div>
                    <div
                        class="list"
                        v-show="file"
                    >
                        <div
                            class="item"
                        >
                        <!--
                            <div
                                @click.prevent.stop="removeFile()"
                                class="close">
                                <v-icon
                                    size="20"
                                    left>close</v-icon>
                            </div>
                        -->
                            <v-icon
                                size="80"
                                left>imw-upload</v-icon>
                            {{fileName}}
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
                    @change="onChange">
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    @click="inputFiles">Выбрать файл</v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    :disabled="!file"
                    @click="submit">Подтвердить</v-btn>
                <v-btn outlined color="#2c2c2c" class="m-btn m-btn-normal" @click="cancel">Отмена</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
    props: ['uploadF'],
    name: 'UploadFiles',
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
        }
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
        removeFile(){
            this.file = false
            this.totalSize = 0
        },
        removeFileAll(){
            this.items = []
            this.totalSize = 0
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
            if(i >= this.limit.unit && total > this.limit.value){
                this.limit.status = true
            }
            else{
                this.limit.status = false
            }

            return total + sizes[i]
        },
        onChange(e){
            this.dragging = false
            this.fileOver = false
            this.successMsg = ''
            this.errorMsg = ''
            this.formData = new FormData()
            let files = e.target.files || e.dataTransfer.files
            for(let x in files){
                if(!isNaN(x)){
                    let file = {
                        id: new Date().getTime(),
                        selected: false,
                        item: files[x]
                    }
                    this.file = files[x]
                    this.fileName = files[x].name
                    this.totalSize = files[x].size
                    //file.itemsNames[x] = files[x].name
                    this.formData.append('name', this.fileName)
                    this.formData.append('file', this.file)
                }
            }
        },
        cancel(){
            this.items = []
            this.totalSize = 0
            this.$emit('update:uploadF', false)
        },
        submit(){
            this.formData.append('project_id', null)
            this.formData.append('is_attachment', true)
            this.formData.append('uuid', uuidv4())

            this.$store.dispatch('common/setUploadNote', [{
                    name: this.formData.get('name'),
                    uuid: this.formData.get('uuid'),
                    action: 'upload',
                    pushin: true
                }]
            )
            .then(res => {
                return this.$store.dispatch('common/uploadFile', this.formData)
            })
            .then(res => {
                return this.$store.dispatch('common/getFile', res)
            })
            .then(res => {
                this.$emit('setAvatar', res)
                this.$store.dispatch('common/setUploadNote', [{
                        name: this.formData.get('name'),
                        uuid: this.formData.get('uuid'),
                        action: 'upload',
                        pushin: false
                    }]
                )
            })
            this.cancel()
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.submit()
            }
        }
    }
}
</script>
