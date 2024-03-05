<template>
    <v-layout fluid fill-height>
        <v-row class="ma-0">
            <v-col cols="12" sm="12" md="12">
                <v-form ref="form_user">
                    <v-card outlined max-width="1200" class="m-card pa-3 pt-0">
                        <v-card-text class="m-text--2c">Информация о пользователе</v-card-text>
                        <v-divider></v-divider>
                        <v-row class="ma-0 mt-3">
                            <v-col cols="4" class="justify-center m-border--inner-right pr-0">
                                <v-card outlined width="150" height="150" class="m-card m-card--center m-card--avatar mb-3">
                                    <div class="m-card--avatar-wrap">
                                        <div
                                            v-show="avatar.type == 'file'"
                                            class="m-card--avatar-delete"
                                            @click="removeAvatar"
                                            >
                                            <v-icon
                                                size="55"
                                                color="#fff">mdi-trash-can-outline
                                            </v-icon>
                                        </div>
                                        <img
                                            class="m-card--avatar-wrap_img"
                                            :src="avatar.src"/>
                                    </div>
                                </v-card>
                                <div
                                    class="m-link m-link--text m-text--center"
                                    @click="upload">редактировать</div>
                            </v-col>
                            <v-col cols="8" class="pl-7">
                                <v-row>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field
                                            label="Имя"
                                            placeholder=" "
                                            v-model="user.first_name"
                                            hide-details
                                        >
                                            <template #label>Имя
                                                <span class="red--text"><strong>* </strong></span>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field
                                            label="Фамилия"
                                            placeholder=" "
                                            v-model="user.last_name"
                                            hide-details
                                        >
                                            <template #label>Фамилия
                                                <span class="red--text"><strong>* </strong></span>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field
                                            label="Отчество"
                                            placeholder=" "
                                            v-model="user.middle_name"
                                            hide-details
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field
                                            label="Адрес электронной почты"
                                            placeholder=" "
                                            v-model="user.email"
                                            class="m-input--no-events"
                                            disabled
                                            hide-details
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
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
                                    :filter="filter"
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
                                    v-model="user.city"
                                    hide-details
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                                <v-text-field
                                    label="Адрес"
                                    placeholder=" "
                                    v-model="user.address"
                                    hide-details
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                                <v-text-field
                                    label="Почтовый индекс"
                                    placeholder=" "
                                    v-model="user.post_code"
                                    hide-details
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row class="ma-0">
                            <v-col cols="12" sm="4" md="4">
                                <v-text-field
                                    label="Должность"
                                    placeholder=" "
                                    v-model="user.profession"
                                    hide-details
                                >
                                    <template #label>Профессия
                                        <span class="red--text"><strong>* </strong></span>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                                <v-select
                                    v-model="gender"
                                    :items="genderList"
                                    item-text="name"
                                    item-value="id"
                                    persistent-hint
                                    return-object
                                    label="Пол"
                                    placeholder=" "
                                    hide-details
                                    @change="getGender"
                                >
                                    <template #label>Пол
                                        <span class="red--text"><strong>* </strong></span>
                                    </template>
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
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
                                            label="Число/месяц/год рождения"
                                            readonly
                                            hide-details
                                            placeholder=" "
                                            v-on="on"
                                            required
                                            :rules="checkInput"
                                        >
                                            <template #label>Число/месяц/год рождения
                                                <span class="red--text"><strong>* </strong></span>
                                            </template>
                                        </v-text-field>
                                    </template>
                                    <v-date-picker
                                        ref="picker"
                                        v-model="date"
                                        :active-picker.sync="activePicker"
                                        :landscape="true"
                                        locale="ru"
                                        :max="new Date().toISOString().substr(0, 10)"
                                        min="1950-01-01"
                                        @change="save"
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                        </v-row>
                    <!--
                        <v-card-actions class="pt-5 px-3">
                                <v-btn
                                    outlined
                                    color="normal"
                                    @click="newpassword = true"
                                    class="m-btn">Сменить пароль</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    outlined
                                    color="primary"
                                    :disabled="!changeUser"
                                    @click="saveChange"
                                    class="m-btn">Сохранить</v-btn>
                        </v-card-actions>
                    -->
                    </v-card>
                </v-form>
            </v-col>

            <!-- <v-col cols="12" sm="12" md="12">
                <v-card outlined max-width="1200" class="m-card pa-3">
                    <v-card-text class="m-text--2c">Права пользователя</v-card-text>
                    <v-divider></v-divider>
                    <v-row class="ma-0">
                        <v-col cols="12" sm="4" md="4">
                            <v-select
                                v-model="group_permissions.turn"
                                :items="permissionList"
                                item-text="name"
                                item-value="id"
                                persistent-hint
                                return-object
                                label="Роль пользователя"
                                placeholder=" "
                                hide-details
                                required
                                :rules="checkSelect"
                            >
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            outlined
                            color="primary"
                            :disabled="!checkRole"
                            @click="saveRole"
                            class="m-btn">Сохранить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col> -->
        </v-row>

        <upload-files
            :uploadF.sync="uploadF"
            @setAvatar="setAvatar"
        />

        <new-password
            :newpassword.sync="newpassword"
        />

    </v-layout>
</template>

<script>
import UploadFiles from '../../common/UploadFiles'
import NewPassword from '../../account/NewPassword'
import { createAvatarChar } from '@/utils/services'

