<template>
  <div class="admin-table-control">
    <Button v-if="detail.show" :type="detail.type" size="small" @click.stop="handleDetail">
      {{detail.text}}
    </Button>
    <Button v-if="update.show" :type="update.type" size="small" @click.stop="handleUpdate">
      {{update.text}}
    </Button>
    <Button v-if="insertChild.show" :type="insertChild.type" size="small" @click.stop="handleInsert">
      {{insertChild.text}}
    </Button>
    <template v-for="button in buttons" v-if="button.show">
      <Button :type="button.type" size="small" @click.stop="admin.handleButton(button, row)">{{button.text}}</Button>
    </template>
    <Button v-if="remove.show" :type="remove.type" size="small" @click.stop="handleDelete">
      {{remove.text}}
    </Button>
  </div>
</template>

<script>
  export default {
    props: {
      row: Object,
      admin: Object,
    },
    data() {
      return {
        detail: {},
        update: {},
        insertChild: {},
        remove: {},
        buttons: []
      };
    },
    methods: {
      _row() {
        return this.row ? Object.clone(this.row) : {};
      },
      handleInsert() {
        let _this = this.admin;
        let editor = this.insertChild;
        if (Function.isFunction(editor.click)) {
          _this.handleButton(editor, this._row());
        } else {
          _this.row = this._row();
          _this.editor = {
            show: true,
            loaded: true,
            action: 'insert',
            ...editor
          };
        }
      },
      handleDelete() {
        let _this = this.admin;
        _this.handleButton({confirm: true, title: this.remove.title, handle: _this.handleDelete}, this._row());
      },
      handleUpdate() {
        let _this = this.admin;
        let editor = this.update;
        if (Function.isFunction(editor.click)) {
          _this.handleButton(editor, this._row());
        } else {
          _this.row = this._row();
          _this.editor = {
            show: true,
            loaded: false,
            action: 'update',
            placement: 'top',
            title: editor.title,
            width: editor.width,
          };
          _this.handleDetail().then(() => {
            _this.editor.loaded = true;
            _this.editor.component = editor.component;
          });
        }
      },
      handleDetail() {
        let _this = this.admin;
        let detail = this.detail;
        if (Function.isFunction(detail.click)) {
          _this.handleButton(detail, this._row());
        } else {
          _this.row = this._row();
          _this.loading = true;
          _this.editor = {
            show: true,
            loaded: false,
            action: 'detail',
            title: detail.title,
            width: detail.width
          };
          _this.handleDetail().then(() => {
            _this.editor.loaded = true;
            _this.editor.component = detail.component;
          });
        }
      },
      initButtons() {
        this.buttons = [];
        this.admin.buttons.forEach((button, index) => {
          if (Function.isFunction(button)) {
            let promise = button(this.row, this);
            if (!promise) {
              // ignore
            } else if (Object.isPromise(promise)) {
              promise.then(data => this.buttons.addObj(data, 'text', 'text'));
            } else if (Object.isObject(promise)) {
              this.buttons.addObj(promise, 'text', 'text');
            }
          } else {
            this.$set(this.buttons, index, button);
          }
        });
      },
      initControl() {
        ['detail', 'update', 'insertChild', 'remove'].forEach(type => {
          this.admin.renderControl(type, this.row, true).then(data => {
            this[type] = data;
          }).catch(() => {
            this[type] = {};
          });
        });
      }
    },
    // 按钮动态变化监听
    watch: {
      row() {
        this.initButtons();
        this.initControl();
      }
    },
    mounted() {
      if (this.row) {
        this.initButtons();
        this.initControl();
      }
    }
  };
</script>
