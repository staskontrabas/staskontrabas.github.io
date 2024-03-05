<template>
    <div class="mx-4 d-flex flex-row align-center">
        <v-checkbox class="simple-checkbox mx-n1 d-flex align-center justify-center" 
        :ripple="false" 
        @change="updatedatav2('checked', checked)"
        v-model="checked">
        </v-checkbox>
        <span 
        class="black--text bold m-text--size12"
        @dblclick="updatedatav2('description', description)"> 
            {{ description }}
        </span>
    </div>
</template>

<script>
export default {
    props: {
        propset: { default: {}, type: Object, },
    },
    data(){
        return {
            checked: false,
            description: 'Игнорировать этот параметр для отметки уровня (0.000)'
        }
    },
    methods: {
        updatedatav2(propname, val) {
            let type = 'IgnoreMark'
            this.$emit('updatedatav2', {type: type, prop: propname, value: val})
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

.simple-checkbox {
    margin-left: 8px;
    /* to compensate for random 8px margin-right of v-checkbox input */
}

.bold {
    font-weight: 500;
}

</style>