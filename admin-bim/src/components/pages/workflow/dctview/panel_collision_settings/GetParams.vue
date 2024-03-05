<template>
    <v-card class="m-panel__collision">
        <v-card-title class="pr-0 pl-4 m-modal--title">
            Выберите параметр
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
                clearable
                prepend-inner-icon="search"
                placeholder="Поиск..."
                single-line
                hide-details
            ></v-text-field>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4" style="background-color: #fbfbfb;">
            <v-row dense>
                <v-col
                    :cols="12"
                >
                    <v-card
                        class="ml-2 pa-0"
                        flat
                        min-height="250"
                        outlined
                    >
                        <v-card-text class="m-text--color-black pa-0">
                            <v-list flat dense class="pa-0">
                                <v-list-item
                                    v-show="this.list.length"
                                    @click="onAll()"
                                    :class="[{'v-list-item--active': this.selected.length == this.list.length}, 'primary--text']"
                                    >Все
                                </v-list-item>
                                <v-list-item-group
                                    v-model="selected"
                                    multiple
                                    color="primary"
                                    class="pa-0">
                                    <v-list-item
                                        v-for="item in list"
                                        :value="item"
                                        >{{item.name}}
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-spacer></v-spacer>
            <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="setComponent">Отмена</v-btn>
            <v-btn outlined color="primary" class="m-btn" @click="add">Добавить
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>

export default {
    name: 'GetParams',
    props: ['temp', 'elementParameters', 'source', 'model'],
    data(){
        return {
            search: '',
            selected: []
        }
    },
    computed: {
        list(){
            let list = this.elementParameters.find(p => p.name == this.temp.element.name)
            list = list
                ? list.values
                    .filter(f => !this.temp.element.values.some(s => s.name == f.name))
                    .filter(f => f.name.toLowerCase().includes((this.search || '').toLowerCase()))
                : []
            return list
        }
    },
    methods: {
        cancel(){
            this.$emit('cancel')
        },
        setComponent(){
            this.$emit('setComponent')
        },
        add(){
            let update = JSON.parse(JSON.stringify(this.temp))
            let elements = update['elements' + this.temp.list || ''] || []
            if(elements.length){
                elements = elements.map(e => {
                    return {
                        ...e,
                        selected: [],
                        values: update.element.name == e.name
                            ? [...e.values, ...this.selected]
                            : e.values
                    }
                })
            }
            else{
                elements = [{
                    name: update.element.name,
                    selected: [],
                    values: this.selected
                }]
            }
            update = {...update, ['elements' + this.temp.list || '']: elements}
            this.$emit('setParams', update)

            this.setComponent()
        },
        onAll(){
            if(this.selected.length == this.list.length){
                this.selected = []
            }
            else{
                this.selected = this.list
            }
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.cancel()
            }
        },
    },
    created(){
        let name = this.elementParameters.find(s => s.name == this.temp.element.name)
// console.log('elementParameters', this.temp)
        if(!name){
            if(this.temp.std == 'ksi'){
                this.$store.dispatch('workflow/getParameters', {name: this.temp.element.name, source: this.source})
                .then(res => {
                    if(res){
                        this.elementParameters.push({
                            name: this.temp.element.name,
                            values: Object.entries(res).map(([k, v]) => {
                                return {
                                    name: k,
                                    syn: v.syn || null,
                                    value: v.ftype == 'boolean'
                                        ? false
                                        : '',
                                    code: 0,
                                    equal: '',
                                    type: v.list
                                        ? 'list'
                                        : v.ftype,
                                    list: v.list
                                        ? v.list
                                        : null
                                }
                            })
                        })
                    }
                })
                .catch(er => {
                    console.log('Error get parameters:', er)
                })
            }
            else if(this.temp.std == 'bim'){
                let prmslist = []
                if(this.model.type == 'consolidations'){
                    this.model.consolidations.map(c => {
                        let doc = this.$store.state.workflow.listDocs.find(f => f.id == c)
                        let url = ''
                        if(doc.version == null){
                            url = doc.files[0].url
                        }
                        else{
                            let file = doc.files.find(i => i.version == doc.version)
                            url = file ? file.url : doc.files[0].url
                        }
                        prmslist.push(this.$store.dispatch('common/getFileInfo', {id: url + '/allattrs.json'}))
                    })
                }
                else{
                    let url = ''
                    if(this.model.version == null){
                        url = this.model.files[0].url
                    }
                    else{
                        let file = this.model.files.find(i => i.version == this.model.version)
                        url = file ? file.url : this.model.files[0].url
                    }
                    prmslist.push(this.$store.dispatch('common/getFileInfo', {id: url + '/allattrs.json'}))
                }
                Promise.all(prmslist)
                .then(res => {
                    console.log('elementParameters model', res)
                    let params = {}
                    res.map(r => {
                        let cnames = Object.keys(r)
                        cnames.map(cn => {
                            if(!params[cn]){
                                params[cn] = r[cn]
                            }
                            else{
                                let enames = Object.keys(r[cn])
                                enames.map(en => {
                                    if(!params[cn][en]){
                                        params[cn][en] = r[cn][en]
                                    }
                                    else{
                                        params[cn][en].syn = [...(params[cn][en].syn || []), ...(r[cn][en].syn || [])]
                                    }
                                })
                            }
                        })
                    })

                    let el = params[this.temp.element.name]
                    this.elementParameters.push({
                        name: this.temp.element.name,
                        values: Object.entries(el).map(([k, v]) => {
                            let item = {
                                name: k,
                                value: v.ftype == 'boolean'
                                    ? false
                                    : '',
                                code: 0,
                                equal: '',
                                type: v.list
                                    ? 'list'
                                    : v.ftype,
                                list: v.list
                                    ? v.list
                                    : null
                            }
                            if(v.syn){
                                item.syn = v.syn
                            }
                            return item
                        })
                    })
                })
                .catch(er => {
                    console.log('Error get parameters:', er)
                })
            }
            else{
                ;
            }
        }
    },
    mounted(){
        document.addEventListener('keyup', this.enter, false)
    },
    beforeDestroy(){
        document.removeEventListener('keyup', this.enter, false)
    }
}
</script>
