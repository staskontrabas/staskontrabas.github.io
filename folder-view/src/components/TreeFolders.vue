<script setup lang="ts">
    import { ref, computed, onBeforeMount } from 'vue'
    import TreeView from './TreeView.vue'
    
    const props = defineProps<{ folder: string }>()
    
    const curr_folder = ref<string>('')

    const emit = defineEmits<{
        (e: "takeComp", v: string): void
        (e: "setFolder", v: string): void
    }>()

    const folders = computed(() => {
        return createTree(items.value)
    })

    const createTree = (items: [], parent:number = 0) =>{
        let tree = []
        let list = items.filter(i => i.parent == parent)
        list.map((val) => {
            let item = val
            if(item.title == props.folder){
                item.expanded = true
                item.active = true
            }
            item.children = createTree(items, val.id)
            tree.push(item)
        })
        return tree
    }
    const showTree = () => {
        emit('takeComp', 'PathFolders')
    }
    const itemsMap = ref()
    const items = ref([])
    const setExpanded = (val: any, expanded: boolean) => {
        items.value = items.value.map(item => {
            item.active = false
            if(val == item.id){
                curr_folder.value = item.title
                item.expanded = expanded
                item.active = true
            }
            return item
        })
    }
    const close = () => {
        emit('setFolder', '')
        showTree()
    }
    const setFolder = () => {
        emit('setFolder', curr_folder.value)
        showTree()
    }
    async function getFolders() {
        const response = await fetch("./folders.json")
        items.value = await response.json()
    }

    onBeforeMount(() => {
        getFolders()
    })
</script>

<template>
    <v-card
        title="Директории"
        class="mx-auto d-flex flex-column"
        width="100%"
        height="100%">

        <v-card-text
            height="100"
            class="pb-10 d-flex">

            <tree-view :items="folders" :folder="props.folder" @setExpanded="setExpanded"/>

        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions
            class="text-center justify-center">
            <v-btn
                @click="setFolder"
                text="OK"></v-btn>
            <v-btn
                @click="close"
                text="Закрыть"></v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
</style>
