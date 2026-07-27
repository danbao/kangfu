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
    { id: 'ex_1', name: '踝泵运动', icon: 'ankle' },
    { id: 'ex_2', name: '直腿抬高', icon: 'leg' },
    { id: 'ex_3', name: '股四头肌等长收缩', icon: 'quad' },
    { id: 'ex_4', name: '膝关节屈伸', icon: 'knee' },
  ],
  // 可选图标键（新增/编辑项目时选择）
  ICON_KEYS: [
    'ankle', 'leg', 'quad', 'knee',
    'dumbbell', 'stretch', 'run', 'heart', 'core', 'balance', 'wave', 'star',
  ],
};
