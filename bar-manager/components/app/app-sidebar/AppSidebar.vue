<template>
<cove-sidebar :mini="mini" :class="{'cove-sidebar__mini': mini}">
    <template slot="logo">
        <sidebar-panel @slide="slide"/>
    </template>
    <template slot="nav">
        <sidebar-link
            v-for="(link, index) in nav"
            :key="index"
            :to="{path: '/' + link.name}">
            <span slot="icon" class="sidebar__icon" :class="link.icon"></span>
            <span slot="title" class="sidebar__title">{{$t('navigation.' + link.title)}}</span>
        </sidebar-link>
    </template>
</cove-sidebar>
</template>

<script>
import CoveSidebar from '@/views/cove-components/cove-sidebar/CoveSidebar'
import SidebarLink from './components/SidebarLink'
import SidebarPanel from './components/SidebarPanel'

export default {
    name: 'app-sidebar',
    components: {
        CoveSidebar,
        SidebarLink,
        SidebarPanel
    },
    data() {
        return {
            mini: false,
            nav: [
                {
                    name: 'menu',
                    title: 'menu',
                    icon: 'flaticon-checklist'
                },
                {
                    name: 'expenses',
                    title: 'expenses',
                    icon: 'flaticon-calculator'
                },
                {
                    name: 'orders',
                    title: 'orders',
                    icon: 'flaticon-cashbox'
                },
                {
                    name: 'statistics',
                    title: 'statistics',
                    icon: 'flaticon-bar-chart'
                },
                {
                    name: 'settings',
                    title: 'settings',
                    icon: 'flaticon-settings'
                }
            ]
        }
    },
    methods: {
        slide: function(){
            this.mini = !this.mini
            this.$store.dispatch('common/resize')
        }
    }
}

</script>
