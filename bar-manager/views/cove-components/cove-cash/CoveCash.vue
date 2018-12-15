<template>
    <div class="cove-main">
        <slot name="panel"></slot>
        <div class="cove-main__table">
            <slot name="cash"/>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'cove-cash'
  }
</script>
