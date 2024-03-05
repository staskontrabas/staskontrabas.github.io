<template>
    <v-footer
        v-if="visible"
        id="core-footer"
        absolute
        class="pb-2"
    >
        <span>
            &copy;
            UnitBIM 2018. Все права защищены.
        </span>
        <v-spacer />
        <span
            v-for="(i, j) in links"
            :key="i.name">
            <a
                class="m-footer-link"
                :href="i.link"
            >{{i.value}}</a>
            {{j != links.length - 1 ? '&nbsp;/&nbsp;' : ''}}
        </span>
    </v-footer>
</template>

<script>
    export default {
        data(){
            return{
                visible: true,
                links: [{
                    name: 'term',
                    value: 'Соглашение об использовании сайта',
                    link: 'https://unitbim.ru/account/#/modules/term'
                },{
                    name: 'privacy',
                    value: "Политика обработки персональных данных",
                    link: 'https://unitbim.ru/account/#/modules/privacy'
                },{
                    name: 'cookies',
                    value: "Файлы cookie",
                    link: 'https://unitbim.ru/account/#/modules/cookies'
                }]
            }
        },
        watch: {
            '$route' (to, from) {
                this.display()
            }
        },
        methods:{
            display: function(){
                // console.log(this.$route.name)  // Убран вообще из отображения по распоряжению Тараса
                if(this.$route.name == 'main-page'){
                    this.visible = false
                }
                else{
                    this.visible = false
                }
            }
        },
        created(){
            this.display()
        }
    }
</script>
