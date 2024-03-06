<template>
    <div
        class="confirm-popup--menu"
        >
        <div
            @click.stop="cancel"
            class="admin-input-icon--popup">
            <span class="a-cancel" style="color: #ff0000;font-size: 36px;"></span>
        </div>
        <div
            @click.stop="changeSN"
            class="admin-input-icon--popup">
            <span class="a-check" style="color: #87c03d;font-size: 36px;"></span>
        </div>
        <input
            v-model="val"
            class="admin-input"
            readonly onfocus="this.removeAttribute('readonly')">

    </div>
</template>

<script>
import InputNumber from 'primevue/inputnumber'

export default {
    name: 'ConfirmPopup',
    components: {
        InputNumber
    },
    props: ['item', 'propname', 'value'],
    data(){
        return {
            val: this.value
        }
    },
    methods: {
        onclick(evt){
            if(!evt.target.closest('.confirm-popup--menu') && !evt.target.closest('.admin-input-icon--popup')){
                this.$emit('cancelProp')
            }
        },
        changeSN(){
            this.$store.dispatch('shops/change_shop', {
                id: this.item.shop_id,
                status: this.item.shop_status,
                cashierid: this.val
            })
            .then(res => {
                if(res.status == 'success'){
                    this.$store.dispatch('shops/getShopsCashiers')
                }
                this.$emit('changePropMsg', {msg: 'Серийный номер магазина ' + this.item.shop_name + ' изменен.'})
                this.$emit('cancelProp')
            })
        },
        cancel(){
            this.$emit('cancelProp')
        }
    },
    created(){
        document.addEventListener('mouseup', this.onclick, false)
    },
    beforeDestroy(){
        document.removeEventListener('mouseup', this.onclick)
    }
}
</script>
