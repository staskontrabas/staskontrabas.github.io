<template>
    <div class="mx-4">
        <span 
        class="black--text m-text--size14">
            {{ propset.description }}
        </span>
        <div class="d-flex" v-if="propset.textelements.length">
            <div class="d-flex flex-row align-center itemheight mr-4" 
            v-for="textline, choiceindex in propset.textelements"
            :key="keyindex + choiceindex">
                <v-checkbox class="simple-checkbox d-flex align-center justify-center" 
                readonly
                :ripple="false" 
                :value="choiceindex.toString()"
                v-model="propset.choices">
                </v-checkbox>
                <span class="black--text m-text--size14"> 
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
            keyindex: 0,
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