<script setup lang="ts">
    import { ref } from 'vue'
    import TreeView from './TreeView.vue'
    
    defineProps<{ items: [] }>()
    
    const emit = defineEmits<{
        (e: "setExpanded", v: number): void
    }>()

    const setExpanded = (val: any, expanded: boolean) => {
        emit('setExpanded', val, expanded)
    }
    const onExpanded = (item) => {
        emit('setExpanded', item.id, !item.expanded)
    }
    
</script>

<template>
    <div
        class="d-flex flex-column">
        <div
            class="ul-item"
            :style="{'padding-left': item.parent ? '14px' : '0'}"
            v-for="item in items"
            @click.stop="onExpanded(item)">
            <div
                class="ul-item_title"
                :class="{active: item.active}"
                >
                <span
                    class="f-icon"
                    :class="item.children.length && item.expanded ? 'icon-folder-open' : 'icon-folder'"></span>
                {{ item.title }}</div>
            <template v-if="item.children && item.expanded">
                <tree-view :items="item.children"  @setExpanded="setExpanded"/>
            </template>
        </div>
    </div>
</template>

<style scoped>
.ul-item_title{
    background-color: #909090;
    padding: 6px;
    border-radius: 5px;
    font-size: 16px;
    color: #fff;
    cursor: pointer;
    display: inline-block;
    transition: background-color 0.2s ease;
}
.ul-item_title.active{
    background-color: #0683f9;
}
.ul-item_title:hover{
    background-color: #06acf9;
}
</style>
