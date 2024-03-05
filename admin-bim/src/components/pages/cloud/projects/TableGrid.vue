<template>
    <div>
        <v-row>
            <v-col
                v-for="(item, index) in list"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                >
                <v-card
                    outlined
                    flat
                    tile
                    @click.native="action(item)"
                    class="m-table-grid">
                    <v-card-title class="m-table-grid--name"></v-card-title>

                    <v-list dense>
                        <v-list-item
                            v-for="(i, j) in getHeaders(headers)"
                            :key="j"
                            class="m-table-grid--item"
                        >
                            <v-list-item-content class="m-table-grid--item-cell">
                            </v-list-item-content>
                            <v-list-item-content class="align-end m-table-grid--item-cell m-table-grid--item-end">
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <v-divider></v-divider>
                    <v-col class="m-table-grid--item-bottom">
                        <div>
                            {{item.name}}
                        </div>
                        <div>
                            <span class="m-table-grid--span">

                            </span>
                        </div>
                    </v-col>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    export default {
        name: 'TableGrid',
        props: ['headers', 'list', 'actions'],
        methods: {
            getHeaders(a){
                let headers = a.filter(item => item.grid)
                return headers
            },
            action(v){
                this.actions[0](v)
            }
        }
    }
</script>
