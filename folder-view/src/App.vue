<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'
import PathFolders from './components/PathFolders.vue'
import TreeFolders from './components/TreeFolders.vue'

const folder = ref<string>('')
const currentComp = ref<string>('PathFolders')

interface IComponents {
    [key: string]: Component
}
const tabs: IComponents = {
    'PathFolders': PathFolders,
    'TreeFolders': TreeFolders
}

const takeComp = (val: string) => {
    currentComp.value = val
}
const setFolder = (val: string) => {
    folder.value = val
}
</script>

<template>
    <v-app>
        <div class="fill-height d-flex flex-column justify-center align-center bg-black pa-10">
            <component
                :is="tabs[currentComp]"
                @takeComp="takeComp"
                @setFolder="setFolder"
                :folder="folder"/>
        </div>
    </v-app>
</template>

<style scoped>
</style>
