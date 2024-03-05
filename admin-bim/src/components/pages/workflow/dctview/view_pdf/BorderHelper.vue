<template>
	<div
		class="m-comment-marker--helper"
		:class="{active: borderHelper.status}">
		<div class="m-comment-marker--value">{{borderHelper.value}}</div>
	</div>
</template>

<script>
export default {
	data(){
		return {
			borderHelperPos: {
				x: 0,
				y: 0
			}
		}
	},
	computed: {
		borderHelper(){
			let marker = this.$store.state.comments.borderHelper
			if(marker.status){
				this.setPosition(marker.x, marker.y)
			}
			return marker
		}
	},
	methods: {
		setPosition(x, y){
			let el = this.$el
			el.style.left = x - 13 + 'px'
			el.style.top = y - 13 + 'px'
		},
		dragBorderHelper(e){
			if(this.borderHelper.status){
				let pos = {
					x: e.clientX,
					y: e.clientY
				}
				this.setPosition(pos.x, pos.y)
			}
		},
		removeBorderHelper(){
			if(this.borderHelper.status){
				this.$store.dispatch('comments/setBorderHelper', {
					status: false
				})
			}
		}
	},
	mounted(){
		window.addEventListener('mousemove', this.dragBorderHelper, false)
		window.addEventListener('mouseup', this.removeBorderHelper, false)
	},
	destroyed(){
		window.removeEventListener('mousemove', this.dragBorderHelper)
		window.removeEventListener('mouseup', this.removeBorderHelper)
	}
}
</script>
