<!--
Custom table component для представления данных в виде таблицы

0.  Путь для импорта: // import ubTable from "@/components/custom/ubTable.vue"

1.  Обертка "ub-table-main-wrap" имеет flex-grow 1 и flex-shrink 0, должна заполнять автоматически все предоставленное родительским контейнером пространство.
    Для ограничения пространства НЕОБХОДИМО задать фиксированные размеры родительского контейнера, иначе возникнут проблемы со скроллом.
    Сама таблица представляет собой два вертикально расположенных контейнера [body]/[footer].
    Контейнер [body] содержит ряд [headers], где отображаются ячейки с названиями столбцов, и ряды данных [row].
    Каждый заголовок из [headers] содержит ручку для ресайза [resizer], кроме последнего и контейнера с чекбоксами.
    Под [header] вертикально по порядку монтируются элементы [row] из this.data.
    Каждый ряд должен содержать то же количество столбцов, что и массив, поданный в this.headers.

2.  Данные передаются в таблицу при помощи пропа this.data и должны представлять собой список [], 
    в идеале список объектов, [{}], передающихся через scope-слот в родительский элемент для обработки там.

3.  Данные для заголовков передаются отдельно, в массиве объектов вида
    [{name: 'name', title: 'имя', width: '340', icon: null, click: null, }, ... ].
    Порядок элементов в массиве соответствует порядку именованных колонок в таблице, слева направо.
    Колонка, отведенная под чекбоксы, вставляется автоматически при указании атрибута seleсtable или multiselectable, всегда слева от остальных колонок.
    Параметр width (string) задает стартовую ширину колонки в px.
    Параметр icon (null | string) должен соотвествовать названию (без расширения .svg) одной из иконок, расположенных в '@/assets/icon'.
    Параметр click (null | string) позволяет поднять событие с указанным в string названием при клике на заголовок колонки.

4.  Данные о выделенных рядах содержатся во внутреннем пропе this.selectedrows.
    Ряд идентифицируется пока только по порядковому номеру элемента в this.data. Поскольку массвы JS упорядочены, это не должно быть проблемой.

5.  Проп fixedside определяет, с какой стороны находятся фиксированные столбцы. Допускаются значения 'left' и 'right', другие значения игрорируются.
    Проп fixedcolumn определяет имя (должно совпадать с пропом name в headers) колонки,
    которой заканчивается набор фиксированных колонок при закреплении слева, и начинаться набор при закреплении справа.
    Если такой колонки нет в headers, фиксация будет игнорироваться.
    Фиксация переделывается.

6.  Содержимое колонок теперь передается через scoped slots из точки монтирования.
    Необходимо учитывать, что стили таблицы не применяются к контейнерам и объектам, определенным в точке монтирования.

7.  Последний ряд неявно зарезервирован под колонку меню. Как с ним обращатся, надо подумать отдельно.


95:
96.
97. При реворке элемента разбить его на двухуровневый компонент, так, чтобы передавать данные для заголовков через параметры слотов.
98. Добавить внутреннюю фильтрацию рядов по указанному атрибуту
99.
100.
101. Добавить возможность редактировать содержимое футера (через слот)
103. Сортировка по определенной колонке (name)
105. Переделать процедуру setSelectedRowsByIds - возможность выделять ряды по списку с произвольными полями

-->


