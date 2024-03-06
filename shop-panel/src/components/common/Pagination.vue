<template>
    <div class="admin-pagination">
        <div class="btn btn--icon btn--green btn--contur"
            @click="prev()"
            :class="{'btn--disabled': value == 1}">&lt;</div>
        <div
            class="btn btn--icon btn--green"
            :class="[i.btn
                ? i.value == value
                    ? 'btn btn--icon btn--green btn--fill btn--disabled'
                    : 'btn btn--icon btn--green btn--contur'
                : 'btn--disabled btn--dot']"
            @click="paginator(i)"
            v-for="(i, j) in createPag()"
            :key="j"
        >{{i.value}}</div>
        <div class="btn btn--icon btn--green btn--contur"
            @click="next()"
            :class="{'btn--disabled': value == total()}">&gt;</div>

        <div class="px-1">
            <span class="a-pagination--title px-1">Строк на странице: </span>
            <Dropdown
                :value="getPerPage"
                :options="perPageList"
                @change="setPerPage"
                optionLabel="name" />
            </div>
        </div>
</template>

<script>
export default {
    name: 'Pagination',
    props: {
        length: {
            type: Number,
            default: 0
        },
        perPage: {
            type: Number,
            default: 10
        },
        perPageList: {
            type: Array,
            default(){
                return [
                    {name: 10, code: 0},
                    {name: 25, code: 1},
                    {name: 50, code: 2},
                    {name: 100, code: 3},
                ]
            }
        },
    },
    data(){
        return {
            value: 1,
            status: false
        }
    },
    computed: {
        getPerPage(){
            const page = this.perPageList.find(page => page.name == this.perPage)
                || this.perPageList[0]
            return page
        }
    },
    methods: {
        setPerPage(val){
            this.$emit('update:perPage', val.value.name)
        },
        paginator: function(v){
            if(v.btn){
                this.value = v.value
                this.$emit('paginator', v.value)
            }
        },
        next(){
            this.value = this.value + 1
            this.$emit('paginator', this.value)
        },
        prev: function(){
            this.value = this.value - 1
            this.$emit('paginator', this.value)
        },
        total: function(){
            return Math.ceil(this.length / this.perPage)
        },
        createPag: function(){
            let arr = []
            const total = Math.ceil(this.length / this.perPage)
            const range = 3
            for(let i = 1; i <= total; i++){
               if(i <= range || (i > this.value - range / 2 && i < this.value + range / 2) || i > total - range){
                    if (arr.length && arr[arr.length-1].value&& i != arr[arr.length-1].value+1)
                        arr.push({value:'...', btn: false})
                    arr.push({value: i, btn: true})
                }

            }
            return arr
        }
    }
}
</script>
