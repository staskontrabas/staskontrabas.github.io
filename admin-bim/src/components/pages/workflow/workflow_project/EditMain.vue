<template>
    <v-menu
      top
      right
      offset-y
      transition="slide-y-transition"
    >
        <template v-slot:activator="{ on }">
            <v-btn
                v-on="on"
                text
                icon
                @mousedown.stop=""
                class="m-btn-back--white"
                color="#7f7f7f">
                <v-icon
                    size="20">mdi-dots-horizontal</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-list dense>
                <v-list-item
                    v-for="(note, i) in notes"
                    :key="i"
                    @click="action(note.action)"
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
        data: () => ({
            notes: [{
                title: 'Сохранить как шаблон',
                value: 'saveTemplate',
                action: 'saveTemplate'
            },{
                title: 'Выбрать шаблон',
                value: 'choiceTemplate',
                action: 'choiceTemplate'
            },{
                title: 'Удалить',
                value: 'remove',
                action: 'remove'
            },{
                title: 'Права доступа',
                value: 'access',
                action: 'accessFolder'
            },]
        }),
        methods: {
            action(v){
                this.$emit('update:' + v, true)
            }
        }
    }
</script>
