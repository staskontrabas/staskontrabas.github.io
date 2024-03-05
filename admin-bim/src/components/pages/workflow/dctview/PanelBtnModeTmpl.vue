<template>
    <v-card-title class="pa-0">
        <div class="pr-0 pl-1 py-1 m-panel__collision--options">
            <v-btn
                class="m-btn"
                text
                tile
                dense
                :disabled="!list.length || !activeClsn"
                :color="activeBox ? 'primary' : 'default'"
                @click="turnActiveBox">
                <v-icon
                    left
                    size="20">trd-section</v-icon><span class="m-text--size12">Показать</span>
            </v-btn>

            <icon-botton
                class="mr-4"
                :disabled="!list.length"
                :color="activeClsn && list.length? 'primary' : 'default'"
                @onClick="turnActiveClsn"
                >trd-cube_hide
            </icon-botton>

            <icon-botton
                class="mr-4"
                :disabled="!list.length"
                :color="activeOnly && list.length? 'primary' : 'default'"
                @onClick="turnActiveOnly"
                >trd-cube_show
            </icon-botton>

            <icon-botton
                class="mr-4"
                :disabled="selectedItem.type != 'level'"
                :color="sectionActive ? 'primary' : 'default'"
                @onClick="onSection"
                >trd-plane
            </icon-botton>

        </div>
    </v-card-title>
</template>

<script>
import IconBotton from '@/components/custom/IconBotton'

export default {
    name: 'PanelBtnModeTmpl',
    components: {
        IconBotton
    },
    props: ['menuItem', 'list', 'selectedItem', 'postMessage'],
    data(){
        return {
            mode: [{
                name: 'clsn',
                value: false
            },{
                name: 'box',
                value: false
            },{
                name: 'only',
                value: false
            }],
            items: [],
            sectionActive: false
        }
    },
    computed: {
        // getType(){
        //     let elem =
        //     return this.list
        // },
        activeClsn: {
            get(){
                return this.mode.find(f => f.name == 'clsn').value
            },
            set(v){
                this.mode = this.mode.map(m => {
                    if(m.name == 'clsn'){
                        m.value = v
                    }
                    return m
                })
            }
        },
        activeBox: {
            get(){
                return this.mode.find(f => f.name == 'box').value
            },
            set(v){
                this.mode = this.mode.map(m => {
                    if(m.name == 'box'){
                        m.value = v
                    }
                    return m
                })
            }
        },
        activeOnly: {
            get(){
                return this.mode.find(f => f.name == 'only').value
            },
            set(v){
                this.mode = this.mode.map(m => {
                    if(m.name == 'only'){
                        m.value = v
                    }
                    return m
                })
            }
        },
    },
    watch: {
        menuItem: {
            handler(v){
                if(!v.active){
                    if(this.activeClsn){
                        this.turnActiveClsn()
                    }
                    if(this.activeOnly){
                        this.turnActiveOnly()
                    }
                    if(this.sectionActive){
                        this.onSection()
                    }
                }
            },
            deep: true
        },
        list(v){
            if(v){
                if(this.activeClsn){
                    this.onActiveMode('clsn', false)
                }
                this.items = v
                this.mode.map(m => {
                    if(m.value){
                        this.onActiveMode(m.name, true)
                    }
                })
            }
            else{
                if(this.activeClsn){
                    this.turnActiveClsn()
                }
                if(this.activeOnly){
                    this.turnActiveOnly()
                }
            }
        }
    },
    methods: {
        onSection(){
            this.sectionActive = !this.sectionActive
            this.postMessage({
                action: 'onSection',
                value: 'plane',
                sts: this.sectionActive,
                id: this.selectedItem.id
            })
        },
        turnActiveClsn(){
            this.activeClsn = !this.activeClsn
            if(this.activeOnly){
                this.onActiveMode('only', false)
                this.activeOnly = false
            }
            if(!this.activeClsn){
                if(this.activeBox){
                    this.turnActiveBox()
                }
            }
            this.onActiveMode('clsn', this.activeClsn)
        },
        turnActiveBox(){
            this.activeBox = !this.activeBox
            if(this.activeOnly){
                this.onActiveMode('only', false)
                this.activeOnly = false
            }
            this.onActiveMode('box', this.activeBox)
        },
        turnActiveOnly(){
            this.activeOnly = !this.activeOnly
            if(this.activeBox){
                this.onActiveMode('box', false)
                this.activeBox = false
            }
            if(this.activeClsn){
                this.onActiveMode('clsn', false)
                this.activeClsn = false
            }
            this.onActiveMode('only', this.activeOnly)
        },
        onActiveMode(mode, a){
            let items = this.items
            if(!items.length){
                return
            }

            switch(mode){
                case 'clsn':
                    this.onObjectsHighlight({list: items, active: a})
                    break
                case 'box':
                    this.onCreateSectionBoxForObjects({list: items, active: a})
                    break
                case 'only':
                    this.onShowObjectsOnly({list: items, active: a})
                    break
                default: ;
            }
        },
        onObjectsHighlight(v){
            this.postMessage({
                action: 'onObjectsHighlight',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
        },
        onShowObjectsOnly(v){
            this.postMessage({
                action: 'onShowObjectsOnly',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
        },
        onCreateSectionBoxForObjects(v){
            this.postMessage({
                action: 'onCreateSectionBoxForObjects',
                value: {
                    list: v.list,
                    active: v.active
                }
            })
        },
    },
}
</script>

<style>
</style>
