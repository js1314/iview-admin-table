<template>
  <div class="admin-table-wrapper">
    <Spin fix v-if="loading"/>
    <div v-if="search.show && search.placement === 'top'" class="admin-table-search">
      <component
        :is="search.component"
        :row="conditions"
        :config="search"
        :admin="admin"/>
    </div>
    <div class="admin-table-toolbar">
      <Row type="flex">
        <Col span="8" class="left">
          <Button v-if="insert.show" type="primary" icon="md-add" @click="showInsert()">{{insert.text}}</Button>
          <Button
            v-if="exPort.show"
            type="primary"
            @click="handleExport()"
            :loading="exporting">{{exPort.text}}
          </Button>
          <Upload
            v-if="imPort.show"
            action=""
            :before-upload="handleBeforeImport"
            :accept="imPort.accept"
            :show-upload-list="false"
            style="display:inline;">
            <Button icon="ios-cloud-upload-outline" :loading="importing">{{imPort.text}}</Button>
          </Upload>
          <Button
            v-for="(toolbar, index) in toolbars"
            v-if="toolbar.show"
            :key="index"
            :type="toolbar.type"
            :icon="toolbar.icon"
            @click.stop="handleButton(toolbar)">{{toolbar.text}}
          </Button>
          <RadioGroup
            v-if="displayMode.show" v-model="displayMode.current" type="button"
            @on-change="displayMode.change">
            <Radio label="grid" title="网格模式">
              <Icon type="md-grid" :size="16"></Icon>
            </Radio>
            <Radio label="list" title="列表模式">
              <Icon type="md-list-box" :size="16"></Icon>
            </Radio>
            <Radio label="card" title="卡片模式">
              <Icon type="md-card" :size="16"></Icon>
            </Radio>
          </RadioGroup>
        </Col>
        <Col v-if="search.show && search.placement === 'toolbar'" span="16" class="right">
          <Row type="flex" justify="end">
            <component
              :is="search.component"
              :row="conditions"
              :config="search"
              :admin="admin"/>
          </Row>
        </Col>
      </Row>
    </div>
    <TableCard v-if="displayMode.current == 'card'" :data="data" :admin="admin"/>
    <TableList v-else-if="displayMode.current == 'list'" :data="data" :admin="admin"/>
    <Table
      v-else
      ref="adminTable"
      class="admin-table"
      :height="height"
      :data="data"
      :border="border"
      :columns="columns"
      :no-data-text="noDataText"
      :no-filtered-data-text="noFilteredDataText"
      @on-sort-change="handleSort"
      disabledHover
      v-viewer>
      <template v-if="control.show" slot-scope="scope" slot="control">
        <TableControl :row="scope.row" :admin="admin"/>
      </template>
    </Table>
    <Page
      v-if="page.show"
      class="admin-table-page"
      size="small"
      @on-change="pageChange"
      @on-page-size-change="pageSizeChange"
      :show-total="true"
      :show-elevator="true"
      :show-sizer="page.showSizer"
      :current="page.page"
      :total="total"
      :page-size="page.pageSize"
      :page-size-opts="page.pageSizeOpts"/>
    <Modal
      class="admin-table-drawer"
      v-model="editor.show"
      :width="editor.width"
      :title="editor.title"
      :footer-hide="true"
      :mask-closable="false"
      @on-cancel="hideEditor">
      <Spin fix v-if="loading"/>
      <component
        v-show="editor.loaded"
        ref="admin-table-editor"
        class="admin-table-editor"
        :is="editor.component"
        :action="editor.action"
        :admin="admin"
        :row="row"
        :data="data"
        @on-close="hideEditor"/>
    </Modal>
  </div>
</template>

