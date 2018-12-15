<template>
    <div class="cove-main">
        <slot name="panel"></slot>
        <div class="cove-main__block">
            <slot name="operations"/>
        </div>
        <slot/>
    </div>
</template>

<script>
  export default {
    name: 'cove-operations'
  }
</script>
