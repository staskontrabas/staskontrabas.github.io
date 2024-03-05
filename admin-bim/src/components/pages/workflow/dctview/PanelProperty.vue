<template>
    <v-card
        class="m-panel__property m-card-scrollable"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-23 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Свойства объекта <b>&nbsp;{{properties.Name}}</b>
            <v-spacer></v-spacer>
            <v-btn
                v-show="properties.object != 'Room'"
                text
                icon
                class="m-btn--close-top m-btn--close-top__right3"
                :disabled="!selectedObjID"
                @click="visibilityObject"
                color="#7f7f7f">
                <v-icon size="20">{{!this.hidden ? 'mdi-eye' : 'mdi-eye-off'}}</v-icon>
            </v-btn>
            <v-btn
                text
                icon
                class="m-btn--close-top m-btn--close-top__right2"
                @click="minimize = !minimize"
                color="#7f7f7f">
                <v-icon size="20">
                    {{!minimize ? 'mdi-window-minimize' : 'mdi-window-maximize'}}
                </v-icon>
            </v-btn>
            <v-btn
                text
                icon
                class="m-btn--close-top"
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text
            v-if="!checkArray.list.length"
            class="pa-0 pb-5 m-card-scrollable__text">
            <div
                class="py-2 px-4 m-text--size14 m-text--center m-text--color-2c2c2c"
                >Выберите объект.
            </div>
        </v-card-text>

        <v-card-text
            v-else
            class="pa-0 pb-5 m-card-scrollable__text">
            <!--<div class="m-card-list__title px-4">Объект: {{properties.Name}}</div>-->
            <div
                v-for="item in checkArray.list">
                <div class="m-card-list__title">{{item.Name}}</div>
                <div
                    v-for="prop in item.PropertySet"
                    class="m-card-list__row">
                    <span class="m-card-list__cell">{{prop.Name}}</span>
                    <span class="m-card-list__cell">{{prop.NominalValue}}</span>
                </div>
            </div>
            <template v-if="classifications && !checkArray.classifier">
                <div class="m-card-list__title px-4">Классификация:</div>
                <template v-if="classifications == 'none'">
                    <div class="m-card-list__row">
                        <span class="m-card-list__div">Классификатор не был создан, так как Информационная Модель не соответствует требованиям по КСИ или СП.
                        </span>
                    </div>
                </template>
                <template v-else>
                    <div
                        v-for="prop in classifications.Classification"
                        class="m-card-list__row">
                        <span class="m-card-list__cell">{{prop.Name}}</span>
                        <span class="m-card-list__cell">{{prop.NominalValue}}</span>
                    </div>
                </template>
            </template>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'PanelProperty',
    props: ['menuItem', 'hiddenList', 'properties', 'classifications', 'selectedObjID', 'styleP'],
    data(){
        return {
            minimize: false,
        }
    },
    computed: {
        hidden(){
            return this.hiddenList.some(s => s.id == this.selectedObjID)
        },
        checkArray(){
            let array = this.properties.Properties || this.properties.Parameters
            let check = Array.isArray(array)
            let list = []
            let classifier = false
            if(check){
                list = array.map(i => {
                    if(i.Name && i.Name == 'Classification'){
                        classifier = true
                    }
                    return {
                        Name: i.PropertyGroupTitle || i.Name || i.Title,
                        PropertySet: (() => {
                            if(i.PropertyList){
                                return i.PropertyList
                                    .filter(f => f)
                                    .map(p => {
                                        return {
                                            Name: p.Title,
                                            NominalValue: p.Value + p.Units || ''
                                        }
                                    })
                            }
                            else if(i.Properties){
                                return i.Properties
                                    .map(p => {
                                        return {
                                            Name: p.Name,
                                            NominalValue: p.Value + p.Units || ''
                                        }
                                    })
                            }
                            else if(i.PropertySet){
                                return i.PropertySet
                                    ? i.PropertySet
                                    : i.Quantities
                                        ? i.Quantities
                                            .filter(f => f)
                                            .map(p => {
                                                return {
                                                    Name: p.Name,
                                                    NominalValue: p.Value + (p.Units || '') || ''
                                                }
                                            })
                                        : []
                            }
                            else{
                                return []
                            }
                        })()

                        // i.PropertyList
                        //     ? i.PropertyList || i.Properties
                        //         ? i.PropertyList
                        //             i.PropertyList
                        //                 .filter(f => f)
                        //                 .map(p => {
                        //                     return {
                        //                         Name: p.Title,
                        //                         NominalValue: p.Value + p.Units || ''
                        //                     }
                        //                 })
                        //             : i.Properties
                        //                 .map(p => {
                        //                     return {
                        //                         Name: p.Name,
                        //                         NominalValue: p.Value + p.Units || ''
                        //                     }
                        //                 })
                        //     : i.PropertySet
                        //         ? i.PropertySet
                        //         : i.Quantities
                        //             ? i.Quantities
                        //                 .filter(f => f)
                        //                 .map(p => {
                        //                     return {
                        //                         Name: p.Name,
                        //                         NominalValue: p.Value + (p.Units || '') || ''
                        //                     }
                        //                 })
                        //             : []
                    }
                })
            }

            return {
                list: list,
                check: check,
                classifier: classifier
            }
        }
    },
    methods: {
        cancel(){
            this.$emit('setOption', this.menuItem)
        },
        visibilityObject(){
            if(!this.hidden){
                this.$emit('onHideObject', [this.selectedObjID])
            }
            else{
                this.$emit('onShowObject', [this.selectedObjID])
            }
        }
    }
}
</script>
