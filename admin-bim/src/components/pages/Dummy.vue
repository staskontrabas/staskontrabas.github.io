<template>
    <v-container fluid fill-height text-xs-center class="m-container pb-10 pt-0">
        <v-layout wrap>
            <v-flex xs12>
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
                    <div class="m-dummy--title">Раздел в разработке</div>
                    <div class="m-dummy--desc">Мы скоро завершим работы!</div>
                </v-layout>
            </v-flex>
        </v-layout>

        <core-footer/>
    </v-container>
</template>


<script>
import CoreFooter from '@/components/core/CoreFooter'

export default {
    name: 'Dummy',
    components: {
        CoreFooter
    }
}
</script>
