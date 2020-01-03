<template>
  <Card class="admin-table-list" dis-hover>
    <div v-if="noData">
      <Card :dis-hover="true" :bordered="false">
        {{noDataText}}
      </Card>
    </div>
    <Row v-else v-for="(row, index) in data" :gutter="16" v-viewer>
      <Col span="24">
        <Divider v-if="index" style="margin: 18px 0;"/>
        <component :is="admin.displayMode.list" :row="row"/>
        <p v-if="admin.control.show">
          <TableControl :row="row" :admin="admin"/>
        </p>
      </Col>
    </Row>
  </Card>
</template>

<script>
  import TableControl from './control';

  export default {
    components: {
      TableControl
    },
    props: {
      data: Array,
      admin: Object,
    },
    computed: {
      noData() {
        return this.admin.isNoData();
      },
      noDataText() {
        return this.admin.getNoDataText();
      },
    }
  };
</script>

<style>
  .admin-table-list {
    text-align: left;
  }

  .admin-table-list p {
    margin-top: 5px;
  }
</style>
