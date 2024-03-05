<template>
    <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="290px"
        >
        <template v-slot:activator="{ on }">
            <v-text-field
                v-model="computedDateFormatted"
                class="pt-0"
                :label="item.Name"
                readonly
                hide-details
                placeholder=" "
                v-on="on"
            >
            </v-text-field>
        </template>
        <v-date-picker
            ref="picker"
            v-model="date"
            :landscape="true"
            locale="ru"
            :max="new Date().toISOString().substr(0, 10)"
            min="1950-01-01"
            @change="save"
        ></v-date-picker>
    </v-menu>
</template>

<script>
export default {
    name: 'DateXml',
    props: ['item'],
    data(){
        return {
            date: null,
            menu: false,
        }
    },
    computed: {
        computedDateFormatted(){
            let date = this.formatDate(this.item.value)
            return date
        },
    },
    watch: {
        menu(val){
            val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
        }
    },
    methods: {
        save(date){
            // const [year, month, day] = date.split('-')
            // let delta = new Date().getTimezoneOffset()
            //
            // let bd = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), (Math.abs(delta) / 60))
            // let mbd = bd.getTime(bd)
            this.$emit('setValue', {item: this.item, value: date})

            this.$refs.menu.save(date)
        },
        formatDate(date){
            if(!date) return null
            const [year, month, day] = date.split('-')
            return `${day}/${month}/${year}`
        },
    },
    created(){
    }
}
</script>
