<template>
    <div class="cove-main">
        <slot name="panel"></slot>
        <div class="cove-main__table">
            <slot name="analytics"/>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'cove-analytics'
  }
</script>
