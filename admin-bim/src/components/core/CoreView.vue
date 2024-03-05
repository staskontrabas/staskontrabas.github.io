<template>
    <el-main class="light lighten-3" style="position: relative; display: flex; flex-direction: column; flex-grow: 1; overflow: auto;">
        <div style="position: relative; height: 100%; top: 0; width: 100%; max-width: 100%; max-height: 100%; overflow: hidden;">
            <router-view>
            </router-view>

            <RightSideDrawer
                ref="right-drawer"
                :task_id="task_id"
                :type_id="type_id"
                :cat_id="cat_id"
                @reset="resetTask"
            />
        </div>
    </el-main>
</template>

<script>
import RightSideDrawer from './coreview/RightSideDrawer.vue'
import InlineSvg from "vue-inline-svg"

export default {
    name: 'CoreView',
    components: {
        RightSideDrawer,
        InlineSvg,
    },
    data() {
        return {
            task_id: null,
            type_id: null,
            cat_id: null,
        }
    },
    methods: {
        setExistingTaskId(event) {
            console.log('new edit task event', event)
            
            if (!event.detail) {
                return null
            }
            this.task_id = event.detail.task_id
            this.type_id = event.detail.type_id
            this.cat_id = event.detail.cat_id
        },
        createNewTask(event) {
            if (!event.detail) {
                this.task_id = null
                return null
            }
            this.task_id = event.detail.task_id
            this.type_id = event.detail.type_id
            this.cat_id = event.detail.cat_id
        },
        resetTask(payload) {
            console.log('ids', this.task_id , payload.task_id)
            this.task_id = payload.task_id
            this.type_id = payload.type_id
            this.cat_id = payload.cat_id
        },
        changeVisibility(event) {
            console.log('got change vis event', event.detail)
            if (this.task_id == null) {
                return null
            } 
            if (event.detail) {
                this.$refs['right-drawer'].showAgain()
            }
            else {
                this.$refs['right-drawer'].hide()
            }  
        },
    },
    mounted() {
        window.addEventListener('ubviewer_open_edit_task', this.setExistingTaskId)
        window.addEventListener('ubviewer_create_new_task', this.createNewTask)
        window.addEventListener('ubviewer_change_editor_visibility', this.changeVisibility)
        
    },
    beforeDestroy() {
        window.removeEventListener('ubviewer_open_edit_task', this.setExistingTaskId)
        window.removeEventListener('ubviewer_create_new_task', this.createNewTask)
        window.removeEventListener('ubviewer_change_editor_visibility', this.changeVisibility)
    },
}
    
</script>
