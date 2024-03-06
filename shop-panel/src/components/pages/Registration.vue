<template>
    <div class="admin-container">
        <div class="admin-stores">

            <search
                v-if="getRole == 'superadmin'"
                :search_val.sync="search_val"
            />

            <div class="admin-store" v-for="item in getShops">
                <div>
                    <div class="admin-store-id">#{{item.shop_id}}</div>
                    <button
                        @click="openBasic(item)"
                        class="admin-store-login">{{item.admin_login}}</button>
                </div>
                <div>
                    <div class="admin-store-name">{{item.shop_name}}</div>
                    <div class="admin-store-date">Дата создания {{formatDate(item.shop_time_created)}}</div>
                    <div
                        @click="changeProp(item)"
                        class="admin-store-name--sn mt-1">
                        <confirm-popup
                            v-if="editUserId == item.admin_id"
                            @cancelProp="cancelProp"
                            @changePropMsg="changePropMsg"
                            :value="item.shop_serial"
                            :item="item"
                            :propname="'shop_serial'"
                            />
                        <span>SN: </span>
                        {{item.shop_serial}}</div>
                </div>
                <div
                    v-if="getRole == 'superadmin'"
                    class="admin-store-status">
                    <select
                        v-model="item.shop_status"
                        @change="changeStatus(item)"
                        class="admin-input w-100">
                        <option value="0">Неактивен</option>
                        <option value="1">Активен</option>
                    </select>
                </div>
            </div>
        </div>

        <div
            v-if="getRole == 'admin'"
            class="admin-cashiers">
            <div class="admin-auth-logo">кассиры</div>
            <div class="admin-cashiers--store" v-for="cashier in getCashiers">
                <div>
                    <div>
                        <span class="admin-order-user-nam">#{{cashier.cashier_id}}</span>
                        <span
                            class="admin-store-name"> {{cashier.cashier_login}}</span>
                    </div>
                </div>

                    <button
                        class="btn btn--green btn--fill btn--width100"
                        @click="openCashier(cashier, 'cashier')"
                        >Редактировать</button>
            </div>
        </div>

        <div class="admin-stores">
            <div
                v-if="getRole == 'superadmin'"
                class="admin-store-form">
                <div class="admin-auth-logo">добавить новый магазин</div>
                <div class="admin-store-form-fields">
                    <input
                        v-model="cashierid"
                        readonly onfocus="this.removeAttribute('readonly')"
                        type="text" class="admin-input" placeholder="серийный номер">
                    <input
                        v-model="shopname"
                        readonly onfocus="this.removeAttribute('readonly')"
                        type="text" class="admin-input" placeholder="Название">
                </div>
                <div v-show="isErrorShop" class="admin-auth-error">
                    {{isErrorShop}}
                </div>
            </div>

            <div
                v-if="getRole == 'superadmin'"
                class="admin-store-form">
                <div class="admin-auth-logo">добавить нового админа</div>
                <div class="admin-store-form-fields">
                    <input
                        v-model="adminlogin"
                        name="login"
                        type="text" class="admin-input"
                        readonly onfocus="this.removeAttribute('readonly')"
                        :class="{'admin-input-error': errorAdminMsg['login']}"
                        placeholder="логин">
                    <input
                        v-model="adminpass"
                        type="password" class="admin-input"
                        readonly onfocus="this.removeAttribute('readonly')"
                        :class="{'admin-input-error': errorAdminMsg['pass']}"
                        placeholder="пароль">
                    <button
                        @click="addAdmin"
                        class="btn btn--green btn--fill">добавить</button>
                </div>
                <div v-show="isErrorAdmin" class="admin-auth-error">
                    {{isErrorAdmin}}
                </div>
            </div>

            <div
                v-if="getRole == 'admin' && getShops.length"
                class="admin-store-form">
                <div class="admin-auth-logo">добавить нового кассира</div>
                <div class="admin-store-form-fields">
                    <input
                        v-model="cashierlogin"
                        type="text" class="admin-input"
                        readonly onfocus="this.removeAttribute('readonly')"
                        :class="{'admin-input-error': errorCashierMsg['login']}"
                        placeholder="логин">
                    <input
                        v-model="cashierpass"
                        type="text" class="admin-input"
                        readonly onfocus="this.removeAttribute('readonly')"
                        :class="{'admin-input-error': errorCashierMsg['pass']}" placeholder="пароль">
                    <button
                        @click="addCashier"
                        class="btn btn--green btn--fill">добавить</button>
                </div>
                <div v-show="isErrorCashier" class="admin-auth-error">
                    {{isErrorCashier}}
                </div>
            </div>
        </div>

        <Dialog
            :showHeader="false"
            :modal="true"
            :dismissableMask="true"
            :closable="true"
            :visible.sync="displayBasic">
            <div class="header">
                <span
                    @click="closeBasic"
                    class="btn-close">&#10005;</span>
            </div>
            <div class="popup">
                <div class="popup__title">Сменить серийный номер</div>
                <div class="popup-fields">

                    <input
                        v-model="cashierid"
                        class="admin-input"
                        readonly onfocus="this.removeAttribute('readonly')"
                        :class="{'admin-input-error': isErrorShop}"
                        placeholder="Сериный номер">
                    <button
                        @click="changeSN"
                        class="admin-auth-btn btn btn--green btn--fill">Сохранить</button>
                    <div
                        v-show="isErrorShop"
                        class="admin-auth-error">
                        {{isErrorShop}}
                    </div>
                </div>

                <div class="popup__title mt-3">Сменить пароль админа</div>
                <div class="popup-fields">

                    <input
                        v-model="firstpass"
                        type="password" class="admin-input"
                        readonly onfocus="this.removeAttribute('readonly')"
                        :class="{'admin-input-error': isErrorNewPass}"
                        placeholder="Новый пароль">
                    <input
                        v-model="secondpass"
                        type="password" class="admin-input"
                        readonly onfocus="this.removeAttribute('readonly')"
                        :class="{'admin-input-error': isErrorNewPass}"
                        placeholder="Повторите новый пароль">
                    <button
                        @click="changePass"
                        class="admin-auth-btn btn btn--green btn--fill">Сохранить</button>
                    <div
                        v-show="isErrorNewPass"
                        class="admin-auth-error">
                        {{errorNewPass.msg}}
                    </div>
                </div>
            </div>
        </Dialog>

        <Dialog
            :showHeader="false"
            :modal="true"
            :dismissableMask="true"
            :closable="true"
            :visible.sync="displayCashier">
            <div class="header">
                <span
                    @click="closeCashier"
                    class="btn-close">&#10005;</span>
            </div>
            <div class="popup">
                <div class="popup__title">Кассир {{editCashier.cashier_login}}</div>
                <div class="mt-2"></div>
                <div class="popup__title--little">Сменить пин</div>
                <div class="popup-fields">
                        <div class="relative admin-input_pin--wrap">
                            <input
                                type="text"
                                readonly onfocus="this.removeAttribute('readonly')"
                                maxlength="1"
                                ref="cashierpass0"
                                :value="cashierpassList[0].val"
                                @input="inputCashPass($event, 0)"
                                onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                                class="admin-input admin-input_pin">
                            <input
                                type="text"
                                readonly onfocus="this.removeAttribute('readonly')"
                                maxlength="1"
                                ref="cashierpass1"
                                :value="cashierpassList[1].val"
                                @input="inputCashPass($event, 1)"
                                onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                                class="admin-input admin-input_pin">
                            <input
                                type="text"
                                readonly onfocus="this.removeAttribute('readonly')"
                                maxlength="1"
                                ref="cashierpass2"
                                :value="cashierpassList[2].val"
                                @input="inputCashPass($event, 2)"
                                onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                                class="admin-input admin-input_pin">
                            <input
                                type="text"
                                readonly onfocus="this.removeAttribute('readonly')"
                                maxlength="1"
                                ref="cashierpass3"
                                :value="cashierpassList[3].val"
                                @input="inputCashPass($event, 3)"
                                onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                                class="admin-input admin-input_pin">
                        </div>
                    <button
                        @click="changeCashierPass"
                        class="admin-auth-btn btn btn--green btn--fill mt-2">Сохранить</button>
                    <button
                        class="btn btn--red btn--fill"
                        @click="removeCashier"
                        >Удалить</button>
                    <div
                        v-show="isErrorNewPass"
                        class="admin-auth-error">
                        {{errorNewPass.msg}}
                    </div>
                </div>
            </div>
        </Dialog>

        <Dialog
            :showHeader="false"
            :modal="true"
            :dismissableMask="true"
            :closable="true"
            :visible.sync="displayMessage">
            <div class="header">
                <span
                    @click="displayMessage = false"
                    class="btn-close">&#10005;</span>
            </div>
            <div class="popup">
                <div class="popup__title">СООБЩАЕМ</div>
                <div class="popup__text">
                    {{message}}
                </div>
                <div class="popup-fields">
                    <button
                        @click="displayMessage = false"
                        class="admin-auth-btn btn btn--green btn--fill">Закрыть</button>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script>
