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
                            <v-card-subtitle class="pt-1">
                                {{item.dname}}
                            </v-card-subtitle>

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
            :screenshot="screenshot"
            :editMode.sync="editMode"
            :model="document"
            :project_id="project_id"
            :task.sync="task"
            @setTaskNew="setTaskNew"
            @onScreenShot="onScreenShot"
        />
    </div>
</template>

<script>
import TaskCreate from "./TaskCreate3d"
import { sortObj } from '@/utils/services'

export default {
    name: 'Tasks3d',
    components: {
        TaskCreate
    },
    props: ['project_id', 'document', 'task_new', 'screen', 'blob', 'screenshot'],
    data(){
        return {
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
        setTaskNew(v){
            this.$emit('update:task_new', v)
        },
        onScreenShot(){
            this.$emit('onScreenShot')
        },
        editTask(i){
            this.editMode = true
            this.task_form = true
            this.task = i
        },
    }
}
</script>
