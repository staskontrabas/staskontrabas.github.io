<template>
    <div>
        <div
            class="m-control--item">
            <div>
                <div class="m-control--item__title">{{parameters.Name}}</div>
                <div class="m-control--item__desc">Ваш текущий пакет. Выберите, на какой период вы хотите купить лицензию.</div>
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
                <div class="m-control--item__title">Количество лицензий: {{checkLic(parameters.License) == -1 ? 'неограничено' : checkLic(parameters.License)}}</div>
                <div class="m-control--item__desc">Количество лицензий, которые используют сотрудники вашей компании.</div>
            </div>

            <v-spacer></v-spacer>
            <v-btn
                v-if="checkLic(parameters.License) != -1"
                outlined
                color="normal"
                class="m-btn m-btn-normal"
                @click="onComponent('License')">Управление лицензиями</v-btn>
        </div>

        <div
            class="m-control--item">
            <div>
                <div class="m-control--item__title">Использованное место</div>
                <div class="m-control--item__desc">Ваш текущий пакет предоставляет {{parameters.Size}} Мб места в облачном хранилище.</div>
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
        />
    </div>
</template>

<script>
import ControlDialog from "./control/ControlDialog"

export default {
    name: 'Control',
    components: {
        ControlDialog
    },
    data(){
        return {
            // parameters: {
            //     Plan: 23,
            //     License: 3,
            //     Size: 5
            // },
            list: [{
                name: 'Старт',
                code: 20
            },{
                name: 'Базовый',
                code: 21
            },{
                name: 'Профессионал',
                code: 22
            },{
                name: 'Интеллектуальный эксперт',
                code: 23
            }],
            component: false
        }
    },
    computed: {
        parameters(){
            let currentLicense = this.$store.state.administration.currentLicense

            return {
                Plan: currentLicense ? currentLicense.pcode : 0,
                Name:  currentLicense ? this.list.find(f => f.code == currentLicense.pcode).name : '',
                List: this.list,
                License:  currentLicense ? currentLicense.users : 0,
                Size:  currentLicense ? parseInt(currentLicense.space) / (1024 * 1024) : 0,
                // sizePrint: (() => {
                //     const sizes = ['Bytes', 'KB', 'Мб', 'Гб']
                //     let i = parseInt(Math.floor(Math.log(currentLicense.space) / Math.log(1024)))
                //     let value = (currentLicense.space / Math.pow(1024, i)).toFixed(2)
                //     console.log(currentLicense.space / Math.pow(1024, i), value, i)
                //     return {
                //         value: value,
                //         unit: sizes[i]
                //     }
                // })()
            }
        }
    },
    methods: {
        onComponent(c){
            this.component = c
        },
        checkLic(v){
            if(v == '9223372036854775807' && this.parameters.Plan == 20){
                return -1
            }
            else{
                return v
            }
        }
    }
}
</script>
