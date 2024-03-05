<template>
    <v-container fluid px-3 pb-10 pt-0 class="m-container">

        <v-toolbar flat height="auto" class="m-table-toolbar pl-2">
            <span class="pa-2 m-text--size13">Глобальные настройки</span>
        </v-toolbar>

        <v-data-table
            :headers="headers"
            :items="list_"
            disable-pagination
            hide-default-footer
            class="m-table-custom"
        >
            <template v-slot:no-data>
                {{noData}}
            </template>

            <template v-slot:item.owner="{ item }">
                <span>Да</span>
            </template>
            <template v-slot:item.admin="{ item }">
                <span>Да</span>
            </template>

            <template v-slot:item.client="{ item }">
                <v-switch
                    :value="item.client.value"
                    color="success"
                    @change="setPermission(item.client)"
                    inset
                ></v-switch>
            </template>
            <template v-slot:item.suborder="{ item }">
                <v-switch
                    :value="item.suborder.value"
                    color="success"
                    @change="setPermission(item.suborder)"
                    inset
                ></v-switch>
            </template>
            <template v-slot:item.manager="{ item }">
                <v-switch
                    :value="item.manager.value"
                    color="success"
                    @change="setPermission(item.manager)"
                    inset
                ></v-switch>
            </template>
            <template v-slot:item.employee="{ item }">
                <v-switch
                    :value="item.employee.value"
                    color="success"
                    @change="setPermission(item.employee)"
                    inset
                ></v-switch>
            </template>

            <template v-slot:footer>
                <v-card-actions class="pa-5 px-4">
                    <v-spacer></v-spacer>
                    <v-btn
                        outlined
                        color="primary"
                        class="m-btn"
                        :disabled="!checkChange"
                        @click="savePremissions">Сохранить</v-btn>
                </v-card-actions>
            </template>
        -->
        </v-data-table>
    </v-container>
</template>

<script>
export default {
    name: 'Rights',
    data(){
        return {
            slot: true,
            items: [{
                name: 'owner',
                id: '1',
            },{
                name: 'admin',
                id: '2',
            },{
                name: 'client',
                id: '3',
            },{
                name: 'suborder',
                id: '4',
            },{
                name: 'manager',
                id: '5',
            },{
                name: 'employee',
                id: '6',
            }],
            headers: [{
                    text: '',
                    align: 'left',
                    sortable: false,
                    value: 'name',
                },
                { text: 'владелец', value: 'owner', sortable: false },
                { text: 'админ', value: 'admin', sortable: false },
                { text: 'клиент', value: 'client', sortable: false },
                { text: 'Субподрядчик', value: 'suborder', sortable: false },
                { text: 'Менеджер', value: 'manager', sortable: false },
                { text: 'сотрудник', value: 'employee', sortable: false },
            ],
            noData: 'Нет данных',
            listPermission: [
                {
                    name: 'can_create_project',
                    title: 'Создать проект',
                    permissions: []
                },{
                    name: 'can_delete_project',
                    title: 'Удалить проект',
                    permissions: []
                },{
                    name: 'can_add_client',
                    title: 'Добавить клиента',
                    permissions: []
                },{
                    name: 'can_add_subcontractor',
                    title: 'Добавить субподрядчика',
                    permissions: []
                },{
                    name: 'can_send_project',
                    title: 'Передать проект',
                    permissions: []
                },{
                    name: 'can_manage_company',
                    title: 'Редактировать компанию',
                    permissions: []
                },{
                    name: 'can_manage_projects',
                    title: 'Редактировать проект',
                    permissions: []
                },{
                    name: 'can_manage_users',
                    title: 'Редактировать пользователя',
                    permissions: []
                }
            ],
            groupPermissions: [],
            listIDChange: []
        }
    },
    computed: {
        list_(){
            let list = this.listPermission.map(l => {
                return {
                    name: l.title,
                    id: l.name,
                    ...Object.fromEntries(this.items.map(i => {
                        let permissions = this.groupPermissions.find(p => p.id == i.id) || ''
                        return [[i.name], {
                            itemID: permissions.id,
                            type: 'permission',
                            name: l.name,
                            value: permissions[l.name]
                        }]
                    }))
                }
            })
            return list
        },
        checkChange(){
            let check = false
            this.groupPermissions.map(p => {
                let sourceP = this.$store.state.administration.groupPermissions
                    .find(s => s.id == p.id)
                Object.entries(p).map(([k, v]) => {
                    if(k !== 'users' && v != sourceP[k]){
                        this.listIDChange.push(p.id)
                        check = true
                    }
                })
            })
            return check
        }
    },
    methods: {
        setPermission(i){
            this.groupPermissions = this.groupPermissions.map(p => p.id == i.itemID
                ? {...p, [i.name]: !i.value}
                : p
            )
        },
    },
    created(){
    }
}
</script>
