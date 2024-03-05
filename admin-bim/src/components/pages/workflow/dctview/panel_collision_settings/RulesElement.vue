<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Выберите элемент
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
        <v-card-title class="pr-0 pl-4 m-modal--title">
            <v-text-field
                class="ma-0 pl-0 pr-4 pb-2 pt-0"
                v-model="search"
                type="text"
                clearable
                prepend-inner-icon="search"
                placeholder="Поиск..."
                single-line
                hide-details
            ></v-text-field>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4" style="background-color: #fbfbfb;">
            <v-row dense>
                <v-col
                    :cols="12"
                >
                    <v-card
                        class="ml-2 pa-0"
                        flat
                        min-height="250"
                        outlined
                    >
                        <v-card-text class="m-text--color-black pa-0">
                            <v-list flat dense class="pa-0">
                                <v-list-item
                                    v-show="this.list.length"
                                    @click="onAll()"
                                    :class="[{'v-list-item--active': this.selected.length == this.list.length}, 'primary--text']"
                                    >Все
                                </v-list-item>
                                <v-list-item-group
                                    v-model="selected"
                                    multiple
                                    color="primary"
                                    class="pa-0">
                                    <v-list-item
                                        v-for="item in list"
                                        :value="item"
                                        >{{item}}
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-spacer></v-spacer>
            <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="setComponent">Отмена</v-btn>
            <v-btn outlined color="primary" class="m-btn" @click="add">Добавить
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>

export default {
    name: 'RulesSettings',
    props: ['temp', 'componentNames', 'elems_json'],
    data(){
        return {
            search: '',
            selected: [],
            componentType: this.temp.componentType || []
        }
    },
    computed: {
        list(){
            let list = this.temp['list_' + this.temp.list] || []
            let std = this.temp.std || 'ksi'
            let elems = this.componentType.length
                ? (() => {
                    let list = []
                    if(this.elems_json){
                        this.componentType.map(t => {
                            list = [...list, ...Object.keys(this.elems_json[std][t] || {})]
                        })
                    }
                    return list
                })()
                : Object.keys(this.componentNames[std])
            return elems
                .filter(f => !list.some(s => s == f))
                .filter(f => f.toLowerCase().includes((this.search || '').toLowerCase()))
                .sort()
        }
    },
    methods: {
        cancel(){
            this.$emit('cancel')
        },
        setComponent(){
            this.$emit('setComponent')
        },
        add(){
            let update = JSON.parse(JSON.stringify(this.temp))
            let list = this.temp['list_' + this.temp.list] || []
            update = {...update, ['list_' + update.list]: [...list, ...this.selected]}
            this.$emit('setParams', update)

            this.setComponent()
        },
        onAll(){
            if(this.selected.length == this.list.length){
                this.selected = []
            }
            else{
                this.selected = this.list
            }
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.cancel()
            }
        }
    },
    mounted(){
        document.addEventListener('keyup', this.enter, false)
    },
    beforeDestroy(){
        document.removeEventListener('keyup', this.enter, false)
    }
}
</script>
