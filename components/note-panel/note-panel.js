// 备注与休息日面板（底部弹层）
Component({
  options: { addGlobalClass: true },
  properties: {
    visible: { type: Boolean, value: false },
    dateLabel: { type: String, value: '' },
    note: { type: String, value: '' },
    isRest: { type: Boolean, value: false },
  },
  data: { draft: '' },
  observers: {
    'visible, note': function (visible, note) {
      if (visible) this.setData({ draft: note || '' });
    },
  },
  methods: {
    onInput(e) {
      this.setData({ draft: e.detail.value });
    },
    onSave() {
      this.triggerEvent('save', { text: this.data.draft });
    },
    onToggleRest() {
      this.triggerEvent('toggleRest', { isRest: !this.data.isRest });
    },
    onClose() {
      this.triggerEvent('close');
    },
    noop() {}, // 阻止面板内容点击穿透到遮罩
  },
});
