// 统计：完成数、完成率（按 createdAt 过滤分母，新增项目不污染历史）
const storage = require('./storage');
const dateUtil = require('./date');

// 项目创建日期 key（YYYY-MM-DD），用于"该日项目是否已存在"判断
function createdKey(ex) {
  return dateUtil.fmt(new Date(ex.createdAt || 0));
}

// 读取某日某项目的完成组数（兼容旧 boolean）
function _count(rec, exId) {
  const v = (rec || {})[exId];
  if (!v) return 0;
  if (v === true) return 1;
  return typeof v === 'number' ? v : 0;
}

// 某日统计：完成数/应做数/完成率；休息日 rate=-1
function dailyStat(dateKey, exercises) {
  const restSet = storage.getRestDays();
  if (restSet[dateKey]) return { done: 0, total: 0, rate: -1, isRest: true };
  const rec = storage.getRecords()[dateKey] || {};
  let due = 0, done = 0;
  exercises.forEach((ex) => {
    if (createdKey(ex) <= dateKey) {
      due += 1;
      const goal = ex.dailyGoalSets || 1;
      if (_count(rec, ex.id) >= goal) done += 1;
    }
  });
  return { done, total: due, rate: due ? done / due : 0, isRest: false };
}

// 区间完成率（排除休息日 & 项目未创建日期）
function rangeRate(dates, exercises) {
  const restSet = storage.getRestDays();
  const recs = storage.getRecords();
  let denom = 0, numer = 0;
  dates.forEach((d) => {
    if (restSet[d.key]) return;
    const rec = recs[d.key] || {};
    exercises.forEach((ex) => {
      if (createdKey(ex) <= d.key) {
        denom += 1;
        const goal = ex.dailyGoalSets || 1;
        if (_count(rec, ex.id) >= goal) numer += 1;
      }
    });
  });
  return denom ? numer / denom : 0;
}

module.exports = { dailyStat, rangeRate, createdKey };
