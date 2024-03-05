<template>
    <v-container fluid fill-height text-xs-center pa-0 class="m-container">
        <v-layout wrap ma-0 ref="wrap">
            <div style="height: 100%; width: 100%;" id="ubviewerwrap">

                <figure style="overflow:visible; height: 100%; width: 100%; display: flex; position: absolute; justify-content: center; align-items: center;" id="qtspinner">
                    <center style="margin-top:1.5em; line-height:150%"> 
                        <div class="vm-progress">
                            <inline-svg class="inline-svg" :src="require(`@/assets/images/preloaderSpinner.svg`)"></inline-svg>
                        </div>                    
                        <strong id="qtstatus">Подготовка к просмотру</strong>
                        <noscript>JavaScript is disabled. Please enable JavaScript to use this application.</noscript>
                    </center>
                </figure>
                <canvas id="qtcanvas" style="{
                                        border: 0px none;
                                        background-color: white;
                                        height: 100%;
                                        width: 100%;
                                        outline: 0px solid transparent;
                                        caret-color: transparent;
                                        cursor: default
                                }" oncontextmenu="event.preventDefault()" contenteditable="true"></canvas>
            </div>
		</v-layout>
	</v-container>
</template>

<script>

window.token = ''
window.fileid = ''
window.projectid = ''

let prevBodyStyleOverflow = ''

import InlineSvg from "vue-inline-svg"

export default {
    name: 'ViewPdf',
    components: {
        InlineSvg,
    },
	props: {
        project_id: {
            type: String,
            default: ''
        }
	},
    data(){
        return {
            Module: {},
			toolsbar: false,
            fileId: '',
            model: null
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
    methods: {
        
    },
    beforeCreate(){
        this.$store.commit('workflow/setPdfPage', true)
    },
    mounted(){
        const queryString = window.location.search
        console.log('got querystring', queryString)
        const urlParams = new URLSearchParams(queryString)
        const files = urlParams.getAll('file')
        this.fileId = files[0]

        token = this.$store.state.auth.access_token
        fileid = this.fileId
        projectid = this.project_id

        prevBodyStyleOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        // const jszip = document.createElement('script')
        // jszip.setAttribute('src', '/jszip.min.js')
        // jszip.setAttribute('type', 'text/javascript')
        // jszip.setAttribute('charset', 'utf-8')
        // document.body.appendChild(jszip)

        const scriptQtloader = document.createElement('script')
        scriptQtloader.setAttribute('id', 'scriptQtloader')
        scriptQtloader.setAttribute('src', '/qtloader.js')
        scriptQtloader.setAttribute('type', 'text/javascript')
        scriptQtloader.setAttribute('charset', 'utf-8')
        scriptQtloader.addEventListener('load', () => {
           const scriptUBViewer2dInit = document.createElement('script')
           scriptUBViewer2dInit.setAttribute('id', 'scriptUBViewer2dInit')
           scriptUBViewer2dInit.setAttribute('src', '/UBViewer2s-init.js')
           scriptUBViewer2dInit.setAttribute('type', 'text/javascript')
           scriptUBViewer2dInit.setAttribute('charset', 'utf-8')
           document.body.appendChild(scriptUBViewer2dInit)    

        });
        document.body.appendChild(scriptQtloader)

        // this.$store.dispatch('common/getFileInfo', {id: this.fileId + '/info'})
        // .then(res => {
        //     this.model = res
        //     const name = res.name
        //     this.$store.commit('toolbar/setDctView', {name: name, status: ''})
        //
        //     this.init()
        // })
        // .catch(er => {
        //     console.log('Ошибка загрузки файлов', er)
        // })
    },
    beforeDestroy(){
        destroyModule();

        document.body.style.overflow = prevBodyStyleOverflow        

        const scriptQtloader = document.getElementById('scriptQtloader');
        if (scriptQtloader !== null)
            document.body.removeChild(scriptQtloader)

        const scriptUBViewer2dInit = document.getElementById('scriptUBViewer2dInit');
        if (scriptUBViewer2dInit !== null)
            document.body.removeChild(scriptUBViewer2dInit)

        this.$store.commit('workflow/setPdfPage', false)        
    }
}
</script>
