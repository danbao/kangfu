// 月度报告数据聚合：供 report-panel 的 canvas 绘制
const storage = require('./storage');
const dateUtil = require('./date');
const statsUtil = require('./stats');

function buildMonthReport(year, month, exercises) {
  const last = new Date(year, month, 0).getDate(); // 月末日期
  const restSet = storage.getRestDays();
  const recs = storage.getRecords();
  const notes = storage.getNotes();
  const monthPrefix = year + '-' + (month < 10 ? '0' + month : month);

  const dateKeys = [];
  for (let i = 1; i <= last; i++) {
    dateKeys.push(dateUtil.fmt(new Date(year, month - 1, i)));
  }

  // 完成矩阵：[exIndex][dateIndex] -> 1/0
  const matrix = exercises.map((ex) =>
    dateKeys.map((key) => {
      if (restSet[key]) return 0;
      return recs[key] && recs[key][ex.id] ? 1 : 0;
    })
  );

  // 每日完成比例（0~1），休息日为 -1（绘制时跳过/置灰）
  const dailyRate = dateKeys.map((key) => {
    if (restSet[key]) return -1;
    const rec = recs[key] || {};
    let due = 0;
    let done = 0;
    exercises.forEach((ex) => {
      if (statsUtil.createdKey(ex) <= key) {
        due += 1;
        if (rec[ex.id]) done += 1;
      }
    });
    return due ? done / due : 0;
  });

  // 区间完成率
  const rate = statsUtil.rangeRate(
    dateKeys.map((key) => ({ key })),
    exercises
  );

  // 连续打卡天数（从月末向前，休息日跳过且不打断）
  let streak = 0;
  for (let i = dateKeys.length - 1; i >= 0; i--) {
    const key = dateKeys[i];
    if (restSet[key]) continue;
    const rec = recs[key] || {};
    const any = exercises.some((ex) => statsUtil.createdKey(ex) <= key && rec[ex.id]);
    if (any) streak += 1;
    else break;
  }

  // 本月打卡总数
  let totalChecks = 0;
  dateKeys.forEach((key) => {
    if (restSet[key]) return;
    const rec = recs[key] || {};
    exercises.forEach((ex) => {
      if (statsUtil.createdKey(ex) <= key && rec[ex.id]) totalChecks += 1;
    });
  });

  const restCount = dateKeys.filter((k) => restSet[k]).length;
  const notesCount = Object.keys(notes).filter((k) => k.indexOf(monthPrefix) === 0).length;

  return {
    year, month, lastDay: last,
    exercises: exercises.map((e) => ({ id: e.id, name: e.name, icon: e.icon })),
    dateKeys,
    matrix,
    dailyRate,
    rate,
    streak,
    totalChecks,
    restCount,
    notesCount,
  };
}

module.exports = { buildMonthReport };
