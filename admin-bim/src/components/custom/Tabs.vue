<template>
    <div class="m-tabs">
        <router-link
            v-for="(i, j) in list"
            :key="j"
            class="m-tab"
            :class="{active: $route.path == i.link}"
            :to="i.link"
            >
            {{i.title}}
        </router-link>
    </div>
</template>

<script>
    export default{
        name: 'Tabs',
        props: ['list'],
        data(){
            return{
            }
        }
    }
</script>
