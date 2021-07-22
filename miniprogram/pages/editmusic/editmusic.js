// miniprogram/pages/editmusic/editmusic.js
// 导入Toast轻提示
import Toast from '@vant/weapp/toast/toast';
// 导入Dialog弹出框
import Dialog from '@vant/weapp/dialog/dialog';
// 导入消息通知
import Notify from '@vant/weapp/notify/notify';
const db = wx.cloud.database();//获取数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,//个人信息
    images: [],    //获取上传的图片地址
    getSongName:"",     //获取输入的歌名
    getSingerName:"",   //获取歌手名
    getmusicAddress:"", //获取音乐地址
    index:null,//以下标命名
    noupimage:false,//无上传图片时
    musicAddressPass:false,//音乐地址格式是否正确
  },

  // 返回首页
  backindex(){
    wx.navigateBack({
      delta: 1
    })
  },
  //上传图片的函数 获取图片缓冲地址
  afterRead(event) {
    // 数组连接
    this.setData({
      images: this.data.images.concat(event.detail.file),
      playstatus:false
    })
  },
  // 删除图片缓存地址的函数
  delete(event) {
    var index = event.detail.index;
    var images = this.data.images;
    // 从当前index开始删 删1位 并插入0位
    images.splice(index, 1);
    this.setData({
      images: images,
      noupimage:true
    })
  },

  //输入提示
  onClickIcon:function(){
    Dialog.alert({
      title:'提示',
      message: '需要将数据全部补充完整才能提交',
      theme: 'round-button',
    }).then(() => {
      // on close
    });
  },
  //获取歌曲名
  getSongName:function(e){
    // console.log(e.detail)
    this.setData({
      getSongName:e.detail
    })
  },
  //获取歌手名
  getSingerName:function(e){
    this.setData({
      getSingerName:e.detail
    })
  },
  //获取音乐地址
  getmusicAddress:function(e){
    var regImagesurl = new RegExp(/^http[s]?:\/\/.+\.mp3$/,"");
    if(regImagesurl.exec(e.detail)!=null){
      this.setData({
        getmusicAddress:e.detail,
        musicAddressPass:true
      })
    }else{
      this.setData({musicAddressPass:false})
    }
  },
  // 数据上传至数据库的方法
  insetdatabase:function(dataObj){
    var that = this;
    var data;
    if(dataObj["logoImageId"]===undefined){
      data = {
        songName: dataObj.songName,
        singerName: dataObj.singerName,
        musicAddress: dataObj.musicAddress,
        adminname: dataObj.adminname,
        index: dataObj.index
      }
    }else{
      data = {
        logoImageId: dataObj.logoImageId,
        songName: dataObj.songName,
        singerName: dataObj.singerName,
        musicAddress: dataObj.musicAddress,
        adminname: dataObj.adminname,
        index: dataObj.index
      }
    }
    db.collection("adminMusic").doc(dataObj.songId).update({
      data:data,
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        Toast.success({
          forbidClick: true,//是否禁止背景点击
          message: '上传成功3秒后返回主页',
          duration:'3000',
          selector: '#custom-selector',
        });
        const eventChannel = that.getOpenerEventChannel()
        eventChannel.emit('someEvent', {status: true});
        setTimeout(function(){
          that.backindex();
        },3000)
      },
      fail: function(err){
        console.log("更新失败")
      }
    })
  },
  //提交/上传音乐
  submit: function () {
    var that = this;
    var index = this.data.index;
    var songId = this.data.songId;
    var images = this.data.images;
    var noupimage = this.data.noupimage;
    var getSongName = this.data.getSongName;
    var getSingerName = this.data.getSingerName;
    var getmusicAddress = this.data.getmusicAddress;
    var musicAddressPass = this.data.musicAddressPass;
    var adminname = this.data.userInfo.nickName;
    var pass = (adminname != "" && images.length!=0 && getSongName != "" && getSingerName != "" && musicAddressPass);
    if(pass){
      Toast.loading({
        forbidClick: true,//是否禁止背景点击
        message: '正在上传...',
        selector: '#custom-selector',
        duration:0
      });
      var dataObj = {
        imagesUrl:images[0].url,
        songName:getSongName,
        singerName:getSingerName,
        musicAddress:getmusicAddress,
        adminname:adminname,
        index:index,
        songId:songId
      };
      // 调用上传data的方法
      if(noupimage){
        wx.cloud.uploadFile({
          cloudPath: 'example' + dataObj.index + '.jpg',
          filePath: dataObj.imagesUrl, // 文件路径
          success: res => {
            // get resource ID
            dataObj["logoImageId"]=res.fileID;
            //将上传图片存入数据库
            that.insetdatabase(dataObj);
          },
          fail: err => {
            // handle error
            console.log("图片错误");
            Toast.fail({
              forbidClick: true,//是否禁止背景点击
              message: '上传失败',
              duration:'3000',
              selector: '#custom-selector',
            });
          }
        })
      }else{
        //不上传图片 只上传数据
        that.insetdatabase(dataObj);
      }
    }else{
      this.onClickIcon();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    Toast.loading({
      forbidClick: true,//是否禁止背景点击
      message: '加载中...',
      selector: '#custom-selector',
    });
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      that.setData({
        images: data.images,
        getSongName:data.getSongName,
        getSingerName:data.getSingerName,
        getmusicAddress:data.getmusicAddress,
        index:data.index,
        songId:data.songId
      })
    })
    //获取用户信息
    wx.getUserInfo({
      lang:"zh_CN",//返回信息为简体中文
      success: function (res) {
          that.data.userInfo = res.userInfo;
          that.setData({
              userInfo: that.data.userInfo
          })
      },
      fail:function(res){
        console.log("获取信息失败")
      },
      complete:function(res){
        console.log("获取个人信息环节")
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})