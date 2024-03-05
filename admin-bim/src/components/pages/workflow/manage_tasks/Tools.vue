<template>
    <v-navigation-drawer
        permanent
        fixed
        floating
        :width="tools_width"
        :style="h_style"
        class="m-navigator-tools m-navigator-no-scroll px-2 pr-0"
        right
        clipped
        color="transparent"
        >
            <v-layout class="ma-0" fill-height>
                <div
                    class="m-overflow-hidden m-tools-content">
                    <v-layout class="ma-0" fill-height>

                        <task-create
                            :item="editItem"
                            :projectFoldersMap="projectFoldersMap"
                            @cancel="cancel"
                            />

                    </v-layout>
                </div>
            </v-layout>
    </v-navigation-drawer>
</template>

<script>
import TaskCreate from "./TaskCreate"

export default {
    name: 'Tools',
    components: {
        TaskCreate
    },
    props: ['editItem', 'h_style', "projectFoldersMap"],
    data(){
        return {
            tools_width: 440,
        }
    },
    methods: {
        cancel(){
            this.$emit('update:editItem', null)
        }
    }
}
</script>
