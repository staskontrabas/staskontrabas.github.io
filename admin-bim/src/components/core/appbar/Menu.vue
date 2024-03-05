<template>
    <v-menu
      bottom
      left
      offset-y
      transition="slide-y-transition"
    >
        <template v-slot:activator="{ attrs, on }">
            <v-btn
                v-bind="attrs"
                v-on="on"
                text
                icon
                color="#7f7f7f">
                <v-icon size="30">menu</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-list dense>
                <v-list-item
                    v-for="(note, i) in getLinks"
                    :key="i"
                    class="m-custom--list__item--width220"
                    :href="note.link"
                    target="_blank"
                    @click="onClick"
                    >
                    <v-list-item-title v-text="note.title" />
                </v-list-item>
            </v-list>
        </v-card>
    </v-menu>
</template>

<script>
    export default {
        data(){
            return {
                main: {
                    title: 'UnitBIM',
                    link: 'https://ubapp.ru/'
                },
                dev: {
                    title: 'Разработчикам',
                    link: 'https://ubapp.ru/develop/'
                },
                docs: {
                    title: 'Справочник',
                    link: 'https://doc.unitbim.ru/'
                },
                pol: {
                    title: 'Политика',
                    link: 'https://policy.unitbim.ru/politika-obrabotki-dannykh'
                },
                cont: {
                    title: 'Контакты',
                    link: 'https://ubapp.ru/contacts/'
                },
                list: ['main', 'dev', 'docs', 'pol', 'cont']
            }
        },
        computed: {
            getLinks(){
                return this.list.map(itm => {
                    return this[itm]
                })
            }
        },
        methods: {
            onClick(){
            },
        }
    }
</script>
