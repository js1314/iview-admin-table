<template>
  <div class="admin-table-card">
    <div v-if="noData">
      <Card dis-hover>
        {{noDataText}}
      </Card>
    </div>
    <Row v-else v-for="(cols, ck) in rows" :key="ck" :gutter="16" v-viewer>
      <Col span="6" v-for="(row, rk) in cols" :key="rk">
        <Card>
          <component :is="admin.displayMode.card" :row="row"/>
          <p v-if="admin.control.show">
            <TableControl :row="row" :admin="admin"/>
          </p>
        </Card>
      </Col>
    </Row>
  </div>
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
    data() {
      return {};
    },
    computed: {
      noData() {
        return this.admin.isNoData();
      },
      noDataText() {
        return this.admin.getNoDataText();
      },
      rows() {
        return this.data.chunk(4);
      }
    },
    methods: {
      toggleSelect(row) {
        console.log(row);
      }
    }
  };
</script>

<style>
  .admin-table-card {
    text-align: center;
  }

  .admin-table-card .ivu-card {
    margin-bottom: 16px;
  }

  .admin-table-card p {
    margin-top: 10px;
  }
</style>
