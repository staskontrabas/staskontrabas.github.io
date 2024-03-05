<template>
    <el-dropdown hide-on-click trigger="click">
        <div class="el-dropdown-link" >
            <v-icon size="20" 
                v-show="showContextMenu && (filterGroup1().length || filterGroup2().length || filterGroup3().length)" 
                @click="">
                mdi-dots-vertical
            </v-icon>
        </div> 
        <el-dropdown-menu slot="dropdown" class="contextmenu">
            <v-list dense>
                <v-list-item
                v-for="(note, i) in filterGroup1()"
                :key="'group1' + i"
                :disabled="note.disabled"
                @click="action(note)">
                    <inline-svg :src="note.icon"/>
                    <v-list-item-title 
                        :style="{'color': note.disabled ? 'grey': ''}"
                        v-text="note.title"/>
                    <v-spacer v-if="note.value == 'sort' || note.value == 'more'"></v-spacer>
                    <v-icon v-if="note.value == 'sort' || note.value == 'more'" size="20"> mdi-chevron-right </v-icon>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item
                v-for="(note, i) in filterGroup2()"
                :key="'group2' + i"
                :disabled="note.disabled"
                @click="action(note)">
                    <inline-svg :src="note.icon"/>
                    <v-list-item-title 
                        :style="{'color': note.disabled ? 'grey': ''}"
                        v-text="note.title" />
                    <v-icon v-if="note.value == 'download' || note.value == 'createset'" color="grey" size="16"> mdi-information-outline </v-icon>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item
                v-for="(note, i) in filterGroup3()"
                :key="'group3' + i"
                :disabled="note.disabled"
                @click="action(note)">
                    <inline-svg :src="note.icon"/>
                    <v-list-item-title 
                        :style="{'color': note.disabled ? 'grey': ''}"
                        v-text="note.title" />
                    <v-spacer v-if="note.value == 'more'"></v-spacer>
                    <v-icon v-if="note.value == 'more'" size="20"> mdi-chevron-right </v-icon>
                </v-list-item>

            </v-list>
        </el-dropdown-menu>
    </el-dropdown>
</template>

<script>
import InlineSvg from "vue-inline-svg"

    export default {
        props: ['node', 'editNode', 'nodelevel', 'current_permissions',],
        components: {
            InlineSvg,
        },
        data() {
            return {
                group1: [
                    {
                        title: 'Добавить вложенную папку',
                        value: 'folder',
                        action: 'newFolderAction',
                        access: 'create',
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
                        disabled: false,
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
                        avaliable_from_nodelvel: 0,
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
            action(v){
                // console.log('edit_menu action', v, 'node', this.node)
                this.$emit('update:editNode', this.node)
                this.$emit(v.action, true)
            },
            getAccess(a){
                // console.log('getting acc', this.current_permissions.includes(a))
                if (!this.current_permissions) {
                    return false
                }
                return this.current_permissions.includes(a)
            },
            filterGroup1() {
                return this.group1.filter(f => this.getAccess(f.access)
                    // && (f.value == 'access' ? !this.node.data.group : true) 
                    && (f.avaliable_from_nodelvel <= this.nodelevel))
            },
            filterGroup2() {
                return this.group2.filter(f => this.getAccess(f.access)
                && (f.avaliable_from_nodelvel <= this.nodelevel))
            },
            filterGroup3() {
                return this.group3.filter(f => this.getAccess(f.access)
                && (f.avaliable_from_nodelvel <= this.nodelevel))
            },
        },
        computed: {
            showContextMenu() {
                return this.node.isSelected
            },
        },
        mounted() {
            // console.log('curr perms', this.current_permissions)
        },
        updated() {
            
        },
    }
</script>


