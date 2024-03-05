<template>
    <v-dialog :content-class="clueBox ? 'm-transparent' : ''" :value="SP333attr" scrollable max-width="700px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-12 pl-4 m-modal--title">
                <span>Нормативные коллизии: Классификатор Строительной Информации</span>

                <v-spacer></v-spacer>
                <v-btn
                    text
                    icon
                    class="m-btn--close"
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-stepper
                v-model="step"
                class="m-stepper"
            >
                <v-stepper-header>
                    <v-stepper-step
                        :complete="step > 1"
                        step="1"
                    >
                        Наименование компонентов
                    </v-stepper-step>
                    <v-divider></v-divider>

                    <v-stepper-step
                        step="2"
                    >
                        Атрибутивная информация
                    </v-stepper-step>
                </v-stepper-header>

                <v-card-text class="pa-0" :style="{
                    'overflow-y': 'scroll',
                    'max-height': 'calc(100% - 72px)'}
                ">
        <v-stepper-items>
        <v-stepper-content step="1">
                    <div
                        v-for="elem in classerrorList">
                        <template v-if="elem.error_class">
                            <div class="m-card-list__title">{{elem.title + elem.name}}</div>
                            <div class="m-card-list__row">
                                <span class="m-card-list__cell">{{elem.error_class.key}}</span>
                                <span class="m-card-list__cell">
                                    <v-autocomplete
                                        class="pa-0 ma-0"
                                        v-model="elem.error_class.item_value.value"
                                        :items="elem.error_class.item_value.items"
                                        return-object
                                        item-text="name"
                                        item-value="name"
                                        persistent-hint
                                        placeholder=" "
                                        hide-details
                                        dense
                                        @change="onChange"
                                        />
                                </span>
                                <span class="m-card-list__cell m-card-list__cell--no-width px-1">
                                    <v-icon
                                        v-if='elem.error_class'
                                        color="#4e93e9"
                                        size="20"
                                        @click="showClue({
                                            name: elem.error_class.key,
                                            value: elem.key
                                        })">
                                        >
                                        mdi-help-circle-outline
                                    </v-icon>
                                </span>
                            </div>
                        </template>
                    </div>
        </v-stepper-content>
        <v-stepper-content step="2">
                    <div
                        v-for="elem in classerrorList">
                        <template v-if="elem.error_attr.length">
                            <div class="m-card-list__title">{{elem.name}}</div>
                            <div class="m-card-list__row" v-for="prop in elem.error_attr">
                                <span class="m-card-list__cell">{{prop.key}}</span>
                                <span class="m-card-list__cell py-0">
                                    <v-text-field
                                        v-if="prop.type == 'string'"
                                        class="ma-0 pa-0"
                                        placeholder=" "
                                        v-model="prop.item_value.value"
                                        hide-details
                                        >
                                    </v-text-field>
                                    <input
                                        v-else-if="prop.type == 'integer'"
                                        class="ma-0 pa-0 m-input--noattr"
                                        v-model="prop.item_value.value"
                                        @input="onlyInteger($event, prop)"
                                    >
                                    <input
                                        v-else-if="prop.type == 'float'"
                                        class="ma-0 pa-0 m-input--noattr"
                                        v-model="prop.item_value.value"
                                        @input="onlyFloat($event, prop)"
                                    >
                                    <v-simple-checkbox
                                        v-else-if="prop.type == 'boolean'"
                                        v-model="prop.item_value.value"
                                        class="ma-0"
                                        dense
                                        placeholder=" "
                                        hide-details
                                        color="primary"
                                    ></v-simple-checkbox>
                                    <v-textarea
                                        v-else-if="prop.type == 'text'"
                                        placeholder=" "
                                        v-model="prop.item_value.value"
                                        class="ma-0"
                                        multi-line
                                        hide-details
                                        rows="2">
                                    </v-textarea>
                                    <v-autocomplete
                                        v-else-if="prop.type == 'list'"
                                        class="pa-0 ma-0"
                                        v-model="prop.item_value.value"
                                        :items="prop.item_value.items"
                                        item-text="name"
                                        item-value="name"
                                        persistent-hint
                                        placeholder=" "
                                        hide-details
                                        dense
                                        />
                                </span>
                                <span class="m-card-list__cell m-card-list__cell--no-width px-1">
                                    <v-icon
                                        color="#4e93e9"
                                        size="20"
                                        @click="showClue({
                                            name: prop.key,
                                            value: prop.key == 'наименование системы'
                                                ? elem.key
                                                : prop.key
                                        })">
                                        >
                                        mdi-help-circle-outline
                                    </v-icon>
                                </span>
                            </div>
                        </template>
                    </div>
        </v-stepper-content>
        </v-stepper-items>
        </v-card-text>

          </v-stepper>

            <v-divider></v-divider>

            <v-card-actions
                class="pa-5 px-4">
                <v-btn outlined color="default" class="m-btn" @click="save">Сохранить</v-btn>
                <v-btn outlined color="default" class="m-btn"
                    :disabled="!getTagError"
                    @click="getReport">Отчет
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn outlined color="primary" class="m-btn" :disabled="!checkErrorReady" @click="next">Продолжить</v-btn>
                <v-btn outlined color="default" class="m-btn" @click="cancel">Отмена</v-btn>
            </v-card-actions>
        </v-card>

        <clue-sp333-attribute
            :clueBox.sync="clueBox"
            :SP333JSON="SP333JSON"
            :clueInfo="clueInfo"
            :step="step"
            />
    </v-dialog>
