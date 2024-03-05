<template>
    <!-- accessrights -->
    <v-navigation-drawer
        :value="accessrights" 
        :permanent="accessrights"
        absolute
        right
        width="600"
        style="z-index: 1000;">
        <template>
            <div class="edit-problem-wrapper">

                <div style="padding: 16px 16px; border-bottom: 1px solid #eee;">
                    <div class="edit-problem-header">
                        <div class="edit-problem-title-field">
                            <span class="truncate-text edit-problem-title-plate">
                                Разрешения
                            </span>
                            <el-button 
                                type="other" 
                                icon="el-icon-close" 
                                circle
                                @click="cancel">
                            </el-button>
                        </div>
                    </div>
                </div>

                <div class="file-type" style="padding: 16px 16px; border-bottom: 1px solid #eee;">
                    <div class="icon">
                        <inline-svg :src="getSvgSrc(item !== null ? item.type : '')"/>
                    </div>
                    <div class="access-data">
                        <span class="access-data-title">
                            {{ item ? item.title : '' }}
                        </span>
                        <div class="access-data-numbers">
                            <span>
                                Пользователи: {{ sorted_permissions.users ? sorted_permissions.users.length : '0' }}
                            </span>
                            <span>
                                Компании: {{ sorted_permissions.comps ? sorted_permissions.comps.length : '0' }}
                            </span>
                            <span>
                                Роли: {{ sorted_permissions.roles ? sorted_permissions.roles.length : '0' }}
                            </span>
                        </div>
                    </div>
                
                    
                </div>

                <div class="edit-problem-content">
                   
                    <div class="edit-problem-button-panel">
                        <el-button 
                            class="problem-icon-btn" 
                            type="main"
                            @click="show_create_permission_dialog = true">
                            <div>
                                <i class="el-icon-plus"></i> 
                                <span> 
                                    Создать 
                                </span>
                            </div>
                        </el-button>
                    </div>

                    <div class="headers">
                        <div class="h-avatar">
                            <span>
                                Пользователь
                            </span>
                        </div>
                        <div class="permissions">
                            <span>
                                Разрешения
                            </span>
                        </div>
                        <div class="usertype">
                            <span>
                                Тип
                            </span>
                        </div>
                        <div class="role">
                            <span>
                               
                            </span>
                        </div>
                    </div>

                    <!-- пользователи -->
                    <div class="mock-table" v-for="elem in sorted_permissions.users">
                        <div class="h-avatar">
                            <div>
                                <v-img 
                                    style="max-width: 24px;"
                                    class="avatar"
                                    :src="managers.find(obj => obj.id == elem.id).avatar"
                                ></v-img>
                                <el-tooltip
                                    effect="dark"
                                    :disabled="!needs_tooltip" placement="right">
                                    <template #content>
                                        {{ managers.find(obj => obj.id == elem.id).name }}
                                    </template>
                                    <span class="truncate-text" @mouseover="checkIfNeedsTooltip">
                                        {{ managers.find(obj => obj.id == elem.id).name }}
                                    </span>
                                </el-tooltip>
                            </div>
                            
                        </div>
                        <div class="permissions">
                            <div class="visual-indicator">
                                <div class="visual-cell" v-for="index in 4" :class="getVisualCellClass(index, elem.rel)"></div>
                            </div>
                            <span>
                                {{ getTitle(elem.rel) }}
                            </span>
                        </div>
                        <div class="usertype">
                            <span class="truncate-text">
                                Пользователь
                            </span>
                        </div>
                        <div class="role">
                            <span class="linklike" @click="showRemoveDialog(elem, 'users')">
                                Удалить
                            </span>
                        </div>
                    </div>

                    <!-- роли -->
                    <div class="mock-table" v-for="elem in sorted_permissions.roles">
                        <div class="h-avatar">
                           {{ getRoleTitle(elem.id) }} 
                        </div>
                        <div class="permissions">
                            <div class="visual-indicator">
                                <div class="visual-cell" v-for="index in 4" :class="getVisualCellClass(index, elem.rel)"></div>
                            </div>
                            <span>
                                {{ getTitle(elem.rel) }}
                            </span>
                        </div>
                        <div class="usertype">
                            <span class="truncate-text">
                                Роль
                            </span>
                        </div>
                        <div class="role">
                            <span class="linklike" @click="showRemoveDialog(elem, 'roles')">
                                Удалить
                            </span>
                        </div>
                    </div>

                    <!-- Компании -->
                    <div class="mock-table" v-for="elem in sorted_permissions.comps">
                        <div class="h-avatar">
                           {{ getCompanyName(elem) }} 
                        </div>
                        <div class="permissions">
                            <div class="visual-indicator">
                                <div class="visual-cell" v-for="index in 4" :class="getVisualCellClass(index, elem.rel)"></div>
                            </div>
                            <span>
                                {{ getTitle(elem.rel) }}
                            </span>
                        </div>
                        <div class="usertype">
                            <span class="truncate-text">
                                Компания
                            </span>
                        </div>
                        <div class="role">
                            <span class="linklike" @click="showRemoveDialog(elem, 'roles')">
                                Удалить
                            </span>
                        </div>
                    </div>

                </div>

            </div>
        </template>

        <v-dialog content-class="issue-create-dialog" v-model="show_create_permission_dialog" width="700px" max-width="700px">
            <div class="issue-create-header">
                <span> Добавить новое разрешение </span>
                <v-btn
                    text
                    icon
                    @click="show_create_permission_dialog = false"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </div>
            <div class="issue-create-form-wrapper">
                <ub-permission-form 
                    v-if="show_create_permission_dialog"
                    :form_data.sync="form_data"
                    :data="managers"
                    :account="null"
                    :access_options="access_options"
                />
            </div>
            <div class="issue-create-footer">
                <el-button type="default" @click="show_create_permission_dialog = false"> 
                    <span>
                        Отмена
                    </span>
                </el-button>

                <el-button type="main" @click="createPermission">
                    <span>
                        Создать
                    </span>
                </el-button>
            </div>
        </v-dialog>

        <v-dialog v-model="show_delete_dialog" width="450px" max-width="450px">
            <div class="edit-problem-dialogue-wrapper">
                <div class="epd-header">
                    <span>
                        Удалить разрешение?
                    </span>
                    <el-button 
                        type="other" 
                        icon="el-icon-close" 
                        circle
                        @click="show_delete_dialog = false; removePermissionData = null;">
                    </el-button>
                </div>
                <div class="epd-body">
                    <span style="text-align: center; display: table-cell;">
                        Разрешение будет удалено. Вы уверены? 
                    </span>
                </div>
                <div class="epd-footer">
                    <el-button 
                        type="outlined" 
                        @click="show_delete_dialog = false; removePermissionData = null;">
                        Отмена
                    </el-button>
                    <el-button 
                        type="red" 
                        @click="removePermission">
                        Удалить
                    </el-button>
                </div>
            </div>
        </v-dialog>

    </v-navigation-drawer>
