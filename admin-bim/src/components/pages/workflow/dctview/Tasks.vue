<template>
    <div class="m-comment-box">
        <div class="m-comment-list">
            <div
                class="m-comment-list--items"
                ref="list-items">
                <v-row
                    dense
                    v-for="item in getList">
                    <v-col cols="12">
                        <v-card
                            color="#fff">
                            <div class="d-flex">
                                <v-card-title class="m-text--size16 m-text--color-4a5568 pb-0">
                                    {{item.name}}
                                </v-card-title>
                                <v-spacer />
                                <v-avatar
                                    class="ma-4 mb-0"
                                    size="30">
                                    <img
                                        :src="item.avatar"
                                    >
                                </v-avatar>
                            </div>
                            <v-card-subtitle class="pt-1">Название файла</v-card-subtitle>

                            <v-divider></v-divider>
                            <div class="py-0 px-4">
                                <v-img
                                    :src="item.src"
                                    height="200px"
                                ></v-img>
                            </div>

                            <v-divider></v-divider>
                            <v-card-actions class="py-3 pr-2 pl-0">
                                <div>
                                    <v-card-subtitle class="py-0">Создан    {{item.create_date}}
                                    </v-card-subtitle>
                                    <v-card-subtitle class="py-0">До
                                        {{item.deadline_date}}
                                    </v-card-subtitle>
                                </div>
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    color="primary"
                                    class="m-btn"
                                    @click="editTask(item)"
                                >
                                Редактировать
                                </v-btn>
                            </v-card-actions>

                        </v-card>
                    </v-col>
                </v-row>
            </div>
        </div>
        <div class="m-comment-header">
            <v-row dense>
                <v-col cols="12">
                    <v-card
                        :outlined="true"
                        color="#fff"
                        >
                        <v-card-actions class="pa-0">
                            <v-spacer></v-spacer>
                            <v-btn
                                outlined
                                color="primary"
                                class="m-btn"
                                @click="task_form = !task_form"
                            >
                            Создать задачу
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <task-create
            v-if="task_form"
            :task_form.sync="task_form"
            :screen="screen"
            :blob="blob"
            :editMode.sync="editMode"
            :model="document"
            :project_id="project_id"
            :task.sync="task"
            @setTaskNew="setTaskNew"
            @getImageData="getImageData"
        />
    </div>
</template>

<script>
import TaskCreate from "./TaskCreate"
import { sortObj } from '@/utils/services'

export default {
    name: 'Tasks',
    components: {
        TaskCreate
    },
    props: ['project_id', 'document', 'task_new', 'screen', 'blob'],
    data(){
        return {
            src: require('@/assets/images/screen.png'),
            task_form: this.task_new,
            expanded: [],
            editMode: false,
            task: null
        }
    },
    computed: {
        userAvatar(){
            return this.$store.state.administration.userAvatar
        },
        getList(){
            let avatar = ''
            let options = {year: '2-digit', month: 'short', day: '2-digit'}
            let list = this.$store.state.workflow.taskList
                .filter(f => f.docid == this.document.id)
                .map(t => {
                    return {
                        ...t,
                        avatar: (avatar = this.$store.state.administration.company.users
                            .find(a => a.id == t.owner))
                            ? avatar.avatarSrc
                            : '',
                        create_date: (new Date(t.create)).toLocaleDateString("ru-RU", options),
                        deadline_date: (new Date(t.deadline)).toLocaleDateString("ru-RU", options)

                    }
                })
            return sortObj(list, 'task_id')
        }
    },
    methods: {
        getImageData(){
            this.$emit('getImageData')
        },
        setTaskNew(v){
            this.$emit('update:task_new', v)
            this.$emit('clearImageData')
        },
        editTask(i){
            this.editMode = true
            this.task_form = true
            this.task = i
        },
        // getblob(blob){
        //     var urlCreator = window.URL || window.webkitURL;
        //     var img1 = urlCreator.createObjectURL( blob );
        //     console.log('rrrrr', blob)
        //     this.img1 = blob
        // }
    },
    mounted(){
//         var canvas = this.$refs['test']
// var context=canvas.getContext('2d');
// var image=new Image();
// const img1 = (blob) => {
//     this.img1 = blob
// }
// image.onload=function(){
//     let prc = image.width / 200
//     console.log('prcp', prc)
//     canvas.width = image.width / prc
//     canvas.height = image.height / prc
//     context.drawImage(image,0,0,image.width / prc,image.height / prc);
//
//     // let scre = canvas.toDataURL("image/png")
//         // console.log('canvas.toDataURL', canvas.toDataURL("image/png"))
//     canvas.toBlob((blob) => {
//         console.log('img1', img1, blob)
//         var urlCreator = window.URL || window.webkitURL;
//         var te = urlCreator.createObjectURL( blob );
//             console.log('te', te)
//         img1(te)
//     })
// };
// image.src=this.getList[0].src
    }
    // created(){
    //     this.$store.dispatch('workflow/getTaskList', {
    //         type_id: 'c',
    //         id: this.$store.state.administration.company.id,
    //         project_uuid: this.project_id,
    //         filter: {
    //             docid: this.document.id
    //         }
    //     })
    // },
    // beforeDestroy(){
    //     this.$store.commit('workflow/setTaskList', [])
    // }
}
</script>
