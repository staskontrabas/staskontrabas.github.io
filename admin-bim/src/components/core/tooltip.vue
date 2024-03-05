<template>
  <el-tooltip ref="tooltip" popper-class="custom-tooltip" :disabled="!isShowToolTip" placement="right">
    <template #content>
      <div class="content">
        {{ content }}
      </div>
    </template>
    <slot></slot>
  </el-tooltip>
</template>

<script lang="ts">

export default {
  name: 'TooltipComponent',
  props: {
    content: {
      type: String,
      default: '',
    },
    showAnyWay: {
      type: Boolean,
      default: false,
    }
  },
  data(){
    return {
      isShowToolTip: false,
    }
  },
  mounted() {
    const el = this.$refs.tooltip.$el.getElementsByClassName('side-menu-item__title')[0]
    this.isShowToolTip = el.offsetWidth < el.scrollWidth;
  },
  watch: {
    showAnyWay(oldValue, newValue) {
      if(newValue) {
        setTimeout(() => {
          const el = this.$refs.tooltip.$el.getElementsByClassName('side-menu-item__title')[0]
          this.isShowToolTip = el.offsetWidth < el.scrollWidth;
        }, 200)
      } else {
        this.isShowToolTip = true
      }
    },
  },
  methods: {

  }
}

</script>

<style scoped lang="scss">
.content {
  font-family: 'TT Norms Pro', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
}
</style>
