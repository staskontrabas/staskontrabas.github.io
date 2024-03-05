<template>
    <div id="app">
        <ubviewer-engine/>
    </div>
</template>

<script>
import UbviewerEngine from '@/components/UbviewerEngine'

export default {
    name: 'App',
    components: {
        UbviewerEngine
    },
    mounted(){
        document.title = 'UnitBim'
    }
}
</script>

<style lang="less">
html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    position: relative;
}
#app {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>
