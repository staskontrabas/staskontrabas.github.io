<template>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :items-per-page="5"
      class="m-table-custom"
    >
        <template v-slot:item.action="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="getProject(item.number)"
          >
            edite
          </v-icon>
        </template>
    </v-data-table>
</template>

<script>
    export default {
        data () {
            return {
                headers: [
                    {
                        text: '',
                        align: 'center',
                        sortable: false,
                        value: 'src',
                    },
                    { text: 'НАЗВАНИЕ ПРОЕКТА', value: 'name' },
                    { text: 'ОТВЕТСТВЕННЫЙ ЗА ПРОЕКТ', value: 'user' },
                    { text: 'ЗАКАЗЧИК', value: 'client' },
                    { text: 'АДРЕС', value: 'address' },
                    { text: 'НОМЕР ПРОЕКТА', value: 'number' },
                    { text: '', value: 'action', sortable: false },
                    ],
                desserts: [],
            }
        },
        created(){
            let list = this.$store.state.projects.projects
            this.desserts = list
        },
        methods: {
            getProject: function(id){
                //this.$router.push('/cloud/projects/'+ id + '/params')

            }
        }
    }
</script>
