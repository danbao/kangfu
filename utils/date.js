// 日期工具：格式化、周/月日期数组生成
const pad = (n) => String(n).padStart(2, '0');
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

function fmt(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function today() {
  return fmt(new Date());
}
function parse(s) {
  const parts = String(s).split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
function isSameDay(a, b) {
  return fmt(a) === fmt(b);
}

function toCell(d, restSet) {
  const key = fmt(d);
  return {
    key: key,
    d: d.getDate(),
    month: d.getMonth() + 1,
    weekday: WEEK[d.getDay()],
    isToday: key === today(),
    isRest: !!(restSet && restSet[key]),
  };
}

// 含今天的最近 7 天
function buildWeekDays(restSet) {
  const arr = [];
  const base = new Date();
  for (let i = 6; i >= 0; i--) {
    arr.push(toCell(new Date(base.getFullYear(), base.getMonth(), base.getDate() - i), restSet));
  }
  return arr;
}

// 当月 1 日 ~ 月末
function buildMonthDays(restSet) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const arr = [];
  for (let i = 1; i <= last; i++) {
    arr.push(toCell(new Date(y, m, i), restSet));
  }
  return arr;
}

function buildDays(viewMode, restSet) {
  return viewMode === 'month' ? buildMonthDays(restSet) : buildWeekDays(restSet);
}

function prettyDate(key) {
  const d = parse(key);
  return d.getMonth() + 1 + '月' + d.getDate() + '日 周' + WEEK[d.getDay()];
}

function yearMonthOf(key) {
  const d = parse(key);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

module.exports = {
  fmt, today, parse, isSameDay,
  buildWeekDays, buildMonthDays, buildDays,
  prettyDate, yearMonthOf,
};
