<template>
  <v-layout fluid fill-height>В разработке
  </v-layout>
</template>

<script>
    export default {
        name: 'Settings',
        data () {
            return {
            }
        },
        created(){
            let project = this.$store.state.projects.projects.filter(item => item.number == this.$route.params.id)[0]
            //this.$store.commit('toolbar/setTitle', this.$store.state.toolbar.title + ' / ' + project.name)
        }
    }
</script>
