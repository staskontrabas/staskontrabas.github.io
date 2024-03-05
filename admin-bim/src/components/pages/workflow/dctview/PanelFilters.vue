<template>
    <v-card
        class="m-card-scrollable"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Постановление 87
            <span class="m-text--color-red">&nbsp;(бета версия)</span>
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
            class="pa-0 pb-5 m-card-scrollable__text">
            <v-list-item class="py-0 m-link--list-item">
                <v-list-item-content class="pl-1 py-0">
                        <span><a target="_blank" href="https://doc.unitbim.ru/vozmozhnosti/postanovlenie-87-v-im"> Почему не скрываются объекты?</a></span>
                </v-list-item-content>
            </v-list-item>
            <v-list-group
                class="m-list-group"
                :value="true"
                sub-group
                v-for="part in filters"
                >
                <template v-slot:activator>
                    <v-list-item-content class="pl-1 py-3">
                        <v-list-item-title>{{part.title}}</v-list-item-title>
                    </v-list-item-content>
                </template>
                <template v-slot:prependIcon>
                    <v-list-item-icon class="ma-0">
                        <v-icon size="20" class="ma-0" v-text="'mdi-chevron-down'"></v-icon>
                    </v-list-item-icon>
                </template>

                <v-list-group
                    class="m-list-group"
                    :value="true"
                    v-for="item in part.items"
                    @click=""
                    >
                    <template v-slot:activator>
                        <v-list-item-content class="pl-1 py-3">
                            <v-list-item-title>{{item.title}}</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <template v-slot:prependIcon>
                        <v-list-item-icon class="ma-0">
                            <v-icon
                                size="20"
                                class="ma-0"
                                @click.stop.self="onFilter(item, !item.active, false)"
                                v-text="!item.active ? 'mdi-eye' : 'mdi-eye-off'">
                            </v-icon>
                        </v-list-item-icon>
                    </template>

                    <v-list-item
                        v-for="type in item.items"
                        class="pl-12"
                        @click.stop="onFilter(type, !type.active, item.active)"
                        >
                        <v-list-item-icon class="mr-2 ml-6">
                            <v-icon size="20" v-text="!type.active ? 'mdi-eye' : 'mdi-eye-off'"></v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title v-text="type.title"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                </v-list-group>
            </v-list-group>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'PanelFilters',
    props: ['menuItem', 'filters', 'styleP'],
    data(){
        return {
            minimize: false
        }
    },
    methods: {
        cancel(){
            this.minimize = false
            this.$emit('setOption', this.menuItem)
            this.$emit('setFilters', false)
        },
        onFilter(o, active, parent, action = true){
            if(parent){
                return true
            }
            o.active = active
            o.items = o.items.map(i => {
                this.onFilter(i, active, false, false)
                return {...i, active: active}
            })
            if(action){
                this.$emit('onFilter', o)
            }
        }
    }
}
</script>
