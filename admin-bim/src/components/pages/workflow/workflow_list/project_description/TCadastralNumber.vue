<template>
    <v-col cols="12" sm="12" md="12" class="pb-0">
        <template v-for="item in numberList">
            <v-text-field
                v-if="item.type == 'string'"
                :label="item.title"
                placeholder=" "
                v-model="item.value"
            >
            </v-text-field>
        </template>
        <v-btn v-if="item.multiple" outlined color="primary" class="m-btn mb-3" @click="add">
            Добавить кадастровый номер
        </v-btn>
    </v-col>
</template>

<script>
export default {
    name: 'TCadastralNumber',
    props: ['item'],
    data(){
        return {
            numberList: [{...this.item, number: 0}]
        }
    },
    methods: {
        add(){
            let item = JSON.parse(JSON.stringify(this.numberList.filter(f => f.number == 0)))
            this.numberList = [...this.numberList, ...item.map((i, k, a) => {
                return {
                    ...i,
                    number: this.numberList.length / a.length,
                    value: ''
                }
            })]
        }
    }
}
</script>
