<template>
    <v-menu
      top
      right
      offset-y
      transition="slide-y-transition"
    >
        <template v-slot:activator="{ on }">
            <!--  -->
            <v-icon
                v-show="createMenu1().length || createMenu2().length"
                v-on="on"
                text
                icon
                class="m-icon-border"
                @mousedown.stop.pevent=""
                size="20">
                mdi-dots-horizontal
            </v-icon>
        </template>
        <v-card class="contextmenu">
            <v-list dense>
                <v-list-item
                    v-for="(note, i) in createMenu1()"
                    :key="'menu1' + i"
                    :disabled="note.disabled"
                    @click="action(note)">
                    <inline-svg :src="note.icon"/>
                    <v-list-item-title 
                        :style="{'color': note.disabled ? 'grey': ''}"
                        v-text="note.title" />
                </v-list-item>
                
                <v-divider/>

                <v-list-item
                    v-for="(note, i) in createMenu2()"
                    :key="'menu2' + i"
                    :disabled="note.disabled"
                    @click="action(note)">
                    <inline-svg :src="note.icon"/>
                    <v-list-item-title 
                        :style="{'color': note.disabled ? 'grey': ''}"
                        v-text="note.title" />
                </v-list-item>

            </v-list>
        </v-card>
    </v-menu>
</template>

<script>
import InlineSvg from "vue-inline-svg"

//svg icons

