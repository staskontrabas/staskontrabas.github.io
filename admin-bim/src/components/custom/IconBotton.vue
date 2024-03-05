<template>
    <span
        class="m-icon-botton"
        :class="{'m-icon-botton--disabled': disabled}"
        @click="onClick">
            <v-tooltip
                :disabled="!tooltip"
                top>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        role="empty"
                        v-bind="attrs"
                        v-on="on"
                        :color="color"
                        :size="size">
                        <slot></slot>
                    </v-icon>
                </template>
                {{tooltipValue}}
            </v-tooltip>
    </span>
</template>

<script>
export default {
    name: 'IconBotton',
    props: {
        disabled: {
            type: Boolean,
            required: false
        },
        color: {
            type: String,
            required: false
        },
        stop: {
            type: Boolean,
            required: false
        },
        size: {
            type: String,
            default: '20',
            required: false
        },
        tooltip: {
            type: Boolean,
            default: false,
            required: false
        },
        tooltipValue: {
            type: String,
            required: false
        }
    },
    methods: {
        onClick(e){
            if(this.stop){
                e.stopPropagation()
            }
            this.$emit('onClick')
        }
    }
}
</script>

<style lang="less">
    .m-icon-botton{
        display: inline-flex;
        cursor: pointer;
        &:hover *{
            color: #000;
        }
        &--disabled{
            pointer-events: none !important;
            *{
                color: #ccc !important;
                cursor: auto;
            }
        }
    }
</style>
