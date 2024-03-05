<template>
    <div class="main-wrapper mb-2 d-flex direction-row no-wrap">

        <!-- left part, checkbox+input -->
        <div class="left-box">
            <div class="mx-4 m-text--size12 bold">
                <span 
                class="text-uppercase m-text--size12 bold"
                @dblclick="updatedatav2('headerleft', headerleft)"> 
                    {{ headerleft }} 
                </span>
                <div class="outer-div my-2 d-flex flex-nowrap">
                    <div class="checkbox-box d-flex align-center justify-center">
                        <v-checkbox 
                        class="simple-checkbox" 
                        color="black" 
                        :ripple="false" 
                        v-model="checked"
                        @change="updatedatav2('checked', checked)" />
                    </div>

                    <v-divider vertical/>

                    <div class="textfield-box">
                        <v-text-field 
                        class="textfield px-2 py-0 my-0" 
                        clearable 
                        hide-details
                        :disabled="!checked" 
                        v-on = "(hastype) ? {keypress: NumbersOnly} : {}"
                        v-model="valueexpression"
                        @change="updatedatav2('valueexpression', valueexpression)">
                        </v-text-field>
                    </div>
                </div>
                <span class="normal"
                @dblclick="updatedatav2('commentleft', commentleft)">
                    {{ commentleft }} 
                </span>
            </div>
        </div>

        <!-- right part, data type -->
        <div class="right-box" v-if="hastype">
            <div class="mx-4 m-text--size12 bold">
                <span 
                class="text-uppercase m-text--size12 bold"
                @dblclick="updatedatav2('headerright', headerright)"> 
                    {{ headerright }}  
                </span>
                <div class="my-2">
                    <v-autocomplete 
                    dense
                    outlined 
                    single-line 
                    hide-details 
                    background-color="white"
                    v-model="namingtype"
                    :disabled="!checked" 
                    :items="type_pool"
                    @change="updatedatav2('namingtype',namingtype)"/>
                </div>
                <span 
                class="normal"
                @dblclick="updatedatav2('commentright', commentright)"> 
                    {{ commentright }} 
                </span>
            </div>
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
            hastype: false,
            checked: false,
            valueexpression: '',
            namingtype: '0',
            headerleft: 'Обязательное значение',
            commentleft: 'Обязательное значение, которое должно быть указано для этого раздела',
            headerright: 'Тип именования',
            commentright: 'Используемый тип именования',
            type_pool: [
                {text:'Цифры - 0-9', value: '0',},
                {text:'Кириллица - аА-яЯ', value:'1'},
                {text:'Латиница - aA-zZ', value: '2'},
            ]
        }
    },
    methods: {
        updatedatav2(propname, val) {
            let type = 'ObligatoryValue'
            this.$emit('updatedatav2', {type: type, prop: propname, value: val})
        },
        NumbersOnly(evt) {
            // Sh: only numbers can be typed in
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
                evt.preventDefault();;
            } else {
                return true;
            }
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

<style scoped >

.simple-checkbox {
    margin-left: 8px;
    /* to compensate for random 8px margin-right of v-checkbox input */
}

.left-box {
    width: 50%;
}

.right-box {
    width: 50%;
}

.outer-div {
    width: 95%;
    min-width: 95%;
    height: 40px;
    border-radius: 5px;
    border: solid 1px black;
    overflow: hidden;
}

.checkbox-box {
    width: 45px;
    min-width: 45px;
    background-color: #e9ecef;
}

.textfield-box {
    position: relative;
    width: calc(100% - 46px);
}

.textfield {
    position: absolute;
    width: 100%;
    top: 3px;
    left: 0%;
}

.textfield .v-input__slot::before {
  border-style: none !important;
}

.bold {
    font-weight: 500;
}


</style>