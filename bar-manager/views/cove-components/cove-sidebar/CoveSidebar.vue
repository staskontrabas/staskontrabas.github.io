<template>
  <aside class="cove-sidebar">
      <slot name="logo"/>
      <div class="sidebar-menu__wrap">
          <ul class="sidebar-menu">
            <slot name="nav"></slot>
          </ul>
      </div>
  </aside>
</template>

<script>
  export default {
    name: 'cove-sidebar'
  }
</script>
