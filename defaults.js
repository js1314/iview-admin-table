/**
 * 组件默认动态参数，可以根据自己项目情况自行更改
 * 动态参数：
 * [...Object|Function<Promise|Object>]
 *  为对象则是组件参数
 *  为方法返回结果为对象则是组件参数，返回promise则接收resolve的首个实参作为组件参数
 *
 * @author zyl<733433@qq.com>
 */

export default {
  control() {
    return {
      text: '操作',
      show: true,
      width: 'auto'
    };
  },
  insert() {
    return {
      text: '添加',
      title: '添加',
      show: false,
      width: '60%'
    };
  },
  insertChild() {
    return {
      text: '添加子级',
      title: '添加子级',
      show: false,
      width: '60%',
      type: 'info'
    };
  },
  remove() {
    return {
      text: '删除',
      title: '删除',
      show: false,
      type: 'error'
    };
  },
  update() {
    return {
      text: '编辑',
      title: '编辑',
      show: false,
      width: '60%',
      type: 'info'
    };
  },
  detail() {
    return {
      text: '详情',
      title: '详情',
      show: false,
      width: '60%',
      type: 'info'
    };
  },
  search() {
    return {
      text: '查询',
      title: '查询',
      show: false,
      conditions: {},
      placement: 'top'
    };
  },
  page() {
    return {
      page: 1,
      pageSize: 15,
      show: false,
      showSizer: true,
      pageName: 'page',
      pageSizeName: 'per_page',
      pageSizeOpts: [10, 15, 20, 30],
      orderByName: 'order_by',
      orderTypeName: 'order_type',
    };
  },
  exPort() {
    return {
      show: false,
      text: '导出',
      page: 1,
      pageSize: 10000,
      filename: 'table',
      fileType: 'excel'
      // conditions: null, // 自定义导出条件
      // 以下为exportCsv特有参数
      // filename: 'table.csv', // 文件名，默认为 table.csv
      // original: true, // 是否导出为原始数据，默认为 true
      // noHeader: false, // 不显示表头，默认为 false
      // columns: [], // 自定义导出的列数据
      // data: [], // 自定义导出的行数据
      // callback: null, // 添加此函数后，不会下载，而是返回数据
      // separator: ',', // 数据分隔符，默认是逗号(,)
      // quoted: false,// 每项数据是否加引号，默认为 false
    };
  },
  imPort() {
    return {
      show: false,
      text: '导入',
      pageSize: 10000,
      accept: '.xls,.xlsx,.csv',
      handleTemplate: null,
      templateText: '下载导入模板',
    };
  },
  displayMode() {
    return {
      show: false,
      current: 'grid',
      // grid: null, // Table
      card: null,
      list: null,
      change() {
      }
    };
  }
};
