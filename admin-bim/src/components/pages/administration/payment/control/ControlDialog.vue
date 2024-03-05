<template>
<v-dialog :value="component" scrollable max-width="700px" @input="v => v || cancel()">
    <v-card>
        <v-card-title class="pr-0 pl-4 m-modal--title">
            {{title[component]}}
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

        <component
            :is="component"
            :parameters="parameters"
            :values.sync="values"
        />

        <v-divider></v-divider>
        <v-card-actions class="pa-5 px-4">
            <v-spacer></v-spacer>
            <v-btn v-show="component != 'Confirm'" outlined color="primary" class="m-btn" @click="onConfirm">Купить
            </v-btn>
            <v-btn v-show="component == 'Confirm'" outlined color="primary" class="m-btn" @click="setLicense">Да
            </v-btn>

            <v-btn v-show="component != 'Confirm'" outlined color="normal" class="m-btn m-btn-normal" @click.stop="cancel">Отмена</v-btn>
            <v-btn v-show="component == 'Confirm'" outlined color="normal" class="m-btn m-btn-normal" @click.stop="cancel">Нет</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>
</template>

<script>
import License from "./License"
import Plan from "./Plan"
import Size from "./Size"
import Confirm from "./Confirm"

export default {
    name: 'ControlDialog',
    components: {
        License,
        Plan,
        Size,
        Confirm
    },
    props: ['component', 'parameters'],
    data(){
        return {
            title: {
                Plan: 'Тип лицензий',
                License: 'Количество лицензий',
                Size: 'Количество места',
                Confirm: ''
            },
            values: null,
            confirm: false,
            minLic: 3,
            maxLic: 9223372036854775807n,
            place: {
                p20: 200,
                p21: 5120,
                p22: 10240,
                p23: 51200
            }
        }
    },
    watch: {
        component(v){
            if(v){
                document.addEventListener('keyup', this.enter, false)
            }
            else{
                document.removeEventListener('keyup', this.enter, false)
            }
        }
    },
    methods: {
        cancel(){
            this.$emit('update:component', false)
            this.values = null
        },
        onConfirm(){
            this.$emit('update:component', 'Confirm')
            // if(this.component == 'Plan'){
            //     this.$emit('update:component', 'Confirm')
            // }
            // else{
            //     this.setLicense()
            // }
        },
        setLicense(){
            if(!this.values){
                this.cancel()
                return
            }
            if(this.values.route == 'plan'){
                let idata = this.maxLic.toString()
                if(this.values.body.rte > 20){
                    idata = BigInt(this.values.body.data.idata) == this.maxLic
                        ? this.$store.state.administration.company.users.length >= this.minLic
                            ? this.$store.state.administration.company.users.length.toString()
                            : this.minLic.toString()
                        : parseInt(this.values.body.data.idata) < this.minLic
                            ? this.minLic.toString()
                            : this.values.body.data.idata
                }

                this.$store.dispatch('administration/setLicense', {
                    uid: this.$store.state.administration.user.id,
                    cid: this.$store.state.administration.company.id,
                    int: 1,
                    rte: this.values.body.rte,
                    data: {
                        idata: idata
                    }
                })
                this.$store.dispatch('administration/setLicense', {
                    uid: this.$store.state.administration.user.id,
                    cid: this.$store.state.administration.company.id,
                    int: 1,
                    rte: 10,
                    data: {
                        idata: (this.place['p' + this.values.body.rte] * 1024 * 1024).toString()
                    }
                })
                this.$store.dispatch('administration/setLicense', {
                    uid: this.$store.state.administration.user.id,
                    cid: this.$store.state.administration.company.id,
                    int: 1,
                    rte: 30 + (this.values.body.rte % 10)
                })
            }
            if(this.values.route == 'size'){
                this.$store.dispatch('administration/setLicense', {
                    uid: this.$store.state.administration.user.id,
                    cid: this.$store.state.administration.company.id,
                    int: 1,
                    rte: 10,
                    data: {
                        idata: this.place['p' + this.values.body.rte] > this.values.body.data.idata
                            ? (this.place['p' + this.values.body.rte] * 1024 * 1024).toString()
                            : (this.values.body.data.idata * 1024 * 1024).toString()
                    }
                })
            }
            if(this.values.route == 'lic'){
                this.$store.dispatch('administration/setLicense', {
                    uid: this.$store.state.administration.user.id,
                    cid: this.$store.state.administration.company.id,
                    int: 1,
                    rte: this.values.body.rte,
                    data: {
                        idata: BigInt(this.values.body.data.idata) >= this.maxLic
                            ? this.maxLic.toString()
                            : parseInt(this.values.body.data.idata) < this.minLic
                                ? this.minLic.toString()
                                : this.values.body.data.idata
                    }
                })
            }
            this.cancel()
        },
        enter(e){
            if(e.keyCode === 13){
                e.preventDefault()
                this.cancel()
            }
        }
    }
}
</script>
