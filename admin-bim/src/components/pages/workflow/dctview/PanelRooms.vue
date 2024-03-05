<template>
    <v-card
        class="m-card-scrollable"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Помещения и зоны
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
                    class="m-btn px-2"
                    text
                    tile
                    dense
                    @click="onVisibleAll(false)">
                    <v-icon
                        left
                        :color="'#757575'"
                        size="20">mdi-eye-off</v-icon><span class="m-text--size12">Скрыть все</span>
                </v-btn>

                <v-btn
                    class="m-btn px-1"
                    text
                    tile
                    dense
                    @click="onVisibleAll(true)">
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

            <v-skeleton-loader
                v-show="!rooms.load"
                type="list-item-three-line, list-item-three-line"
            ></v-skeleton-loader>

            <template
                v-show="rooms.load">
                <div
                    v-for="item in rooms.list"
                    class="m-panel__delta--note__wrap pl-4 m-panel__delta--link d-flex"
                    @click="onClick(item)"
                    >
                    <span class="m-panel__delta--note__header--chevron__wrap mr-2">
                        <v-icon
                            v-text="item.active ? 'mdi-eye' : 'mdi-eye-off'"
                            size="20">
                        </v-icon>
                    </span>
                    <div class="m-panel__delta--note__header">
                        <div
                            :style="{'background-color': getColor(item)}"
                            class="m-panel__rooms--note__color"/>
                        <div class="pl-2">{{item.Name}}</div>
                    </div>
                </div>
            </template>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'PanelRooms',
    props: ['menuItem', 'rooms', 'styleP'],
    data(){
        return {
            minimize: false
        }
    },
    methods: {
        cancel(){
            this.$emit('setOption', this.menuItem)
        },
        onClick(i){
            i.active = !i.active
            this.$emit('onRoomVisibilityItem', {ids: [i.Id], value: i.active})
        },
        getColor(i){
            let item = this.rooms.colors.find(c => c.id == i.Id)
            if(item){
                return item.color
            }
            else{
                return '#efefef'
            }
        },
        onVisibleAll(v){
            this.rooms.list.map(i => {
                i.active = v
            })
            this.$emit('onRoomVisibility', {value: v})
        }
    }
}
</script>
