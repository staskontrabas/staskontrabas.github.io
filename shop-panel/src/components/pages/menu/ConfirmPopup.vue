<template>
    <div
        class="confirm-popup--menu"
        >
        <div
            @click="cancel"
            class="admin-input-icon--popup">
            <span class="a-cancel" style="color: #ff0000;font-size: 36px;"></span>
        </div>
        <div
            @click="updateMenu"
            class="admin-input-icon--popup">
            <span class="a-check" style="color: #87c03d;font-size: 36px;"></span>
        </div>
        <InputNumber
            v-model="val"
            mode="decimal"
            class="inputnumber-input"
            :useGrouping="false" />

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
        updateMenu(){
            const shop = parseInt(this.$store.state.auth.shopid)
            let item = {
                ...this.item,
                [this.propname]: this.val
            }
            this.$store.dispatch('shops/update_menu', {
                menuid: item.sku,
                count: item.count,
                price: item.price,
                cost: item.cost || 0,
                shopid: shop
            })
            .then(res => {
                this.$emit('cancelProp')
                this.$store.dispatch('shops/getReports', ['get_menu', 'get_menu_shop'])
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
