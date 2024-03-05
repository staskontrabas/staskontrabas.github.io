<template>
    <v-container pt-0 class="page-container">
        <div class="models-secondary-wrap">

            <!-- заголовок -->
            <div class="project-wrapper">
                <span class="project-title">
                    Роли
                </span>
            </div>

            <!-- замещение вкладки для совпадения по высоте -->
            <div class="tabs-blank"></div>

            <!-- обертка -->
            <div class="models-main-body">

                <div class="left-column">

                    <!-- <el-button
                        type="main"
                        style="width: 200px; margin-bottom: 4px;">
                        <div>
                            Добавить роль
                        </div>
                    </el-button> -->

                    <div class="input-wrapper">
                        <v-text-field
                            v-model="search"
                            prepend-icon="search"
                            placeholder="Поиск роли"
                            single-line
                            hide-details
                            class="m-table-toolbar--search"
                        ></v-text-field>
                    </div>

                    <!-- <ub-table 
                        :data="roles"
                        /> -->

                    <div class="mock-table">
                        <div 
                            v-for="role in filtered_roles"
                            class="role-card"  
                            :class="(role.rid == selected_cell) ? 'selected' : ''"
                            :key="role.rid"
                            @click="setCurrent(role.rid)">
                            <span class="text-truncate">
                                {{ role.title }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="right-column ">
                    <div v-if="selected_cell !== null" class="display-card">
                        <div class="display-top">
                            {{ roles.find(obj => obj.rid == selected_cell).title }}
                        </div>
                        <div class="display-bottom">

                            <div class="left">
                                <el-button type="main" :disabled="hasUnsavedChanges" @click="updateRole">
                                    Сохранить изменения
                                </el-button>
                            </div>
                            <!-- edn left -->

                            <div class="right">

                                    <div class="issues--outer-wrap" style="display: flex; flex-direction: row; flex-wrap: nowrap;">
                                    <el-form
                                        ref="form"
                                        :model="form_data"
                                        :rules="{}"
                                        label-position="top">

                                        <el-form-item label="Уровень доступа к компании" prop="selected_role">
                                            <el-select 
                                                v-model="form_data.selected_role"
                                                value-key="rel"
                                                :placeholder="''"
                                                popper-class="ub-issue-form-popper access-selector roles-selector"
                                                @visible-change="setPoppersWidth">

                                                <template slot="prefix">
                                                    <div class="ub-issue-form-popper display">
                                                        <span style="overflow-x: hidden; text-overflow: ellipsis; white-space:nowrap; display:inline-block;">
                                                            {{ form_data.selected_role ? form_data.selected_role.title : 'Не установлено' }}
                                                        </span>
                                                    </div>
                                                </template>

                                                <el-option
                                                    v-for="item in acccess_options"
                                                    :label="item.title"
                                                    :key="item.rel"
                                                    :value="item">
                                                    <template>
                                                        <div class="ub-issue-form-popper option">
                                                            {{ item.title }} 
                                                        </div>
                                                    </template>
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                        <el-form-item label="Пользователи" prop="users">
                                            <el-select 
                                                v-model="form_data.users" 
                                                multiple 
                                                placeholder="Выберите участника" 
                                                popper-class="issue-selector-observers ub-issue-form-popper"
                                                @visible-change="setPoppersWidth">
                                                <el-option
                                                    v-for="item in managers"
                                                    :key="item.id"
                                                    :label="item.name"
                                                    :value="item.id">
                                                    <template>
                                                        <div class="issue-selector-observers option">
                                                            <div class="problems-form-row-wrap">
                                                                <div class="false-checkbox" :class="form_data.users.includes(item.id) ? 'false-checkbox-checked' : '' "></div>
                                                                <span> {{ item.name }} </span>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-form>
                                    
                                </div>
                            </div> 
                            <!-- end right -->
                        </div>
                        <!-- end display-bottom -->

                    </div>
                </div>

            </div>

            <!-- добавление роли -- пока отключено по настоянию начальства -->
            <!-- <v-dialog content-class="issue-create-dialog" v-model="show_create_role" width="700px" max-width="700px">
            <div class="issue-create-header">
                <span> Добавить новую роль </span>
                <v-btn
                    text
                    icon
                    @click="show_create_role = false"
                    color="#7f7f7f">
                    <v-icon size="20"> close </v-icon>
                </v-btn>
            </div>
            <div class="issue-create-form-wrapper">
            </div>
            <div class="issue-create-footer">
                <el-button type="default" @click="show_create_role = false"> 
                    <span>
                        Отмена
                    </span>
                </el-button>

                <el-button type="main" @click="createRole">
                    <span>
                        Создать
                    </span>
                </el-button>
            </div>
            </v-dialog> -->

        </div>

    </v-container>
</template>


<script>
import ubTable from "@/components/custom/ubTable.vue"

export default {
    name: 'Roles',
    components: {
        ubTable,
    },
    data() {
        return {
            search: '',
            loading: true,

            show_create_role: false,

            form_data: {
                selected_role: null,
                users: [],
            },

            roles: [],

            selected_cell: null,
          }
    },
    watch: {
    },
    methods: {
        createRole() {
            // создать роль на основе form_data
        },
        setCurrent(role_id) {  
            // console.log('setting id', role_id)
            if (this.selected_cell == role_id) {   
                this.selected_cell = null
            }
            else {
                this.selected_cell = role_id
            }
            this.setFormData(this.selected_cell) 
        },
        setPoppersWidth() {
            // для обобщения процедуры должно быть достаточно заменить класс обертки, содержащей el-select (здесь 'issues--inner-wrap')
            const ref = document.getElementsByClassName('issues--inner-wrap')[0]
            const real_width = ref ? ref.offsetWidth : null

            if (!real_width) {
                return null
            }
            let targets = document.querySelectorAll('.ub-issue-form-popper:not(.display)')
            for (let elem of targets) {
                elem.style['min-width'] = real_width + 'px'
                elem.style['max-width'] = real_width + 'px'
            }
        },
        getRoles() {
            this.loading = true
            this.$store.dispatch('administration/getRoles')
            .then(res => {
                // роли фильтруются и пользователю показываются только те роли, к редактированию которых у него есть доступ
                this.roles = res.filter(obj => this.user_roles_permissions.includes(obj.rid))
                this.loading = false
                // console.log('got roles in Roles-vue', this.roles)
            })
            .catch(err => {
                console.log('error loading roles', err)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удается получить список ролей. Проверьте соединение.',
                    message: 'Не удается получить список ролей. Проверьте соединение.',
                })
                this.loading = false
            })
        },
        setFormData(selected_rid) {
            // TODO: обновить, после того как Дима напишет правильное поле для роли
            let target = this.form_data
            if (!selected_rid) {
                target.users = []
            }
            target.selected_role = this.roles.find(obj => obj.rid == selected_rid)
        },
        updateRole() {
            // Добавить в роль пользователей, а роли установить relation
            // TODO: разкомментировать и протестить
            // let source = this.form_data
            // if (!source.selected_role) { return null }
            // this.$store.dispatch('administration/updateRole', { rid: source.selected_role.rid, title: source.selected_role.title, users: source.users, })
            // const rel = source.role_permission
            // this.$store.dispatch('administration/addCompanyPermission', { rel: rel ? rel : "company_membership", sid: source.selected_role.rid, stype: "role" } )
        },
    },
    computed: {
        managers() {
            let users = this.$store.state.administration.company.users || []
            users = users
                .map(u => ({
                    id: u.id + '',
                    avatar: u.avatarSrc,
                    email: u.email,
                    name: u.first_name + ' ' + u.last_name,
            }))
            return users
        },
        filtered_roles() {
            let roles = this.roles
            let srch = this.search.toLowerCase()
            roles = roles.filter( obj => obj.title.toLowerCase().includes(srch))
            return roles
        },
        hasUnsavedChanges() {
            let source = this.form_data.selected_role
            if (!source) {
                return false
            }
            let new_arr = this.form_data.users
            let old_arr = this.roles.find(obj => obj.rid == this.selected_cell).users || []
            console.log('arrs', new_arr.sort(), old_arr.sort())
            return JSON.stringify(new_arr.sort()) == JSON.stringify(old_arr.sort())
        },
        acccess_options() {
            return [
                    {title: 'Администратор', rel: 'company_administrator'},
                    {title: 'Сотрудник', rel: 'company_membership'},
                    ]
        },
        user_roles_permissions() {
            // собирает лист ролей, к редактированию которых у текущего пользователя есть доступ
            if (!(this.$store.state.administration.user && this.$store.state.administration.user.permissions) ) {
                return []
            }
            let roles = this.$store.state.administration.user.permissions.role
            let list = []
            if (!roles) {
                return list
            }
            for (let role of Object.keys(roles)) {
                if(roles[role].includes('admin')) {
                    list.push(role)
                }
            }
            return list
        }
    },
    mounted() {
        this.getRoles()
        console.log('updated user permissions', this.$store.state.administration.user.permissions)
    },
    updated() {
        // console.log('updated user permissions', this.$store.state.administration.user.permissions)
        // console.log('updated filter', this.user_roles_permissions)
    },
    beforeDestroy() {
        // localStorage.setItem('ListOfRoles', JSON.stringify(this.roles))
    }
}
 
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: unset !important;
}

