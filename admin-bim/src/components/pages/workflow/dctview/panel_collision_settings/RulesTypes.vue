<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Тип проверки
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
        <v-card-title class="pr-0 pl-4 m-modal--title">
            <v-text-field
                class="ma-0 pl-0 pr-4 pb-2 pt-0"
                v-model="search"
                type="text"
                rounded
                clearable
                prepend-inner-icon="search"
                placeholder="Поиск..."
                single-line
                hide-details
            ></v-text-field>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pb-3" style="background-color: #fbfbfb;">
            <v-radio-group
                class="mt-0"
                v-model="type"
                >
                <v-list style="background-color: #fbfbfb;">
                    <v-list-item-group
                        v-model="selected"
                        @change="onChange"
                        >
                        <v-list-item v-for="(item, i) in getTypeList"
                            :key="i"
                            :value="item"
                            :disabled="item.disabled"
                            >
                            <template v-slot:default="{ active }">
                                <v-list-item-action class='mb-0 mr-3 flex-row align-baseline'>
                                    <v-radio
                                        :value="item.type"
                                        class="mr-2"
                                    ></v-radio>
                                </v-list-item-action>

                                <v-list-item-content>
                                    <v-list-item-title>
                                        <v-tooltip top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <span
                                                    role="empty"
                                                    v-bind="attrs"
                                                    v-on="on">
                                                    {{item.name}}
                                                </span>
                                                <v-btn v-if="item.disabled" outlined color="normal" class="m-btn m-btn-normal" @click="">В разработке</v-btn>
                                            </template>
                                            {{item.tooltype}}
                                        </v-tooltip>
                                    </v-list-item-title>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-radio-group>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-spacer></v-spacer>
            <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="cancel">Отмена</v-btn>
            <v-btn outlined color="primary" class="m-btn" @click="setComponent">Выбрать
            </v-btn>
        </v-card-actions>

    </v-card>
</template>

<script>

export default {
    name: 'RulesTypes',
    props: ['temp'],
    data(){
        return {
            type: '',
            elemstype: [],
            ruleTitle: '',
            selected: [],
            search: '',
            parts: {
                geom: 'RulesSettings',
                params: 'RulesSettingsParams',
                repeat: 'RulesSettingsRepeat',
                identical: '',
                numberobj: 'RulesSettingsNumberObjRooms',
                distance: 'RulesSettingsDistance',
                space: 'RulesSettingsSpace',
                between: '',
                rooms: '',
                windowopenings: ''
            },
            typeList: [{
                name: 'Общие правила проверки пересечения',
                type: 'geom',
                elemstype: [],
                tooltype: 'Это правило проверяет пересечение (коллизии) компонентов.  Необходимо настроить, какие компоненты проверяет правило и каким образом определяться пересечения (коллизии).',
                disabled: false
            },{
                name: 'Параметры компонента',
                type: 'params',
                elemstype: [],
                tooltype: 'Это правило проверяет, имеют ли компоненты в модели или на одном этаже (уровне) одинаковые значения свойств.',
                disabled: false
            },{
                name: 'Значение свойств компонента должны быть одинаковыми',
                type: 'identical',
                elemstype: [],
                tooltype: '',
                disabled: true
            },{
                name: 'Количество компонентов в помещении.',
                type: 'numberobj',
                elemstype: [],
                tooltype: 'Это правило проверяет, что в помещении находится требуемое количество компонентов.',
                disabled: false
            },{
                name: 'Дублирование компонентов',
                type: 'repeat',
                elemstype: [],
                tooltype: 'Это правило проверяет дублирование элементов в модели.',
                disabled: false
            },{
                name: 'Расстояние до компонента',
                type: 'distance',
                elemstype: [],
                tooltype: 'Это правило проверяет расстояние между компонентами.',
                disabled: false
            },{
                name: 'Свободное пространство перед компонентом.',
                type: 'space',
                elemstype: [],
                tooltype: 'Это правило проверяет отсутствие блокирующих компонентов перед определенными компонентами.',
                disabled: false
            },{
                name: 'Сравнение между значениями свойств компонента.',
                type: 'between',
                elemstype: [],
                tooltype: 'Это правило используется для сравнения значений двух свойств, связанных с компонентом.',
                disabled: true
            },{
                name: 'Проверка помещения',
                type: 'rooms',
                elemstype: [],
                tooltype: 'Это правило проверяет: - что геометрия и расположения геометрии правильные, - что граница помещения касаются стен,  колонн или других объектов; - что помещения соприкасаются с поверхностями плит выше или ниже своих границ; - высота помещения и пересечения с другими компонентами.',
                disabled: true
            },{
                name: 'Помещения должны иметь достаточную площадь оконных проемов',
                type: 'windowopenings',
                elemstype: [],
                tooltype: 'Правило проверяет, что соотношение между площадью оконных  проемов и площадью помещения находится в допустимых пределах.',
                disabled: true
            }]
        }
    },
    computed: {
        getTypeList(){
            return this.typeList
                .filter(f => f.name.toLowerCase().includes((this.search || '')))
        }
    },
    methods: {
        onChange(v){
            this.type = v.type.toString()
            this.elemstype = v.elemstype
            this.ruleTitle = v.name
        },
        cancel(){
            this.$emit('cancel')
        },
        setComponent(){
            let update = JSON.parse(JSON.stringify(this.temp))
            update = {
                ...this.temp,
                part: this.type,
                elemstype: this.elemstype,
                ruleTitle: this.ruleTitle
            }

            this.$emit('setParams', update)
            this.$emit('setComponent', this.parts[this.type])
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.cancel()
            }
        },
        mounted(){
            document.addEventListener('keyup', this.enter, false)
        },
        beforeDestroy(){
            document.removeEventListener('keyup', this.enter, false)
        }
    }
}
</script>
