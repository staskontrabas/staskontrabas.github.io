<template>
    <v-container fluid px-3 pb-10 pt-0 class="m-container">

        <v-toolbar flat height="auto" >
            <v-text-field
                v-model="search"
                prepend-icon="search"
                placeholder="Поиск..."
                single-line
                hide-details
                class="m-table-toolbar--search ml-4"
                ></v-text-field>

            <v-spacer></v-spacer>
            <!-- :disabled="checkIfCanInvite()" -->
            <el-tooltip effect="dark" 
                :disabled="false"
                 placement="bottom">
                <template #content>
                    К сожалению, ваша компания уже имеет максимально доступное число пользователей, и вы не можете пригласить больше.
                </template>
                    <div style="display: block;">
                        <v-btn
                        text
                        @click.stop="addUser"
                        :disabled="checkIfCanInvite()"
                        class="ma-0 m-btn--text_icon">
                            <v-icon
                                size="18"
                                left>mdi-account-plus</v-icon> Пригласить пользователя
                        </v-btn>
                    </div>
            </el-tooltip>
            
        </v-toolbar>

        <v-data-table
            :headers="headers"
            :items="employees"
            :show-select="true"
            v-model="selected"
            @toggle-select-all="selectRow"
            :search="search"
            disable-pagination
            hide-default-footer
            class="m-table-custom"
        >
            <template v-slot:no-data>
                {{ noData }}
            </template>

            <template v-slot:item.data-table-select="{ item, isSelected, select }">
                <v-simple-checkbox
                    v-if="item.id != getUser.id"
                    :value="isSelected"
                    @input="select($event)">
                </v-simple-checkbox>
            </template>

            <template v-slot:item.src="{ item }">
                <v-avatar
                    size="30"
                    >
                    <img
                        class="m-card--avatar-wrap_img"
                        :src="getAvatar(item)"
                        alt="avatar"
                    >
                </v-avatar>
            </template>
            <template v-slot:item.action="{ item }">
                <action-menu
                    @editUser="editUser"
                    @reconfirm="reconfirm"
                    @removeUser="removeUser"
                    :item="item"
                />
            </template>
            <template v-slot:item.status="{ item }">
                <span
                    :class="!item.status ? 'red--text' : 'green--text'">
                    {{getStatus(item.status)}}
                </span>
            </template>
        </v-data-table>

    </v-container>
</template>

<script>
import ActionMenu from "./ActionMenu"
import { createAvatarChar } from '@/utils/services'

export default {
    name: 'EmployeesList',
    components: {
        ActionMenu,
    },
    data(){
        return {
            selected: [],
            headers: [
                {
                    text: '',
                    align: 'center',
                    sortable: false,
                    value: 'src',
                },
                { text: 'ЕМАЙЛ', value: 'email' },
                { text: 'ФИО', value: 'name' },
                /*
                { text: 'ПОСЛЕДНЯЯ АКТИВНОСТЬ', value: 'last_activity' },
                { text: 'ОТДЕЛ', value: 'department' },
                */
                { text: 'ДОЛЖНОСТЬ', value: 'position' },
                { text: 'СТАТУС', value: 'status' },
                { text: '', value: 'action', sortable: false },
            ],
            search: '',
            noData: 'Нет данных',
        }
    },
    computed: {
        currentLicense(){
            return this.$store.state.administration.currentLicense
        },
        employees: function(){
            let state = this.$store.state.administration
            let list = state.invited
            list = list ? list : []
            let users = state.company.users || []

            users = users.map(u => {
                return {...u,
                    src: u.avatarSrc,
                    name: u.first_name + ' ' + u.last_name,
                    status: u.status,
                    position: Object.prototype.hasOwnProperty.call(u, 'profession')
                        ? u.profession
                        : ''
                }
            })

            list = list.filter(l => !l.status).map((l, j) => {
                return {...l,
                    id: 'id-' + j,
                    src: l.email.slice(0, 1),
                    position: ''
                }
            })

            // let owner = users.filter(u => list.every(l => l.email != u.email))
            //
            // owner = owner.length ? [{...owner[0],
            //     email: owner[0].email,
            //     src: owner[0].avatar,
            //     name: owner[0].first_name + ' ' + owner[0].last_name,
            //     status: owner[0].status,
            //     position: Object.prototype.hasOwnProperty.call(owner[0], 'profession')
            //         ? owner[0].profession
            //         : ''
            // }] : []

            list = [...users, ...list]
            return list
        },
        avatar(){
            return this.$store.state.administration.userAvatar
        },
        getUser(){
            return this.$store.state.administration.user
        },
        cardActionStyle(){
            if(this.selected.length){
                this.widthEl = this.$el.clientWidth
            }
            return {width: this.widthEl + 'px'}
        }
    },
    methods: {
        checkIfCanInvite() {
            const emp = this.employees
            const lic = this.currentLicense
            if (!emp) {
                return false
            }
            if (!lic) {
                return false
            }
            if (!emp.length) {
                return false
            }
            if (!lic.users) {
                return false
            }
            // console.log('lic usr', lic.users, emp.length)
            return lic.users <= emp.length
        },
        selectRow(e){
            let list = e.items
            if(this.selected.length != list.length){
                this.selected = list
            }
            else{
                this.selected = []
            }
        },
        getStatus(v){
            let status = ''
            switch(v){
                case 0: status = 'Создан'
                        break
                case 1:
                case 200: status = 'Активен'
                        break
                default: status = 'Создан'
            }
            return status
        },
        getAvatar(i){
            if(!i.src || i.src.length == 1){
                let name = i.name ? i.name : i.email
                return createAvatarChar(name)
            }
            else{
                return i.src
            }
        },
        addUser(){
            this.$router.push({name: 'employees_invite'})
        },
        editUser(i){
            // TODO: role: '1' - затычка, дающая всем права админа.
            this.$router.push({name: 'employee_account', params: {id: i.id, role: '1'}})
            .catch(failure => {
                console.log('failure')
            })
        },
        reconfirm(i){
            this.$router.push({name: 'employees_invite',  query: {email: i.email}})
        },
        removeUser(users = []){
            let user = users[0]
            if(user.status){
                this.$store.dispatch('administration/invitedRemove', user.id)
                .then(res => {
                    console.log('res', res)
                })
                .catch(er => {
                    console.log('res', er)
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось удалить пользователя. Причина: ' + er.data.error,
                        message: 'Не удалось удалить пользователя. Причина: ' + er.data.error,
                    })
                })
                .finally(() => {
                    this.selected = []
                    this.$store.dispatch('administration/invitedList')
                    this.$store.dispatch('administration/getCompany')
                })
            }
            else{
                this.$store.dispatch('administration/noregistredRemove', user.email)
                .catch(er => {
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Не удалось удалить пользователя. Причина: ' + er.data.error,
                        message: 'Не удалось удалить пользователя. Причина: ' + er.data.error,
                    })
                })
                .finally(() => {
                    this.selected = []
                    this.$store.dispatch('administration/invitedList')
                    this.$store.dispatch('administration/getCompany')
                })
            }
        }
    },
    created(){
        this.$store.dispatch('administration/getCompany')
        this.$store.dispatch('administration/invitedList')
    },
    mounted() {
        // console.log('Emplo list', this.$store.state.administration)
    }
}
</script>
