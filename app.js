const storage = require('./utils/storage');
const { DEFAULT_EXERCISES } = require('./utils/constants');

App({
  onLaunch() {
    // 首次启动写入预置训练项目，方便用户直接上手
    if (!storage.getExercises().length) {
      const base = Date.now();
      const seeded = DEFAULT_EXERCISES.map((e, i) => ({
        id: e.id,
        name: e.name,
        icon: e.icon,
        createdAt: base + i, // 错开时间戳，避免完全相同
      }));
      storage.saveExercises(seeded);
    }
  },
});
