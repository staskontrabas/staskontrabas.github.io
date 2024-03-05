<template>
    <v-card
        class="m-panel__property m-card-scrollable"
        style="width: auto !important;"
        >
        <v-card-title class="pr-18 pl-0 py-0 m-modal--title-size14 m-card-scrollable__title">

            <v-tabs
                v-model="tab"
                ref="tabs"
                color="primary"
                height="45"
            >
                <v-tabs-slider color="primary"></v-tabs-slider>
                <v-tab
                    v-for="item in items"
                    :key="item.name"
                >{{item.title}}
                </v-tab>
            </v-tabs>

            <v-spacer></v-spacer>
            <v-btn
                text
                icon
                class="m-btn--close-top m-btn--close-top__right2"
                @click="minimizeTabs"
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

        <div class="panel-tabs--wrap d-flex">
            <!--
                <component
                    v-for="(item, index) in items"
                    v-show="index == tab"
                    :is="item.component"
                    :model="model"
                    :active="active"
                    :part="part"
                    :level="level"
                    :cname="cname"
                />
            -->
            <components
                :elems="getItems"
                :part="part"
                :level="level"
                :cname="cname"
            />

            <v-card
                flat
                tile
                class="panel-tabs--options pa-3"
                >
                <div class="m-text--size12 m-text--color-2c2c2c">Фильтры</div>

                <v-card-actions class="pa-5 px-0 d-block">
                    <v-btn
                        outlined
                        :color="part ? 'primary' : 'normal'"
                        class="m-btn m-btn--float"
                        :class="{'m-btn-normal': !part}"
                        @click="setFilter('part')">Раздел П87</v-btn>
                    <v-btn
                        outlined
                        :color="level ? 'primary' : 'normal'"
                        class="m-btn m-btn--float"
                        :class="{'m-btn-normal': !level}"
                        @click="setFilter('level')">Местоположение</v-btn>
                    <v-btn
                        outlined
                        :color="cname ? 'primary' : 'normal'"
                        class="m-btn m-btn--float"
                        :class="{'m-btn-normal': !cname}"
                        @click="setFilter('cname')">Компоненты</v-btn>
                </v-card-actions>

                <v-divider></v-divider>
                <v-card-actions class="pa-5 px-0">
                    <v-btn outlined color="normal" class="m-btn m-btn-normal" @click.stop="">Показать</v-btn>
                    <v-btn outlined color="normal" class="m-btn m-btn-normal" @click="getXLSX">Выгрузить XLSX
                    </v-btn>
                </v-card-actions>
            </v-card>

        </div>
    </v-card>
</template>

<script>
import Components from './panel-tabs/Components'
// import Rooms from './panel-tabs/Rooms'
import { v4 as uuidv4 } from 'uuid'

export default {
    name: 'PanelTabs',
    components: {
        Components,
        // Rooms
    },
    props: ['menuItem', 'model', 'active', 'minimize', 'files'],
    data: () => ({
        items: [{
            name: 'components',
            title: 'Компоненты',
            component: 'Components',
            propName: 'Elements'
        },{
            name: 'rooms',
            title: 'Зоны и помещения',
            component: 'Rooms',
            propName: 'Zones'
        }],
        tab: null,
        part: false,
        level: false,
        cname: false,
        params: null
    }),
    computed: {
        getItems(){
            if(!this.params){
                return null
            }
            else{
                return this.params[this.items[this.tab]['propName']]
            }
        }
    },
    watch: {
        active(v){
            if(v && !this.params){
                if(!this.tab){
                    this.tab = 0
                }

                let prmslist = []
                this.files.map(file => {
                    prmslist.push(this.$store.dispatch('common/getFileInfo', {id: file + '/group.json'}))
                })


                Promise.all(prmslist)
                .then(result => {
                    console.log('ssssss', result)
                    let params = {}
                    result.map(res => {
                        params.Elements = params.Elements
                            ? {...params.Elements, ...res.Elements}
                            : res.Elements
                        params.Zones = params.Zones
                            ? {...params.Zones, ...res.Zones}
                            : res.Zones
                    })
                    this.params = params
                })
                .catch(er => {
                    console.log(er)
                })
                // this.$store.dispatch('common/getFileInfo', {id: file.url + '/group.json'})
                // .then(res => {
                //     this.params = res
                // })
                // .catch(er => {
                //     console.log(er)
                // })
            }
            if(v){
                this.$refs.tabs.callSlider()
            }
        },
    },
    methods: {
        cancel(){
            this.$emit('setOption', this.menuItem)
        },
        minimizeTabs(){
            this.$emit('updateOption', {
                item: this.menuItem,
                prop: 'minimize',
                value: !this.minimize
            })
        },
        setFilter(filter){
            switch(filter){
                case 'part': this.part = !this.part
                    break
                case 'level': this.level = !this.level
                    break
                case 'cname': this.cname = !this.cname
                    break
                default: ;
            }
        },
        getXLSX(){
            let file = ''
            if(this.model.version == null){
                file = this.model.files[0]
            }
            else{
                file = this.model.files.find(i => i.version == this.model.version)
                file = file ? file : this.model.files[0]
            }

            let uuid = uuidv4()
            this.$store.dispatch('common/setUploadNote', [{
                name: this.model.name,
                uuid: uuid,
                action: 'download',
                pushin: true
            }])
            this.$store.dispatch('common/getFile', {
                id: file.url + '/group.xlsx',
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
                    a.download = this.model.name_short + '.xlsx'
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
    }
}
</script>

<style lang="less">
.panel-tabs--options{
    min-width: 300px;
    height: 100%;
    z-index: 100;
}
.panel-tabs--wrap{
    flex: 1 1 auto;
    overflow-y: auto;
}

&.v-application--is-ltr .v-card__actions > .v-btn.v-btn + .v-btn.m-btn--float {
    margin-left: 0 !important;
}
&.v-application--is-ltr .v-card__actions > .v-btn.v-btn.m-btn--float{
    margin-right: 8px !important;
    margin-bottom: 8px !important;
}
</style>
