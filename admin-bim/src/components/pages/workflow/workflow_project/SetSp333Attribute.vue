<template>
    <v-dialog
        :value="SP333attr"
        :scrollable="true"
        :content-class="'dialog-ksi'"
        max-width="1100px"
        width="100%"
        @input="v => v || cancel()">
        <v-card
            max-height="700px"
            min-height="700px"
                     class="d-flex flex-column"
            >
            <v-card-title class="pr-12 pl-4 m-modal--title">
                <span>Нормативные коллизии: Классификатор Строительной Информации</span>

                <v-spacer></v-spacer>
                <v-btn
                    text
                    icon
                    class="m-btn--close"
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <!--
            <v-list style="background-color:#f3f3f3;">
                        <v-list-group
                        :value="true"
                        v-for="i in 5"
                        >

                            <template v-slot:activator>
                                <v-list-item-content>
                                    <v-list-item-title>{{i}}</v-list-item-title>
                                </v-list-item-content>
                            </template>
                            <v-list-item
                            v-for="j in 10"
                            :key="j"
                            >
                                    <v-list-item-title style="font-size:14px!important;">
                                            {{j}}
                                    </v-list-item-title>
                            </v-list-item>
                        </v-list-group>
                    </v-list>
                -->
            <iframe :src="framesrc" ref="frame-ksi" id="frame-ksi" name="frame-ksi" style="height:100%; width:100%; border: 0;" scrolling="no"/>

        </v-card>
    </v-dialog>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
export default {
    name: 'SetSp333Attribute',
    props: {
        SP333attr: {
            type: Boolean,
            default: false
        },
        SP333JSON: {
            type: Object,
            default: {
                list: [],
                clue: []
            }
        },
        item: {
            type: Object,
            default: null
        }
	},
    data(){
        return {
            framesrc: ''
        }
    },
    watch: {
        SP333attr(val){
            if(val){
                // this.framesrc = 'http://localhost:8081/frame-ksi/' + this.getFileByVersion(this.item).url + '?type=class.error'
                this.framesrc = '/frame-ksi/frame-ksi/' + this.getFileByVersion(this.item).url + '?type=class.error'
            }
            else{
                this.framesrc = ''
            }
        }
    },
    methods: {
        cancel(){
            this.$emit('update:SP333attr', false)
        },
        getFileByVersion(f){
            if(f.version == null){
                return f.files[0]
            }
            else{
                let file = f.files.find(i => i.id == f.version)
                return file ? file : f.files[0]
            }
        },
        sendToken(){
            this.$refs['frame-ksi'].contentWindow.postMessage({
                action: 'init',
                token: this.$store.state.auth.token,
            }, '*')
        },
        receiveMessage(evt){
            if(Object.prototype.hasOwnProperty.call(evt.data, 'action')){
                switch(evt.data.action){
                    case 'load':
                        this.sendToken()
                        break
                    default: ;
                }
            }
        }
    },
    mounted(){
        window.addEventListener("message", this.receiveMessage, false)
    },
    beforeDestroy(){
        window.removeEventListener("message", this.receiveMessage, false)
    }
}
</script>

<style>
.dialog-ksi{
    overflow-y: hidden;
}
</style>
