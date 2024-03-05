<template>
    <v-card
        class="m-card-scrollable"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Изменения
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

        <v-card-text
            class="pa-0 pb-5 pt-2 m-card-scrollable__text">
            <div class="pr-0 pl-4 py-1 m-panel__delta--wrap">
                <div class="m-panel__delta--cube m-panel__delta--green">
                    <span class="m-text--size14">{{delta.add}}</span>
                    <span>Добавлено</span>
                </div>
                <div class="m-panel__delta--cube m-panel__delta--red">
                    <span class="m-text--size14">{{delta.del}}</span>
                    <span>Удалено</span>
                </div>
                <div class="m-panel__delta--cube m-panel__delta--yellow">
                    <span class="m-text--size14">{{delta.mod}}</span>
                    <span>Изменено</span>
                </div>
            </div>
            <v-divider class="pb-2"></v-divider>
            <div
                v-for="item in delta.list"
                class="m-panel__delta--note__wrap"
                :class="{active: item.active}"
                @click="item.active = !item.active"
                >
                <div class="m-panel__delta--note__header">
                    <span class="m-panel__delta--note__header--chevron__wrap">
                        <v-icon
                            v-if="item.parameters && item.parameters.length"
                            class="m-panel__delta--note__header--chevron" size="20">mdi-chevron-right
                        </v-icon>
                    </span>
                    <div
                        :class="'m-panel__delta--' + item.color"
                        class="m-panel__delta--note__color"/>
                    <span class="pl-2">{{item.name}}</span>
                </div>
                <div class="m-panel__delta--note__body">
                    <div
                        v-for="param in item.parameters"
                        class="m-panel__delta--note__desc"
                        >
                        <span>{{param.name}}</span>
                        <v-spacer></v-spacer>
                        <span>{{param.value}}{{param.units}}</span>
                    </div>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'PanelDelta',
    props: ['menuItem', 'delta', 'styleP'],
    data(){
        return {
            minimize: false,
            // status: {
            //     'modified': 'yellow',
            //     'deleted': 'red',
            //     'added': 'green'
            // },
            items: []//this.delta
        }
    },
    methods: {
        cancel(){
            this.$emit('setOption', this.menuItem)
        },
        // setItems(a){
        //     return a.map(d => {
        //         return {
        //             name: d.id + ' | ' + d.name,
        //             color: this.status[d.status],
        //             active: false,
        //             quantity: []
        //         }
        //     })
        // }
    }
}
</script>
