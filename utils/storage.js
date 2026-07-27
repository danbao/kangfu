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

/* ---------- 打卡记录 { date: { exId: true } } ---------- */
const getRecords = () => read(STORAGE_KEYS.RECORDS, {});
function toggleRecord(date, exId) {
  const r = getRecords();
  if (!r[date]) r[date] = {};
  if (r[date][exId]) delete r[date][exId];
  else r[date][exId] = true;
  // 清理空对象
  if (!Object.keys(r[date]).length) delete r[date];
  write(STORAGE_KEYS.RECORDS, r);
  return !!(r[date] && r[date][exId]);
}
const isDone = (date, exId) => !!(getRecords()[date] && getRecords()[date][exId]);

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
  getRecords, toggleRecord, isDone, cleanRecordsForEx,
  getNotes, getNote, saveNote,
  getRestDays, toggleRestDay, isRestDay,
  getSettings, saveSettings,
};
