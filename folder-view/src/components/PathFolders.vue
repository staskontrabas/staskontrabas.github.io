<script setup lang="ts">
    import { ref } from 'vue'
    
    defineProps<{ folder: string }>()
    
    const emit = defineEmits<{
        (e: "takeComp", v: string): void
    }>()

    const showTree = () => {
        emit('takeComp', 'TreeFolders')
    }
</script>

<template>
    <v-card
        class="mx-auto d-flex flex-column"
        width="400"
        height="200">

        <v-card-text
            height="100"
            class="d-flex text-center justify-center align-center">
            Путь к папке: / {{ folder }}
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions
            class="text-center justify-center">
            <v-btn
                @click="showTree"
                text="Открыть дерево"></v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
</style>
