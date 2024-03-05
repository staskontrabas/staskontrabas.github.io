<template>
    <v-card
        class="m-card-scrollable"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Скрытые объекты
            <v-spacer></v-spacer>
            <v-btn
                text
                icon
                @click="minimize = !minimize"
                color="#7f7f7f">
                <v-icon size="20">
                    {{!minimize ? 'mdi-window-minimize' : 'mdi-window-maximize'}}
                </v-icon>
            </v-btn>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-title class="pa-0">
            <div class="pr-0 pl-1 py-1 m-panel__collision--options">
                <v-btn
                    class="m-btn"
                    text
                    tile
                    dense
                    @click="onVisibleAll()">
                    <v-icon
                        left
                        :color="'#757575'"
                        size="20">mdi-eye</v-icon><span class="m-text--size12">Показать все</span>
                </v-btn>

            </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text
            class="pa-0 pb-5 m-card-scrollable__text">
            <div
                v-if="!hiddenList.length"
                class="py-2 px-4 m-text--size14 m-text--center m-text--color-2c2c2c"
                >У вас нет скрытых объектов, выберите объект и скройте его.
                <div class="py-2 px-4 m-text--size12 m-text--center"><a href="">Как это сделать?</a></div>
            </div>

            <v-list
                v-else
                nav
                dense
                class="pa-0"
                >
                <v-list-item
                    v-for="(item, i) in hiddenList"
                    :key="i"
                    class="ma-0 px-4"
                    @click="getObject(item)"
                    >
                    <v-list-item-icon class="mr-2">
                        <v-icon size="20" v-text="'mdi-eye-off'"></v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title v-text="item.name"></v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'PanelHidden',
    props: ['menuItem', 'hiddenList', 'styleP'],
    data(){
        return {
            minimize: false
        }
    },
    methods: {
        cancel(){
            this.minimize = false
            this.$emit('setOption', this.menuItem)
        },
        getObject(i){
            this.$emit('onShowObject', [i.id])
        },
        onVisibleAll(){
            this.$emit('onShowObject', this.hiddenList.map(i => i.id))
        }
    }
}
</script>
