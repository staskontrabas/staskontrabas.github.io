<template>
    <v-card
        class="m-panel__planes"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14">Плоскость отсечения
            <v-spacer></v-spacer>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pt-5 px-4">
            <v-switch
                v-model="displayHelpers"
                hide-details
                class="mt-0 mb-1"
                @change="onDisplayHelpers"
                label="Display helpers"></v-switch>
            <v-switch
                v-model="applyClipPlanes"
                hide-details
                class="mt-0 mb-2"
                @change="onClipPlanes"
                label="Apply Clip Planes"></v-switch>
            <v-slider
                v-for="plane in planes"
                dense
                :label="plane.title"
                hide-details
                :color="plane.color"
                track-color="#eaeaea"
                :min="-range"
                :max="range"
                @change="onChange(plane.num, $event)"
                v-model="plane.value"
            >
                <template v-slot:append>
                    <v-col class="pa-0 mt-1">{{plane.value}}</v-col>
                </template>
            </v-slider>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'PanelPlanes',
    props: ['active', 'planesParams'],
    data: function(){
        return {
            displayHelpers: this.planesParams.displayHelpers,
            applyClipPlanes: this.planesParams.applyClipPlanes,
            range: this.planesParams.range || 0,
            planes: this.planesParams.planes || []
        }
    },
    methods: {
        cancel(){
            this.$emit('update:active', false)
        },
        onChange(n, v){
            this.$emit('setPlanes', {
                num: n,
                value: v
            })
        },
        onDisplayHelpers(v){
            this.$emit('onDisplayHelpers', v)
        },
        onClipPlanes(v){
            this.$emit('onClipPlanes', v)
        }
    }
}
</script>
