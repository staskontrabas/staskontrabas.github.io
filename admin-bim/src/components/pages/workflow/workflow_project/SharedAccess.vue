<template>
    <v-dialog content-class="issue-create-dialog" :value="shared" width="600px" max-width="600px">
        <div class="issue-create-header">
            <span> Общий доступ </span>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </div>

        <div class="issue-create-form-wrapper">
            <div class="btn-row">
                <el-button type="main" @click="create_new = true"> 
                    <span>
                        Создать новую ссылку
                    </span>
                </el-button>
            </div>

            <div v-if="item && item.type" class="icon_and_title">
                <inline-svg class="inline-svg" :src="getSvgSrc(item.type)"/> {{ item.name }}
            </div>

            <!-- сслыки -->
            <!-- заголовок -->
            <div class="mock-table">
                <!-- <div class="permissions">
                    <span>
                        Уровень доступа
                    </span>
                </div> -->
                <div class="linkbutton">
                    <span>
                        Ссылка на файл
                    </span>
                </div>
                <div class="expires">
                    <span>
                        Истекает
                    </span>
                </div>
                <div class="role">
                    <!-- здесь ничего не нужно -->
                </div>
            </div>


            <div class="mock-table" v-for="elem in tokens">
                <!-- <div class="permissions">
                    <div class="visual-indicator">
                       <div class="visual-cell" v-for="index in 4" :class="getVisualCellClass(index, elem.rel)"></div>
                    </div>
                    <span>
                        {{ getTitle(elem.rel) }}
                    </span>
                </div> -->
                <div class="linkbutton">
                    <el-tooltip effect="dark" placement="right">
                        <template #content>
                            Нажмите, чтобы скопировать ссылку
                        </template>
                        <div class="link-button" @click="copyLink(getLink(elem))">
                            <span class="link-button-text">
                                {{ getLink(elem) }}
                            </span>
                        </div>
                    </el-tooltip>
                </div>
                <div class="expires">
                    <span>
                        {{ getDate(elem.expire_at) }}
                    </span>
                </div>
                <div class="role">
                    <span class="linklike" @click="showRemoveDialog(elem)" style="font-size: 13px;">
                        <inline-svg class="inline-svg" :src="require(`@/assets/icons/remove_node.svg`)"/>
                    </span>
                </div>
            </div>

        </div>

        <div class="issue-create-footer">
            <el-button type="default" @click="cancel"> 
                <span>
                    Закрыть
                </span>
            </el-button>
        </div>


        <v-dialog content-class="issue-create-dialog" v-model="create_new" width="550px" max-width="550px">
            <div class="create-new-token">
                <div class="issue-create-header">
                    <span> Создание ссылки для общего доступа </span>
                    <v-btn
                        text
                        icon
                        @click="cancel_create_new"
                        color="#7f7f7f">
                        <v-icon size="20">close</v-icon>
                    </v-btn>
                </div>
                

                <div class="issue-create-form-wrapper ub-issue-form-popper display issues--outer-wrap">

                    <div class="target-wrap">

                        <span class="subtitle">
                            Выберите уровень доступа:
                        </span>
                        <!-- Выбор уровня доступа -->
                        <el-select 
                            v-model="relation" 
                            :placeholder="relation ? '' : 'Выберите уровень доступа'"
                            value-key="lvl"
                            popper-class="ub-issue-form-popper access-selector"
                            @visible-change="setPoppersWidth">

                            <!-- selected -->
                            <template v-if="relation" slot="prefix">
                                <div class="ub-issue-form-popper display">
                                    <span> {{ relation ? relation.title : '' }} </span>
                                </div>
                            </template>

                            <!-- options -->
                            <el-option
                                v-for="item in access_options"
                                :label="item.title"
                                :key="item.role"
                                :value="item">
                                <template>
                                    <div class="ub-issue-form-popper access-level-card">
                                        <div class="visual-indicator">
                                            <div class="visual-cell" v-for="index in 4" :class="getVisualCellClass(index,item.role)"></div>
                                        </div>
                                        <div class="description">
                                            <span class="d-title"> 
                                                {{ item.title }} 
                                            </span>
                                            <span class="d-text">
                                                {{ item.dscr }}
                                            </span>
                                        </div>
                                    </div>
                                </template>
                            </el-option>
                        </el-select>


                        <span class="subtitle">
                            Установите срок действия ссылки:
                        </span>
                        <!-- Выбор даты -->
                        <el-date-picker
                            ref="picker"
                            v-model="new_date"
                            type="datetime"
                            format="dd-MM-yyyy   HH:mm:ss"
                            placeholder="Выбрать время и дату"
                            :default-value="defaultDate"
                            :picker-options="pickerOptions">
                        </el-date-picker>
                    </div>

                </div>

                <div class="issue-create-footer">
                    <el-button 
                        :disabled="!(new_date !== null && relation !== null)"
                        type="main" 
                        @click="createNewToken"> 
                        <span>
                            Создать ссылку
                        </span>
                    </el-button>

                    <el-button type="default" @click="cancel_create_new"> 
                        <span>
                            Закрыть
                        </span>
                    </el-button>
                </div>
            </div>
        </v-dialog>

        <v-dialog v-model="remove_one" width="450px" max-width="450px">
            <div class="edit-problem-dialogue-wrapper">
                <div class="epd-header">
                    <span>
                        Удалить ссылку?
                    </span>
                    <el-button 
                        type="other" 
                        icon="el-icon-close" 
                        circle
                        @click="cancelDelete">
                    </el-button>
                </div>
                <div class="epd-body">
                    <span style="text-align: center; display: table-cell;">
                        Вы собираетесь удалить ссылку. После удаления ссылки получить доступ к файлу по ней станет невозможно. Вы уверены? 
                    </span>
                </div>
                <div class="epd-footer">
                    <el-button 
                        type="outlined" 
                        @click="cancelDelete">
                        Отмена
                    </el-button>
                    <el-button 
                        type="red" 
                        @click="deleteToken">
                        Удалить
                    </el-button>
                </div>
            </div>
        </v-dialog>

    </v-dialog>