</template>

<script>
import InlineSvg from "vue-inline-svg"
import ubPermissionForm from "@/components/custom/ubPermissionForm.vue"

export default {
    name: 'newAccessRights',
    props: ['accessrights', 'item'],
    components: {
        InlineSvg,
        ubPermissionForm,
    },
    data(){
        return {
            show_delete_dialog: false,
            removePermissionData: null,

            form_data: null,

            permissions_data: [],

            managerList: [],
            users: [],
            addedUserList: [],

            needs_tooltip: false,
            show_create_permission_dialog: false,

            access_options: [
                {
                    rel: 'folder_viewer',
                    title: 'Просмотр',
                    dscr: 'Разрешен просмотр файлов',
                },
                {
                    rel: 'folder_downloader',
                    title: 'Просмотр',
                    dscr: 'Разрешен просмотр и скачивание файлов',
                },
                {
                    rel: 'folder_publicator',
                    title: 'Создание',
                    dscr: 'Разрешены просмотр и скачивание файлов, публикация отметок',
                },
                {
                    rel: 'folder_creator',
                    title: 'Создание',
                    dscr: 'Разрешены просмотр, скачивание и загрузка файлов, публикация отметок',
                },
                {
                    rel: 'folder_editor',
                    title: 'Редактирование',
                    dscr: 'Разрешены просмотр, скачивание, загрузка и редактирование файлов, публикация отметок',
                },
                {
                    rel: 'folder_administrator',
                    title: 'Управление',
                    dscr: 'Полный административный доступ',
                },
            ],

            roles: [],
        }
    },
    watch: {
        'item'(){
            this.getFolderPermissions()
            this.getRoles()
        },
        'accessrights'() {
            this.getFolderPermissions()
            this.getRoles()
        }
    },
    methods: {
        cancel(){
            this.permissions_data = []
            this.$emit('update:accessrights', false)
        },
        createPermission() {
            let source = this.form_data 

            const project_id = this.project_id
            const folder_id = this.item ? this.item.id : null
            if (!(project_id && folder_id)) {
                return null
            }

            console.log('source,', source)
            if (!(source && source.entities && source.entities.length)) {
                return null
            }

            let result = {
                users: [],
                roles: [],
                companies: [],
            }
            // prel - permission relation
            let prel = source.permissions.rel

            for (const elem of source.entities) {
                // для ролей
                if (elem.hasOwnProperty('rid')) {
                    result.roles.push({
                        rel: prel,
                        sid: elem.rid,
                        stype: "role",
                    })
                }
                // для юзеров
                if (elem.hasOwnProperty('avatar') && elem.hasOwnProperty('email')) {
                    result.users.push({
                        rel: prel,
                        sid: elem.id,
                        stype: "user",
                    })
                }
                // для компаний
                if (elem.hasOwnProperty('id') && elem.hasOwnProperty('official_name')) {
                    result.users.push({
                        rel: prel,
                        sid: elem.id,
                        stype: "other_company",
                    })
                }
            }

            console.log('entity res', result)
            // формируем запросы на создание
            let promises = []

            for (const user of result.users) {
                promises.push(this.$store.dispatch('administration/addFolderPermission', { project_id: project_id, folder_id: folder_id, body: user, }))
            }
            for (const company of result.companies) {
                promises.push(this.$store.dispatch('administration/addFolderPermission', { project_id: project_id, folder_id: folder_id, body: company, }))
            }
            for (const role of result.roles) {
                promises.push(this.$store.dispatch('administration/addFolderPermission', { project_id: project_id, folder_id: folder_id, body: role, }))
            }

            // выполнить запросы и обновить список разрешений
            Promise.all(promises)
            .then( () => {
                this.getFolderPermissions()
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Разрешения успешно созданы.',
                    message: 'Разрешения успешно созданы.',
                })
                this.show_create_permission_dialog = false
            })
            .catch(err => {
                console.log('cant create permissions', err )
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Во время создания одного из разрешений произошла ошибка.',
                    message: 'Во время создания одного из разрешений произошла ошибка.',
                })
                this.show_create_permission_dialog = false
            })


        },
        

        ///////////////////  технические процедуры  ///////////////////
        getSvgSrc(type) {
            switch(type) {
                case 'folder': {
                    return require(`@/assets/icons/file-icon.svg`)
                }
                case 'consolidations':
                case 'dwg':
                case 'excel':
                case 'ifc':
                case 'pdf':
                case 'rvt':
                case 'word':
                case 'xlsx':
                case 'jpg':
                case 'png':
                case 'txt':
                case 'xml':
                case 'zip':
                {
                    return require(`@/assets/icons/file-format/${type}.svg`)
                }

                default: {
                    return require(`@/assets/icons/view.svg`)
                }
            }
        },
        checkIfNeedsTooltip(arg) {
            let target = arg.target 
            if (target.offsetWidth < target.scrollWidth) {
                this.needs_tooltip = true           
                return true
            }
            this.needs_tooltip = false
            return false
        },
        getVisualCellClass(index,rel) {
            index = index - 1
            if (rel == undefined || rel == null) {
                return ''
            }
            if (index == undefined || index == null) {
                return ''
            }
            switch(rel) {
                case 'folder_viewer': {
                    return ['outlined','','',''][index]
                }
                case 'folder_downloader': {
                    return ['filled','','',''][index]
                }
                case 'folder_publicator': {
                    return ['filled','outlined','',''][index]
                }
                case 'folder_creator': {
                    return ['filled','filled','',''][index]
                }
                case 'folder_editor': {
                    return ['filled','filled','filled',''][index]
                }
                case 'folder_administrator': {
                    return ['filled','filled','filled','filled'][index]
                }
            }
        },
        getTitle(rel) {
            const source = this.access_options
            const title = source.find(obj => obj.rel == rel).title || null
            return title ? title : ''
        },
        getFolderData(folder_id) {
            let state = this.$store.state.workflow.foldersMap
            const folder = state.find(obj => obj.id == folder_id)
            return folder ? folder : null
        },
        getAvatar(user_id) {
            if (!user_id) {
                return ''
            }
            const user = this.managers.find(obj => obj.id == user_id) 
            return user ? user.avatar : ''
        },
        getFolderPermissions() {
            const project_id = this.project_id
            const folder_id = this.item ? this.item.id : null
            if (!(project_id && folder_id)) {
                console.log('Нет id папки или проекта', 'proj', project_id, 'fol', folder_id)
                return null
            }

            this.$store.dispatch('administration/getFolderPermissions', {
                project_id: project_id,
                folder_id: folder_id,
            })
            .then( res => {
                console.log('got folder permissions', res)
                this.permissions_data = res
            })
            .catch( er => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось получить данные о разрешениях.',
                    message: 'Не удалось получить данные о разрешениях.',
                })
            })
        },
        showRemoveDialog(item, type) {
            this.removePermissionData = {
                item: item,
                type: type,
            }
            this.show_delete_dialog = true
        },
        removePermission() {
            // console.log('removing permission', item, type)
            let source = this.removePermissionData
            if (!source) {
                return null
            }
            let item = source.item
            let type = source.type

            const project_id = this.project_id
            const folder_id = this.item ? this.item.id : null
            if (!(project_id && folder_id)) {
                console.log('Нет id папки или проекта', 'proj', project_id, 'fol', folder_id)
                return null
            }

            // console.log(this.permissions_data)

            const types = {
                users: "user",
                companies: "company",
                roles: "role",
            }

            this.$store.dispatch('administration/deleteFolderPermission', {
                project_id: project_id,
                folder_id: folder_id,
                body: {
                    rel: item.rel,
                    sid: item.id,
                    stype: types[type],
                },
            })
            .then( res => {
                this.getFolderPermissions()
                this.removePermissionData = null
                this.show_delete_dialog = false
            })
            .catch( er => {
                this.removePermissionData = null
                this.show_delete_dialog = false
            })
        },
        getRoles() {
            this.$store.dispatch('administration/getRoles')
            .then(res => {
                this.roles = res
                for (let role of this.roles) {
                    role.id = role.rid
                }
            })
            .catch(err => {
                console.log('error loading roles', err)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удается получить список ролей. Проверьте соединение.',
                    message: 'Не удается получить список ролей. Проверьте соединение.',
                })
            })
        },
        getRoleTitle(role_id) {
            if (!role_id) {
                return ''
            }
            const source = this.roles
            if (!(source && source.length)) {
                return ''
            }
            const role = source.find(obj => obj.rid == role_id)
            return role ? role.title : '' 
        },
        getCompanyName(company) {
            if (!this.friendlist) {
                return ''
            }
            console.log('infinite',this.friendlist)
            const comp = this.friendlist.find(obj => obj.id == company.id)
            return comp ? comp.name : 'Не удалось найти компанию в дружественных' 
        },
    },
    computed: {
        project_id() {
            return this.$route.params.id
        },
        managers(){
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
        item_permissions(){
            // считает количество уникальных пользователей, ролей и компаний для интерфейса; пока отключено, но должно работать
            let list = this.permissions_data

            let result = {
                users: [],
                roles: [],
                companies: [],
            }

            const categories = ['users', 'roles', 'comps']
            
            for (const elem of list) {
                for (const cat of categories) {
                    if (elem[cat]) {
                        for (const item of elem[cat]) {
                            if (result[cat] && !result[cat].some(obj => obj == item)) {
                                result[cat].push(item)
                            }
                        }
                    }
                }
            }

            return {
                users: result.users.length,
                roles: result.roles.length,
                companies: result.companies.length,
            }
        },
        sorted_permissions() {
            let source = this.permissions_data

            let result = {
                users: [],
                roles: [],
                comps: [],
            }

            const categories = ['users', 'roles', 'comps']

            for (const elem of source) {
                let pT = elem.rel // permissionType
                if ( pT == 'folder_owner' || pT == 'folder_company' || pT == 'folder_parrent' ) {
                    continue
                }
                for (const cat of categories) {
                    if (!elem[cat]) {
                        continue
                    }
                    for (const item of elem[cat]) {
                        result[cat].push({
                            id: item,
                            rel: pT, 
                        })
                    }
                }
            }
            return result
        },
        friendlist() {
            let list = []
            const my_comp = this.$store.state.administration.company
            list = [
                ...this.$store.state.administration.company.c_friends, 
                {id: my_comp.id, name: my_comp.name, official_name: my_comp.official_name}
            ]
            return list
        },
    },
    created(){
    },
    mounted() {
    },
    updated() {
    },
}
</script>



