<template>
    <v-container fluid fill-height text-xs-center pa-0 class="m-container">
        <v-layout wrap ma-0 ref="wrap">
<div style="height: 100%; width: 100%;">
        <!--
            <div class="b-zoom" ref="b-zoom">
                <v-btn
                    text
                    class="m-btn m-btn-icon--cube mx-1"
                    @click.stop="zoomout"
                    :disabled="stateBtn"
                    color="#7f7f7f">
                    <v-icon size="24">mdi-magnify-minus-outline</v-icon>
                </v-btn>
                <v-btn
                    text
                    class="m-btn m-btn-icon--cube mx-1"
                    @click.stop="zoomin"
                    :disabled="stateBtn"
                    color="#7f7f7f">
                    <v-icon size="24">mdi-magnify-plus-outline</v-icon>
                </v-btn>
            </div>
        -->

            <div
                class="m-pdf-wrap"
                :class="{'no-event': no_event}"
                ref="pdf-wrap"
                :style="style_pdf"
                >
    			<div
                    ref="pdf"
                    :class="{'pdf-move': mouse_down}"
                    class="m-zoom">

    				<div id="viewerContainer" ref="container" class="pdf-container"/>
                    <div
                        v-show="compareMode"
                        ref="compare-wrap"
                        class="pdf-container pdf-container--twice__wrap"
                        :style="{width: twice_width + '%'}">
                        <span
                            v-show="model && model.files.length < 2"
                            class="pdf-container--twice__wrap--desc"> Нужно как минимум две версии файла. Загрузите еще одну версию. </span>
                        <div
                            ref="containerTwice"
                            class="pdf-container pdf-container--twice"/>
                    </div>

    				<div
                        v-show="!compareMode"
    					class="m-anno-view--stack"
    					:class="{novisible: !pdfInit}"
    					ref="stack"
    					>
    					<anno
    						v-for="(i, j) in anno_list"
    						:key="'stack' + j"
    						:anno="i"
    					/>
    				</div>
    				<div
                        v-show="!compareMode"
    					class="m-anno-view"
    					:class="{novisible: !pdfInit}"
    					ref="view"
    					>
    					<anno
    						v-for="(i, j) in anno_list"
    						:key="j"
    						:anno="i"
    					/>
    				</div>

    				<border-stack :width="version.once.pdfWidth" :height="version.once.pdfHeight" />

    				<border-helper v-show="!compareMode"/>

                    <div
                        v-show="compareMode"
                        ref="dragger"
                        class="dragger--wrap"
                        :style="compare_style">
                        <div
                            ref="compare-handler"
                            class="dragger--handler"
                            />
                    </div>

    			</div>
            </div>

            <v-card
                v-show="compareMode"
                class="m-version-pdf m-version-pdf--left">
                <v-menu
                    top
                    close-on-click
                    >
                    <template v-slot:activator="{ on, attrs }">
                        <v-card-text
                            class="px-3 py-2"
                            v-bind="attrs"
                            v-on="on"
                            >
                            <v-list-item class="pa-0">
                                <span>V{{version.once.value}}</span>
                                <v-spacer></v-spacer>
                                <v-icon right>
                                    mdi-chevron-down
                                </v-icon>
                            </v-list-item>
                        </v-card-text>
                    </template>
                    <v-list v-if="getVersionList.length">
                        <v-list-item
                            v-for="(item, index) in getVersionList"
                            :key="index"
                            @click="updatePdf(item, 'once')"
                            >
                            <v-list-item-title>V{{ item }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-card>

            <v-card
                v-show="compareMode && version.twice.value != 0"
                class="m-version-pdf m-version-pdf--right">
                <v-menu
                    top
                    close-on-click
                    >
                    <template v-slot:activator="{ on, attrs }">
                        <v-card-text
                            class="px-3 py-2"
                            v-bind="attrs"
                            v-on="on"
                            >
                            <v-list-item class="pa-0">
                                <span>V{{version.twice.value}}</span>
                                <v-spacer></v-spacer>
                                <v-icon right>
                                    mdi-chevron-down
                                </v-icon>
                            </v-list-item>
                        </v-card-text>
                    </template>
                    <v-list v-if="getVersionList.length">
                        <v-list-item
                            v-for="(item, index) in getVersionList"
                            :key="index"
                            @click="updatePdf(item, 'twice')"
                            >
                            <v-list-item-title>V{{ item }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-card>

            <panel-options
                :options="options"
                :params="optionParams"
                @setOption="setOption"
                @setSubOption="setSubOption"/>

</div>
		</v-layout>

        <iframe ref="pdf-frame" style="height:0; width:0; border: 0;"></iframe>
	</v-container>
</template>

<script>
import { mapState } from "vuex"
import { v4 as uuidv4 } from 'uuid'
import Tools from "./Tools"
import PanelOptions from "./PanelOptions"
import anno from './view_pdf/PdfAnno'
import borderStack from './view_pdf/BorderStack'
import borderHelper from './view_pdf/BorderHelper'
import pdfjsLib from 'pdfjs-dist/webpack.js'
import {PDFLinkService, PDFPageView, PDFFindController, DefaultAnnotationLayerFactory, DefaultTextLayerFactory } from 'pdfjs-dist/web/pdf_viewer.js'

function isPDFDocumentLoadingTask(obj){
	return typeof(obj) === 'object' && obj !== null && obj.__PDFDocumentLoadingTask === true
}

function createLoadingTask(src, options){
	let source
	if (typeof(src) === 'string')
		source = {url: src}
	else if(typeof(src) === 'object' && src !== null)
		source = Object.assign({}, src)
	else
		throw new TypeError('invalid src type')

	source.CMapReaderFactory = function(){
		this.fetch = function(query){
			return import('raw-loader!pdfjs-dist/cmaps/'+query.name+'.bcmap' /* webpackChunkName: "noprefetch-[request]" */)
			.then(function(bcmap) {
				return {
					cMapData: bcmap,
					compressionType: pdfjsLib.CMapCompressionType.BINARY,
				}
			})
		}
	}

	let loadingTask = pdfjsLib.getDocument(source)
	loadingTask.__PDFDocumentLoadingTask = true

	if(options && options.onPassword)
		loadingTask.onPassword = options.onPassword

	if(options && options.onProgress)
		loadingTask.onProgress = options.onProgress

	return loadingTask
}

export default {
    name: 'ViewPdf',
    components: {
        Tools,
        PanelOptions,
		anno,
		borderStack,
		borderHelper
    },
	props: {
        // model: {
        //     type: Object,
        //     default: null
        // },
        project_id: {
            type: String,
            default: ''
        }
	},
    data(){
        return {
            model: null,
            fileId: '',
            docId: '',
            FUrl: null,
			scale: 'page-mini',
    		btn_off: false,
			toolsbar: false,
            style_pdf: {},
			no_event: false,
            screen: '',
            blob: '',
            version: {
                once: {
                    value: 0,
        		    annotation: false,
            		text: false,
        			pdf: null,
        			pdfViewer: null,
        			pdfWidth: 0,
        			pdfHeight: 0,
                    internalSrc: ''
                },
                twice: {
                    value: 0,
        		    annotation: false,
            		text: false,
        			pdf: null,
        			pdfViewer: null,
        			pdfWidth: 0,
        			pdfHeight: 0,
                    internalSrc: ''
                }
            },
			loading: true,
			newScale: 1,
    		page: 1,
            num_pages: 0,
    		rotate: 0,
    		annotation: false,
    		text: true,
            mouse_down: 0,
            posMouse: {x:0, y: 0},
            posCompare: {x:0},
            compareMode: false,
            compare_handler: {
                height: 0,
                top: 0,
                left: 50
            },
            twice_width: 50,
            options: {
                prev: {
                    name: 'prev',
                    title: 'Предыдущая страница',
                    active: false,
                    turnoff: true,
                    action: 'prev_page',
                    children: null,
                    icon: 'mdi-chevron-left',
                    divider: false,
                    hidden: false
                },
                num_pages: {
                    name: 'numpages',
                    title: false,
                    active: false,
                    turnoff: true,
                    action: false,
                    children: null,
                    icon: false,
                    type: 'text',
                    value: 'num_pages',
                    divider: false,
                    hidden: false
                },
                next: {
                    name: 'next',
                    title: 'Следующая страница',
                    active: false,
                    turnoff: true,
                    action: 'next_page',
                    children: null,
                    icon: 'mdi-chevron-right',
                    divider: false,
                    hidden: false
                },
                zoomout: {
                    name: 'zoomout',
                    title: 'Zoom -',
                    active: false,
                    turnoff: true,
                    action: 'zoomout',
                    children: null,
                    icon: 'mdi-magnify-minus-outline',
                    divider: false,
                    hidden: false
                },
                zoomin: {
                    name: 'zoomin',
                    title: 'Zoom +',
                    active: false,
                    turnoff: true,
                    action: 'zoomin',
                    children: null,
                    icon: 'mdi-magnify-plus-outline',
                    divider: false,
                    hidden: false
                },
                printer: {
                    name: 'printer',
                    title: 'Печать',
                    active: false,
                    turnoff: true,
                    action: 'print',
                    children: null,
                    icon: 'trd-printer',
                    divider: false,
                    hidden: false
                },
                compare: {
                    name: 'compare',
                    title: 'Сравнить',
                    active: false,
                    action: 'compare',
                    children: null,
                    icon: 'trd-compare',
                    divider: false,
                    hidden: false
                },
                get_version: {
                    name: 'get_version',
                    title: 'Версия',
                    active: false,
                    action: 'get_version',
                    children: null,
                    icon: 'icon-version-1',
                    divider: false,
                    toggle: false,
                    hidden: false
                },
                download: {
                    name: 'download',
                    title: 'Скачать',
                    active: false,
                    turnoff: true,
                    action: 'download',
                    children: null,
                    icon: 'trd-download',
                    divider: true,
                    hidden: false
                }
            }
        }
    },
	computed: mapState({
		anno_list(state){
    		let borders = state.comments.borders
            let comments = state.comments.comments

            let list = []
            comments.map(c => {
                c.borders.map(b => {
                    list = [...list, ...borders.filter(i => i.id == b)]
                })
            })

			return list
		},
		pdfInit(state){
			return state.workflow.pdfInit
		},
        stateBtn(){
            return this.btn_off
        },
        compare_style(){
            return {
                left: this.compare_handler.left + '%',
                height: this.compare_handler.height + 'px',
                top: this.compare_handler.top + 'px'
            }
        },
        getVersionList(){
            if(!this.model){
                return []
            }
            let files = this.model.files.map(f => f.version)
            return files.filter(f => f != this.version.once.value && f != this.version.twice.value)
        },
        optionParams(){
            return {
                num_pages: this.num_pages ? this.page + ' из ' + this.num_pages : ''
            }
        }
	}),
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
        },
		pdf: function(val){
			var pdfInfo = val.pdfInfo || val._pdfInfo
      		this.$emit('numpages', pdfInfo.numPages)
		},
		page: function(val){
			var self = this
			this.version.once.pdf.getPage(val).then(function(pdfPage){
		    self.version.once.pdfViewer.setPdfPage(pdfPage)
				self.version.once.pdfViewer.draw()
			})
		},
    	// scale: function(val){
		// 	this.drawScaled(val)
		// },
		rotate: function(newRotate){
			if(this.version.once.pdfViewer){
				this.version.once.pdfViewer.update(this.scale, newRotate)
				this.version.once.pdfViewer.draw()
			}
		}
    },
    methods: {
        setOption(o){
            this.options[o.name].active = o.turnoff ? o.active : !o.active
            if(this.options[o.name].action){
                this[this.options[o.name].action](!o.active)
            }
        },
        setSubOption(o){
            this.options[o.name].children[o.sub_name].active = !o.sub_active
            if(this.options[o.name].children[o.sub_name].action){
                this[this.options[o.name].children[o.sub_name].action](this.options[o.name].children[o.sub_name])
            }
            this.setOption(o)
        },
        prev_page(){
            if(this.page > 1){
                this.page--
            }
        },
        next_page(){
            if(this.page < this.num_pages){
                this.page++
            }
        },
        print(){
            this.$store.dispatch('common/getFile', {id: this.FUrl, typeBlob: 'blob'})
            .then(res => {
                let blob = new Blob([res.file], {type: 'application/pdf'})
                let objectURL = URL.createObjectURL(blob)
                this.$refs['pdf-frame'].src = objectURL
                this.$refs['pdf-frame'].onload = () => {
                    setTimeout(() => {
                        URL.revokeObjectURL(objectURL)
                        this.$refs['pdf-frame'].focus()
                        this.$refs['pdf-frame'].contentWindow.print()
                    }, 1)
                }
            })
        },
        get_version() {
          console.log(this.model)
          if(this.options.get_version.toggle == false){
            const b64toUrl = async (base64Data) => {
              var file = await new Blob([base64Data], {type:'application/pdf'});
              return  URL.createObjectURL(file)
            }

            this.$store.dispatch('common/getFileDelta', this.model.files[0].url).then(response => {
              b64toUrl(response.data).then(file => {
                console.log(this.$refs.container)
                this.$refs.container.innerHTML = ''
                this.setPDF(file, this.$refs.container, 'once')
              })
            })
            this.options.get_version.toggle = true
          } else {
            this.$refs.container.innerHTML = ''
            this.$store.dispatch('common/getFile', {id: this.model.files[0].url})
                .then(res => {
                  this.$nextTick(() => {
                    this.setPDF(res.file, this.$refs.container, 'once')
                    this.options.get_version.toggle = false
                  })
                })
          }
        },
        download(){
            let url = this.FUrl
            let name = this.model.name
            let uuid = uuidv4()
            this.$store.dispatch('common/setUploadNote', [{
                name: name,
                uuid: uuid,
                action: 'download',
                pushin: true
            }])
            this.$store.dispatch('common/getFile', {
                id: url,
                uuid: uuid,
                typeBlob: 'blob'
            })
            .then(res => {
                this.$store.dispatch('common/setUploadNote', [{
                    uuid: uuid,
                    action: 'download',
                    pushin: false
                }])
                if(!res.error){
                    let a = document.createElement("a")
                    let objectURL = URL.createObjectURL(res.file)
                    a.href = objectURL
                    a.download = name
                    document.body.appendChild(a)
                    a.click()
                    URL.revokeObjectURL(objectURL)
                    a.remove()
                }
                else{
                    console.log('downloadFile error', err)
                }
            })
            .catch(err => {
                console.log('downloadFile error', err)
            })
        },
        compare(v){
            let files = this.model.files || false
            this.compareMode = v
            if(v){
                this.twice_width = this.twice_width
                    ? this.twice_width
                    : 50
                if(files){
                    let fileList = this.model.version
                        ? (() => {
                            let vers = files.filter(f => f.id != this.model.version)
                            return vers ? vers : files
                        })()
                        : files
                    if(this.version.once.value != fileList[0].version){
                        this.version.twice.value = fileList[0].version
                        this.$store.dispatch('common/getFile', {id: fileList[0].url})
                        .then(res => {
                            this.setPDF(res.file, this.$refs.containerTwice, 'twice')

                            this.setCompareHandler()
                        })
                    }
                    else{
                        this.setCompareHandler()
                    }
                }
            }
            else{
                this.$refs.containerTwice.innerHTML = ''
                this.version.twice.pdf = null
                this.compare_handler.left = 50
                this.twice_width = 50
                let file = this.model.version
                    ? (() => {
                        let vers = this.model.files.filter(f => f.id == this.model.version)
                        return vers ? vers[0] : files[0]
                    })()
                    : files[0]
                if(this.version.once.value != file.version){
                    this.version.once.value = file.version
                    this.$refs.container.innerHTML = ''
                    this.$store.dispatch('common/getFile', {id: file.url})
                    .then(res => {
                        this.$nextTick(() => {
                            this.setPDF(res.file, this.$refs.container, 'once')
                        })
                    })
                }
            }
        },
        setCompareHandler(){
            this.$refs['compare-handler'].addEventListener('mousedown', this.onCompareDown, false)
            let wrap = this.$refs['pdf-wrap']
            let compare_wrap = this.$refs['compare-wrap']
            this.compare_handler.height = wrap.clientHeight
            this.compare_handler.top = wrap.scrollTop - parseInt(getComputedStyle(wrap).paddingTop)
            this.compare_handler.left = 100 - this.twice_width
        },
        onCompareDown(e){
            e.stopPropagation()
            document.body.classList.add('select-none')
            this.posCompare = {
                x: e.clientX,
                left: this.version.once.pdfViewer.width / 100 * this.compare_handler.left,
                width: this.twice_width
            }
            this.compare_down = 1
            document.addEventListener('mouseup', this.onCompareUp, false)
            document.addEventListener('mousemove', this.onMouseMove, false)
        },
        onCompareUp(e){
            document.body.classList.remove('select-none')
            this.compare_down = 0
            document.removeEventListener('mouseup', this.onCompareUp)
            document.removeEventListener('mousemove', this.onMouseMove)
        },
        zoomin(){
            this.btn_off = true
            this.scale = typeof this.scale === 'string'? 1 : this.scale = Math.abs(this.scale) + 1
            this.drawScaled(this.scale)
        },
        zoomout(){
            this.btn_off = true
            this.scale = typeof this.scale === 'string'? -1 : this.scale = (Math.abs(this.scale) + 1) * -1
            this.drawScaled(this.scale)
        },
        updatePdf(version, block){
            let file = this.model.files.find(f => f.version == version)
            let container = block == 'once'
                ? this.$refs['container']
                : this.$refs['containerTwice']
            container.innerHTML = ''
            this.version[block].value = file.version
            this.$store.dispatch('common/getFile', {id: file.url})
            .then(res => {
                this.$nextTick(() => {
                    this.setPDF(res.file, container, block)
                })
            })
        },
        setPDF(src, container, version){
          let self = this
          if(!isPDFDocumentLoadingTask(src)){
            self.version[version].internalSrc = createLoadingTask(src)
          }
          let pdfLinkService = new PDFLinkService()
          let annotationLayer = undefined
          let textLayer = undefined
          if(self.version[version].annotation){
            annotationLayer = new DefaultAnnotationLayerFactory()
          }
          if(self.version[version].text){
            textLayer = new DefaultTextLayerFactory()
          }

          self.version[version].internalSrc
          .then(pdfDocument => {
            // Document loaded, retrieving the page.
            self.version[version].pdf = pdfDocument
                  if(!this.num_pages){
                      this.num_pages = this.version.once.pdf.numPages
                  }
            return pdfDocument.getPage(self.page)
          }).then(pdfPage => {
              // Creating the page view with default parameters.
              self.version[version].pdfViewer = new PDFPageView({
              container: container,
              id: self.page + (new Date()).getTime(),
              scale: 1,
              defaultViewport: pdfPage.getViewport(1),
              // We can enable text/annotations layers, if needed
              textLayerFactory: textLayer,
              annotationLayerFactory: annotationLayer,
            })
              // Associates the actual page with the view, and drawing it
            self.version[version].pdfViewer.setPdfPage(pdfPage)
            pdfLinkService.setViewer(self.version[version].pdfViewer)
            //self.drawScaled('page-mini')//(self.scale)
                  if(version == 'twice'){
                      self.drawScaled('twice')
                  }
                  else{
                      self.drawScaled(self.scale)
                  }
            }).catch(err => self.$emit('error', err))
        },
		getWidthWrap(){
			let wrap = this.$refs['pdf-wrap']
			let padding = {
				r: parseInt(getComputedStyle(wrap).paddingRight),
				l: parseInt(getComputedStyle(wrap).paddingLeft),
				t: parseInt(getComputedStyle(wrap).paddingTop),
				b: parseInt(getComputedStyle(wrap).paddingBottom)
			}
			let width = wrap.clientWidth
			let height = wrap.clientHeight
			return {
                    width: width - (padding.r + padding.l),
                    height: height - (padding.t + padding.b)
            }
		},
		calculateScale(width=-1, height=-1){
			this.version.once.pdfViewer.update(1,this.rotate)
			if(width === -1 && height === -1){
				//width = this.$refs.container.offsetWidth
				width = this.getWidthWrap().width
			}
			let pageWidthScale = width / this.version.once.pdfViewer.viewport.width
			return pageWidthScale
		},
        getImageData(){
            let ratio = window.devicePixelRatio
            let wi = this.version.once.pdfViewer.width * ratio
            let hi = this.version.once.pdfViewer.height * ratio
            let canvas = this.version.once.pdfViewer.canvas
            // this.screen = canvas.toDataURL("image/png")

            let ctx = canvas.getContext("2d")
            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

            let canvas2 = document.createElement('canvas')
            canvas2.width = wi
            canvas2.height = hi
            let ctx2 = canvas2.getContext('2d')
            ctx2.putImageData(imgData,0,0)

            let borders = this.$store.state.comments.borders
            let comments = this.$store.state.comments.comments
            let active = this.$store.state.comments.activeComment

			let list = []
            let activeList = []
			comments
                .map(c => {
    				list = [...list, ...c.borders]
                    return c
    			})
                .filter(f => f.id == active)
                .map(c => {
    				activeList = [...activeList, ...c.borders]
    			})

            let stack = []
			borders.map(b => {
				if(!list.some(s => s == b.id) || activeList.some(s => s == b.id)){
					stack = [...stack, b]
				}
			})
            stack.map(s => {
                ctx2.beginPath()
                ctx2.rect(
                    (s.x * wi / 100 + 2),
                    (s.y * hi / 100 + 2),
                    (s.w * wi / 100 - 4),
                    (s.h * hi / 100 - 4)
                )
                ctx2.fillStyle = "rgba(255, 216, 48, 0.3)"
                ctx2.fill()
                ctx2.lineWidth = 4
                ctx2.strokeStyle = "#ffd830"
                ctx2.stroke()

                ctx2.beginPath()
                // ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
                // ctx.shadowBlur = 4
                // ctx.shadowOffsetX = 1
                // ctx.shadowOffsetY = 2

                ctx2.arc((s.x * wi / 100 + 4), (s.y * hi / 100 + 4), 10, 0, 2 * Math.PI, false)
                ctx2.fillStyle = '#ffd830'
                ctx2.fill()

                ctx2.beginPath()
                ctx2.fillStyle = "#ffffff"
                let widthText = ctx.measureText(s.name)
                ctx2.font = "12px 'Fira Sans'"
                ctx2.fillText(s.name, (s.x * wi / 100) + 4 - widthText.width / 2, (s.y * hi / 100) + 8)
                ctx2.fill()
            })
            this.screen = canvas2.toDataURL("image/png")
            canvas2.toBlob((blob) => {
                this.blob = blob
            })

        },
		drawScaled(newScale){
			if(this.version.once.pdfViewer){
				if(newScale === 'page-mini' || newScale === 'page-full'){
					newScale = this.calculateScale()
					this.newScale = newScale
				}
                else if(newScale === 'twice'){
                    newScale = this.newScale
                }
				else{
					let k = newScale > 0 ? 1 : -1
					newScale = this.newScale + this.newScale / 10 * k
					this.newScale = newScale
				}
				this.version.once.pdfViewer.update(newScale, this.rotate)
				this.resizeLayers()
				this.version.once.pdfViewer.draw()
				.then(res => {
					setTimeout(() => {
						this.btn_off = false
						this.$store.commit('workflow/setPdfInit', true)
					}, 0)
				})
                if(this.version.twice.pdf){
    				this.version.twice.pdfViewer.update(newScale, this.rotate)
    				this.version.twice.pdfViewer.draw()
                }
				this.loading = false
			}
		},
		resizeLayers(){
			//this.$el.style.width = this.pdfViewer.width + 20 + 'px'
    		this.$refs['pdf'].style.width = this.version.once.pdfViewer.width + 'px'// + 20 + 'px'
			this.version.once.pdfWidth = this.version.once.pdfViewer.width
			this.version.once.pdfHeight = this.version.once.pdfViewer.height
			//let over = this.$refs.over
			//over.style.width = this.pdfViewer.width + 'px'
			//over.style.height = this.pdfViewer.height + 'px'
			let view = this.$refs.view
			view.style.width = this.version.once.pdfViewer.width + 'px'
			view.style.height = this.version.once.pdfViewer.height + 'px'
			let stack = this.$refs.stack
			stack.style.width = this.version.once.pdfViewer.width + 'px'
			stack.style.height = this.version.once.pdfViewer.height + 'px'

            let wrap = this.$refs['pdf-wrap']
            // let compare_wrap = this.$refs['compare-wrap']
            this.$nextTick(() => {
                this.compare_handler.left = 100 - this.twice_width
                this.compare_handler.top = -1 *  (this.$refs['container'].getBoundingClientRect().y - wrap.getBoundingClientRect().y)
                this.compare_handler.height = wrap.clientHeight
            })
		},
        onMouseDown(e){
            document.body.classList.add('select-none')
            this.posMouse = {
                x: e.clientX,
                y: e.clientY,
                scrollY: this.$refs['pdf-wrap'].scrollTop,
                scrollX: this.$refs['pdf-wrap'].scrollLeft
            }
            this.mouse_down = 1
            document.addEventListener('mouseup', this.onMouseUp, false)
            document.addEventListener('mousemove', this.onMouseMove, false)
        },
        onMouseUp(e){
            this.mouse_down = 0
            document.body.classList.remove('select-none')
            document.removeEventListener('mouseup', this.onMouseUp)
            document.removeEventListener('mousemove', this.onMouseMove)
        },
        onMouseMove(e){
            if(this.mouse_down == 1){
                let dy = this.posMouse.y - e.clientY
                this.$refs['pdf-wrap'].scrollTop = this.posMouse.scrollY + dy
                let dx = this.posMouse.x - e.clientX
                this.$refs['pdf-wrap'].scrollLeft = this.posMouse.scrollX + dx
            }
            if(this.compare_down == 1){
                let dx = this.posCompare.x - e.clientX
                const container = this.$refs['container'].getBoundingClientRect()
                const wrap = this.$refs['pdf-wrap']
                const bzoom = this.$refs['b-zoom']
                if(this.posCompare.left - dx >= wrap.clientWidth - container.x){
                }
                // else if(this.posCompare.left - dx <= bzoom.clientWidth){
                // }
                else if(this.posCompare.left - dx <= 0){
                    this.compare_handler.left = 0
                    this.compare_handler.height = wrap.clientHeight
                    this.twice_width = 100//container.width
                }
                else if(this.posCompare.left - dx >= container.width){
                    this.compare_handler.left = 100//container.width
                    this.compare_handler.height = wrap.clientHeight
                    this.twice_width = 0
                }
                else{
                    let len = 100 / this.version.once.pdfViewer.width * (this.posCompare.left - dx)
                    this.compare_handler.left = len
                    this.compare_handler.height = wrap.clientHeight
                    this.twice_width = 100 - len//this.posCompare.width + dx
                }
            }
        },
        compareForScroll(evt){
            this.compare_handler.top = -1 *  (this.$refs['container'].getBoundingClientRect().y - evt.target.getBoundingClientRect().y)
            this.compare_handler.height = evt.target.clientHeight
            if(evt.wheelDelta < 0){
                this.zoomout()
            }
            else{
                this.zoomin()
            }
        }
    },
    beforeCreate(){
        this.$store.commit('workflow/setPdfPage', true)
    },
    mounted(){
        const queryString = window.location.search
        const urlParams = new URLSearchParams(queryString)
        const files = urlParams.getAll('file')
        this.fileId = files[0]
        const doc = urlParams.getAll('doc')
        console.log('parsed doc', doc)
        this.docId = doc[0]
        let access_query = urlParams.getAll('access').length ? urlParams.getAll('access')[0] : null

        let pdfWrap = this.$refs['pdf-wrap']
        //let bbox = this.getWidthWrap()
        let bbox = pdfWrap.getBoundingClientRect()
        this.style_pdf = {
            height: bbox.height + 'px'
        }


        let file = this.$store.state.workflow.listDocs.find(doc => doc.id == this.docId)
        
        if (access_query) {
            // Если доступ происходит по коду, необходимо получить данные с сервера
            this.$store.dispatch('workflow/getDoc', { id: this.docId, access_query: access_query, })
            .then(res => {
                this.$store.dispatch('common/getFile', { id: this.fileId + '/info', access_query: access_query, })
                .then(res => {
                    // console.log('got file by token', res)
                    this.version.once.value = res.version
                    this.$nextTick(() => {
                        setTimeout(() => this.setPDF(res.file, this.$refs.container, 'once'), 200)
                        this.$refs['pdf'].addEventListener('mousedown', this.onMouseDown, false)

                        this.$refs['pdf-wrap'].onwheel = (e) => {this.compareForScroll(e)}
                    })
                })
            })
        }
        this.model = file
        // console.log('-----------------', file)
        if(file) {
            this.version.once.value = file.version

            this.$store.dispatch('common/getFile', { id: this.fileId, access_query: access_query, })
            .then(res => {
                this.$nextTick(() => {
                    setTimeout(() => this.setPDF(res.file, this.$refs.container, 'once'), 200)
                    this.$refs['pdf'].addEventListener('mousedown', this.onMouseDown, false)

                    this.$refs['pdf-wrap'].onwheel = (e) => {this.compareForScroll(e)}
                })
            })
        }
    },
    beforeDestroy(){
        this.$store.commit('workflow/setPdfPage', false)
        this.$refs['pdf'].removeEventListener('mousedown', this.onMouseDown)
        this.$store.commit('workflow/setPdfInit', false)
    }
}
</script>
