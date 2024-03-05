<template>
    <v-container fluid pa-0 pb-10>
        <v-toolbar flat color="#fafafa" class="m-table-toolbar">
            <v-text-field
                v-model="search"
                prepend-icon="search"
                placeholder="Поиск..."
                single-line
                hide-details
                class="m-table-toolbar--search"
                ></v-text-field>

            <v-spacer></v-spacer>
            <v-btn
                v-for="(i, j) in table_type_list"
                :key="j"
                depressed
                :color="table_type == i.name ? '#e1e1e1' : '#fafafa'"
                class="m-btn-icon--cube"
                :class="{active: table_type == i.name}"
                @click="setTableType(i.name)">
                <v-icon
                    color="#6e6e6e"
                    size="25">{{i.icon}}</v-icon>
            </v-btn>
        </v-toolbar>

        <v-data-table
            v-if="table_type == 'list'"
            :headers="headers"
            :items="list"
            :items-per-page="5"
            :search="search"
            :footer-props="{
                itemsPerPageText: 'Строк на странице:',
                pageText: '{0}-{1} из {2}'
            }"
            class="m-table-custom"
            @click:row="getProject"
            >
            <template v-slot:item.action="{ item }">
                <v-icon
                    class="m-icon-border"
                    @click="getProject(item)"
                    size="20">mdi-dots-horizontal</v-icon>
            </template>
        </v-data-table>

        <table-grid
            v-if="table_type == 'grid'"
            :list="filteredProjects"
            :headers="headers"
            :actions="[getProject]"
        >
        </table-grid>
    </v-container>
</template>

<script>
import { mapState } from "vuex"

    export default {
        components: {
            TableGrid: () => import('./TableGrid')
        },
        data () {
            return {
                search: '',
                headers: [
                    {
                        text: '',
                        align: 'center',
                        sortable: false,
                        value: 'src',
                        grid: false
                    },
                    { text: 'Название проекта', value: 'name', grid: true },
                    { text: 'Ответственный за проект', value: 'user', grid: false },
                    { text: 'Заказчик', value: 'client', grid: false },
                    { text: 'Адрес', value: 'address', grid: false },
                    { text: 'Номер проекта', value: 'number', grid: false },
                    { text: '', value: 'action', sortable: false, grid: false }
                    ],
                list: [],
                table_type_list: [{
                    name: 'list',
                    icon: 'mdi-format-list-bulleted'
                },{
                    name: 'grid',
                    icon: 'mdi-view-grid'
                }],
            }
        },
        created(){
            let list = this.$store.state.projects.projects
            this.list = list
        },
        computed: mapState({
            table_type(state){
                let type = state.projects.table_type
                type = type ? type : 'list'
                return type
            },
            filteredProjects() {
                const s = this.search.toLowerCase()
                return this.list.filter(n => n.name.toString().toLowerCase().includes(s))
                //return this.projects.filter(n => Object.values(n).some(m => m.toString().toLowerCase().includes(s)))
            }
        }),
        methods: {
            getProject: function(i){
                this.$router.push('/cloud/projects/'+ i.id + '/params')
            },
            setTableType(v){
                this.$store.commit('projects/setTableType', {
                    value: v
                })
            }
        }
    }
</script>
