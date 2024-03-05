<template>

    <v-card
        class="m-card-scrollable"
        :class="{'m-panel__hidden': minimize}"
        :style="styleP"
        >
        <v-card-title class="namePanelSearch">Поиск элементов
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

        <div class="search">
            <input type="text" class="search-field" v-model="message" values='message' placeholder="Введите поисковый запроc">
            <v-btn outlined color="normal" class="bottom_search" @click="search();"><img src="../../../../assets/fonts/search_icon.svg" alt="" class="search-icon"></v-btn>   
                <v-btn text @click="dialog = true;" color="primary" class="arrow-btn"><img src="../../../../assets/fonts/icon_arrow.svg" alt="" class="arrow-icon"></v-btn>
                <v-dialog
                v-model="dialog"
                max-width="200"
                content-class="my-custom-dialog"
                >
                <v-card max-height="85">
                    <div>
                        <v-checkbox label="Учитывать регистр" @click="setChoiceRegister();" class="buttonRegister"></v-checkbox>
                        <v-checkbox label="Значение целиком" @click="setChoiceWholly();" class="buttonWholly"></v-checkbox>
                    </div>
                </v-card>
                </v-dialog>
        </div>

        
        <v-card-text
            class="pa-0 pb-5 m-card-scrollable__text">

            <v-card-actions class="bottoms">
                    <v-btn outlined :color="one ? 'primary' : 'normal'" class="m-btn m-btn--float" :class="{'m-btn-normal': !one}" @click="typeSearch = 'id'; setFilter('one');search();">ID</v-btn>
                    <v-btn outlined :color="two ? 'primary' : 'normal'" class="m-btn m-btn--float" :class="{'m-btn-normal': !two}" @click="typeSearch = 'Name'; setFilter('two');search();">Наименование</v-btn>
                    <v-btn outlined :color="three ? 'primary' : 'normal'" class="m-btn m-btn--float" :class="{'m-btn-normal': !three}" @click="typeSearch = 'Parameters'; setFilter('three');search();">Свойства</v-btn>
                    <v-btn outlined :color="four ? 'primary' : 'normal'" class="m-btn m-btn--float" :class="{'m-btn-normal': !four}" @click="typeSearch = 'Category'; setFilter('four');search();">Тип класса</v-btn>
            </v-card-actions>


    <v-card-title class="pa-0">
      

    </v-card-title>

    <v-list dense>
      <v-subheader class="panelResults">Результат</v-subheader>

      <div class="bottom_id">
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

        </div>

      <v-list-item-group
        v-model="selectedItem"
        color="primary"
        dense
      >
        <v-list-item
          v-for="(item, i) in ParamSearch"
          :key="i"
        >

          <v-list-item-content class="resultsForPanel">
            <v-list-item-title v-if="typeSearch == 'Name'" v-text="item.Name" @click="EnterId(selectedItem);"></v-list-item-title>
            <v-list-item-title v-if="typeSearch == 'id'" v-text="item.id" @click="EnterId(selectedItem);"></v-list-item-title>
            <v-list-item-title v-if="typeSearch == 'Category'" v-text="item.Category" @click="EnterId(selectedItem);"></v-list-item-title>
           
            <div v-if="typeSearch == 'Parameters'" @click="EnterId(selectedItem);">
            <v-data-table
            :header-props="{ sortIcon: null }"
            :label="setParameters(i)"
            :headers="nameHeaders"
            :items="DataTables"
            :border="true"
            :divider="2"
            :item-class= "row_classes"   
            :hide-default-header="false"
            :hide-default-footer="true"
            >
            </v-data-table>
            </div>

            </v-list-item-title>
            
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>    

        </v-card-text>

    </v-card>


    
</template>

<script>
import IconBotton from '@/components/custom/IconBotton'
import Components from './panel-tabs/Components'

