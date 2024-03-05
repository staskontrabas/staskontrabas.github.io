<template>
    <v-data-table
        :headers="headers"
        :items="dcts"
        :items-per-page="5"
        class="m-table-custom"
    >
        <template v-slot:no-data>
            {{noData}}
        </template>
        <template v-slot:item.src="{ item }">
            <div class="m-psevdo">
            </div>
        </template>
        <template v-slot:item.action="{ item }">
            <v-icon
                small
                class="mr-2"
                @click="getDct(item.id)"
            >
            edite
            </v-icon>
        </template>
        <template v-slot:item.status="{ item }">
            {{status[item.status]}}
        </template>
    </v-data-table>
</template>

<script>
    export default {
        name: 'DctList',
        data () {
            return {
                headers: [
                    {
                        text: '',
                        align: 'center',
                        sortable: false,
                        value: 'src',
                    },
                    { text: 'НАЗВАНИЕ', value: 'name' },
                    { text: 'ОТВЕТСТВЕННЫЙ ЗА ПРОЕКТ', value: 'user' },
                    { text: 'ПРОЕКТ', value: 'project' },
                    { text: 'СОЗДАЛ', value: 'creator' },
                    { text: 'ВЕРСИЯ', value: 'version' },
                    { text: 'СТАТУС', value: 'status' },
                    { text: '', value: 'action', sortable: false },
                    ],
                dcts: [],
                status: {
                    '0': 'Готово',
                    '1': 'На рассмотрении'
                },
                noData: 'Нет данных'
            }
        },
        created(){
            let list = this.$store.state.workflow.dcts.filter(item => item.project == this.$route.params.id)
            let projectName = this.$store.state.workflow.active.name
            list = list.map(item => Object.assign({}, item, {project: projectName}))
            this.dcts = list
        },
        methods: {
            getDct: function(id){
                this.$router.push('/workflow/view/' + id)
            }
        }
    }
</script>
