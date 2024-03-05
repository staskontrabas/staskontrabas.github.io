<template>
<v-dialog :value="specification_xml" scrollable max-width="700px" @input="v => v || cancel()">
    <v-card>
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Описание документа
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

        <v-card-text class="px-4" ref="body">
            <div class="py-4 m-text--color-black">Для правильной работы XML схемы вся сопроводительная документация должна быть представлена в цифровом виде, для этого заполните нижеуказанные поля.</div>

            <v-row>
                <v-col cols="12" sm="12" md="12">
                    <v-autocomplete
                        class="m-select"
                        :items="items"
                        v-model="metaType"
                        item-text="name"
                        item-value="id"
                        persistent-hint
                        return-object
                        label="Выберите тип, к которому относится документ"
                        placeholder=" "
                        hide-details
                        @change="checkType"
                    >
                        <template v-slot:item="{ active, item, attrs, on }">
                            <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
                                <v-list-item-content>
                                    <v-list-item-title
                                        class="m-list-item__title"
                                        >
                                        {{item.name}}
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row v-if="sections.length">
                <v-col cols="12" sm="12" md="12">
                    <v-autocomplete
                        class="m-select"
                        v-model="selecttype"
                        :items="sections"
                        item-text="name"
                        item-value="id"
                        persistent-hint
                        return-object
                        label="Выберите подгруппу, к которой относится документ"
                        placeholder=" "
                        hide-details
                        @change=""
                    >
                        <template v-slot:item="{ active, item, attrs, on }">
                            <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
                                <v-list-item-content>
                                    <v-list-item-title
                                        class="m-list-item__title"
                                        >
                                        {{item.name}}
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row v-for="item in selecttype.items">
                <v-col cols="12" sm="12" md="12" class="m-label">
                    <v-text-field
                        v-if="item.Type == 'Text' || item.Type == 'String'"
                        class="m-select pt-0"
                        :label="item.Name"
                        placeholder=" "
                        v-model="item.value"
                        hide-details
                    >
                        <template #label><div>{{item.Name}}</div>
                        </template>
                    </v-text-field>
                    <v-text-field
                        v-else-if="item.Type == 'Integer'"
                        type="number"
                        class="m-select pt-0"
                        :label="item.Name"
                        placeholder=" "
                        v-model="item.value"
                        hide-details
                    ></v-text-field>
                    <v-switch
                        v-else-if="item.Type == 'Boolean'"
                        class="pt-0"
                        v-model="item.value"
                        :label="item.Name"
                        inset
                        color="success"
                    ></v-switch>
                    <date-xml
                        v-else-if="item.Type == 'Date'"
                        :item="item"
                        @setValue="setValue"
                        />
                    <v-textarea
                        v-else-if="item.Type == 'TextArea'"
                        class="pt-0"
                        placeholder=" "
                        v-model="item.value"
                        :label="item.Name"
                        multi-line
                        hide-details
                        rows="2">
                    </v-textarea>
                </v-col>
            </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-spacer></v-spacer>
            <v-btn outlined color="primary" class="m-btn" @click="saveChange">Сохранить
            </v-btn>
            <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="cancel">Отмена</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>
</template>

