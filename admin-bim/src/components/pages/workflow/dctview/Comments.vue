<template>
    <div class="m-comment-box">
        <div class="m-comment-list">
            <div
                class="m-comment-list--items"
                ref="list-items">
                <v-row
                    dense
                    v-for="(item, index) in commentList"
                    :key="'comment' + item.id">
                    <v-col cols="12">
                        <comment :comment="item" :posActive.sync="posActive"/>
                    </v-col>
                </v-row>
            </div>
        </div>
        <div class="m-comment-header">
            <v-row dense>
                <v-col cols="12">
                    <v-row>
                        <v-col cols="6">
                            <v-card
                                :outlined="true"
                                color="#fafafa"
                                class="m-comment-header--tools">
                                <div
                                    class="m-comment-marker--item"
                                    v-for="(i, j) in borderStack"
                                    :key="'marker' + i.id"
                                    :class="{edit: i.id == markerEdit}"
                                    @mouseenter="markerHover(i)"
                                    @mouseleave="markerLeave(i)"
                                    @click="removeMarker(i)"
                                    >
                                    <div
                                        v-show="i.id != markerEdit"
                                        class="m-comment-marker--value">{{i.name}}</div>
                                    <v-icon
                                        v-show="i.id == markerEdit"
                                        size="14"
                                        color="#fff">close</v-icon>
                                </div>
                                <div class="m-comment-marker--add">
                                    <div
                                        class="m-comment-marker--btn"
                                        @click.stop="addMarker($event)"
                                        >
                                        <v-icon
                                            size="14"
                                            color="#fff">mdi-plus</v-icon>
                                    </div>
                                    <span>Маркер</span>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="6" class="d-flex">
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                color="primary"
                                class="m-btn"
                                @click="newTask"
                            >
                                Создать задачу
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-card
                        :outlined="true"
                        color="#fff"
                        class="m-comment-input"
                        :class="{active: focus}"
                        @mouseup="focusInput"
                        v-click-outside="focusInputRemove"
                        >
                        <v-container py-0>
                            <v-row>
                                <v-col cols="2" class="pb-0">
                                    <v-avatar
                                        size="30">
                                        <img
                                            :src="userAvatar.src"
                                        >
                                    </v-avatar>
                                </v-col>
                                <v-col cols="10" class="py-0">
                                    <v-textarea
                                        id="comment"
                                        placeholder="Комментировать"
                                        class="m-comment-no-border"
                                        v-model="comment"
                                        auto-grow
                                        outlined
                                        hide-details
                                        multi-line
                                        rows="2">
                                    </v-textarea>
                                </v-col>
                            </v-row>
                            <v-row v-show="focus">
                                <v-col cols="2" class="pt-0">
                                </v-col>
                                <v-col cols="10" class="pt-0">
                                    <v-card-actions class="pa-0">
                                        <v-btn
                                            :disabled="!comment"
                                            class="mt-2 m-btn"
                                            outlined
                                            dense
                                            color="primary"
                                            @click="saveComment"
                                        >
                                        Опубликовать
                                        </v-btn>
                                        <v-btn
                                            :disabled="!comment"
                                            class="mt-2 m-btn m-btn-normal"
                                            outlined
                                            dense
                                            color="normal"
                                            @click="clearComment"
                                        >
                                        Отмена
                                        </v-btn>
                                    </v-card-actions>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import { sortObj } from '@/utils/services'
import Comment from './comments/Comment'
import ClickOutside from '@/plugins/click_outside'

export default {
    name: 'Comments',
    components: {
        Comment
    },
    directives: {
        ClickOutside
    },
    props: ['document'],
    data () {
        return {
            comment: '',
            focus: false,
            posActive: 0
        }
    },
    computed: mapState({
        commentList(state){
            let comments = JSON.parse(JSON.stringify(state.comments.comments))
            let borders = JSON.parse(JSON.stringify(state.comments.borders))

            comments = comments.map(c => {
                let list = []
                c.borders.map(b => {
                    let item = borders.filter(f => f.id == b)
                    list = [...list, ...item]
                })
                c.borders = list
                c.version = this.document.version
                    ? (() => {
                        let vers = this.document.files.filter(f => f.id == this.document.version)
                        return vers ? vers[0].version : this.document.files[0].version
                    })()
                    : this.document.files.length
                        ? this.document.files[0].version
                        : '1'
                return c
            })

            return comments
        },
		borderStack(state){
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


			return sortObj(stack, 'name')
		},
        markerEdit(state){
            return state.comments.borderEdit
        },
        userAvatar(state){
            return state.administration.userAvatar
        }
    }),
    watch: {
        focus(v){
            this.focusComment(v)
        },
        posActive(v){
            this.scrollToComment(v)
        }
    },
    methods: {
        newTask(){
            this.$emit('newTask')
        },
        userCheck(b){
			return this.$store.state.administration.user.id == b.uid
        },
        addMarker(e){
            this.$store.dispatch('comments/setBorderHelper', {
                x: e.clientX,
                y: e.clientY,
                status: true
            })
        },
        markerHover(i){
            this.$store.commit('comments/editBorder', i.id)
        },
        markerLeave(i){
            this.$store.commit('comments/editBorder', false)
        },
        removeMarker(i){
            if(!this.userCheck(i)){
                return
            }
            this.$store.dispatch('comments/removeBorderInStack', i.id)
        },

        scrollToComment(v){
            this.$nextTick(() => {
                this.$refs['list-items'].scrollTo({top: v - 4, behavior: "smooth"})
            })
        },
        focusComment(v){
            this.$nextTick(() => {
                if(v){
                    let el = document.getElementById('comment')
                    el.focus()
                }
            })
        },
        saveComment: function(){
            this.$store.dispatch('comments/message', {
                pid: 0,
                text: this.comment,
                borders: this.borderStack.filter(b => this.userCheck(b)).map(b => b.id),
                action: 1
            })

            this.comment = ''
            this.focus = false
        },
        clearComment(){
            this.comment = ''
            this.focus = false
            //this.$store.commit('workflow/setDraft', false)
            //this.$store.commit('comments/setDraft', false)
        },
        focusInput(){
            this.focus = true
        },
        focusInputRemove(){
            if(this.focus && !this.comment){
                this.focus = false
            }
        }
    },
    created(){
        // let state = this.$store.state.comments
        // if(state.version != this.document.version){
        //     this.$emit('socketClose', state.version)
        //     this.$emit('socketOpen', this.document.version)
        // }
        //this.$store.dispatch('workflow/setComments', {id: this.documentId, type: '2d'})
        let commentState = this.$store.state.workflow.commentState
        if(commentState.status){
            this.comment = commentState.commentInput
            //this.$store.commit('workflow/updateMarkerStack', commentState.borderStack)
            this.$store.commit('workflow/setActiveComment', commentState.commentActive)
        }
    },
    beforeDestroy(){
        this.$store.dispatch('workflow/saveCommentState', {input: this.comment})
        //this.$store.commit('workflow/clearMarkerStack')
        this.$store.commit('workflow/setActiveComment', false)
    }
}
</script>
