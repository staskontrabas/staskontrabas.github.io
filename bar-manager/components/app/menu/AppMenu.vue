<template>
    <cove-menu>
        <panel slot="panel"/>
        <MenuCategory slot="category" @setDx="setDx" :dx="dx" :endResize="endResize"/>
        <CoveResizer slot="resizer" @setDx="setDx" @setResize="setResize"/>
        <MenuList slot="list"/>
    </cove-menu>
</template>

<script>
  import CoveMenu from '@/views/cove-components/cove-menu/CoveMenu'
  import Panel from './components/Panel.vue'
  import MenuCategory from './components/MenuCategory.vue'
  import MenuList from './components/MenuList.vue'
  import CoveResizer from '@/components/app/common/CoveResizer.vue'
  import { mapState } from "vuex"

  export default {
    name: 'AppMenu',
    components: {
      CoveMenu,
      Panel,
      MenuCategory,
      MenuList,
      CoveResizer
    },
    data: function(){
        return {
            dx: 0,
            endResize: -1
        }
    },
    computed: mapState({
        menuStatus : function(state){
            return state.menu.menuStatus
        },
    }),
    created () {
      this.fetchData()
    },
    methods: {
        fetchData () {
            this.$store.dispatch('menu/menu')
            this.$store.dispatch('menu/setIngredientStore')
        },
        setDx(dx){
            this.dx = dx
        },
        setResize(end){
            this.endResize = end
        }
    }
  }
</script>
