<template>
    <v-col cols="12" class="pt-0" :style="{overflow: 'auto'}">
        <v-row dense>
            <v-col
                v-for="(item, index) in userList"
                :key="index"
                cols="12">

                <v-card
                :outlined="true"
                color="#fafafa"
                class="m-access-card"
                >
                    <v-container class="pt-0">
                        <v-row >
                            <v-col cols="2" class="pt-1">
                                <v-avatar
                                    size="30">
                                    <img
                                        src="https://cdn.vuetifyjs.com/images/john.jpg"
                                    >
                                </v-avatar>
                            </v-col>
                            <v-col cols="10" class="pt-0">
                                <div class="m-access-name">
                                    {{ item.name }}
                                </div>
                                <div class="m-access-emp">
                                    {{ item.emp }}
                                </div>
                                <div class="m-access-status" v-if="item.userID != user.id || item.status">
                                    {{ getStatus(item.status) }}
                                </div>
                                <v-card-actions v-else class="pa-0">
                                    <v-btn v-if="!item.status"
                                        class="mt-2 m-btn"
                                        outlined
                                        color="primary"
                                        @click="setAccess(item.id)"
                                    >
                                    Утвердить
                                    </v-btn>
                                </v-card-actions>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </v-col>
</template>

<script>
    export default {
        name: 'Access',
        data () {
            return {
                user: {
                    id: '001'
                },
                statusList: [{
                    value: 1,
                    name: 'Утвердил'
                },{
                    value: 0,
                    name: 'Не утвердил'
                }],
                userList: [{
                    id: '003',
                    userID: '002',
                    avatar: 'https://cdn.vuetifyjs.com/images/john.jpg',
                    "name": "Вася Петров",
                    "emp": "Главный архитектор",
                    status: 1
                },{
                    id: '002',
                    userID: '003',
                    avatar: 'https://cdn.vuetifyjs.com/images/john.jpg',
                    "name": "Вася Петров",
                    "emp": "Главный инженер",
                    status: 0
                },{
                    id: '001',
                    userID: '001',
                    avatar: 'https://cdn.vuetifyjs.com/images/john.jpg',
                    "name": "Вася Петров",
                    "emp": "Главный архитектор",
                    status: 0
                }]
            }
        },
        methods: {
            getStatus(s){
                return this.statusList.filter(item => item.value == s)[0].name
            },
            setAccess(id){
                this.userList = this.userList.map(item => item.id == id ? Object.assign(item, {status: 1}) : item)
            }
        }
    }
</script>
