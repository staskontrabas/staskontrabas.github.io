<template>
    <div pt-0 class="page-container max1000">
        <div class="secondary-wrap">

        <div class="project-wrapper">
        <span class="project-title">
            Информация о пользователе {{ form_data.first_name }} {{ form_data.last_name }}
        </span>
        </div>

        <!-- замещение вкладки для совпадения по высоте -->
        <div class="tabs-blank"></div>

        <!-- обертка -->
        <div class="main-body issues--outer-wrap issues--inner-wrap">

            <el-form 
                class="form"
                ref="form"
                :model="form_data" 
                :rules="ValidationRules"
                label-position="top">

                <div class="top-main">
                    <div class="horz">
                        <div class="one-third first">
                            <div class="m-card m-card--center m-card--avatar mb-3" style="height: 150px; width: 150px;">
                                <div class="m-card--avatar-wrap">
                                    <div v-show="form_data.avatar.type == 'file'"
                                        class="m-card--avatar-delete"
                                        @click="removeAvatar">
                                        <v-icon size="55" color="#fff"> 
                                            mdi-trash-can-outline
                                        </v-icon>
                                    </div>
                                    <img
                                        class="m-card--avatar-wrap_img"
                                        :src="form_data.avatar.src"/>
                                </div> 
                            </div> 
                            <div class="m-link m-link--text m-text--center" @click="upload">
                                редактировать
                            </div>
                        </div>
                        <div class="one-third second">
                            <div>
                                <el-form-item label="Имя" prop="first_name">
                                    <el-input 
                                        v-model="form_data.first_name"
                                    ></el-input>
                                </el-form-item>
                            </div>
                            <div>
                                <el-form-item label="Отчество" prop="middle_name">
                                    <el-input 
                                        v-model="form_data.middle_name"
                                    ></el-input>
                                </el-form-item>
                            </div>
                        </div>
                        <div class="one-third third">
                            <div>
                                <el-form-item label="Фамилия" prop="last_name">
                                    <el-input 
                                        v-model="form_data.last_name"
                                    ></el-input>
                                </el-form-item>
                            </div>
                            <div>
                                <el-form-item label="Адрес электронной почты" prop="email">
                                    <el-input 
                                        v-model="form_data.email"
                                        class="m-input--no-events"
                                    ></el-input>
                                </el-form-item>
                            </div>
                        </div>
                    </div>

                    <div class="horz">
                        <div class="one-half">
                            <el-form-item label="Страна" prop="country">
                                <el-select 
                                    :placeholder="'Выберите страну'"
                                    filterable 
                                    no-match-text="" 
                                    no-data-text=""
                                    value-key="id"
                                    v-model="form_data.country"
                                    @change="changeCountry"
                                    popper-class="account-selector-one-half ub-issue-form-popper"
                                    @visible-change="setPoppersWidthToOneHalf">
                                    <el-option
                                        v-for="item in countries"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item">
                                        <template>
                                            <div class="issue-selector-observers option">
                                                <div class="problems-form-row-wrap">
                                                    <span> {{ item.name }} </span>
                                                </div>
                                            </div>
                                        </template>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>

                        <div class="one-half">
                            <el-form-item label="Регион" prop="region">
                                <el-select 
                                    :placeholder=" form_data.region ? form_data.region.name : 'Выберите регион'" 
                                    :disabled="!regions.length"
                                    filterable
                                    no-match-text="" 
                                    no-data-text=""
                                    value-key="id"
                                    v-model="form_data.region"
                                    popper-class="account-selector-one-half ub-issue-form-popper"
                                    @visible-change="setPoppersWidthToOneHalf">
                                    <el-option
                                        v-for="item in regions"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item">
                                        <template>
                                            <div class="issue-selector-observers option">
                                                <div class="problems-form-row-wrap">
                                                    <span> {{ item.name }} </span>
                                                </div>
                                            </div>
                                        </template>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                    </div>

                    <div class="horz">

                        <div class="one-third">
                            <el-form-item label="Город" prop="city">
                                <el-input 
                                    v-model="form_data.city"
                                ></el-input>
                            </el-form-item>
                        </div>

                        <div class="one-third">
                            <el-form-item label="Адрес" prop="address">
                                <el-input 
                                    v-model="form_data.address"
                                ></el-input>
                            </el-form-item>
                        </div>

                        <div class="one-third">
                            <el-form-item label="Почтовый индекс" prop="post_code">
                                <el-input 
                                    v-model="form_data.post_code"
                                ></el-input>
                            </el-form-item>
                        </div>
                    </div>

                    <div class="horz">

                        <div class="one-third">
                            <el-form-item label="Профессия" prop="profession">
                                <el-input 
                                    v-model="form_data.profession"
                                ></el-input>
                            </el-form-item>
                        </div>

                        <div class="one-third">
                            <el-form-item label="Выберите пол" prop="gender">
                                <el-select 
                                    v-model="form_data.gender"
                                    value-key="id"
                                    :placeholder="form_data.gender !== null ? '' : 'Выберите пол'"
                                    popper-class="ub-issue-form-popper"
                                    @visible-change="setPoppersWidthToOneThird">

                                    <!-- options -->
                                    <el-option
                                        v-for="item in genderList"
                                        :label="item.name"
                                        :key="item.id"
                                        :value="item">
                                        <template>
                                            <div class="ub-issue-form-popper option">
                                                <span> {{ item.name }} </span>
                                            </div>
                                        </template>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>

                        <div class="one-third">
                            <el-form-item label="Число/месяц/год рождения" prop="birth_day">
                                <el-date-picker
                                    ref="picker"
                                    v-model="form_data.birth_day"
                                    type="date"
                                    format="dd/MM/yyyy"
                                    value-format="timestamp"
                                    placeholder="Выберите дату">
                                </el-date-picker>
                            </el-form-item>
                        </div>
                    </div>

                    <div class="horz">
                        <div class="one-half">
                            <el-form-item label="Получать уведомления об изменении статуса проектов, к которым вы имеете доступ?" prop="subed">
                                <el-checkbox v-model="form_data.subed">
                                    {{ form_data.subed ? 'Уведомления включены' : 'Уведомления отключены' }}
                                </el-checkbox>
                            </el-form-item>
                        </div>
                    </div>
                </div>

                <div class="account-button-wrap">
                    <el-button type="outlined"
                        @click="newpassword = true">
                        Сменить пароль
                    </el-button>
                    <el-button type="main"
                        :disabled="!hasChanges"
                        @click="saveChange">
                        Сохранить
                    </el-button>
                </div>
            </el-form>

            <upload-files
                :uploadF.sync="uploadF"
                @setAvatar="setAvatar"
            />

            <new-password
                :newpassword.sync="newpassword"
            />

        </div>
        </div>

    </div>