export default {
    name: 'Account',
    components: {
        UploadFiles,
        NewPassword
    },
    props: [
        'id',
        'role'
    ],
    beforeRouteEnter(to, from, next){
        next(to.params.role == '1' || to.params.role == '2')
    },
    data(){
        return {
            activePicker: null,
            avatar: {
                type: 'default',
                src: '',
            },
            selectCountry: null,
            selectRegion: {},
            genderList: [{id: 'male', name: 'мужской'}, {id: 'female', name: 'женский'}],
            gender: {},
            date: null,
            menu: false,
            checkInput: [v => !!v || 'Необходимое поле'],
            checkSelect: [v => !!v.name || 'Необходимое поле'],
            user: {
                birth_day: ''
            },
            group_permissions: {
                stand: {},
                turn: {}
            },
            permissionList: [],
            requiredList: ['first_name', 'last_name', 'profession', 'gender', 'birth_day'],
            uploadF: false,
            newpassword: false
        }
    },
    computed: {
        computedDateFormatted(){
            let date = this.formatDate(this.date)
            return date
        },
        countries(){
            return this.$store.state.common.countries
        },
        regions(){
            return this.$store.state.common.regions
        },
        changeUser(){
            let props = Object.keys(this.user)
            let user = this.$store.state.administration.company.users.find(u => u.id == this.id)
            let change = false

            props.map(i => {
                if(this.user[i] != user[i]){

                    change = true
                }
            })
            this.requiredList.map(i => {
                if(!this.user[i] || this.user[i] == ''){
                    change = false
                }
            })
            return change
        },
        checkRole(){
            let check = false
            if(this.group_permissions.stand.id){
                check = this.group_permissions.stand.id != this.group_permissions.turn.id
            }
            return check
        }
    },
    watch: {
        menu(val){
            val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
        }
    },
    methods: {
        save(date){
            this.$refs.menu.save(date)
        },
        formatDate(date){
            if (!date) return null

            const [year, month, day] = date.split('-')
            let delta = new Date().getTimezoneOffset()

            let bd = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), (Math.abs(delta) / 60))
            let mbd = bd.getTime(bd)

            this.user.birth_day = mbd
            return `${day}/${month}/${year}`
        },
        parseDate(date){
            if (!date) return null

            const [day, month, year] = date.split('/')
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        },
        getCountry(v){
            if(v === undefined || v === null){
                this.user.country_id = null
                this.user.country = ''
                this.getRegion(null)
                this.selectRegion = null
                this.$store.dispatch('common/getRegions', null)
            }
            else{
                this.user.country_id = v.id
                this.user.country = v.name
                this.$store.dispatch('common/getRegions', {id: v.id})
            }
        },
        getRegion(v){
            if(v){
                this.user.region_id = v.id
                this.user.region = v.name
            }
            else{
                this.user.region_id = null
                this.user.region = ''
            }
        },
        getGender(v){
            this.user.gender = v.id
        },
        init(c, r, g, a){
            this.selectCountry = {
                id: c.id,
                name: c.name
            }
            c.id && this.$store.dispatch('common/getRegions', {id: c.id})
            this.selectRegion = r.id ? {
                id: r.id,
                name: r.name
            } : null

            this.gender = {}
            this.genderList.map(i => {
                if(i.id == g.id){
                    this.gender = {
                        id: g.id,
                        name: i.name
                    }
                }
            })
            this.avatar.src = a.value
        },
        setAvatar(a){
            this.avatar.src = a.file
            this.avatar.type = 'file'
            this.user.avatar = a.id
        },
        removeAvatar(){
            let char = this.user.first_name.charAt(0)
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

            let avatar = canvas.toDataURL()

            canvas  = null

            this.avatar.src = avatar
            this.avatar.type = 'default'
            this.user.avatar = ''
        },
        updateUser(o){
            this.user[o.name] = o.value
        },
        filter(a, b, c){
            if(!c.toLowerCase().search(b.toLowerCase())){
                return true
            }
            else{
                return false
            }
        },
        upload(){
            this.uploadF = true
        },
        alert(res){
            this.$notify({
              group: 'note',
              text: res.text,
              message: res.text,
              type: res.status,
            })
        },
        saveChange(){
            this.$store.dispatch('administration/updateEmployee', this.user)
            .then(res => {
                this.alert(res)
                this.$store.dispatch('administration/getUser')
            })
        },
        saveRole(){
            let params = {
                body: {
                    id: this.id + ''
                },
                id: this.group_permissions.turn.id
            }
            this.$store.dispatch('administration/setUserPermissions', params)
        }
    },
    created(){
        if(!this.$store.state.common.countries.length){
            this.$store.dispatch('common/getCountries')
        }
        let user = this.$store.state.administration.company.users.find(u => u.id == this.id)
            || {}
        this.user = JSON.parse(JSON.stringify(user))

        this.init({
            id: this.user.country_id,
            name: this.user.country
        },{
            id: this.user.region_id,
            name: this.user.region
        },{
            id: this.user.gender
        },{
            id: this.user.avatar,
            value: this.user.avatarFull
                ? this.user.avatarFull
                : this.user.name
                    ? createAvatarChar(this.user.name, 150, 90)
                    : createAvatarChar(this.user.email, 150, 90)
        })

        if(user.birth_day){
            this.date = new Date(user.birth_day).toISOString().substr(0, 10)
        }
    }
}
</script>