</template>

<script>
import InlineSvg from "vue-inline-svg"

export default {
    name: 'SharedAccess',
    props: ['shared', 'item'],
    components: {
        InlineSvg,
    },
    data(){
        return {

            tokens: [],

            create_new: false,

            remove_one: false,
            item_to_remove: null,

            new_date: null,
            relation: null,

            access_options: [
                {
                    role: 'file_viewer',
                    title: 'Просмотр',
                    dscr: 'Разрешен просмотр файлов',
                },
                {
                    role: 'file_downloader',
                    title: 'Просмотр',
                    dscr: 'Разрешен просмотр и скачивание файлов',
                },
                {
                    role: 'file_publicator',
                    title: 'Создание',
                    dscr: 'Разрешены просмотр и скачивание файлов, публикация отметок',
                },
                {
                    role: 'file_creator',
                    title: 'Создание',
                    dscr: 'Разрешены просмотр, скачивание и загрузка файлов, публикация отметок',
                },
                {
                    role: 'file_editor',
                    title: 'Редактирование',
                    dscr: 'Разрешены просмотр, скачивание, загрузка и редактирование файлов, публикация отметок',
                },
                {
                    role: 'file_administrator',
                    title: 'Управление',
                    dscr: 'Полный административный доступ',
                },
            ],

            pickerOptions: {
                shortcuts: [
                    {
                        text: 'Один час',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000);
                            picker.$emit('pick', date);
                        }
                    }, 
                    {
                        text: 'Три часа',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 3);
                            picker.$emit('pick', date);
                        }
                    }, 
                    {
                        text: 'Восемь часов',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 8);
                            picker.$emit('pick', date);
                        }
                    }, 
                    {
                        text: 'Одни сутки',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 24);
                            picker.$emit('pick', date);
                        }
                    }, 
                    {
                        text: 'Трое суток',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 3);
                            picker.$emit('pick', date);
                        }
                    },
                    {
                        text: 'Неделя',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', date);
                        }
                    }
                ]
            },
        }
    },
    watch: {
        'item'() {
            this.getTokensForFile()
            this.relation = null
            this.new_date = null
        },
    },
    methods: {
        cancel() {
            this.$emit('update:shared', false)
        },
        cancel_create_new() {
            this.create_new = false
            this.relation = null
            this.new_date = null
        },
        getTokensForFile() {
            if (!this.item) {
                return null
            }
            let payload = {
                file_id: this.item.id,
                project_id: this.project_id,
            }
            this.$store.dispatch('administration/getTokenList', payload)
            .then(res => {
                this.tokens = res
            })
            .catch(err => {
                console.log('error fetching tokens', err)
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось загрузить данные о токенах доступа.',
                    message: 'Не удалось загрузить данные о токенах доступа.',
                })
            })
        },
        createNewToken() {
            let payload = {
                file_id: this.item.id,
                project_id: this.project_id,
                body: {
                    entity_id: this.item.id,
                    expire_at: this.new_date.toJSON(),
                    rel: this.relation.role,
                }
            }
            this.$store.dispatch('administration/addToken', payload)
            .then(res => {
                console.log('token created', res)
                this.getTokensForFile()
                this.cancel_create_new()
            })
            .catch(err => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось создать токен доступа.',
                    message: 'Не удалось создать токен доступа.',
                })
            }) 
        },
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

        setPoppersWidth() {
            // для обобщения процедуры должно быть достаточно заменить класс обертки, содержащей el-select 
            const ref = document.getElementsByClassName('target-wrap')[0]
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
        getVisualCellClass(index,lvl) {
            index = index - 1
            if (lvl == undefined || lvl == null) {
                return ''
            }
            if (index == undefined || index == null) {
                return ''
            }
            switch(lvl) {
                case 'file_viewer': {
                    return ['outlined','','',''][index]
                }
                case 'file_downloader': {
                    return ['filled','','',''][index]
                }
                case 'file_publicator': {
                    return ['filled','outlined','',''][index]
                }
                case 'file_creator': {
                    return ['filled','filled','',''][index]
                }
                case 'file_editor': {
                    return ['filled','filled','filled',''][index]
                }
                case 'file_administrator': {
                    return ['filled','filled','filled','filled'][index]
                }
            }
        },
        getTitle(role) {
            const title = this.access_options.find(obj => obj.role == role).title || null
            return title ? title : ''
        },
        getLink(elem) {
            // console.log('elems', elem)
            if (!this.item) {
                return ''
            }
    
            // ifc
            // http://localhost:8080/workflow/9167a57c-c832-4aee-bc0b-6b160d94a786/ubviewer/view-obj?file=21E5b7a8677e-5154-42b0-8382-f77e38de5a56&delta=0

            // pdf 
            // http://localhost:8080/workflow/9167a57c-c832-4aee-bc0b-6b160d94a786/ubviewer/view-pdf?file=21852a3eeac9-1d2f-4c6e-b2e2-d08c46474513&delta=0

            // svg
            // http://localhost:8080/workflow/9167a57c-c832-4aee-bc0b-6b160d94a786/ubviewer/view-pdf?file=21D3fb661d62-8778-4cf3-9ffd-a5e79e515978&delta=0
            const code = elem.code
            const type = this.item.type
            const currentUrl = window.location.origin
            const project_id = this.$route.params.id
            const doc_id = this.item.id

            // console.log('items', this.item)
            const url = this.item.files.find(obj => obj.id == this.item.versionID).url
            let viewer = ''

            switch(type) {
                case 'pdf':
                case 'svg': {
                    viewer = '/ubviewer/view-pdf?file=' 
                    break
                }
                case 'ifc': {
                    viewer = '/ubviewer/view-obj?file='
                    break
                }
                default:
                    return 'Невозможно сгенерировать ссылку доступа для этого типа файла!'
            }

            let link = currentUrl + '/workflow/' + project_id + viewer + url + '&delta=0' 
            + '&doc=' + doc_id 
            + '&access=' + code

            return link ? link : 'Ошибка при генерации ссылки!'
        },
        copyLink(link) {
            if (!link) {
                return null
            }
            navigator.clipboard.writeText(link)
            .then(() => {
                console.log('Content copied to clipboard');
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Ссылка скопирована в буфер обмена!',
                    message: 'Ссылка скопирована в буфер обмена!',
                })
            })
            .catch(() => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось скопировать ссылку.',
                    message: 'Не удалось скопировать ссылку.',
                })
            })
        },
        getDate(d){
            if (!d) {
                return '--'
            }
            let options = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:  '2-digit'}
            return (new Date(d)).toLocaleDateString("ru-RU", options)
        },
        showRemoveDialog(elem) {
            this.item_to_remove = elem
            this.remove_one = true
        },
        deleteToken() {
            let token = this.item_to_remove
            let payload = {
                file_id: this.item.id,
                project_id: this.project_id,
                token: token.code,
            }
            console.log('payday', payload)
            this.$store.dispatch('administration/deleteToken', payload)
            .then(res => {
                console.log('token deleted', res)
                this.getTokensForFile()
                this.remove_one = false
                this.item_to_remove = null
            })
            .catch(err => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Не удалось удалить токен доступа.',
                    message: 'Не удалось удалить токен доступа.',
                })
            }) 
        },
        cancelDelete() {
            this.remove_one = false
            this.item_to_remove = null
        },
    },
    computed: {
        managers(){
            let users = this.$store.state.administration.company.users || []
            users = users
                .filter(f => !this.users.some(s => s.permissions.id == f.id + ''))
                .map(u => ({
                    id: u.id + '',
                    avatar: u.avatarSrc,
                    email: u.email,
                    name: u.first_name + ' ' + u.last_name,
            }))
            return users
        },
        project_id() {
            return this.$route.params.id
        },
        defaultDate() {
            const date = new Date();
            return date.setTime(date.getTime() + 3600 * 1000);
        },
    },
    mounted(){
        this.getTokensForFile()
    },
}
</script>