</template>

<script>
import UploadFiles from './common/UploadFiles'
import NewPassword from './account/NewPassword'

export default {
    name: 'Account',
    components: {
        UploadFiles,
        NewPassword
    },
    data(){
        return {

            form_data: {
                avatar: {
                    type: 'default',
                    src: '',
                },
                first_name: null,
                middle_name: null,
                last_name: null,
                gender: {id: 'male', name: 'Мужской'},
                birth_day: null,
                country: null,
                region: null,
                city: null,
                post_code: null,
                email: null,
                profession: null,
                address: null,
                subed: null, // subbed to notifications
            },

            genderList: [
                {id: 'male', name: 'Мужской'}, 
                {id: 'female', name: 'Женский'}
            ],

            original_user: null,

            uploadF: false,
            newpassword: false,
            menu: false,

            unsaved_changes: false,
        }
    },
    watch: {
        menu(val) {
            val && setTimeout(() => (this.activePicker = 'YEAR'))
        },
        'regions'(newval) {
            this.form_data.region = newval.length ? newval[0] : null
        }
    },
    methods: {
        changeCountry(v){
            console.log('changing country', v)
            this.$store.dispatch('common/getRegions', {id: v.id})
        },
        setAvatar(a){
            let target = this.form_data
            target.avatar.src = a.file
            target.avatar.type = 'file'
        },
        removeAvatar(){
            let source = this.form_data

            let char = source.first_name.charAt(0)
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

            source.avatar.src = avatar
            source.avatar.type = 'default'
        },
        upload() {
            this.uploadF = true
        },
        saveChange(){
            // TODO: переписать процедуру сохранения новых данных юзера
            let user = JSON.parse(JSON.stringify(this.formedUser))

            this.$store.dispatch('administration/updateUser', user)
            .then(res => {
                // console.log('res', res)
                this.$notify({
                    group: 'note',
                    type: res.status,
                    text: res.text,
                    message: res.text,
                })
                this.$store.dispatch('administration/getUser')
                .then(res => {
                    this.setData()
                })
            })
        },
        setUserDataToForm(user) {
            let target = this.form_data

            target.first_name = user.first_name
            target.last_name = user.last_name
            target.middle_name = user.middle_name || ''

            target.email = user.email
            target.birth_day = user.birth_day
            target.profession = user.profession

            target.city = user.city
            target.address = user.address
            target.post_code = user.post_code

            target.country = {
                id: user.country_id,
                name: user.country
            }

            target.region = {
                id: user.region_id,
                name: user.region
            }
            target.gender = {
                id: user.gender,
                name: this.genderList.find(obj => obj.id == user.gender).name
            }

            target.avatar = this.$store.state.administration.userAvatar

            target.subed = user.subed

            // console.log('formed user data', target)
            return null
        },
        setPoppersWidthToOneThird() {
            
            const ref = document.getElementsByClassName('one-third')[0]
            const real_width = ref ? ref.offsetWidth : null

            if (!real_width) {
                return null
            }
            let targets = document.querySelectorAll('.ub-issue-form-popper:not(.display)')
            for (let elem of targets) {
                elem.style['min-width'] = real_width - 32 + 'px' // 32px = 2*16px - padding on the element
            }
        },
        setPoppersWidthToOneHalf() {
            
            const ref = document.getElementsByClassName('one-half')[0]
            const real_width = ref ? ref.offsetWidth : null

            if (!real_width) {
                return null
            }
            let targets = document.querySelectorAll('.ub-issue-form-popper:not(.display)')
            for (let elem of targets) {
                elem.style['min-width'] = real_width - 32 + 'px' // 32px = 2*16px - padding on the element
            }
        },
        setData() {
            let user = JSON.parse(JSON.stringify(this.$store.state.administration.user))
            this.original_user = user
            this.setUserDataToForm(user)
        },
    },
    computed: {
        countries(){
            return this.$store.state.common.countries
        },
        regions(){
            return this.$store.state.common.regions
        },
        userRole() {
            let uRole = ''
            let user = this.$store.state.administration.user
            let perms = this.$store.state.administration.groupPermissions
            perms.map(role => {
                let users = role.users ? role.users : []

                if(users.some(u => u.id == user.id)){
                    uRole = role.name
                }
            })
            return uRole
        },
        formedUser() {
            const erzatz = this.$store.state.administration.user
            const source = this.form_data
            let user = {...erzatz}

            user.first_name = source.first_name
            user.middle_name = source.middle_name
            user.last_name = source.last_name

            user.country_id = source.country ? source.country.id : ''
            user.country = source.country ? source.country.name : ''

            user.region_id = source.region ? source.region.id : ''
            user.region = source.region ? source.region.name : ''

            user.city = source.city
            user.address = source.address
            user.post_code = source.post_code

            user.profession = source.profession
            user.gender = source.gender.id
            user.birth_day = source.birth_day

            user.subed = source.subed

            return user
        },
        hasChanges() {
            const original_user = this.original_user
            const new_user = this.formedUser

            for (const key of Object.keys(new_user)) {
                if (original_user[key] !== new_user[key]) {
                    return true
                }
            }
            return false
        },
        ValidationRules() {
            return {
                first_name: [{ required: true, message: 'Введите имя пользователя!', trigger: 'blur', }],
                last_name: [{ required: true, message: 'Введите фамилию пользователя!', trigger: 'blur', }],
                birth_day: [{ required: true, message: 'Необходимо указать дату рождения пользователя.', trigger: 'blur', }],
            } 
        }
    },
    created() {
        if(!this.$store.state.common.countries.length){
            this.$store.dispatch('common/getCountries')
        }

        this.setData()
    },
    updated() {
        console.log('user permissions',this.$store.state.administration.user)
    },
}
</script>

<style lang="scss" scoped>

.top-main {
    display: flex;
    flex-direction: column;
}

.horz {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    max-width: 1200px;
    min-width: 660px;
    min-height: fit-content;

    // border: 1px solid gray;
    
    & .one-third {
        flex-basis: 100%;
        padding: 16px;

        & .first {
            min-height: 215px;
        }

        & .second {
            display: flex;
            flex-direction: column;
        }
    }

    & .one-half {
        flex-basis: 100%;
        padding: 16px;
        // border: 1px solid red;
    }
}

.account-button-wrap {
    max-width: 1200px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    padding: 8px 12px;
}

</style>