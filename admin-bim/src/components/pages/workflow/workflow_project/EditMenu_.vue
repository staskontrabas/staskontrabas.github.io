<template>
    <el-dropdown trigger="click">
        <div class="el-dropdown-link" >
            <v-icon size="20" v-show="showContextMenu" @click="">
                mdi-dots-vertical
            </v-icon>
        </div> 
        <el-dropdown-menu slot="dropdown" class="contextmenu">
            <!-- УБРАТЬ!!! -->
            <v-list dense>
                <v-list-item
                v-for="(note, i) in filterGroup1()"
                :key="'group1' + i"
                @click="action(note)">
                    <inline-svg :src="note.icon"/>
                    <v-list-item-title v-text="note.title"/>
                    <v-spacer v-if="note.value == 'sort' || note.value == 'more'"></v-spacer>
                    <v-icon v-if="note.value == 'sort' || note.value == 'more'" size="20"> mdi-chevron-right </v-icon>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item
                v-for="(note, i) in filterGroup2()"
                :key="'group2' + i"
                @click="action(note)">
                    <inline-svg :src="note.icon"/>
                    <v-list-item-title v-text="note.title" />
                    <v-icon v-if="note.value == 'download' || note.value == 'createset'" color="grey" size="16"> mdi-information-outline </v-icon>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item
                v-for="(note, i) in filterGroup3()"
                :key="'group3' + i"
                @click="action(note)">
                    <inline-svg :src="note.icon"/>
                    <v-list-item-title v-text="note.title" />
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
        props: ['node', 'editNode', 'nodelevel',],
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
                        access: 0,
                        icon: require('@/assets/icons/plus.svg'),
                        avaliable_from_nodelvel: 0,
                    },
                    {
                        title: 'Переименовать',
                        value: 'rename',
                        action: 'editFolderAction',
                        access: 0,
                        icon: require('@/assets/icons/add.svg'),
                        avaliable_from_nodelvel: 1,
                    },
                    {
                        title: 'Общий доступ',
                        value: 'share',
                        action: 'shareFolderAction',
                        access: 0,
                        icon: require('@/assets/icons/shareLink.svg'),
                        avaliable_from_nodelvel: 1,
                    },
                    {
                        title: 'Переместить',
                        value: 'move',
                        action: 'moveFolderAction',
                        access: 0,
                        icon: require('@/assets/icons/move_node.svg'),
                        avaliable_from_nodelvel: 1,
                    },
                    {
                        title: 'Удалить',
                        value: 'remove',
                        action: 'removeFolderAction',
                        access: 0,
                        icon: require('@/assets/icons/remove_node.svg'),
                        avaliable_from_nodelvel: 1,
                    },
                    {
                        title: 'Сортировать по',
                        value: 'sort',
                        action: 'sortFolderAction',
                        access: 1,
                        icon: require('@/assets/icons/item_sort.svg'),
                        avaliable_from_nodelvel: 0,
                    },
                ],
                group2: [
                    {
                        title: 'Выгрузить',
                        value: 'upload',
                        action: 'uploadFolderAction',
                        access: 1,
                        icon: require('@/assets/icons/uploadFile.svg'),
                        avaliable_from_nodelvel: 0,
                    },
                    {
                        title: 'Скачать исходные файлы',
                        value: 'download',
                        action: 'downloadFolderAction',
                        access: 1,
                        icon: require('@/assets/icons/downloadSourceFile.svg'),
                        avaliable_from_nodelvel: 0,
                    },
                    {
                        title: 'Журнал экспорта файлов',
                        value: 'log',
                        action: 'logFolderAction',
                        access: 1,
                        icon: require('@/assets/icons/exportFileLog.svg'),
                        avaliable_from_nodelvel: 0,
                    },
                    {
                        title: 'Отправить на проверку',
                        value: 'verify',
                        action: 'verifyFolderAction',
                        access: 1,
                        icon: require('@/assets/icons/submitReview.svg'),
                        avaliable_from_nodelvel: 0,
                    },
                    {
                        title: 'Создать комплект файлов',
                        value: 'createset',
                        action: 'createsetFolderAction',
                        access: 1,
                        icon: require('@/assets/icons/submitTransmittal.svg'),
                        avaliable_from_nodelvel: 0,
                    },

                ],
                group3: [
                    {
                        title: 'Права доступа',
                        value: 'access',
                        action: 'accessFolderAction',
                        access: 1,
                        icon: require('@/assets/icons/permissions.svg'),
                        avaliable_from_nodelvel: 1,
                    },
                    {
                        title: 'Дополнительно',
                        value: 'more',
                        action: 'moreFolderAction',
                        access: 1,
                        icon: require('@/assets/icons/settings.svg'),
                        avaliable_from_nodelvel: 1,
                    },
                ],
            }
        },
        methods: {
            action(v){
                this.$emit('update:editNode', this.node)
                this.$emit(v.action, true)
            },
            getAccess(a){
                return (this.node.data.access >> a) // && 1
            },
            filterGroup1() {
                return this.group1.filter(f => this.getAccess(f.access)
                    && (f.value == 'access' ? !this.node.data.group : true) 
                    && (f.avaliable_from_nodelvel <= this.nodelevel))
            },
            filterGroup2() {
                return this.group2.filter(f => this.getAccess(f.access)
                    && (f.value == 'access' ? !this.node.data.group : true))
            },
            filterGroup3() {
                return this.group3.filter(f => this.getAccess(f.access)
                    && (f.value == 'access' ? !this.node.data.group : true))
            },
        },
        computed: {
            showContextMenu() {
                return this.node.isSelected
            },
        },
        mounted() {
        },
    }
</script>


