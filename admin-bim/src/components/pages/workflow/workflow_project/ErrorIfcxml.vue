<template>
    <v-dialog :value="error_ifcxml" scrollable max-width="600px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-1 pl-4">
                Ошибка конвертации
                <v-spacer></v-spacer>
                <v-btn
                    text
                    icon
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>
            <v-card-text style="background-color: #fbfbfb; color: #000;" class="pt-5 pl-4">
                Информационная модель не соответствует нормативным требованиям и не может быть конвертирована в РСИМ. Исправьте все ошибки, которые указал наш ИИ.
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions class="pa-5">
                <v-spacer></v-spacer>
                <v-btn
                    outlined
                    color="#2c2c2c"
                    class="m-btn m-btn-normal"
                    @click="cancel">Закрыть</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: ['error_ifcxml'],
        name: 'ErrorIfcxml',
        methods: {
            cancel(){
                this.$emit('update:error_ifcxml', false)
            }
        }
    }
</script>
