<template>
    <div
        class="m-zoom"
        v-on:mousewheel.prevent="setScale"
        v-on:mousedown.prevent="mouseDown"
        v-on:mousemove.prevent="mouseMove"
        v-on:mouseup.prevent="mouseUp"
        v-on:mouseleave="start=false"
    >
        <div
            v-show='!loadImg'
            class="m-progress">
            <div
                class="m-progress-bar"
                ref='progress-bar'>
            </div>
            <div class="m-progress-value">Загрузка {{completedPercentage}} %</div>
        </div>
        <img
            v-show='loadImg'
            ref='image'
            :style='transformImg'
            :src='src'
        />
    </div>
</template>

<script>
    export default {
        name: 'Zoomer',
        data () {
            return {
                loadImg: false,
                src: '',
                scale: 1,
                step: 1.2,
                widthWrap: 0,
                heightWrap: 0,
                imgW: 0,
                imgH: 0,
                width: 0,
                height: 0,
                top: 0,
                left: 0,
                new_x: 0,
                new_y: 0,
                cursor: 'auto',
                start: false,
                positionPrev: {},
                transform: '',
                img: '',
                completedPercentage: 0
            }
        },
        computed: {
            styleWrap(){
                return {
                    width: this.widthWrap + 'px',
                    height: this.heightWrap + 'px'
                }
            },
            transformImg(){
                return {
                    transform: this.transform,
                    cursor: this.cursor,
                    //transition: this.start ? '' : 'all 0.2s ease-out'
                }
            }
        },
        watch:{
            start(v){
                if(v){
                    this.cursor = 'move'
                }
                else{
                    this.cursor = 'auto'
                }
            },
            loadImg(v){
                this.initCanvas()
            }
        },
        mounted(){
            this.$nextTick(() => {
                setTimeout(function(){
                    let self = this

                    this.imgLoad("https://materials.ubdev.ru:5443/img/2.jpg").then(res => {
                    //this.imgLoad("http://localhost:8080/img/2.jpg").then(res => {
                        self.src = res
                        let img = new Image()
                        img.onload = function(){
                            self.width = this.width
                            self.height = this.height

                            setTimeout(function(){
                                self.loadImg = true
                            }, 500)
                            window.URL.revokeObjectURL(res)
                        }
                        img.src = res
                    })
                }.bind(this), 1000)
            })
        },
        methods: {
            imgLoad(url){
                let thisImg = this
                return new Promise(function (resolve, reject) {
                    let xmlHTTP = new XMLHttpRequest()
                    xmlHTTP.open('GET', url,true)
                    xmlHTTP.responseType = 'arraybuffer'
                    xmlHTTP.onload = function(e) {
                        let blob = new Blob([this.response])
                        let src = window.URL.createObjectURL(blob)
                            resolve(src)
                    };
                    xmlHTTP.onprogress = function(e) {
                        thisImg.completedPercentage = parseInt((e.loaded / e.total) * 100)
                        thisImg.progressBar()
                    };
                    xmlHTTP.onloadstart = function() {
                        thisImg.completedPercentage = 0
                    };
                    xmlHTTP.send();
                })
            },
            progressBar(){
                let pb = this.$refs['progress-bar']
                pb.style.width = this.completedPercentage + '%'
            },
            initCanvas(){
                let parentW = this.$el.offsetWidth
                let parentH = this.$el.offsetHeight
                this.widthWrap = parentW
                this.heightWrap = parentH

                let width = 0
                let height = 0

                width = this.width
                height = this.height

                let scale = parentW / width
                this.width = width * scale
                this.height = height * scale

                if(this.height > parentH){
                    scale = parentH / height
                    this.width = width * scale
                    this.height = height * scale
                }
                this.imgW = this.width
                this.imgH = this.height
                this.new_x = this.left = (parentW - this.width) / 2
                this.new_y = this.top = (parentH - this.height) / 2
                Object.assign(this.$refs['image'].style, {
                    width: this.width + 'px',
                    height: this.height + 'px',
                    transform: 'matrix(1,0,0,1,'+this.left+','+this.top+')',
                    position: 'absolute',
                    cursor: this.cursor
                })
            },
            setScale(e){
                // Determine pointer origin in relation to picture
                let img = this.$refs['image']
                let offset = img.getBoundingClientRect()
                let os = this.$el.getBoundingClientRect()

                let pos = new  WebKitCSSMatrix(window.getComputedStyle(this.$refs['image']).webkitTransform)
                let originX = e.clientX - (os.left + pos.e)//e.clientX - offset.left
                let originY = e.clientY - (os.top + pos.f)//e.clientY - offset.top

                // Calculate current size of the image.
                let width = this.imgW * this.scale
                let height = this.imgH * this.scale
            		// Calculate the relative position of the mouse independent of current scale.
                let mx = originX / width
                let my = originY / height

                // onScroll ev

                if(e.deltaY < 0){
                    if(this.scale * this.step > 20){
                        return
                    }
                    this.scale *= this.step
                }
                else{
                    if(this.scale / this.step < 1){
                        return
                    }
                    this.scale /= this.step
                }

                // Update new image size and position based upon new scale.
                let new_width = this.imgW * this.scale
                let new_height = this.imgH * this.scale
                let new_mouse_x = new_width * mx
                let new_mouse_y = new_height * my
                this.new_x += originX - new_mouse_x
                this.new_y += originY - new_mouse_y
                this.MatrixCrt()
            },
            MatrixCrt(){
                let matrix = [this.scale, 0, 0, this.scale, this.new_x, this.new_y].join(",")
                this.transform = "matrix(" + matrix + ")"
            },
            mouseDown(e){
                this.start = true
                let bBox = this.$refs['image'].getBoundingClientRect()
                let pos = new  WebKitCSSMatrix(window.getComputedStyle(this.$refs['image']).webkitTransform)
                this.positionPrev.clientX = e.clientX
                this.positionPrev.clientY = e.clientY
                this.positionPrev.left = pos.e
                this.positionPrev.top = pos.f
                this.positionPrev.width = bBox.width
                this.positionPrev.height = bBox.height
                this.left = this.positionPrev.left
                this.top = this.positionPrev.top
            },
            mouseMove(e){
                if(this.start){
                    let dx = e.clientX - this.positionPrev.clientX
                    let dy = e.clientY - this.positionPrev.clientY

                    this.left = this.positionPrev.left + dx
                    this.top = this.positionPrev.top + dy

                    this.new_x = this.left
                    this.new_y = this.top

                    this.MatrixCrt()
                }
            },
            mouseUp(e){
                this.start = false
            }
        }
    }
</script>
