<template>
    <!-- Основной контейнер -->
    <v-container id="requirements" fliud px-3 pb-10 pt-0 class="m-container d-flex hgap common-text position-absolute" :style="viewer_style">

        <!-- Левая колонка -->
        <div id="leftcolumn" class="leftcolumnwidth gap d-flex flex-column">
            <div class="d-flex flex-column">
                <span class="font-weight-bold">
                    Шаблон
                </span>

                <!-- Список шаблонов, доступных пользователю -->
                <div>
                    <v-autocomplete
                    ref="templateselector"
                    outlined
                    single-line
                    dense
                    hide-details
                    hide-no-data
                    label="Выбрать" 
                    background-color="white"
                    :items="templates"
                    item-text="templatetitle"
                    item-value="id"
                    @change="changeCurrentTemplate"
                    v-model="currenttemplate"/>
                </div>

            </div>


            <!-- Библиотека -->
            <v-card id="library" class="templatelibrary rounded-0 d-flex flex-column">
                 
                <div class="px-4 libraryheader background-wheat d-flex align-center">
                    <span> Параметры </span>
                    <v-spacer />
                    <v-tooltip max-width="280" color="black" top>
                        <template v-slot:activator="{ on, attrs }">
                            <div v-on="on" v-bind="attrs">
                                <v-icon @click="showcurrentcontent">
                                    mdi-help-circle-outline
                                </v-icon>
                            </div>
                        </template>
                        <span> Перетащите один из стандартных элементов с этой панели в правую область, чтобы добавить его в шаблон.
                        </span>
                    </v-tooltip>
                </div>

                <!-- Библиотечные карточки шаблонов -->
                <div class="overflow-auto">
                    <Container group-name="infomodel" 
                    :should-accept-drop="function () { return false }"
                    :get-child-payload="getPayloadFromLibrary">
                        <Draggable v-for="item, libindex of library" :key="'libtemplate' + libkeyindex + libindex">
                            <div class="px-3 my-1 d-flex flex-column align-center m-text--size14">
                                <v-card class="filling d-flex flex-row" :elevation="6" @click.native="toggleFoldLibItem(libindex)">
                                    <v-icon :class="{ rotated: !item.folded }">
                                        mdi-chevron-right
                                    </v-icon>
                                    <span class="pl-1 text-truncate"> {{item.title}} </span>
                                    <v-spacer/>
                                </v-card>
                                <div v-if="!item.folded" :elevation="2" class="mt-1 pa-0 filling d-flex flex-column align-end">
                                    <v-card 
                                    v-for="cd, cdindex of item.content" 
                                    class="mb-1 pl-4 pr-2 d-flex flex-row align-center lib-infomodel" 
                                    :style="[{
                                        'width': 'calc(100% - ' + ((cd.section_level + 1)*20+'px)'),
                                        'height': 2 + (cd.section_level !== 0 ? 0.5 : 0) + 'rem',
                                        }]">
                                        <span class="text-truncate nowrap"> {{ cd.title }}</span>
                                        <v-spacer />
                                        <div class="position-relative" v-if="cd.section_level !== 0">
                                            <v-icon dense color="gray" class="mr-1 lib-eye"
                                            @mouseover="updateDemoCard($event.target.getBoundingClientRect(), cd)"
                                            @mouseleave="hideDemoCard">
                                                mdi-eye
                                            </v-icon>
                                        </div>
                                    </v-card>
                                </div>
                            </div>
                        </Draggable>
                    </Container>
                </div>
                <v-spacer/>

                <div class="save-buttons py-2 px-4 d-flex align-center justify-space-around m-text--size14">
                    <v-btn class="no-uppercase m-text--size14" outlined dense depressed color="blue" 
                    @click="saveTemplate">
                            <span class="rq-no-letter-spacing"> Сохранить как шаблон </span>
                    </v-btn>

                    <v-btn class="white--text no-uppercase m-text--size14" dense depressed color="blue" 
                    @click="associateTemplateWithProject">
                        <span class="rq-no-letter-spacing"> Применить к проекту </span>
                    </v-btn>
                </div>

            </v-card>

        </div>
        <!-- Конец левой колонки -->

        <!-- Правая колонка -->
        <div class="rightcolumnwidth gap d-flex flex-column">
            <div class="d-flex flex-column">
                <span class="font-weight-bold">
                    Проект
                </span>

                <div class="d-flex flex-row gap">
                    <v-autocomplete
                    dense
                    outlined
                    single-line
                    hide-details
                    persistent-hint
                    :items="projects"
                    item-text="name"
                    item-value="id"
                    label="Выбрать"
                    background-color="white"
                    v-model="project"/>
                
                <v-tooltip max-width="280" color="black" bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-card v-on="on" v-bind="attrs" 
                            class="px-2 d-flex align-center" 
                            @click.native="initiateDeleteCurrentContent">
                                <v-icon>
                                    mdi-trash-can-outline
                                </v-icon>
                            </v-card>
                        </template>
                    <span class="m-text--size14">
                            Удалить текущее содержимое из шаблона
                    </span>
                </v-tooltip>
                </div>
            </div>

            <!-- Карточка с монтируемыми блоками - currentcontent -->
            <v-card id="currentcontent" class="py-1 px-1 currentcontent d-flex flex-column justify-start overflow-x-hidden overflow-y-auto">
                <Container 
                class="contentcontainer"
                group-name="infomodel" 
                @drop="onDrop"
                :get-child-payload="getPayloadFromCurrentContent"
                non-drag-area-selector=".editable"> 
                    <Draggable 
                        v-for="element, index of currentcontent" 
                        :drag-begin-delay="100"
                        :style="[{'margin-left': (element.section_level*30+'px')}]"
                        :key="keyindex + index"
                        :drag-not-allowed="checkIfDragIsForbiddenForElement(index)">
                            <BlockContainer 
                                :sectionlevel="element.section_level"
                                :sectionindex="getIndexMappingForData[index]"
                                :title="element.title" 
                                :content="element.content"
                                @delete-request="deleteBlockFromCurrentContentByIndex($event,index,element.section_level)"
                                @updatestate="updateBlockDisplayStateByIndex($event,index)"
                                @updatedatav2="updatedatav2($event, index)"
                                :displaystate="element.displaystate"
                                :standard="element.id !== undefined && element.id !== '' ">
                            </BlockContainer>
                    </Draggable>
                </Container>
            </v-card>

        </div>
        <!-- Конец правой колонки -->

        <!-- Подтверждение удаления элемента -->
        <v-menu
        attach="#requirements"
        left absolute
        :close-on-content-click="true"
        :position-x="deletion_info.menu_position.x"
        :position-y="deletion_info.menu_position.y"
        v-model="deletion_confirmation_menu">
            <v-card class="px-2 py-1 deletecardconfirmation d-flex flex-column align-center" outlined :elevation="6">
                <div class="my-1 d-flex flex-column align-center">
                    <span> Удалить элемент? </span>
                    <div v-if="deletion_info.issection" class="my-1 px-1 warning-box border-radius-5px d-flex flex-column align-center m-text--size14">
                       <span> Внимание! Удаление секции удалит все ее содержимое! </span>
                    </div>
                </div>
                <div class="width-100pc d-flex flex-row justify-space-around">
                    <v-hover v-slot="{ hover }">
                        <v-card 
                        class="confirm-btn d-flex justify-center"
                        :color="hover ? '#E0E0E0' : '#FFFFFF'" 
                        :elevation="hover ? 3 : 1"
                        @click="confirmDeleteHandler">
                            Да
                        </v-card> 
                    </v-hover>
                    <v-hover v-slot="{ hover }">
                        <v-card 
                        class="confirm-btn d-flex justify-center"
                        :color="hover ? '#E0E0E0' : '#FFFFFF'" 
                        :elevation="hover ? 3 : 1" 
                        @click="cancelDelete">
                            Нет
                        </v-card> 
                    </v-hover>
                </div>
            </v-card>
        </v-menu>

        <!-- Меню сохранения шаблона -->
        <v-menu 
        absolute
        attach="#requirements" 
        :close-on-content-click="false" 
        :close-on-click="true"
        :position-x="templateSaveMenuPosition.x"
        :position-y="templateSaveMenuPosition.y"
        v-model="showsavetemplatemenu">
            <v-card class="infocard pa-2 d-flex flex-column justify-end" :elevation="6">
                <span class="mb-1 m-text--size14">
                    Введите имя шаблона:
                </span>
                <v-combobox
                ref="templateNameInput"
                dense
                outlined
                single-line
                hide-details
                hide-no-data
                label="Выбрать шаблон" 
                background-color="white"
                :items="templatesnamesarray"
                v-model="templatename"
                @change="handleTemplateNameChange"
                @keydown="handleTemplateNameChange"
                />
                <div :key="templatenamewarningkey" v-if="templatesaveconfirmation" class="mt-2 warning-box border-radius-5px d-flex flex-column align-center m-text--size14">
                    <span class="text-center"> Шаблон с этим именем уже существует! </span>
                    <span class="text-center"> Перезаписать? </span> 
                </div>
                <div class="mt-1 tsconfirmbox d-flex flex-row justify-space-around align-center">
                    <v-hover v-slot="{ hover }">
                        <v-card class="d-flex ts-btn justify-center align-center" 
                        :color="hover ? '#E0E0E0' : '#FFFFFF'"
                        :elevation="hover ? 6 : 3" 
                        @click="handleSaveTemplate">
                            <span v-if="templatesaveconfirmation"> Да </span>
                            <span v-else> Сохранить </span>
                        </v-card>
                    </v-hover>
                    <v-hover v-slot="{ hover }">
                        <v-card class="d-flex ts-btn justify-center align-center" 
                        :color="hover ? '#E0E0E0' : '#FFFFFF'"
                        :elevation="hover ? 6 : 3" 
                        @click="cancelSaveTemplate">
                           <span> Отмена </span>
                        </v-card>
                    </v-hover>
                </div>
            </v-card>
        </v-menu>


        <!-- Подтверждение удаления текущего содержимого шаблона ИЛИ смены шаблона -->
        <v-menu 
        attach="#requirements" 
        absolute
        :close-on-content-click="false" 
        :close-on-click="true"
        :position-x="templateSaveMenuPosition.x"
        :position-y="templateSaveMenuPosition.y"
        v-model="deleteorchangetemplate">   
            <v-card>
                <div class="pa-2 infocard border-radius-5px text-center d-flex flex-column align-center m-text--size14">
                    <span v-if="showchangetemplatewarning"> Переключиться на другой шаблон? </span>
                    <span v-else="!showchangetemplatewarning"> Удалить содержимое текущего шаблона? </span>
                    <div class="px-2 warning-box rounded">
                        <span> Все несохраненные данные будут потеряны. </span>
                    </div>
                    <div class="mt-1 tsconfirmbox filling d-flex flex-row justify-space-around align-center">
                        <v-hover v-slot="{ hover }">
                            <v-card class="ts-btn d-flex justify-center align-center" 
                            :color="hover ? '#E0E0E0' : '#FFFFFF'"
                            :elevation="hover ? 6 : 3" 
                            @click="() => showchangetemplatewarning ? generateCurrentContentFromTemplate(tempid) : deleteCurrentContent()">
                                <span v-if="showchangetemplatewarning"> Сменить </span>
                                <span v-else="!showchangetemplatewarning"> Удалить </span>
                            </v-card>
                        </v-hover>
                        <v-hover v-slot="{ hover }">
                            <v-card class="ts-btn d-flex justify-center align-center" :color="hover ? '#E0E0E0' : '#FFFFFF'"
                                :elevation="hover ? 6 : 3" @click="deleteorchangetemplate = false">
                                <span> Отмена </span>
                            </v-card>
                        </v-hover>
                    </div> 
                </div>
            </v-card>
        </v-menu>

        <!-- Карточка, демонстрирующая содержимое блока при наведении на глаз в библиотеке -->
        <v-menu
        attach="#requirements" 
        absolute
        :close-on-content-click="true" 
        :close-on-click="true"
        :position-x="democard.x"
        :position-y="democard.y"
        v-model="showdemocard">
            <v-card v-if="democard.payload" :elevation="0" style="width: 750px;">
                <BlockContainer 
                :sectionlevel="democard.payload.section_level" 
                :title="democard.payload.title" 
                :content="democard.payload.content"
                :displaystate="{shown: true, folded: false,}" 
                :standard="democard.payload.id !== undefined && democard.payload.id !== '' ">
                </BlockContainer>
            </v-card>
        </v-menu>

        <!-- Меню для редактирования пользовательских элементов -->
        <v-dialog
        width="50vh"
        max-width="80vh"
        persistent
        v-model="showeditmenu">
            <EditMenu 
            :key="editmenukey"
            :propset="editmenuprops"
            @confirm="confirmPropChange($event)"
            @cancel="showeditmenu = false;">
            </EditMenu>
        </v-dialog>

    </v-container>
