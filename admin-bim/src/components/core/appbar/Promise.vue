<template>
    <v-menu
        min-width="100%"
        offset-y
        :value="note.length"
        transition="slide-y-transition"
        :close-on-click="false"
        :close-on-content-click="false"
        attach="#ddd"
        auto
        >
        <template v-slot:activator="{ attrs}">
            <div
                class="m-promise-event"
                v-bind="attrs"
                :role="'list'"
                id="ddd"
            >
            </div>
        </template>
        <v-card>
            <v-list-item
                v-for="(i, j) in note"
                :key="j + 'file'"
            >
                <v-list-item-avatar size="25">
                    <v-img :src="promise[i.action].src"></v-img>
                </v-list-item-avatar>
                <v-list-item-content class="m-text--size12">
                    {{(promise[i.action].text) + i.name}}
                </v-list-item-content>
                <v-list-item-action>
                    <v-btn
                        icon
                        :width="24"
                        :height="24"
                        @click="abortFetch({uuid: i.uuid})">
                        <v-icon
                          :size="18"
                        >
                          mdi-close
                        </v-icon>
                    </v-btn>
                </v-list-item-action>
            </v-list-item>
        </v-card>
    </v-menu>
</template>

<script>
export default {
    name: 'Promise',
    data(){
        return {
            promise: {
                upload: {
                    src: require('@/assets/images/arrows.svg'),
                    text: 'Загрузка файла '
                },
                download: {
                    src: require('@/assets/images/download.gif'),
                    text: 'Скачивание файла '
                },
                createxml: {
                    src: require('@/assets/images/arrows.svg'),
                    text: 'Генерация xml '
                }
            }
        }
    },
    computed: {
        note(){
            let list = this.$store.state.common.uploadFileNames
            return list
        }
    },
    methods: {
        abortFetch({uuid, action}){
            this.$store.dispatch('common/abortFetch', {uuid})
        }
    }
}
</script>
