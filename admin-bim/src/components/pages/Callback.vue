<template>
    <v-container fluid fill-height text-xs-center class="m-container pb-10 pt-0">
        <v-layout wrap>
            <v-flex xs12>
                <v-layout
                    fluid
                    fill-height
                    column
                    align-center
                    justify-center
                    >
                    <div>Callback</div>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
export default {
    name: 'Callback',
    render: () => null,
    data: () => ({
    }),
    methods: {
    },
    mounted(){
        let query = this.$route.query
        let code = Object.prototype.hasOwnProperty.call(query, 'code')

        if(code){
            let state = query.state
            code = query.code

            this.$store.dispatch('auth/token', {code: code, state: state})
            .then(res => {
                let stateInit = JSON.parse(localStorage.getItem('state'))
                
                if(stateInit.path == '/invite'){
                    this.$store.commit('auth/setToken', res)
                    this.$router.push(stateInit.url)
                }
                else{
                    this.$store.dispatch('auth/setTokenId', res)
                    .then(() => {
                        this.$router.push(stateInit.url)
                    })
                }
            })
            // TODO: раскомментировать и проверить, как оно работает.
            // .finally(() => {
            //     this.$router.push('/workflow/projects')
            // })
        }
        else{
            console.log('Callback no code, pushing to main page')
            // this.$router.push('/workflow/projects')
        }
    }
}
</script>
