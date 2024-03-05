<template>
    <el-container style="display: flex; flex-direction: column; flex-basis: calc(100%); min-height: 400px;">

        <div style="display: flex; flex-direction: row;">
            <app-bar 
                :part="part" 
                :side_mini.sync="side_mini" 
                :side_type.sync="side_type"/>
        </div>
        <el-container class="m-core-container">
            <sidebar 
                :part="part" 
                :side_mini.sync="side_mini" 
                :side_type.sync="side_type"/>
            <core-view/>
        </el-container>

        <!-- <core-footer/> -->
    </el-container>
</template>

<script>
import sidebar from "./sidebar/sidebar.js"
import AppBar from '@/components/core/AppBar'
import Sidebar from '@/components/core/Sidebar'
import CoreView from '@/components/core/CoreView'
// import CoreFooter from '@/components/core/CoreFooter'

    export default {
        name: 'Layout',
        data: () => ({
            fab: false,
            part: {},

            side_mini: false,
            side_type: 'shared',

        }),
        watch: {
            '$route' (to, from){
                this.part = this.createNav()
            },
        },
        components: {
            AppBar,
            Sidebar,
            CoreView,
            // CoreFooter
        },
        computed: {
            coreViewHeight() {
                let header = document.getElementById('core-header')
                let footer = document.getElementById('core-footer')
                let occupied_height = header && footer ? header.getBoundingClientRect().height + footer.getBoundingClientRect().height : 0
                let coreview_height = 'calc(100vh - ' + occupied_height + ')'
                console.log('coreview height', coreview_height)
                return coreview_height
            }
        },
        created(){
            this.part = this.createNav()
        },
        methods: {
            onScroll (e) {
                if (typeof window === 'undefined') return
                const top = window.pageYOffset ||   e.target.scrollTop || 0
                this.fab = top > 20
            },
            toTop () {
                this.$vuetify.goTo(0)
            },
            createNav: function(){

                let part = Object.assign({}, sidebar[this.$route.meta.part])
                // console.log(this.$route.meta)


                let keys = Object.keys(part)

                if(keys.includes('clone')){
                    let clone = Object.assign({}, sidebar[part.clone])
                    keys.map(i => {
                        clone[i] = part[i]
                    })
                    part = Object.assign({}, clone)
                }

                // part.list = part.list.filter(l => !l.access_list.length
                //         || l.access_list.some(s => this.getRole == s)
                // )

                let crumbs = []

                this.$route.matched.map(m => {
                    if(Object.prototype.hasOwnProperty.call(m.meta, 'crumbs')){
                        crumbs.push({
                            title: m.meta.crumbs,
                            path: m.path
                        })
                    }
                })
                //let title = crumbs.join(' / ')

                this.$store.commit('toolbar/setTitle', crumbs)

                return part
            }
        }
    }
</script>
