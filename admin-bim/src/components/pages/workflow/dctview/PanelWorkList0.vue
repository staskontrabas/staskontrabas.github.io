<template>
    <v-card
        class="m-card-scrollable m-work-list"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Список работ
            <v-spacer></v-spacer>
            <v-btn
                text
                icon
                @click="minimize = !minimize"
                color="#7f7f7f">
                <v-icon size="20">
                    {{!minimize ? 'mdi-window-minimize' : 'mdi-window-maximize'}}
                </v-icon>
            </v-btn>
            <v-btn
                text
                icon
                @click="cancel"
                color="#7f7f7f">
                <v-icon size="20">close</v-icon>
            </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-title class="py-1 px-0">
            <div class="pr-0 pl-3 py-1 m-panel__collision--options">

                <icon-botton
                    class="mr-2"
                    :color="selectMode && !checkSelected.auto ? 'primary' : 'default'"
                    :disabled="!checkSelected.work || checkSelected.auto"
                    @onClick="onSetSelectionMode"
                    >mdi-plus-circle-outline
                </icon-botton>

                <icon-botton
                    class="mr-3"
                    :color="1 != 1 ? 'primary' : 'default'"
                    :disabled="!checkSelected.elem"
                    @onClick="removeElement"
                    >mdi-trash-can-outline
                </icon-botton>

                <icon-botton
                    class="mr-4"
                    :color="showMode == 'showOnly' ? 'primary' : 'default'"
                    :disabled="checkSelected.auto"
                    @onClick="turnShowMode('showOnly')"
                    >trd-cube_hide
                </icon-botton>

                <icon-botton
                    class="mr-4"
                    :color="showMode == 'showColor' ? 'primary' : 'default'"
                    :disabled="checkSelected.auto"
                    @onClick="turnShowMode('showColor')"
                    >trd-cube_show
                </icon-botton>

                <icon-botton
                    class="mr-4"
                    :color="showMode == 'showAuto' ? 'primary' : 'default'"
                    :disabled="!checkSelected.some"
                    @onClick="turnShowMode('showAuto')"
                    >trd-calendar-range
                </icon-botton>

                <v-spacer></v-spacer>
            </div>
        </v-card-title>

        <v-divider class="pb-2"></v-divider>

        <v-card-text
            class="pa-0 pb-5 m-card-scrollable__text">

            <v-skeleton-loader
                v-show="!load"
                type="list-item-three-line, list-item-three-line"
            ></v-skeleton-loader>

            <div v-show="!!error" class="pl-4">
                {{error}}
            </div>

            <v-alert
                v-show="load"
                outlined
                type="warning"
                prominent
                border="left"
                class="m-alert mx-3 m-text--size12 py-1"
            >Для того, чтобы выбрать несколько объектов, зажмите Ctrl + левую кнопку мыши или OPTION + левую кнопку мыши
            </v-alert>

            <v-treeview
                :key="treeKey"
                :active.sync="selected"
                :open.sync="opened"
                :items="works"
                class="m-worllist m-panel__collision--tree m-text--size12"
                dense
                activatable
                return-object
                expand-icon="mdi-chevron-down"
                transition
                item-key="id"
                @update:active="onSelect"
                >
                <template v-slot:label="{item, index}">
                    <div
                        v-if="item.type == 'work'"
                        class="pl-1 mb-1"
                        :style="item.border"
                        >
                        <div>
                            <span class="code-job">
                                {{item.parent_id + ' ' + item.schedule_id}}
                            </span>
                            {{item.name}}
                        </div>
                        <v-row class="m-date ma-0">
                            <v-col>
                                <v-icon
                                    size="14">
                                    trd-play
                                </v-icon>
                                {{transDate(item.cdate)}}</v-col>
                            <v-col>
                                <v-icon
                                    size="14">
                                    trd-play-track-next
                                </v-icon>
                                {{transDate(item.edate)}}</v-col>
                            <v-col>
                                <v-icon
                                    size="20">
                                    mdi-clock-outline
                                </v-icon>
                                {{item.days}}
                            </v-col>
                            <v-col class="mr-3">
                                <v-icon
                                    size="14">
                                    trd-construct
                                </v-icon>
                                {{item.volume_actual + ' ' + job_unit[item.job_unit]}}
                            </v-col>
                        </v-row>
                    </div>
                    <div v-else-if="item.type == 'remove'">
                        <span @click.stop="removeAll(item)" class="m-link">
                            Удалить все
                        </span>
                    </div>
                    <div v-else-if="item.type == 'elem'">
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <span
                                    role="empty"
                                    v-bind="attrs"
                                    v-on="on">
                                    {{item.name + ' | ' + item.id}}
                                </span>
                            </template>
                            {{item.name + ' | ' + item.id}}
                        </v-tooltip>
                    </div>
                    <div v-else>
                        {{item.name}}
                    </div>
                </template>
            </v-treeview>
        </v-card-text>
    </v-card>
