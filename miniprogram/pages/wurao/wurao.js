// pages/feedback/feedback.js
Page({
  data: {
    checked: false,
    starttime: "23：00",
    endtime: "08:00"
  },
  onChange({ detail }) {
    this.setData({ checked: detail });
  },
  bindTimeChange: function(e) {
    this.setData({
      starttime: e.detail.value
    })
  },
  bindTimeChange1: function(e) {
    this.setData({
      endtime: e.detail.value
    })
  },
});