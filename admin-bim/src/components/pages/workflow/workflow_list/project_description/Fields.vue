<template>
    <v-col cols="12" :sm="item.type == 'text' ? '12' : size" :md="item.type == 'text' ? '12' : size" class="pb-0">
        <v-text-field
            v-if="item.type == 'string'"
            :label="item.title"
            placeholder=" "
            v-model="item.value"
            :required="item.required"
            :rules="item.rules"
            @change="onChange"
        >
        </v-text-field>
        <v-autocomplete
            v-else-if="item.type == 'list'"
            :label="item.title"
            placeholder=" "
            :items="item.list"
            v-model="item.value"
            >
        </v-autocomplete>
        <v-select
            v-else-if="item.type == 'select'"
            :label="item.title"
            placeholder=" "
            :items="item.list"
            v-model="item.value"
            :multiple="item.multiple"
            >
        </v-select>
        <v-textarea
            v-else-if="item.type == 'text'"
            :label="item.title"
            v-model="item.value"
            placeholder=" "
            multi-line
            rows="1">
        </v-textarea>
    </v-col>
</template>

<script>
export default {
    name: 'Fields',
    props: ['item', 'size'],
    data(){
        return {
        }
    },
    methods: {
        onChange(v){
            this.$emit('onChange')
        }
    }
}
</script>
