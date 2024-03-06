<template>
    <div
        class="admin-characters--item-wrap"
        :class="{active: val}"
        @click="setCharacter"
        >
        <div class="admin-characters--item">
            <icon-svg
                class="admin-characters--item-icon"
                :icon="title" />
            <div class="admin-characters--item-title">
                {{list[index]}}
            </div>
        </div>
    </div>
</template>

<script>
import IconSvg from "@/components/common/IconSvg"

export default {
    name: 'CharacterItem',
    components: {
        IconSvg
    },
    props: {
        value: {
            type: Number,
            default: 0
        },
        index: {
            type: Number,
            default: 0
        },
        item: {
            type: Object,
            default() {
                return {}
            }
        },
        title: {
            type: String,
            default: ''
        }
    },
    data(){
        return {
            value_item: null,
            list: ['','','', 'Voriety', 'Mildness', 'Earthy', 'Blueberry', 'Mango', 'Sweet']
        }
    },
    computed: {
        val(){
            return this.value_item == null
                ? this.value
                : this.value_item
        }
    },
    methods: {
        setCharacter(){
            this.value_item = this.value_item == null
                ? this.value ^ 1
                : this.value_item ^ 1
            this.$emit('setCharacter', {
                item: JSON.parse(JSON.stringify(this.item)),
                ind: this.index,
                val: this.value_item
            })
        },
    }
}
</script>
