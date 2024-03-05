<template>
    <v-container fluid px-3 pb-10 pt-0 class="m-container" ref="wrap">

        <v-card outlined class="m-card pa-3 pt-0 mb-6">
            <v-card-text class="m-text--2c m-text--size22"> Обзор рабочей группы </v-card-text>
            <v-row class="ma-0">
                <v-col cols="3" class="justify-center pt-0 pl-4">
                    <div class="m-text--size13 mb-2">Участники</div>
                    <div class="m-text--size22 mb-2">
                        <span v-if="currentLicense">{{currentLicense.users}}</span>
                    </div>
                </v-col>
                <v-col cols="3" class="justify-center pt-0 px-0">
                    <div class="m-text--size13 mb-2">Занятое место</div>
                    <div class="m-text--size22 mb-2">
                        <span class="m-text--color-blue">{{project_size}}</span>
                        <span v-if="currentLicense"> / {{currentLicense.space}}</span>
                    </div>
                </v-col>
                <v-col cols="3" class="justify-center pt-0 px-0">
                    <div class="m-text--size13 mb-2">Количество файлов</div>
                    <div class="m-text--size22 mb-2">
                        <span v-if="projects">{{projects.num_files}}</span>
                    </div>
                </v-col>
                <!-- <v-col cols="3" class="justify-center pt-0 px-0">
                    <div class="m-text--size13 mb-2">Дата завершения лицензии</div>
                    <div class="m-text--size22 mb-2">
                        <span v-if="projects">{{license.date}}</span>
                    </div>
                </v-col> -->
            </v-row>
        </v-card>


        <v-toolbar flat height="auto" class="m-table-toolbar">
            <v-text-field
                v-model="search"
                prepend-icon="search"
                placeholder="Поиск..."
                single-line
                hide-details
                class="m-table-toolbar--search ml-2"
                ></v-text-field>

            <v-spacer></v-spacer>
        </v-toolbar>

        <v-data-table
            :headers="headers"
            :items="projects.list"
            show-select
            v-model="selected"
            :search="search"
            disable-pagination
            hide-default-footer
            class="m-table-custom"
        >
            <template v-slot:no-data>
                {{noData}}
            </template>
            <template v-slot:item.data-table-select="{ item, isSelected, select }">
                <v-simple-checkbox
                    :value="isSelected"
                    @input="select($event)">
                </v-simple-checkbox>
            </template>

            <template v-slot:item.name="{ item }">
                <span>{{item.info.name}}
                </span>
            </template>

            <template v-slot:item.manager="{ item }">
                {{item.info.in_charge_name}}
            </template>

            <template v-slot:item.file_size="{ item }">
                {{item.info.file_size}}
            </template>

            <template v-slot:item.date="{ item }">
                {{getDate(item.info.created_at)}}
            </template>

            <template v-slot:item.number_of_files="{ item }">
                {{item.info.number_of_files}}
            </template>
        </v-data-table>

        <v-card
            class="m-table-custom--action"
            :style="cardActionStyle"
            v-show="selected.length"
            >
            <v-card-actions>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
export default {
    name: 'Statistics',
    data(){
        return {
            headers: [
                { text: 'НАЗАВАНИЕ проекта', value: 'name' },
                { text: 'Ответственный за проект', value: 'manager' },
                { text: 'Занятое место', value: 'file_size' },
                { text: 'Дата создания', value: 'date' },
                { text: 'Кол. Файлов', value: 'number_of_files' },
            ],
            search: '',
            selected: [],
            noData: 'Нет данных',
            project_size: 0,
            project_size_list: [],

            loading: true,
        }
    },
    watch: {
        '$store.state.administration.currentLicense'() {
            // console.log('got licence')
            this.currentLicense
        },
    },
    computed: {
        currentLicense(){
            let lic = this.$store.state.administration.currentLicense
            return {
                ...lic,
                space: this.bytesToSize(lic? lic.space : 0)
            }
        },
        projects(){
            let list = this.$store.state.workflow.projects
            list = list.map(p => {
                let item = this.project_size_list.find(f => f.id == p.id)
                if(item){
                    p.info.file_size = item.size
                }
                else{
                    p.info.file_size = 0
                }
                return p
            })
            return {
                list,
                num_files: list.reduce((a, v) => {
                    return a + parseInt(v.info.number_of_files)
                }, 0)
            }
        },
        cardActionStyle(){
            let width = 0
            let left = 0
            if(this.selected.length){
                let box = this.$refs['wrap'].getBoundingClientRect()
                width = box.width
                left = box.x
            }
            return {width: width + 'px', left: left + 'px'}
        },
        users(){
            return this.$store.state.administration.company.users.length
        },
        license(){
            let size = 0
            let date = ''
            let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
            this.$store.state.administration.licenseList
                .map(m => {
                    if(m.rte == 10){
                        size = m.data.idata / (1024 * 1024)
                    }
                    if(m.rte == 20
                        || m.rte == 21
                        || m.rte == 22
                        || m.rte == 23){
                            date = this.getDate(m.edate)
                    }
                })
            return {size, date}
        }
    },
    methods: {
        getDate(d){
            let options = {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
            return (new Date(parseInt(d) * 1000)).toLocaleDateString("ru-RU", options)
        },
        bytesToSize(bytes){
            const sizes = ['байт', 'Кб', 'Мб', 'Гб', 'Тб']
            if(bytes === 0){
                return 0 + ' ' + sizes[0]
            }

            let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
            if(i === 0){
                return bytes + ' ' + sizes[i]
            }

            let total = (bytes / Math.pow(1024, i)).toFixed(2)

            return total + sizes[i]
        },
    },
    created(){
        // запрос на лиценцию и количество пользователей
        this.$store.dispatch('administration/getLicense')
        .then(res => {
            this.loading = false
        })
        .catch(er => {
            console.log('got err in order', er)
            this.$notify({
                group: 'note',
                type: 'error',
                text: 'Не удалось получить данные о лицензии компании. Проверьте соединение.' ,
                message: 'Не удалось получить данные о лицензии компании. Проверьте соединение.' ,
            })
            this.loading = false
        })

        // вычисляет размер всех проектов компании
        let promiseList = this.$store.state.workflow.projects.map(p => {
            return this.$store.dispatch('workflow/getProjectSize', {id: p.id})
        })
        Promise.all(promiseList)
        .then(res => {
            let list = []
            res.map(p => {
                list.push({
                    id: p.prj,
                    size: this.bytesToSize(p.size)
                })
            })
            this.project_size_list = list
            let size = res.reduce((a, v) => {
                return a + parseInt(v.size)
            }, 0)
            this.project_size = this.bytesToSize(size)
        })
    }
}
</script>
