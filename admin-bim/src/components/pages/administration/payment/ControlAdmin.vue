<template>
    <div>
        <div
            class="m-control--item">
            <div>
                <div class="m-control--item__title">Интеллектуальный эксперт</div>
                <div class="m-control--item__desc">Ваш текущий пакет. Выберите на какой период вы хотите купить лицензию.</div>
            </div>

            <v-spacer></v-spacer>
            <v-btn
                outlined
                color="primary"
                @click="onComponent('Plan')"
                class="m-btn">Изменить план</v-btn>
        </div>

        <div
            class="m-control--item">
            <div>
                <div class="m-control--item__title">{{parameters.License}} Лицензии</div>
                <div class="m-control--item__desc">Количество лицензий, которые используют сотрудники вашей компании.</div>
            </div>

            <v-spacer></v-spacer>
            <v-btn
                outlined
                color="normal"
                class="m-btn m-btn-normal"
                @click="onComponent('License')">Управление лицензиями</v-btn>
        </div>

        <div
            class="m-control--item">
            <div>
                <div class="m-control--item__title"> Использование место</div>
                <div class="m-control--item__desc"> Ваш текущий пакет предоставляет {{parameters.Size}} Гб места в облачном хранилище.</div>
            </div>

            <v-spacer></v-spacer>
            <v-btn
                outlined
                color="normal"
                class="m-btn m-btn-normal"
                @click="onComponent('Size')">Получить больше места</v-btn>
        </div>

        <control-dialog
            :component.sync="component"
            :parameters="parameters"
            @onParameters="onParameters"
        />
    </div>
</template>

<script>
import ControlDialog from "./control/ControlDialog"

export default {
    name: 'ControlAdmin',
    components: {
        ControlDialog
    },
    data(){
        return {
            parameters: {
                Plan: 23,
                License: 3,
                Size: 5
            },
            component: false
        }
    },
    methods: {
        onParameters(p){
            this.parameters[p.name] = p.value
        },
        onComponent(c){
            this.component = c
        }
    }
}
</script>
