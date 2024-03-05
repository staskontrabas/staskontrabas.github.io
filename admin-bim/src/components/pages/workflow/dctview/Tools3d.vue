<template>
    <v-navigation-drawer
        permanent
        :width="tools_width"
        class="m-navigator-tools m-navigator-no-scroll px-2 pr-0"
        right
        clipped
        color="#fafafa"
        app>
            <v-layout class="ma-0" fill-height>
                <div
                    class="m-overflow-hidden m-tools-content"
                    :class="{'m-tools-content--mini': mini}">
                    <v-layout class="ma-0" fill-height>

                        <component :is = "tab"
                            :document="document"
                            :listModel="listModel"
                            :mini="mini"
                            :project_id="project_id"
                            :task_new.sync="task_new"
                            :screen="screen"
                            :blob="blob"
                            :screenshot="screenshot"
                            :selectedObjID="selectedObjID"
                            :onLoadsCheck="onLoadsCheck"
                            :propertiesObj="propertiesObj"
                            :worker="worker"
                            @onMarker="onMarker"
                            @onScreenShot="onScreenShot"
                            @onSetSelectionMode="onSetSelectionMode"
                            @getImageData="getImageData"
                            @newTask="newTask"
                            />

                    </v-layout>
                </div>
                <div ccols="2" class="pl-0 pr-0 text-right m-tools-menu">
                    <v-list-item
                        @click.stop="expand"
                        class="m-nav-right-tools m-nav-right-tools__dil"
                        >
                        <v-icon
                            size="25"
                            color="#7f7f7f">{{mini ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'}}</v-icon>
                    </v-list-item>
                    <v-list-item
                        class="m-nav-right-tools"
                        v-for="(i, j) in getTabs"
                        :key="j"
                        :class="{active: i.name == tab}"
                        @click="setTab(i.name)"
                        >
                        <v-icon
                            :color="activeBtn(i.name)"
                            size="25">{{i.icon}}</v-icon>
                    </v-list-item>
                </div>
            </v-layout>
    </v-navigation-drawer>
</template>

<script>
import Comments3d from "./Comments3d"
import Tasks3d from "./Tasks3d"

export default {
    name: 'Tools3d',
    components: {
        Comments3d,
        Tasks3d
    },
    props: ['document', 'listModel', 'project_id', 'screen', 'blob', 'selectedObjID', 'onLoadsCheck', 'screenshot', 'propertiesObj', 'worker'],
    data(){
        return {
            task_new: false,
            mini: true,
            tools_width: 56,
            tab: 'Comments3d',
            tabs: [
                {
                    name: 'Comments3d',
                    icon: 'mdi-comment-text-outline',
                    visible: true
                },
                {
                    name: 'Tasks3d',
                    icon: 'trd-ticket',
                    visible: false
                }
            ]
        }
    },
    computed: {
        getTaskList(){
            return this.$store.state.workflow.taskList.length
        },
        getTabs(){
            return this.tabs.map(t => {
                let vis = true
                if(t.name == 'Tasks3d'){
                    vis = !!this.getTaskList
                }
                return {
                    ...t,
                    visible: vis
                }
            }).filter(f => f.visible)
        }
    },
    watch: {
        mini: function(v){
            this.tools_width = v ? 56 : 440
            this.$emit('update:toolsbar', v)
            if(v){
                // if(this.$store.state.comments.borderStack.length){
                //     let border = this.$store.state.comments.borderStack[0]
                //     this.onMarker({
                //         action: 'onHideMarker',
                //         id: border.id
                //     })
                // }
            }
        },
        onLoadsCheck(v){
            if(v){
                this.socketOpen()
            }
        }
    },
    methods: {
        getImageData(){
            this.$emit('getImageData')
        },
        onMarker(data){
            this.$emit('onMarker', data)
        },
        onScreenShot(){
            this.$emit('onScreenShot')
        },
        onSetSelectionMode(v){
            this.$emit('onSetSelectionMode', v)
        },
        setTab(v){
            this.tab = v
        },
        newTask(){
            this.task_new = true
            this.setTab('Tasks3d')
        },
        clearImageData(){
            this.$emit('update:screen', '')
        },
        activeBtn(v){
            let color = this.tab == v ? '#2c2c2c' : '#7f7f7f'
            return color
        },
        expand(){
            this.mini = !this.mini
        },
        socketOpen(){
            this.$store.dispatch('comments/setSocket', {
                did: this.document,
                list: this.listModel.map(model => model.fileId)
            })
        },
        socketClose(v){
            console.log('socketClose')
            this.$store.dispatch('comments/close')
        }
    },
    created(){
        this.$store.dispatch('workflow/getTaskList', {
            type_id: 'c',
            id: this.$store.state.administration.company.id,
            project_uuid: this.project_id,
            filter: {
                docid: this.document.id
            }
        })
    },
    beforeDestroy(){
        this.socketClose()
        this.$store.commit('workflow/setTaskList', [])
    }
}
</script>
