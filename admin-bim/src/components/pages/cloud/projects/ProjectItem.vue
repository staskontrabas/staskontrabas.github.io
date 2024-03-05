<template>
    <v-container fluid text-xs-center pa-0 pb-10>
        <Tabs
            :list="list"
        />
        <v-layout wrap>
            <v-flex xs12 class="pa-0">
                <router-view/>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import Tabs from "@/components/custom/Tabs"

    export default {
        name: 'ProjectItem',
        components: {
            Tabs
        },
        data () {
            return {
                list: [{
                    title: 'Параметры',
                    link: '/params'
                },{
                    title: 'Объекты',
                    link: '/objects'
                },{
                    title: 'Материалы',
                    link: '/materials'
                },{
                    title: 'Настройки',
                    link: '/settings'
                }]
            }
        },
        watch: {
            '$route' (to, from) {
                this.$store.commit('toolbar/setTitle', this.$store.state.toolbar.title + ' / ' + this.$store.state.projects.active.name)
            }
        },
        created(){
            let project = this.$store.state.projects.projects.filter(item => item.id == this.$route.params.id)[0]
            this.$store.commit('toolbar/setTitle', this.$store.state.toolbar.title + ' / ' + project.name)
            this.$store.dispatch('projects/setActive', {id: this.$route.params.id})
            this.createLink(this.$route.params.id)
        },
        methods: {
            createLink(id){
                let list = this.list.map(item => {
                    item.link = '/cloud/projects/' + id + item.link
                })
                return list
            }
        }
    }
</script>
