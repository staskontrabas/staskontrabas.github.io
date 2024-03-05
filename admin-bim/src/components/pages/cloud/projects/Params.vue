<template>
    <v-layout fluid fill-height>
        <v-card outlined class="my-5 m-pa-20" min-width="700px" max-width="1200px" width="100%">
            <v-row>
                <v-col cols="3">
                    <v-card width="150" height="150" color="red">
                    </v-card>
                </v-col>
                <v-col cols="9">
                    <v-row>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field
                                label="Название проекта"
                                placeholder=" "
                                v-model="project.name"
                                @input="check"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field
                                label="Заказчик"
                                placeholder=" "
                                v-model="project.user"
                                @input="check"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field
                                label="Ответственный за проект"
                                placeholder=" "
                                v-model="project.name"
                                @input="check"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field
                                label="Номер проекта"
                                placeholder=" "
                                v-model="project.number"
                                @input="check"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6" md="6">
                    <v-autocomplete
                        v-model="project.country"
                        :items="countries"
                        item-text="name"
                        item-value="id"
                        label="Страна"
                        placeholder=" "
                        persistent-hint
                        @input="check"
                    ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                    <v-autocomplete
                        v-model="selectRegion"
                        :items="regions"
                        item-text="name"
                        item-value="id"
                        persistent-hint
                        return-object
                        label="Регион"
                        placeholder=" "
                    ></v-autocomplete>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="4" md="4">
                    <v-text-field
                        label="Город"
                        placeholder=" "
                        v-model="project.city"
                        @input="check"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4">
                    <v-text-field
                        label="Адрес"
                        placeholder=" "
                        v-model="project.address"
                        @input="check"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4">
                    <v-text-field
                        label="Почтовый индекс"
                        placeholder=" "
                        v-model="project.index"
                        @input="check"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6" md="6">
                    <v-text-field
                        label="Заказчик"
                        placeholder=" "
                        v-model="project.client"
                        @input="check"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                    <v-text-field
                        label="Тип здания"
                        placeholder=" "
                        value=""
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6" md="6">
                    <v-text-field
                        label="Главный архитектор"
                        placeholder=" "
                        value=""
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                    <v-text-field
                        label="Главный инженер"
                        placeholder=" "
                        value=""
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6" md="6">
                    <v-menu
                        ref="menu"
                        v-model="menu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                        >
                        <template v-slot:activator="{ on }">
                            <v-text-field
                                v-model="computedDateFormatted"
                                label="Дата утверждения проекта"
                                readonly
                                hide-details
                                placeholder=" "
                                v-on="on"
                                ></v-text-field>
                        </template>
                        <v-date-picker
                            ref="picker"
                            v-model="project.date"
                            :landscape="true"
                            locale="ru"
                            :max="new Date().toISOString().substr(0, 10)"
                            min="1950-01-01"
                            @change="save"
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                    <v-text-field
                        label="Описание"
                        placeholder=" "
                        value=""
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row v-if="project.hasOwnProperty('custom')">
                <v-col cols="12" sm="6" md="6"
                    v-for="(i, j) in project.custom"
                    :key="j"
                >
                    <v-text-field
                        v-if="i.type == 'string'"
                        placeholder=" "
                        :label="i.name"
                        v-model="i.value"
                        @input="check"
                    >
                        <template slot="append-outer">
                            <v-icon @click="editCustom(i)">edit</v-icon>
                        </template>
                    </v-text-field>
                    <v-autocomplete
                        v-if="i.type == 'list'"
                        v-model="i.params.value"
                        :items="i.params.list"
                        item-text="name"
                        item-value="value"
                        :label="i.name"
                        placeholder=" "
                        persistent-hint
                        @input="check"
                    >
                        <template slot="append-outer">
                            <v-icon @click="editCustom(i)">edit</v-icon>
                        </template></v-autocomplete>
                </v-col>
            </v-row>
            <v-card-actions>
                <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="dialogCustom = true">Добавить параметр</v-btn>
                <edit
                    :project="project"
                    @disabledSave="disabledSave = false"
                    :dialogCustom.sync="dialogCustom"
                    :paramsCustom.sync="paramsCustom"
                    :editCustomMode.sync="editCustomMode"
                    />
                <v-spacer></v-spacer>
                <v-btn outlined color="primary" :disabled="disabledSave" class="m-btn" @click="saveChange">Сохранить</v-btn>
            </v-card-actions>
        </v-card>
    </v-layout>
</template>

<script>
    import { mapState } from "vuex"
    import Edit from './params/Edit'

    export default {
        name: 'Params',
        components: {
            Edit
        },
        data () {
            return {
                disabledSave: true,
                project: null,
                selectCountry: null,
                selectRegion: null,
                selectCity: null,
                menu: false,
                dialogCustom: false,
                paramsCustom: {},
                editCustomMode: false
            }
        },
        watch: {
            menu (val) {
                val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
            },

        },
        computed: mapState({
            computedDateFormatted(){
                return this.formatDate(this.project.date)
            },
            countries: function(state){
                return state.common.countries
            },
            regions: function(state){
                let regions = state.common.countries.filter(item => item.id == this.project.country)[0]

                if(!state.common.countries.length){
                    regions = []
                }
                else{
                    regions = regions.regions
                }
                return regions
            }
        }),
        created(){
            this.project = Object.assign({}, this.$store.state.projects.active)

            let countries = this.$store.state.common.countries
            !countries.lenght && this.$store.dispatch('common/setCountries')
        },
        methods: {
            save(date){
                this.$refs.menu.save(date)
                this.disabledSave = false
            },
            check: function(){
                this.disabledSave = false
            },
            formatDate(date){
                if (!date) return null

                const [year, month, day] = date.split('-')
                return `${day}/${month}/${year}`
            },
            parseDate(date){
                if (!date) return null

                const [day, month, year] = date.split('/')
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            },
            saveChange(){
                this.$store.dispatch('projects/saveChange', {params: this.project})
                this.disabledSave = true
            },
            editCustom(item){
                this.editCustomMode = true
                this.dialogCustom = true
                this.paramsCustom = item
            }
        },
    }
</script>
