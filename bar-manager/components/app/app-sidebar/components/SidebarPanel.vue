<template>
    <div class="sidebar-logo">
        <router-link
            class="logo-link"
            :to="{path: '/'}">The Qove</router-link>
        <div class="sidebar-burg"
            @click="slide"
            >
            <span class="sidebar-burg__plast sidebar-burg__plast-a"></span>
            <span class="sidebar-burg__plast sidebar-burg__plast-b"></span>
            <span class="sidebar-burg__plast sidebar-burg__plast-c"></span>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'sidebar-panel',
    methods: {
        slide: function(){
            this.$emit('slide')
        }
    }
  }
</script>
