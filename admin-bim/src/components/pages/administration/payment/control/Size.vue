<template>
    <v-card-text class="px-4" style="background-color: #fbfbfb;">
        <div
            class="m-flex pt-6 pb-3">
            <span class="m-flex--item__auto pr-3 m-text--size13">Укажите объем необходимого пространства:</span>
            <div class="m-flex--item">
                <v-text-field
                    class="m-text--size12"
                    v-model="size"
                    @input="onlyInteger"
                ></v-text-field>
            </div>
            <span class="m-flex--item__auto m-text--size13">Мегабайт</span>
        </div>
    </v-card-text>
</template>

<script>
export default {
    name: 'Plan',
    props: ['parameters', 'values'],
    data(){
        return {
            size: this.parameters.Size,
            maxC: 5,
            maxN: 51200
        }
    },
    watch: {
        size(v){
            this.setSize()
        }
    },
    methods: {
        onlyInteger(e){
            this.$nextTick(() => {
                let n = this.size.replace(/[^0-9]/g, '').slice(0, this.maxC)
                this.size = parseInt(n) > this.maxN
                    ? this.maxN
                    : n
            })
        },
        setSize(){
            if(this.size == this.parameters.Size){
                return
            }
            this.$emit('update:values', {
                route: 'size',
                body: {
                    rte: this.parameters.Plan,
                    data: {
                        idata: parseInt(this.size)
                    }
                }
            })
        }
    }
}
</script>
