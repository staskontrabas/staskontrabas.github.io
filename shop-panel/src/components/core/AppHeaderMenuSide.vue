<template>
    <div class="admin-menu" :class="{'toggle-active': toggle}" id="menu">
        <div class="admin-header">
            <div class="admin-container">
                <div class="admin-header-logo">DDWeed Shop</div>
                <div class="admin-header-burger" @click="setToggle">
                    ✖
                </div>
            </div>
        </div>
        <router-link
            v-for="item in list"
            :to="item.link"
            class="admin-header-nav-item"
            active-class="admin-header-nav-item-active"
            @click.native="setToggle"
            >
            {{item.title}}
        </router-link>
    </div>
</template>

<script>
export default {
    name: 'AppHeaderMenuSide',
    props: {
        toggle: {
            default: false,
            type: Boolean
        }
    },
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
    },
    methods: {
        setToggle(){
            this.$emit('update:toggle', false)
        }
    }
}
</script>
