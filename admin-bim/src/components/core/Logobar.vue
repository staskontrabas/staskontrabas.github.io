<template>
    <v-list-item class="m-logo">
        <v-list-item-content class="m-overflow-visible">
            <v-list-item-title class="m-title">
                <div>
                    <div class="m-inline m-cell-1">
                        <router-link
                            v-show="part.parentLink !== '' && part.parentLink !== '/main'"
                            :style="{color: 'transparent'}"
                            :to="{path: parentLink()}">
                            <v-icon size="25" color="#6e6e6e"> keyboard_arrow_left </v-icon>
                        </router-link>
                    </div>
                    <div class="m-inline mr-3">
                        <v-img width="35" :src="logo"></v-img>
                    </div>
                    <div class="m-inline">
                        <v-img
                            v-show="part.title_type == 'img'"
                            :src="logo_text"
                            class="m-inline-b"></v-img>
                        <span
                            v-show="part.title_type == 'text'">
                            <span class="title-page"> {{ part.title }} </span>
                        </span>
                    </div>
                    <div class="m-inline" v-if="part.title_type == 'template'">
                        <div class="m-dct-name"> {{ dct_props.name }} </div>
                        <div class="m-dct-status"> {{ dct_props.status }} </div>
                    </div>
                </div>
            </v-list-item-title>
            <v-list-item-subtitle>

            </v-list-item-subtitle>
        </v-list-item-content>
    </v-list-item>
</template>

<script>
import { mapState } from "vuex"

export default {
    name: 'Logobar',
    props: ['part'],
    data () {
        return {
            backLink: null,
            title: '',
            logo: require('@/assets/images/Logo_icon.svg'),
            logo_text: require('@/assets/images/Logo_text.svg'),
            dct_view: false
        }
    },
    computed: mapState({
        dct_props: function(state) {
            return {
                name: state.toolbar.dct_name,
                status: state.toolbar.dct_status
            }
        }
    }),
    methods:{
        logoImg(){
            let logo = this.part.title
            return logo
        },
        parentLink(){
            let link = this.part.parentLink
            let reg = /[^{}]+(?=})/g
            let params = link.match(reg)
            if(params != null){
                for(let i = 0, len = params.length, param = ''; i < len; i++){
                    param = '{' + params[i] + '}'
                    if(this.$route.params[params[i]]){
                        link = link.replace(param, this.$route.params[params[i]])
                    }
                    else{
                        link = link.replace(param, '')
                    }
                }
            }

            return link
        }
    }
}
</script>
