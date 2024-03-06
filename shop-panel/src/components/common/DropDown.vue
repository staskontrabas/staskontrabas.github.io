<template>
    <!-- v-model="value" -->
    <Dropdown
        :value="value"
        :options="categorylist"
        @change="selectCategory"
        optionLabel="name" />
</template>

<script>
export default {
    name: 'DropDown',
    props: {
        item: {
            type: Object,
            default(){
                return {}
            }
        }
    },
    data(){
        return {
            categorylist: [
                {name: 'Indica', code: 0},
                {name: 'Sativa', code: 1},
                {name: 'Hash', code: 2},
                {name: 'Canafood', code: 3},
                {name: 'Soft Drinks', code: 5}
            ]
        }
    },
    computed: {
        value(){
            return this.item.category || this.item.category == 0
                ? {
                    name: this.categorylist.find(cat => cat.code == this.item.category).name,
                    code: this.item.category
                }
                : null
        }
    },
    methods: {
        selectCategory(data){
            this.$emit('selectCategory', this.item, data)
        }
    }
}
</script>
