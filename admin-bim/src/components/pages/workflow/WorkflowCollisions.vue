<template>
    <v-container pt-0 pb-0 fluid fill-height text-xs-center>
        <v-layout row wrap>
        <v-container fluid px-3 pt-0 pb-0 class="problems-main-wrap">
            
            <!-- титульная страница -->
            <div class="problems-secondary-wrap">

                <!-- заголовок -->
                <div class="project-wrapper">
                    <span class="project-title">
                        Конфликты / Коллизии
                    </span>
                </div>

                {{ selected_docs }}

                <!-- кнопка настроек справа от названий вкладки -->
                <div class="tabs-buttons">
                    <div v-show="activeName == 'first'" class="tabs-buttons__wrapper" >
                        <el-dropdown placement="bottom-end" trigger="click" @command="handleCommand">
                            <el-button type="blue-text">
                                <inline-svg :src="require(`@/assets/icons/filter-icon.svg`)"/> 
                                    Настройки
                            </el-button>
                            <el-dropdown-menu class="settings" slot="dropdown">
                                <el-dropdown-item command="types"> One </el-dropdown-item>
                                <el-dropdown-item command="custom"> Two </el-dropdown-item>
                                <el-dropdown-item command="permissions"> Three </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </div>

                <!-- содержимое вкладки -->
                <el-tabs v-model="activeName">

                    <!-- вкладка "Проблемы" -->
                    <el-tab-pane label="Проблемы" name="first"> 

                        <!-- обертка -->
                        <div class="problems-main-body">

                            <!-- поиск, кнопки -->
                            <div class="table-header">

                                <!-- левые -->
                                <div class="left">

                                    <!--  ввод поиска -->
                                    <!-- <div class="input-wrapper">
                                        <v-text-field
                                            v-model="search"
                                            prepend-icon="search"
                                            placeholder="Поиск по имени"
                                            single-line
                                            hide-details
                                            class="m-table-toolbar--search ml-2"
                                            style="margin: 0px !important; height: 38px;"
                                        ></v-text-field>
                                    </div> -->

                                    <!-- <div>
                                        <el-select
                                            v-model="view_selector"
                                            :placeholder="view_selector ? '' : 'Выберите вид'" >

                                        </el-select>
                                    </div> -->

                                    <div class="issues--inner-wrap">
                                        <el-select
                                            v-model="selected_docs"
                                            :placeholder="view_selector ? '' : 'Выберите модели'"
                                            multiple 
                                            popper-class="issue-selector-observers ub-issue-form-popper"
                                            @change="calculateCollisions"
                                            @visible-change="setPoppersWidth">
                                            <el-option
                                                v-for="item in doclist"
                                                :key="item.id"
                                                :label="item.title"
                                                :value="item.id">
                                                <template>
                                                    <div class="issue-selector-observers option">
                                                        <div class="problems-form-row-wrap">
                                                            <div class="false-checkbox" :class="selected_docs.includes(item.id) ? 'false-checkbox-checked' : '' "></div>
                                                            <span> {{ item.title }} </span>
                                                        </div>
                                                    </div>
                                                </template>
                                            </el-option>
                                            
                                        </el-select>
                                    </div>
                        
                                </div>

                            </div>

                            <!-- обертка таблицы -->
                            <div class="table-wrapper table-body">
                                
                                <div class="ub-cross-table">
                                    
                                    <div class="top-row">
                                        <div class="filler"></div>
                                        <div class="vertical pseudocell" v-for="elem of test_file_list">
                                            <span>
                                                {{ elem }}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="divider"></div>

                                    <div class="normal-row" v-for="rowelem, rowindex of test_file_list">
                                        <div class="nameplate">
                                            <span>
                                                {{ rowelem }}
                                            </span>
                                            <span>
                                                Всего коллизий: {{ getTotalNumberOfCollisions(rowindex) }}
                                            </span>
                                        </div>
                                        <div class="pseudocell" 
                                        :style="[{'background-color': getBGColor(rowelem,colelem,rowindex,columnindex)}]" 
                                        v-for="colelem, columnindex of test_file_list">
                                           {{ rowindex == columnindex ? '' : rowindex*columnindex }} 
                                        </div>
                                    </div>

                                    <div class="divider"></div>

                                </div>

                            </div>
                        </div>

                    </el-tab-pane>
                </el-tabs>
            </div>

        </v-container>
        </v-layout>
    </v-container>
</template>


<script>
import InlineSvg from "vue-inline-svg"

