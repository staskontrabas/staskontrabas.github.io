<template>
	<div
		ref="draft"
		id="draft"
		class="m-anno-draft active"
		:style="styles()"
		:class="{hidden: borderEdit && item.id !== borderEdit}"
		@mousedown.left.stop.prevent="letElem($event, 'startmove')"
		>
		<div
			v-for="(i, j) in 4"
			:key="'edge' + j"
			class="m-draft-edge"
			:class="'m-draft-edge-' + j"
			@mousedown.left.stop.prevent="letElem($event, 'startresize', 'edge' + j)"
			>
		</div>
		<div
			:key="'handler'"
			class="m-draft-handler"
			@mousedown.left.stop.prevent="letElem($event, 'startmove')"
			>
			<div class="m-comment-marker--value">{{item.name}}</div>
		</div>
		<div
			:key="'handle0'"
			class="m-draft-resizer"
			@mousedown.left.stop.prevent="letElem($event, 'startresize', 'handle2')"
			>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
		}
	},
	props: ['item'],
	computed: {
        borderEdit(){
            return this.$store.state.comments.borderEdit
        }
	},
	methods: {
		init(){
			this.$el.style.left = this.item.x + '%'
			this.$el.style.top = this.item.y + '%'
			if(this.item.w){
				this.$el.style.width = this.item.w + '%'
				this.$el.style.height = this.item.h + '%'
			}
		},
		styles(){
			let style = {
				left: this.item.x + '%',
				top: this.item.y + '%',
			}
			if(this.item.w){
				style.width = this.item.w + '%'
				style.height = this.item.h + '%'
			}
			if(this.$store.state.administration.user.id != this.item.uid){
				style['pointer-events'] = 'none'
			}
			return style
		},
		letElem(e, action, dirMove = ''){
			this.$emit('getBorder', {
				e: e,
				item: this.item,
				action: action,
				el: this.$el,
				dirMove: dirMove
			})
		}
	},
	mounted(){
		this.init()
	}
}
</script>
