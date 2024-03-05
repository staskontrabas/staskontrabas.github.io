<template>
    <v-card
        class="m-card-scrollable"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="pr-0 pl-4 py-1 m-modal--title-size14 m-card-scrollable__title">Правила проверки
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

        <v-card-title class="pa-0">
            <div class="pr-0 pl-4 py-1 m-panel__collision--options">
                <icon-botton
                    class="mr-4"
                    :disabled="!compute_ready || !compute_group_ready"
                    tooltip
                    :tooltipValue="'Набор правил'"
                    @onClick="component = 'RulesSelect'"
                    >trd-template
                </icon-botton>
                <icon-botton
                    class="mr-4"
                    :disabled="!compute_ready || !compute_group_ready"
                    tooltip
                    :tooltipValue="'Добавить набор правил'"
                    @onClick="component = 'SectionAdd'"
                    :size="'30'"
                    >trd-books
                </icon-botton>
                <icon-botton
                    class="mr-4"
                    :disabled="!compute_ready || !compute_group_ready"
                    tooltip
                    :tooltipValue="'Удалить набор правил'"
                    @onClick="removeItem"
                    >trd-books_delete
                </icon-botton>
                <icon-botton
                    class="mr-4"
                    :disabled="!compute_ready || !compute_group_ready"
                    tooltip
                    :tooltipValue="'Добавить правило'"
                    @onClick="component = 'GroupAdd'"
                    >trd-group-add
                </icon-botton>
                <icon-botton
                    class="mr-4"
                    :disabled="!checkGroups || !compute_ready || !compute_group_ready"
                    tooltip
                    :tooltipValue="'Удалить правило'"
                    @onClick="removeItem"
                    >trd-group-delete
                </icon-botton>
                <icon-botton
                    class="mr-4"
                    :disabled="!compute_ready || !compute_group_ready"
                    tooltip
                    :tooltipValue="'Добавить тип проверки'"
                    @onClick="component = 'RulesTypes'"
                    >trd-rules-add
                </icon-botton>
                <icon-botton
                    class="mr-4"
                    :disabled="!checkRules || !compute_ready || !compute_group_ready"
                    tooltip
                    :tooltipValue="'Удалить тип проверки'"
                    @onClick="removeItem"
                    >trd-rules-delete
                </icon-botton>
                <icon-botton
                    class="mr-4"
                    :disabled="!(checkSection || checkGroups || checkRules) || !compute_ready || !compute_group_ready"
                    tooltip
                    :tooltipValue="'Редактировать'"
                    @onClick="editItem"
                    >trd-edit
                </icon-botton>
                <v-spacer></v-spacer>
                <v-btn
                    text
                    small
                    tile
                    class="m-btn"
                    color="primary"
                    :disabled="(!checkRules && !checkGroups) || !compute_ready || !compute_group_ready"
                    @click="onComputeCollisions"
                    >
                    <v-icon left size="20">
                        trd-checked
                    </v-icon>
                    Проверить
                </v-btn>
            </div>
        </v-card-title>

        <v-divider class="pb-2"></v-divider>

        <v-card-text
            class="pa-0 pb-5 m-card-scrollable__text">

            <v-alert
                v-show="!compute_ready || !compute_group_ready"
                outlined
                type="warning"
                prominent
                border="left"
                class="m-alert mx-3 m-text--size12 py-1"
            >Расчет коллизий может занять до 5 мин, время зависит от размеров файлов. Вы можете закрыть окно и продолжить работать, при завершении расчета вы увидите сообщение о готовности отчета об ошибках.
            </v-alert>
            <v-skeleton-loader
                v-show="!compute_ready || !compute_group_ready"
                type="list-item-three-line, list-item-three-line"
            ></v-skeleton-loader>

            <v-treeview
                v-show="compute_ready && compute_group_ready"
                :key="change"
                :active.sync="selected"
                :items="getSections"
                return-object
                class="m-panel__collision--tree m-text--size12"
                dense
                activatable
                expand-icon="mdi-chevron-down"
                transition
                item-key="id"
                >
                <template v-slot:prepend="{item}">
                    <v-icon v-if="item.type == 'section'" size="30">
                        {{'trd-books'}}
                    </v-icon>
                    <v-icon v-else size="20">
                        {{'trd-' + item.type}}
                    </v-icon>
                </template>
                <template v-slot:append="{item}">
                    <template v-if="item.type != 'section' && item.status != -1">
                        <v-icon v-if="!item.status" size="20" color="error">
                            mdi-alert-outline
                        </v-icon>
                        <v-icon v-else-if="item.status" size="20" color="success">
                            trd-checked-ok
                        </v-icon>
                    </template>
                </template>
            </v-treeview>
        </v-card-text>

        <dialog-view
            :component.sync="component"
            :temp.sync="temp"
            :model="model"
            :listModel="listModel"
            :componentNames="componentNames"
            :elems_json="elems_json"
            :source="source"
            :elementParameters.sync="elementParameters"
            @updateTemp="updateTemp"
            @saveMeta="saveMeta"
            @cancel="hideDialog"
            />

    </v-card>
