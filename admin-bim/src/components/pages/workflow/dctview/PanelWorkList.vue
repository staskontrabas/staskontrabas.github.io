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
                :active.sync="selected"
                :items="getItems"
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
                            {{item.name + (item.children.length
                                ? ' (' + (item.children.length - 1) + ')'
                                : '')}}
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
                                {{item.volume_actual + ' ' + (job_unit[item.job_unit] || item.job_unit)}}
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
                                    {{item.name + ' | ' + item.elemid}}
                                </span>
                            </template>
                            {{item.name + ' | ' + item.elemid}}
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
            docId: '',
            minimize: false,
            items: [],
            opened: [],
            selected: [],
            selectedItem: null,
            colorStatus: ['0', '#ff5338', '#ffbf00', '#2ac279', '#8c95a9'],
            works: null,
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
                'процент': '%',
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
            meta: null,
            metaJobElems: {},
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

                    const queryString = window.location.search
                    const urlParams = new URLSearchParams(queryString)
                    const doc = urlParams.getAll('doc')
                    this.docId = doc[0]

                    this.$store.dispatch('common/getFileMeta', {id: this.docId})
                    .then(res => {
                        console.log(res)
                        if(res){
                            const meta = JSON.parse(res)
                            this.meta = meta
                            if(meta.jobs){
                                this.metaJobElems = meta.jobs
                            }
                        }
                        return this.$store.dispatch('workflow/getWorkList__', {})
                    })
                    .then(res => {
                        console.log(res)
                        this.items = res.result.erpo_object_data_list[0].schedule_foreman,//res.result.schedule
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
        buildTree(elems, pid){
            let list = elems
                .filter(f => f.parent_id == pid)
                .map(e => {
                    if(!e.job){
                        e.id = 'g' + e.schedule_id
                        e.type = 'group'
                        e.groupid = pid
                        e.children = this.buildTree(elems, e.schedule_id)
                    }
                    else{
                        e.id = 'w' + e.schedule_id
                        e.task_id = e.schedule_id
                        e.name = e.name || '...'
                        e.type = 'work'
                        e.groupid = pid
                        e.cdate = e.date_start
                        e.edate = e.date_finish
                        e.days = e.date_interval_day
                        e.border = {
                            'border-left': '4px solid ' + this.colorStatus[e.status_number]
                        }
                        e.color = this.colorStatus[e.status_number]
                        e.external_data = null
                        if(this.metaJobElems[e.schedule_id]){
                            e.external_data = {
                                elemsid: this.metaJobElems[e.schedule_id]
                            }
                        }
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
                                    workname: e.name,
                                    task_id: e.task_id,
                                    groupid: pid,
                                    type: 'remove'
                                }]
                            }
                            e.children = [...e.children, ...list.map(i => {
                                let elem = this.propertyJson.find(f => f.id == i)
                                return {
                                    id: e.task_id + '_' + i,
                                    elemid: i,
                                    type: 'elem',
                                    name: elem ? elem.Name : '----',
                                    parent: 'w' + e.task_id,
                                    task_id: e.task_id,
                                    groupid: pid,
                                    color: this.colorStatus[e.status_number]
                                }
                            })]
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
            this.works = null
            this.items = []
            this.selected = []
            this.$emit('onSetSelectionMode', false)
            this.$emit('setOption', this.menuItem)
        },
        getElement(selectedItem){
            if(this.selected.length && selectedItem.length && !this.checkSelected.auto && this.selectMode){
                let work = this.selected[0]
                if(work.type == 'work'){
                    let elemlist = []
                    selectedItem.map(s => {
                        let e = this.propertyJson.find(f => f.id == s)

                        if(e){
                            let item = work.children.find(f => f.elemid == e.id)
                            if(!item){
                                this.items = JSON.parse(JSON.stringify(this.items)).map(i => {
                                    if(i.schedule_id == work.task_id){
                                        elemlist = [e.id]
                                        if(i.external_data == null){
                                            elemlist = JSON.stringify(elemlist)
                                            i.external_data = {
                                                elemsid: elemlist
                                            }
                                            this.metaJobElems[i.schedule_id] = elemlist
                                        }
                                        else{
                                            elemlist = JSON.stringify([...JSON.parse(i.external_data.elemsid), e.id])

                                            i.external_data.elemsid = elemlist
                                            this.metaJobElems[i.schedule_id] = elemlist
                                        }
                                    }
                                    return i
                                })
                            }
                        }
                    })
                    this.works = this.buildTree(this.items, 0)
                    this.onAction()
                    this.$emit('onClearSelection')
                    if(typeof elemlist != 'string'){
                        elemlist = JSON.stringify(elemlist)
                    }
                    // let body = {
                    //     schedule: [{
                    //         schedule_id: work.task_id,
                    //         external_data: {
                    //             elemsid: elemlist
                    //         }
                    //     }]
                    // }
                    let body = {
                        ...this.meta,
                        jobs: this.metaJobElems
                    }
                    this.$store.dispatch('common/setFileMeta', {
                        id: this.docId,
                        body: JSON.stringify(body)
                    })
                    // this.$store.dispatch('workflow/setWorkList_', {body})
                    .then(res => {
                        let elems = JSON.parse(elemlist).filter(f => selectedItem.some(s => s == f)).join(', ')
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
        onSetSelectionMode(){
            this.selectMode = !this.selectMode
            this.$emit('onSetSelectionMode', this.selectMode)
        },
        removeAll(item){
            let elemlist = []
            // let body = {
            //     schedule: [{
            //         schedule_id: item.task_id,
            //         external_data: {
            //             elemsid: JSON.stringify(elemlist)
            //         },
            //     }]
            // }
            // this.$store.dispatch('workflow/setWorkList_', {body})
            delete this.metaJobElems[item.task_id]
            let body = {
                ...this.meta,
                jobs: this.metaJobElems
            }
            this.$store.dispatch('common/setFileMeta', {
                id: this.docId,
                body: JSON.stringify(body)
            })
            .then(res => {
                this.$notify({
                    group: 'note',
                    type: 'success',
                    text: 'Из работы ' + item.workname + ' удалены все элементы ',
                    message: 'Из работы ' + item.workname + ' удалены все элементы ',
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
            this.items = this.items.map(i => {
                if(i.id == item.workid){
                    let elem = JSON.parse(JSON.stringify(i))
                    elem.external_data = {
                        ...elem.external_data,
                        elemsid: JSON.stringify(elemlist)
                    }
                    elem.children = []
                    i = elem
                }
                return i
            })
            this.works = JSON.parse(JSON.stringify(this.buildTree(this.items, 0)))
            this.onAction()
        },
        removeElement(item = null){
            item = item === null
                ? this.selected[0]
                : item
            if(item){
                let elemlist = []
                let workname = ''
                this.items = this.items.map(i => {
                    if(i.schedule_id == item.task_id){
                        workname = i.name
                        elemlist = JSON.parse(i.external_data.elemsid)
                        elemlist = elemlist.filter(f => f != item.elemid)
                        i.external_data.elemsid = JSON.stringify(elemlist)
                    }
                    return i
                })
                // let body = {
                //     schedule: [{
                //         schedule_id: item.task_id,
                //         external_data: {
                //             elemsid: JSON.stringify(elemlist)
                //         },
                //     }]
                // }
                // this.$store.dispatch('workflow/setWorkList_', {body})
                this.metaJobElems[item.task_id] = JSON.stringify(elemlist)
                let body = {
                    ...this.meta,
                    jobs: this.metaJobElems
                }
                this.$store.dispatch('common/setFileMeta', {
                    id: this.docId,
                    body: JSON.stringify(body)
                })
                .then(res => {
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Элемент ' + item.elemid + ' удален из работы ' + workname,
                        message: 'Элемент ' + item.elemid + ' удален из работы ' + workname,
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

                this.works = JSON.parse(JSON.stringify(this.buildTree(this.items, 0)))
                this.onAction()
            }
        },
        onShowObjectsOnly(v){
            let list = []
            if(!this.selected.length){
                list = []
                v = false
            }
            else if(this.selected[0].type == 'group'){
                list = this.getElemsId(this.selected[0]).map(i => i.elemid)
            }
            else if(this.selected[0].type == 'work'){
                list = this.selected[0].children.filter(f => f.type == 'elem').map(i => i.elemid)
            }
            else{
                list = [this.selected[0].elemid]
            }
            this.$emit('onShowObjectsOnly', {list: list, active: v})
        },
        onOptions(name, active){
            this.$emit('setOption', {
                name: name,
                active: active
            })
        },
        getElemsId(item){
            let list = []
            if(item.type == 'work'){
                list = item.children
                    .filter(f => f.type == 'elem')
                    .map(i => {
                        return {
                            ...i,
                            status_number: item.status_number
                        }
                    })
            }
            else{
                item.children.map(i => {
                    list = [...list, ...this.getElemsId(i)]
                })
            }
            return list
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
                let elems = this.getElemsId(item)
                elems.map(i => {
                    if(items[i.elemid]){
                        if(i.status_number < items[i.elemid].sts){
                            items[i.elemid] = {
                                id: i.elemid,
                                color: i.color,
                                sts: i.status_number
                            }
                        }
                    }
                    else{
                        items[i.elemid] = {
                            id: i.elemid,
                            color: i.color,
                            sts: i.status_number
                        }
                    }
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
                    list: item.children.filter(f => f.type == 'elem').map(c => c.elemid),
                    color: item.color
                })
            }
            else{
                this.$emit('onSetColorForObjects', {
                    list: [item.elemid],
                    color: item.color
                })
            }
        },
        onSetColorAuto(){
            let body = {id2color: []}
            let items = {}

            let elems = []
            this.getItems.map(i => {
                elems = [...elems, ...this.getElemsId(i)]
            })
            elems.map(i => {
                if(items[i.elemid]){
                    if(i.status_number < items[i.elemid].sts){
                        items[i.elemid] = {
                            id: i.elemid,
                            color: i.color,
                            sts: i.status_number
                        }
                    }
                }
                else{
                    items[i.elemid] = {
                        id: i.elemid,
                        color: i.color,
                        sts: i.status_number
                    }
                }
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
            console.log('onSetColorsForObjects', JSON.stringify(body))
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
