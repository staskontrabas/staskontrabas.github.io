<template>
    <v-layout fluid fill-height>
        <v-row class="ma-0">
            <v-col cols="12" sm="12" md="12">
                <v-card outlined max-width="1200" class="m-card pa-3 pt-0">
                    <v-card-text class="m-text--2c">Информация о компании</v-card-text>
                    <v-divider></v-divider>
                    <v-row class="ma-0 mt-3">
                        <v-col cols="4" class="justify-center m-border--inner-right pr-0">
                            <v-card outlined width="150" height="150" class="m-card m-card--center m-card--avatar mb-3">
                                <div class="m-card--avatar-wrap">
                                    <div
                                        v-show="logo.type == 'file'"
                                        class="m-card--avatar-delete"
                                        @click="removeLogo"
                                        >
                                        <v-icon
                                            size="55"
                                            color="#fff">mdi-trash-can-outline
                                        </v-icon>
                                    </div>
                                    <img
                                        class="m-card--avatar-wrap_img"
                                        :src="logo.src"/>
                                </div>
                            </v-card>
                            <div
                                class="m-link m-link--text m-text--center"
                                @click="upload">редактировать</div>
                        </v-col>
                        <v-col cols="8">
                            <v-row>
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field
                                        label="Название компании"
                                        placeholder=" "
                                        v-model="company.name"
                                        hide-details
                                        required
                                        :rules="checkInput"
                                    >
                                        <template #label>Название компании
                                            <span class="red--text"><strong>* </strong></span>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <v-text-field
                                        label="Юридическое лицо"
                                        placeholder=" "
                                        v-model="company.official_name"
                                        hide-details
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row class="ma-0">
                        <v-col cols="12" sm="4" md="4">
                            <v-text-field
                                label="ИНН"
                                placeholder=" "
                                v-model="company.inn"
                                required
                                :rules="innRules"
                                hide-details
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4" md="4">
                            <v-text-field
                                label="КПП"
                                placeholder=" "
                                v-model="company.kpp"
                                required
                                :rules="kppRules"
                                hide-details
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4" md="4">
                            <v-text-field
                                label="ОГРН"
                                placeholder=" "
                                v-model="company.ogrn"
                                required
                                :rules="ogrnRules"
                                hide-details
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row class="ma-0">
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete
                                v-model="selectCountry"
                                :items="countries"
                                item-text="name"
                                item-value="id"
                                persistent-hint
                                return-object
                                label="Страна"
                                placeholder=" "
                                hide-details
                                clearable
                                @click:clear="$nextTick(() => selectCountry = null)"
                                @change="getCountry"
                            ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-autocomplete
                                :disabled="!regions.length"
                                v-model="selectRegion"
                                :items="regions"
                                item-text="name"
                                item-value="id"
                                persistent-hint
                                return-object
                                label="Регион"
                                placeholder=" "
                                hide-details
                                @change="getRegion"
                            ></v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row class="ma-0">
                        <v-col cols="12" sm="4" md="4">
                            <v-text-field
                                label="Город"
                                placeholder=" "
                                v-model="company.city"
                                hide-details
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4" md="4">
                            <v-text-field
                                label="Адрес"
                                placeholder=" "
                                v-model="company.address"
                                hide-details
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4" md="4">
                            <v-text-field
                                label="Почтовый индекс"
                                placeholder=" "
                                v-model="company.post_code"
                                hide-details
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-card-actions><v-spacer></v-spacer>
                            <v-btn
                                outlined
                                color="primary"
                                class="m-btn"
                                :disabled="!changeUser"
                                @click="saveChange"
                                >Сохранить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

    <upload-files
        :uploadF.sync="uploadF"
        @setAvatar="setLogo"
    />

    </v-layout>
</template>

<script>
import UploadFiles from './../common/UploadFiles'

