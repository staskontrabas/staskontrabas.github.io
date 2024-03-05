<template>
    <v-menu
      top
      right
      offset-y
      transition="slide-y-transition"
    >
        <template v-slot:activator="{ on }">
            <v-icon
                v-on="on"
                text
                icon
                class="m-icon-border"
                @mousedown.stop=""
                size="20">
                mdi-dots-horizontal
            </v-icon>
        </template>
        <v-card>
            <v-list dense>
                <v-list-item
                    v-for="(note, i) in createMenu"
                    :key="i"
                    @click="action(note)"
                    >
                  <v-list-item-icon class="mr-1">
                    <v-icon color="#0070e0" size="20">{{note.icon}}</v-icon>
                </v-list-item-icon>
                    <v-list-item-title
                        class="m-menu-title"
                        v-text="note.title" />
                </v-list-item>
            </v-list>
        </v-card>
    </v-menu>
</template>

<script>
import { getAccess, checklicense } from '@/utils/services'

export default {
    props: ['item', 'permission'],
    data: () => ({
        notes: [{
            title: 'О проекте',
            value: 'about',
            action: 'about',
            access: 7,
            icon: 'trd-info',
            lic: null
        },{
            title: 'Проверить ИМ',
            value: 'verifyproject',
            action: 'verifyproject',
            access: 7,
            icon: 'mdi-checkbox-marked-outline',
            lic: null
        },{
            title: 'Экспертиза',
            value: 'struct',
            action: 'struct',
            access: 7,
            icon: 'trd-info',
            lic: 'licStruct'
        },{
            title: 'Создать XML-схему',
            value: 'createxml',
            action: 'createxml',
            access: 7,
            icon: 'trd-xml',
            lic: 'licCreatexml'
        },{
            title: 'Удалить',
            value: 'remove',
            action: 'remove',
            access: 1,
            icon: 'trd-trash',
            lic: null
        }]
    }),
    computed: {
        createMenu(){
            return this.notes
        }
    },
    methods: {
        action(v){
            switch(v.action){
                case 'about':
                    this.$emit('onProject', this.item)
                    break
                case 'verifyproject':
                    this.$emit('verifyproject', this.item)
                    break
                case 'struct':
                    this.$emit('onProjectDescription')
                    break
                case 'createxml':
                    this.$emit('onCreateXml', this.item)
                    break
                case 'remove':
                    this.$emit('removeProject', this.item)
                    break
                default:
                    this.$emit('getProject', this.item)
            }
        }
    }
}
</script>