<script>
import DateXml from './specification_xml/DateXml'
export default {
    name: 'SpecificationXml',
    components: {
        DateXml
    },
    props: ['specification_xml', 'item'],
    data(){
        return {
            selecttype: {items: []},
            date: null,
            menu: false,
            items: [],
            metaType: '',
            sections: []
        }
    },
    watch: {
        specification_xml(v){
            if(v){
                document.addEventListener('keyup', this.enter, false)

                this.$store.dispatch('common/getJsonXml')
                .then(res => {
                    this.setItems(res)
                },
                    er => {
                        this.items = []
                    }
                )
            }
            else{
                document.removeEventListener('keyup', this.enter, false)
                this.items = []
            }
        }
    },
    methods: {
        cancel(){
            this.metaType = ''
            this.selecttype = {items: []}
            this.$emit('update:specification_xml', false)
        },
        setValue(o){
            o.item.value = o.value
        },
        checkType(t){
            if(t.items.some(s => s.Name)){
                this.selecttype.items = []
                this.sections = t.items.map((m, i) => {
                    return {
                        id: 'sec' + i,
                        name: m.Name,
                        items: m.Fields.map(f => {
                            return {
                                ...f,
                                value: ((f) => {
                                    if(f.Type == 'Boolean'){
                                        return f.value || false
                                    }
                                    else if(f.Type == 'Date'){
                                        return f.value
                                            ? new Date(f.value).toISOString().substr(0, 10)
                                            : null
                                    }
                                    else{
                                        return f.value || ''
                                    }
                                })(f)
                            }
                        })
                    }
                })
            }
            else{
                this.sections = []
                this.selecttype.items = t.items[0].Fields.map(f => {
                    return {
                        ...f,
                        value: ((f) => {
                            if(f.Type == 'Boolean'){
                                return f.value || false
                            }
                            else if(f.Type == 'Date'){
                                return f.value
                                    ? new Date(f.value).toISOString().substr(0, 10)
                                    : null
                            }
                            else{
                                return f.value || ''
                            }
                        })(f)
                    }
                })
                this.selecttype.id = ''
                this.selecttype.name = ''
            }
        },
        setItems(items){
            let list = Object.entries(items).map(([k, v], i) => {
                return {
                    id: i,
                    name: k,
                    items: v
                }
            })
            if(this.item.meta){
                let meta = JSON.parse(this.decodeHtmlCharCodes(this.item.meta)) || false

                if(meta && meta.f){
                    let type = meta.n
                    list = list.map(l => {
                        if(l.name == type){
                            this.metaType = l

                            let sub = null
                            l.items = l.items.map((i, x) => {
                                let elem = false
                                let ar = i.Fields.map(a => {
                                    if(i.Name){
                                        sub = i.Name
                                    }

                                    elem = meta.f[i.Name || '']
                                    if(elem){
                                        elem = elem.find(e => e.n == a.Name)
                                    }
                                    return {
                                        ...a,
                                        value: elem
                                            ? a.Type == 'Date'
                                                ? new Date(JSON.parse(elem.v)).toISOString().substr(0, 10)
                                                : a.Type == 'Boolean'
                                                    ? JSON.parse(elem.v)
                                                    : elem.v
                                            : ''
                                    }
                                })
                                if(elem){
                                    this.selecttype = {
                                        id: 'sec' + x,
                                        name: i.Name,
                                        items: ar
                                    }
                                }
                                return {
                                    ...i,
                                    Fields: ar
                                }
                            })
                            if(sub){
                                this.sections = l.items.map((i, x) => {
                                    return {
                                        items: i.Fields,
                                        id: 'sec' + x,
                                        name: i.Name
                                    }
                                })
                            }
                        }
                        return l
                    })
                }
            }
            this.items = list
        },
        transDate(date){
            const [year, month, day] = date.split('-')
            let delta = new Date().getTimezoneOffset()

            let bd = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), (Math.abs(delta) / 60))
            let mbd = bd.getTime(bd)
            return(mbd)
        },
        getMeta(){
            let meta = {
                n: this.metaType.name,
                f: {
                    [this.selecttype.name]: [...this.selecttype.items.map(i => {
                    return {
                        n: i.Name,
                        v: i.Type == 'String' || i.Type == 'Text' || i.Type == 'Integer' || i.Type == 'TextArea'
                            ? i.value.toString()
                            : i.Type == 'Boolean'
                                ? i.value.toString() //? 1 : 0
                                : i.Type == 'Date'
                                    ? this.transDate(i.value).toString()
                                    : i.value.toString()
                        ,
                        t: i.Type == 'String' || i.Type == 'Text' || i.Type == 'TextArea'
                            ? 'S'
                            : i.Type == 'Boolean' || i.Type == 'Integer' || i.Type == 'Date'
                                ? 'I'
                                : 'F'
                    }
                })]}
            }
            return JSON.stringify(meta)
        },
        decodeHtmlCharCodes(str){
            return str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
                String.fromCharCode(charCode)
            )
        },
        saveChange(){
            let file = this.$store.state.workflow.listDocs.find(i => i.id == this.item.id)
            this.$store.dispatch('workflow/addDoc', {
                id: this.item.id,
                name: file.name,
                order: file.order,
                folder: file.folder,
                meta: this.getMeta()
            })
            .then(res => {
                this.$store.dispatch('workflow/updateDocInState', {
                    ...res,
                    name_short: this.createShortName(res.name)
                })
            })
            this.cancel()
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.saveChange()
            }
        },
        createShortName(str){
            str = str.split('.')
            str.splice(-1, 1)[0]
            return str.join('.')
        }
    }
}
</script>
