<template>
    <div>
        <app-header />

        <router-view />
    </div>
</template>

<script>
import AppHeader from "./AppHeader"
export default {
    name: 'Layout',
    components: {
        AppHeader
    },
    data(){
        return {
        }
    },
    mounted(){
    }
}
</script>
