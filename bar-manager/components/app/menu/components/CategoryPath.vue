<template>
    <div class="cove-category__path" ref="path-box"
        :style="style"
        @mouseenter="pathboxActive"
        @mouseleave="pathboxActive">
        <div class="cove-category__path-back"
            @click="back"
        ></div>
        <div class="cove-category__path-box">
            <div class="cove-category__path-item"
                v-for="(item, index) in pathList"
                :key="index">
                <div class="cove-category__path-name" @click="toCategory(item)">{{item.name}}</div>
                <div class="cove-category__path-separator" v-if="index + 1 != pathList.length">/</div>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    name: 'category-path',
    props: ['pathList'],
    data: function(){
        return {
            pathboxStatus: false,
            style: {}
        }
    },
    methods: {
        back: function(){
            const pos = this.pathList.length > 2 ? this.pathList.length - 2 : 0
            this.$store.dispatch('menu/setCategoryFromPath', this.pathList[pos])
        },
        toCategory: function(item){
            this.$store.dispatch('menu/setCategoryFromPath', item)
        },
        pathboxActive: function(){
            if(this.pathboxStatus){
                this.pathboxStatus = false
                this.style = {}
            }
            else{
                this.pathboxStatus = true
                const pos = this.$refs['path-box'].getBoundingClientRect()

                this.style = {
                    position: 'fixed',
                    top: pos.y + 'px',
                    left: pos.x + 'px',
                    'z-index': '2'
                }
            }
        }
    }
}
</script>
