<template>
    <div class="cove-main">
        <slot name="panel"></slot>
        <div class="cove-main__table">
            <slot name="settings"/>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'cove-settings'
  }
</script>
