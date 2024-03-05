<template>
    <div class="mx-4 d-flex flex-row align-center">
        <v-checkbox class="simple-checkbox mx-n1 d-flex align-center justify-center"
        readonly
        v-model="propset.checked">
        </v-checkbox>
        <span 
        class="black--text bold m-text--size12"> 
            {{ propset.description }}
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
    font-weight: 800;
}

</style>