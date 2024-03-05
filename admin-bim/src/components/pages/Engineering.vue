<template>
    <v-container fill-height fluid text-xs-center class="m-container pb-10 pt-0">
        <v-layout row wrap>
            <v-flex xs12>
                <router-view/>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        name: 'Engineering',
    }
</script>