</template>

<script>

import { Container, Draggable } from "vue-dndrop"
import SectionHeader from './requirements/section_header.vue'
import CodeTable from './requirements/code_table.vue'
import IgnoreMark from './requirements/ignore_mark.vue'
import ObligatoryValue from './requirements/obligatory_value.vue'
import Choice from "./requirements/choice.vue"
import BlockContainer from "./requirements/block_container.vue"
import EditMenu from "./requirements/edit_menu.vue"
import baselibrary from "./requirements/baselibrary.vue"


export default {
    components: {
        SectionHeader,
        CodeTable,
        IgnoreMark,
        ObligatoryValue,
        BlockContainer,
        Choice,
        EditMenu,
        Container,
        Draggable,
    },
    props: {
        // for furure settings
    },
    data() {
        return {
            viewer_style: {},
            currentcontent: [],                 // содержимое отображаемого шаблона в правой колонке
            library: [],                        // библиотека стандартных элементов в левой колонке 
            templates: [],                      // список шаблонов, полученных с сервера
            templatesnamesarray: [],            // список имен шаблонов
            deletion_confirmation_menu: false,
            deleteorchangetemplate: false,
            showchangetemplatewarning: false,
            showeditmenu: false,
            editmenuprops: null,
            showdemocard: false,
            democard: {x:0, y:0, payload: null,},
            hasunsavedchanges: false,
            deletion_info: {index: null, menu_position: {x:0,y:0}, issection: false,},
            project: '',
            showtemplateattachalert: false,
            templateattachalert: '',
            showsavetemplatemenu: false,
            templatename: '',
            templateid: null,
            templatesaveconfirmation: false,
            tempid: null,
            currenttemplate: null,
            currentcontentrect: null,
            editmenukey: 0,                     // keyindex элементы, необходимые для keychange-техники Vue 
            libkeyindex: 0,
            keyindex: 0,
            templatenamewarningkey: 0,
        }
    },
    methods: {
        // Работа с шаблонами
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        initiateDeleteCurrentContent() {
            // вызывает подтверждение удаления currentcontent
            this.showchangetemplatewarning = false
            this.deleteorchangetemplate = true
        },
        deleteCurrentContent() {
            // очищает currentcontent от содержимого
            this.currentcontent = [] 
            this.hasunsavedchanges = true
            this.deleteorchangetemplate = false      
        },
        changeCurrentTemplate(v) {
            // переключает шаблон либо вызывает меню подтверждения, если есть несохраненные данные
            if (!this.hasunsavedchanges) {
                this.generateCurrentContentFromTemplate(v)
                return null
            }
            // не передается аргумент v
            this.tempid = v
            this.showchangetemplatewarning = true
            this.deleteorchangetemplate = true
        },
        associateTemplateWithProject() {
            if (!this.currenttemplate) {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Шаблон не выбран!',
                        message: 'Шаблон не выбран!',
                    })
                return null
            }
            if (!this.project) {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Проект для прикрепления шаблона не выбран!',
                        message: 'Проект для прикрепления шаблона не выбран!',
                    })
                return null
            }
            if (!this.currentcontent.length) {
                this.$notify({
                        group: 'note',
                        type: 'error',
                        text: 'Шаблон пуст. Пустые шаблоны нельзя закреплять за проектами.',
                        message: 'Шаблон пуст. Пустые шаблоны нельзя закреплять за проектами.',
                    })
                return null
            }

            // процедура взята из Edit.vue saveChange() - обновление 'workflow/updateProject' со стороны сервера устроено так, что перезатирает пересылаемые в теле данные
            let type_id = 'c'
            let id = this.$store.state.administration.company.id
            let uuid = this.project
            let projectinfo = this.$store.state.workflow.projects.find(p => p.id === uuid).info
            let body = {
                template_id: this.currenttemplate.id,
                name: projectinfo.name,
                description: projectinfo.description,
                number: projectinfo.number,
                client: projectinfo.client,
                in_charge_id: projectinfo.in_charge_id,
                addition: projectinfo.addition !== null ? projectinfo.addition.map(a => ({
                    name: a.name,
                    value: a.type == 'string'
                        ? a.value
                        : a.type == 'number'
                            ? parseInt(a.value)
                            : {
                                value: a.params.list.find(f => f.value == a.params.value).name,
                                list: a.params.list.map(p => p.name)
                            }
                })) : null,
            }

            // !!! Здесь где-то может быть проблема с addition, т.к. процедура изменена
            console.log(body, projectinfo.addition)
            this.$store.dispatch('workflow/updateProject', {type_id, id, uuid, body})
            .then(res => {
                console.log('updateProject fired and finished', res)
            })

        },
        generateCurrentContentFromTemplate(v) {
            // Вызывается при выборе имени шаблона из списка шаблонов со страницы
            // v - template id in this.templates
            this.currenttemplate = this.templates.find(template => template.id === v)

            let source = this.restoreTemplateFromShipment(this.templates.find(template => template.id === v)) 

            this.templatename = source.templatetitle
            this.templatedid = source.id

            this.deleteorchangetemplate = false
            this.hasunsavedchanges = false

            if (!source.content) {
                console.log('Processing empty template in generateLinearlyStructuredSections - no content')
                this.currentcontent = []
                return null
            }
            let itemsToAdd = this.generateLinearlyStructuredSections(source.content)
    
            for (let item of itemsToAdd) {
                item['displaystate'] = { shown: true, folded: item.section_level === 0 ? false : true }
                }
            this.currentcontent = [...itemsToAdd]
        },

        // Library visual change functions (left field)
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        toggleFoldLibItem(libindex) {
            // libindex - index of the template card in library
            this.library[libindex].folded = !this.library[libindex].folded
            this.libkeyindex++
        },
        updateDemoCard(dr, payload) {
            // i - index of element, dr - DOM rectangle of target, payload - block content 
            this.democard.x = dr.x - this.navigatorTabWidth
            this.democard.y = this.parametersTabHeight + 20 // top + 20px gap 
            this.democard.payload = payload
            this.showdemocard = true 
        },
        hideDemoCard() {
            this.showdemocard = false
        },

        // Drop & Drag functions; current template manipulation
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        getPayloadFromLibrary(v) {
            // v - index of element in library
            return { source: 'library', index: v, }
        },
        getPayloadFromCurrentContent(v) {
            // v - index of element in currentcontent
            return { source: 'currentcontent', index: v, }
        },
        onDrop(dropResult) {

            const { removedIndex, addedIndex, payload, element } = dropResult

            switch (payload.source) {
                case 'library':
                    if (addedIndex !== null) {
                        let itemsToAdd = []

                        for (let elem of this.library[payload.index].content) {
                            if (elem.id === undefined || elem.id === '' || !(this.currentcontent.find(obj => obj.id === elem.id))) { 
                                // standard components can't be duplicated
                                let clone = JSON.parse(JSON.stringify(elem)) // !!! deep clone crutch, ineffective, maybe add lodash instead
                                itemsToAdd.push(clone)
                            }
                        }     

                        let newIndex = getAvaliableDropIndex(addedIndex, containslvl0section(itemsToAdd), this.getSectionIndexRangeData).index  
                        for (let item of itemsToAdd) {
                            item['displaystate'] = { shown: true, folded: item.section_level === 0 ? false : true }
                        }
                        this.currentcontent.splice(newIndex, 0, ...itemsToAdd)
                    }
                    break
                case 'currentcontent':
                    if (removedIndex === null && addedIndex === null) { return null }
                    let itemsToAdd = null
                    if (removedIndex !== null) {
                        itemsToAdd = this.currentcontent.splice(removedIndex, 1)[0]
                    }
                    if (addedIndex !== null) {
                        let newIndex = getAvaliableDropIndex(addedIndex, containslvl0section([itemsToAdd]), this.getSectionIndexRangeData).index
                        this.currentcontent.splice(newIndex, 0, itemsToAdd)
                    }
                    break            
            }

            this.forceRerenderDraggables()
            this.hasunsavedchanges = true
            
            function getAvaliableDropIndex(indx,containslvl0,sectonarray) {
                // использует getSectionIndexRangeData; возвращает объект {index, folded, standard}
                let folded = false
                let standard = false
                for (let section of sectonarray) {
                    folded = section.folded
                    standard = section.standard
                    if (section.start < indx && indx <= section.end && (section.folded || (section.standard && containslvl0 ))) {
                        indx = section.end + 1
                        break
                    }
                }
                return {index: indx, folded: folded, standard: standard}
            }
            function containslvl0section (template) {
                let verdict = false
                for (let block of template) {
                    if (block.section_level === 0) { 
                        verdict = true
                        break
                     }
                }
                return verdict
            }
        },

        // template shipment, conversion and unzipping
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        saveTemplate() {
            // Вызывает меню сохранения; процедура записи выполняется по confirmSaveTemplate
            this.showsavetemplatemenu = true
            console.log('templatename',this.templatename)
        },
        handleSaveTemplate() {
            // 
            this.$refs['templateNameInput'].blur()
            this.$nextTick(() => {
                if (this.templatesnamesarray.includes(this.templatename) && !this.templatesaveconfirmation) {
                    this.templatesaveconfirmation = true
                } else if (!this.templatename) {
                    console.log('Имя шаблона не выбрано!') // диалог сохранения не должен допускать попадания сюда
                    return null
                }
                else { 
                    this.confirmSaveTemplate()
                    this.hasunsavedchanges = false
                }
            })
        },
        cancelSaveTemplate() {
            this.showsavetemplatemenu = false
            this.templatesaveconfirmation = false
        },
        handleTemplateNameChange() {
            // выключает плашку с предупреждением о том, что такое имя уже существует, при изменении имени шаблона
            this.templatesaveconfirmation = false
            this.templatenamewarningkey++
        },
        confirmSaveTemplate() {
            // !!! нужна отдельная процедура переименования шаблона; процедура удаления шаблона
            // сохраняет шаблон и делает запрос сохранения к облачному сервису 
            let name = this.templatename
            let tplt = this.templates.find(obj => obj.templatetitle === name) || {}
            let namealreadyexists = this.templatesnamesarray.includes(name)
            let id = tplt.id || null

            let template = {
                templatetitle: name,
                content: this.generateTemplateFromCurrentContent(this.currentcontent)
            }
            if (id && namealreadyexists) {
                template.id = id
            }
            
            
            this.showsavetemplatemenu = false
            this.templatesaveconfirmation = false

            template = this.prepareTemplateForShipment(template)

            this.$store.dispatch('administration/saveTemplate', template)
            .then(res => { this.getAllTemplatesFromCloud(); return res})
            .then(res => {
                this.currenttemplate = this.templates.find(template => template.id === res.id) 
                this.$refs['templateselector'].$forceUpdate()
                return res
            }).then(res => { console.log('Template saved', res); return res })
        },
        prepareTemplateForShipment(template) {
            // фильтрует хранящиеся в baselibrary статические данные из передаваемого на сервер контента для уменьшения объема данных
            let shipment = {}
            shipment.templatetitle = template.templatetitle
            shipment.id = template.id
            shipment.content = prepareContent(template.content)
            
            console.log('packed template', JSON.stringify(shipment))

            function prepareContent(cont) {
                if (!cont) { return [] }
                // перебирает контент (поле .content) каждого логического блока и готовит его к отправке
                // нестандартные блоки хранятся полностью, т.к. пользователь может менять в них те данные, которые всегда одинаковы в стандартных элементах
                let res = []

                // обработка блоков с текущего уровня
                for (let block of cont) {

                    let pack = {}
                    let std = block.id !== undefined && block.id !== ''

                    pack.title = block.title 
                    if (std) { 
                        pack.id = block.id

                        // пакуем элементы блока
                        let compressedelements = []
                        for (let elem of block.elements) {
                            let newelem = {}

                            newelem.typeofelement = elem.typeofelement
                            if (newelem.typeofelement) { newelem.props = {} }
                            switch (elem.typeofelement) {
                                // из стандартных блоков передаются только изменяемые пользователем данные для экономии
                                case 'SectionHeader': {
                                    newelem.props.checked = elem.props.checked
                                    break
                                }
                                case 'IgnoreMark': {
                                    newelem.props.checked = elem.props.checked
                                    break
                                }
                                case 'CodeTable': {
                                    newelem.props.tablecontent = elem.props.tablecontent
                                    break
                                }
                                case 'ObligatoryValue': {
                                    newelem.props.checked = elem.props.checked
                                    newelem.props.hastype = elem.props.hastype
                                    newelem.props.valueexpression = elem.props.valueexpression
                                    newelem.props.namingtype = elem.props.namingtype
                                    break
                                }
                                case 'TextArea': {
                                    newelem.props.textcontent = elem.props.textcontent
                                    break
                                } 
                                case 'Choice': {
                                    console.log('uppies', elem.props , 'choice', elem.props.choices)
                                    newelem.props.choices = elem.props.choices
                                    break
                                }
                                default: {
                                    // срабатывает на элементы стандартных секций уровня 0
                                    console.log('Standard element from content was not recognized in', block, elem)
                                }
                            }
                            compressedelements.push(newelem) 
                        }
                        pack.elements = compressedelements 
                        
                    }
                    else {
                        // нестандартный блок - массив элементов сохраняется полностью
                        pack.elements = block.elements                        
                    }
                    // следующая рекурсивная итерация для вложенного контента
                    pack.content = prepareContent(block.content)
                    res.push(pack)
                }
                return res
            }

        return shipment 
        },
        restoreTemplateFromShipment(shipment) {
            // shipment - присылаемый сервисом JSON c сохраненными данными шаблона
            let ship = shipment
            let basesource = baselibrary.data().baselibrary // источник стандартных данных; хранится в отдельном файле.

            let sections = [] // набор id стандартных секций - для проверок
            for (let s of basesource) {
                if (s.content[0].id !== undefined && s.content[0].id !== '') {sections.push( s.content[0].id )} // ['levels', 'tsm']
            }
            
            let result = {}

            result.templatetitle = ship.templatetitle
            result.id = ship.id

            result.content = restoreStandardContent(ship.content) 

            function restoreStandardContent(cont) {
                if (!cont) { return [] }
                let restored = [] 

                for (let block of cont) {
                    let newblock = {}
                    let stdsectionid = null
                    
                    newblock.title = block.title
                    newblock.elements = []
                    
                    let std = block.id !== undefined && block.id !== ''
                    let issection = false
                    if (std) { 
                        newblock.id = block.id
                        issection = sections.includes(block.id)
                        stdsectionid = block.id.split('.',1)[0]
                        // определяет id стандартной секции, к которой принадлежит блок (даже если это сама секция) 
                    }

                    // находим в библиотеке секцию-референс
                    let erzatzsection = null
                    for (let s of basesource) {
                        if (s.content.filter(sect => sect.id === stdsectionid).length) {
                            erzatzsection = s.content.filter(sect => sect.id === stdsectionid)[0]
                            break
                        }
                    }

                    if (issection) {
                        // если секция, берем из библиотеки секцию-референс и копируем оттуда elements; они хранятся только в коде страницы
                        newblock.elements = erzatzsection.elements
                    }

                    if (std && !issection) {
                        //если стандартный блок с элементами, но не секция
                        let blockfromlibrary = erzatzsection.content.filter(bl => bl.id === block.id)[0]
                        
                        let elemindex = 0
                        for (let elem of block.elements) {
                            
                            let newelem = {} 
                            newelem.typeofelement = elem.typeofelement 
                            newelem.props = {}
                            switch (elem.typeofelement) {
                                case 'SectionHeader': {
                                    newelem.props.checked = elem.props.checked || false
                                    // обращаемся в референс-элемент по индексу блока и берем информацию о checked из его пропов
                                    newelem.props.title = blockfromlibrary.elements[elemindex].props.title 
                                    newelem.props.description = blockfromlibrary.elements[elemindex].props.description
                                    break
                                }
                                case 'IgnoreMark': {
                                    newelem.props.checked = elem.props.checked || false
                                    newelem.props.description = blockfromlibrary.elements[elemindex].props.description
                                    break
                                }
                                case 'CodeTable': {
                                    newelem.props.tablecontent = elem.props.tablecontent || []
                                    newelem.props.headers = blockfromlibrary.elements[elemindex].props.headers
                                    break
                                }
                                case 'ObligatoryValue': {
                                    // безусловно копируем интерактивные поля из пришедшего объекта
                                    newelem.props.checked = elem.props.checked || false
                                    newelem.props.valueexpression = elem.props.valueexpression || ''
                                    newelem.props.namingtype = elem.props.namingtype || ''
                                    newelem.props.hastype = elem.props.hastype || false
                                    // далее добавляем стандартные описания
                                    newelem.props.headerleft = blockfromlibrary.elements[elemindex].props.headerleft
                                    newelem.props.headerright = blockfromlibrary.elements[elemindex].props.headerright
                                    newelem.props.commentleft = blockfromlibrary.elements[elemindex].props.commentleft
                                    newelem.props.commentrightright = blockfromlibrary.elements[elemindex].props.commentright
                                    break
                                }
                                case 'TextArea': {
                                    newelem.props.textcontent = blockfromlibrary.elements[elemindex].props.textcontent || ''
                                    break
                                } 
                                case 'Choice': {
                                    newelem.props.choices = elem.props.choices || []
                                    // референтные данные
                                    newelem.props.mutuallyexsclusive = blockfromlibrary.elements[elemindex].props.mutuallyexsclusive
                                    newelem.props.textelements = blockfromlibrary.elements[elemindex].props.textelements
                                    newelem.props.description = blockfromlibrary.elements[elemindex].props.description
                                    break
                                }
                                default: {
                                    console.log('Standard element from content was not recognized when restoring standard content from loaded template in', block, elem)
                                }
                            }
                            newblock.elements.push(newelem) // забрасываем новый элемент в массив элементов
                            elemindex++
                        }
                    }
                    else if (!std && !issection) {
                        //для нестандартных блоков просто копируем elements
                        newblock.elements = block.elements 
                    }

                    // добавляем content
                    newblock.content = restoreStandardContent(block.content)
                    
                    // в этой точке есть полностью сформированный блок, который нужно добавить в restored
                    restored.push(newblock)
                }

                return restored
            }
            
            return result
        },
        generateLinearlyStructuredSections(sectionsarray) {
            // генерирует линейную структуру для отображения в currentcontent из древесной секционной
            let cardblocks = []
                // пустое имя секции / блока означает, что блок уровня секции/подсекции добавлять не нужно; используется для создания блоков уровня 1,2 без родительской секции  
                for (let section of sectionsarray) {
                    if ( section.title !== '' ) {cardblocks.push({ section_level: 0, id: section.id, title: section.title, content: section.elements })}
                    if (section.content === undefined) { continue } 
                    for (let block of section.content) {
                        if (block.title !== '') {cardblocks.push({ section_level: 1, id: block.id, title: block.title, content: block.elements })}
                        if (block.content === undefined) { continue }
                        for (let sub of block.content) {
                            cardblocks.push({ section_level: 2, id: sub.id, title: sub.title, content: sub.elements })
                        }
                    }
                }
            return cardblocks
        },
        generateTemplateFromCurrentContent(CC) {
            // формирует древовидную структуру для хранения из currentcontent
            // CC - this.currentcontent, array of objects (blocks)
            let sc = 0 // section counter, block counter
            let bc = 0

            let tmplt = [] // consult requirements/baselibrary.vue for details of template format 

            for (let c of CC) {

                switch (c.section_level) {
                    //sections
                    case 0: {
                        if (tmplt.length === 0) {sc--} // if the first block encountered is section, shift is not needed
                        sc++
                        bc = 0

                        tmplt.push({
                            title: c.title,
                            id: c.id,
                            content: [],
                            elements: c.content 
                        })
                        break
                    }
                    // blocks
                    case 1: {
                        if (tmplt[sc] === undefined) {
                            tmplt[sc] = {title: '', id: '', content: []} 
                        }
                        tmplt[sc].content.push(
                            {
                                title: c.title,
                                id: c.id,
                                content: [],
                                elements: c.content,
                            }
                        )
                        bc++
                        break
                    }
                    // subblocks
                    case 2: { 
                        if (tmplt[sc] === undefined) { 
                            tmplt[sc] = {title: '', id: '', content: []} 
                        }
                        if (tmplt[sc].content[bc] === undefined) { tmplt[sc].content[bc] = {title: '', id: '', content: []} }
                        tmplt[sc].content[bc].content.push(
                            {
                                title: c.title,
                                id: c.id,
                                elements: c.content,
                            }
                        )
                        break
                    }
                }
            }

            return tmplt

        },

        // Реактивные операции с текущим шаблоном
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        deleteBlockFromCurrentContentByIndex(ev, v, sl) {
            // ev - coordinates of btn pressed, {x:'x',y:'y'}; v - index of block in currentcontent, number; sl - section_level
                this.deletion_info.menu_position.x = ev.x
                this.deletion_info.menu_position.y = ev.y
                this.deletion_info.index = v
                this.deletion_info.issection = (sl === 0)
                this.deletion_confirmation_menu = true
        },
        confirmDeleteHandler() {
            this.confirmDelete()
            this.hasunsavedchanges
            this.forceRerenderDraggables() // не дупликат, требуется для корректной работы. Что-то опять с отрисовкой.
        },
        confirmDelete() {
            // удаляет блок из currentcontent
            if (this.deletion_info.index !== null) {

                let sectinfo = this.getSectionIndexRangeData.filter(obj => obj.start === this.deletion_info.index)
                if (sectinfo.length) {
                    for (let i = sectinfo[0].start; i <= sectinfo[0].end; i++) {
                        this.currentcontent[i].displaystate.shown = true

                    } 
                    let num = sectinfo[0].end - sectinfo[0].start + 1
                    this.currentcontent.splice(this.deletion_info.index, num)
                }
                else {
                    this.currentcontent.splice(this.deletion_info.index,1)    
                }
                
            }
            this.hasunsavedchanges = true
            this.forceRerenderDraggables() // не дупликат, требуется для корректной работы. Что-то опять с отрисовкой.
        },
        cancelDelete() {
            this.deletion_info.index = null
        },
        updateBlockDisplayStateByIndex(ev,v) {
            // ev - new state object {shown, folded}; v - index of block in currentcontent, number;
            // обновляет все блоки при сворачивании секции верхнего уровня (section_level 0)
            let clone = Object.assign({}, ev) // !!! shallow clone, future problems are possible if event structure is changed
            this.currentcontent[v].displaystate = clone 
            
            if (this.currentcontent[v].section_level === 0) {
                
                let visible = true
                for (let elem of this.currentcontent) {
                    if (elem.section_level === 0 ) {
                        visible = !elem.displaystate.folded
                    }
                    else {
                        elem.displaystate.shown = visible
                    }
                }
            }
            this.forceRerenderDraggables()
        },
        updatedatav2(ev, indx) {
            // Обновляет состояние элемента или вызывает меню редактирования элемента.
            // ev - данные для обновления элемента, {"type","prop","value","elementindex","needsmenu"}; indx - индекс блока с обновляемым элементом
        
            if(ev.needsmenu) {
                this.editmenuprops = Object.assign({}, ev)
                this.editmenuprops['blockindex'] = indx
                this.editmenukey++
                this.showeditmenu = true
                return null
            }
            
            if (this.currentcontent[indx].content[ev.elementindex].props[ev.prop] !== undefined) {
                this.currentcontent[indx].content[ev.elementindex].props[ev.prop] = ev.value
            }
            else {
                alert('Ошибка при обновлении данных элемента - элемент не найден.') //!!! переделать в диалог!
            }
        },
        updateBlockDataByIndex(ev, v) {
            // ev - event {elementindex(in block), propdata(object)}, v - index of element in currentcontent
            let clone = Object.assign({}, ev.propdata) // !!! shallow clone, future problems are possible if event structure is changed
            this.currentcontent[v].content[ev.elementindex] = clone
            this.hasunsavedchanges = true
        },
        checkIfDragIsForbiddenForElement(index) {
            // выдает разрешение или запрет на перетаскивание элемента; используется в drag-not-allowed
            let elem = this.currentcontent[index]
            if (elem.section_level=== 0 && elem.displaystate.folded === true) {
                return true
            }
            if (elem.hasOwnProperty('id') && elem.id !== '') {
                return true
            }
            return false
        },
        confirmPropChange(ev) {
            // ev - объект события {"type","prop","value","elementindex","needsmenu","blockindex"}
            this.showeditmenu = false
            if (this.currentcontent[ev.blockindex].content[ev.elementindex].props[ev.prop] !== undefined) {
                this.currentcontent[ev.blockindex].content[ev.elementindex].props[ev.prop] = ev.value
                this.forceRerenderDraggables()
            }
            else {
                alert('Ошибка при обновлении данных элемента - элемент не найден.') //!!! переделать в диалог!
            }
        },
        

        // Работа с библиотекой - получение стандартных данных
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        getBaseLibrary() {
            // creates a linear data model for display from baselibrary
            let lib = []
            let source = baselibrary.data().baselibrary
            for (let template of source) {
                let temp = { title: template.templatetitle, id: template.id, folded: true, }
                temp['content'] = this.generateLinearlyStructuredSections(template.content)
                lib.push(temp)
            }
            return lib
        },

        // Работа с сервисом сохранения шаблонов
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        getAllTemplatesFromCloud() {
            // получает список шаблонов с сервиса и записывает его в this.templates
            this.$store.dispatch('administration/getTemplates')
            .then(res => { 
                this.templates = res || []
                console.log('recieved templates are ', res) 
                if (res) {
                    this.templatesnamesarray = []
                    for (let el of res) {
                        this.templatesnamesarray.push(el.templatetitle)
                    } 
                }
                // console.log('names', this.templatesnamesarray)
            })
        },

        // Vue-техника для принудительной отрисовки элементов в списке; последствия использования вложенных данных в объектах
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        forceRerenderDraggables() {
            // keychanging technique no jutsu
            this.keyindex++
        },

        // только для тестов 
        // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        showcurrentcontent() {
            // только для тестов
            console.log(this.currentcontent)
        },
        callconsole(v) {
            console.log(v)
        }
    },
    computed: {
        parametersTabHeight() {
            return document.getElementsByTagName('header')[0].getBoundingClientRect().height
        },
        navigatorTabWidth() {
            return document.getElementsByClassName('m-navigator')[0].getBoundingClientRect().width
        },
        templateSaveMenuPosition() {
            if (!this.currentcontentrect) {return {x:0,y:0}}
            let rect = this.currentcontentrect
            let xx = rect.left //+ 0.5*rect.width - 140 // 140 - половина ширины карточки меню сохранения
            let yy = rect.top + 30
            return {x: xx, y: yy}
        },
        getIndexMappingForData() {
            // создает список индексов с учетом уровня вложенности для currentcontent
            let data = this.currentcontent.slice()
            let countstorage = [0,]
            let lastsectionindex = 0
            let indexarray = []

            for (let element of data) {

                var l = element.section_level
                var index = ''

                if (!l) {
                    countstorage = [countstorage[0]]
                }
                if (l <= lastsectionindex) {
                    countstorage[l] = countstorage[l] + 1
                }
                else {
                    countstorage[l] = 1
                }
                for (let i = 0; i <= l; i++) {
                    if (!countstorage[i]) { countstorage[i] = 1 }
                    index = (index ? index + '.' : '') + countstorage[i]
                }
                indexarray.push(index)
                lastsectionindex = l
            }
            return indexarray
        }, 
        getSectionIndexRangeData() {
            // создает список секций с областями принадлежащих им индексов для currentcontent
            let content = this.currentcontent
            let start = 0
            let end = 0
            let folded = false
            let standard = false
            let currentindex = 0 
            let notfirstsection = false
            let sections = []

            for (let block of content) {
                if (block.section_level !== 0) {
                    currentindex++
                    continue
                }
                // не первая встреченная секция
                if (notfirstsection) {
                    end = currentindex-1
                    sections.push({start: start, end:end, folded: folded, standard: standard })
                }
                // первая встреченная секция - нет закрывающего индекса, только стартовый  
                notfirstsection = true
                start = currentindex 
                folded = block.displaystate.folded
                standard = (block.id !== undefined && block.id !== '')

                currentindex++
                continue
            }
            // закрываем последнюю секцию 
            end = currentindex-1
            sections.push({start: start, end:end, folded: folded, standard: standard })

            return sections
        },
        projects(){
            return this.$store.state.workflow.projects.map(p => {
                return {
                    id: p.id,
                    name: p.info.name
                }
            })
        },
        cloudtemplates() {

        },
    },
    beforeUpdate() {
    },
    mounted(){
        this.library = this.getBaseLibrary()
        this.$nextTick(() => {
            this.viewer_style = {
                height: 'calc(100vh - ' + (this.parametersTabHeight+8) + 'px)',
                top: this.parametersTabHeight,
                left: this.navigatorTabWidth,
            }
            this.currentcontentrect = document.getElementById('currentcontent').getBoundingClientRect()
            
            this.getAllTemplatesFromCloud()
        }) 
    },
}
</script>

