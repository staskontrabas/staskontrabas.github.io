<template>
    <div class="mx-4">
        <div class="d-flex">
            
        </div>
    </div>
</template>

<script>
export default {
    props: {
        propset: { default: {}, type: Object, },
    },
    data(){
        return {
            description: [],
        }
    },
    methods: {
        updatedata(choiceindex) {
            let type = 'TextArea'
            let pset = { 
                description: this.description,
            }

            this.$emit('updatedata',{
                typeofelement: type,
                props: pset,
            })
        },
    },
    beforeMount() {
        if (!this.propset) {
                return null
                }
        else {
            let properties = this.propset
            for (let prop of Object.keys(properties)) {
                this[prop] = properties[prop]
            }
            return null
        }
    },
}
</script>
<style scoped>

.bold {
    font-weight: 500;
}

.common-text {
    font-family: Roboto;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    text-align: left;
    color: #2c2c2c !important;
}

</style>