<template>
    <v-dialog :value="newpassword" scrollable max-width="630px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-5">Сменить пароль
                <v-spacer></v-spacer>
                <v-btn
                    text
                    icon
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text style="background-color: #fbfbfb; color: #333333;" class="pt-5">
                <v-form ref="form">
                    <v-row>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field
                                label="Старый пароль"
                                placeholder=" "
                                type="password"
                                v-model="old_password"
                                required
                                :rules="passRules"
                            >
                                <template #label>Старый пароль
                                    <span class="red--text"><strong>* </strong></span>
                                </template>
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field
                                label="Новый пароль"
                                placeholder=" "
                                type="password"
                                v-model="new_password"
                                required
                                :rules="passRules2"
                            >
                                <template #label>Новый пароль
                                    <span class="red--text"><strong>* </strong></span>
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field
                                label="Повторите пароль"
                                placeholder=" "
                                type="password"
                                v-model="repeate_password"
                                required
                                :rules="passRules3"
                            >
                                <template #label>Повторите пароль
                                    <span class="red--text"><strong>* </strong></span>
                                </template>
                            </v-text-field>
                        </v-col>
                    </v-row>

                </v-form>
            </v-card-text>

            <v-card-actions class="pa-5">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="primary"
                    class="m-btn"
                    @click="validate">Сменить пароль</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ['newpassword'],
    name: 'NewPassword',
    data(){
        return {
            siteKey: '6Lfm0uMUAAAAAHUoxb0b6Ao81lmjLazVTcr7kKaW',
            old_password: '',
            new_password: '',
            repeate_password: '',
            passRules: [
                v => !!v || 'Введите пароль',
                v => (v && v.length >= 6) || 'Пароль должен состоять из 6 символов или больше',
            ],
            passRules2: [
                v => !!v || 'Введите новый пароль',
                v => (v && v.length >= 6) || 'Пароль должен состоять из 6 символов или больше',
                v => (v != this.old_password) || 'Новый пароль должен отличаться от старого'
            ],
            passRules3: [
                v => !!v || 'Повторите пароль',
                v => (v && v.length >= 6) || 'Пароль должен состоять из 6 символов или больше',
                v => (v == this.new_password) || 'Неверно введен пароль'
            ]
        }
    },
    watch: {
        newpassword(v){
            if(v){
                document.addEventListener('keyup', this.enter, false)
            }
            else{
                document.removeEventListener('keyup', this.enter, false)
            }
        }
    },
    methods: {
        cancel(){
            this.old_password = ''
            this.new_password = ''
            this.$emit('update:newpassword', false)
        },
        newPassword(pass){
            this.$store.dispatch('administration/newpass', {
                old_password: pass.old_password,
                new_password: pass.new_password
            })
            .then(res => {
                this.alert(res)
                if(res.status == 'success'){
                    this.cancel()
                }
            })
        },
        alert(res){
            this.$notify({
              group: 'note',
              text: res.text,
              message: res.text,
              type: res.status
            })
        },
        validate(){
            if(this.$refs.form.validate()){
                this.newPassword({
                    old_password: this.old_password,
                    new_password: this.new_password
                })
            }
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.validate()
            }
        }
    }
}
</script>