export default {
    name: 'PanelSearch',
    components: {
        IconBotton
    },
    props: ['menuItem', 'list', 'postMessage','worker','ParamSearch','styleP'],
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
            nameHeaders: [   
          {
            text: '',
            align: 'start',
            sortable: false,
            value: 'title',
          },
          { text: '', value: 'value' },
        ],
        DataTables: [
          {
            title: '',
            value: 0,
          },
        ],
            items: [],
            visible: false,
            dialog: false,
            selectedItem: -1,
            minimize: false,
            message: '',
            typeSearch: 'Name',
            searchWord: '',
            one: false,
            two: true,
            three: false,
            four: false,
            choiceRegistr: false,
            choiceWholly: false,
            listTreeView: [
                {   
                    name: '',
                    children: [
                        { id: 1, name: 'Учитывать регистр'},
                        { id: 2, name: 'Значение целиком'},
                    ]
                }
              ]
        }
    },
    computed: {
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
        setChoiceRegister(){
            this.choiceRegistr = !this.choiceRegistr;
        },
        setChoiceWholly(){  
            this.choiceWholly = !this.choiceWholly;
        },
        row_classes(item){
          
        },
        setParameters(index){
            this.nameHeaders[0].text = this.ParamSearch[index]['Name'];
            this.DataTables[0].title = this.ParamSearch[index]['Title'];

            let valueTmp = this.ParamSearch[index]['MetName'];
            if (valueTmp == this.ParamSearch[index]['Title']){
                this.DataTables[0].value = this.ParamSearch[index]['Value'];
                if ( this.ParamSearch[index]['Value']!=''){
                    this.DataTables[0].value = this.ParamSearch[index]['Value'];
                }
                if ( this.ParamSearch[index]['Units']!=''){
                    this.DataTables[0].value = this.ParamSearch[index]['Units'];
                }
            }
            else{
                this.DataTables[0].value = this.ParamSearch[index][valueTmp];
            }
            
            return '';
        },
         setFilter(filter){
            switch(filter){
                case 'one': this.one = !this.one; this.four = false; this.two = false; this.three = false; 
                    break
                case 'two': this.two = !this.two; this.one = false; this.four = false; this.three = false; 
                    break
                case 'three': this.three = !this.three; this.one = false; this.two = false; this.four = false; 
                    break
                case 'four': this.four = !this.four; this.one = false; this.two = false; this.three = false; 
                    break
                default: ;
            }
        },
        changeRegistr(){
            console.log('WORRRRk');
        },
        EnterId(index){
            console.log('run is EnterId'); 


            console.log('index = ',index);
            this.list = [];
            this.list.push(this.ParamSearch[index]['id']);  
            console.log('index = ',this.selectedItem);
    
        },
         search(){
            
            console.log('run is search');

            if (this.message == ''){
                console.log('searchWord == none '); 
                this.ParamSearch = [];
                this.list = [];
                
            }
            else{
                this.searchWord = this.message;
                this.worker.postMessage({
                    action: 'getSearch',
                    value: {TypeSearch: this.typeSearch, SearchWord: this.searchWord, choiceRegistr: this.choiceRegistr, choiceWholly: this.choiceWholly}
                })
            }
        

        },
        cancel(){
            this.$emit('setOption', this.menuItem);
        },
        setResultsSearch(){
            console.log('this is setResultsSearch');
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

.namePanelSearch{
    margin-left: 5px;
    font-size: 14px;
    font-weight: 300;
    margin-bottom: -15px;
    margin-top: -15px;
}

.bottoms {
    width: 30px;
    height: 20px;
    margin-right: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 10px;
}

.bottom_id{
    margin-left: 10px;
    margin-top: -10px;
}

.search {
    display: inline-flex;  
    padding: 10px;
    margin-left: 10px;
    width:450px;
}

.search-field {
    width: 100%;
    border: 0; 
}

.search-field:focus {
    outline: none;
}
.search-icon {
    width: 20px;
    height: 20px;
}

.bottom_search{
    border: 0;
    max-width: 1px;
    margin-right:-20px;
}

.arrow-icon{
    max-width:10px;
}

.arrow-btn{
    max-height:0px;
    margin-top:20px;
    margin-left:-25px;
}

.my-custom-dialog{
    align-self: flex-end;
    margin-left: 1300px;
    margin-bottom: 500px;
    padding-top:0px;
    padding-bottom:0px;
}

.buttonRegister{
    font-size: 5px;
    margin-top:0px;
    margin-bottom:-20px;
    padding-top:12px;
    padding-bottom:0px;
}

.buttonWholly{
    font-size:5px;
    width: 100%;
    margin-bottom:0px;
    margin-top:0px;
    padding-top:0px;
    padding-bottom:0px;

}


.panelParamSearch{
    width: 5px;
    margin-bottom: 0px;
    padding-bottom: 0px;
}

.doubleParamSearch{
    width: 5px;
    height: 5px;
    margin-bottom: 0px;
    padding-bottom: 0px;
}

.panelResults{
    margin-left: 15px;
    margin-top:-30px;
}

.resultsForPanel{
    margin-left: 10px;
}

.checkboxSize{
    border: 0;
    outline: 0;
    margin-top: 1px;
    -webkit-appearance: none;
    -moz-appearance: none;

    appearance: none;
    background:transparent
}

button.v-treeview-node__toggle + button.v-treeview-node__checkbox + v-checkbox {
    display: none !important;
}


.v-data-table > .v-data-table__wrapper > table > tbody > tr > th,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > th {
    font-size: 15px !important; 
    color: black;
    padding-bottom: 0px;
    padding-top: 0px;
    margin-top:0px;
    margin-bottom:0px;
}

.v-data-table > .v-data-table__wrapper > table {
    border-spacing: 1 1rem;
    color:grey;
    padding-bottom: 0px;
    padding-top: 0px;
    margin-top:0px;
    margin-bottom:0px;
}


.includeTreeView{
    font-size: 12px;
    font-weight: 300;

}

</style>

