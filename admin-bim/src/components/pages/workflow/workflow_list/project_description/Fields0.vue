<template>
    <div>
        <slot name="combo"></slot>
        <v-col cols="12" sm="12" md="12" class="pb-0" v-for="field in items">
            <v-text-field
                v-if="field.type == 'string'"
                :label="field.title"
                placeholder=" "
                v-model="field.value"
            >
            </v-text-field>
            <v-autocomplete
                v-else-if="field.type == 'list'"
                :label="field.title"
                placeholder=" "
                :items="field.list"
                v-model="field.value"
                >
            </v-autocomplete>
            <v-textarea
                v-else-if="field.type == 'text'"
                :label="field.title"
                v-model="field.value"
                placeholder=" "
                multi-line
                rows="1">
            </v-textarea>

            <fields v-if="field.type == 'combo'" :items.sync="field.value">
                <v-list-item-title slot="combo" v-text="field.title"></v-list-item-title>
            </fields>

        </v-col>
    </div>
</template>

<script>
export default {
    name: 'Fields',
    props: ['items'],
    data(){
        return {}
    }
}
</script>
