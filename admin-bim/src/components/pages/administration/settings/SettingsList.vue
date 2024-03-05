<template>
    <v-container fluid px-3 pt-0 pb-10 class="m-container">
        <div
            v-for="group in list"
            class="m-list--group"
            >
                <div class="m-list--group-title">{{group.group}}
            </div>
            <div
                class="m-list--item"
                v-for="item in group.items"
                @click="action(item.action)">
                <div class="m-list--item-title">{{item.title}}</div>
                <div class="m-list--item-desc">{{item.desc}}</div>
            </div>
        </div>
    </v-container>
</template>

<script>
export default {
    name: 'SettingsList',
    data(){
        return {
            list: [
                {
                    group: 'Аккаунт',
                    items: [
                        {
                            title: 'Профиль компании',
                            desc: 'Укажите данные вашей компанией, чтобы иметь возможность покупать услуги, продукты UnitBIM и пользоваться всеми возможностями платформы.',
                            action: 'company',
                            permissions: ['1','2','3','4','5','6']
                        },{
                            title: 'Сотрудники',
                            desc: 'Список сотрудников вашей компании использующие платформу UnitBIM.',
                            action: 'employees',
                            permissions: ['1','2','3','4','5','6']
                        },
                        // {
                        //     title: 'Вход через социальные сети',
                        //     desc: 'Используйте свои учетные записи в социальных сетях для быстрого, легкого и безопасного доступа к сервисам UnitBIM.',
                        //     action: 'company'
                        // }
                    ]
                },{
                    group: 'Документооборот',
                    items: [
                        // {
                        //     title: 'Права доступа',
                        //     desc: 'Укажите, кто из пользователей может совершать оплату при покупке лицензии и других сервисов.',
                        //     action: 'accessrights',
                        //     permissions: ['1','2']
                        // },
                        {
                            title: 'Контент',
                            desc: 'Список всех проектов и файлов загруженных или созданных вашими сотрудниками.',
                            action: 'content',
                            permissions: ['1','2','3','4','5','6']
                        },{
                            title: 'Контрагенты',
                            desc: 'Укажите свой контрагентов для возможности выстраивание совместной работы.',
                            action: 'contragents',
                            permissions: ['1','2']
                        },{
                            title: 'Версионность',
                            desc: 'Укажите максимальное количество версий файла, которые будут храниться на облаке.',
                            action: 'version',
                            permissions: ['1','2','3','4','5','6']
                        },
                        // {
                        //     title: 'Требования к информационной модели',
                        //     desc: 'Техническое задание для автоматической проверки информационной модели.',
                        //     action: 'requirements',
                        //     permissions: ['1','2']
                        // },
                        {
                            title: 'Активность',
                            desc: 'Следите за действиями и активностью ваших сотрудников.',
                            action: 'activity',
                            permissions: ['1','2']
                        }
                    ]
                }
            ]
        }
    },
    methods: {
        action(a){
            this.$router.push({name: a})
        },
        getList(){
            let role = this.$store.state.administration.user.role
            let list = this.list.map(l => ({
                ...l, items: l.items.filter(i => i.permissions.some(p => p == role))
            })).filter(l => l.items.length)
            return list
        }
    }
}
</script>