</template>

<script>
import IconBotton from '@/components/custom/IconBotton'
import DialogView from './panel_collision_settings/DialogView'

export default {
    name: 'PanelCollisionSettings',
    props: ['menuItem', 'collision_settings', 'collisions_compiling', 'styleP', 'source', 'compute_ready', 'listModel', 'docMap', 'files'],
    components: {
        IconBotton,
        DialogView
    },
    data(){
        return {
            model: {},
            minimize: false,
            component: false,
            elementParameters: [],
            temp: {},
            change: 0,
            elems_json: null,
            selected: [],
            compilingQueue: {
                active: 0,
                group: 0,
                rule: 0
            },
            compute_group_ready: true,
            compute_group_listid: [],
            meta: {}
        }
    },
    computed: {
        componentNames(){
            let eNames = null
            if(this.elems_json){
                let elems = {}
                Object.entries(this.elems_json)
                    .map(([std, cats]) => {
                        let struct = {}
                        Object.entries(cats)
                            .map(([cat, val]) => {
                                let elemstype = this.temp.elemstype || []
                                if(cat != 'None' && (!elemstype.length || elemstype.some(s => s == cat))){
                                    struct = {...struct, ...val}
                                }
                            })
                        elems[std] = struct
                    })
                eNames = elems
            }

            return eNames
        },
        checkSection(){
            return this.selected.some(s => s.type == 'section')
        },
        checkGroups(){
            return this.selected.some(s => s.type == 'group')
        },
        checkRules(){
            return this.selected.some(s => s.type == 'rules')
        },
        getGroups(){
            let meta = JSON.parse(JSON.stringify(this.$store.state.common.meta))
            let collisions = meta.collisions
            let groups = collisions ? collisions.groups || [] : []
            return groups
        },
        getSections(){
            let collisions = JSON.parse(JSON.stringify(this.$store.state.common.meta.collisions || null))
            let sections = collisions ? collisions.sections || {} : {}
            let groups = this.getGroups.filter(g => g.children)
            let freeGroups = []
            groups.map(g => {
                if(!g.section || !sections[g.section]){
                    freeGroups.push(g)
                }
                else{
                    sections[g.section].children = sections[g.section].children || []
                    sections[g.section].children.push(g)
                }
            })
            sections = Object.entries(sections).map(([k, v]) => {
                return v
            }).filter(s => s.type == 'section')
            return [...sections, ...freeGroups]
        }
    },
    watch: {
        menuItem: {
            handler(v){
                if(v.active && !this.componentNames){
                    let prmslist = []
                    this.files.map(file => {
                        prmslist.push(this.$store.dispatch('common/getFileInfo', {id: file + '/elems.json'}))
                    })
                    Promise.all(prmslist)
                    .then(res => {
                        let elems = {}
                        res.map(r => {
                            Object.keys(r).map(std => {
                                elems[std] = elems[std] || {}
                                Object.keys(r[std]).map(cat => {
                                    elems[std][cat] = elems[std][cat] || {}
                                    Object.keys(r[std][cat]).map(name => {
                                        elems[std][cat][name] = elems[std][cat][name] || []

                                        elems[std][cat][name] = [...elems[std][cat][name], ...r[std][cat][name]]
                                    })
                                })
                            })
                        })
                        console.log('elems = ', elems)
                        this.elems_json = elems
                    })
                    .catch(er => {
                        console.log('Get tag elems.json error:', er)
                    })
                    // if(this.model.type == 'consolidations'){
                    //     let prmslist = []
                    //     this.model.consolidations.map(c => {
                    //         let doc = this.$store.state.workflow.listDocs.find(f => f.id == c)
                    //         let url = ''
                    //         if(doc.version == null){
                    //             url = doc.files[0].url
                    //         }
                    //         else{
                    //             let file = doc.files.find(i => i.id == doc.version)
                    //             url = file ? file.url : doc.files[0].url
                    //         }
                    //         prmslist.push(this.$store.dispatch('common/getFileInfo', {id: url + '/elems.json'}))
                    //     })
                    //     Promise.all(prmslist)
                    //     .then(res => {
                    //         let elems = {}
                    //         res.map(r => {
                    //             Object.keys(r).map(std => {
                    //                 elems[std] = elems[std] || {}
                    //                 Object.keys(r[std]).map(cat => {
                    //                     elems[std][cat] = elems[std][cat] || {}
                    //                     Object.keys(r[std][cat]).map(name => {
                    //                         elems[std][cat][name] = elems[std][cat][name] || []
                    //
                    //                         elems[std][cat][name] = [...elems[std][cat][name], ...r[std][cat][name]]
                    //                     })
                    //                 })
                    //             })
                    //         })
                    //         console.log('elems = ', elems)
                    //         this.elems_json = elems
                    //     })
                    //     .catch(er => {
                    //         console.log('Get tag elems.json error:', er)
                    //     })
                    // }
                    // else{
                    //     if(this.model.tags['elems.json'] == 1){
                    //         let url = ''
                    //         if(this.model.version == null){
                    //             url = this.model.files[0].url
                    //         }
                    //         else{
                    //             let file = this.model.files.find(i => i.id == this.model.version)
                    //             url = file ? file.url : this.model.files[0].url
                    //         }
                    //         this.$store.dispatch('common/getFileInfo', {id: url + '/elems.json'})
                    //         .then(res => {
                    //             this.elems_json = res
                    //         })
                    //         .catch(er => {
                    //             console.log('Get tag elems.json error:', er)
                    //         })
                    //     }
                    // }
                }
            },
            deep: true
        },
        collisions_compiling(v){
            if(v){
                if(!this.compilingQueue.active){
                    this.compilingQueue.active = 1
                    this.compilingQueue.group = this.getGroups.length
                    this.compilingQueue.rule = this.getGroups[0].children.length
                    this.activeAutoCompiling(false)
                }
                else{
                    if(this.compilingQueue.rule != 0){
                        this.compilingQueue.rule -= 1
                    }
                    else if(this.compilingQueue.group != 0){
                        this.compilingQueue.group -= 1
                        let ind = this.getGroups.length - this.compilingQueue.group
                        this.compilingQueue.rule = this.getGroups[ind].children.length
                    }
                    else{
                        this.compilingQueue.active = 0
                        this.activeAutoCompiling(false)
                    }
                    let g = this.getGroups.length - this.compilingQueue.group
                    let r = this.getGroups[g].children.length - this.compilingQueue.rule
                    let item = this.getGroups[g].children[r]
                    this.computeRule(item)
                }
            }
            else{
                if(this.compilingQueue.active){
                    this.activeAutoCompiling(true)
                }
            }
        },
        compute_ready(v){
            if(v){
                if(this.compute_group_listid.length){
                    let id = this.compute_group_listid.shift()
                    this.computeRule(this.selected[0].children.find(f => f.id == id))
                }
                else{
                    this.compute_group_ready = true
                }
            }
        }
    },
    methods: {
        hideDialog(){
            this.temp = {}
            this.component = false
        },
        cancel(){
            this.temp = {}
            this.$emit('setOption', this.menuItem)
        },
        activeAutoCompiling(v){
            this.$emit('update:collisions_compiling', v)
        },
        onComputeCollisions(){
            if(this.selected[0].type == 'group'){
                // this.computeRule()
                this.compute_group_listid = this.selected[0].children.map(s => s.id)
                if(this.compute_group_listid.length){
                    let id = this.compute_group_listid.shift()
                    this.computeRule(this.selected[0].children.find(f => f.id == id))
                    this.compute_group_ready = false
                }
            }
            else{
                this.computeRule()
            }
        },
        getElementIdList(list, std = 'ksi'){
            let ids = []
            list.map(l => {
                if(this.componentNames[std][l]){
                    ids = [...ids, ...this.componentNames[std][l]]
                }
            })
            return ids
        },
        computeRule(item = null){
            if(!this.selected.length && !item){
                return
            }
            item = item
                ? item
                : this.selected.length
                    ? this.selected[0]
                    : {part: 'none'}
            // this.getGroups.map(g => {
            //     g.children.map(r => {
            //         if(r.id == item.id){
            //             item = r
            //         }
            //     })
            // })
            console.log('computeRule', item)
            if(item.part == 'geom'){
                let data = {
                    list_1: this.getElementIdList(item.list_1, item.std),
                    list_2: this.getElementIdList(item.list_2, item.std),
                    group: item.parent,
                    rule: item.id,
                    part: item.part
                }
                this.$emit('onComputeCollisions', data)
            }
            if(item.part == 'params'){
                let group = this.getGroups.find(f => f.id == item.parent)
                let elems = group.children.find(c => c.id == item.id).elements1
                let data = {
                    elements: elems
                        .filter(f => Object.keys(this.componentNames[item.std]).some(s => s == f.name))
                        .map(e => {
                            return {
                                ...e,
                                list: this.getElementIdList([e.name], item.std)
                            }
                    }),
                    group: item.parent,
                    std: item.std,
                    rule: item.id,
                    part: item.part
                }
                this.$emit('onComputeParameters', data)
            }
            if(item.part == 'repeat'){
                let data = {
                    group: item.parent,
                    rule: item.id,
                    part: item.part
                }
                this.$emit('onComputeRepeat', data)
            }
            if(item.part == 'space'){
                let group = this.getGroups.find(f => f.id == item.parent)
                let elem = group.children.find(c => c.id == item.id)
                let elemslhs = elem.elementslhs
                let elemsrhs = elem.elementsrhs
                let data = {
                    elementslhs: elemslhs
                        .filter(f => Object.keys(this.componentNames[item.std]).some(s => s == f.name))
                        .map(e => {
                            return {
                                ...e,
                                list: this.getElementIdList([e.name], item.std)
                            }
                    }),
                    elementsrhs: elemsrhs
                        .filter(f => Object.keys(this.componentNames[item.std]).some(s => s == f.name))
                        .map(e => {
                            return {
                                ...e,
                                list: this.getElementIdList([e.name], item.std)
                            }
                    }),
                    axes: elem.axes,
                    group: item.parent,
                    std: item.std,
                    rule: item.id,
                    part: item.part
                }
                this.$emit('onComputeSpaceWorker', data)
            }
            if(item.part == 'distance'){
                let group = this.getGroups.find(f => f.id == item.parent)
                let elem = group.children.find(c => c.id == item.id)
                let elemslhs = elem.elementssource
                let elemsrhs = elem.elementstarget
                let data = {
                    elementslhs: elemslhs
                        .filter(f => Object.keys(this.componentNames[item.std]).some(s => s == f.name))
                        .map(e => {
                            return {
                                ...e,
                                list: this.getElementIdList([e.name], item.std)
                            }
                    }),
                    elementsrhs: elemsrhs
                        .filter(f => Object.keys(this.componentNames[item.std]).some(s => s == f.name))
                        .map(e => {
                            return {
                                ...e,
                                list: this.getElementIdList([e.name], item.std)
                            }
                    }),
                    max: item.max.check ? item.max.value : false,
                    min: item.min.check ? item.min.value : false,
                    method: item.method,
                    submethod: item.submethod,
                    group: item.parent,
                    std: item.std,
                    rule: item.id,
                    part: item.part
                }
                this.$emit('onComputeDistanceWorker', data)
            }
            if(item.part == 'numberobj'){
                let data = {
                    roomIds: item.elementsrooms
                        .filter(f => Object.keys(this.componentNames[item.std]).some(s => s == f.name))
                        .map(e => {
                            return {
                                ...e,
                                list: this.getElementIdList([e.name], item.std)
                            }
                    }),
                    entityIds: item.elementsobj
                        .filter(f => Object.keys(this.componentNames[item.std]).some(s => s == f.name))
                        .map(e => {
                            return {
                                ...e,
                                list: this.getElementIdList([e.name], item.std)
                            }
                    }),
                    controlNumber: item.ncontrol,
                    group: item.parent,
                    rule: item.id,
                    part: item.part
                }
                this.$emit('onComputeNumberObjRoomsWrkr', data)
            }
        },
        editItem(){
            let item = this.selected[0]
            if(item.type == 'rules'){
                if(this.selected[0].part == 'geom'){
                    this.temp.group = this.getGroups.find(f => f.id == this.selected[0].parent)
                    item = this.temp.group.children.find(c => c.id == this.selected[0].id)

                    this.temp.ruleName = item.name
                    this.temp.std = item.std
                    this.temp.elemstype = item.elemstype || []
                    this.temp.desc = item.desc
                    this.temp.list_1 = item.list_1
                    this.temp.list_2 = item.list_2
                    this.temp.editId = item.id
                    this.temp.editType = 'rule'

                    this.component = 'RulesSettings'
                }
                if(this.selected[0].part == 'params'){
                    this.temp.group = this.getGroups.find(f => f.id == this.selected[0].parent)
                    item = this.temp.group.children.find(c => c.id == this.selected[0].id)

                    this.temp.ruleName = item.name
                    this.temp.std = item.std
                    this.temp.elemstype = item.elemstype || []
                    this.temp.desc = item.desc
                    this.temp.elements1 = item.elements1
                    this.temp.editId = item.id
                    this.temp.editType = 'rule'
                    this.component = 'RulesSettingsParams'
                }
                if(this.selected[0].part == 'repeat'){

                    this.temp.group = this.getGroups.find(f => f.id == this.selected[0].parent)
                    item = this.temp.group.children.find(c => c.id == this.selected[0].id)

                    this.temp.ruleName = item.name
                    this.temp.desc = item.desc
                    this.temp.editId = item.id
                    this.temp.editType = 'rule'

                    this.component = 'RulesSettingsRepeat'
                }
                if(this.selected[0].part == 'space'){

                    this.temp.group = this.getGroups.find(f => f.id == this.selected[0].parent)
                    item = this.temp.group.children.find(c => c.id == this.selected[0].id)

                    this.temp.elementslhs = item.elementslhs
                    this.temp.elementsrhs = item.elementsrhs
                    this.temp.ruleName = item.name
                    this.temp.std = item.std
                    this.temp.elemstype = item.elemstype || []
                    this.temp.desc = item.desc
                    this.temp.tcode = item.tcode
                    this.temp.axes = item.axes
                    this.temp.editId = item.id
                    this.temp.editType = 'rule'

                    this.component = 'RulesSettingsSpace'
                }
                if(this.selected[0].part == 'distance'){
                    this.temp.group = this.getGroups.find(f => f.id == this.selected[0].parent)
                    item = this.temp.group.children.find(c => c.id == this.selected[0].id)

                    this.groupName = this.temp.group.name
                    this.temp.elementssource = item.elementssource
                    this.temp.elementstarget = item.elementstarget
                    this.temp.ruleName = item.name
                    this.temp.std = item.std
                    this.temp.elemstype = item.elemstype || []
                    this.temp.desc = item.desc
                    this.temp.tcode = item.tcode
                    this.temp.mtd = item.mtd
                    this.temp.side = item.side
                    this.temp.max = item.max
                    this.temp.min = item.min
                    this.temp.editId = item.id
                    this.temp.editType = 'rule'

                    this.component = 'RulesSettingsDistance'
                }
                if(this.selected[0].part == 'numberobj'){
                    this.temp.group = this.getGroups.find(f => f.id == this.selected[0].parent)
                    item = this.temp.group.children.find(c => c.id == this.selected[0].id)
                    this.groupName = this.temp.group.name
                    this.temp.elementsrooms = item.elementsrooms
                    this.temp.elementsobj = item.elementsobj
                    this.temp.ruleName = item.name
                    this.temp.std = item.std
                    this.temp.elemstype = item.elemstype || []
                    this.temp.desc = item.desc
                    this.temp.tcode = item.tcode
                    this.temp.ncontrol = item.ncontrol
                    this.temp.editId = item.id
                    this.temp.editType = 'rule'

                    this.component = 'RulesSettingsNumberObjRooms'
                }
            }
            else if(item.type == 'section'){
                this.temp.editType = item.type
                this.temp.editId = item.id
                this.component = 'SectionAdd'
            }
            else if(item.type == 'group'){
                this.temp.editType = item.type
                this.temp.editId = item.id
                this.component = 'GroupAdd'
            }
        },
        removeItem(){
            let item = this.selected[0]
            if(!item){
                return
            }
            if(item.type == 'section'){
                let sections = this.getSections
                    .filter(f => f.id != item.id && f.type == 'section')
                    // .filter(f => f.id != item.id)
                    .reduce((r, i) => {
                        delete i.children
                        r[i.id] = i
                        return r
                    }, {})
                let groups = this.getGroups.map(g => {
                    if(g.section == item.id){
                        g.section = null
                    }
                    return g
                })
                this.saveMeta({sections, groups})
            }
            else if(item.type == 'group'){
                this.saveMeta({groups: this.getGroups.filter(f => f.id != item.id)})
            }
            else{
                this.saveMeta({groups: this.getGroups.map(g => {
                    if(g.id == item.parent){
                        g.children = g.children.filter(f => f.id != item.id)
                    }
                    if(!g.children.length){
                        g.status = -1
                    }
                    return g
                })})
            }
            this.selected = []
        },
        updateTemp(v){
            this.temp = v
        },
        saveMeta(v){
            console.log('saveMeta', v)

            let meta = JSON.parse(JSON.stringify(this.$store.state.common.meta))
            if(meta.collisions){
                meta.collisions = {...meta.collisions, ...v, version: this.model.version}
            }
            else{
                meta.collisions = {...v, version: this.model.version}
            }

            this.selected = []
            if(meta.collisions.groups){
                meta.collisions.groups = meta.collisions.groups
                    .filter(g => g.children)
            }
            if(meta.collisions.sections){
                let sectionsTemp = Object.entries(meta.collisions.sections)
                    .map(([k, v]) => {
                        return v
                    })
                    .filter(s => s.type == 'section')
                    .map(sct => {
                        return [sct.id, sct]
                    })
                meta.collisions.sections = Object.fromEntries(sectionsTemp)
            }
            console.log(meta.collisions)

            this.$store.dispatch('common/setMeta', {
                meta
            })


            return
            this.$store.dispatch('common/setFileMeta', {
                id: this.model.id,
                body: JSON.stringify(meta)
            })
            .then(res => {
                return  this.$store.dispatch('common/getFileMeta', {
                    id: this.model.id
                })
            })
            .then(res => {
                if(res.error){
                    this.$notify({
                        group: 'note',
                        type: 'error',
                        text: res.data.error,
                        message: res.data.error,
                    })
                }
                else{
                    this.$notify({
                        group: 'note',
                        type: 'success',
                        text: 'Изменения сохранены.',
                        message: 'Изменения сохранены.',
                    })
                }
            })
        }
    }
}

</script>
