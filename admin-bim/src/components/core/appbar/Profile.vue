<template>
    <v-menu
        bottom
        left
        offset-y
        transition="slide-y-transition"
        v-model="isOpenDropdown"
        >
        <template v-slot:activator="{ attrs, on }">
            <el-button
                type="profile"
                class="profile-button"
                v-bind="attrs"
                v-on="on"
                icon
            >
              <v-img
                  class="avatar"
                  :src="avatar.avatar"
              ></v-img>
                <span class="profile-tittle">{{user.email}}</span>
              <inline-svg :class="{'arrow-rotate': isOpenDropdown}" :src="require(`@/assets/icons/triangle.svg`)"></inline-svg>
            </el-button>
        </template>
        <v-card>
            <v-list-item class="grow">
                <v-list-item-avatar size="30">
                    <v-img
                        class="m-card--avatar-wrap_img"
                        :src="avatar.avatar"
                    ></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title class="m-text--size14 py-1">
                        {{user.first_name + ' ' + user.last_name}}
                    </v-list-item-title>
                    <v-list-item-subtitle class="m-text--size12">
                        {{user.email}}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>

            <v-list dense>
                <v-list-item
                    v-for="(note, i) in createMenu()"
                    :key="i"
                    @click.prevent="onClick(note.link)"
                    >
                    <v-list-item-title v-text="note.title" />
                </v-list-item>
            </v-list>
        </v-card>
    </v-menu>
</template>

<script>
import InlineSvg from "vue-inline-svg";

    export default {
        components: {
          InlineSvg,
        },
        data: () => ({
            notes: [{
                    title: 'Профиль',
                    link: '/administration/account',
                    access: []
                },
                {
                    title: 'Настройки',
                    link: '/administration/settings',
                    access: ['1', '2']
                },
                {
                    title: 'Выход',
                    link: 'logout',
                    access: []
                }
            ],
            isOpenDropdown: false,
        }),
        computed: {
            avatar(){
                return this.$store.state.administration.userAvatar
            },
            user(){
                return this.$store.state.administration.user
            },
        },
        methods: {
            createMenu(){
                let list = this.notes.filter(n => !n.access.length
                    || n.access.some(s => s == this.user.role))
                return list
            },
            onClick(link){
                if(link == 'logout'){
                    this.$store.dispatch('auth/logout')
                }
                else if(this.$route.path == link){
                    return
                }
                else{
                    this.$router.push(link)
                }
            },
        }
    }
</script>

<style lang="scss">
.profile-button {
  display: flex;
  width: fit-content !important;
  border-radius: 5px !important;
  padding: 0px 8px;
  background-color: transparent !important;
  &:hover {
    background-color: transparent !important;
  }
}

.arrow-rotate {
  transform: rotate(180deg);
}

.profile-tittle{
  margin-left: 10px;
  font-family: "Artifakt Element", sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  text-transform: lowercase;
}

.avatar {
  display: flex;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  margin-right: 0px;
}
</style>