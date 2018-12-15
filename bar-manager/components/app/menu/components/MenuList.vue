<template>
    <div class="cove-list-wrap">
        <div class="cove-list-container" id="cove-list-container">
            <list-table>
                <list-item/>
            </list-table>
        </div>
    </div>
</template>

<script>
  import ListTable from './ListTable'
  import ListItem from './ListItem'

  export default {
    name: 'MenuList',
    components: {
      ListTable,
      ListItem
    }
  }
</script>
