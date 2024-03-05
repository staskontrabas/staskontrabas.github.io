<template>
    <v-card-text class="px-4" style="background-color: #fbfbfb;">
        <div
            class="m-flex pt-6 pb-3">
            <span class="m-flex--item__auto pr-3 m-text--size13">Выберите пакет:</span>
            <div class="m-flex--item">
                <v-autocomplete
                    class="pa-0 ma-0 m-text--size12"
                    v-model="plan"
                    :items="parameters.List"
                    item-text="name"
                    item-value="code"
                    persistent-hint
                    placeholder=" "
                    hide-details
                    dense
                    />
            </div>
        </div>
    </v-card-text>
</template>

<script>
export default {
    name: 'Plan',
    props: ['parameters', 'values'],
    data(){
        return {
            plan: this.parameters.Plan
        }
    },
    watch: {
        plan(v){
            this.setPlan()
        }
    },
    methods: {
        setPlan(){
            if(this.plan == this.parameters.Plan){
                return
            }
            this.$emit('update:values', {
                route: 'plan',
                body: {
                    rte: this.plan,
                    data: {
                        idata: this.parameters.License
                    }
                }
            })
        }
    }
}
</script>
