<template>
    <div class="mx-4 my-2 position-relative d-flex flex-column align-center">

        <table class="demo-table m-text--size14">
            <!-- table headers -->
            <tr @dblclick="updatedatav2('headers', headers)">
                <td class="bold td-demo"> {{ headers.left }} </td>
                <td class="bold td-demo"> {{ headers.right }} </td>
            </tr>

            <!-- table contents -->
            <tr v-for="(pair) in tablecontent" @click="selectRow(pair);">
                <td class="bold td-demo td-cell" 
                :class="{'selected':(selectedRow === pair)}"> 
                    {{ Object.keys(pair)[0] }} 
                </td>
                <td class="td-demo td-cell" 
                :class="{'selected':(selectedRow === pair)}"> 
                    {{ Object.values(pair)[0] }}
                </td>
            </tr>
        </table>

        <!-- table control buttons -->
        <div class="mt-2 table-buttons d-flex direction-row no-wrap justify-start">
            <v-card flat v-ripple="{ class: `info--text` }" class="add-button mr-1" @click="addPair">
                <v-icon color="blue"> mdi-plus-circle-outline </v-icon> 
                <span class="common-text blue--text m-text--size14 mr-1"> Добавить </span>
                <!--  <div v-show="true" class="absolute prompt-card"> Test </div> -->
            </v-card>
            <v-card flat v-ripple="{ class: `info--text` }" class="delete-button ml-1" @click="deletePair">
                <v-icon color="black"> mdi-trash-can-outline </v-icon> 
                <span class="common-text black--text m-text--size14 mr-1"> Удалить </span>
            </v-card>
        </div>

        <!-- adding pair dialog -->
        <div class="addpairdialog" v-if="inputshown">
            <v-card class="pa-2 width-280px" v-click-outside="additionCancel" :elevation="6">
                <v-text-field 
                dense
                outlined
                hide-details
                class="mt-1 mb-3" 
                label="Введите код" 
                v-model="code"/>

                <v-text-field 
                dense
                outlined
                hide-details 
                class="mb-3" 
                label="Введите расшифровку кода" 
                v-model="codemeaning"/>
        
                <div class="d-flex flex-row justify-space-around">
                    <v-btn :elevation="6" class="table-buttons confirm-cancel-btn" color="white" @click="additionConfirm">
                        <span class="common-text m-text--size14"> Добавить </span>
                    </v-btn>
                    <v-btn :elevation="6" class="table-buttons confirm-cancel-btn" color="white" @click="additionCancel">
                        <span class="common-text m-text--size14"> Отмена </span>
                    </v-btn>
                </div>
            </v-card>
        </div>

    </div>
</template>

<script>
export default {
    props: {
        propset: { default: {}, type: Object, },
    },
    data(){
        return {
            headers: {left: 'Код', right: 'Описание',},
            tablecontent: [{'Код':'Значение'}],
            align: '',
            selectedRow: null,
            inputshown: false,
            code: '',
            codemeaning: '',
        }
    },
    methods: {
        updatedatav2(propname, val) {
            let type = 'CodeTable'
            this.$emit('updatedatav2', {type: type, prop: propname, value: val})
        },
        addPair() {
            this.inputshown = true
        },
        additionConfirm() {
            // confirm action
            let exists = false 
            for (let elem of this.tablecontent) {
                if (Object.keys(elem)[0] === this.code && elem[Object.keys(elem)[0]] === this.codemeaning ) { 
                    this.inputshown = false
                    return null 
                }
            }

            let obj = {}
            obj[''+this.code] = this.codemeaning

            if (!this.selectedPairIndex) {
                this.tablecontent.push(obj)
            }
            else {
                this.tablecontent.splice(this.selectedPairIndex, 0, obj)
            }
            this.inputshown = false
            this.updatedatav2('tablecontent', this.tablecontent)
            
        },
        additionCancel() { 
            this.inputshown = false
            this.code = ''
            this.codemeaning = ''
         },
        deletePair() {
            // delete selected pair
            let i = this.tablecontent.indexOf(this.selectedRow)
            if (i<0) { return null } 
            this.tablecontent.splice(i,1)
            this.updatedatav2('tablecontent', this.tablecontent)
        },
        selectRow(v) {
            // v - pair object {key:value}
            if (this.selectedRow === v) {
                this.selectedRow = null
            }
            else {
                this.selectedRow = v
            }
        }
    },
    computed: {
        selectedPairIndex() {
            let i = this.tablecontent.indexOf(this.selectedRow)
            return i
        },
    },
    beforeMount() {
        if (!this.propset) {
                return null
                }
        else {
            let properties = this.propset
            for (let prop of Object.keys(properties)) {
                this[prop] = properties[prop]
            }
            return null
        }
    },
}
</script>

<style scoped>

.demo-table {
    border-collapse: collapse;
    max-width: 80%;
    min-width: 50%;
    text-align: center;
}

.td-demo {
    border: 2px solid #b4c6e7;
    padding: 2px 10px;
    width: 50%;
}

.addpairdialog {
    position:absolute; 
    left:50%; 
    bottom:0; 
    transform: translateX(-50%); 
    z-index:999;
}

.confirm-cancel-btn {
    min-width: 0; 
    min-height:0; 
    width: 100px; 
    height: 1.5rem;
}

.selected {
    background-color: #00ACC1 /* #0097A7 /* #00838F; /*  */
}

.add-button {
    border-radius: 10px;
}

.td-cell {
    text-align: left;
}

.bold {
    font-weight: 500;
}

.position-relative {
    position: relative;
}

.width-280px {
    width: 280px;
}

.common-text {
    font-family: Roboto;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    text-align: left;
}

</style>