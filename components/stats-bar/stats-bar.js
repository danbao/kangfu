// 顶部统计栏：焦点日期完成情况 + 周/月切换 + 报告入口
Component({
  options: { addGlobalClass: true, multipleSlots: false },
  properties: {
    focusLabel: { type: String, value: '今天' },
    done: { type: Number, value: 0 },
    total: { type: Number, value: 0 },
    rate: { type: Number, value: 0 },     // 0~1，或 -1（休息日）
    isRest: { type: Boolean, value: false },
    rangeRate: { type: Number, value: 0 }, // 本周/本月区间完成率
    rangeLabel: { type: String, value: '本周' },
    viewMode: { type: String, value: 'week' },
  },
  data: { rateText: '0%', rangeText: '0%' },
  observers: {
    'rate, isRest': function (rate, isRest) {
      this.setData({ rateText: isRest ? '休息日' : Math.round(rate * 100) + '%' });
    },
    rangeRate: function (r) {
      this.setData({ rangeText: Math.round((r || 0) * 100) + '%' });
    },
  },
  methods: {
    onTapView(e) {
      this.triggerEvent('toggleView', { mode: e.currentTarget.dataset.mode });
    },
    onTapReport() {
      this.triggerEvent('openReport');
    },
  },
});