export default {
    name: 'WorkflowCollisions',
    components: {
        InlineSvg,
    },
    data() {
        return {
            activeName: 'first',
            search: '',

            view_selector: null,
            model_selector: null,

            doclist: [],
            selected_docs: [],

            test_file_list: [
                'test1.ifc',
                'test2.ifctest2.ifctest2.ifctest2.ifc',
                'House.ifc',
                'Nest.ifc',
                'Hospital.ifc',
                'Garage.ifc',
            ],

          }
    },
    watch: {

    },
    methods: {
        handleCommand(command) {
            switch(command) {
                case 'types': 
                case 'custom':
                case 'permissions':
                case 'main':
                case 'templates':
                case 'statuses':
                {
                    console.log('got command', command)
                    break
                }
                default: {
                    console.log(`command ${command} has typo or not defined`)
                }
            }
        },
        getBGColor(row_elem,col_elem,r_index,c_index) {
            let color = '#eee'
            if (r_index == c_index) {
                return 'lightgrey'
            }

            if (r_index * c_index > 4 ) {
                color = 'orange'
            }

            if (r_index * c_index > 8 ) {
                color = 'red'
            }

            return color
        },
        getTotalNumberOfCollisions(row_index) {
            let sum = 0
            for (let i=0; i<6; i++) {
                if (i == row_index) {
                    continue
                }
                sum = sum + row_index*i
            }
            return sum
        },

        extractFiles(folders_array, target) {
            console.log('extracting', folders_array, target)

            for (const folder of folders_array) {
                console.log('folder', folder)
                // файлы
                if (folder.files) {
                    console.log('got files')
                    for (const file of folder.files) {
                        target.push(file) // собираем все файлы в массив target
                    }
                }
                // вложенные папки
                if (folder.folders) {
                    this.extractFiles(folder.folders, target)
                }

            }
            
            return target
        },

        setPoppersWidth() {
            // для обобщения процедуры должно быть достаточно заменить класс обертки, содержащей el-select (здесь 'issues--inner-wrap')
            const ref = document.getElementsByClassName('issues--inner-wrap')[0]
            const real_width = ref ? ref.offsetWidth : null

            if (!real_width) {
                return null
            }
            let targets = document.querySelectorAll('.ub-issue-form-popper:not(.display)')
            for (let elem of targets) {
                elem.style['min-width'] = real_width + 'px'
            }
        },

        calculateCollisions() {
            let source = this.selected_docs

            // не меньше 2-х файлов для отображения в таблице
            if (source.length < 2) {
                return null
            }

            // TODO: check if the recalculation is necessary
            // TODO: fire only when no collisions are in local data || recalculation is forced

            this.$store.dispatch('workflow/calculateIfcFilesCollisions', { files: source })
            .then(res => {
                console.log('got res with task id', res)
            })

        }
        
    },
    computed: { 
    },
    mounted() {
        // this.doclist = this.$store.state.workflow
        console.log(this.$route.params.id)
        // this.$store.dispatch('workflow/getFoldersByProjectId', this.$route.params.id)
        // .then(res => {
        //     let list = []
        //     this.doclist = this.extractFiles(res, list).filter(obj => obj.format == 'ifc')
        // })

        this.$store.dispatch('workflow/getSpaces', this.$route.params.id)
        .then(res => {
            console.log('got spaces for wf-collisions', res)
            let list = res.length ? res[0].models.files : []
            this.doclist = list
        })

        this.$store.dispatch('workflow/getIfcFilesCollisions', '35')
        .then(res => {
            console.log('got response for get ifc collisions', res)
        })
        
        
    },
}
 
</script>

<style lang="scss" scoped>
.problems-main-wrap {
  --hover-active-blue: rgb(6, 150, 215);
  --white-background: #ffffff;
  --common-text-color: #666666;
  --hover-background-color: #f6f6f6;
}

.problems-secondary-wrap {
    height: 100%;
}

.tabs-buttons {
  display: flex;
  width: 100%;
  height: 0px;
  justify-content: flex-end;

  .tabs-buttons__wrapper {
    display: flex;
    justify-content: flex-end;
    overflow: visible;
    width: 400px;
    transform: translateY(-3px); // костыль, помещает кнопки на один уровень с нужным элементом визуально
    z-index: 1;
    padding: 16px;
  }
}

.settings {
    &.el-popper.el-dropdown-menu {
        transform: translateY(16px); // костыль, помещает кнопки на один уровень с нужным элементом визуально
        & .el-dropdown-menu__item {
            &:hover {
                // наследуется от верха страницы, невозможно передать цвета из текущего компонента
                background-color: #f6f6f6;
                color: #666666;
            }
        }
    }
}

.table-header {
    display: flex; 
    flex-direction: row; 
    flex-wrap: nowrap; 
    align-items: center; 
    justify-content: start;
    padding: 16px;

    & .left {
        gap: 16px;
    }

    & div {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
    }
}

.table-body {
    display: flex; 
    padding: 16px;
    height: 600px;
    max-height: 600px;
    max-width: calc(100% - 1px);
    overflow: auto;
    // border: 1px solid green;

    .divider {
        height: 0px;
        margin: 8px 0px;
        border-top: 3px solid #eee;
    }

    & .ub-cross-table {

        .top-row {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: center;
            gap: 16px;
        }

        .normal-row {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: center;
            gap: 16px;
            border-bottom: 1px solid #eee;

            .nameplate {
                display: flex;
                flex-direction: column;
                width: 250px;
                // border: 1px solid red;
                height: 48px;
                padding-left: 8px;
                padding-top: 4px;
                & span {
                    display: inline-block;
                    height: 20px;
                    max-width: calc(100% - 16px);
                    overflow-x: hidden;
                    text-overflow: ellipsis;
                    &:last-of-type {
                        color: gray;
                    }
                }
            }
        }

        .pseudocell {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            // border: 1px dashed lightcoral;
            width: 150px;
            height: 44px;

            &.vertical {
                display: flex;
                height: 150px;
                max-height: 150px;
                align-items: center;
                justify-content: start;
                padding: 8px;
                writing-mode: sideways-lr;
                overflow: hidden;
                text-overflow: ellipsis;
                & span {
                    max-height: calc(150px - 16px);
                    overflow: hidden;
                }
            }
        }

    }

    .filler {
        height: 150px;
        max-height: 150px;
        width: 250px;
        // border: 1px solid blue;
    }

    
}


</style>