<template>
    <div class="ub-table" id="ub-table-main-wrap">

        <!-- Основное тело [body] -->
        <div id="ub-table-body">

            <!-- No-data-screen -->
            <div class="ub-table-no-data"
                v-show="data.length == 0">
                <inline-svg :src="require(`@/assets/images/SvgBoxes.svg`)" />
                <span> Нет данных </span>
            </div>

            <div id="ub-table-all-rows" class="ub-table-all-rows">


                <!-- Заголовки без фиксации -->
                <div class="ub-table-no-fixedside-headers" v-if="_fixedside == null">
                <!-- Ряд заголовков [headers] -->
                    <div class="ub-table-header-row ub-table-row"
                        v-show="headers.length && data.length">

                        <div v-if="multiselectable" class="ub-table-header-cell ub-table-checkboxes">
                            <el-checkbox :indeterminate="indeterminate" v-model="allrows" @change="handleAllCheckboxClick" />
                        </div>

                        <!-- заголовки с изменяемыми размерами -->
                        <div class="ub-table-header-cell resizeable"
                            v-for="(header, column_index) in headers"
                            :style="getStyleForColumn(column_index)"
                            :class="column_index == (headers.length - 1) ? 'outermost-right' : ''"
                            @click="headerClick(header.click)">

                            <!-- Резайзер [resizer] -->
                            <div class="ub_table_resizer"></div>

                            <!-- текст в заголовке -->
                            <el-tooltip class="item" effect="dark" :content="capitalizeString(header.title)" :disabled="!needs_tooltip" placement="right">
                                <span class="ub-table-header-title truncate-text" @mouseover="checkIfNeedsTooltip">
                                    {{ header.title }}
                                </span>
                            </el-tooltip>

                            <!-- иконка (если есть) -->
                            <template v-if="header.icon">
                                <inline-svg class="svg-24" 
                                    v-if="header.icon"
                                    :src="returnIconSRC(header.icon)"
                                />
                            </template>
                        </div>
                    </div>
                </div>



                <!-- заголовки при наличии фиксации справа или слева -->
                <div class="ub-table-with-fixedside-headers" v-if="_fixedside !== null" >

                    <div class="ub-table-header-row ub-table-row"
                        v-show="data.length">

                        <!-- left drawer - заголовки -->
                        <div class="ub-table-left-drawer"
                            :class="[
                            _fixedside == 'left' ? 'fixedleft' : 'stretchy',
                            rows_overflowing && _fixedside == 'left' ? 'fixedleft-shadow' : ''
                            ]">

                            <!-- чекбоксы -->
                            <div v-if="multiselectable" class="ub-table-header-cell ub-table-checkboxes">
                                <el-checkbox :indeterminate="indeterminate" v-model="allrows" @change="handleAllCheckboxClick" />
                            </div>

                            <!-- заголовки с изменяемыми размерами -->
                            <div class="ub-table-header-cell resizeable"
                                v-for="(header, column_index) in _left_headers"
                                :style="getStyleForColumn(column_index)"
                                :class="!_right_headers.length && column_index == (_left_headers.length - 1) ? 'outermost-right' : ''"
                                @click="headerClick(header.click)">

                                <!-- Резайзер [resizer] -->
                                <div class="ub_table_resizer"></div>

                                <!-- Заголовок -->
                                <el-tooltip class="item" effect="dark" :content="capitalizeString(header.title)" :disabled="!needs_tooltip" placement="right">
                                    <span class="ub-table-header-title truncate-text" @mouseover="checkIfNeedsTooltip">
                                        {{ header.title }}
                                    </span>
                                </el-tooltip>

                                <!-- Иконка (если есть) -->
                                <template v-if="header.icon">
                                    <inline-svg class="svg-24" 
                                        v-if="header.icon"
                                        :src="returnIconSRC(header.icon)"
                                    />
                                </template>
                            </div>
                        </div>


                        <!-- right drawer - заголовки -->
                        <div class="ub-table-right-drawer"
                            :class="[_fixedside == 'right' ? 'fixedright' : 'stretchy',
                            rows_overflowing && _fixedside == 'right' ? 'fixedright-shadow' : '',
                            ]"
                        >

                            <!-- заголовки с изменяемыми размерами -->
                            <div class="ub-table-header-cell resizeable"
                                v-for="(header, column_index) in _right_headers"
                                :style="getStyleForColumn(column_index + (_fixedside == 'right' ? _fixedcolumnindex : _fixedcolumnindex + 1))"
                                :class="_right_headers.length && column_index == (_right_headers.length - 1) ? 'outermost-right' : ''"
                                @click="headerClick(header.click)">

                                <!-- Резайзер [resizer] -->
                                <div class="ub_table_resizer"></div>

                                <!-- Заголовок -->
                                <el-tooltip class="item" effect="dark" :content="capitalizeString(header.title)" :disabled="!needs_tooltip" placement="right">
                                    <span class="ub-table-header-title truncate-text" @mouseover="checkIfNeedsTooltip">
                                        {{ header.title }}
                                    </span>
                                </el-tooltip>

                                <!-- Иконка (если есть) -->
                                <template v-if="header.icon">
                                    <inline-svg class="svg-24" 
                                        v-if="header.icon"
                                        :src="returnIconSRC(header.icon)"
                                    />
                                </template>
                            </div>
                        </div>

                    </div>

                </div>

                <!-- ряды [rows] (без fixedside) -->
                <div class="ub-table-no-fixedside" v-if="_fixedside == null">
                    <div class="ub-table-row" v-for="(row, rowindex) in data">

                        <!-- колонка чекбоксов [checkboxes] -->
                        <div v-if="multiselectable" class="ub-table-checkboxes">
                            <el-checkbox
                                :label="'row' + rowindex"
                                v-model="selectedrows"
                                @change="handleRowCheckboxClick"
                            />
                        </div>


                        <!-- колонки из $scopedSlots -->
                        <div class="ub-table-slot-cell"
                            v-for="(index, name, column_index) in $scopedSlots"
                            :class="['column' + column_index,]"
                            :style="getStyleForColumn(column_index)">

                            <slot :name="name" :item="data[rowindex]">
                            </slot>
                        </div>
                    </div>
                </div>


                <!-- ряды с fixedside -->
                <div class="un-table-with-fixedside" v-if="_fixedside !== null">
                    <div class="ub-table-row" v-for="(row, rowindex) in data">

                        <!-- left drawer - rows -->
                        <div class="ub-table-left-drawer ub-table-row"
                            :class="[
                                    _fixedside == 'left' ? 'fixedleft' : 'stretchy',
                                    rows_overflowing && _fixedside == 'left' ? 'fixedleft-shadow' : '',
                                    ]">

                            <!-- колонка чекбоксов [checkboxes] -->
                            <div v-if="multiselectable" class="ub-table-checkboxes">
                                <el-checkbox
                                    :label="'row' + rowindex"
                                    v-model="selectedrows"
                                    @change="handleRowCheckboxClick"
                                />
                            </div>

                            <!-- колонки с левыми данными -->
                            <div class="ub-table-slot-cell"
                                v-for="(index, name, column_index) in _left_drawer_columns"
                                :class="['column' + column_index,]"
                                :style="getStyleForColumn(column_index)">

                                <slot :name="name" :item="data[rowindex]">
                                </slot>
                            </div>
                        </div>

                        <!-- right-drawer - rows -->
                        <div class="ub-table-right-drawer ub-table-row"
                            :class="[
                                    _fixedside == 'right' ? 'fixedright' : 'stretchy',
                                    rows_overflowing && _fixedside == 'right' ? 'fixedright-shadow' : '',
                                    ]">
                            <div class="ub-table-slot-cell"
                                v-for="(index, name, column_index) in _right_drawer_columns"
                                :class="['column' + (column_index + (_fixedside == 'right' ? _fixedcolumnindex : _fixedcolumnindex + 1)),]"
                                :style="getStyleForColumn(column_index + (_fixedside == 'right' ? _fixedcolumnindex : _fixedcolumnindex + 1))">

                                <slot :name="name" :item="data[rowindex]">
                                </slot>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>


        <!-- нижний заголовок [footer] -->
        <div id="ub-table-footer"
            v-if="data.length !== 0 && !disablefooter">
            <span
            v-if="selectedrows.length">
                Выделено {{ selectedrows.length }} из {{ data.length }} элементов
            </span>
            <span
            v-else>
                Отображается {{ data.length }}  элементов
            </span>
        </div>


    </div>
