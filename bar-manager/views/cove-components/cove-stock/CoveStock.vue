<template>
    <div class="cove-main">
        <slot name="panel"></slot>
        <div class="cove-main__table">
            <slot name="category"></slot>
            <slot name="resizer"></slot>
            <slot name="list"></slot>
        </div>
        <slot/>
    </div>
</template>

<script>
  export default {
    name: 'cove-stock'
  }
</script>
