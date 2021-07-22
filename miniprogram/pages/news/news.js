// pages/feedback/feedback.js
Page({
  data: {
    checked: true,
    checked1: true,
  },

  onChange({ detail }) {
    this.setData({ checked: detail });
    // 异步控制，弹出提示消息框
    // wx.showModal({
    //   title: '提示',
    //   content: '确认打开/关闭消息通知',
    //   success: (res) => {
    //     if (res.confirm) {
    //       this.setData({ checked2: detail });
    //     }
    //   },
    // });
  },
  onChange1({ detail }) {
    this.setData({ checked1: detail });
  },
});