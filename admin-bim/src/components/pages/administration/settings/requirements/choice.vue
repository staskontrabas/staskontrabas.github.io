<template>
    <div class="mx-4">
        <span 
        class="black--text m-text--size14"
        @dblclick="updatedatav2('description', description)">
            {{ description }}
        </span>
        <div class="d-flex" v-if="propset.textelements.length">
            <div class="d-flex flex-row align-center itemheight mr-4" 
            v-for="textline, choiceindex in propset.textelements"
            :key="keyindex + choiceindex">
                <v-checkbox class="simple-checkbox d-flex align-center justify-center" 
                :ripple="false" 
                :value="choiceindex.toString()"
                v-model="choices"
                @change="updatedatav2('choices', choiceindex.toString())">
                </v-checkbox>
                <span class="black--text m-text--size14"
                @dblclick="updatedatav2('textelements', textelements)"> 
                    {{ textline }} 
                </span>
            </div>
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
            description: 'Использовать в качестве разделителя в значении:',
            textelements: ['Знак точки «.» : (+x.xxx)', 'Знак запятой «,» : (+x,xxx)'],
            choices: ['0'],
            keyindex: 0,
        }
    },
    methods: {
        updatedatav2(propname, val) {
            let me = this.propset.mutuallyexsclusive || false
            if (me && propname === 'choices') {
                // mutually exclusive choices mode; non-exclusive mode doesn't require additional treatment
                this.choices = []
                this.choices.push(val)
            }
            let type = 'Choice'
            this.$emit('updatedatav2', {type: type, prop: propname, value: this.choices})
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

.itemheight {
    height: 1.5rem;
}

</style>