</template>

<script>
import ClueSp333Attribute from './ClueSp333Attribute'
import { http, api } from '@/utils/define'
import { v4 as uuidv4 } from 'uuid'
export default {
    name: 'SetSp333Attribute',
    components: {
        ClueSp333Attribute
    },
    props: {
        SP333attr: {
            type: Boolean,
            default: false
        },
        SP333JSON: {
            type: Object,
            default: {
                list: [],
                clue: []
            }
        },
        item: {
            type: Object,
            default: null
        }
	},
    data(){
        return {
            clueBox: false,
            clueInfo: null,
            step: 1,
            meta: null,
            errorJson: null,
            propertyJson: null,
            classerrorList: [],
            source: null
        }
    },
    computed: {
        getItem(){
            return !this.item
                ? {
                    sp333: {
                        value: ''
                    },
                    tags: {}
                }
                : this.item
        },
        checkErrorReady(){
            return true
            let check = true
            if(this.step == 1){
                this.classerrorList.map(e => {
                    if(e.error_class && !e.error_class.item_value.value){
                        check = false
                    }
                })
            }
            else{
                this.classerrorList.map(e => {
                    if(e.error_attr.length){
                         e.error_attr.map(m => {
                             if(m.type == 'list' && !m.item_value.value){
                                 check = false
                             }
                             else if(m.item_value.value == m.item_value.init_value){
                                 check = false
                             }
                         })
                    }
                })
            }
            if(!this.classerrorList.length){
                check = false
            }
            return check
        },
        getTagError(){
            let item = this.item
            if(!item){
                return false
            }
            else{
                if(this.item.tags['class.error.xlsx'] && this.item.tags['class.error.xlsx'] == 1){
                    return 'class.error.xlsx'
                }
                else if(this.item.tags['attribute.error.xlsx'] && this.item.tags['attribute.error.xlsx'] == 1){
                    return 'attribute.error.xlsx'
                }
                else{
                    return false
                }
            }
        }
    },
    watch: {
        clueBox(v){
            if(!v){
                this.clueInfo = null
            }
        },
        SP333attr(v){
            if(!v){
                this.classerrorList = []
            }
            else{
                this.getErrorJson()
            }
        }
    },
    methods: {
        cancel(){
            this.step = 1
            this.$emit('update:SP333attr', false)
        },
        onChange(o){
        },
        getFileByVersion(f){
            if(f.version == null){
                return f.files[0]
            }
            else{
                let file = f.files.find(i => i.id == f.version)
                return file ? file : f.files[0]
            }
        },
        getReport(){
            let tag = this.getTagError
            if(tag){
                let uuid = uuidv4()
                this.$store.dispatch('common/setUploadNote', [{
                    name: this.item.name,
                    uuid: uuid,
                    action: 'download',
                    pushin: true
                }])
                this.$store.dispatch('common/getFile', {
                    id: this.getFileByVersion(this.item).url + '/' + tag,
                    uuid: uuid,
                    typeBlob: 'blob'
                })
                .then(res => {
                    this.$store.dispatch('common/setUploadNote', [{
                        uuid: uuid,
                        action: 'download',
                        pushin: false
                    }])
                    if(!res.error){
                        let a = document.createElement("a")
                        let objectURL = URL.createObjectURL(res.file)
                        a.href = objectURL
                        a.download = this.item.name + '.' + tag
                        document.body.appendChild(a)
                        a.click()
                        URL.revokeObjectURL(objectURL)
                        a.remove()
                    }
                    else{
                        console.log('downloadFile error', err)
                    }
                })
                .catch(err => {
                    console.log('downloadFile error', err)
                })
            }
        },
        onlyInteger(e, o){
            o.item_value.value = e.target.value.replace(/[^0-9]/g, '')
        },
        onlyFloat(e, o){
            o.item_value.value = e.target.value.replace(/[^0-9.]/g, '')
        },
        next(){
            if(this.step == 1){
                this.step = 2
                this.getUpdateAttributes()
            }
            else{
                let body = {
                    Elements: this.classerrorList.map(c => {
                        return {
                            [c.obj || c.key]: {
                                ...((c) => {
                                    if(c.obj){
                                        return {
                                            Category: c.key
                                        }
                                    }
                                    else{
                                        return {}
                                    }
                                })(c),
                                [c.obj ? 'Id' : 'Guid']: c.id,
                                Name: c.name,
                                attrerr: {
                                    ...((c) => {
                                        if(c){
                                            return {
                                                [c.key]: {
                                                    val: c.item_value
                                                        ? c.item_value.value
                                                            ? c.item_value.value.name
                                                            : ''
                                                        : '',
                                                    code: c.code,
                                                    type: c.btype
                                                }
                                            }
                                        }
                                        else{
                                            return {}
                                        }
                                    })(c.error_class),
                                    ...((c) => {
                                        if(c){
                                            return Object.fromEntries(c.map(e => {
                                                return [e.key, {
                                                    code: e.code,
                                                    type: e.btype,
                                                    val: (e.item_value.value == null
                                                            ? ''
                                                            : e.item_value.value).toString()
                                                }]
                                            }))
                                        }
                                        else{
                                            return {}
                                        }
                                    })(c.error_attr)
                                }
                            }
                        }
                    })

                }
                this.$store.dispatch('workflow/convertationTag', {
                    uuid: this.getFileByVersion(this.item).url,
                    tag: 'attribute.add.json',
                    body: body,
                    force: true
                })
                .then(res => {
                    Promise.all([
                        this.$store.dispatch('workflow/getFolders'),
                    ])
                    .finally(res => {
                        this.$store.dispatch('workflow/createFoldersMap')
                    })
                },
                    er => {
                        console.log(er)
                })
                this.cancel()
            }
        },
        getUpdateAttributes(){
            let promisesList = []
            this.classerrorList.map(c => {
                if(c.error_class){
                    promisesList.push(this.getAttributes(c))
                }
            })
            Promise.all(promisesList)
            .then(res => {
                this.classerrorList = this.classerrorList.map(c => {
                    let item = res.find(f => f.id == c.id)
                    let attrs = {
                        ...Object.fromEntries(Object.entries(c.attrerr)
                            .map(([k, v]) => {
                                return [k.toLowerCase(), v]
                            }))
                    }
                    if(item){
                        item.response
                        .then(res => {
                            if(res){
                                attrs = {
                                    ...attrs,
                                    ...Object.fromEntries(Object.entries(res)
                                        .map(([k, v]) => {
                                            return [k.toLowerCase(), v]
                                        }))
                                }
                                c.error_attr = Object.entries(attrs)
                                    .map(([m, l]) => {
                                        return {
                                            key: m,
                                            item_value: l.list
                                                ? {
                                                    value: null,
                                                    items: l.list.map((l, i) => {
                                                        return {
                                                            id: i,
                                                            name: l
                                                        }
                                                    })
                                                }
                                                : {
                                                    init_value: l.ftype == 'boolean'
                                                        ? 'boolean'
                                                        : l.val || '',
                                                    value: l.ftype == 'boolean'
                                                        ? l.val
                                                            ? true : false
                                                        : l.val || ''
                                                },
                                            type: l.list
                                                ? 'list'
                                                : l.ftype,
                                            btype: l.type,
                                            code: l.code
                                        }
                                    })
                                    .filter(f => f.key != 'наименование компонента' && f.key != 'тип помещения или зоны')

                                let meta_file = null
                                if(this.meta){
                                    let meta = JSON.parse(this.decodeHtmlCharCodes(this.meta))
                                    meta_file = meta.files
                                        ? meta.files.find(f => (f.versionID || f.i) == this.item.versionID)
                                        : null
                                }
                                if(meta_file){
                                    let elem = (meta_file.classerrorList || meta_file.l).find(e => (e.id || e.i) == c.id)
                                    if(elem && (elem.error_attr || elem.a).length){
                                        c.error_attr = c.error_attr.map(a => {
                                            let attr = (elem.error_attr || elem.a).find(f => (f.key || f.k) == a.key)
                                            if(attr){
                                                a.item_value.value = (attr.value || attr.v)
                                            }
                                            return a
                                        })
                                    }
                                }
                            }
                        })
                    }
                    return c
                })
            })
        },
        showClue(o){
            let rcls = ''
            switch(o.name){
                case 'наименование компонента': rcls = 'Com'
                    break
                case 'наименование системы': rcls = 'TeS'
                    break
                default: rcls = 'Prp'
            }
            this.$store.dispatch('workflow/getClue', {
                req:
            [{
                "rcls": rcls,
                "name": o.value
            }]
            })
            .then(res => {
                this.clueInfo = res.resp[0]
            },
                er => {
                    console.log(er)
            })

            this.clueBox = true
        },
        getAttributes(e){
            return new Promise(resolve => {
                resolve({
                    id: e.id,
                    response: this.$store.dispatch('workflow/getAttributes', {
                        class: e.key,
                        name: e.error_class
                            ? e.error_class.item_value.value
                                ? e.error_class.item_value.value.name
                                : ''
                            : '',
                        source: this.source
                    })
                })
            })
        },
        save(){
            let file = {
                i: this.item.versionID,
                l: this.classerrorList.map(({id, error_attr, error_class}) => {
                    error_attr = error_attr.map(e => ({k: e.key, v: e.item_value.value}))
                    error_class = error_class
                        ? {k: error_class.key, v: error_class.item_value.value}
                        : null
                    return {
                        i: id,
                        a: error_attr,
                        c: error_class
                    }
                })
            }

            let meta = this.meta
                ? JSON.parse(this.decodeHtmlCharCodes(this.meta))
                : {}
            if(meta.files){
                let check = meta.files.find(f => (f.versionID || f.i) == this.item.versionID)
                if(check){
                    meta.files = meta.files.map(f => (f.versionID || f.i) == this.item.versionID
                        ? file
                        : f
                    )
                }
                else{
                    meta.files = [...meta.files, file]
                }
            }
            else{
                meta.files = [file]
            }

            let url = this.item.files.filter(f => f.id == this.item.versionID)[0].url
            this.$store.dispatch('common/setFileMeta', {
                id: this.item.id,//url,
                body: JSON.stringify(meta)
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
        },
        createShortName(str){
            str = str.split('.')
            let type = str.splice(-1, 1)[0]
            return str.join('.')
        },
        getErrorJson(){
            this.$store.dispatch('common/getFileMeta', {
                id: this.item.id//url
            })
            .then(res => {
                this.meta = res
                return this.$store.dispatch('common/getFileInfo', {
                    id: this.getFileByVersion(this.item).url + '/' + this.item.sp333.type + '.json'
                })
            })
            .then(res => {
                this.errorJson = res.Elements
                this.source = res.Source || null
                this.getError_(res.Elements)
                if(this.item.sp333.type == 'attribute.error'){
                    this.next()
                }
            },
                er => {
                    this.errorJson = []
            })
        },
        decodeHtmlCharCodes(str){
            return str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
                String.fromCharCode(charCode)
            )
        },
        getError_(elems){
            let meta_file = null
            if(this.meta){
                let meta = JSON.parse(this.decodeHtmlCharCodes(this.meta))

                meta_file = meta.files
                    ? meta.files.find(f => (f.versionID || f.i) == this.item.versionID)
                    : null
            }
            let list = elems.map(e => {
                let item = {}
                Object.entries(e).map(([k, v]) => {
                    let type = 0
                    item = {
                        obj: v.Category ? k : null,
                        key: v.Category || k,
                        title: v.Id || v.Guid ? 'ID: ' + (v.Id || v.Guid) + ' | ' : '',
                        id: v.Id || v.Guid,
                        name: v.Name,
                        attrerr: v.attrerr,
                        error_class: null,
                        error_attr: []
                    }
                    if(!v.attrerr['наименование компонента'] && !v.attrerr['тип помещения или зоны']){
                        type = 1
                    }
                    let items = Object.entries(v.attrerr)
                        .map(([m, l]) => {
                            return {
                                key: m,
                                item_value: m == 'наименование компонента' || l.list
                                    ? {
                                        value: null,
                                        items: l.list.map(l => {
                                            return {
                                                id: v.Id || v.Guid,
                                                name: l
                                            }
                                        })
                                    }
                                    : {
                                        init_value: l.ftype == 'boolean'
                                            ? 'boolean'
                                            : l.val || '',
                                        value: l.ftype == 'boolean'
                                            ? l.val
                                                ? true : false
                                            : l.val || ''
                                    },
                                type: l.list
                                    ? 'list'
                                    : l.ftype,
                                btype: l.type,
                                code: l.code
                            }
                        })
                    item.error_class = items.find(f => f.key == 'наименование компонента' || f.key == 'тип помещения или зоны') || null
                    item.error_attr = items.filter(f => f.key != 'наименование компонента' && f.key != 'тип помещения или зоны')

                    if(meta_file){
                        let elem = (meta_file.classerrorList || meta_file.l).find(e => (e.id || e.i) == item.id)
                            // console.log('способ открывания', elem)
                        if(elem && (elem.error_class || elem.c)){
                            item.error_class.item_value.value = (elem.error_class || elem.c).value || (elem.error_class || elem.c).v
                        }

                        if(elem && (elem.error_attr || elem.a).length){
                            item.error_attr = item.error_attr.map(a => {
                                let attr = (elem.error_attr || elem.a).find(f => (f.key || f.k) == a.key)
                                if(attr){
                                    a.item_value.value = (attr.value || attr.v)
                                }
                                return a
                            })
                        }
                    }
                })
                return item
            })
            this.classerrorList = list
        }
    }
}
</script>
