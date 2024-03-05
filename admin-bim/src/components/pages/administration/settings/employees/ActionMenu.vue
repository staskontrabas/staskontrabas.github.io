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
                @mousedown.stop.pevent=""
                size="20">
                mdi-dots-horizontal
            </v-icon>
        </template>
        <v-card>
            <v-list dense>
                <v-list-item
                    v-for="(item, i) in getItems"
                    :key="i"
                    @click="action(item)"
                    >
                    <v-list-item-title
                        class="m-menu-title"
                        v-text="item.title" />
                </v-list-item>
            </v-list>
        </v-card>
    </v-menu>
</template>

<script>
    export default {
        props: ['item'],
        data: () => ({
            items: [{
                title: 'Редактировать',
                value: 'edit',
                action: 'editUser'
            },{
                title: 'Отправить приглашение',
                value: 'reconfirm',
                action: 'reconfirm'
            },{
                title: 'Удалить',
                value: 'remove',
                action: 'removeUser'
            }]
        }),
        computed: {
            getItems(){
                let list = this.items
                if(this.item.status){
                    list = list.filter(i => i.value != 'reconfirm')
                }
                else{
                    list = list.filter(i => i.value != 'edit')
                }
                if(this.item.id == this.getUser.id){
                    list = list.filter(i => i.value != 'remove')
                }
                return list
            },
            getUser(){
                return this.$store.state.administration.user
            }
        },
        methods: {
            action(v){
                switch(v.action){
                    case 'removeUser':
                        this.$emit('removeUser', [this.item])
                        break
                    case 'editUser':
                        this.$emit('editUser', this.item)
                        break
                    case 'reconfirm':
                        this.$emit('reconfirm', this.item)
                        break
                    default: return
                }
            }
        }
    }
</script>