import Search from "@/components/common/Search"
import ConfirmPopup from "./registration/ConfirmPopup"

export default {
    name: 'Registration',
    components: {
        Search,
        ConfirmPopup
    },
    data(){
        return {
            value: '',
            firstpass:'',
            secondpass: '',
            displayBasic: false,
            displayCashier: false,
            displayMessage: false,
            message: '',
            cashierid: '',
            shopname: '',
            adminlogin: '',
            adminpass: '',
            cashierlogin: '',
            cashierpass: '',
            errorAdminMsg: {
                login: '',
                pass: ''
            },
            errorShopMsg: {
                id: '',
                name: ''
            },
            errorCashierMsg: {
                login: '',
                pass: ''
            },
            errorNewPass: {
                msg: '',
                sts: false
            },
            search_val: '',
            editUserId: '',
            editUserType: '',
            editCashier: {},
            editShop: null,
            cashierpassList: [{val: ''}, {val: ''}, {val: ''}, {val: ''}]
        }
    },
    watch:{
        firstpass(val){
            if(this.editUserType == 'admin'){
                if(val.length < 5 || val.length > 20){
                    this.errorNewPass.sts = true
                    this.errorNewPass.msg = 'Пароль должен содержать от 5 до 20 символов. '
                }
                else{
                    this.errorNewPass.sts = false
                    this.errorNewPass.msg = ''
                }
            }
            if(this.editUserType == 'cashier'){
                if(val.length != 4){
                    this.errorNewPass.sts = true
                    this.errorNewPass.msg = 'Пароль должен содержать 4 символа. '
                }
                else{
                    this.errorNewPass.sts = false
                    this.errorNewPass.msg = ''
                }
            }
            if(this.secondpass && val != this.secondpass){
                this.errorNewPass.sts = true
                this.errorNewPass.msg += 'Пароли не совпадают.'
            }
            else{
                this.errorNewPass.sts = this.errorNewPass.sts
            }
        },
        secondpass(val){
            if(val != this.firstpass){
                this.errorNewPass.sts = true
                this.errorNewPass.msg = 'Пароли не совпадают.'
            }
            else{
                this.errorNewPass.sts = false
            }
        },

        cashierid(val){
            if(val && (val.length < 8 || val.length > 20)){
                this.errorShopMsg['id'] = 'Необходимо от 8 до 20 символов. '
            }
            else if(this.getShops.some(shop => shop.shop_cashierid == val)){
                this.errorShopMsg['id'] = 'ID уже занято. '
            }
            else{
                this.errorShopMsg['id'] = ''
            }
        },
        shopname(val){
            if(val && (val.length < 1 || val.length > 20)){
                this.errorShopMsg['name'] = 'Название должно содержать до 20 символов. '
            }
            else if(this.getShops.some(shop => shop.shop_name == val)){
                this.errorShopMsg['name'] = 'Имя уже занято. '
            }
            else{
                this.errorShopMsg['name'] = ''
            }
        },

        adminlogin(val){
            if(val && (val.length < 5 || val.length > 20)){
                this.errorAdminMsg['login'] = 'Логин должен содержать от 5 до 20 символов. '
            }
            else if(this.getShops.some(shop => shop.admin_login == val)){
                this.errorAdminMsg['login'] = 'Имя уже занято. '
            }
            else{
                this.errorAdminMsg['login'] = ''
            }
        },
        adminpass(val){
            if(val && (val.length < 5 || val.length > 20)){
                this.errorAdminMsg['pass'] = 'Пароль должен содержать от 5 до 20 символов. '
            }
            else{
                this.errorAdminMsg['pass'] = ''
            }
        },
        cashierlogin(val){
            if(val && (val.length < 5 || val.length > 20)){
                this.errorCashierMsg['login'] = 'Логин должен содержать от 5 до 20 символов. '
            }
            else if(this.getCashiers.some(cas => cas.cashier_login == val)){
                this.errorCashierMsg['login'] = 'Имя уже занято. '
            }
            else{
                this.errorCashierMsg['login'] = ''
            }
        },
        cashierpass(val){
            if(val && (val.length < 4 || val.length > 4) || isNaN(val)){
                this.errorCashierMsg['pass'] = 'Пароль должен содержать 4 цифры. '
            }
            else{
                this.errorCashierMsg['pass'] = ''
            }
        },
        displayBasic(val){
            if(!val){
                this.editShop = null
                this.editUserId = ''
                this.cashierid = ''
                this.firstpass = ''
                this.secondpass = ''
                this.editUserType = ''
                this.errorNewPass.sts = false
                this.errorNewPass.msg = ''
            }
        },
        displayCashier(val){
            if(!val){
                this.editCashier = {}
                this.editUserId = ''
                this.cashierpassList = this.cashierpassList.map(data => {
                    return {val: ''}
                })
                this.firstpass = ''
                this.secondpass = ''
                this.editUserType = ''
                this.errorNewPass.sts = false
                this.errorNewPass.msg = ''
            }
        }
    },
    computed: {
        isErrorNewPass(){
            return this.errorNewPass.sts
        },
        isErrorAdmin(){
            let error = this.errorAdminMsg['login'] + this.errorAdminMsg['pass']
            return error
        },
        isErrorShop(){
            let error = this.errorShopMsg['id'] + this.errorShopMsg['name']
            return error
        },
        isErrorCashier(){
            let error = this.errorCashierMsg['login'] + this.errorCashierMsg['pass']
            return error
        },
        getShops(){
            const role = this.$store.state.auth.role
            const userid = this.$store.state.auth.userid
            return this.$store.state.shops.shops.filter(shop => shop.shop_id.toString().includes(this.search_val) && (role == 'superadmin' || userid == shop.admin_id))
        },
        getCashiers(){
            return this.$store.state.shops.cashiers
        },
        getRole(){
            return this.$store.state.auth.role
        }
    },
    methods: {
        openBasic(item){
            this.editUserId = item.admin_id
            this.editShop = item
            this.cashierid = item.shop_serial
            this.displayBasic = true
        },
        closeBasic(){
            this.editUserId = ''
            this.editShop = null
            this.displayBasic = false
        },
        openCashier(item){
            this.editUserId = item.cashier_id
            this.editCashier = item
            this.displayCashier = true
        },
        closeCashier(){
            this.displayCashier = false
        },
        changeProp(item){
            this.editUserId = item.admin_id
        },
        changePropMsg(data){
            this.displayMessage = true
            this.message = data.msg
        },
        cancelProp(){
            this.closeBasic()
        },
        changeSN(){
            if(this.isErrorShop){
                return
            }

            this.$store.dispatch('shops/change_shop', {
                id: this.editShop.shop_id,
                status: this.editShop.shop_status,
                cashierid: this.cashierid
            })
            .then(res => {
                if(res.status == 'success'){
                    this.$store.dispatch('shops/getShopsCashiers')
                    this.displayMessage = true
                    this.message = 'Серийный номер магазина ' + this.editShop.shop_name + ' изменен.'
                }
                this.closeBasic()
            })
        },
        addAdmin(){
            if(this.isErrorAdmin && this.isErrorShop){
                return
            }

            this.$store.dispatch('auth/registershop', {
                login: this.adminlogin,
                password: this.adminpass,
                cashierid: this.cashierid,
                name: this.shopname
            })
            .then(res => {
                if(res.status == 'success'){
                    this.adminlogin = ''
                    this.adminpass = ''
                    this.cashierid = ''
                    this.shopname = ''

                    this.displayMessage = true
                    this.message = 'Новый магазин и админ успешно добавлены.'
                    this.$store.dispatch('shops/getShopsCashiers')
                }
            })
        },
        addCashier(){
            if(this.isErrorCashier){
                return
            }
            const cashierlogin = this.cashierlogin

            this.$store.dispatch('auth/reg_user', {
                login: this.cashierlogin,
                password: this.cashierpass,
                parentid: this.$store.state.auth.userid,
                role: 'cashier'
            })
            .then(res => {
                if(res.status == 'success'){
                    this.cashierlogin = ''
                    this.cashierpass = ''

                    this.displayMessage = true
                    this.message = 'Кассир ' + cashierlogin + ' успешно создан.'
                    this.$store.dispatch('shops/getShopsCashiers')
                }
            })
        },
        removeCashier(){
            this.$store.dispatch('auth/delete_cashier', {
                id: this.editCashier.cashier_id,
                parentid: this.$store.state.auth.userid
            })
            .then(res => {
                this.closeCashier()
                this.$store.dispatch('shops/get_cashiers', {adminid: this.$store.state.auth.userid})
                .then(res => {
                    this.$store.commit('shops/setCashiers', res.data)
                })
            })
        },
        changeStatus(shop){
            this.$store.dispatch('shops/change_shop', {
                id: shop.shop_id,
                status: parseInt(shop.shop_status)
            })
            .then(res => {
                if(res.status == 'success'){
                    this.displayMessage = true
                    this.message = 'Статус магазина #' + shop.shop_id +' изменен.'
                    this.$store.dispatch('shops/get_cashiers', {adminid: this.$store.state.auth.userid})
                    .then(res => {
                        this.$store.commit('shops/setCashiers', res.getcashiers)
                    })
                }
            })
        },
        changePass(){
            if(this.isErrorNewPass){
                return
            }
            this.$store.dispatch('auth/change_password', {
                id: this.editUserId,
                password: this.secondpass
            })
            .then(res => {
                if(res.status == 'success'){
                    this.closeBasic()
                }
            })
        },
        changeCashierPass(){
            if(!this.cashierpassList.every(data => data.val)){
                return
            }
            this.$store.dispatch('auth/change_password', {
                id: this.editUserId,
                password: this.cashierpassList.map(data => data.val).join('')
            })
            .then(res => {
                if(res.status == 'success'){
                    this.closeCashier()
                }
            })
        },
        formatDate(date){
            const options = {year: '2-digit', month: '2-digit', day: '2-digit'}
            const formatdate = new Date(date * 1000)
            return formatdate.toLocaleDateString("ru-RU", options)
        },
        inputCashPass(evt, ind){
            let val = evt.target.value
            if(val.length == 1){
                this.cashierpassList[ind].val = val
                if(ind < 3){
                    this.$refs['cashierpass' + (ind + 1)].focus()
                }
            }
        }
    },
    created(){
        this.$store.dispatch('shops/getShopsCashiers')
    }
}
</script>

<style>
.admin-cashiers {
    position: relative;
    overflow: hidden;
    padding: 20px 32px;
    background: rgb(25, 25, 25);
    font-family: var(--admin-font-base);
    color: #fff;
}
.p-inputmask .p-inputtext{

}
</style>
