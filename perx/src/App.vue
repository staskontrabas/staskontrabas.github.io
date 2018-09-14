<template>
  <v-app>
<v-container>
<v-layout wrap>
  <v-flex  xs7 offset-xs3>
    <v-content>
      <router-view/>
    </v-content>
  </v-flex>
</v-layout>
</v-container>
  </v-app>
</template>

<script>

export default {
  name: 'App'
}
</script>
