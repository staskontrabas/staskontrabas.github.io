<template>
    <v-container fluid px-4 pa-0 pb-10 class="m-container">
        <div
            class="m-nav-tabs"
            >
            <router-link
                class="m-nav-tabs--item"
                to="/administration/payment/control"><span>Управление тарифным планом</span></router-link>
        </div>
        <router-view/>
    </v-container>
</template>

<script>
export default {
    name: 'Payment'
}
</script>
