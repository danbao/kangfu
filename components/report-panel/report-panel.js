// 月度报告面板：canvas 2d 绘制打卡热力日历 + 完成率环 + 关键指标，可保存/分享
Component({
  options: { addGlobalClass: true },
  properties: {
    visible: { type: Boolean, value: false },
    report: { type: Object, value: null },
  },
  observers: {
    visible(v) {
      if (v) this.initWhenShow();
    },
  },
  methods: {
    // 面板显示后初始化 canvas 并绘制
    initWhenShow() {
      if (!this.data.visible) return;
      setTimeout(() => this.initCanvas(), 60);
    },
    initCanvas() {
      const q = this.createSelectorQuery();
      q.select('#reportCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) return;
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          let dpr = 2;
          try {
            dpr = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).pixelRatio;
          } catch (e) {}
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);
          this._canvas = canvas;
          this._ctx = ctx;
          this._w = res[0].width;
          this._h = res[0].height;
          this.draw();
        });
    },

    draw() {
      const r = this.data.report;
      if (!r || !this._ctx) return;
      const ctx = this._ctx;
      const W = this._w;
      const H = this._h;
      const cx = W / 2;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      // 标题
      ctx.fillStyle = '#424242';
      ctx.font = '600 20px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText(r.year + '年' + r.month + '月', cx, 40);
      ctx.fillStyle = '#9E9E9E';
      ctx.font = '13px -apple-system, sans-serif';
      ctx.fillText('康复打卡 · 月度报告', cx, 62);

      // 完成率环
      const cy = 150;
      const R = 44;
      ctx.lineCap = 'round';
      ctx.lineWidth = 11;
      ctx.strokeStyle = '#F5F5F5';
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#F48FB1';
      ctx.beginPath();
      ctx.arc(
        cx, cy, R,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, r.rate || 0))
      );
      ctx.stroke();
      ctx.fillStyle = '#F48FB1';
      ctx.font = '700 28px -apple-system, sans-serif';
      ctx.fillText(Math.round((r.rate || 0) * 100) + '%', cx, cy + 6);
      ctx.fillStyle = '#9E9E9E';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillText('月度完成率', cx, cy + 28);

      // 三指标
      const metY = 232;
      const items = [
        { num: r.totalChecks, label: '打卡次数' },
        { num: r.streak, label: '最长连续' },
        { num: r.restCount, label: '休息日' },
      ];
      const segW = W / 3;
      items.forEach((it, i) => {
        const x = segW * i + segW / 2;
        ctx.fillStyle = '#424242';
        ctx.font = '600 22px -apple-system, sans-serif';
        ctx.fillText(String(it.num), x, metY);
        ctx.fillStyle = '#9E9E9E';
        ctx.font = '12px -apple-system, sans-serif';
        ctx.fillText(it.label, x, metY + 20);
      });
      ctx.strokeStyle = '#ECEFF1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(28, metY + 40);
      ctx.lineTo(W - 28, metY + 40);
      ctx.stroke();

      // 日历热力
      this.drawCalendar(ctx, r, W, metY + 70);

      // 底部签名
      ctx.fillStyle = '#BDBDBD';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText('康复打卡工作台', cx, H - 18);
    },

    drawCalendar(ctx, r, W, y0) {
      const pad = 26;
      const gap = 6;
      const innerW = W - pad * 2;
      const cell = (innerW - gap * 6) / 7;
      const weekLabels = ['一', '二', '三', '四', '五', '六', '日'];

      ctx.textAlign = 'center';
      ctx.fillStyle = '#9E9E9E';
      ctx.font = '11px -apple-system, sans-serif';
      weekLabels.forEach((w, i) => {
        ctx.fillText(w, pad + cell / 2 + i * (cell + gap), y0);
      });

      const firstDow = new Date(r.year, r.month - 1, 1).getDay();
      const lead = (firstDow + 6) % 7; // 周一起
      let col = lead;
      let row = 0;
      const startY = y0 + 22;
      for (let day = 1; day <= r.lastDay; day++) {
        const rate = r.dailyRate[day - 1];
        const x = pad + col * (cell + gap);
        const y = startY + row * (cell + gap);
        ctx.fillStyle = this.heatColor(rate);
        this.roundRect(ctx, x, y, cell, cell, 5);
        ctx.fill();
        ctx.fillStyle = rate >= 0.67 ? '#FFFFFF' : '#9E9E9E';
        ctx.font = '600 11px -apple-system, sans-serif';
        ctx.fillText(String(day), x + cell / 2, y + cell / 2 + 4);
        col++;
        if (col >= 7) { col = 0; row++; }
      }

      // 图例
      const legendY = startY + (row + 1) * (cell + gap) + 6;
      const lw = 16;
      const colors = ['#F5F5F5', '#FCE4EC', '#F8BBD0', '#F48FB1'];
      ctx.textAlign = 'left';
      ctx.fillStyle = '#9E9E9E';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText('少', pad, legendY + 12);
      let lx = pad + 22;
      colors.forEach((c) => {
        ctx.fillStyle = c;
        this.roundRect(ctx, lx, legendY, lw, lw, 3);
        ctx.fill();
        lx += lw + 4;
      });
      ctx.fillStyle = '#9E9E9E';
      ctx.fillText('多', lx + 2, legendY + 12);
    },

    heatColor(rate) {
      if (rate < 0) return '#E0E0E0';
      if (rate === 0) return '#F5F5F5';
      if (rate < 0.34) return '#FCE4EC';
      if (rate < 0.67) return '#F8BBD0';
      if (rate < 1) return '#F48FB1';
      return '#EC407A';
    },

    roundRect(ctx, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    },

    onSave() {
      if (!this._canvas) return;
      wx.showLoading({ title: '生成中', mask: true });
      wx.canvasToTempFilePath({
        canvas: this._canvas,
        success: (res) => {
          wx.hideLoading();
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
            fail: (err) => this.handleSaveFail(err),
          });
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({ title: '生成失败', icon: 'none' });
        },
      });
    },

    handleSaveFail(err) {
      const msg = (err && err.errMsg) || '';
      if (msg.indexOf('auth') !== -1 || msg.indexOf('deny') !== -1) {
        wx.showModal({
          title: '需要相册权限',
          content: '保存报告需要"保存到相册"权限，请在设置中开启后重试',
          confirmText: '去设置',
          success: (m) => {
            if (m.confirm) wx.openSetting();
          },
        });
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    },

    onShare() {
      if (!this._canvas) return;
      wx.canvasToTempFilePath({
        canvas: this._canvas,
        success: (res) => {
          wx.shareImageMessage({ filePath: res.tempFilePath, fail: () => {} });
        },
      });
    },

    onClose() {
      // triggerEvent 在部分微信版本不稳定，直接操作当前页面
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      if (page && typeof page.onCloseReport === 'function') {
        page.onCloseReport();
      } else {
        this.triggerEvent('close'); // fallback
      }
    },
    noop() {},
  },
});
