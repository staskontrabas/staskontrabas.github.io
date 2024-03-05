<template>
  <tooltip class="item" effect="dark" :content="title" placement="right" :showAnyWay="mini">
    <div class="side-menu-item" :class="{'side-menu-item--active': active}" @click="goToPage">
      <inline-svg class="side-menu-item__icon" :src="require(`@/assets/icons/${icon}.svg`)"></inline-svg>
      <span v-show="!mini" class="side-menu-item__title"> {{title}} </span>
    </div>
  </tooltip>
</template>

<script>

import InlineSvg from "vue-inline-svg"
import tooltip from "@/components/core/tooltip"

export default {
  name: 'SideMenuItem',
  props: {
    id: {
      type: Number,
      required: true,
      default: 0,
    },
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
    mini: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    InlineSvg,
    tooltip,
  },
  data(){
    return {
    }
  },
  mounted() {

  },
  computed: {
    active() {
        return this.$route.path.startsWith(this.link)
    }
  },
  methods: {
    goToPage() {
      this.$router.push(this.link)
    //   this.$emit('set-active', this.link)
    },
  },
}
</script>

<style scoped lang="scss">

.side-menu-item {
  display: flex;
  flex-direction: row;
  padding: 10px 12px;
  box-sizing: border-box;
  color: rgb(102 102 102);
  cursor: pointer;
  overflow: hidden;
  &:hover{
    color: rgb(6, 150, 215);
  }

  .side-menu-item__icon{
    fill: rgb(102 102 102);
  }

  &:hover .side-menu-item__icon{
    fill: rgb(6, 150, 215);
  }

  &--active {
    background-color: #fdfdfd;
    color: rgb(6, 150, 215);
    border-left: 3px solid rgb(6, 150, 215);
    padding-left: 9px;
    .side-menu-item__icon{
      fill: rgb(6, 150, 215);
    }
  }
}

.side-menu-item__title {
  font-family: 'Artifakt-Element', sans-serif;
  font-size: 14px;
  display: inline-block;
  overflow: hidden;
  position: relative;
  margin-left: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 50px);
}

.side-menu-item__icon {
  height: 24px;
}
</style>
