<template>
    <div class="admin-search">
        <input
            v-model="value"
            type="text" class="admin-input admin-search-input" :placeholder="plholder">
        <button @click="test" class="btn btn--fill btn--green admin-search-btn">search</button>
    </div>
</template>

<script>
export default {
    name: 'Search',
    props: {
        search_val: {
            type: String,
            default: ''
        },
        plholder: {
            type: String,
            default: '#id'
        }
    },
    data(){
        return {
            value: ''
        }
    },
    watch: {
        value(val){
            this.$emit('update:search_val', val)
        }
    },
    methods: {
        test(){
        }
    }
}
</script>
