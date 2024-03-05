<template>
    <v-dialog :value="collisions" scrollable max-width="700px" @input="v => v || cancel()">
        <v-card>
            <v-card-title class="pr-0 pl-4 m-modal--title"><span>Геометрические коллизии: </span> <span class="m-text--color-red">&nbsp;(бета версия)</span>
                <v-spacer></v-spacer>
                <v-btn
                    text
                    icon
                    @click="cancel"
                    color="#7f7f7f">
                    <v-icon size="20">close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pt-5 px-4 pb-0">
                <span class="m-text--size14 m-text--color-black">В проекте были обнаружены геометрические коллизии между объектами:
                </span>
                <div class="pt-5">
                    <div
                        v-for="elem in getCollisions"
                        class="m-card-list__row">
                        <span class="m-card-list__cell">{{elem.first.name}}</span>
                        <span class="m-card-list__cell">{{elem.second.name}}</span>
                    </div>
                </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-5 px-4">
                <v-spacer></v-spacer>
                <v-btn outlined color="grey" class="m-btn" @click="cancel">Отмена</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'Collisions',
    props: {
        collisions: {
            type: Boolean,
            default: false
        },
        collisionsJSON: {
            type: Object,
            default: null
        },
        item: {
            type: Object,
            default: null
        }
	},
    data () {
        return {}
    },
    computed: {
        getCollisions(){
            let list = []
            if(this.collisionsJSON){
                list = this.collisionsJSON.collision_pairs
            }
            return list
        }
    },
    methods: {
        cancel(){
            this.$emit('update:collisions', false)
            this.$emit('update:this.collisionsJSON', null)
        },
        saveChange(){
            this.cancel()
        }
    }
}
</script>