<script>
  import './index.less';
  import '@js1314/nativejs';
  import excel from '@js1314/exceljs';
  import components from './components';
  import defaults from './defaults';
  import {findComponentsDownward} from 'view-design/src/utils/assist';

  /**
   * 后台管理系统专用TABLE组件
   *
   * 一、是如何来拆分的
   *  搜索栏区域：支持自定义搜索组件
   *  工具栏区域：支持自定义工具按钮
   *  主内容区域：支持表格、列表、卡片3种展现形式
   *  主内容分页：iView.Page组件，通过props.page配置
   *
   * 二、有哪些常规封装
   *  工具栏区域：
   *   1.添加按钮：通过props.insert配置
   *   2.导出：    通过props.exPort配置
   *   2.导入：    通过props.imPort配置
   *   3.多模式：  通过props.displayMode配置
   *   ...额外的： 通过props.toolbars配置
   *  主内容区域：
   *   1.添加子级：通过props.insertChild配置
   *   2.删除行：  通过props.remove配置
   *   3.修改行：  通过props.update配置
   *   4.查询数据：通过props.search配置
   *   ...额外的： 通过props.buttons配置
   *
   * @author zyl<733433@qq.com>
   */

  export default {
    name: 'admin-table',
    components,
    props: {
      isTree: {
        type: Boolean,
        default: false
      },
      border: {
        type: Boolean,
        default: true
      },
      primaryKey: {
        type: String,
        default: 'id'
      },
      columns: {
        type: Array,
        default: () => []
      },
      buttons: {
        type: Array,
        default: () => []
      },
      toolbars: {
        type: Array,
        default: () => []
      },
      height: {
        type: [Number, String],
        default: ''
      },
      control: {
        type: Object,
        default: defaults.control
      },
      lastInsertId: {
        type: [String, Number],
        default: ''
      },
      insert: {
        type: [Object, Function],
        default: defaults.insert
      },
      insertChild: {
        type: [Object, Function],
        default: defaults.insertChild
      },
      remove: {
        type: [Object, Function],
        default: defaults.remove
      },
      update: {
        type: [Object, Function],
        default: defaults.update
      },
      detail: {
        type: [Object, Function],
        default: defaults.detail
      },
      exPort: {
        type: [Object, Function],
        default: defaults.exPort
      },
      imPort: {
        type: [Object, Function],
        default: defaults.imPort
      },
      search: {
        type: Object,
        default: defaults.search
      },
      page: {
        type: Object,
        default: defaults.page
      },
      displayMode: {
        type: Object,
        default: defaults.displayMode
      }
    },
    data() {
      return {
        admin: this,
        row: {},
        data: [],
        total: 0,
        editor: {},
        button: {},
        errorCode: 0,
        errorMsg: '',
        loading: true,
        exporting: false,
        importing: false,
        conditions: {...this.search.conditions},
        lastConditions: {}
      };
    },
    computed: {
      noData() {
        return this.isNoData();
      },
      noDataText() {
        return this.getNoDataText();
      },
      noFilteredDataText() {
        return '';
      },
      defaultEditor() {
        return {
          show: false,
          placement: this.editor.placement
        };
      }
    },
    methods: {
      isNoData() {
        return this.data.length < 1;
      },
      getNoDataText() {
        if (this.loading) {
          return '数据加载中...';
        } else if (this.errorCode == 200) {
          return '暂无数据';
        } else {
          return '加载数据失败';
        }
      },
      showInsert() {
        this.renderControl('insert').then(insert => {
          this.row = {};
          this.editor = {
            show: true,
            loaded: true,
            action: 'insert',
            ...insert
          };
        });
      },
      handleExport() {
        return new Promise((resolve, reject) => {
          this.renderControl('exPort').then(exPort => {
            let handle = exPort.handle || this.search.handle;
            if (handle && !this.exporting) {
              this.exporting = true;
              let _ = {[this.page.pageName]: exPort.page, [this.page.pageSizeName]: exPort.pageSize};
              let __ = exPort.conditions || this.conditions;
              handle({...__, ..._}).then(res => {
                this.exporting = false;
                const {result, code, msg} = res;
                if (code != 200) {
                  this.$Message.error(msg);
                  reject();
                } else if (result.total > 0) {
                  this.$Message.success('导出成功，正在下载中...');
                  // ...会替换前缀key，后面的key会替换前面的key
                  const {data} = result;
                  const columns = exPort.columns || this.columns;
                  if (exPort.fileType == 'csv') {
                    this.$refs.adminTable.exportCsv({columns, ...exPort, data});
                  } else {
                    let key = [], title = [];
                    columns.forEach(column => key.push(column.key) && title.push(column.title));
                    excel.exPort({key, title, ...exPort, data});
                  }
                  resolve(result);
                } else {
                  this.$Message.warning('无数据导出，请更改查询条件后在试');
                  resolve(result);
                }
              }).catch(error => {
                this.exporting = false;
                this.$Message.error('导出失败，请稍候在试...');
                reject(error);
              });
            } else {
              resolve();
            }
          });
        });
      },
      handleImport() {
      },
      handleBeforeImport(file) {
        this.renderControl('imPort').then(imPort => {
          let handle = imPort.handle;
          if (handle && !this.importing) {
            this.importing = true;
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onerror = e => {
              this.importing = false;
              this.$Message.error('导入文件读取出错');
            };
            reader.onload = e => {
              this.importing = false;
              const {header, results} = excel.read(e.target.result, 'array');
              handle(header, results, this);
              reader = null;
            };
          }
        });
      },
      handleInsert() {
        return this.handleWrite('insert', false);
      },
      handleDelete() {
        return this.handleWrite('remove', true);
      },
      handleUpdate() {
        return this.handleWrite('update', false);
      },
      handleDetail() {
        return new Promise((resolve, reject) => {
          this.renderControl('detail').then(detail => {
            if (Function.isFunction(detail.handle)) {
              this._promiseRead(detail.handle(this.row, this), this.row, 'detail', detail, resolve, reject);
            } else {
              resolve();
            }
          });
        });
      },
      handleWrite(action, validated) {
        return new Promise((resolve, reject) => {
          if (validated || this._validateEditor()) {
            this.renderControl(action).then(write => {
              if (!this.loading && Function.isFunction(write.handle)) {
                this.loading = true;
                this._promiseWrite(write.handle(this.row, this), action, write, resolve, reject);
              } else {
                resolve();
              }
            });
          }
        });
      },
      handleSave() {
        switch (this.editor.action) {
          case 'insert':
            return this.handleInsert();
          case 'update':
            return this.handleUpdate();
          default:
            return Promise.reject();
        }
      },
      handleReset() {
        this._setConditions({});
        this.handleSelect(Object.clone(this.search.conditions), 'reset');
      },
      handleSelect(conditions, action = 'select') {
        let handle = this.search.handle;
        if (!handle) {
          return null;
        }
        this.loading = true;
        let _ = {[this.page.pageName]: this.page.page, [this.page.pageSizeName]: this.page.pageSize};
        let __ = Object.isObject(conditions) ? conditions : {};
        let _conditions = {...__, ..._};
        return this._promiseRead(handle(_conditions), _conditions, action, this.search);
      },
      /**
       * 有条件搜索
       * @param conditions 搜索的基础条件
       * @param useHistory 是否使用历史条件（上一次）
       * @returns {Promise}
       */
      handleSearch(conditions, useHistory = false) {
        let handle = this.search.handle;
        if (!handle || this.loading) {
          return null;
        }
        this.loading = true;
        let _ = Object.isObject(conditions) ? conditions : {};
        let __ = useHistory ? this.lastConditions : this.conditions;
        let _conditions = {...__, ..._};
        return this._promiseRead(handle(_conditions), _conditions, 'search', this.search);
      },
      handleSort(params) {
        if (params.order === 'normal') {
          this.handleSearch({
            order_by: null,
            order_type: null
          });
        } else {
          this.handleSearch({
            order_by: params.column.sortKey || params.key,
            order_type: params.order
          });
        }
      },
      handleConfirm(title, onOk) {
        this.$Modal.confirm({
          title, onOk,
          render: h => {
            let html = [];
            this.columns.forEach(column => {
              if (column.key && !column.render) {
                let value = this.row[column.key];
                if (value != null) { // null or undefined
                  html.push(h('p', {}, column.title + '：' + value));
                }
              }
            });
            return h('div', {}, html);
          }
        });
      },
      handleButton(button, row) {
        let ok = () => {
          let click = button.click || button.handle;
          if (Function.isFunction(click)) {
            switch (button.action) {
              case 'update':
              case 'insert':
                this._promiseWrite(click(row, this), button.action, button);
                break;
              case 'detail':
                this._promiseRead(click(row, this), row, button.action, button);
                break;
              default:
                click(row, this);
                break;
            }
          } else {
            this.editor = {
              show: true,
              loaded: true,
              ...button
            };
          }
        };
        this.button = button;
        this.row = row || {};
        let confirm = button.confirm;
        if (confirm) {
          this.handleConfirm('确定' + button.title + '吗？', ok);
        } else {
          ok();
        }
      },
      pageChange(page) {
        this.handleSearch({[this.page.pageName]: page}, true);
      },
      pageSizeChange(pageSize) {
        this.handleSearch({[this.page.pageName]: 1, [this.page.pageSizeName]: pageSize}, true);
      },
      hideEditor() {
        let editor = this.editor;
        this.editor = this.defaultEditor;
        this.$emit('on-close', editor);
      },
      renderControl(keys, row, init) {
        return new Promise((resolve, reject) => {
          if (String.isString(keys)) {
            if (!defaults[keys]) {
              reject();
            } else if (Object.isObject(this[keys])) {
              // resolve({...defaults[keys](), ...this[keys]});
              resolve(this[keys]);
            } else if (Function.isFunction(this[keys])) {
              let promise = this[keys](row || this.row, this, init);
              if (!promise) {
                reject(promise);
              } else if (Object.isPromise(promise)) {
                promise.then(data => resolve({...defaults[keys](), ...data})).catch(reject);
              } else if (Object.isObject(promise)) {
                resolve({...defaults[keys](), ...promise});
              } else {
                reject(promise);
              }
            }
          } else if (Array.isArray(keys)) {
            let promises = [];
            let isReject = keys.some(key => {
              if (!defaults[key]) {
                return true;
              }
              key = this[key];
              if (Object.isObject(key)) {
                promises.push(Promise.resolve(key));
              } else if (Function.isFunction(key)) {
                let promise = key(row || this.row, this, init);
                if (!promise) {
                  promises.push(Promise.reject(promise));
                } else if (Object.isPromise(promise)) {
                  promises.push(promise);
                } else if (Object.isObject(promise)) {
                  promises.push(Promise.resolve(promise));
                } else {
                  promises.push(Promise.reject(promise));
                }
              }
            });
            if (isReject) {
              reject();
            } else {
              Promise.all(promises).then(values => {
                let data = {};
                values.forEach((value, key) => data[keys[key]] = {...defaults[keys[key]](), ...value});
                resolve(data);
              }).catch(reject);
            }
          }
        });
      },
      _promiseRead(promise, conditions, action, button, resolve, reject) {
        promise.then(data => {
          this._thenRead(conditions, data, action, button);
          resolve && resolve(data);
        }).catch(error => {
          this._catchRead(conditions, error, action, button);
          reject && reject(error);
        });
        return promise;
      },
      _promiseWrite(promise, action, button, resolve, reject) {
        promise.then(data => {
          this._thenWrite(data, action, button);
          resolve && resolve(data);
        }).catch(error => {
          this._catchWrite(error, action, button);
          reject && reject(error);
        });
        return promise;
      },
      _thenRead(conditions, data, action, options) {
        this.loading = false;
        let detail = action === 'detail';
        detail || this._setConditions(conditions);
        const {result, code, msg} = data;
        if (code === 200) {
          if (detail) {
            this.row = result;
            this.total = 1;
          } else {
            this.data = result.data;
            this.total = result.total;
            // 高亮显示最后一条插入的数据
            // if (this.lastInsertId) {
            //   this.$nextTick(() => {
            //     let table = this.$refs.adminTable;
            //     let index = table.rebuildData.findIndex(data => table.objData[data._index][this.primaryKey] == this.lastInsertId);
            //     table.handleCurrentRow('highlight', index);
            //   });
            // }
          }
          this.errorCode = 200;
          this.errorMsg = '';
        } else {
          if (detail) {
            this.row = {};
          } else {
            this.data = [];
            this.total = 0;
          }
          this.errorCode = code;
          this.errorMsg = '[Error Read] ' + action + ': ' + msg;
        }
      },
      _catchRead(conditions, error, action, options) {
        this.loading = false;
        let detail = action === 'detail';
        if (detail) {
          this.row = {};
        } else {
          this.data = [];
          this.total = 0;
        }
        this.errorCode = -1;
        this.errorMsg = '[Catch Write] ' + action + ': ' + error;
        error && this.$Message.error(this.errorMsg);
      },
      _thenWrite(data, action, options) {
        this.loading = false;
        const {code, msg} = data;
        if (code === 200) {
          this.$Message.success((this.editor.title || this.button.title) + '成功');
          this.handleSearch({}, true);
          this.hideEditor();
          this.errorCode = 200;
          this.errorMsg = '';
        } else {
          this.errorCode = code;
          this.errorMsg = '[Error Write] ' + action + ': ' + msg;
          msg && this.$Message.warning(this.errorMsg);
        }
      },
      _catchWrite(error, action, options) {
        this.loading = false;
        this.errorCode = -2;
        this.errorMsg = '[Catch Write] ' + action + ': ' + error;
        error && this.$Message.error(this.errorMsg);
      },
      _setConditions(conditions) {
        this.conditions = conditions;
        this.lastConditions = Object.clone(conditions);
      },
      _validateEditor() {
        if (this.loading) {
          return false;
        }
        let component = this.$refs['admin-table-editor'];
        if (!component) {
          return true;
        }
        let forms = findComponentsDownward(component, 'iForm');
        return !forms.length || !forms.some(form => {
          let validated = true;
          form.validate(valid => {
            // console.log(form)
            validated = valid;
          });
          return !validated;
        });
      },
      _initialize() {
        this._initToolbar();
        this._initData();
      },
      _initDefaults() {
        for (let prop in defaults) {
          if (Object.isObject(this[prop])) {
            let values = defaults[prop]();
            for (let key in values) {
              if (this[prop][key] === undefined) {
                this.$set(this[prop], key, values[key]);
              }
            }
          }
        }
      },
      _initData() {
        this.handleSelect(this.conditions);
      },
      _initControl() {
        if (this.control.show && !this.columns.findObj(this.control, 'text', 'title')) {
          this.columns.push({
            slot: 'control',
            className: 'admin-table-control',
            title: this.control.text,
            ...this.control
          });
        }
      },
      _initToolbar() {
        ['insert', 'exPort', 'imPort'].forEach(type => {
          this.renderControl(type, null, true).then(data => {
            Object.extend(this[type], data);
          });
        });
        this.toolbars.forEach((toolbar, index) => {
          if (Function.isFunction(toolbar)) {
            toolbar(this.row, this).then(data => this.$set(this.toolbars, index, data));
          }
        });
      }
    },
    created() {
      // console.log('created');
      this._initDefaults();
      this._initControl();
    },
    mounted() {
      // console.log('mounted');
      this._initialize();
    }
  };
</script>