</template>

<script>
import InlineSvg from "vue-inline-svg"

    export default {
        name: 'ubTable',
        components: {
            InlineSvg,
        },
        props: {
            headers: { type: Array, default: () => {
                return [ ]
            }},
            data: { type: Array, default: () => { return [] }},
            fixedcolumn: { type: String, default: 'name' },
            fixedside: String,          // left | right
            selectable: Boolean,        // пока не готово
            multiselectable: Boolean,   // enables leftmost checkbox column
            disablefooter: Boolean,     // should footer be displayed
            preselect: { type: Array, default: () => { return [] }},
            savedcolumnwidth: { type: Array, default: () => { return [] }},
        },
        data() {
            return {
                selectedrows: [], // rows with checkboxes selected

                columns_width: [], // holder for current columns width

                indeterminate: false, // for 'check all' checkbox
                checkAll: false,
                allrows: false,

                needs_tooltip: false,
                rows_overflowing: false, // is rows width are greater than table width or left/right column
            }
        },

        // watch, methods, computed
        watch: {
            'data'(newval, oldval) {
                // при изменении подаваемых данных отключаем заполнение чекбоксов
                this.selectedrows = []
                this.indeterminate = false
                this.allrows = false
                if (this.preselect && this.preselect.length) {
                    this.setSelectedRowsByIds(this.preselect)
                }
                this.rows_overflowing = this.check_if_rows_overflowing()
                this.activate_resizers()
            },
            'columns_width'() {
                this.rows_overflowing = this.check_if_rows_overflowing()
                this.$emit('save_columns_width', this.columns_width)
                
            },
            'selectedrows'(newval, oldval) {
                this.$emit('selected_change', newval)
            }
        },
        methods: {
            handleAllCheckboxClick(val) {
                // выставляет знак "-" в чекбоксе при частично выделенном списке
                this.selectedrows = val ? this._all_checkbox_values : [];
                this.indeterminate = false;
            },
            handleRowCheckboxClick() {
                let checkedCount = this.selectedrows.length
                this.checkAll = checkedCount === this.data.length
                this.indeterminate = checkedCount > 0 && checkedCount < this.data.length
                this.allrows = checkedCount !== 0
            },
            activate_resizers() {
                // добавляет watchers, отслеживающие изменение размеров колонок
                // используется хардкод для выделения элемента колонки - это всегда должен быть resizer

                const resizebles = document.getElementsByClassName('resizeable'); //
                const target = this.columns_width; // там хранится ширина колонок

                [].forEach.call(resizebles, function (res, index) {
                    // считается, что индекс колонки должен совпадать с индексом в колонках
                    let resizer = res['firstChild']
                    const affected_cells = document.getElementsByClassName('column'+ index)

                    const createResizableColumn = function (res, resizer, index) {
                        let x = 0;
                        let w = 0;
                        const mouseDownHandler = function (e) {
                            // console.log('got here,', e)
                            x = e.clientX;
                            const styles = window.getComputedStyle(res);
                            w = parseInt(styles.width, 10);
                            document.addEventListener('mousemove', mouseMoveHandler);
                            document.addEventListener('mouseup', mouseUpHandler);
                        };
                        const mouseMoveHandler = function (e) {
                            const dx = e.clientX - x; // Determine how far the mouse has been moved
                            let width = w + dx > 48 ? w + dx : 48 // minimal width = 48px
                            target.splice(index, 1, width) // vue must register the change to update the component
                            res.classList.add('resizing-header');
                            res.classList.add('resizing');
                            for (const cell of affected_cells) {
                                cell.classList.add('resizing');
                            }
                        };
                        const mouseUpHandler = function () { // When user releases the mouse, remove the existing event listeners
                            document.removeEventListener('mousemove', mouseMoveHandler);
                            document.removeEventListener('mouseup', mouseUpHandler);
                            res.classList.remove('resizing-header');
                            res.classList.remove('resizing');
                            for (const cell of affected_cells) {
                                cell.classList.remove('resizing');
                            }
                        };
                        resizer.addEventListener('mousedown', mouseDownHandler);
                    }

                    createResizableColumn(res, resizer, index)
                })
            },
            returnIconSRC(icon) {
                if (!icon || typeof icon !== 'string') {
                    return ''
                }
                return require(`@/assets/icons/${icon}.svg`)
            },
            setInitialColumnWidths(columns, headers) {
                // устанавливает ширину колонок по сохраненным данным либо по headers
                let source = this.savedcolumnwidth
                if (source && source.length && source.length == headers.length) {
                    //set from saved
                    // console.log('got width', this.savedcolumnwidth)
                    for (const width of source) {
                        columns.push(width)
                    }
                }
                else {
                    // set from headers
                    for (const header of headers) {
                        columns.push(header.width)
                    }
                }
            },
            getStyleForColumn(index) {
                let width = this.columns_width[index]+'px'
                // console.log('index', index, 'width', width)
                return {'max-width': width, 'min-width': width, }
            },
            headerClick(item) {
                if (!item) {
                    return null
                }
                // console.log('item', item)
                this.$emit(item)
            },
            checkIfOverflowing(num, target) {
                // target must be an HTMLElement
                if (target.offsetWidth < target.scrollWidth) {
                    return true
                }
                return false
            },
            checkIfNeedsTooltip(arg) {
                let target = arg.target
                if (target.offsetWidth < target.scrollWidth) {
                    this.needs_tooltip = true
                    return true
                }
                this.needs_tooltip = false
                return false
            },
            capitalizeString(str) {
                if (typeof str !== 'string') {
                    console.log(string, 'is not string')
                    return str
                }
                return str.charAt(0).toUpperCase() + str.slice(1)
            },
            check_if_rows_overflowing() {
                let rows = document.getElementById('ub-table-all-rows')
                return rows.clientWidth < rows.scrollWidth
            },
            setSelectedRowsByIds(arr) {
                // v 0.5
                // выделяет ряды по списку id элементов; список должен быть []str
                // !!! Работает ТОЛЬКО для файлов из моделей!
                let list = []
                for (const id of arr) {
                    const elem = this.data.find(obj => obj.url == id) // Дима утверждает, что нужны именно url
                    if (!elem) {
                        continue
                    }
                    let index = this.data.indexOf(elem)
                    if (index < 0 ) {
                        continue
                    } 
                    list.push('row' + index )
                }
                // выставляем выделенные ряды
                this.selectedrows = list
                // правильный вид indeterminate / allrows (управляющий чекбокс)
                // console.log('this is list', list)
                if (list.length && (list.length !== this.data.length)) {
                    this.indeterminate = true
                    this.allrows = false
                }
                else if (list.length && (list.length == this.data.length)) {
                    this.allrows = true
                    this.indeterminate = false
                }
            },
        },
        computed: {
            _fixedside() {
                if (!this.fixedside) { return null }
                switch(this.fixedside) {
                    case 'right': {
                        return 'right'
                    }
                    case 'left': {
                        return 'left'
                    }
                    default: {
                        return null
                    }
                }
            },

            // Технический список для чекбоксов - нужен для работы "выбрать/очистить все чекбоксы"
            _all_checkbox_values() {
                let list = []
                for (const elem in this.data) {
                    list.push('row' + elem)
                }
                return list
            },

            _fixedcolumnindex() {
                const hdrs = this.headers
                const col_index = hdrs.indexOf(hdrs.find(obj => obj.name == this.fixedcolumn))
                if (col_index == -1) {
                    return null
                }
                return col_index
            },

            _left_headers() {
                if (!this._fixedside || this._fixedcolumnindex == null || !this.headers.length) {
                    return []
                }
                let l_hdrs = []
                const hdrs = this.headers
                const indx = this._fixedside == 'left' ? this._fixedcolumnindex : this._fixedcolumnindex - 1
                for (let i=0; i <= indx; i++ ) {
                    l_hdrs.push(hdrs[i])
                }
                return l_hdrs
            },

            _right_headers() {
                if (!this._fixedside || this._fixedcolumnindex == null || !this.headers.length) {
                    return []
                }
                let r_hdrs = []
                const hdrs = this.headers
                const indx = this._fixedside == 'right' ? this._fixedcolumnindex : this._fixedcolumnindex + 1
                for (let i=indx; i < hdrs.length; i++ ) {
                    r_hdrs.push(hdrs[i])
                }
                return r_hdrs
            },

            _left_drawer_columns() {
                if (!this._fixedside || this._fixedcolumnindex == null || !this.$scopedSlots) {
                    return {}
                }

                let l_cols = {}
                const cols = this.$scopedSlots
                const indx = this._fixedside == 'left' ? this._fixedcolumnindex : this._fixedcolumnindex - 1

                let i = 0
                for (const col of Object.keys(cols)) {
                    l_cols[col] = cols[col]
                    i++
                    if (i > indx) {
                        break
                    }
                }
                return l_cols
            },
            _right_drawer_columns() {
                if (!this._fixedside || this._fixedcolumnindex == null || !this.$scopedSlots) {
                    return {}
                }
                let r_cols = {}
                const cols = this.$scopedSlots
                const indx = this._fixedside == 'right' ? this._fixedcolumnindex : this._fixedcolumnindex + 1

                let i = 0
                for (const col of Object.keys(cols)) {
                    if (i < indx) {
                        i++
                        continue
                    }
                    r_cols[col] = cols[col]
                    i++
                }
                return r_cols
            },
        },

        // vue lifehooks below
        created() {
        },
        beforeMount() {
            this.setInitialColumnWidths(this.columns_width, this.headers)
        },
        mounted() {
            document.getElementById('ub-table-main-wrap').style.setProperty('--footer-height', this.disablefooter ? '0px' : '40px');
            this.$nextTick( () => {
                // подключаем ресайзеры для изменения размера колонок
                this.activate_resizers()
            })
        },
        updated() {
        },
        unmounted() {
            window.removeEventListener('scroll', this.handleScroll)
            this.selectedrows = []
        },
        beforeDestroy() {
            this.$emit('save_columns_width', this.columns_width)
        },
    }