<style scoped>

/* Общие классы и параметры */
.common-text {
    font-family: Roboto;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    text-align: left;
    color: #2c2c2c !important;
}

.filling {
    width: 100%;
    height: fit-content;
    padding: 0.5rem;
}

.rq-no-letter-spacing {
    letter-spacing: 0;
}

/* Левая колонка - библиотека шаблонов и ее элементы */
.leftcolumnwidth {
    width: 370px;
}

.libraryheader  {
    position: sticky;
    top: 0;
    height: 3.5rem;
    min-height: 3.5rem;
    border-bottom: solid 2px #89909d;
    z-index: 2;
}

.templatelibrary {
    height: 100%;
    width: 370px;
    max-height: 744px;
    max-width: 370px;
}

.save-buttons {
    position: sticky;
    background-color: white;
    border-top: solid 2px #89909d;
    bottom: 0;
    height: 3.5rem;
    min-height: 3.5rem;
    max-height: 3.5rem;
}

/* Правая колонка - currentcontent */
.rightcolumnwidth {
    width: 1080px;
}
.currentcontent {
    height: 100%;
    max-height: 744px;
    overflow: auto;
}

.contentcontainer {
    height: 100%;
    width: 100%;
}

/* Меню и подтверждения */
.deletecardconfirmation {
    max-width: 200px;
}

.infocard {
    max-width: 280px;
    min-width: 280px;
    min-height: 6rem;
}

.warning-box {
    text-align: center;
    background-color: wheat;
    transition: background-color 1s;
}

.tsconfirmbox {
    min-height: 3rem; 
    box-sizing: border-box;
}

.ts-btn {
    width: 100px; 
    height: 1.5rem; 
    border: solid 1px gray !important;
}

.confirm-btn {
    height: 1.5rem;
    max-width: 60px;
    width: 60px;
    border-radius: 5px;
}

/* utility - служат для изменения единственного параметра */
.gap {
    gap: 1.5rem;
}

.hgap {
    gap: 2rem;
}

.background-wheat {
    background-color: wheat;
}

.no-uppercase {
    text-transform: none !important;
}

.position-absolute {
    position: absolute;
}

.width-100pc {
    width: 100%;
}

.border-radius-5px {
    border-radius: 5px;
}

.position-relative {
    position: relative;
}

.rotated {
    transform: rotate(90deg);
}

.lib-eye {
    visibility: hidden;
}

.lib-infomodel:hover .lib-eye  {
    visibility: visible;
}

.bold {
    font-weight: 500;
}

</style>