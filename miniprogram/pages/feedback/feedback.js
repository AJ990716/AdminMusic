// pages/feedback/feedback.js
Page({
  data: {
    message:"",
    messageL:"0"
  },
  onChange(event) {
    // event.detail 为当前输入的值
    var message = event.detail;//输入的内容
    var messageL = message.length;//输入内容的长度
    var that = this;
    if (messageL >= "100") {
      that.setData({
        messageL:100,
      })
      if (this.data.messageL>="100") {
        wx.showToast({
          title: "最多只能输入100个字符",
          duration:1000,
          mask:true,
          icon:"none"
        })
      }
    } else {
      that.setData({
        messageL:messageL,
      })
    }
    that.setData({
      message: message,
    })
    console.log(this.data.messageL)
  },
  click:function() {
    var timmer;
    if (this.data.messageL=="0") {
      wx.showToast({
        title: '输入不能为空',
        duration:1000,
        mask:true,
        icon:"none"
      })
    } else {
      wx.showToast({
        title: '提交反馈成功',
        duration:1000,
        mask:true,
        success(){
          timmer = setInterval(function() {
            wx.navigateBack({
              delta: 1,
            })
          clearInterval(timmer)
          },800)
        }
      })
    }
  }
})
