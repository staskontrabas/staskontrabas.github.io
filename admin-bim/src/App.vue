<template>
    <v-app id="inspire">
        <router-view/>

        <div
            v-if="!onLoadsCheck"
            class="m-back m-back--fixed"
            >
            <div class="vm-progress">
                <div class="loader">
                    <svg class="circular" viewBox="25 25 50 50">
                        <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                    </svg>
                </div>
            </div>
        </div>

        <notifications
            group="note"
            id="notification"
            classes="vue-notification m-font--size14"
            width='300'
            position="top right"
            :duration="5000">

            <template slot="body" slot-scope="props">
                <div
                    class="vue-notification-template vue-notification m-font--size14"
                    :class="props.item.type"
                    @click="props.close"
                    >
                    <div class="notification-title">
                        <v-icon size="28" color="#fff">{{ notifyIcon(props.item.type) }}</v-icon>
                    </div>
                    <div class="notification-content" v-html="props.item.text">
                    </div>
                </div>
            </template>
        </notifications>
    </v-app>
</template>

<script>
export default {
    name: 'App',
    methods: {
        notifyIcon(i){
            let icons = {
                success: 'mdi-check-circle-outline',
                error: 'mdi-alert-outline'
            }
            return icons[i]
        },
        checkToken(){
            let localState = JSON.parse(localStorage.getItem('token')) || {expiry: false}
            let expiry = this.$store.state.auth.expiry
                        || localState.expiry

            if(expiry){
                let now = new Date()
                let out = new Date((expiry * 1000))
                let left = parseInt((out.getTime() - now.getTime()) / 1000 / 60)
                if(left < 8){
                    this.$store.dispatch('auth/refresh')
                }
            }
            else{
                this.$store.dispatch('auth/getCodeForToken')
            }
        },
        onLoadsCheck(){
            // console.log('called on load check')
            let check = false
            let perms = this.$store.state.administration.groupPermissions
            if(perms && perms.length){
                check = true
            }
            return check
        }
    },
    mounted(){
        document.title = 'UnitBim'
        let timerId = setInterval(this.checkToken, 600000)
    }
}
</script>
