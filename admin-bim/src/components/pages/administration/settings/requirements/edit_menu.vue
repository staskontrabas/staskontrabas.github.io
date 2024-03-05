<template>
        <v-card class="pa-2 d-flex flex-column">
            <span class="ma-1 align-self-center"> Отредактируйте значение </span>

            <div class="content align-self-center" 
            v-if="
            propset.prop === 'title' ||
            propset.prop === 'headerleft' ||
            propset.prop === 'headerright' 
            ">
                <v-text-field 
                dense
                outlined
                hide-details
                color="gray"
                v-model="currentvalue"/>
            </div>

            <div class="content align-self-center" 
            v-if="
            propset.prop === 'description' ||
            propset.prop === 'commentleft' ||
            propset.prop === 'commentright'
            ">
                <v-textarea
                clearable
                color="gray"
                clear-icon="mdi-close-circle"
                background-color="grey lighten-4"
                v-model="currentvalue"/>
            </div>

            <div class="content align-self-center" v-if="propset.prop === 'headers'">
                <v-text-field 
                class="mb-1"
                dense
                outlined
                hide-details
                color="gray"
                label="Левая колонка"
                v-model="currentvalue.left"/>
                <v-text-field 
                dense
                outlined
                hide-details
                color="gray"
                label="Правая колонка"
                v-model="currentvalue.right"/>
            </div>

            <div class="content align-self-center" v-if="propset.prop === 'textelements'">
                <v-text-field 
                v-for="elem, elemindex in currentvalue"
                class="mb-1"
                dense
                outlined
                hide-details
                color="gray"
                v-model="currentvalue[elemindex]"/>
            </div>

            <div class="mt-2 gap m-text--size14 d-flex flex-row align-self-end">
                <v-card 
                class="px-2 py-1 menubtns buttonborder"
                @click="emitconfirm">
                    Сохранить
                </v-card>
                <v-card 
                class="px-2 py-1 menubtns buttonborder"
                @click="emitcancel">
                    Отмена
                </v-card>
            </div>


        </v-card>
</template>

<script>
export default {
    props: {
        propset: {},
        // { type: ev.type, prop: ev.prop, value: ev.value, elementindex: v, needsmenu: !this.propsWithoutMenu.includes(ev.prop) }
    },
    data(){
        return {
            currentvalue: null,
        }
    },
    methods: {
        emitconfirm() {
            let newset = Object.assign({}, this.propset) // shallow clone, чтобы избежать проблем с прямой перезаписью
            newset['value'] = this.currentvalue 
            this.$emit('confirm', newset)
        },
        emitcancel() {
            this.$emit('cancel')
        },
        callconsole(v) {
            console.log(v)
        }
    },
    created() {
        // полагается, что объект пересоздается каждый раз, когда сверху спускаются новые пропы, иначе будут проблемы с обновлением визуального состояния элемента - артефакт vue 2
        if (typeof this.propset.value === 'object' && !Array.isArray(this.propset.value)) {
            this.currentvalue = Object.assign({},this.propset.value) // shallow clone object
        } else if (Array.isArray(this.propset.value)) {
            this.currentvalue = [...this.propset.value] // shallow clone array
        }
        else {
            this.currentvalue = this.propset.value
        }
    },
}
</script>
<style scoped>

.menubtns {
    width: auto;
}

.content {
    width: 100%;
}

.buttonborder {
    border: solid 1px black !important;
}

.gap {
    gap: 1.5rem;
}


</style>