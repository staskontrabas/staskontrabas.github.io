<template>
    <li class="sidebar-link">
        <router-link
            class="sidebar-link__router-link"
            :to="to"
            :target="target">
            <slot name="icon"></slot>
            <slot name="title"></slot>
        </router-link>
    </li>
</template>

<script>
export default {
    name: 'sidebar-link',
    props: {
        to: {
            type: Object,
            required: true
        },
        target: {
            type: String,
            default: '_self'
        }
    },
    watch: {
        $route (route) {
            this.$nextTick(() => {
                const isActive = this.$children[0].$el.classList.contains('router-link-active')
                if (!isActive) {
                    return
                }
            })
        }
    }
}
</script>
