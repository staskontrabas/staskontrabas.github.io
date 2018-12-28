<template>
    <div class="ctrl__wrap">
        <ctrl-input
            v-for="(i, j) in list"
            :key="j"
            :item="i"/>
    </div>
</template>

<script>
import {mapState} from "vuex"
import CtrlInput from "./CtrlInput"

export default {
    name: 'CtrlWrap',
    components: {
        CtrlInput
    },
    computed: mapState({
        list: function(state){
            return state.list
        }
    })
}
</script>
