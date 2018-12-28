<template>
    <div class="ctrl__row">
        <div class="ctrl__item">
            <div class="ctrl__title">{{item.title}}</div>
            <div class="ctrl__input"
                 ref="box"
                 @blur="setActive(false)"
                :class="{active: item.active }">
                <div class="ctrl__input-front"
                    @click.prevent="setActive(true)">{{format(item.value)}}</div>
                <div class="ctrl__input-box">
                    <input type="number" :n="item.ctrl" class="ctrl__input-field" min="0" step="1"
                        :value="item.value"
                        v-if="setFocus"
                        @input.number="setValue"
                        @keyup.enter="setActive(false)"
                        @keyup.esc="resetValue()"
                        @keydown.tab.prevent="nextInput"
                        @keydup.tab.stop.prevent="prevInput"
                        ref="input"/>
                    <div class="ctrl__input-btn"
                        v-if="item.btn"
                        @click="callback">{{item.btn}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ctrl-input',
    props: ['item'],
    data: function(){
        return {
            value_prev: false
        }
    },
    computed: {
        setFocus: function(v = true, item = this.item){
            if(item.active){
                if(this.value_prev === false){
                    this.value_prev = item.value
                }
                this.$store.commit('setValue', {ctrl: item.ctrl, value: item.value === 0 ? '' : item.value})
                this.$nextTick(function(){
                    this.$refs.input.focus()
                })
            }
            else{
                this.$nextTick(function(){
                    this.value_prev = false
                    this.$store.commit('setValue', {ctrl: item.ctrl, value: item.value === '' ? 0 : item.value})
                    this.$refs.input.blur()
                })
            }
            return true
        }
    },
    methods: {
        setActive: function(v){
            new Promise(resolve => {
                resolve(this.$store.dispatch('setActive', {ctrl: this.item.ctrl, active: v}))
            })
        },
        setValue: function(e){
            this.$store.dispatch('setValue', {item: Object.assign({}, this.item), value: e.target.value})
        },
        resetValue: function(){
            new Promise(resolve => {
                resolve(this.$store.dispatch('setValue', {item: Object.assign({}, this.item), value: this.value_prev}))
            })
            .then(() => {
                this.setActive(false)
            })
        },
        format: function(n){
            return String(n).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ')
        },
        prevInput: function(e){
            return
        },
        nextInput: function(v){

            new Promise(resolve => {
                resolve(this.setActive(false))
            })
            .then(() => {
                return this.$store.dispatch('tabActive', {item: this.item, dir: !v.shiftKey})
            })
            .then(item => {
                new Promise(resolve => {
                    resolve(this.$store.dispatch('setActive', {ctrl: item.ctrl, active: true}))
                })
            })
        },
        callback: function(){
            this.$store.dispatch(this.item.callback)
        },
        showField: function(){
            if(this.item.active && !(event.target == this.$refs.box || this.$refs.box.contains(event.target))){
                this.setActive(false)
            }
        }
    },
    mounted: function(){
        document.addEventListener('click', this.showField, false)
    },
    beforeDestroy: function(){
        document.removeEventListener('click', this.showField)
    }
}
</script>
