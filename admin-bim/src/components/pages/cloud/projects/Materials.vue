<template>
  <v-layout fluid fill-height class="mt-0" wrap>
      <v-row>
          <v-col v-for="(i, j) in materials" :key='j' md="auto">
            <v-card outlined  flat tile width="450px" class="m-card">
              <v-container fluid grid-list-md>
                <v-layout row wrap>
                            <v-col cols="4" min-width="144px">
                                <img width="120" :src="require('@/assets/images/materials/mat1.png')"/>
                            </v-col>
                            <v-col cols="8">
                                <v-layout row wrap>
                                    <v-flex xs12 class="m-card-title">
                                        Идентификация
                                    </v-flex>
                                    <v-flex xs6 class="m-card-text">Имя:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.ident.name}}</v-flex>
                                    <v-flex xs6 class="m-card-text">id:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.ident.id}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Расположение:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.ident.position}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Марка:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.ident.mark}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Конструктивная фун:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.ident.function}}</v-flex>


                                    <v-flex xs12 class="m-card-title pt-4">
                                        Размеры
                                    </v-flex>
                                    <v-flex xs6 class="m-card-text">Толщина:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.size.depth}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Объем:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.size.volume}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Площадь:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.size.square}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Длина:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.size.length}}</v-flex>

                                    <v-flex xs12 class="m-card-title pt-4">
                                        Общая информация
                                    </v-flex>
                                    <v-flex xs6 class="m-card-text">ГОСТ:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.info.gost}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Стоимость:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.info.price}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Url:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.info.url}}</v-flex>
                                    <v-flex xs6 class="m-card-text">Описание:</v-flex>
                                    <v-flex xs6 class="m-card-text">{{i.info.desc}}</v-flex>
                                </v-layout>
                            </v-col>
                      </v-layout>
                    </v-container>
              </v-card>
          </v-col>
      </v-row>
  </v-layout>
</template>

<script>
    export default {
        name: 'Materials',
        data () {
            return {
                materials: []
            }
        },
        created(){
            for(let i = 0; i < 3; i++){
                this.materials.push(this.$store.state.projects.objects[0])
            }
        }
    }
</script>
