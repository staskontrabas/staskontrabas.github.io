<template>
    <v-card-text class="px-4" style="background-color: #fbfbfb;">
        <div
            class="m-flex pt-6 pb-3">
            <span class="m-flex--item__auto pr-3 m-text--size13">Укажите количество пользователей:</span>
            <div class="m-flex--item">
                <v-text-field
                    class="m-text--size12"
                    v-model="num"
                    @input="onlyInteger"
                ></v-text-field>
            </div>
        </div>
    </v-card-text>
</template>

<script>
export default {
    name: 'Plan',
    props: ['parameters', 'values'],
    data(){
        return {
            num: this.parameters.License
        }
    },
    watch: {
        num(v){
            this.setNum()
        }
    },
    methods: {
        onlyInteger(e){
            this.$nextTick(() => {
                this.num = this.num.replace(/[^0-9]/g, '')
            })
        },
        setNum(){
            if(this.num == this.parameters.License){
                return
            }
            this.$emit('update:values', {
                route: 'lic',
                body: {
                    rte: this.parameters.Plan,
                    data: {
                        idata: this.num
                    }
                }
            })
        }
    }
}
</script>
