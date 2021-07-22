// pages/home/home.js
const app = getApp();
const innerAudioContext = wx.createInnerAudioContext();
const db = wx.cloud.database();
let playstatus = false; //播放状态
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index:0,             //歌曲下标
    userInfo: {},        //使用者信息
    hasUserInfo: false,  //获取用户信息
    canIUse: true,       //组件是否可用
    adminname: "",       //获取到的用户名
    adminMusic: [],      //获取所有的音乐
    songAnimation: "songImgRun", //设置音乐logo动画
    songImgRun: "paused",        //动画是否动
    currentTime: 0,     //正在播放的时间
    duration: 0,        //音乐的总时长
    showcurrentTime: "00:00",  //显示的正在播放的时间
    showduration: "00:00",     //显示的音乐的总时长
    playicon: "play-circle-o",    //显示的play图标
    musicname: [],       //歌曲名
    tStart: null,
    tMove: null,
    tChange: null,
    volume:50,          //音量
    volumechange:0,
    showvolume:"none"   //隐藏音量
  },

  //触发获取信息的函数
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      adminname: e.detail.userInfo.nickName,
      hasUserInfo: true
    })
  },

  //返回
  back:function(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },

  //滑动切换音乐
  songchange:function(e){
    var that = this;
    var index = e.detail.current; 
    var musicAddress = this.data.adminMusic[index].musicAddress;
    innerAudioContext.src = musicAddress;
    innerAudioContext.play();
    playstatus = true;
    this.setData({
      index:index,
      playicon: "pause-circle-o",  
    })
  },

  //进度条
  onSliderChange:function(e){
    // 获取进度条的时间点
    var currentTime = e.detail.value;
    //设置播放器从新的时间点开始播放
    innerAudioContext.seek(currentTime);
    var currentTime = Math.ceil(currentTime);
    var showcurrentTime_h = currentTime / 60;
    showcurrentTime_h = Math.floor(showcurrentTime_h);
    var showcurrentTime_m = currentTime % 60;
    if (showcurrentTime_h < 10) { showcurrentTime_h = "0" + showcurrentTime_h }
    if (showcurrentTime_m < 10) { showcurrentTime_m = "0" + showcurrentTime_m }
    this.setData({
      currentTime: currentTime,
      showcurrentTime: showcurrentTime_h + ":" + showcurrentTime_m
    })
  },

  //like按钮
  like:function(){
    wx.showToast({
      title: '暂时不支持收藏',
      icon: 'none',
      duration: 1000
    })
  },

  //上一曲
  last: function (e) {
    var that = this;
    var adminMusic = this.data.adminMusic;
    var index = this.data.index;
    index = index - 1;
    if (index < 0){
      index = this.data.adminMusic.length-1;
    }
    this.setData({
      index:index
    })
    innerAudioContext.stop();
    innerAudioContext.src = adminMusic[index].musicAddress;
    innerAudioContext.play();
    playstatus = true;
    this.setData({
      playicon: "pause-circle-o",
      songAnimation: "songImgNoRun"
    })
    setTimeout(function () {
      that.setData({
        songAnimation: "songImgRun",
        songImgRun: "running"
      })
    }, 100)
  },

  //播放
  play: function (e) {
    if (playstatus){
      innerAudioContext.pause();
      playstatus = false;
      this.setData({
        songAnimation: "songImgRun",
        songImgRun: "paused",
        playicon: "play-circle-o"
      })
    }else{
      innerAudioContext.play();
      playstatus = true;
      this.setData({
        songAnimation: "songImgRun",
        songImgRun: "running",
        playicon: "pause-circle-o"
      })
    }
  }, 

  //下一曲
  next: function (e) {
    var that = this;
    var adminMusic = this.data.adminMusic;
    var index = this.data.index;
    index = parseInt(index)
    index = index + 1;
    // console.log(index)
    if (index > this.data.adminMusic.length - 1) {
      index = 0;
    }
    this.setData({
      index: index
    })
    innerAudioContext.stop();
    innerAudioContext.src = adminMusic[index].musicAddress;
    innerAudioContext.play();
    playstatus = true;
    this.setData({
      playicon: "pause-circle-o",
      songAnimation: "songImgNoRun"
    })
    setTimeout(function () {
      that.setData({
        songAnimation: "songImgRun",
        songImgRun: "running"
      })
    }, 100)
  },

  //列表
  onlistChange:function(e){
    var that = this;
    var index = e.detail.value;
    var musicAddress = this.data.adminMusic[index].musicAddress;
    innerAudioContext.src = musicAddress;
    innerAudioContext.play();
    playstatus = true;
    this.setData({
      index: index,
      playicon: "pause-circle-o",
    })
  },

  touchstart: function (e) {
    var tstartX = Math.ceil(e.touches[0].pageX);
    var tstartY = Math.ceil(e.touches[0].pageY);
    var tstart = [tstartX, tstartY];
    this.setData({
      tStart: tstart,
      showvolume:"block"
    })
  },

  touchmove: function (e) {
    var tmoveX = Math.ceil(e.touches[0].pageX);
    var tmoveY = Math.ceil(e.touches[0].pageY);
    var tmove = [tmoveX, tmoveY];
    this.setData({
      tMove: tmove
    });
    //这里应该直接执行touch后的事件
    var tstart = this.data.tStart;
    var tmove = this.data.tMove;

    if (tstart != null && tmove != null) {
      // console.log("【strat】" + tstart);
      // console.log("【move】" + tmove);
      var tchangeX = tstart[0] - tmove[0];
      var tchangeY = tstart[1] - tmove[1];
      var tchange = [tchangeX, tchangeY];
      var volume = this.data.volume;
      var volumechange = tchange[1]/50;
      // this.setData({
      //   volumechange: volumechange
      // })
      volume = volume + volumechange;
      if (volume>=0 && volume<=100){
        this.setData({
          tChange: tchange,
          volume: volume,
          volumechange: volumechange,
          showvolume: "block"
        })
        innerAudioContext.volume = volume/100;
      }
    }
  },

  touchend: function (e) {
    var that = this;
    setTimeout(function(){
      that.setData({
        showvolume: "none"
      })
    },2000)
  },

  onvolumeChange:function(e){
    // console.log(e.detail.value)
    var volume = e.detail.value
    this.setData({
      volume: volume,
    })
    innerAudioContext.volume = volume / 100;
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var songindex;
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('currdata', function(data) {
      songindex = data.e.currentTarget.dataset.songindex;
    })
    db.collection('adminMusic').get({
      success: function (res) {
        // console.log(res)
        for (var i = 0; i < res.data.length; i++) {
          that.setData({
            musicname: that.data.musicname.concat(res.data[i].songName)
          })
        }
        var musicAddress = res.data[songindex].musicAddress;
        innerAudioContext.src = musicAddress;
        innerAudioContext.play();
        innerAudioContext.volume = 0.5;
        playstatus = true;
        that.setData({
          adminMusic: res.data,
          index: songindex,
          playicon: "pause-circle-o",
          songAnimation: "songImgRun",
          songImgRun: "running"
        })
        //监听音乐
        innerAudioContext.onCanplay(() => {
          var duration = innerAudioContext.duration;
          // 经过指定时间之后开始执行获取歌曲时长
          setTimeout(() => {
            duration = innerAudioContext.duration;
            duration = Math.ceil(duration);
            // console.log(duration)
            var showduration_h = duration / 60;
            //取整
            showduration_h = Math.floor(showduration_h);
            var showduration_m = duration % 60;
            if (showduration_h < 10) { showduration_h = "0" + showduration_h }
            if (showduration_m < 10) { showduration_m = "0" + showduration_m }
            that.setData({
              duration: duration,
              showduration: showduration_h + ":" + showduration_m
            })
          }, 500)
        })
        innerAudioContext.onTimeUpdate(() => {
          var currentTime = innerAudioContext.currentTime;
          var currentTime = Math.ceil(currentTime);
          var showcurrentTime_h = currentTime / 60;
          //取整
          showcurrentTime_h = Math.floor(showcurrentTime_h);
          var showcurrentTime_m = currentTime % 60;
          if (showcurrentTime_h < 10) { showcurrentTime_h = "0" + showcurrentTime_h }
          if (showcurrentTime_m < 10) { showcurrentTime_m = "0" + showcurrentTime_m }
          that.setData({
            currentTime: currentTime,
            showcurrentTime: showcurrentTime_h + ":" + showcurrentTime_m
          })
        })
        //监听音乐自动播放完
        innerAudioContext.onEnded((res) => {
          var index = that.data.index;
          var adminMusic = that.data.adminMusic;
          var length = that.data.adminMusic.length;
          index = index + 1;
          if (index < length) {
            index = index;
          } else {
            index = 0;
          }
          that.setData({
            index:index
          })
          // console.log("【下一曲的index】"+index);
          musicAddress = adminMusic[index].musicAddress;
          innerAudioContext.src = musicAddress;
          innerAudioContext.play();
        })
      }
    });
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
    innerAudioContext.pause();
    playstatus = false;
    this.setData({
      playicon: "play-circle-o",
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    innerAudioContext.pause();
    playstatus = false;
    this.setData({
      playicon: "play-circle-o",
    })
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