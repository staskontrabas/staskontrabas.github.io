<template>
    <div class="admin-header-nav">
        <div class="admin-container">
            <router-link
                v-for="item in list"
                :to="item.link"
                class="admin-header-nav-item"
                active-class="admin-header-nav-item-active">
                {{item.title}}
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppHeaderMenu',
    data(){
        return {
            list: [{
                title: 'Мой магазин',
                role: ['superadmin', 'admin'],
                link: '/registration'
            },{
                title: 'Заказы',
                role: ['superadmin', 'admin'],
                link: '/orders'
            },{
                title: 'Отчеты',
                role: ['superadmin', 'admin'],
                link: '/reports'
            },{
                title: 'Чеки',
                role: ['superadmin', 'admin'],
                link: '/checks'
            },{
                title: 'Меню',
                role: ['superadmin', 'admin'],
                link: '/menu'
            }]
        }
    }
}
</script>