</script>

<style lang="scss" scoped>

#ub-table-main-wrap {
    // main table wrap window
    display: flex;
    flex: 1 0; // grow 1 shrink 0; for now produces no problems with overflow & scroll, keep monitoring
    flex-direction: column;
    overflow: hidden;
    min-height: 0; /* new */
    height: calc(100%);

    font-weight: 500;
    font-family: "Artifakt Element", sans-serif;
    font-size: 14px;
    color: #3c3c3c;

    --footer-height: 40px;
    --row-height: 48px; // also header height
    --resizer-width: 3px;
    --checkbox-column-width: 40px;

    --white-background: #ffffff;
    --lower-border-color: #eee;
    --hover-color: #f6f6f6;
    --active-resizer-color: #a7d3ec;
    --hover-active-blue: rgb(6, 150, 215);
    --inactive-resizer-color: #c7c7c7;

}

#ub-table-body {
    // contains main body with 3 main sections
    flex: 1 0;
    display: flex;
    flex-direction: column;
    max-height: calc(100% - var(--footer-height)); //
    background-color: var(--white-background);

    > .ub-table-no-data {
        // no data screen
        // flex: 1 0;
        display: flex;
        flex-direction: column;
        max-height: calc(100%);
        min-height: calc(100%);
        justify-content: center;
        align-items: center;
    }
}

