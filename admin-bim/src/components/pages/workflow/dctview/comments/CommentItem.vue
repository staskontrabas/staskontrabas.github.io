<template>
    <v-container>
        <v-row>
            <v-col cols="2" class="pb-0">
                <v-avatar
                    size="30">
                    <img
                        :src="getAvatar(comment)"
                    >
                </v-avatar>
            </v-col>
            <v-col cols="10" class="pb-0">
                <div class="m-comment-title">{{viewMode ? comment.user : comment.title + comment.version}}</div>
                <div class="m-comment-subtitle">{{dateToStr(comment.date)}}</div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="2" class="pb-0 pt-2">
            </v-col>
            <v-col cols="10" class="pb-0 pt-2">
                <div
                    class="m-comment-marker--item"
                    v-for="(i, j) in comment.borders"
                    :key="'marker' + i.id || i.mid"
                    :style="mode == '3d' ? getMarkerBG(i.clr) : ''"
                    >
                    <div class="m-comment-marker--value">{{i.name || ''}}</div>
                </div>
            </v-col>
        </v-row>
        <v-row v-if="mode == '3d'">
            <v-col cols="2">
            </v-col>
            <v-col cols="10">
                <img style="width: 100%;"
                ></img>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="2">
            </v-col>
            <v-col cols="10">
                <span v-show="!editMode" class="m-comment-text">{{comment.text}}</span>
                <v-textarea
                    ref="textarea"
                    class="m-comment-no-border m-0"
                    v-show="editMode"
                    v-model="text"
                    :autofocus="editMode"
                    auto-grow
                    outlined
                    hide-details
                    multi-line
                    rows="1">
                </v-textarea>
            </v-col>
        </v-row>
        <v-row
            v-show="user.id == comment.uid ? viewMode : false">

            <v-col cols="2" class="pt-0">
            </v-col>
            <v-col cols="10" class="pt-0">
                <v-card-actions v-show="!editMode" class="pa-0">
                    <div
                        class="m-btn-text"
                        @click="edit">
                        Изменить
                    </div>
                    <div
                        class="m-btn-text"
                        @mouseup="removeComment">
                        Удалить</div>
                </v-card-actions>
                <v-card-actions v-show="editMode" class="pa-0">
                    <div
                        class="m-btn-text"
                        @click="saveChange">
                        Сохранить
                    </div>
                    <div
                        class="m-btn-text"
                        @click="cancelChange">
                        Отмена
                    </div>
                </v-card-actions>
            </v-col>
        </v-row>
        <v-row v-if="comment.reply.length && viewMode">
            <v-col cols="2" class="py-0">
            </v-col>
            <v-col cols="10" class="pa-0">
                <comment-item
                    v-for="(i, j) in comment.reply"
                    :key="j"
                    :comment="i"
                    :mode="null"
                    :viewMode="viewMode"/>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { createAvatarChar } from '@/utils/services'

export default {
    name: 'CommentItem',
    props: ['comment', 'viewMode', 'mode'],
    data () {
        return {
            text: '',
            reply: '',
            editMode: false
        }
    },
    computed: {
        user(){
            return this.$store.state.administration.user
        }
    },
    methods: {
        getMarkerBG(clr){
            return {background: `radial-gradient(circle farthest-side, #fff, rgba(${clr.r * 255},${clr.g * 255},${clr.b * 255}, 1))`}
        },
        dateToStr(d){
            let date = new Date(2020, 0, 1, 0, 0, 0, 0)
            date = d + date.getTime()
            date = new Date(date)
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
        },
        edit(){
            this.editMode = true
            this.text = this.comment.text
        },
        cancelChange(){
            this.editMode = false
            this.text = ''
        },
        saveChange(){
            this.editMode = false
            this.$store.dispatch('comments/message', {
                id: this.comment.id,
                key: this.comment.key,
                pid: this.comment.pid,
                action: 0,
                text: this.text
            })
            this.text = ''
        },
        removeComment(){
            let type = 'border'
            let brds = []
            if(this.comment.borders.length){
                if(this.comment.borders[0].mid){
                    type = 'marker'
                    this.comment.borders.map(brd => {
                        let count = 0
                        this.$store.state.comments.comments.map(cmt => {
                            if(cmt.borders.some(s => s.mid == brd.mid)){
                                count++
                            }
                        })
                        if(count < 2){
                            brds.push(brd.mid)
                        }
                    })
                }
                else{
                    brds = this.comment.borders.map(brd => brd.id)
                }
            }
            this.$store.dispatch('comments/message', {
                brds: brds,
                type: type,
                key: this.comment.key,
                pid: this.comment.pid,
                id: this.comment.id,
                action: -1,
                text: this.comment.text
            })
        },
        getAvatar(i){
            if(!i.avatar){
                let users = this.$store.state.administration.company.users
                let user = users.filter(u => u.id == i.uid)
                if(user.length){
                    if(user[0].avatar){
                        return user[0].avatarSrc
                    }
                    else{
                        let name = user[0].first_name ? user[0].first_name : user[0].email
                        return createAvatarChar(name)
                    }
                }
            }
            else{
                return i.avatar
            }
        },
    }
}
</script>
