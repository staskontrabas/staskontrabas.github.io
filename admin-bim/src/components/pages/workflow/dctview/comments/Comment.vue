<template>
    <v-card
        :outlined="true"
        color="#fafafa"
        class="m-comment-card"
        :class="[{active: activeComment}]"
        @click.native="view"
        @mouseenter="commentHover"
        @mouseleave="commentLeave"
        v-click-outside="no_view"
    >
        <comment-item
            :comment="comment"
            :mode="mode"
            :viewMode="viewMode"/>

        <v-container v-show="viewMode" class="m-reply-wrap">
            <v-row>
                <v-col cols="2" class="pb-0">
                    <v-avatar
                        size="30">
                        <img
                            :src="getAvatar()"
                            alt="avatar"
                        >
                    </v-avatar>
                </v-col>
                <v-col cols="10" class="pb-0">
                    <v-textarea
                        v-model="reply"
                        class="m-comment-avatar pt-0 mt-0"
                        placeholder="Ответить"
                        auto-grow
                        hide-details
                        multi-line
                        rows="2">
                    </v-textarea>
                </v-col>
            </v-row>
            <v-row >
                <v-col cols="2" class="pt-0">
                </v-col>
                <v-col cols="10" class="pt-0">
                    <v-card-actions class="pa-0">
                        <v-btn
                            :disabled="!reply"
                            class="mt-2 m-btn"
                            outlined
                            dense
                            color="primary"
                            @click="replyComment"
                        >
                        Ответить
                        </v-btn>
                        <v-btn
                            :disabled="!reply"
                            class="mt-2 m-btn m-btn-normal"
                            outlined
                            dense
                            color="normal"
                            @click="clearReply"
                        >
                        Отмена
                        </v-btn>
                    </v-card-actions>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<script>
import vClickOutside from 'v-click-outside'
import CommentItem from './CommentItem'
import { createAvatarChar } from '@/utils/services'

    export default {
        name: 'Comment',
        props: {
            comment: {
                type: Object,
                default: {}
            },
            mode: {
                type: String,
                default: null
            }
        },
        directives: {
            clickOutside: vClickOutside.directive
        },
        components: {
            CommentItem
        },
        data () {
            return {
                reply: '',
                viewMode: false
            }
        },
        computed: {
            activeComment(){
                let active = this.$store.state.comments.activeComment
                if(active == this.comment.id){
                    this.viewMode = true
                }
                else{
                    this.viewMode = false
                }
    			return this.viewMode
            },
            user(){
                return this.$store.state.administration.user
            }
        },
        watch: {
            viewMode(v){
                if(v){
                    this.$emit('update:posActive', this.$el.offsetTop)
                }
            }
        },
        methods: {
            view(){
                this.$store.commit('comments/setActiveComment', this.comment.id)
            },
            no_view(){
                if(this.viewMode){
                    this.$store.commit('comments/setActiveComment', false)
                    this.viewMode = false
                }
            },
            replyComment(){
                this.$store.dispatch('comments/message', {
                    pid: this.comment.id,
                    text: this.reply,
                    borders: [],
                    action: 1
                })
                this.reply = ''
            },
            clearReply(){
                this.reply = ''
            },
            commentHover(){
                this.$store.commit('comments/setDraftHover', this.comment.id)
            },
            commentLeave(){
                this.$store.commit('comments/setDraftHover', '')
            },
            getAvatar(){
                let avatar = this.user.avatar.avatar
                if(!avatar){
                    let name = this.user.first_name ? this.user.first_name : this.user.email
                    return createAvatarChar(name)
                }
                else{
                    return avatar
                }
            }
        }
    }
</script>
