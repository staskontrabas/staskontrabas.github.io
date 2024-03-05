<template>
    <v-layout fluid fill-height>
        <v-row class="ma-0">
            <v-col cols="12" sm="12" md="12">
                <v-form
                    v-if="!sended"
                    ref="form_user"
                    >
                    <v-card outlined max-width="1200" class="m-card pa-3 pt-0">
                        <v-card-text class="m-text--2c">Информация о пользователе</v-card-text>
                        <v-divider></v-divider>
                        <v-row class="ma-0">
                            <v-col cols="12" sm="6" md="6">
                                <v-text-field
                                    label="Электронная почта"
                                    placeholder=" "
                                    v-model="email"
                                    required
                                    :rules="emailRules"
                                >
                                    <template #label>Электронная почта
                                        <span class="red--text"><strong>* </strong></span>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                            </v-col>
                        </v-row>
                        <v-row class="ma-0">
                            <v-col cols="12" sm="6" md="6">
                                <vue-recaptcha
                                    :sitekey="siteKey"
                                    :loadRecaptchaScript="true"
                                    @verify="captchaVerify"
                                    @expired="captchaExpired"
                                    @error="captchaError"
                                    ></vue-recaptcha>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                            </v-col>
                        </v-row>
                        <v-card-actions><v-spacer></v-spacer>
                            <v-btn
                                outlined
                                color="primary"
                                :disabled="!checkReady"
                                @click="invite"
                                class="m-btn">Пригласить</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-form>

                <div
                    v-else
                    >
                    Приглашение отправлено на почту {{email}}.
                </div>
            </v-col>
        </v-row>
    </v-layout>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha'

export default {
    name: 'EmployeesInvite',
    components: {
        VueRecaptcha
    },
    data(){
        return {
            email: '',
            emailRules: [
                v => !!v || 'Необходимое поле',
                v => (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)) || 'Неверный email'
            ],
            checkSelect: [v => !!v.name || 'Необходимое поле'],
            siteKey: '6Lfm0uMUAAAAAHUoxb0b6Ao81lmjLazVTcr7kKaW',
            recaptcha: false,
            sended: false
        }
    },
    computed: {
        checkReady(){
            let ready = this.recaptcha && this.email
            return ready
        }
    },
    methods: {
        invite(){
            this.$store.dispatch('administration/inviteUser', {
                email: this.email,
                code: this.recaptcha
            })
            .then(res => {
                this.sended = true
            })
        },
        captchaVerify(v){
            this.recaptcha = v
        },
        captchaError(v){
            console.log('error', v)
            this.recaptcha = false
        },
        captchaExpired(v){
            console.log('expired', v)
            this.recaptcha = false
        },
    },
    mounted(){
        let query = this.$route.query
        let email = Object.prototype.hasOwnProperty.call(query, 'email')

        if(email){
            this.email = query.email
        }
    }
}
</script>
