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
                        <comment
                            :comment="item"
                            :mode="'3d'"
                            :posActive.sync="posActive"/>
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
                                    class="m-comment-marker--add"
                                    v-if="markerStack.mrk || markerSelect">
                                    <div
                                        class="m-comment-marker--btn"
                                        :style="getMarkerData.color"
                                        @mouseenter="markerHover()"
                                        @mouseleave="markerLeave()"
                                        @click="removeMarker()"
                                        >
                                        <v-icon
                                            v-show="markerEdit"
                                            size="14"
                                            color="#fff">close</v-icon>
                                    </div>
                                    <span
                                        class="pl-1"
                                        v-text="'ID: ' + getMarkerData.eid">
                                    </span>
                                </div>
                                <div
                                    class="m-comment-marker--add"
                                    v-else-if="!waitCreatingMrk && !(markerStack.mrk || markerSelect)">
                                    <div
                                        v-if="!selectedMode"
                                        class="m-comment-marker--btn"
                                        @click.stop="onSetSelectionMode(true)"
                                        >
                                        <v-icon
                                            size="14"
                                            color="#fff">mdi-plus</v-icon>
                                    </div>
                                    <div
                                        v-else
                                        class="m-comment-marker--btn-select"
                                        >
                                        <v-icon
                                            size="20"
                                            color="#ff0000">mdi-alert-outline</v-icon>
                                    </div>
                                    <span
                                        class="pl-1"
                                        v-text="selectedMode ? 'Выберите объект' : 'Установить маркер'">
                                    </span>
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
                        <v-container>
                            <v-row>
                                <v-col cols="2" class="pb-0 pt-5">
                                    <v-avatar
                                        size="30">
                                        <img
                                            :src="userAvatar.src"
                                        >
                                    </v-avatar>
                                </v-col>
                                <v-col cols="10" class="pb-0">
                                    <v-textarea
                                        id="comment"
                                        placeholder="Комментировать"
                                        class="m-comment-no-border"
                                        v-model="comment"
                                        auto-grow
                                        :height="comment ? 'auto' : '56px'"
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
import Comment from './comments/Comment3d'
import ClickOutside from '@/plugins/click_outside'