export default {
    name: 'Company',
    components: {
        UploadFiles
    },
    data(){
        return {
            logo: {
                type: 'default',
                src: '',
            },
            selectCountry: null,
            selectRegion: {},
            date: null,
            menu: false,
            checkInput: [v => !!v || 'Необходимое поле'],
            checkSelect: [v => !!v.name || 'Необходимое поле'],
            innRules: [
                v => (v && v.length == 10) || 'ИНН должен состоять из 10 символов',
            ],
            kppRules: [
                v => (v && v.length == 9) || 'КПП должен состоять из 9 символов',
            ],
            ogrnRules: [
                v => (v && (v.length == 13 || v && v.length == 15))
                        || 'ОГРН должен состоять из 13 или 15 символов',
            ],
            company: {
                name: ''
            },
            requiredList: ['name'],
            uploadF: false
        }
    },
    computed: {
        countries(){
            return this.$store.state.common.countries
        },
        regions(){
            return this.$store.state.common.regions
        },
        changeUser(){
            let props = Object.keys(this.company)
            let company = this.$store.state.administration.company
            let change = false
            props.map(i => {
                if(this.company[i] != company[i]){
                    change = true
                }
            })
            this.requiredList.map(i => {
                if(!this.company[i] || this.company[i] == ''){
                    change = false
                }
            })
            return change
        }
    },
    methods: {
        upload(){
            this.uploadF = true
        },
        setLogo(a){
            this.logo.src = a.file
            this.logo.type = 'file'
            this.company.logo = a.id
        },
        removeLogo(){
            let char = this.company.name.charAt(0)
            char = char ? char.toUpperCase() : "U"
            let canvas = document.createElement('canvas')
            let size = 150
            let fontSize = 90

            canvas.width = size
            canvas.height = size

            let ctx = canvas.getContext('2d')
            ctx.beginPath()
            ctx.fillStyle = "#e55d4a"
            ctx.fillRect(0, 0, size, size)
            ctx.fillStyle = "#ffffff"
            ctx.font = "bold " + (fontSize) + "px Arial"
            ctx.textAlign = 'center'
            ctx.fillText(char, size / 2, (size / 2) + ((fontSize * 0.70) / 2))

            let logo = canvas.toDataURL()

            canvas  = null

            this.logo.src = logo
            this.logo.type = 'default'
            this.company.logo = ''
        },
        getCountry(v){
            if(v === undefined || v === null){
                this.company.country_id = null
                this.company.country = ''
                this.getRegion(null)
                this.selectRegion = null
                this.$store.dispatch('common/getRegions', null)
            }
            else{
                this.company.country_id = v.id
                this.company.country = v.name
                this.$store.dispatch('common/getRegions', {id: v.id})
            }
        },
        getRegion(v){
            if(v){
                this.company.region_id = v.id
                this.company.region = v.name
            }
            else{
                this.company.region_id = null
                this.company.region = ''
            }
        },
        updateCompany(o){
            this.company[o.name] = o.value
        },
        init(c, r, a){
            this.selectCountry = {
                id: c.id,
                name: c.name
            }
            c.id && this.$store.dispatch('common/getRegions', {id: c.id})
            this.selectRegion = r.id ? {
                id: r.id,
                name: r.name
            } : null

            this.logo = a.value
        },
        filter(a, b, c){
            if(!c.toLowerCase().search(b.toLowerCase())){
                return true
            }
            else{
                return false
            }
        },
        alert(res){
            this.$notify({
              group: 'note',
              text: res.text,
              message: res.text,
              type: res.status
            })
        },
        saveChange(){
            this.$store.dispatch('administration/updateCompany', this.company)
            .then(res => {
                this.$notify({
                    group: 'note',
                    text: 'Данные успешно обновлены.',
                    message: 'Данные успешно обновлены.',
                    type: 'success'
                })
            })
            .catch(err => {
                console.log('got error updating company', err)
                this.$notify({
                    group: 'note',
                    text: 'Не удалось обновить данные.',
                    message: 'Не удалось обновить данные.',
                    type: 'error'
                })
            })
        }
    },
    created(){
        if(!this.$store.state.common.countries.length){
            this.$store.dispatch('common/getCountries')
        }
        let cmpny = this.$store.state.administration.company
        cmpny = JSON.parse(JSON.stringify(cmpny))
        this.company = {...this.company, ...cmpny}
        this.init({
            id: this.company.country_id,
            name: this.company.country
        },{
            id: this.company.region_id,
            name: this.company.region
        },{
            id: this.company.avatar,
            value: this.$store.state.administration.companyLogo
        })
    }
}
</script>
