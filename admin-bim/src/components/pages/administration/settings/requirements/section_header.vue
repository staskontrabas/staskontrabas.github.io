<template>
    <div class="header-wrap">

        <!-- main title container mounting point -->
        <div class="divider"/>
                    <div class="section-header d-flex align-center">
                        <span class="bold mx-4 py-2 text-uppercase"
                        @dblclick="updatedatav2('title', title)"> 
                            {{index}} {{ title }} 
                        </span>
                        <v-checkbox class="simple-checkbox mx-n1 d-flex align-center justify-center" 
                        :ripple="false" 
                        v-model="checked"
                        @change="updatedatav2('checked', checked)">
                        </v-checkbox>
                        <span class="black--text m-text--size12"> Обязательное </span>
                    </div>
        <div class="divider"/>

        <!-- description mounting point -->
        <div 
        class="mx-4 my-2 m-text--size14"
        @dblclick="updatedatav2('description', description)">
            {{ description }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        propset: { default: {}, type: Object, },
        index: { default: null, type: String, },
    },
    data(){
        return {
            checked: false,
            title: 'Заголовок',
            description: '',
        }
    },
    methods: {
        updatedatav2(propname, val) {
            let type = 'SectionHeader'
            this.$emit('updatedatav2', {type: type, prop: propname, value: val})
        },
    },
    beforeMount() {
        if (!this.propset) {
                return null
                }
        else {
            let properties = this.propset
            for (let prop of Object.keys(properties)) {
                this[prop] = properties[prop]
            }
            return null
        }
    },
}
</script>

<style scoped>

.header-wrap {
    width: 100%;
}

.divider {
    width: 100%;
    border: solid 1px #ced4da;
}

.section-header {
    height: 3rem;
}

.bold {
    font-weight: 500;
}

.simple-checkbox {
    margin-left: 8px;
    /* to compensate for random 8px margin-right of v-checkbox input */
}

.bold {
    font-weight: 500;
}

</style>