.ub-table-all-rows {
    position: relative;
    overflow-y: scroll;
    height: 100%;
}

.ub-table-no-fixedside-headers {
    position: sticky;
    top: 0px;
    z-index: 4;
}

.ub-table-with-fixedside-headers {
    position: sticky;
    top: 0px;
    z-index: 4;
}

.ub-table-header-row {
    position: sticky;
    top: 0;
    // min-width: fit-content;
    width: 100%;
    z-index: 3;
    background-color: var(--white-background);
}

.ub-table-header-cell {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0px 8px;
    // border-bottom: 1px solid #eee;

    background-color: var(--white-background);
    min-height: 48px;
    font-weight: 600;
    position: sticky;
    z-index: 2; // must be > 1 since el-checkboxes have z-index: 1;
    top: 0;

    &:hover {
        background-color: var(--hover-color);
        & .ub_table_resizer:not(:active) {
            background-color: var(--inactive-resizer-color);
        }
    }
    &.outermost-right {
        margin-left: auto; // выравнивает последний элемент по правому краю
        &:hover {
            background-color: var(--white-background);
            & .svg-24 {
                fill: var(--hover-active-blue);
            }
        }
        & .ub_table_resizer {
            background-color: var(--white-background);
            display: none;
        }
    }
}

.ub-table-checkboxes {
    flex: 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
    // background-color: green !important;
    max-width: var(--checkbox-column-width) !important;
    min-width: var(--checkbox-column-width) !important;
    border-right: 0 !important; // to compensate for resizer-border
        & > * {
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: var(--checkbox-column-width) !important;
            max-width: var(--checkbox-column-width) !important;
        }
}

