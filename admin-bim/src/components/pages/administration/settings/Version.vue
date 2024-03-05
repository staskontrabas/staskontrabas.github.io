<template>
    <v-container fluid px-3 pa-0 pb-10 class="m-container">
        <v-divider></v-divider>
        <div>
            <div
                class="m-list--item m-no-hover">
                <div class="m-list--item-title">{{title}}</div>
                <div class="m-list--item-desc">
                    <v-row>
                        <v-col cols="12" sm="10" md="10">
                            {{desc}}
                        </v-col>
                        <v-col cols="12" sm="2" md="2">
                            <v-select
                                v-model="value"
                                :items="items"
                                class="m-autocomplete"
                                @change="onChange"
                                outlined
                                item-text="title"
                                item-value="value"
                            >
                                <template v-slot:item="data">
                                    <div class="v-list-item__content">
                                        <div
                                            class="v-list-item__title"
                                            :class="{'m-text--size22': data.item.id == 1000}">
                                            {{data.item.title}}
                                        </div>
                                    </div>
                                </template>
                            </v-select>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </div>
    </v-container>
</template>

<script>
import {html2text} from '@/utils/services'

export default {
    name: 'Version',
    data () {
        return {
            title: 'Количество версий',
            desc: 'Укажите, какое количество версий файла будут храниться на облаке. В случае, если вы уменьшаете текущее количество версий, версии, которые будут удалены, нельзя будет восстановить.',
            value: 0,
            items: [{
                title:'Нет',
                value: 0,
                id: 0
            },{
                title:'3',
                value: 3,
                id: 1
            },{
                title:'4',
                value: 4,
                id: 2
            },{
                title:'5',
                value: 5,
                id: 3
            },{
                title:'6',
                value: 6,
                id: 4
            },{
                title:'7',
                value: 7,
                id: 5
            },{
                title:'8',
                value: 8,
                id: 6
            },{
                title:'9',
                value: 9,
                id: 7
            },{
                title:'10',
                value: 10,
                id: 8
            },{
                title:'15',
                value: 9,
                id: 9
            },{
                title:'20',
                value: 20,
                id: 10
            },{
                title: html2text('&#8734;'),
                value: -1,
                id: 1000,
            }]
        }
    },
    methods: {
        onChange(v){
            this.$store.dispatch('administration/setHistoryLimit', v)
        }
    },
    beforeCreate(){
        this.$store.dispatch('administration/getHistoryLimit')
        .then(res => {this.value = res})
    }
}
</script>
