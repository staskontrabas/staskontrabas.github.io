<template>
	<div
		class="m-anno-draft"
		:style="anno_style()"
		:class="{novisible: !commentHover && !activeComment, active: commentHover || activeComment}"
		>
		<div
			class="m-draft-handler"
			>
			<div class="m-comment-marker--value">{{anno.name}}</div>
		</div>
	</div>
</template>

<script>

import { mapState } from "vuex"
export default {
	data() {
		return {
		}
	},
	props: ['anno'],
    computed: mapState({
		commentHover(state){
			let cmnt = state.comments.comments.filter(c => c.id == state.comments.draftHover)
			return cmnt.length ? cmnt[0].borders.some(b => b == this.anno.id) : false
		},
		activeComment(state){
			let cmnt = state.comments.comments.filter(c => c.id == state.comments.activeComment)

			return cmnt.length ? cmnt[0].borders.some(b => b == this.anno.id) : false
		}
	}),
	methods: {
		anno_style(){
			return {
				left: this.anno.x + '%',
				top: this.anno.y + '%',
				width: this.anno.w + '%',
				height: this.anno.h + '%'
			}
		}
	}
}
</script>
