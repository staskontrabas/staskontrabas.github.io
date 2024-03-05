<template>
    <v-container class="pt-0">
        <v-row>
            <v-col cols="2" class="pt-1">
                <v-avatar
                    size="30">
                    <img
                        :src="comment.avatar"
                    >
                </v-avatar>
            </v-col>
            <v-col cols="10" class="pt-2">
                <div class="m-comment-title">{{comment.user}} ({{getDate(comment.date)}})</div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="2">
            </v-col>
            <v-col cols="10" class="pt-0">
                <span class="m-comment-text">{{comment.text}}</span>
            </v-col>
        </v-row>
        <v-row v-if="comment.hasOwnProperty('reply') && comment.reply.length">
            <v-col cols="2" class="py-0">
            </v-col>
            <v-col cols="10" class="pa-0">
                <history-comment
                    v-for="(i, j) in comment.reply"
                    :key="j"
                    :comment="i"/>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    export default {
        name: 'HistoryComment',
        props: ['comment'],
        data () {
            return {
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
            }
        }
    }
</script>
