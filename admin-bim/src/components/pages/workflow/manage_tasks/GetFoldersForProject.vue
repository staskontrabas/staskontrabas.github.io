<template>
  <v-card
    class="mx-auto"
    max-width="500"
  >
    <v-sheet class="pa-2">
      <v-text-field
        v-model="search"
        label="Начните вписывать название файла"
        flat
        solo-inverted
        hide-details
        clearable
        clear-icon="mdi-close-circle-outline"
      ></v-text-field>
    </v-sheet>
    <v-card-text>
      <v-treeview
        :items="rendered_tree"
        :search="search"
        :filter="filter"
        :open.sync="open"
        activatable
        return-object
        @update:active="getFileSelected"
      >
        <template v-slot:prepend="{ item, open }">
          <v-icon v-if="item.children">
            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
          </v-icon>
          <v-icon v-else>
            mdi-file-document-outline
          </v-icon>
        </template>
      </v-treeview>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    props: ["projectFoldersMap"],
    data: () => ({
      open: [],
      search: null,
      filter: undefined,
      rendered_tree: [],
    }),
    methods: {
      console(v) {
        console.log(v) 
      },
      createFolderTree(arr) {
        if (arr) {
          let tree = arr.map(p => {
            let branch = {'id': p.id, 'name': p.name,}
            if (p.folders === undefined) { return branch } // means this is a leaf file element
            
            let kinder = [] // recursively add all children
            if (p.files) { for (var el of p.files) { kinder.push(el) } }
            if (p.folders) { for (var el of p.folders) { kinder.push(el) } }
            branch['children'] = this.createFolderTree(kinder)
            return branch })
          return tree
        }
        return null // this is a failsafe switch, but i don't remember how it works
      },
      getFileSelected(v) {
        // v - array with a single selected element obtained from v-treeview;
        if (v[0].children !== undefined ) { return null } // in case folder is selected - do nothing
        this.$emit('updateDoc', {'docid': v[0].id, 'dname':v[0].name,} ) // if leaf element is selected, update
      },
    },
    mounted(){
        this.$nextTick(() => {
          this.rendered_tree = this.createFolderTree(this.projectFoldersMap)
        })
    },
  }
</script>