</template>

<script>
import IconBotton from '@/components/custom/IconBotton'

export default {
    name: 'WorkList',
    props: ['menuItem', 'styleP', 'model', 'selectedObjID', 'selectedObjIDList', 'propertyJson', 'source'],
    components: {
        IconBotton
    },
    data(){
        return {
            minimize: false,
            items: [],
            treeKey: 0,
            opened: [],
            selected: [],
            selectedItem: null,
            colorStatus: ['0', '#ff5338', '#ffbf00', '#2ac279', '#8c95a9'],
            works: [],
            type_id: {
                'IFC': 'Guid',
                'Revit': 'Id'
            },
            job_unit: {
                cubic_meter: 'м.куб.',
                ton: 'т',
                square_meter: 'м.кв.',
                piece: 'ед',
                linear_meter: 'п.м',
                meter: 'м',
                percent: '%',
                centimeter: 'см',
                millimeter: 'мм',
                square_centimeter: 'см2',
                cubic_centimeter: 'см3',
                liter: 'л',
                milliliter: 'мл',
                gram: 'г',
                kilogram_per_cubic_meter: 'кг/м3',
                gram_per_cubic_centimeter: 'г/см3',
                megapascal: 'МПа',
                pascal: 'Па',
                kilometer: 'км',
                hectare: 'га',
                ar: 'а',
                kilogram: 'кг',
                kit: 'компл'
            },
            selectMode: false,
            showMode: false,
            load: false,
            error: false
        }
    },
    computed: {
        checkSelected(){
            let group = false
            let work = false
            let elem = false
            let auto = this.showMode == 'showAuto'
            let some = true //false

            if(this.selected.length){
                 group = this.selected.some(s => s.type == 'group')
                 work = this.selected.some(s => s.type == 'work')
                 elem = this.selected.some(s => s.type == 'elem')
            }

            return {
                group, work, elem, auto, some
            }
        },
        getItems(){
            console.log('computed', this.works)
            let list = []
            if(this.works !== null){
                list = this.works
            }
            return list
        }
    },
    watch: {
        menuItem: {
            handler(v){
                if(v.active){
                    this.load = false
                    this.$store.dispatch('workflow/getWorkList_', {file: this.model.id, bearer: this.bearer})
                    .then(res => {
                        let elems = res.result.schedule
                        this.items = elems
                        this.works = this.buildTree(this.items, 0)
                        this.load = true
                    })
                    .catch(er => {
                        this.works = null
                        this.load = true
                    })
                }
                else{
                    this.turnShowMode(false)
                    if(this.selectMode){
                        this.selectMode = false
                        this.$emit('onSetSelectionMode', false)
                    }
                }
            },
            deep: true
        },
        showMode(n, o){
            if(!n){
                this.onAction(o, false)
            }
            else{
                this.onAction(o, false)
                this.onAction(n, true)
            }
        },
        selectedObjID(v){
            if(v){
                this.selectedItem = [v]
            }
        },
        selectedObjIDList(v){
            if(v != null){
                this.selectedItem = v
            }
        },
        selectedItem(v){
            this.getElement(v)
        }
    },
    methods: {
        buildTree(elems, pid, path = []){
            // console.log('buildTree', elems)
            let list = elems
                .filter(f => f.parent_id == pid)
                .map(e => {
                    if(!e.job){
                        e.id = 'g' + e.schedule_id
                        e.type = 'group'
                        e.groupid = pid
                        e.children = this.buildTree(elems, e.schedule_id, [...path, e.schedule_id])
                    }
                    else{
                        e.id = 'w' + e.schedule_id
                        e.task_id = e.schedule_id
                        e.path = path
                        e.name = e.name || '...'
                        e.name_init = e.name
                        e.type = 'work'
                        e.groupid = pid
                        e.cdate = e.date_start
                        e.edate = e.date_finish
                        e.days = e.date_interval_day
                        e.border = {
                            'border-left': '4px solid ' + this.colorStatus[e.status]
                        }
                        e.color = this.colorStatus[e.status]
                        e.children = []
                        if(e.external_data != null && e.external_data.elemsid){
                            let list = JSON.parse(e.external_data.elemsid)

                            if(typeof list == "string"){
                                list = JSON.parse(list)
                            }
                            if(!Array.isArray(list)){
                                list = []
                            }
                            if(list.length){
                                e.children = [{
                                    id: 'remove' + e.id,
                                    workid: e.id,
                                    task_id: e.task_id,
                                    groupid: pid,
                                    type: 'remove',
                                    children: []
                                }]
                            }
                            e.children = [...e.children, ...list.map(i => {
                                let elem = this.propertyJson.find(f => f[this.type_id[this.source]] == i)
                                return {
                                    id: e.id + '_' + i,
                                    type: 'elem',
                                    name: elem ? elem.Name : '----',
                                    parent: 'w' + e.task_id,
                                    task_id: e.task_id,
                                    groupid: pid,
                                    color: this.colorStatus[e.status],
                                    children: []
                                }
                            })]
                        }
                        if(e.children.length){
                            e.name = e.name + ' (' + (e.children.length - 1) + ')'
                        }
                    }
                    return e
                })
            return list
        },
        onSelect(){
            if(this.checkSelected.auto){
                return
            }
            else{
                this.onAction()
            }
        },
        onAction(mode = null, value = true){
            mode = mode === null
                ? this.showMode
                : mode
            switch(mode){
                case 'showOnly': this.onShowObjectsOnly(value)
                    break
                case 'showColor': (value
                        ? this.onSetColorForObjects()
                        : this.onUnsetColorsForObjects()
                    )
                    break
                case 'showAuto': (value
                        ? this.onSetColorAuto()
                        : this.onUnsetColorsForObjects()
                    )
                    break
                default: ;
            }
        },
        turnShowMode(v){
            if(this.showMode == v){
                this.showMode = false
            }
            else{
                this.showMode = v
            }
        },
        cancel(){
            this.selectMode = false
            this.$emit('onSetSelectionMode', false)
            this.$emit('setOption', this.menuItem)
        },
        updateTree(item, elems){
            const getList = (children, item, ind, elems) => {
                console.log('getlist ', item)
                let list = []
                list = children.map(i => {
                    if(i.schedule_id == item.path[ind]){
                        console.log('ok ok ok 1')
                        // i.name = i.name + '-------!!!' + ind
                        if(ind + 1 == item.path.length){
                            console.log('ok ok ok 2')
                            i.children = i.children.map(w => {
                                // w.name = w.name + '++++'
                                if(w.id == item.id){
                                    console.log('ok ok ok elems 3', w,elems)
                                    w.children = [...w.children, ...elems]
                                    w.name = w.name_init + ' (' + (w.children.length - 1) + ')'

                                        console.log('ok ok ok title 4', w.name, w.title)
                                    // w.children = item.children
                                    // w.count = w.children.length
                                }
                                return w
                            })
                        }
                        else{
                            i.children = getList(i.children, item, (ind + 1), elems)
                        }
                    }
                    return i
                })
                return list
            }
            this.works = this.works.map(i => {
                if(i.schedule_id == item.path[0]){
                    // i.name = 'wwwwwwwwwwwww'
                    i.children = getList(i.children, item, 1, elems)
                }
                return i
            })
        },
        getElement(selectedItem){
            if(this.selected.length && selectedItem.length && !this.checkSelected.auto && this.selectMode){
    // console.log('gggg',select)
                let work = this.selected[0]
                if(work.type == 'work'){
                    selectedItem.map(s => {
                        let e = this.propertyJson.find(f => f[this.type_id[this.source]] == s)
                        if(e){
                            let item = work.children.find(f => f.id == e[this.type_id[this.source]])
                            if(!item){
                                let elem = []
                                if(!work.children.length){
                                    elem = [{
                                        id: 'remove' + work.id,
                                        workid: work.id,
                                        task_id: work.task_id,
                                        groupid: work.groupid,
                                        type: 'remove',
                                    }]
                                    // work.children.push({
                                    //     id: 'remove' + work.id,
                                    //     workid: work.id,
                                    //     task_id: work.task_id,
                                    //     groupid: work.groupid,
                                    //     type: 'remove',
                                    // })
                                }
                    console.log('>>>>work', work)
                                elem.push({
                                    id: work.id + '_' + e[this.type_id[this.source]],
                                    elemid: e[this.type_id[this.source]],
                                    type: 'elem',
                                    name: e.Name || '----',
                                    parent: 'w' + work.task_id,
                                    task_id: work.task_id,
                                    group: work.groupid,
                                    color: this.colorStatus[work.status]
                                })
                                // work.children.push({
                                //     id: e[this.type_id[this.source]],
                                //     type: 'elem',
                                //     name: e.Name || '----',
                                //     parent: 'w' + work.task_id,
                                //     task_id: work.task_id,
                                //     group: work.groupid,
                                //     color: this.colorStatus[work.status]
                                // })
                                let elemlist = []
                                work.children.map(wc => {
                                    if(wc.type == 'elem'){
                                        elemlist.push(wc.elemid)
                                    }
                                })
                                elemlist = JSON.stringify(elemlist)

                                if(work.external_data == null){
                                    work.external_data = {
                                        elemsid: elemlist
                                    }
                                }
                                else{
                                    work.external_data.elemsid = elemlist
                                }
                                this.updateTree(work, elem)
                                // this.items = this.items.map(i => {
                                //     if(i.schedule_id == work.task_id){
                                //         i = work
                                //     }
                                //     return i
                                // })



                                // console.log('getItem', item)
                                // this.works = this.works.map(g => {
                                //     if(g.id == work.group){
                                //         g.children = g.children.map(w => {
                                //             if(w.id == work.id){
                                //
                                //                 if(!w.children.length){
                                //                     w.children.push({
                                //                         id: 'remove' + w.id,
                                //                         workid: w.id,
                                //                         task_id: w.task_id,
                                //                         groupid: g.id,
                                //                         type: 'remove',
                                //                     })
                                //                 }
                                //                 w.children.push({
                                //                     id: e[this.type_id[this.source]],
                                //                     type: 'elem',
                                //                     name: e.Name || '----',
                                //                     parent: 'w' + w.task_id,
                                //                     task_id: w.task_id,
                                //                     group: g.id,
                                //                     color: this.colorStatus[w.status]
                                //                 })
                                //                 let elemlist = []
                                //                 w.children.map(wc => {
                                //                     if(wc.type == 'elem'){
                                //                         elemlist.push(wc.id)
                                //                     }
                                //                 })
                                //                 elemlist = JSON.stringify(elemlist)
                                //
                                //                 if(w.external_data == null){
                                //                     w.external_data = {
                                //                         elemsid: elemlist
                                //                     }
                                //                 }
                                //                 else{
                                //                     w.external_data.elemsid = elemlist
                                //                 }
                                //
                                //
                                //
                                //             }
                                //             return w
                                //         })
                                //     }
                                //     return g
                                // })
                            }
                        }
                    })
                    // this.works = []
                    // this.works = this.buildTree(this.items, 0)
                    // this.treeKey += 1
                    this.onAction()
                    this.$emit('onClearSelection')
                    let body = {
                        schedule: [{
                            schedule_id: work.task_id,
                            external_data: {
                                elemsid: JSON.stringify(work.children
                                    .filter(f => f.type == 'elem')
                                    .map(w => w.id))
                            },
                        }]
                    }
                    this.$store.dispatch('workflow/setWorkList_', {body})
                    .then(res => {
                        let elems = work.children.filter(f => selectedItem.some(s => s == f.id)).map(i => i.name + ' | ' + i.id).join(', ')
                        let text = selectedItem.length > 1
                            ? 'Элементы ' + elems + ' добавлены в работу ' + work.name
                            : 'Элемент ' + elems + ' добавлен в работу ' + work.name
                        this.$notify({
                            group: 'note',
                            type: 'success',
                            text: text,
                            message: text,
                        })
                    })
                    .catch(er => {
                        this.$notify({
                            group: 'note',
                            type: 'error',
                            text: 'Ошибка сервера. Элемент не добавлен.',
                            message: 'Ошибка сервера. Элемент не добавлен.',
                        })
                    })
                }
            }
        },

    //     getElement(selectedItem){
    //         if(this.selected.length && selectedItem.length && !this.checkSelected.auto && this.selectMode){
    // // console.log('gggg',select)
    //             let work = this.selected[0]
    //             if(work.type == 'work'){
    //                 selectedItem.map(s => {
    //                     let e = this.propertyJson.find(f => f[this.type_id[this.source]] == s)
    //                     if(e){
    //                         let item = work.children.find(f => f.id == e[this.type_id[this.source]])
    //                         if(!item){
    //                             this.works = this.works.map(g => {
    //                                 if(g.id == work.group){
    //                                     g.children = g.children.map(w => {
    //                                         if(w.id == work.id){
    //                                             if(!w.children.length){
    //                                                 w.children.push({
    //                                                     id: 'remove' + w.id,
    //                                                     workid: w.id,
    //                                                     task_id: w.task_id,
    //                                                     groupid: g.id,
    //                                                     type: 'remove',
    //                                                 })
    //                                             }
    //                                             w.children.push({
    //                                                 id: e[this.type_id[this.source]],
    //                                                 type: 'elem',
    //                                                 name: e.Name || '----',
    //                                                 parent: 'w' + w.task_id,
    //                                                 task_id: w.task_id,
    //                                                 group: g.id,
    //                                                 color: this.colorStatus[w.status]
    //                                             })
    //                                             let elemlist = []
    //                                             w.children.map(wc => {
    //                                                 if(wc.type == 'elem'){
    //                                                     elemlist.push(wc.id)
    //                                                 }
    //                                             })
    //                                             elemlist = JSON.stringify(elemlist)
    //
    //                                             if(w.external_data == null){
    //                                                 w.external_data = {
    //                                                     elemsid: elemlist
    //                                                 }
    //                                             }
    //                                             else{
    //                                                 w.external_data.elemsid = elemlist
    //                                             }
    //                                         }
    //                                         return w
    //                                     })
    //                                 }
    //                                 return g
    //                             })
    //                         }
    //                     }
    //                 })
    //                 this.onAction()
    //                 this.$emit('onClearSelection')
    //                 let body = {
    //                     schedule: [{
    //                         schedule_id: work.task_id,
    //                         external_data: {
    //                             elemsid: JSON.stringify(work.children
    //                                 .filter(f => f.type == 'elem')
    //                                 .map(w => w.id))
    //                         },
    //                     }]
    //                 }
    //                 this.$store.dispatch('workflow/setWorkList_', {body})
    //                 .then(res => {
    //                     let elems = work.children.filter(f => selectedItem.some(s => s == f.id)).map(i => i.name + ' | ' + i.id).join(', ')
    //                     let text = selectedItem.length > 1
    //                         ? 'Элементы ' + elems + ' добавлены в работу ' + work.name
    //                         : 'Элемент ' + elems + ' добавлен в работу ' + work.name
    //                     this.$notify({
    //                         group: 'note',
    //                         type: 'success',
    //                         text: text,
    //                         message: text,
    //                     })
    //                 })
    //                 .catch(er => {
    //                     this.$notify({
    //                         group: 'note',
    //                         type: 'error',
    //                         text: 'Ошибка сервера. Элемент не добавлен.',
                            // message: 'Ошибка сервера. Элемент не добавлен.',
    //                     })
    //                 })
    //             }
    //         }
    //     },
        onSetSelectionMode(){
            this.selectMode = !this.selectMode
            this.$emit('onSetSelectionMode', this.selectMode)
        },
        removeAll(i){

            let elemlist = []
            let body = {
                schedule: [{
                    schedule_id: i.task_id,
                    external_data: {
                        elemsid: JSON.stringify(elemlist)
                    },
                }]
            }
            this.$store.dispatch('workflow/setWorkList_', {body})
            .then(res => {
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Из работы ' + i.name + ' удалены все элементы ',
                    message: 'Из работы ' + i.name + ' удалены все элементы ',
                })
            })
            .catch(er => {
                this.$notify({
                    group: 'note',
                    type: 'error',
                    text: 'Ошибка сервера. Элементы не удалены.',
                    message: 'Ошибка сервера. Элементы не удалены.',
                })
            })
            this.works = this.works.map(g => {
                if(g.id == i.groupid){
                    g.children = g.children.map(w => {
                        if(w.id == i.workid){
                            w.children = []
                            let elemlist = []

                            let body = {
                                schedule: [{
                                    schedule_id: w.task_id,
                                    external_data: {
                                        elemsid: JSON.stringify(elemlist)
                                    },
                                }]
                            }
                            this.$store.dispatch('workflow/setWorkList_', {body})
                            .then(res => {
                                this.$notify({
                                    group: 'note',
                                    type: 'success',
                                    text: 'Из работы ' + w.name + ' удалены все элементы ',
                                    message: 'Из работы ' + w.name + ' удалены все элементы ',
                                })
                            })
                            .catch(er => {
                                this.$notify({
                                    group: 'note',
                                    type: 'error',
                                    text: 'Ошибка сервера. Элементы не удалены.',
                                    message: 'Ошибка сервера. Элементы не удалены.',
                                })
                            })

                        }
                        return w
                    })
                }
                return g
            })
            this.onAction()
        },
        removeElement(item = null){
            item = item === null
                ? this.selected[0]
                : item
            if(item){
                this.works = this.works.map(g => {
                    if(g.id == item.group){
                        g.children = g.children.map(w => {
                            if(w.id == item.parent){
                                w.children = w.children.filter(f => f.id != item.id)
                                let elemlist = []
                                w.children.map(e => {
                                    if(e.type == 'elem'){
                                        elemlist.push(e.id)
                                    }
                                })
                                if(!elemlist.length){
                                    w.children = []
                                }

                                let body = {
                                    schedule: [{
                                        schedule_id: w.task_id,
                                        external_data: {
                                            elemsid: JSON.stringify(elemlist)
                                        },
                                    }]
                                }
                                this.$store.dispatch('workflow/setWorkList_', {body})
                                .then(res => {
                                    this.$notify({
                                        group: 'note',
                                        type: 'success',
                                        text: 'Элемент ' + item.id + ' удален из работы ' + w.name,
                                        message: 'Элемент ' + item.id + ' удален из работы ' + w.name,
                                    })
                                })
                                .catch(er => {
                                    this.$notify({
                                        group: 'note',
                                        type: 'error',
                                        text: 'Ошибка сервера. Элемент не удален.',
                                        message: 'Ошибка сервера. Элемент не удален.',
                                    })
                                })

                            }
                            return w
                        })
                    }
                    return g
                })
                this.onAction()
            }
        },
        // removeElement(item = null){
        //     item = item === null
        //         ? this.selected[0]
        //         : item
        //     if(item){
        //         this.works[item.group] = this.works[item.group].map(w => {
        //             if(w.task_id == item.task_id){
        //                 w.elemsid = w.elemsid.filter(f => f != item.id)
        //                 if(this.selected.length){
        //                     if(this.selected[0] == 'elem'){
        //                         this.selected = []
        //                     }
        //                     else if(this.selected[0] == 'work'){
        //                         this.selected = this.selected.map(s => {
        //                             s.children = s.children.filter(f => f.id != item.id)
        //                         })
        //                     }
        //                 }
        //                 let body = [{
        //                     task_id: w.task_id,
        //                     elemsid: w.elemsid,
        //                 }]
        //                 let file = this.model.id
        //                 this.$store.dispatch('workflow/setWorkList', {body, file})
        //                 .then(res => {
        //                     this.$notify({
        //                         group: 'note',
        //                         type: 'success',
        //                         text: 'Элемент ' + item.id + ' удален из работы ' + w.name,
        //                         message: 'Элемент ' + item.id + ' удален из работы ' + w.name
        //                     })
        //                 })
        //                 .catch(er => {
        //                     this.$notify({
        //                         group: 'note',
        //                         type: 'error',
        //                         text: 'Ошибка сервера. Элемент не удален.',
        //                         message: 'Ошибка сервера. Элемент не удален.',
        //                     })
        //                 })
        //             }
        //             return w
        //         })
        //         this.onAction()
        //     }
        // },
        onShowObjectsOnly(v){
            let list = []
            if(!this.selected.length){
                list = []
                v = false
            }
            else if(this.selected[0].type == 'group'){
                this.selected[0].children.map(w => {
                    list = [...list, ...w.children.filter(f => f.type == 'elem').map(i => i.id)]
                })
            }
            else if(this.selected[0].type == 'work'){
                list = this.selected[0].children.filter(f => f.type == 'elem').map(i => i.id)
            }
            else{
                list = [this.selected[0].id]
            }
            this.$emit('onShowObjectsOnly', {list: list, active: v})
        },
        onOptions(name, active){
            this.$emit('setOption', {
                name: name,
                active: active
            })
        },
        onSetColorForObjects(){
            let item = this.selected[0]
            if(!item){
                this.$emit('onSetColorForObjects', {
                    list: [],
                    color: '#000000'
                })
            }
            else if(item.type == 'group'){
                let body = {id2color: []}
                let items = {}

                item.children.map(w => {
                    w.children.filter(f => f.type == 'elem').map(i => {
                        if(items[i.id]){
                            if(w.status < items[i.id].sts){
                                items[i.id] = {
                                    id: i.id,
                                    color: i.color,
                                    sts: w.status
                                }
                            }
                        }
                        else{
                            items[i.id] = {
                                id: i.id,
                                color: i.color,
                                sts: w.status
                            }
                        }
                    })
                })
                items = Object.values(items).reduce((r, i) => {
                    r[i.color] = r[i.color] || []
                    r[i.color].push(i.id)
                    return r
                }, {})
                Object.entries(items).map(([k, v]) => {
                    body.id2color.push({
                        ids: v,
                        color: k
                    })
                })
                this.$emit('onSetColorsForObjects', body)
            }
            else if(this.selected[0].type == 'work'){
                this.$emit('onSetColorForObjects', {
                    list: item.children.filter(f => f.type == 'elem').map(c => c.id),
                    color: item.color
                })
            }
            else{
                this.$emit('onSetColorForObjects', {
                    list: [item.id],
                    color: item.color
                })
            }
        },
        onSetColorAuto(){
            let body = {id2color: []}
            let items = {}

            this.getItems.map(g => {
                g.children.map(w => {
                    w.children
                        .filter(f => f.type == 'elem')
                        .map(i => {
                            if(items[i.id]){
                                if(w.status < items[i.id].sts){
                                    items[i.id] = {
                                        id: i.id,
                                        color: i.color,
                                        sts: w.status
                                    }
                                }
                            }
                            else{
                                items[i.id] = {
                                    id: i.id,
                                    color: i.color,
                                    sts: w.status
                                }
                            }
                        })
                })
            })
            items = Object.values(items).reduce((r, i) => {
                r[i.color] = r[i.color] || []
                r[i.color].push(i.id)
                return r
            }, {})
            Object.entries(items).map(([k, v]) => {
                body.id2color.push({
                    ids: v,
                    color: k
                })
            })
            this.$emit('onSetColorsForObjects', body)
        },
        onUnsetColorsForObjects(){
            this.$emit('onUnsetColorsForObjects')
        },
        transDate(d){
            let options = {year: '2-digit', month: '2-digit', day: '2-digit'}
            let date = new Date(d)
            return date.toLocaleDateString("ru-RU", options)
        }
    }
}
</script>

<style scoped>
.m-panel__collision--tree .v-treeview-node__root{
    align-items: start !important;
}
.m-work-list .v-treeview-node__content{
    align-items: flex-start !important;
    padding-top: 2px !important;
}
.m-work-list .m-date{
    color: initial !important;
}
.m-work-list .m-date > div{
    max-width: 25%;
    padding: 12px 4px;
}
.m-work-list .m-alert{
    font-weight: bold !important;
}
.code-job{
    background-color: #e5f3ff;
    color: #4e93e9;
    font-size: 10px;
    padding: 2px 2px 2px 5px;
    margin-right: 8px;
}
</style>
