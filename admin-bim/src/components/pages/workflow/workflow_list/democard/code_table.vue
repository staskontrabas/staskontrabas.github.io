<template>
    <div class="mx-4 my-2 position-relative d-flex flex-column align-center">

        <table class="demo-table m-text--size14">

            <tr>
                <td class="bold td-demo"> {{ propset.headers.left }} </td>
                <td class="bold td-demo"> {{ propset.headers.right }} </td>
            </tr>

            <tr v-for="(pair) in propset.tablecontent">
                <td class="bold td-demo td-cell" > 
                    {{ Object.keys(pair)[0] }} 
                </td>
                <td class="td-demo td-cell" > 
                    {{ Object.values(pair)[0] }}
                </td>
            </tr>
        </table>

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

.demo-table {
    border-collapse: collapse;
    max-width: 80%;
    min-width: 50%;
    text-align: center;
}

.td-demo {
    border: 2px solid #b4c6e7;
    padding: 2px 10px;
    width: 50%;
}

.td-cell {
    text-align: left;
}

.bold {
    font-weight: 800;
}

.position-relative {
    position: relative;
}

</style>