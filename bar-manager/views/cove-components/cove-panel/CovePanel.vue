<template>
    <div class="cove-panel">
        <div class="cove-panel__wrap">
            <div class="cove-panel__part-left">
                <slot name="left"/>
            </div>
            <div class="cove-panel__part-right">
                <slot name="right"/>
            </div>
        </div>
        <slot name="future"/>
    </div>
</template>

<script>
    export default {
        name: 'cove-panel'
    }
</script>
