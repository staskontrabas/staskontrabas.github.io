<template>
    <div class="m-panel__options--3d d-flex" >

        <v-card v-for="block in getOptions" class="m-panel__options--block">
            <v-card-actions>
                <div
                    v-for="item in block"
                    :key="item.name"
                    class="option--wrap">
                    <v-tooltip
                        v-if="!item.hidden"
                        :disabled="!item.title"
                        top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-if="item.type == 'btn' || !item.type"
                                class="m-btn m-btn-icon--cube mx-1"
                                text
                                v-bind="attrs"
                                v-on="on"
                                :disabled="item.disabled"
                                @click="setOption(item, item.name)">
                                <v-icon
                                    v-if="item.icon"
                                    size="22"
                                    :color="item.active && !item.turnoff ? '#4e93e9' : btn_color">{{item.icon}}</v-icon>
                            </v-btn>
                            <span
                                v-else
                                class="m-text--size12 m-text--color-white"
                                >{{optionValue(item.value)}}</span>
                        </template>
                        <span>{{item.title}}</span>
                    </v-tooltip>

                    <v-card
                        v-if="item.children && item.expanded"
                        class="option--sub">
                        <div
                            class="option--sub-item"
                            v-for="(sub, n) in item.children"
                            :key="n"
                            @click="setSubOption(item, item.name, sub, n)"
                            >
                            <v-icon
                                size="24"
                                :color="sub.active ? '#4e93e9' : btn_color">{{sub.icon}}</v-icon>
                            <span :class="{active: sub.active}">{{sub.title}}</span>
                        </div>
                    </v-card>
                </div>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
export default {
    name: 'PanelOptions',
    props: ['options', 'params'],
    data(){
        return{
            // btn_color: '#525252'
            btn_color: '#fff'
        }
    },
    computed: {
        getOptions(){
            let keys = Object.keys(this.options)
            let list = []
            let blocks = []
            keys.map(key => {
                if(!this.options[key].hidden){
                    list.push(this.options[key])
                    if(this.options[key].divider){
                        blocks.push(list)
                        list = []
                    }
                }
            })
            return blocks
        }
    },
    methods: {
        setSubOption(i, name, sub, sub_name){
            this.$emit('setSubOption', {
                name: name,
                active: i.active,
                sub_name: sub_name,
                sub_active: sub.active
            })
        },
        setOption(i, n){
            this.$emit('setOption', {
                name: n,
                active: i.active,
                turnoff: i.turnoff || false
            })
        },
        optionValue(v){
            return this.params[v] || ''
        }
    }
}
</script>
