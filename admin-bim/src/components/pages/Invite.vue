<template>
<v-container fluid fill-height text-xs-center class="m-container pb-10 pt-0">
<v-layout row wrap>
<v-flex xs12>
    <v-container fluid px-3 pb-10 pt-0 class="m-container" ref="wrap">
        <v-card outlined max-width="1200" class="m-card pa-0 pt-0">
            <v-card-text class="m-text--2c"> Подтверждение приглашения </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
                    Приглашение принято! Пожалуйста, авторизируйтесь в системе заново, чтобы начать работу.
            </v-card-text>
            <v-card-actions class="px-4">
                <v-btn
                    outlined
                    color="primary"
                    @click="push"
                    class="m-btn"> Выйти из системы </v-btn>

            </v-card-actions>
        </v-card>
    </v-container>
</v-flex>
</v-layout>
</v-container>
</template>

<script>

export default {
    name: 'Invite',

    data(){
        return {
            code: '',
            company: {},
            confirmed: false,
            answer: ''
        }
    },
    methods: {
        push() {
            this.$store.dispatch('auth/logout')
        },
        // confirm(a){
        //     let params = {
        //         code: this.code,
        //         answer: a
        //     }
        //     this.answer = a
        //     this.$store.dispatch('auth/confirmInvite', params)
        //     .then(res => {
        //         this.confirmed = true
        //         if(a == 'allow'){
        //             this.$store.dispatch('administration/getUser')
        //             .then(() => {
        //                 this.$notify({
        //                     group: 'note',
        //                     type: 'success',
        //                     text: 'Вы успешно присоединились к компании! Пожалуйста, авторизируйтесь снова.' ,
        //                     message: 'Вы успешно присоединились к компании! Пожалуйста, авторизируйтесь снова.' ,
        //                 })
        //             })
        //         }
        //     },
        //         er => {
        //             console.log('error', er)
        //         }
        //     )
        // }
    },
    created(){
        // let query = this.$route.query
        // let code = Object.prototype.hasOwnProperty.call(query, 'code')
        // if(code){
        //     this.code = query.code
        //     this.$store.dispatch('auth/checkInvite', {
        //         code: query.code
        //     })
        //     .then(res => {
        //         this.company = res.company
        //     })
        // }
    }
}
</script>
