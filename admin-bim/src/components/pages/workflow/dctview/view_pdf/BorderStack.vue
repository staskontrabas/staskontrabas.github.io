<template>
	<div
		class="m-anno-conductor"
		:class="{novisible: !pdfInit}"
		ref="over"
		id="conductor"
		@mouseup.left.prevent="dropBorderHelper($event)"
		>
		<draft
			v-for="(i, j) in borderStack"
			:key="'border' + i.id"
			:item="i"
			@getBorder="getBorder"
			/>
	</div>
</template>

<script>
import draft from './PdfDraft'
export default {
	components: {
		draft
	},
	data() {
		return {
			border: '',
			borderEdit: null,
			borderW: 0,
			borderH: 0,
			posX: 0,
			posY: 0,
			pageX: 0,
			pageY: 0,
			move: false,
			dirMove: '',
			resize: false,
			parentEl: '',
			draftInit: {},
			draftDrag: false,
			draftShow: false,
			draftTransform: false
		}
	},
	props: ['width', 'height'],
	watch: {
		width(v){
			this.$el.style.width = v + 'px'
		},
		height(v){
			this.$el.style.height = v + 'px'
		},
		scale(v){
			let parent = this.$el.parentElement.getBoundingClientRect()
			this.parentEl = {
				x: parent.x,
				y: parent.y,
				width: Math.round(parent.width),
				height: Math.round(parent.height)
			}
			let el = this.$el.getBoundingClientRect()
			this.width = el.width
			this.height = el.height
			this.posX = Math.round(el.x - parent.x)
			this.posY = Math.round(el.y - parent.y)
		}
	},
	computed: {
		borderStack(){
			let comments = JSON.parse(JSON.stringify(this.$store.state.comments.comments))
			let borders = JSON.parse(JSON.stringify(this.$store.state.comments.borders))
			let list = []
			comments.map(c => {
				list = [...list, ...c.borders]
			})
            let stack = []
			borders.map(b => {
				if(!list.some(s => s == b.id)){
					stack = [...stack, b]
				}
			})

			return stack
		},
		borderHelper(){
			let border = this.$store.state.comments.borderHelper
			return border
		},
		pdfInit(){
			return this.$store.state.workflow.pdfInit
		}
	},
	methods: {
		dropBorderHelper(e){
			if(this.borderHelper.status){
				let box = this.$el.getBoundingClientRect()
				let x = e.clientX - box.x - 6
				let y = e.clientY - box.y - 6
	            this.$store.dispatch('comments/addBorder', {
	                x: parseFloat((100 * x / box.width).toFixed(2)),
	                y: parseFloat((100 * y / box.height).toFixed(2))
	            })
			}
		},
		getBorder(o){
			let parentBox = this.$el.getBoundingClientRect()
			let elBox = o.el.getBoundingClientRect()
			this.parentEl = {
				x: parentBox.x,
				y: parentBox.y,
				width: Math.round(parentBox.width),
				height: Math.round(parentBox.height)
			}
			this.border = o.el
			this.borderEdit = o.item
			this.posX = elBox.x - parentBox.x
			this.posY = elBox.y - parentBox.y
			this.borderW = elBox.width
			this.borderH = elBox.height
			this[o.action](o.e, o.dirMove)
		},
		setDraftAttr(o){
			let el = this.border
			let attr = {
				x: this.posX,
				y: this.posY,
				w: this.borderW,
				h: this.borderH
			}
			o = {...attr, ...o}
			let parent = this.parentEl
			let relativeX = (100 * o.x / parent.width).toFixed(2)
			let relativeY = (100 * o.y / parent.height).toFixed(2)
			let relativeW = (100 * o.w / parent.width).toFixed(2)
			let relativeH = (100 * o.h / parent.height).toFixed(2)
			el.style.left = relativeX + '%'
			el.style.top = relativeY + '%'
			el.style.width = relativeW + '%'
			el.style.height = relativeH + '%'
		},
		startresize(e, dir){
			this.dirMove = dir
			this.pageX = e.clientX
			this.pageY = e.clientY
			this.resize = true
		},
		startmove(e){
			this.pageX = e.clientX
			this.pageY = e.clientY
			this.move = true
		},
		drag(e){
			if(this.move){
				let x = e.clientX - this.pageX + this.posX
				let y = e.clientY - this.pageY + this.posY
				let check = this.checkMove(x, y)
				x = check.x
				y = check.y
				this.setDraftAttr({x: x, y: y})
			}
			if(this.resize){
				if(this.dirMove == 'handle0'){
					this.setDraftAttr(this.checkResize(e, 1, 0, 0, 1))
				}
				else if(this.dirMove == 'handle1'){
					this.setDraftAttr(this.checkResize(e, 1, 1, 0, 0))
				}
				else if(this.dirMove == 'handle2'){
					this.setDraftAttr(this.checkResize(e, 0, 1, 1, 0))
				}
				else if(this.dirMove == 'handle3'){
					this.setDraftAttr(this.checkResize(e, 0, 0, 1, 1))
				}

				else if(this.dirMove == 'edge0'){
					this.setDraftAttr(this.checkResize(e, 1, 0, 0, 0))
				}
				else if(this.dirMove == 'edge1'){
					this.setDraftAttr(this.checkResize(e, 0, 1, 0, 0))
				}
				else if(this.dirMove == 'edge2'){
					this.setDraftAttr(this.checkResize(e, 0, 0, 1, 0))
				}
				else if(this.dirMove == 'edge3'){
					this.setDraftAttr(this.checkResize(e, 0, 0, 0, 1))
				}
			}
		},
		checkResize(e, t, r, b, l){
			let attr = {}
			let dx = e.clientX - this.pageX
			let dy = e.clientY - this.pageY
			let parent = this.parentEl
			if(t){
				attr.y = (this.posY + dy) <= 0 ? 0 : this.posY + dy
				attr.h = attr.y > 0 ? this.borderH - dy : this.borderH + this.posY
				if(attr.h < 13){
					//attr.h *= -1
					attr.h = attr.h < 0 ? attr.h * (-1) + 13: 13
					attr.y = this.borderH + this.posY - 13
					if(attr.h + attr.y >= parent.height){
						attr.h = parent.height - attr.y
					}
				}
				if(attr.y + 8>= parent.height){
					attr.y = parent.height - 8
					attr.h = 8
				}
			}
			if(r){
				attr.w = (this.posX + dx + this.borderW) >= parent.width ? parent.width - this.posX : this.borderW + dx
				if(attr.w < 13){
					attr.x = attr.w < 0 ? this.posX + dx + this.borderW : this.posX
					attr.w = attr.w < 0 ? attr.w * (-1) + 13: 13
					//attr.w *= -1
					//attr.x = this.posX + dx + this.markerW
					if(attr.x <= 0){
						attr.x = 0
						attr.w = this.posX + 13
					}
				}
			}
			if(b){
				attr.y = this.posY
				attr.h = (this.posY + dy + this.borderH) >= parent.height ? parent.height - this.posY : this.borderH + dy
				if(attr.h < 13){
					attr.y = attr.h < 0 ? this.posY + dy + this.borderH : this.posY
					attr.h = attr.h < 0 ? attr.h * (-1) + 13: 13
					if(attr.y <= 0){
						attr.y = 0
						attr.h = this.posY + 13
					}
				}
			}
			if(l){
				attr.x = (this.posX + dx) <= 0 ? 0 : this.posX + dx
				attr.w = attr.x > 0 ? this.borderW - dx : this.borderW + this.posX
				if(attr.w < 13){
					//attr.w *= -1
					attr.w = attr.w < 0 ? attr.w * (-1) + 13: 13
					attr.x = this.borderW + this.posX - 13
					if(attr.w + attr.x >= parent.width){
						attr.w = parent.width - attr.x
					}
				}
				if(attr.x + 8>= parent.width){
					attr.x = parent.width - 8
					attr.w = 8
				}
			}
			return attr
		},
		endEvent(e){
			if(this.move){
				this.move = false
				let el = this.border
				this.posX = el.offsetLeft
				this.posY = el.offsetTop
				let parent = this.parentEl
				let relativeX = 100 * this.posX / parent.width
				let relativeY = 100 * this.posY / parent.height
				let relativeW = 100 * this.borderW / parent.width
				let relativeH = 100 * this.borderH / parent.height
				this.$store.dispatch('comments/updateBorder', {
					id: this.borderEdit.id,
					name: this.borderEdit.name,
					x: parseFloat(relativeX.toFixed(2)),
					y: parseFloat(relativeY.toFixed(2)),
					w: parseFloat(relativeW.toFixed(2)),
					h: parseFloat(relativeH.toFixed(2))
				})
			}
			if(this.resize){
				this.resize = false
				let el = this.border
				this.posX = el.offsetLeft
				this.posY = el.offsetTop
				this.borderW = el.offsetWidth
				this.borderH = el.offsetHeight
				let parent = this.parentEl
				let relativeX = 100 * this.posX / parent.width
				let relativeY = 100 * this.posY / parent.height
				let relativeW = 100 * this.borderW / parent.width
				let relativeH = 100 * this.borderH / parent.height
				this.$store.dispatch('comments/updateBorder', {
					id: this.borderEdit.id,
					name: this.borderEdit.name,
					x: parseFloat(relativeX.toFixed(2)),
					y: parseFloat(relativeY.toFixed(2)),
					w: parseFloat(relativeW.toFixed(2)),
					h: parseFloat(relativeH.toFixed(2))
				})
			}
		},
		checkMove(x, y){
			let parent = this.parentEl
			let el = this.border.getBoundingClientRect()
			if(y <= 0){
				y = 0
			}
			if(x <= 0){
				x = 0
			}
			if(y + el.height >= parent.height){
				y = parent.height - el.height
			}
			if(x + el.width >= parent.width){
				x = parent.width - el.width
			}
			return {x: x, y: y}
		},
	},
	mounted(){
		window.addEventListener('mousemove', this.drag, false)
		window.addEventListener('mouseup', this.endEvent, false)
	},
	destroyed(){
		window.removeEventListener('mousemove', this.drag)
		window.removeEventListener('mouseup', this.endEvent)
	}
}
</script>
