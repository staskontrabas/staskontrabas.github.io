<template>
    <div class="admin-top">
        <div class="admin-header">
            <div class="admin-container">
                <div class="admin-header-burger" @click="toggle = !toggle">
                    ☰
                </div>
                <div class="admin-header-logo">Shop</div>


                <button
                    @click="logout"
                    class="btn btn--fill btn--red admin-header-logout">Logout</button>
            </div>
        </div>

        <app-header-menu />
        <app-header-menu-side :toggle.sync="toggle" />
        <div class="admin-menu-shadow"></div>
    </div>
</template>

<script>
import AppHeaderMenu from "./AppHeaderMenu"
import AppHeaderMenuSide from "./AppHeaderMenuSide"
export default {
    name: 'AppHeader',
    components: {
        AppHeaderMenu,
        AppHeaderMenuSide
    },
    data(){
        return {
            toggle: false
        }
    },
    methods: {
        logout(){
            localStorage.setItem('userid', '')
            localStorage.setItem('role', '')
            localStorage.setItem('shopid', '')
            this.$store.commit('auth/login', {
                role: '',
                userid: ''
            })
            this.$router.push({name: 'auth'})
        }
    }
}
</script>