<style scoped lang="scss">

::v-deep .issue-create-dialog {
    --issue-create-header-height: 70px;
    --issue-create-footer-height: 70px;
    --issue-create-form-height: calc(70vh - var(--issue-create-header-height) - var(--issue-create-footer-height));
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

.btn-row {
    display: flex; 
    flex-direction: row; 
    justify-content: start;
    margin-bottom: 12px;
}

.subtitle {
    font-size: 12px;
    font-weight: 600;
    color: #3c3c3c;
    &:not(:first-child) {
        margin-top: 12px;
    }
    
}

.target-wrap {
    display: flex;
    flex-direction: column;
}

.mock-table {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    min-height: 48px;
    max-height: 48px;
    align-items: center;
    border-bottom: 1px solid #eee;

    & .permissions {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 25%;
        font-size: 13px;
    }

    & .linkbutton {
        display: flex;
        justify-content: start;
        align-items: center;
        width: 40%;
        padding-left: 16px;
        font-size: 13px;
        height: 48px;
    }

    & .role {
        display: flex;
        justify-content: start;
        width: calc(32px + 24px);
        padding: 0px 16px;
    }

    & .expires {
        display: flex;
        justify-content: start;
        width: calc(100% - 65% - 32px - 24px);
        font-size: 13px;
        padding-left: 16px;
    }

    & .visual-indicator {
            min-width: 150px !important;
            min-height: fit-content !important;
            padding: 8px;
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            & .visual-cell {
                max-width: 30px;
                min-width: 30px;
                height: 8px;
                min-height: 8px !important;
                border-radius: 8px;
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
}

.icon_and_title {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.access-level-card {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    & .visual-indicator {
        min-width: 150px !important;
        min-height: fit-content !important;
        padding: 8px;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        & .visual-cell {
            max-width: 30px;
            min-width: 30px;
            height: 8px;
            min-height: 8px !important;
            border-radius: 8px;
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
    & .description {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: start;
        --descr-width: calc(100% - 150px);
        max-width: var(--descr-width);
        padding: 0px 8px;
        font-size: 12px;
        & .d-title {
            font-weight: 600;
            max-width: 100%;
        } 
        & .d-text {
            font-weight: 400;
            max-width: 100%;
            overflow-wrap: break-word;
            white-space: normal;
        }
    }
}

.linklike {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    color: #006eaf;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
}

.link-button {
    display: flex; 
    align-items: center; 
    min-height: 80%; 
    border: 1px solid #dcdcdc; 
    width:calc(100%); 
    max-width: calc(100%); 
    padding: 0px 10px;

    user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -o-user-select: none;
    
    &:hover {
        background-color: #fafafa;
        cursor: pointer;
    }
    &:active {
        color: #006eaf;
        background-color: #dcdcdc;
    }

    & .link-button-text {
        width: calc(100%); 
        overflow: hidden; 
        text-overflow: ellipsis; 
        white-space: nowrap;
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

    & .epd-header {
        display: flex; 
        flex-direction: row; 
        align-items: center; 
        justify-content: space-between; 
        font-family: "Artifakt Element", sans-serif;
        font-size: 24px; 
    }

    & .epd-body {
        display: flex;
        justify-content: center;
        font-family: "Artifakt Element", sans-serif;
        font-size: 12px;
    } 

    & .epd-footer {
        display: flex;
        justify-content: end;
    }
}



</style>
