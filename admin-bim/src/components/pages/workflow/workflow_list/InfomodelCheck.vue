<template>
    <v-dialog class="roboto" 
    v-model="showinfomodel" 
    width="700" 
    overlay-opacity="0.1">
        <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" color="red"> 
                {{ errors === null ? '' : 'mdi-alert-outline' }}
            </v-icon>
        </template>

        <v-card class="position-relative">
            <div class="pa-4 d-flex align-center header header-font position-sticky">
                <span>
                    Ошибки по Информационной модели
                </span>
                <v-spacer></v-spacer>
                <v-icon @click="action('close')"> mdi-close </v-icon>
            </div>

            <div v-if="errors !== null" class="pa-4 body position-relative">

                <div class="d-flex flex-column">
                    <div class="mb-1" v-if="projectinfo">
                        <span> Название проекта: </span> 
                        <span class="bold"> {{ projectinfo.info.name }} </span> 
                    </div>
                    <div class="mb-2" v-if="templatedata">
                        <span> Шаблон, назначенный для данного проекта: </span> 
                        <span class="bold"> {{ templatedata.templatetitle }} </span> 
                    </div>
                </div>

                <div v-if="errors && Object.keys(errors).length !== 0"
                class="mb-2 infomessage d-flex flex-row">
                    <div class="i-leftbox"></div>
                    <div class="i-rightbox infocolor d-flex align-center ">
                        <v-icon color="#356ac0" class="mx-2"> mdi-information-outline </v-icon>
                        <span> Информационная Модель не соответствует требованиям по техническому заданию; ниже приведен список несоответствий. </span>
                    </div>
                </div>
                <div v-else-if="errors && Object.keys(errors).length === 0 && projectinfo.info.template_id !== null"
                class="mb-2 infomessage d-flex flex-row">
                    <div class="i-leftbox"></div>
                    <div class="i-rightbox infocolor d-flex align-center ">
                        <v-icon color="#356ac0" class="mx-2"> mdi-information-outline </v-icon>
                        <span> Несоответствий между Информационной Моделью и требованиями по техническому заданию не обнаружено. </span>
                    </div>
                </div>
                <div v-if="projectinfo.info.template_id === null"
                class="mb-2 infomessage d-flex flex-row">
                    <div class="i-leftbox"></div>
                    <div class="i-rightbox infocolor d-flex align-center ">
                        <v-icon color="#356ac0" class="mx-2"> mdi-information-outline </v-icon>
                        <span> Данному проекту не назначен шаблон для проверки! </span>
                    </div>
                </div>
                
                <div>
                    <!-- sortedErrors вместо errors --> 
                    <div class="section" v-for="section of Object.keys(sortedErrors)">
                        <span class="bold"> {{ numeration[section] }} {{ sectionnames[section] }} </span> 

                        <div class="block ml-6 mr-2 d-flex flex-column" v-for="block of Object.keys(sortedErrors[section])">
                            <div>
                                <span class="bold"> 
                                    {{ numeration[sortedErrors[section][block].section_id] }} 
                                    {{ blocknames[sortedErrors[section][block].section_id] }} 
                                </span> 
                            </div>
                            <span class="my-1"> Список элементов, которые не соответствуют требованиям: </span>
                            <div class="element pl-6 py-2" v-for="element of sortedErrors[section][block].errors">
                                <span> {{ element.title }} </span>
                            </div>


                            <span class="my-1 democardlink blue--text d-flex align-self-end"
                                @click="getContent(section, sortedErrors[section][block].section_id)"> 
                                Просмотреть список требований 
                            </span>

                        </div>
                    </div>
                </div>

            </div>
            <div class = "px-4 pa-2 d-flex justify-space-between footer position-sticky" >
                <v-card 
                flat
                class="pa-2 d-flex justify-center align-center btn-border btn-border-color"
                @click="action('downloadreport')">
                    <v-icon dense color="blue lighten-2"> mdi-tray-arrow-down </v-icon>
                    <span class="pl-2 pr-0 blue--text"> Скачать отчет </span>
                    <v-icon dense color="blue lighten-2" v-show="false"> mdi-chevron-down </v-icon>
                </v-card>
                <v-card 
                flat
                class="pa-2 d-flex justify-center align-center btn-border"
                @click="action('close')">
                    Закрыть
                </v-card>
            </div>
        </v-card>

        <v-dialog class="roboto" v-model="showdemocard" width="800" overlay-opacity="0.3">
            <democard :content="democardcontent" :actualdata="{}" :number="democardnumber" />
        </v-dialog>

    </v-dialog>
</template>

<script>
import baselibrary from '@/components/pages/administration/settings/requirements/baselibrary.vue'
import Democard from './Democard.vue'

