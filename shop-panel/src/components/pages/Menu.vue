<template>
    <component :is="currentMenu"></component>
</template>

<script>
import MenuAdmin from "./menu/MenuAdmin"
import MenuSuperadmin from "./menu/MenuSuperadmin"

export default {
    name: 'Menu',
    components: {
        MenuAdmin,
        MenuSuperadmin
    },
    computed: {
        getRole(){
            return this.$store.state.auth.role
        },
        currentMenu(){
            return this.$store.state.auth.role == 'admin'
                ? 'MenuAdmin'
                : 'MenuSuperadmin'
        }
    }
}
</script>
