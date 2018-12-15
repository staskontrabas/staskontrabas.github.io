<template>
  <div class="layout">
    <slot name="sidebar"></slot>
    <div class="content-wrap" id="content-wrap">
      <slot name="content">
      </slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'cove-layout'
  }
</script>