.models-secondary-wrap {
    height: 100%;
    width: 100%;
}

.tabs-blank {
    --blank-height: 40px;
    min-height: var(--blank-height);
    max-height: var(--blank-height);
    margin: 0px 16px;
    border-bottom: 2px solid #e4e7ed;
}

.models-main-body {
    display: flex; 
    flex-direction: row; 
    padding: 0; 
    height: calc(100vh - 195px); // 130 + 60
}

.left-column {
    display: flex;
    flex-direction: column;
    width: 350px;
    max-width: 350px;;
    border-right: 1px solid lightgrey;
    padding: 8px;
}

.mock-table {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;

    & .mock-cell {
        display: flex;
        align-items: center;
        height: 48px;
        padding: 8px 12px;
        font-size: 14px;
        overflow: hidden;
    }
}

.role-card {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    height: 48px;
    border: 1px solid transparent;
    cursor: pointer;
    &:hover {
        border: 1px solid gray;
    }
}

.right-column {
    display: flex;
    flex-direction: column;
    padding: 16px;
    flex-basis: 100%;
}

.display-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: fit-content;
    width: 100%;
    
    border: 1px solid lightgrey;
    box-shadow: 2px 2px 5px lightgrey;

    & .display-top {
        height: 70px;

        display: flex;
        flex-direction: row;
        justify-content: start;
        
        border-bottom: 1px solid lightgrey;
    }
    & .display-bottom {
        height: fit-content;
        padding-top: 16px;

        display: flex;
        flex-direction: row !important;
        align-items: center;
        & .left {
            width: 50%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: start;

            justify-content: start;
        }
        & .right {
            width: 50%;
            display: flex;
            justify-content: space-around;

            border-left: lightgrey 1px solid;
        }

    }

}


</style>