export default {
    props: ['item', 'access', 'current_permissions',],
    components: {
        InlineSvg,
    },
    data(){
        return {
            doc1: [
            {
                title: 'Переместить',
                value: 'replace',
                action: 'replace',
                access: 'edit',
                icon: require('@/assets/icons/move_node.svg'),
                disabled: false,
            },
            {
                title: 'Копировать',
                value: 'copy',
                action: 'copy',
                access: 'create',
                icon: require('@/assets/icons/copy.svg'),
                disabled: false,
            },
            {
                id: 6,
                title: 'Переименовать',
                value: 'rename',
                action: 'rename',
                access: 'edit',
                icon: require('@/assets/icons/add.svg'),
                disabled: false,
            },
            {   // TODO: Настроен, отключен до окончания отладки получения доступа к файлам по ссылке
                title: 'Общий доступ',
                value: 'share',
                action: 'share',
                access: 'admin',
                icon: require('@/assets/icons/shareLink.svg'),
                disabled: true,
            },
            {   // требует настройки
                title: 'Заблокировать',
                value: 'lock',
                action: 'lock',
                access: 'admin',
                icon: require('@/assets/icons/lock.svg'),
                disabled: true,
            },
            {
                id: 7,
                title: 'Удалить',
                value: 'remove',
                action: 'remove',
                access: 'edit',
                icon: require('@/assets/icons/remove_node.svg'),
                disabled: false,
            },
            ],
            doc2 : [
            {
                id: 3,
                title: 'Редактировать',
                value: 'edit',
                action: 'edit',
                access: 'edit',
                icon: require('@/assets/icons/add.svg'),
                disabled: false,
            },
            {   // требует настройки
                title: 'Просмотреть действия с файлом',
                value: 'viewlog',
                action: 'viewlog',
                access: 'view',
                icon: require('@/assets/icons/view.svg'),
                disabled: true,
            },
            {
                title: 'Скачать файл',
                value: 'original',
                action: 'download',
                access: 'download',
                icon: require('@/assets/icons/downloadSourceFile.svg'),
                disabled: false,
            }, 
            {   // требует настройки
                title: 'Отправить на проверку',
                value: 'verify',
                action: 'verify',
                access: 'public',
                icon: require('@/assets/icons/submitReview.svg'),
                disabled: true,
            },
            {   // требует настройки
                title: 'Создать комплект файлов',
                value: 'createset',
                action: 'createset',
                access: 'public',
                icon: require('@/assets/icons/submitTransmittal.svg'),
                disabled: true,
            },
            ],
            folder1: [
            {
                title: 'Переместить',
                value: 'replace',
                action: 'replace',
                access: 'edit',
                icon: require('@/assets/icons/move_node.svg'),
                disabled: false,
            },
            {
                title: 'Переименовать',
                value: 'rename',
                action: 'rename',
                access: 'edit',
                icon: require('@/assets/icons/add.svg'),
                disabled: false,
            },
            {
                title: 'Копировать',
                value: 'copy',
                action: 'copy',
                access: 'create',
                icon: require('@/assets/icons/copy.svg'),
                disabled: false,
            },
            {
                title: 'Удалить',
                value: 'remove',
                action: 'remove',
                access: 'edit',
                icon: require('@/assets/icons/remove_node.svg'),
                disabled: false,
            },
            ],
            folder2: [
            {   // требует настройки
                title: 'Скачать исходные файлы',
                value: 'original',
                action: 'downloadfolder',
                access: 'download',
                icon: require('@/assets/icons/downloadSourceFile.svg'),
                disabled: true,
            }, 
            {   // требует настройки
                title: 'Журнал экспорта файлов',
                value: 'log',
                action: 'downloadlog',
                access: 'view',
                icon: require('@/assets/icons/exportFileLog.svg'),
                disabled: true,
            }, 
            {   // требует настройки
                title: 'Отправить на проверку',
                value: 'verify',
                action: 'verify',
                access: 'public',
                icon: require('@/assets/icons/submitReview.svg'),
                disabled: true,
            }, 
            {   // требует настройки
                title: 'Создать комплект файлов',
                value: 'createset',
                action: 'createset',
                access: 'public',
                icon: require('@/assets/icons/submitTransmittal.svg'),
                disabled: true,
            },
            ],

            // TODO: Мнею папки в дереве папок слева на странице WorkflowProject должно совпадать с меню папок в редакторе файлов. 
            // Для меню папки -- ПОКА НЕ ИСПОЛЬЗУЕТСЯ
            group1: [
                    {
                        title: 'Добавить вложенную папку',
                        value: 'folder',
                        action: 'newFolderAction',
                        access: 'edit',
                        icon: require('@/assets/icons/plus.svg'),
                        avaliable_from_nodelvel: 0,
                        disabled: false,
                    },
                    {
                        title: 'Переименовать',
                        value: 'rename',
                        action: 'editFolderAction',
                        access: 'edit',
                        icon: require('@/assets/icons/add.svg'),
                        avaliable_from_nodelvel: 1,
                        disabled: false,
                    },
                    {
                        title: 'Переместить',
                        value: 'move',
                        action: 'moveFolderAction',
                        access: 'edit',
                        icon: require('@/assets/icons/move_node.svg'),
                        avaliable_from_nodelvel: 1,
                        disabled: true,
                    },
                    {
                        title: 'Удалить',
                        value: 'remove',
                        action: 'removeFolderAction',
                        access: 'edit',
                        icon: require('@/assets/icons/remove_node.svg'),
                        avaliable_from_nodelvel: 1,
                        disabled: false,
                    },
                    {
                        title: 'Сортировать по',
                        value: 'sort',
                        action: 'sortFolderAction',
                        access: 'view',
                        icon: require('@/assets/icons/item_sort.svg'),
                        avaliable_from_nodelvel: 0,
                        disabled: true,
                    },
                ],
                group2: [
                    {
                        title: 'Выгрузить',
                        value: 'upload',
                        action: 'uploadFolderAction',
                        access: 'create',
                        icon: require('@/assets/icons/uploadFile.svg'),
                        avaliable_from_nodelvel: 0,
                        disabled: true,
                    },
                    {
                        title: 'Скачать исходные файлы',
                        value: 'download',
                        action: 'downloadFolderAction',
                        access: 'download',
                        icon: require('@/assets/icons/downloadSourceFile.svg'),
                        avaliable_from_nodelvel: 0,
                        disabled: true,
                    },
                    {
                        title: 'Журнал экспорта файлов',
                        value: 'log',
                        action: 'logFolderAction',
                        access: 'view',
                        icon: require('@/assets/icons/exportFileLog.svg'),
                        avaliable_from_nodelvel: 0,
                        disabled: true,
                    },
                    {
                        title: 'Отправить на проверку',
                        value: 'verify',
                        action: 'verifyFolderAction',
                        access: 'public',
                        icon: require('@/assets/icons/submitReview.svg'),
                        avaliable_from_nodelvel: 0,
                        disabled: true,
                    },
                    {
                        title: 'Создать комплект файлов',
                        value: 'createset',
                        action: 'createsetFolderAction',
                        access: 'public',
                        icon: require('@/assets/icons/submitTransmittal.svg'),
                        avaliable_from_nodelvel: 0,
                        disabled: true,
                    },

                ],
                group3: [
                    {
                        title: 'Права доступа',
                        value: 'access',
                        action: 'accessFolderAction',
                        access: 'admin',
                        icon: require('@/assets/icons/permissions.svg'),
                        avaliable_from_nodelvel: 1,
                        disabled: false,
                    },
                    {
                        title: 'Дополнительно',
                        value: 'more',
                        action: 'moreFolderAction',
                        access: 'edit',
                        icon: require('@/assets/icons/settings.svg'),
                        avaliable_from_nodelvel: 1,
                        disabled: true,
                    },
                ],
        }
    },
    methods: {
        getAccess(a){
            if (!this.current_permissions) {
                return false
            }
            return this.current_permissions.includes(a)
        },
        createMenu1() {
            const type = this.item.type
            if (type == 'folder') {
                return this['folder1'].filter(f => this.getAccess(f.access))
            }
            else {
                return this['doc1'].filter(f => this.getAccess(f.access))
            }
        },
        createMenu2() {
            const type = this.item.type 
            if (type == 'folder') {
                return this['folder2'].filter(f => this.getAccess(f.access))
            }
            else {
                return this['doc2'].filter(f => this.getAccess(f.access))
            }
        },
        filterGroup1() {
            return this.group1
        },
        filterGroup2() {
            return this.group2
        },
        filterGroup3() {
            return this.group3
        },
        action(v){
            const type = this.item.type
            // console.log('called_action', v, this.item)
            switch(v.action){
                case 'remove':
                    this.$emit('removeItem', this.item)
                    break
                case 'edit':
                    this.$emit('getDct', this.item)
                    break
                case 'open':
                    this.$emit('openFolder', this.item)
                    break
                case 'replace':
                    this.$emit('replaceItems', [this.item])
                    break
                case 'copy':
                    this.$emit('copyItems', [this.item])
                    break
                case 'rename':
                    this.$emit('renameitem', this.item)
                    break
                case 'accessright':
                    this.$emit('accessRights', this.item)
                    break
                case 'versionjournal':
                    this.$emit('versionJournal', this.item)
                    break
                case 'errorIFCXML':
                    this.$emit('errorIFCXML')
                    break
                case 'specificationxml':
                    this.$emit('onSpecificationXml', this.item)
                    break
                case 'download':
                    this.$emit('download', {
                        file: this.item,
                        type: v.value
                    })
                    break
                case 'convertation':
                    this.$emit('convertationIFCXML', this.item)
                    break
                case 'share': 
                    this.$emit('share', this.item)
                default: return
            }
        }
    }
}
</script>