<style scoped lang="scss">

.edit-problem-wrapper {
    --lower-border-color: #eee;
    --edit-problem-header-height: 60px;
    --deep-red-color: darkred;
    --button-panel-height: 48px;
    --blue-text: rgb(6, 150, 215);
    display: flex;
    flex-direction: column;
    height: calc(100%);
    width: calc(100%);
    border-bottom: 1px solid #eee;
}

.edit-problem-header {
    display: flex;
    flex-direction: column;
    min-height: calc(var(--edit-problem-header-height) - var(--edit-problem-wrap-padding));
    max-height: calc(var(--edit-problem-header-height) - var(--edit-problem-wrap-padding));

    position: sticky;
    top: 0;
}

.edit-problem-title-field {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.edit-problem-content {
    min-height: calc(100% - var(--edit-problem-header-height));
    padding: 16px 16px;
    font-size: 14px;
    font-weight: 400 !important;

    & .headers {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        border-bottom: 1px solid #eee;
        min-height: 48px;
        max-height: 48px;
        align-items: center;

        & span {
            font-weight: 600;
            line-height: 20px;
        }
        & .permissions {
            font-size: 14px;
            align-items: start;
        }
    }

    & .mock-table {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        min-height: 48px;
        max-height: 48px;
        align-items: center;
        border-bottom: 1px solid #eee;
    }

    & .h-avatar {
        display: flex;
        justify-content: start;
        width: 25%;
        padding-left: 16px;
        & div {
            display: flex; 
            flex-direction: row; 
            flex-wrap: nowrap; 
            gap: 8px;
            overflow: hidden;
            padding-right: 16px;
        }
    }
    & .permissions {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 25%;
        font-size: 13px;
    }
    & .usertype {
        display: flex;
        justify-content: start;
        width: 25%;
        padding-left: 16px;
    }
    & .role {
        display: flex;
        justify-content: start;
        width: 25%;
        padding-left: 16px;
    }
}

.edit-problem-title-plate {
    max-width: 85%;
    font-family: "Artifakt Element", sans-serif;
    font-weight: 400;
    font-size: 20px;
    line-height: 26px;
}

.file-type {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: start;
    align-items: center;
    padding: 16px 16px;

    & .icon {
        width: 48px;
        height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
        & svg {
            width: 36px;
            height: 36px;
        }
    }

    & span {
        font-size: 13px;
        line-height: 13px;
    }

    & .access-data-numbers {
        display: flex;
        gap: 8px;
        color: var(--blue-text);
    }
}

::v-deep .issue-create-dialog {
    --issue-create-header-height: 70px;
    --issue-create-footer-height: 70px;
    --issue-create-form-height: calc(35vh - var(--issue-create-header-height) - var(--issue-create-footer-height));
}

.issue-create-header {
    height: var(--issue-create-header-height);
    font-weight: 400;
    font-size: 24px;
    line-height: 30px;
    color: #3c3c3c;
    min-height: 70px;
    max-height: 70px;
    border-bottom: 1px solid #dcdcdc;
    background-color: #fdfdfd;
    padding: 20px 24px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.issue-create-form-wrapper {
    padding: 12px 16px;
    max-height: var(--issue-create-form-height);
    height: var(--issue-create-form-height);
    overflow-y: auto;
}

.issue-create-footer {
    height: var(--issue-create-footer-height);
    padding: 20px 24px;
    border-top: 1px solid #dcdcdc;
    background-color: #fdfdfd;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    gap: 12px;
}


.visual-indicator {
    min-width: 150px;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    & .visual-cell {
        max-width: 25px;
        min-width: 25px;
        height: 8px;
        border-radius: 5px;
        border: 1px solid transparent;
        background-color: #eee;
        &.outlined {
            border-color: #006eaf;
        }
        &.filled {
            background-color: #006eaf;
            border-color: #006eaf;
        }
    }
}

.linklike {
    color: #006eaf;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
}

.edit-problem-dialogue-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 200px;
    background-color: white;
    border-radius: 4px;
    padding: 16px;
}

.epd-header {
    display: flex; 
    flex-direction: row; 
    align-items: center; 
    justify-content: space-between; 
    font-family: "Artifakt Element", sans-serif;
    font-size: 24px; 
}

.epd-body {
    display: flex;
    justify-content: center;
    font-family: "Artifakt Element", sans-serif;
    font-size: 12px;
} 

.epd-footer {
    display: flex;
    justify-content: end;
}

</style>