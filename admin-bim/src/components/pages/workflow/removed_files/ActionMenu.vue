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
                    v-for="(note, i) in notes"
                    :key="i"
                    @click="action(note)"
                    >
                    <v-list-item-title
                        class="m-menu-title"
                        v-text="note.title" />
                </v-list-item>
            </v-list>
        </v-card>
    </v-menu>
</template>

<script>
export default {
    props: ['item'],
    data: () => ({
        notes: [{
            title: 'Восстановить',
            value: 'restore',
            action: 'restore'
        },{
            title: 'Удалить',
            value: 'remove',
            action: 'remove'
        }]
    }),
    methods: {
        action(v){
            switch(v.action){
                case 'restore':
                    this.$emit('onRestore', this.item)
                    break
                case 'remove':
                    this.$emit('onRemove', this.item, this.item.type)
                    break
                default: ;
            }
        }
    }
}
</script>
