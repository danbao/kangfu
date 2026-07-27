// 工作台页面：编排项目列表、打卡矩阵、统计、拖拽、备注、报告
const storage = require('../../utils/storage');
const dateUtil = require('../../utils/date');
const statsUtil = require('../../utils/stats');
const reportUtil = require('../../utils/report');
const icons = require('../../utils/icons');
const ui = require('../../utils/ui');
const C = require('../../utils/constants');

Page({
  data: {
    // 布局尺寸（px）
    ROW_H: 0,
    HEADER_H: 0,
    CELL_W: 0,
    matrixWidth: 0,
    // 数据
    exercises: [],   // [{id,name,icon,createdAt,iconUri}]
    dates: [],       // [{key,d,weekday,isToday,isRest}]
    records: {},     // safeRecords: { dateKey: { exId: true|false } }
    // 视图与焦点
    viewMode: 'week',
    rangeLabel: '本周',
    focusDate: '',
    focusLabel: '今天',
    scrollIntoView: '',
    // 统计
    done: 0, total: 0, rate: 0, isRest: false, rangeRate: 0,
    // 拖拽
    isDragging: false,
    draggingIndex: -1,
    targetIndex: -1,
    translateY: 0,
    shifts: [],
    // 备注面板
    noteVisible: false,
    noteDateLabel: '',
    noteText: '',
    noteIsRest: false,
    // 报告面板
    reportVisible: false,
    reportData: null,
    // 项目编辑弹层
    editVisible: false,
    editMode: 'add',
    editName: '',
    editIcon: 'star',
    editingId: '',
    iconChoices: [],
  },

  onLoad() {
    this.setData({
      ROW_H: ui.rpx2px(C.ROW_HEIGHT_RPX),
      HEADER_H: ui.rpx2px(C.HEADER_HEIGHT_RPX),
      CELL_W: ui.rpx2px(C.CELL_WIDTH_RPX),
    });
    const s = storage.getSettings();
    this._viewMode = s.viewMode === 'month' ? 'month' : 'week';
    this._focusDate = dateUtil.today();
    this._loaded = false;
    this.setData({
      viewMode: this._viewMode,
      rangeLabel: this._viewMode === 'month' ? '本月' : '本周',
    });
    this.refresh(true);
  },

  onShow() {
    if (this._loaded) this.refresh();
    this._loaded = true;
  },

  // 统一重建渲染数据；scrollToday=true 时滚动定位到今天
  refresh(scrollToday) {
    const exercises = storage.getExercises().map((e) => ({
      id: e.id,
      name: e.name,
      icon: e.icon,
      createdAt: e.createdAt,
      iconUri: icons.iconUri(e.icon),
    }));
    const restSet = storage.getRestDays();
    const dates = dateUtil.buildDays(this.data.viewMode, restSet);

    // safeRecords：保证每个日期都有对象，WXML 直接 records[d][ex] 不报错
    const recs = storage.getRecords();
    const safe = {};
    dates.forEach((d) => { safe[d.key] = recs[d.key] || {}; });

    const matrixWidth = dates.length * this.data.CELL_W;
    const focus = this._focusDate || dateUtil.today();
    const ds = statsUtil.dailyStat(focus, exercises);
    const rr = statsUtil.rangeRate(dates, exercises);
    const focusLabel = focus === dateUtil.today() ? '今天' : dateUtil.prettyDate(focus);

    this.setData({
      exercises, dates, records: safe, matrixWidth,
      done: ds.done, total: ds.total, rate: ds.rate, isRest: ds.isRest,
      rangeRate: rr, focusDate: focus, focusLabel,
    });

    if (scrollToday) {
      this.setData({ scrollIntoView: 'today-anchor' });
      setTimeout(() => this.setData({ scrollIntoView: '' }), 120);
    }
  },

  // 仅刷新统计数字（打卡后局部更新，不重建矩阵）
  refreshStats() {
    const focus = this._focusDate;
    const ds = statsUtil.dailyStat(focus, this.data.exercises);
    const rr = statsUtil.rangeRate(this.data.dates, this.data.exercises);
    this.setData({
      done: ds.done, total: ds.total, rate: ds.rate, isRest: ds.isRest, rangeRate: rr,
    });
  },

  /* ---------- 打卡 ---------- */
  onToggleCell(e) {
    const { date, ex } = e.currentTarget.dataset;
    if (storage.isRestDay(date)) return; // 休息日不可打卡
    const nowDone = storage.toggleRecord(date, ex);
    this.setData({ ['records.' + date + '.' + ex]: nowDone });
    this.refreshStats();
    wx.vibrateShort({ type: 'light' });
  },

  /* ---------- 视图切换 ---------- */
  onToggleView(e) {
    const mode = e.detail.mode;
    if (mode === this.data.viewMode) return;
    storage.saveSettings({ viewMode: mode });
    this.setData({ viewMode: mode, rangeLabel: mode === 'month' ? '本月' : '本周' });
    this.refresh(true);
  },

  /* ---------- 焦点日期（点表头） ---------- */
  onTapDate(e) {
    const date = e.currentTarget.dataset.date;
    this._focusDate = date;
    this.setData({
      focusDate: date,
      focusLabel: date === dateUtil.today() ? '今天' : dateUtil.prettyDate(date),
    });
    this.refreshStats();
  },

  /* ---------- 备注与休息日（长按表头） ---------- */
  onOpenNote(e) {
    const date = e.currentTarget.dataset.date;
    this._noteDate = date;
    this.setData({
      noteVisible: true,
      noteDateLabel: dateUtil.prettyDate(date),
      noteText: storage.getNote(date),
      noteIsRest: storage.isRestDay(date),
    });
  },
  onSaveNote(e) {
    storage.saveNote(this._noteDate, e.detail.text);
    this.setData({ noteVisible: false });
    wx.showToast({ title: '已保存', icon: 'none' });
  },
  onToggleRest(e) {
    const isRest = storage.toggleRestDay(this._noteDate);
    this.setData({ noteIsRest: isRest });
    this.refresh(); // 休息日变更需重建 isRest 与统计
  },
  onCloseNote() {
    this.setData({ noteVisible: false });
  },

  /* ---------- 月度报告 ---------- */
  onOpenReport() {
    const { year, month } = dateUtil.yearMonthOf(this._focusDate || dateUtil.today());
    const reportData = reportUtil.buildMonthReport(year, month, storage.getExercises());
    this.setData({ reportVisible: true, reportData });
  },
  onCloseReport() {
    this.setData({ reportVisible: false });
  },

  /* ---------- 拖拽排序（capture 层 + JS 节流） ---------- */
  onRowLongPress(e) {
    if (this.data.exercises.length <= 1) return;
    const index = e.currentTarget.dataset.index;
    const touch = e.touches[0];
    if (!touch) return;
    this._dragStartY = touch.clientY;
    this._dragOrigin = index;
    this._dragLastMove = 0;
    wx.vibrateShort({ type: 'light' });
    this.setData({
      isDragging: true,
      draggingIndex: index,
      targetIndex: index,
      translateY: 0,
      shifts: this.data.exercises.map(() => 0),
    });
  },
  onDragMove(e) {
    if (!this.data.isDragging) return;
    const now = Date.now();
    if (now - this._dragLastMove < 16) return; // 节流 ~60fps
    this._dragLastMove = now;
    const touch = e.touches[0];
    if (!touch) return;
    const dy = touch.clientY - this._dragStartY;
    const ROW_H = this.data.ROW_H;
    const origin = this._dragOrigin;
    const len = this.data.exercises.length;
    let target = origin + Math.round(dy / ROW_H);
    target = Math.max(0, Math.min(len - 1, target));
    const shifts = this.data.exercises.map((_, i) => {
      if (i === origin) return 0;
      if (origin < target && i > origin && i <= target) return -ROW_H; // 下拖：中间上移
      if (origin > target && i < origin && i >= target) return ROW_H;  // 上拖：中间下移
      return 0;
    });
    this.setData({ translateY: dy, shifts, targetIndex: target });
  },
  onDragEnd() {
    if (!this.data.isDragging) return;
    const { draggingIndex, targetIndex } = this.data;
    const list = this.data.exercises.slice();
    if (draggingIndex !== targetIndex) {
      const [moved] = list.splice(draggingIndex, 1);
      list.splice(targetIndex, 0, moved);
      storage.saveExercises(list.map((e) => ({
        id: e.id, name: e.name, icon: e.icon, createdAt: e.createdAt,
      })));
      wx.vibrateShort({ type: 'light' });
    }
    this._dragOrigin = -1;
    this.setData({
      exercises: list,
      isDragging: false,
      draggingIndex: -1,
      targetIndex: -1,
      translateY: 0,
      shifts: list.map(() => 0),
    });
    this.refreshStats();
  },

  /* ---------- 项目新增/编辑/删除 ---------- */
  onAddExercise() {
    this._editMode = 'add';
    this.setData({
      editVisible: true,
      editMode: 'add',
      editName: '',
      editIcon: 'star',
      editingId: '',
      iconChoices: this.buildIconChoices('star'),
    });
  },
  onEditExercise(e) {
    const id = e.currentTarget.dataset.id;
    const ex = this.data.exercises.find((x) => x.id === id);
    if (!ex) return;
    this._editMode = 'edit';
    this.setData({
      editVisible: true,
      editMode: 'edit',
      editName: ex.name,
      editIcon: ex.icon,
      editingId: id,
      iconChoices: this.buildIconChoices(ex.icon),
    });
  },
  buildIconChoices(selected) {
    return C.ICON_KEYS.map((k) => ({
      key: k,
      uri: icons.iconUri(k),
      selected: k === selected,
    }));
  },
  onEditName(e) {
    this.setData({ editName: e.detail.value });
  },
  onPickIcon(e) {
    const key = e.currentTarget.dataset.key;
    const iconChoices = this.data.iconChoices.map((c) => ({ key: c.key, uri: c.uri, selected: c.key === key }));
    this.setData({ editIcon: key, iconChoices });
  },
  onSaveExercise() {
    const name = (this.data.editName || '').trim();
    if (!name) {
      wx.showToast({ title: '请输入项目名称', icon: 'none' });
      return;
    }
    const list = this.data.exercises.slice();
    if (this._editMode === 'edit') {
      const ex = list.find((x) => x.id === this.data.editingId);
      if (ex) { ex.name = name; ex.icon = this.data.editIcon; }
    } else {
      list.push({
        id: 'ex_' + Date.now(),
        name: name,
        icon: this.data.editIcon,
        createdAt: Date.now(),
      });
    }
    storage.saveExercises(list.map((e) => ({
      id: e.id, name: e.name, icon: e.icon, createdAt: e.createdAt,
    })));
    this.setData({ editVisible: false });
    this.refresh();
    wx.showToast({ title: this._editMode === 'edit' ? '已更新' : '已新增', icon: 'none' });
  },
  onDeleteExercise(e) {
    const id = (e.currentTarget.dataset && e.currentTarget.dataset.id) || this.data.editingId;
    const ex = this.data.exercises.find((x) => x.id === id);
    if (!ex) return;
    wx.showModal({
      title: '删除项目',
      content: '确定删除「' + ex.name + '」吗？该项目的历史打卡记录将一并清除。',
      confirmText: '删除',
      confirmColor: '#E53935',
      success: (r) => {
        if (!r.confirm) return;
        const list = this.data.exercises.filter((x) => x.id !== id);
        storage.saveExercises(list.map((e) => ({
          id: e.id, name: e.name, icon: e.icon, createdAt: e.createdAt,
        })));
        storage.cleanRecordsForEx(id);
        this.setData({ editVisible: false });
        this.refresh();
        wx.showToast({ title: '已删除', icon: 'none' });
      },
    });
  },
  onCloseEdit() {
    this.setData({ editVisible: false });
  },
  noop() {},
});
