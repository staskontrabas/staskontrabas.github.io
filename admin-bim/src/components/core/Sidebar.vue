<template>
    <el-aside
        v-if="part.drawer"
        :style="{'min-width': widthControl + 'px', 'max-width': widthControl +'px'}">

        <div class="side-menu">
            <div class="menu-wrapper">
                <side-menu-item v-for="(menuItem,index) in filteredList"
                    :key="'manuItem'+ index"
                    :title="menuItem.title"
                    :icon="menuItem.icon"
                    :link="menuItem.link.includes('/{id}/') ? menuItem.link.replace('{id}', getProjectId()) : menuItem.link"
                    :id="menuItem.id"
                    :mini="side_mini"
                ></side-menu-item>
            </div>

            <div>
                <v-divider/>
                <div class="d-flex flex-row aling-center">
                    <el-tooltip class="item" effect="dark" :content="textTooltipButton" placement="right">
                        <button class="toggle-button" @click="toggleSideMini" :class="{'rotate': side_mini}">
                            <inline-svg class="side-menu-item__icon" :src="require(`@/assets/icons/left-arrow-icon.svg`)"></inline-svg>
                        </button>
                    </el-tooltip>
                </div>
            </div>
        </div>

    </el-aside>
</template>

<script>
import SidebarFolders from '@/components/pages/workflow/workflow_project/SidebarFolders'
import SideMenuItem from "@/components/core/SideMenuItem"
import InlineSvg from "vue-inline-svg"

export default {
    name: 'Sidebar',
    props: ['part', 'side_mini','side_type',],
    components: {
        SidebarFolders,
        SideMenuItem,
        InlineSvg,
    },
    data(){
        return {
            mini: false,
            default: false,
        }
    },
    methods: {
        setActiveMenuItem(itemId) {
            // console.log(itemId)
            this.part.list = this.part.list.map((item) => {
            if(item.id === itemId) {
                return {
                    ...item,
                    active: true,
                }
                } else {
                return {
                    ...item,
                    active: false,
                }}
            })
        },
        getProjectId() {
        return this.$route.params.id || 'errorID'
        },
        // toggleMenu() {
        //     this.mini = !this.mini
        // },
        toggleSideMini() {
            this.$emit('update:side_mini', !this.side_mini)
        },
        navigateToFirstItem() {
            this.$nextTick( () => {
                // не очень понимаю почему, но где-то срабатывает двойная навигация
                let source = this.filteredList[0]
                if (source === undefined) {
                    return null
                }
                let link = source.link.includes('/{id}/') ? source.link.replace('{id}', this.getProjectId()) : source.link
                this.$router.push(link)
            })
        },
    },
    computed: {
        textTooltipButton() {
        if(this.side_mini) {
          return 'Развернуть'
        } else {
          return 'Свернуть'
        }
      },
      widthControl() {
        if(this.side_mini) {
          return 48
        } else {
          return 225
        }
      },
      filteredList() {
        let list = this.part.list
        let type = this.side_type

        const owner_id = this.$store.state.administration.company.owner
        const user_id = this.$store.state.administration.user.id

        const got_access = (owner_id && user_id) ? owner_id == user_id : false

        let result = []

        for (const elem of list) {
            if (elem.belongs_to.includes(type)) {
                result.push(elem)
            }
        }

        if (!got_access) {
            result = result.filter(obj => !obj.access_list.includes('owner'))
        }

        return result
      }
    },
    mounted() {
        this.$root.$on('appbar_doc_current_tab_change', this.navigateToFirstItem)
    },
    destroy() {
        this.$root.$off('appbar_doc_current_tab_change', )
    },
}
</script>


<style scoped lang="scss">
.side-menu {
  background-color: #f6f6f6;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 48px); // видимая область - высота шапки сайта #core-header
}

.divider {
  display: flex;
  width: calc(100% - 16px);
  margin-left: 8px;
  height: 1px;
  background-color: #dcdcdc;
}

.side-menu-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background-color: #f6f6f6;
}

.toggle-button {
  display: inline-flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  padding: 6px;
  margin: 4px 6px;
  color: rgb(102 102 102);

  &:hover {
    background-color: #eeeeee;
  }
}

.rotate {
  transform: rotate(180deg);
}
</style>
