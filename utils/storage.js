// 本地存储封装：持久化唯一出口，所有读写经此
const { STORAGE_KEYS } = require('./constants');

function read(key, def) {
  try {
    const v = wx.getStorageSync(key);
    return v === '' || v === undefined || v === null ? def : v;
  } catch (e) {
    return def;
  }
}
function write(key, val) {
  try { wx.setStorageSync(key, val); } catch (e) {}
}

/* ---------- 训练项目 ---------- */
const getExercises = () => read(STORAGE_KEYS.EXERCISES, []);
const saveExercises = (list) => write(STORAGE_KEYS.EXERCISES, list);

/* ---------- 打卡记录 { date: { exId: number（完成组数） } } ---------- */
// 兼容旧数据：值为 true 视为 1
function _count(val) {
  if (!val) return 0;
  if (val === true) return 1;
  return typeof val === 'number' ? val : 0;
}

const getRecords = () => read(STORAGE_KEYS.RECORDS, {});

function addSet(date, exId) {
  const r = getRecords();
  if (!r[date]) r[date] = {};
  r[date][exId] = _count(r[date][exId]) + 1;
  write(STORAGE_KEYS.RECORDS, r);
  return r[date][exId];
}

function removeSet(date, exId) {
  const r = getRecords();
  if (!r[date]) return 0;
  const next = Math.max(0, _count(r[date][exId]) - 1);
  if (next === 0) {
    delete r[date][exId];
    if (!Object.keys(r[date]).length) delete r[date];
  } else {
    r[date][exId] = next;
  }
  write(STORAGE_KEYS.RECORDS, r);
  return next;
}

// 矩阵视图：点击循环 0 → goalSets → 0
function cycleSet(date, exId, goalSets) {
  const r = getRecords();
  if (!r[date]) r[date] = {};
  const cur = _count(r[date][exId]);
  const next = cur >= goalSets ? 0 : goalSets;
  if (next === 0) {
    delete r[date][exId];
    if (!Object.keys(r[date]).length) delete r[date];
  } else {
    r[date][exId] = next;
  }
  write(STORAGE_KEYS.RECORDS, r);
  return next;
}

// 向后兼容旧调用（矩阵 onToggleCell 已迁移，保留避免报错）
function toggleRecord(date, exId) {
  const r = getRecords();
  if (!r[date]) r[date] = {};
  const cur = _count(r[date][exId]);
  const next = cur > 0 ? 0 : 1;
  if (next === 0) { delete r[date][exId]; if (!Object.keys(r[date]).length) delete r[date]; }
  else r[date][exId] = next;
  write(STORAGE_KEYS.RECORDS, r);
  return next > 0;
}

const getCount = (date, exId) => _count((getRecords()[date] || {})[exId]);
const isDone = (date, exId, goalSets = 1) => getCount(date, exId) >= goalSets;

// 删除项目时清理其历史打卡
function cleanRecordsForEx(exId) {
  const r = getRecords();
  let changed = false;
  Object.keys(r).forEach((date) => {
    if (r[date] && r[date][exId]) {
      delete r[date][exId];
      changed = true;
      if (!Object.keys(r[date]).length) delete r[date];
    }
  });
  if (changed) write(STORAGE_KEYS.RECORDS, r);
}

/* ---------- 备注 ---------- */
const getNotes = () => read(STORAGE_KEYS.NOTES, {});
const getNote = (date) => getNotes()[date] || '';
function saveNote(date, text) {
  const n = getNotes();
  if (text) n[date] = text;
  else delete n[date];
  write(STORAGE_KEYS.NOTES, n);
}

/* ---------- 休息日 ---------- */
const getRestDays = () => read(STORAGE_KEYS.REST_DAYS, {});
function toggleRestDay(date) {
  const m = getRestDays();
  if (m[date]) delete m[date];
  else m[date] = true;
  write(STORAGE_KEYS.REST_DAYS, m);
  return !!m[date];
}
const isRestDay = (date) => !!getRestDays()[date];

/* ---------- 设置 ---------- */
const getSettings = () => read(STORAGE_KEYS.SETTINGS, { viewMode: 'week' });
function saveSettings(patch) {
  const s = getSettings();
  write(STORAGE_KEYS.SETTINGS, Object.assign({}, s, patch));
}

module.exports = {
  read, write,
  getExercises, saveExercises,
  getRecords, addSet, removeSet, cycleSet, toggleRecord, getCount, isDone, cleanRecordsForEx,
  getNotes, getNote, saveNote,
  getRestDays, toggleRestDay, isRestDay,
  getSettings, saveSettings,
};
