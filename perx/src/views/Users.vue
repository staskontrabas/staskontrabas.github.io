<template>
  <div class="elevation-1">
    <v-toolbar flat color="white">
      <v-toolbar-title>Пользователи</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
      ></v-text-field>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">Добавить</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.name" label="Имя"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.email" label="Email"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="close">Отмена</v-btn>
            <v-btn color="blue darken-1" flat @click.native="save">Сохранить</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="usersList"
      :search="search"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">{{ props.item.name }}</td>
        <td class="text-xs-left">{{ props.item.email }}</td>
        <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
          <v-icon
            small
            @click="deleteItem(props.item)"
          >
            delete
          </v-icon>
        </td>
      </template>
      <template slot="no-data">
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
    </v-data-table>
  </div>
</template>

<script>
import { http, api } from '@/utils/define'

  export default {
    data: () => ({
      dialog: false,
      search: '',
      selected: [],
      headers: [
        { text: 'Имя', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Действия', value: 'name', align: 'center', sortable: false }
      ],
      users: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        email: ''
      },
      defaultItem: {
        name: '',
        email: ''
      }
    }),
    computed: {
        formTitle () {
            return this.editedIndex === -1 ? 'Новый пользователь' : 'Редактирование'
        },
        usersList (){
            return this.users
        },
    },
    watch: {
      dialog (val) {
        val || this.close()
      }
    },
    created () {
      this.initialize()
    },
    methods: {
      initialize () {
          api.get(http.default, api.getUsers)
          .then(
              res => {
                  this.users = res
              }
          )
      },
      editItem (item) {
        this.editedIndex = this.users.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
      deleteItem (item) {
        confirm('Are you sure you want to delete this item?') &&
            api.post(http.default, api.delUser, item)
            .then(
                res => {
                    this.users = res
                }
            )
      },
      close () {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
      },
      save () {
        if (this.editedIndex > -1) {
            api.post(http.default, api.editUser, this.editedItem)
            .then(
                res => {
                    this.users = res
                }
            )
        } else {
          //this.users.push(this.editedItem)
          api.post(http.default, api.addUser, this.editedItem)
          .then(
              res => {
                  this.users = res
              }
          )
        }
        this.close()
      }
    }
  }
</script>
