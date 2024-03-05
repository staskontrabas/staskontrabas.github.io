<template>
    <component
        :is="getViewer"
        :model="model"
        :project_id="id"
    />
</template>

<script>
import ViewPdf from "./dctview/ViewPdf"
import ViewSvg from "./dctview/ViewSvg"
import ViewObj from "./dctview/ViewObj"
import ViewDwg from "./dctview/ViewDwg"
import ViewDxf from "./dctview/ViewDxf"

export default {
    name: 'DctView',
    components: {
        ViewPdf,
        ViewSvg,
        ViewObj,
        ViewDwg,
        ViewDxf
    },
    props: ['id', 'type'],
    data(){
        return {
            model: {
                id: false,
                type: ''
            },
            permittedTypes: ['obj', 'pdf', 'dwg', 'dxf']
        }
    },
    computed: {
        getViewer(){
            console.log('got viewer type', this.type)
            return this.type || '' //component
        }
    },
    methods: {
        getModel(){
            let list = this.$store.state.workflow.listDocs
            let id = this.doc || ''
            if(!list.length){
                this.$store.dispatch('workflow/getFolders')
                .then(res => {
                    return this.$store.dispatch('workflow/createFoldersMap')
                })
                .then(() => {
                    list = this.$store.state.workflow.listDocs
                    let file = list.filter(l => l.id == id)
                    if(file.length){
                        this.model = file[0]
                    }
                    let name = this.model.name || 'name'
                    this.$store.commit('toolbar/setDctView', {name: name, status: ''})
                    this.$store.commit('workflow/setCurrentFolder', this.model.id)
                })
            }
            else{
                let file = list.filter(l => l.id == id)
                if(file.length){
                    this.model = file[0]
                    let name = this.model.name || 'name'
                    this.$store.commit('toolbar/setDctView', {name: name, status: ''})
                    this.$store.commit('workflow/setCurrentFolder', this.model.id)
                }
            }
            this.model.id = true
        },
        checkInit(){
            if(!this.$store.state.workflow.activeProject){
                let project = this.$route.params.id
                return this.$store.dispatch('workflow/getProjects', {
                    type_id: 'c',
                    id: this.$store.state.administration.company.id
                })
                .then(res => {
                    project = this.$store.state.workflow.projects.filter(i => i.id == project)
                    project = project.length
                        ? JSON.parse(JSON.stringify(project[0]))
                        : null

                    return new Promise(resolve => {
                        Promise.all([
                            this.$store.commit('workflow/setActiveProject', project),
                            this.$store.dispatch('workflow/getFolders'),
                        ])
                        .finally(res => {
                            resolve(this.$store.dispatch('workflow/createFoldersMap'))
                        })
                    })
                })
            }
            else{
                return Promise.resolve(true)
            }
        }
    },
    created(){
        this.checkInit()
        .then(() => {
            this.getModel()
        })
    }
}
</script>
