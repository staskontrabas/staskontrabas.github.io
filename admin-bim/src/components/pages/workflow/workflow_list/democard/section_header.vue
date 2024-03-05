<template>
    <div class="header-wrap">
    
        <div class="divider" />
        <div class="section-header d-flex align-center">
            <span class="bold mx-4 py-2 text-uppercase">
               {{ number }} {{ propset.title }}
            </span>
        </div>
        <div class="divider" />
    
        <div class="mx-4 my-2 m-text--size14">
            {{ propset.description }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        propset: { default: {}, type: Object, },
        number: '',
    },
    data(){
        return {
        }
    },
}
</script>

<style scoped>

.header-wrap {
    width: 100%;
}

.divider {
    width: 100%;
    border: solid 1px #ced4da;
}

.section-header {
    height: 3rem;
}

.bold {
    font-weight: 800;
}

</style>