export default {
    name: 'Comments3d',
    components: {
        Comment
    },
    directives: {
        ClickOutside
    },
    props: ['document', 'listModel', 'selectedObjID', 'mini', 'blob', 'onLoadsCheck', 'propertiesObj', 'worker'],
    data(){
        return {
            comment: '',
            focus: false,
            posActive: 0,
            selectedMode: false,
            markerEdit: false,
            markerSelect: null,
            waitCreatingMrk: false,
            initMarkers: false
        }
    },
    computed: mapState({
        commentList(state){
            let comments = JSON.parse(JSON.stringify(state.comments.comments))
            let markers = JSON.parse(JSON.stringify(state.comments.markers))

            comments = comments.map(cmnt => {
                let list = []
                cmnt.borders.map(brd => {
                    let item = markers.filter(f => f.mid == brd)
                    list = [...list, ...item]
                })
                cmnt.borders = list
                // cmnt.version = this.document.version
                //     ? (() => {
                //         let vers = this.document.files.filter(f => f.id == this.document.version)
                //         return vers ? vers[0].version : this.document.files[0].version
                //     })()
                //     : this.document.files[0].version
                return cmnt
            })

            return comments
        },
		markerStack(state){
			let comments = JSON.parse(JSON.stringify(this.$store.state.comments.comments))
			let markers = JSON.parse(JSON.stringify(this.$store.state.comments.markers))
			let list = []
			comments.map(c => {
				list = [...list, ...c.borders]
			})

            let stack = []
			markers.map(b => {
				if(!list.some(s => s == b.mid)){
					stack = [...stack, b]
				}
			})
            let color = !stack.length
                ? ''
                : {'background': `radial-gradient(circle farthest-side, #fff, rgba(${stack[0].clr.r * 255},${stack[0].clr.g * 255},${stack[0].clr.b * 255}, 1))`}
			return {
                mrk: stack[0] || null, color
            }
		},
        getMarkerData(){
            let marker = this.markerStack.mrk || this.markerSelect
            return {
                color: marker
                    ? !this.markerEdit
                        ? {'background': `radial-gradient(circle farthest-side, #fff, rgba(${marker.clr.r * 255},${marker.clr.g * 255},${marker.clr.b * 255}, 1))`}
                        : {'background-color': '#ff0000'}
                    : '',
                eid: marker ? marker.eid : ''
            }
        },
        userAvatar(state){
            return state.administration.userAvatar
        },
        getActiveCommentId(state){
            return state.workflow.activeComment
        },
        checkMarkers(state){
            return state.comments.markers
        }
    }),
    watch: {
        markerStack: {
            handler(v){
                if(v.mrk){
                    this.waitCreatingMrk = false
                }
            },
            deep: true
        },
        getActiveCommentId(v){
            if(v){
                this.onHideAllMarkers()
                const cmt = this.commentList.find(cmt => cmt.id == v)
                if(cmt){
                    cmt.borders.map(brd => {
                        this.onShowMarker({id: brd.eid})
                        this.onGotoMarker({id: brd.eid})
                    })
                }
                if(this.markerStack.mrk || this.markerSelect){
                    this.onShowMarker({id: this.markerStack.mrk.eid || this.markerSelect.eid})
                }
            }
            else{
                if(!this.mini){
                    this.onShowAllMarkers()
                }
            }
        },
        focus(v){
            this.focusComment(v)
        },
        posActive(v){
            this.scrollToComment(v)
        },
        selectedObjID(v){
            if(v && this.selectedMode){
                // this.worker.postMessage({
                //     action: 'getObjectProperties',
                //     id: v
                // })

                // let mrk = this.$store.state.comments.markers.find(mrk => mrk.eid == v)
                // if(!mrk){
                //     this.onCreateMarker({id: v})
                // }
                // else{
                //     this.markerSelect = JSON.parse(JSON.stringify(mrk))
                //     this.onSetSelectionMode(false)
                // }
            }
        },
        propertiesObj(v){
            if(v && this.selectedMode){
                let mrk = this.$store.state.comments.markers.find(mrk => mrk.eid == v)
                if(!mrk){
                    this.onCreateMarker({id: v.id, fileId: v.fileId})
                }
                else{
                    this.markerSelect = JSON.parse(JSON.stringify(mrk))
                    this.onSetSelectionMode(false)
                }
            }
        },
        mini(v){
            if(v){
                this.onHideAllMarkers()
                this.onSetSelectionMode(false)
            }
            else{
                this.onShowAllMarkers()
            }
        },
        checkMarkers(v){
            if(v && !this.initMarkers){
                this.$store.state.comments.markers.map(mrk => {
                    this.$emit('onMarker', {
                        action: 'onInitMarker',
                        id: mrk.eid,
                        r: mrk.clr.r,
                        g: mrk.clr.g,
                        b: mrk.clr.b
                    })
                })
                this.initMarkers = true
            }
            if(!this.mini){
                this.onShowAllMarkers()
            }
        }
    },
    methods: {
        newTask(){
            this.$emit('newTask')
        },
        userCheck(b){
			return this.$store.state.administration.user.id == b.uid
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
            if(!this.propertiesObj.fileId){
                return
            }
            this.$store.dispatch('comments/message', {
                pid: 0,
                fileId: this.propertiesObj.fileId,
                text: this.comment,
                borders: this.markerStack.mrk
                    ? [this.markerStack.mrk.mid]
                    : this.markerSelect
                        ? [this.markerSelect.mid]
                        : [],
                action: 1
            })
            if(this.markerSelect){
                this.markerSelect = null
            }
            this.comment = ''
            this.focus = false
        },
        clearComment(){
            this.comment = ''
            this.focus = false
        },
        focusInput(){
            this.focus = true
        },
        focusInputRemove(){
            if(this.focus && !this.comment){
                this.focus = false
            }
        },
        onSetSelectionMode(v){
            this.selectedMode = v
            this.$emit('onSetSelectionMode', v)
        },
        onCreateMarker(data){
            const color = () => {
                return +(Math.floor(Math.random() * 256) * (1/255)).toFixed(1)
            }
            let r = color()
            let g = color()
            let b = color()

            this.$emit('onMarker', {
                action: 'onCreateMarker',
                id: data.id,
                fileId: data.fileId,
                r, g, b
            })
            this.waitCreatingMrk = true
            this.onSetSelectionMode(false)
        },
        onShowAllMarkers(){
            this.onHideAllMarkers()
            this.commentList.map(cmt => {
                cmt.borders.map(brd => {
                    this.onShowMarker({id: brd.eid})
                })
            })
            if(this.markerStack.mrk || this.markerSelect){
                this.onShowMarker({id: this.markerStack.mrk.eid || this.markerSelect.eid})
            }
        },
        onHideAllMarkers(){
            this.$emit('onMarker', {
                action: 'onHideAllMarkers'
            })
        },
        onShowMarker(data){
            this.$emit('onMarker', {
                action: 'onShowMarker',
                id: data.id
            })
        },
        onHideMarker(data){
            this.$emit('onMarker', {
                action: 'onHideMarker',
                id: data.id
            })
        },
        onGotoMarker(data){
            this.$emit('onMarker', {
                action: 'onGotoMarker',
                id: data.id
            })
        },
        markerHover(){
            this.markerEdit = true
        },
        markerLeave(){
            this.markerEdit = false
        },
        removeMarker(){
            if(this.markerSelect){
                this.markerSelect = null
            }
            else{
                this.onHideMarker({id: this.markerStack.mrk.eid})
                this.$store.dispatch('comments/marker', {...this.markerStack.mrk, act: -1})
            }
            this.markerLeave()
        },
    },
    mounted(){
        if(!this.mini){
            this.onShowAllMarkers()
        }
    },
    created(){
        let commentState = this.$store.state.workflow.commentState
        if(commentState.status){
            this.comment = commentState.commentInput
            //this.$store.commit('workflow/updateMarkerStack', commentState.borderStack)
            this.$store.commit('workflow/setActiveComment', commentState.commentActive)
        }
    },
    beforeDestroy(){
        this.onHideAllMarkers()
        this.$store.dispatch('workflow/saveCommentState', {input: this.comment})
        this.$store.commit('comments/updateMarkerStack', null)
        this.$store.commit('workflow/setActiveComment', false)
    }
}
</script>
