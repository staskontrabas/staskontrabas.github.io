<template>
    <div class="common-text m-text--size16">
        <v-card class="mx-2 my-1 d-flex flex-column" outlined :elevation="3" v-if="displaystate.shown">
    
            <!-- header / title card -->
                <div class="px-4 titlecard itemheight d-flex flex-row align-center pointer-hand" @click="togglefolded">
                    <div class="unfold-block" style="position: relative;">
                        <v-icon :class="{ rotated: !folded }">
                            mdi-chevron-right
                        </v-icon>
                    </div>
                    <span class="px-2"> {{ sectionindex }} &nbsp;{{ title }} </span>

                    <v-spacer/>

                    <v-tooltip max-width="280" color="black" top>
                        <template v-slot:activator="{ on, attrs }">
                            <div class="position-relative" v-on="on" v-bind="attrs">
                                <v-icon v-if="standard" dense class="mr-2" color="gray">
                                    mdi-lock-outline
                                </v-icon>
                            </div>
                        </template>
                        <span> Это стандартный элемент, компоненты которого нельзя менять. </span>
                    </v-tooltip>
                    <v-icon v-if="(sectionlevel=== 0 || !standard)" class="trash-icon" color="red" @click.stop="static ? '' : deleteBlock($event.target)">
                        mdi-trash-can-outline
                    </v-icon>
                </div>
            <v-divider v-if="!folded && sectionlevel !== 0" />
    
    
            <!-- mounting point of components -->
            <div class="pb-6" v-if="content && content.length && sectionlevel !== 0" v-show="!folded">
                <component v-for="comp, index of content" 
                :is="comp.typeofelement" 
                :propset="comp.props"
                :index="sectionindex" 
                :key="keyindex + index" 
                @updatedata="static ? '' : updatedata($event, index)"
                @updatedatav2="static ? '' : updatedatav2($event, index)"/>
            </div>
    
        </v-card>
        
        <!-- Футер для стандартных секций -->
        <v-card class="mx-4 mt-0 mb-1 pb-2" outlined :elevation="2" v-if="content && content.length && (sectionlevel === 0 && !folded) && standard">
                <div class="px-4 d-flex align-center">
                    <span class="m-text--size14"> {{ content[0].sectioncomment }} </span>
                </div>
                <div class="my-1 fill-width d-flex justify-center gap16px">
                    <div class="square cyan position-relative d-flex justify-center align-center m-text--size16" 
                    v-for="index in content[0].amountofgreensquares">
                        <span class="bignumbers"> {{ index }} </span>
                        <div class="numberboxlink" v-if="index < content[0].amountofgreensquares"></div>
                    </div>
                </div>
        </v-card>
    </div>
</template>

<script>
import SectionHeader from './section_header.vue'
import CodeTable from './code_table.vue'
import IgnoreMark from './ignore_mark.vue'
import ObligatoryValue from './obligatory_value.vue'
import Choice from "./choice.vue"
import Editor from "./editor.vue"

export default {
    components: {
        SectionHeader,
        CodeTable,
        IgnoreMark,
        ObligatoryValue,
        Choice,
        Editor,
    },
    props: {
        static: false,
        content: [],
        title: '',
        sectionlevel: 0,
        sectionindex: '',
        displaystate: { default() { return {shown: true, folded: false,} }, type: Object, },
        blocked: false,
        standard: false,
        },
    data(){
        return {
            shown: true,
            folded: false,
            keyindex: 0,
            standardelement: false,
        }
    },
    methods: {
        updatedatav2(ev, v) {
            // if (this.standard && !this.propsWithoutMenu.includes(ev.prop)) { return null }
            this.$emit('updatedatav2', { 
                type: ev.type, 
                prop: ev.prop, 
                value: ev.value, 
                elementindex: v, 
                needsmenu: this.checkIfNeedsMenu(ev.type, ev.prop) // !this.propsWithoutMenu.includes(ev.prop)
            })
        },
        updatestate() {
            this.$emit('updatestate', { 
                shown: this.shown, 
                folded: this.folded 
            })
        },
        setDisplayState() {
            for (let prop of Object.keys(this.displaystate)) { this[prop] = this.displaystate[prop] }
        },
        forceRerenderDraggables() {
            // keychanging tecnique no jutsu
            this.keyindex++
        },
        togglefolded() {
            this.folded = !this.folded
            this.updatestate()
        },
        deleteBlock(t) {
            // t - element clicked
            const parentPos = document.getElementById('requirements').getBoundingClientRect()
            const childPos  = t.getBoundingClientRect()
            const x = childPos.x - parentPos.x + 0.5*childPos.width
            const y = childPos.y - parentPos.y + 0.5*childPos.height
            this.$emit('delete-request',{x:x, y:y})
        },
        checkIfNeedsMenu(type, prop) {
            // !!! Внимание, после includes(prop) идет костыль, который нужно починить обновлением названия prop элемента Editor и сервиса 
            let verdict = !this.propsWithoutMenu.includes(prop) && (type === 'Editor' && prop !== 'description' )
            return verdict
        },
        callconsole(v) {
            console.log(v)
        },
    },
    computed: {
        propsWithoutMenu() {
            return ['checked', 'choices', 'valueexpression', 'namingtype', 'tablecontent',]
        },
    },
    created() {
        this.setDisplayState()
    },
    beforeUpdate() {
        this.setDisplayState()
        this.forceRerenderDraggables()
    },
}
</script>

<style scoped>

.square {
    min-height: 58px !important;
    height: 58px;
    min-width: 58px !important;
    width: 58px;
}

.numberboxlink {
    position: absolute; 
    left:100%; 
    height: 0; 
    width:16px; 
    border: solid 1px #acacac;
}

.unfold-block {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 2.5rem;
}

.trash-icon {
    visibility: hidden;
}

.titlecard:hover .trash-icon  {
    visibility: visible;
}

.itemheight {
    height: 2.5em;
    min-height: 2.5em;
}

.pointer-hand {
    cursor: pointer;
}

.rotated {
    transform: rotate(90deg);
}

.gap16px {
    gap: 16px;
}

.position-relative {
    position: relative;
}

.common-text {
    font-family: Roboto;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    text-align: left;
}

.bignumbers {
    font-size: x-large;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index:2;
    width: 100vh;
    height:100vh;
}

</style>