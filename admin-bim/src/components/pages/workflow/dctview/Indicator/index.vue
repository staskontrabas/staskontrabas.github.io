<template>
    <div v-if="show" class="partial__indicator">
        <div :style="partial_style" class="partial__fill">
        </div>
    </div>
</template>

<script>
export default {
    name: 'Indicator',
    props: ['partial'],
    data(){
        return {
            show: false,
            width: 0
        }
    },
    computed: {
        partial_style(){
            return {
                width: this.width + '%'
            }
        }
    },
    watch: {
        partial(data){
            switch(data.event){
                case 'start':
                    this.show = true
                    this.width = 0
                    break
                case 'end':
                    setTimeout(() => {this.show = false}, 1000)
                    break
                case 'percent':
                    this.width = data.value
                    break
                default: ;
            }
        }
    }
}
</script>

<style lang="less">
.partial{
    &__indicator{
        background-color: #ff0000;
        position: absolute;
        height: 10px;
        width: 250px;
        bottom: 0;
        left: 0;
    }
    &__fill{
        background-color: #338500;
        position: relative;
        height: 100%;
        width: 0;
        transition: width 0.1s ease;
    }
}
</style>
