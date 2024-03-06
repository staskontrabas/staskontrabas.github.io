<template>
    <div class="admin-auth">
        <div class="admin-auth-form">
            <div class="admin-auth-logo">DDWeed Shop</div>
            <input
                type="text"
                name="aemail"
                class="admin-input"
                :class="{'admin-input-error': errorSts == 'login'}"
                placeholder="login"
                required
                autofocus
                v-model="email">
            <input
                type="password"
                name="apass"
                class="admin-input"
                :class="{'admin-input-error': errorSts == 'pass'}"
                placeholder="password"
                required
                v-model="pass">

            <button
                class="admin-auth-btn btn btn--green btn--fill"
                @click="submit"
                >login</button>

            <div v-show="isError" class="admin-auth-error">
                {{isError}}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Login',
    props: ['sidebar'],
    data(){
        return {
            hashkey: 'HGDFGf#43434s$',
            hash: '59fc333ef6cd85497c86b9e1d6a3beccb67367bc9ca20b24d5604c6fe46fa624',
            email: '',
            pass: '',
            errorSts: false,
            errorList: {
                pass: 'Неверный пароль',
                login: 'Неверный логин'
            }
        }
    },
    computed: {
        isError(){
            return this.errorList[this.errorSts]
        }
    },
    methods: {
        submit(){
            if(this.pass.length > 0 && this.email.length > 0){
                this.$store.dispatch('auth/login', {
                    login: this.email,
                    password: this.pass
                })
                .then(res => {
                    if(res.status == 'failed'){
                        switch(res.error){
                            case 'user_with_login_not_found':
                                this.errorSts = 'login'
                                break
                            case 'incorrect_password':
                                this.errorSts = 'pass'
                                break
                            default:
                                this.errorSts = 'login'
                        }
                    }
                    if(res.status == 'success'){
                        let from  = this.$route.fullPath
                        this.errorSts = false
                        if(this.$store.state.auth.fullPath != null){
                            const path = this.$store.state.auth.fullPath
                            this.$store.dispatch('auth/setFullPath', null)
                            this.$router.push({path: path})
                        }
                        else{
                            if(res.role == 'superadmin'){
                                this.$router.push({path: '/registration'})
                            }
                            else{
                                this.$router.push({path: '/orders'})
                            }
                        }
                    }
                })
                .catch(er => {
                    console.error(er)
                })
            }
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.submit()
            }
        }
    },
    mounted(){
        document.addEventListener('keyup', this.enter, false)
    },
    beforeDestroy(){
        document.removeEventListener('keyup', this.enter, false)
    }
}
</script>
