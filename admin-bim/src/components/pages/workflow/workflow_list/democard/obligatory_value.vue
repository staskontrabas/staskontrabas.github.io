<template>
    <div class="main-wrapper mb-2 d-flex direction-row no-wrap">

        <!-- left part, checkbox+input -->
        <div class="left-box">
            <div class="mx-4 m-text--size12 bold">
                <span class="text-uppercase m-text--size12 bold"> 
                    {{ propset.headerleft }} 
                </span>
                <div class="outer-div my-2 d-flex flex-nowrap">
                    <div class="checkbox-box d-flex align-center justify-center">
                        <v-checkbox 
                        class="simple-checkbox" 
                        color="black" 
                        readonly
                        v-model="propset.checked"
                        />
                    </div>

                    <v-divider vertical/>

                    <div class="textfield-box">
                        <v-text-field 
                        class="textfield px-2 py-0 my-0" 
                        clearable 
                        hide-details
                        readonly
                        :value="propset.valueexpression">
                        </v-text-field>
                    </div>
                </div>
                <span class="normal">
                    {{ propset.commentleft }} 
                </span>
            </div>
        </div>

        <!-- right part, data type -->
        <div class="right-box" v-if="propset.hastype">
            <div class="mx-4 m-text--size12 bold">
                <span 
                class="text-uppercase m-text--size12 bold"> 
                    {{ propset.headerright }}  
                </span>
                <div class="my-2">
                    <v-autocomplete 
                    dense
                    outlined 
                    single-line 
                    hide-details 
                    background-color="white"
                    :value="propset.namingtype"
                    :disabled="!checked" 
                    :items="type_pool"
                    readonly/>
                </div>
                <span class="normal"> 
                    {{ propset.commentright }} 
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
            type_pool: [
                {text:'Цифры - 0-9', value: '0',},
                {text:'Кириллица - аА-яЯ', value:'1'},
                {text:'Латиница - aA-zZ', value: '2'},
            ]
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
    font-weight: 800;
}


</style>