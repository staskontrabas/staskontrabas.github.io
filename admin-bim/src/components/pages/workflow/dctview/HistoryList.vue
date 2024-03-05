<template>
    <v-col cols="12" class="pt-0" :style="{overflow: 'auto'}">
        <v-row dense>
            <v-col
                v-for="(item, index) in getHistoryList"
                :key="index"
                :ref="item.id"
                cols="12">

                <v-card
                    :outlined="true"
                    color="#fafafa"
                    class="m-history-card"
                    :class="{active: active == item.version}"
                    @click.native="setActive(item, index)"
                    @mouseenter="commentHover(item)"
                    @mouseleave="commentLeave(item)"
                    >
                    <v-container class="py-0">
                        <v-row >
                            <v-col cols="12" class="pb-2">
                                <div class="m-history-name">{{item.title}}
                                    <v-icon
                                        :color="active == item.version ? '#99c6f3' : '#7f7f7f'"
                                        class="m-history-exp"
                                        @click="expand($event, item, index)"
                                        size="25">{{active == item.version ? 'mdi-chevron-up' : 'mdi-chevron-down'}}</v-icon>
                                </div>
                                <div class="m-history-time">{{getDate(item.created)}}</div>
                            </v-col>
                        </v-row>
                    <!--
                        <v-row >
                            <v-col cols="12" class="pt-0 pb-2">
                                <div
                                    class="m-comment-marker--item"
                                    v-for="(i, j) in item.annotation"
                                    :key="'marker' + i.id"
                                    >
                                    <div class="m-comment-marker--value">{{i.value}}</div>
                                </div>
                            </v-col>
                        </v-row>
                    -->
                    </v-container>
                    <history-comment
                        v-for="comment in item.list"
                        v-show="active == item.version"
                        :comment="comment"/>
                </v-card>
            </v-col>
        </v-row>
    </v-col>
</template>

<script>
import HistoryComment from './history/HistoryComment'
    export default {
        name: 'HistoryList',
        components: {
            HistoryComment
        },
        props: ['document'],
        data () {
            return {
                active: '',
                historyList: []
            }
        },
        computed: {
            getHistoryList(){
                let list = this.historyList
                list = list.map(h => {
                    return {
                        title: "Документ версии " + h.version,
                        version: h.version,
                        created: h.created,
                        list: this.createMsgs(h.msgs, h.version)
                    }
                })
                return list
            }
        },
        methods: {
            getDate(date){
                let d = new Date(date)
                let str = []
                str.push(d.getDate())
                str.push(d.getMonth() + 1)
                str.push(d.getFullYear())
                return str.join('.')
            },
            createMsgs(list, ver){
                let state = this.$store.state.administration
                list = list.map(m => {
                    return {
                        id: m.mid,
                        uid: m.uid,
                        pid: m.pid,
                        "type": "comment",
                        "avatar": state.user.id == m.uid
                                    ? state.user.avatar.src
                                    : "",
                        "title": "Документ версии " + ver,
                        "user": state.user.id == m.uid
                                    ? state.user.first_name + ' ' + state.user.last_name
                                    : user
                                        ? user.first_name
                                            ? user.first_name + ' ' + state.user.last_name
                                            : user.email
                                        : user.email,
                        "text": m.txt,
                        date: m.tim,
                        borders: m.brds,
                        "reply": m.chld.length
                            ? this.createMsgs(m.chld, ver)
                            : []
                    }
                })
                return list.reverse()
            },
            setActive(i, j){
                if(this.active == i.version){
                    return
                }
                this.active = i.version
                //this.$emit('socketClose', this.$store.state.comments.version)
                //this.$emit('socketOpen', i.id)

                // let h = this.$refs[i.id][0].offsetHeight
                // new Promise((resolve) => {
                //     this.active = i.id
                //     this.$store.commit('workflow/setActiveComment', i.id)
                //     resolve(true)
                // }).then(v => {
                //     this.$el.scrollTo({top: j * h, behavior: "smooth"})
                // })
            },
            getDate(d){
                d = new Date(d)
                let date = []
                date.push(d.getDate())
                date.push(d.getMonth() + 1)
                date.push(d.getFullYear())
                let time = []
                time.push(d.getHours())
                time.push(d.getMinutes())

                return date.join('.') + ' ' + time.join(':')
            },
            expand(e, i, j){
                e.stopPropagation()
                if(this.active == i.version){
                    this.active = null
                }
                else{
                    this.setActive(i, j)
                }
            },
            commentHover(i){
                this.$store.commit('workflow/setDraftHover', i.id)
            },
            commentLeave(i){
                this.$store.commit('workflow/setDraftHover', '')
            },
        },
        created(){
            //this.historyList = this.document.files
            let promisesList = []
            this.document.files.map(f => {
                promisesList.push(this.$store.dispatch('workflow/getHistory', {
                    did: this.document.id,
                    created: f.created_at,
                    version: f.version
                }))
            })
            Promise.all(promisesList)
            .then(res => {
                this.historyList = res
            })

            // this.$store.dispatch('workflow/setCommentsHistory')
            // this.historyList = this.$store.state.workflow.historyList
        },
        beforeDestroy(){
            //this.$store.commit('workflow/setActiveComment', false)
        }
    }
</script>