.ub-table-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    min-height: var(--row-height);
    border-bottom: 1px solid var(--lower-border-color);
    min-width: fit-content;

    &:hover:not(.ub-table-header-row) {
        background-color: var(--hover-color);
        & .ub-table-left-drawer, .ub-table-right-drawer {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            background-color: var(--hover-color);
        }
    }
}

.ub-table-slot-cell {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: start;
    height: var(--row-height);
    padding: 0 8px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    min-width: 48px;
    &:last-child {
        margin-left: auto; // выравнивает последний элемент по правому краю
    }
}

.ub_table_resizer {
    /* handle at the right side of column header */
    position: absolute;
    z-index: 10;
    top: 0;
    right: 0;
    min-width: var(--resizer-width);
    width: var(--resizer-width);
    height: var(--row-height); // должно совпадать с высотой заголовка
    flex: 0 0;
    background-color: transparent;

    &:hover {
        background-color: var(--inactive-resizer-color);
        &~ .ub-table-header-cell {
            background-color: var(--hover-color);
        }
    }
    &:active {
        background-color: var(--active-resizer-color);
    }
    cursor: col-resize;
    user-select: none;
}

.ub-table-header-title {
    &::first-letter {
        text-transform: capitalize;
    }
}

.ub-table-right-drawer, .ub-table-left-drawer {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
}

.resizing {
    // используется, добавляется процедурно
    border-right: 1px solid var(--active-resizer-color);
}

.resizing-header {
    // используется, добавляется процедурно
    background-color: var(--hover-color);
}

// нижний колонтитул
#ub-table-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px 8px;
    // border: 1px dashed darkgoldenrod;
    border-top: 1px solid rgb(220, 220, 220);
    height: 40px;
}

.svg-24 {
    min-height:24px;
    min-width:24px;
    max-height: 24px;
    max-width: 24px;
}

.fixedleft {
    position: sticky;
    background-color: var(--white-background);
    left: 0px;
    z-index: 3;
}

.fixedleft-shadow {
    box-shadow: 0px 0 0px 0px var(--inactive-resizer-color);
}

.fixedright {
    position: sticky;
    background-color: var(--white-background);
    right: 0px !important;
    z-index: 3;
}

.fixedright-shadow {
    box-shadow: 0px 0px 0px 0px var(--inactive-resizer-color);
}

.stretchy {
    flex: 1 1 auto;
}

</style>