export default {
    components: {
        Democard,
    },
    props: ['projectinfo', 'errors', 'templatedata', 'icon',],
    data: () => ({
        showinfomodel: false,
        showdemocard: false,
        democardcontent: [],
        democardnumber: '',
    }),
    computed: {
        sectionnames(){
            return {
                'levels' : 'Уровни',
                'tsm' : 'ЦИМ-модели',
            }
        },
        blocknames() {
            return {
                'levels.mark' : 'Отметка',
                'levels.frame': 'Корпус',
                'levels.codes': 'Коды уровней',
                'levels.number': 'Номер уровня',
                'tsm.cipher': 'Шифр проекта',
                'tsm.frame': 'Корпус',
                'tsm.stage': 'Стадия проекта',
                'tsm.subject': 'Дисциплина',
                'tsm.subsection': 'Подраздел дисциплины',
                'tsm.version': 'Версия программы',
                'tsm.stage': 'Стадия проекта',
            }
        },
        baselib() {
            return baselibrary.data().baselibrary 
        },
        numeration() {
            // составляет нумерацию секций и блоков на основе templatedata
            if (!this.templatedata) { return {} }
            if (!this.templatedata.content) { 
                console.log('Warning - no content in template ', this.templatedata.templatename)
                return {}
            }
            let numlist = {}
            let s = 1
            for (const section of this.templatedata.content) {

                // секция
                if (section.id !== '' && section.id !== undefined) {
                    numlist[''+section.id] = '' + s
                }

                let b = 1
                // блоки в секции
                for (const block of section.content) {
                    if (block.id !== '' && block.id !== undefined ) {
                        numlist[block.id] = '' +s + '.'+b
                    }
                    b++
                }

                s++
            }
            return numlist
        },
        sortedErrors() {
            // устанавливает порядок отображения секций и блоков в соответствии с шаблоном (сервис проверки возращает несортированный порядок)

            if (this.errors === null) { return null } // на случай отсутствия списка ошибок

            let unsortedErrors = JSON.parse(JSON.stringify(this.errors)) // deepcopy

            // cортирует блоки внутри секций
            for (const el of Object.keys(unsortedErrors)) {
                sortBlocksByNumeration(unsortedErrors[el], this.numeration)
            }
            
            // теперь сами секции
            const ordered = Object.keys(unsortedErrors).sort().reduce(
                (obj, key) => {
                    obj[key] = unsortedErrors[key];
                    return obj;
                },
                {} // initial variable
            )

            unsortedErrors = ordered

            function sortBlocksByNumeration(arrayofblocks, num) {
                // возможны проблемы с мутацией пропа, потому что .sort портит исходный массив - > можно вылечить JSON.parse(JSON.stringify)
                let sortedArray = arrayofblocks.sort((a,b) => {
                return num[a.section_id] - num[b.section_id]
                })

                return sortedArray
            }
            
            return unsortedErrors
        },
    },
    methods: {
        action(v){
            switch(v){
                case 'downloadreport':
                    this.$emit('downloadreport')
                    console.log('downloadreport')
                    break
                case 'close':
                    this.$emit('close')
                    this.showinfomodel = false
                    break
                default:
                    console.log('Action is not recognized in InfomodelCheck')
            }
        },
        getContent(section, block) {
            // процедура берет стандартный элемент из библиотеки и подставляет в него пользовательский ввод из шаблона
            const source = this.baselib.find(tmplt => tmplt.id === 'template.' + section)
            .content.find(s => s.id === section)
            .content.find(b => b.id === block)

            // if (!source) - failsafe для падения baselib

            let content = [...source.elements] // стандартный контент из стандартного элемента базовой библиотеки
            const props = this.getActualProps(section, block)
            // процедура замещения рассчитана на совпадение порядка элементов шаблона и элемента, сохраненного в стандартной библиотеке; 
            // обновление стандартной библиотеки может вызывать проблемы с сохраненными шаблонами из прошлых версий
            const res = content.map((element, index) => {
                let o = {}
                o.typeofelement = element.typeofelement
                o.props = {}
                for (const k of Object.keys(element.props)) {
                    o.props[k] = props[index].props[k] || element.props[k]
                }
                return o
            })
            this.democardcontent = res
            this.democardnumber = this.numeration[block]
            this.showdemocard = true
        },
        getActualProps(section, block) {
            // возвращает пользовательский ввод из шаблона для секция id / блок id

            if (!this.templatedata) { 
                console.log('No templatedata transferred to InfomodelCheck')
                return {} 
            } 

            let props = this.templatedata.content.find(s => s.id === section) 
            .content.find(b => b.id === block).elements || []
            return props
        },
    },
}
</script>

<style scoped>

.roboto {
    font-family: Roboto;
}

.header-font {
    font-size: 22px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.32;
    letter-spacing: normal;
}

.position-relative {
    position: relative;
}

.position-sticky {
    position: sticky;
}

.header {
    top: 0;
    border-bottom: 2px solid lightgrey;
    height: 3rem;
    min-height: 58px;
    z-index: 2;
    background-color: white;
}

.body {
    position: relative;
    height: calc(100% - 6rem);
}

.footer {
    bottom: 0;
    border-top: 2px solid lightgrey;
    height: 3rem;
    min-height: 58px;
    z-index: 2;
    background-color: white;
}

.section {
    width: 100%;
}

.block {
    width: auto;
}

.element {
    background-color: #f0f1f3;
}

.btn-border {
    border-radius: 5px;
    border: 1px solid;
}

.btn-border-color {
    border-color: lightblue;
}

.bold {
    font-weight: 800;
}

.democardlink {
    cursor: pointer;
    text-decoration: underline;
}

.democardlink:hover {
    text-decoration:none;
}

.infomessage {
    min-height: 58px;
    border-radius: 5px;
}

.i-leftbox {
    background-color: #c1daf9;
    max-width: 10px;
    min-width: 10px;
}

.i-rightbox {
    background-color: #eaf2fd;
    width: 100%;
}

.infocolor {
    color: #356ac0;
}

</style>
