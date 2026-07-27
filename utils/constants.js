// 全局常量：存储 key、布局尺寸、预置项目、图标键
module.exports = {
  STORAGE_KEYS: {
    EXERCISES: 'kf_exercises',
    RECORDS: 'kf_records',
    NOTES: 'kf_notes',
    REST_DAYS: 'kf_rest_days',
    SETTINGS: 'kf_settings',
  },
  // 布局尺寸（rpx）—— 左右两列共用，行高对齐的命脉
  ROW_HEIGHT_RPX: 96,
  CELL_WIDTH_RPX: 88,
  HEADER_HEIGHT_RPX: 88,
  // 预置训练项目（icon 为 icons.js 中的 key）
  DEFAULT_EXERCISES: [
    { id: 'ex_1', name: '踝泵',     icon: 'ankle',   dailyGoalSets: 10, repsPerSet: 20 },
    { id: 'ex_2', name: '直腿抬高', icon: 'leg',     dailyGoalSets: 8,  repsPerSet: 20 },
    { id: 'ex_3', name: '坐姿提踵', icon: 'run',     dailyGoalSets: 8,  repsPerSet: 20 },
    { id: 'ex_4', name: '平滑移动', icon: 'balance', dailyGoalSets: 8,  repsPerSet: 20 },
    { id: 'ex_5', name: '抓毛巾',   icon: 'stretch', dailyGoalSets: 8,  repsPerSet: 20 },
    { id: 'ex_6', name: '屈膝踝泵', icon: 'knee',    dailyGoalSets: 8,  repsPerSet: 20 },
  ],
  // 可选图标键（新增/编辑项目时选择）
  ICON_KEYS: [
    'ankle', 'leg', 'quad', 'knee',
    'dumbbell', 'stretch', 'run', 'heart', 'core', 'balance', 'wave', 'star',
  ],
};
