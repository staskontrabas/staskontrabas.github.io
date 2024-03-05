<template>
    <v-menu
      top
      right
      offset-y
      transition="slide-y-transition"
    >
        <template v-slot:activator="{ on }">
            <div
                v-if="false"
                class="flex m-create-menu"
                v-on="on">
                <v-icon>
                    mdi-plus
                </v-icon>
                <span>Создать</span>
            </div>
        </template>
        <v-card>
            <v-list dense>
                <v-list-item
                    v-for="(note, i) in notes"
                    :key="i"
                    @click="create(note.value)"
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
        props: ['node'],
        data: () => ({
            notes: [{
                    title: 'Группу',
                    value: 'group'
                },
                {
                    title: 'Папку',
                    value: 'folder'
            }],
        }),
        methods: {
            create(v){
                let isFile = {
                    parent: 0,
                    file: false,
                    group: false,
                    lvl: 1
                }
                this.$emit('update:editNode', 0)

                if(v == 'group'){
                    isFile.group = true
                    this.$emit('update:newGroup', true)
                }
                else{
                    isFile.group = false
                    this.$emit('update:newFolder', true)
                }

                this.$emit('update:isFile', isFile)
            }
        }
    }
</script>
