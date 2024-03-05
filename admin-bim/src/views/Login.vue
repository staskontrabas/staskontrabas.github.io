<template>
<v-content>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="4"
      >
        <v-card class="elevation-12">
          <v-toolbar
            color="primary"
            dark
            flat
          >
            <v-toolbar-title align="center">Добрый день! XXX</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form">
              <v-text-field
                label="Адрес электронной почты"
                name="login"
                append-icon="person"
                type="text"
                v-model="email"
                icon
              ></v-text-field>

              <v-text-field
                id="password"
                label="Пароль"
                name="password"
                append-icon="lock"
                type="password"
                :rules="nameRules"
                v-model="pass"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              block
              color="primary"
              @click="validate"
            >
            Войти
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</v-content>
</template>

<script>
export default {
  name: 'Login',
  data: () => ({
    valid: false,
    pass: '',
    email: "root@unitbim.ru",
    nameRules: [
      v => !!v || 'Name is required',
      v => (v && v.length >= 6) || 'Pass must be more than 6 characters',
    ],
  }),
  methods: {
    validate () {
      if(this.$refs.form.validate()){
        this.valid = true
        if(this.valid){
          this.$store.dispatch('auth/login', {
            email: this.email,
            pass: this.pass
          })

          /*
          fetch('http://localhost:8080/api/v1/users/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: "root@unitbim.ru",
              password: "111111"
            })
          })
          .then(response => response.json())
          .then(json => console.log(json))
          */
        }
      }
      else{
        this.valid = false
      }
    },
  }
};
</script>
