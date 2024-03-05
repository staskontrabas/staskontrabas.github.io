<template>
    <div
        class="m-back"
        :style="style"
        >
        <div class="vm-progress">
            <div class="loader">
                <svg class="circular" viewBox="25 25 50 50">
                    <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Init',
    data: () => ({
        width: 0,
        height: 0,
    }),
    computed: {
        style(){
            return{
                width: this.width + 'px',
                height: this.height + 'px'
            }
        }
    },
    methods: {
        getSize(){
            this.width = window.innerWidth
            this.height = window.innerHeight
        },
    },
    mounted(){
        this.getSize()
    },
}
</script>
