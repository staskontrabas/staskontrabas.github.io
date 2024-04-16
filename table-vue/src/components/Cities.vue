<template>
  <a-layout>
    <a-layout-header>
      
      <a-button class="btn-header" type="primary" @click="showModal">
        Добавить
      </a-button>
      
      <a-button class="btn-header" type="primary" @click="getCities">
        Заполнить
      </a-button>
      
      <a-modal
        title="Новый город"
        :visible="visible"
        :confirm-loading="confirmLoading"
        @ok="handleOk"
        @cancel="handleCancel"
      >
        <a-form-model :layout="form.layout" :model="form" v-bind="formItemLayout">
          <a-form-model-item label="Город">
            <a-input v-model="form.city" />
          </a-form-model-item>
          <a-form-model-item label="Кол-во жителей">
            <a-input-number :min="0" v-model="form.citizen" />
          </a-form-model-item>
          <a-form-model-item label="Кол-во авто">
            <a-input-number :min="0" v-model.number="form.cars" />
          </a-form-model-item>
        </a-form-model>
      </a-modal>
    </a-layout-header>

    <a-layout-content>
      <a-card>
        <a-table
          :columns="columns"
          :pagination="{ pageSize: 7 }"
          :data-source="dataSource">
          <a slot="name" slot-scope="text">{{ text }}</a>
        </a-table>
      </a-card>
    </a-layout-content>
    <a-layout-footer>Footer</a-layout-footer>
  </a-layout>
</template>

<script>
export default {
  name: 'Cities',
  data(){
    return {
      visible: false,
      confirmLoading: false,
      form: {
        layout: 'horizontal',
        city: '',
        citizen: 0,
        cars: 0
      },
      columns: [
        {
          title: 'Город',
          dataIndex: 'city',
          key: 'city',
        },
        {
          title: 'Кол-во жителей',
          dataIndex: 'citizen',
          key: 'citizen',
        },
        {
          title: 'Кол-во авто',
          dataIndex: 'cars',
          key: 'cars',
        },
      ]
    }
  },
  computed: {
    formItemLayout() {
      const { layout } = this.form;
      return layout === 'horizontal'
        ? {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 },
          }
        : {};
    },
    buttonItemLayout() {
      const { layout } = this.form;
      return layout === 'horizontal'
        ? {
            wrapperCol: { span: 14, offset: 4 },
          }
        : {};
    },
    dataSource(){
      let items = [...this.$store.state.cities, ...this.$store.state.jsondb]
      return items.map((city, i) => ({...city, key: i + 1}))
    }
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.confirmLoading = true;
      this.$store.dispatch('setCities', [{
          city: this.form.city,
          citizen: this.form.citizen,
          cars: this.form.cars
      }]).then(() => {
        this.handleCancel()
        this.confirmLoading = false
      })
    },
    handleCancel(e) {
      this.visible = false
      this.form.city = ''
      this.form.citizen = 0
      this.form.cars = 0
    },
    getCities(){
      fetch('http://localhost:3000/cities', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => {
        return res.text()
      }).then(text => {
        let data = null
        if(text){
          try{
            data = JSON.parse(text || null)
          }
          catch(e){
              console.log('Error:', e)
          }
        }
        return data
      }).then(res => {
        if(res){
          this.$store.dispatch('setJson', res)
        }
      })
    }
  },
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#app .ant-layout-header{ 
  position: fixed;
  z-index: 1;
  width: 100%;
  background: #fff ;
  text-align: right;
   }
.ant-layout-content{
  margin-top: 64px;
}
.ant-input-number{
    width: 100% !important;
  }
</style>
