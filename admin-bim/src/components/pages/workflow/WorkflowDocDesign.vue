<template>
    <v-container pt-0 fluid fill-height text-xs-center class="page-container marker">
        <v-layout
            fluid
            fill-height
            column
            align-center
            justify-center
            >
            <div class="m-dummy--wrap mb-5">
                <img
                    width="100%"
                    src="@/assets/images/in_work.svg"/>
            </div>
            <div class="m-dummy--title"> Раздел "Проектная документация" в разработке </div>
            <div class="m-dummy--desc"> Мы скоро завершим работы! </div>
        </v-layout>
    </v-container>
</template>


<script>

export default {
    name: 'WorkflowDocDesign',
    components: {
    },
    data() {
        return {
            someprop: false,
          }
    }
}
 
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: 0;
}
</style>
