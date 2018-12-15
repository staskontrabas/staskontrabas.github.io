<template>
    <cove-layout>
        <app-sidebar slot="sidebar"/>
        <main slot="content" class="content" id='main-content'>
            <router-view></router-view>
        </main>
    </cove-layout>
</template>

<script>
import Vue from 'vue'
import CoveLayout from '@/views/cove-components/cove-layout/CoveLayout'
import AppSidebar from './app-sidebar/AppSidebar'
import {setTime} from "@/components/mixins/checkTime"

export default {
    name: 'AppLayout',
    mixins: [setTime],
    components: {
        CoveLayout,
        AppSidebar
    },
    created(){
        if(this.$store.state.common.options.start_time == -1){
            const period = this.setTime({id: 0})

            Vue.set(this.$store.state.common.options, 'start_time', period.start_time)
            Vue.set(this.$store.state.common.options, 'end_time', period.end_time)
        }
    }
}
</script>
