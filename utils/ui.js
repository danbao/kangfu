// 单位换算：rpx <-> px（拖拽 transform 必须用 px，WXSS 用 rpx）
let _windowWidth = null;

function windowWidth() {
  if (_windowWidth == null) {
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      _windowWidth = info.windowWidth;
    } catch (e) {
      _windowWidth = 375;
    }
  }
  return _windowWidth;
}

const rpx2px = (rpx) => Math.round((rpx / 750) * windowWidth());
const px2rpx = (px) => Math.round((px * 750) / windowWidth());

module.exports = { rpx2px, px2rpx, windowWidth };
