<template>
    <v-container fluid fill-height text-xs-center py-0 pr-0 class="m-container">
        <v-layout wrap ma-0>
            <div
                class="m-pdf-wrap"
                :class="{'no-event': no_event}"
                ref="pdf-wrap"
                :style="style_pdf"
                >
                <pdf
                    v-if="src"
                    :src="src"
                    :scale.sync="scale"
                    :btn_off.sync="btn_off"
                    :no_event.sync="no_event"
                    ></pdf>
            </div>
            <div class="b-zoom">
                <v-btn
                    text
                    icon
                    @click.stop="zoomout"
                    :disabled="btn_off"
                    color="#7f7f7f">
                    <v-icon size="20">mdi-minus</v-icon>
                </v-btn>
                <v-btn
                    text
                    icon
                    @click.stop="zoomin"
                    :disabled="btn_off"
                    color="#7f7f7f">
                    <v-icon size="20">mdi-plus</v-icon>
                </v-btn>
            </div>
        </v-layout>
        <tools :toolsbar.sync="toolsbar"/>
    </v-container>
</template>

<script>
import Tools from "./dctview/Tools"
import pdf from '@/components/custom/PdfViewer'

export default {
    name: 'DctView',
    components: {
        Tools,
        pdf
    },
    props: ['type'],
    data(){
        return {
            url: "http://localhost:8080/img/2.jpg",
            pdf1: 'http://localhost:8080/img/schema.pdf',
            pdf: 'http://localhost:8080/img/shkola.pdf',
            pdf3: 'https://materials.ubdev.ru:5443/img/schema.pdf',
            src: '',
            scale: 'page-mini',
            toolsbar: false,

            btn_off: false,
            style_pdf: {},
            no_event: false
        }
    },
    watch: {
        toolsbar: function(v){
            if(typeof this.scale === 'number'){
                return
            }
            if(v){
                setTimeout(function(){this.scale = 'page-full'}.bind(this), 400)
            }
            else{
                setTimeout(function(){this.scale = 'page-mini'}.bind(this), 400)
            }
        }
    },
    created(){
        let workflow = this.$store.state.workflow
        let doc = workflow.dcts.filter(item => item.id == this.$route.params.doc)[0]
        this.$store.commit('toolbar/setDctView', {name: 'test', status: 'На рассмотрение'})

        if(!workflow.activeProject){
            this.$store.dispatch('workflow/setActiveProject', {id: this.$route.params.id})
            this.$store.dispatch('workflow/setActiveGroup', {id: doc.group, value: true})
            this.$store.commit('workflow/setActiveFolder', {
                id: doc.folder,
                name: ''
            })
        }

        this.$store.commit('workflow/setPdfInit', false)
    },
    mounted(){
        let pdfWrap = this.$refs['pdf-wrap']
        let bbox = pdfWrap.getBoundingClientRect()
        this.style_pdf = {
            height: bbox.height + 'px'
        }
        this.src = this.pdf1
    },
    methods: {
        zoomin(){
            this.btn_off = true
            this.scale = typeof this.scale === 'string'? 1 : this.scale = Math.abs(this.scale) + 1
        },
        zoomout(){
            this.btn_off = true
            this.scale = typeof this.scale === 'string'? -1 : this.scale = (Math.abs(this.scale) + 1) * -1
        }
    }
}
</script>
