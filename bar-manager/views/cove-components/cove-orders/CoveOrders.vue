<template>
    <div class="cove-main">
        <slot name="panel"></slot>
        <div class="cove-main__table">
            <slot name="orders"/>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'cove-orders'
  }
</script>
