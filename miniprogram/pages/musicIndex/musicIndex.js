// miniprogram/pages/musicIndex/musicIndex.js
// 导入Toast轻提示
import Toast from '@vant/weapp/toast/toast';
// 导入Dialog弹出框
import Dialog from '@vant/weapp/dialog/dialog';
// 导入消息通知
import Notify from '@vant/weapp/notify/notify';
var innerAudioContext;//创建音频
Page({

  /**
   * 页面的初始数据
   */
  data: {
    songactive: 0,//默认样式为
    userInfo:null,//个人信息
    firsttip:true,//第一次提示
    adminMusic:[],//adminMusic数据
    musicnamearr:[],//音乐歌曲名称
    playstatus:false,//播放状态
    index:null,//全局播放下标
    nextplayarr:[],//下一首播放的数组
    currentTime:0,//正在播放的时间
    duration:0,//音乐的总时长
    showcurrentTime: "00:00" ,//显示的正在播放的时间
    showduration:"00:00",//显示的音乐的总时长
    currentRate:10,//默认播放速度
    ratetext:"倍速播放",//倍速显示
    volume:5,//音量
    show:false,//弹出层显示
    showindex:null,//初始无点击下标
    showShare:false,//分享面板
    options: [
      [
        { name: '微信', icon: 'wechat' },
        { name: '微博', icon: 'weibo' },
        { name: 'QQ', icon: 'qq' },
      ],
      [
        { name: '复制链接', icon: 'link' },
        { name: '分享海报', icon: 'poster' },
        { name: '二维码', icon: 'qrcode' },
      ],
    ],//分享面板内容
    volumeshow:false,//音量弹出层显示
    ringshow:false,//显示设置铃声
    rateshow:false,//显示音乐倍数
  },
  editduration(duration){
      // 向下取整
      var minute = Math.floor(duration / 60);
      var seconds = duration % 60;
      var showduration = (minute<10?"0"+minute:minute)+":"+(seconds<10?"0"+seconds:seconds);
      return showduration;
  },
  // 返回首页
  backindex(){
    wx.navigateBack({
      delta: 1
    })
  },
  // 样式页面改变
  onActiveChange(event){
    wx.showToast({
      title: `切换到标签 ${event.detail.name}`,
      icon: 'none',
    });
  },
  
  //收藏按钮
  like:function(){
    Toast({
      message: "暂不支持收藏",
      selector: '#custom-selector',
    });
  },

  // 控制音乐播放
  musicplay:function(songindex){
    // 判断点击的是否为当前播放的
    if(this.data.index===songindex){
      // 判断当前音乐播放状态
      if(this.data.playstatus){
        innerAudioContext.pause();
        this.setData({playstatus : false});
      }else{
        innerAudioContext.play();
        this.setData({playstatus : true});
      }
    }else{
      var adminMusic = this.data.adminMusic;
      var musicAddress = adminMusic[songindex].musicAddress;
      innerAudioContext.src = musicAddress;
      // 将点击的传递为当前播放的
      innerAudioContext.play();
      this.setData({
        index : songindex,
        nextplayarr:[],
        playstatus : true
      });
    }
  },
  // 控制音乐上一首播放
  previousplay:function(){
    var that = this;
    var adminMusic = this.data.adminMusic;
    var musiclength = adminMusic.length;
    // 全局播放下标减1
    var index = this.data.index - 1;
    if (index >= 0){
      that.setData({index : index});
    }else{
      that.setData({index : musiclength-1});
    }
    innerAudioContext.src = adminMusic[this.data.index].musicAddress;
    innerAudioContext.play();
    that.setData({playstatus : true});
  },
  // 控制音乐下一首播放
  nextplay:function(){
    var that = this;
    var adminMusic = this.data.adminMusic;
    if(this.data.nextplayarr.length==0){
      var musiclength = adminMusic.length;
      // 全局播放下标加1
      var index = this.data.index + 1;
      if (index < musiclength){
        that.setData({index : index});
      }else{
        that.setData({index : 0});
      }
    }else{
      var nextindex = this.data.nextplayarr.pop();
      that.setData({index : nextindex});
    }
    innerAudioContext.src = adminMusic[this.data.index].musicAddress;
    innerAudioContext.play();
    that.setData({playstatus : true});
  },

  // 点击播放音乐
  playsong:function(songindex){
    // 获取前端点击时传过来的页面
    let index = songindex.currentTarget.dataset.songindex;
    // 调用音乐播放
    this.musicplay(index);
  },
  // 滑动切换音乐
  songchange(e){
  },
  // 添加下一首播放
  nextindexarr(e){
    var songindex = e.currentTarget.dataset.songindex;
    this.data.nextplayarr.splice(0,0,songindex);
    this.onPopupClose();
    Toast.success({
      forbidClick: true,//是否禁止背景点击
      message: '添加至下\n一首播放',
      duration:'500',
      selector: '#custom-selector',
    });
  },
  // 点击音乐列表操作后 弹出Popup弹出层
  moreinfo(e){
    this.setData({
      show:true,
    })
  },
  // 弹出层的关闭
  onPopupClose() {
    this.setData({ show: false });
  },

  //进度条
  onSliderChange:function(e){
    var currentTime;
    // 获取进度条的时间点
    if(e.detail.value){
      currentTime = Math.ceil(e.detail.value);
    }else{
      currentTime = Math.ceil(e.detail);
    }
    //设置播放器从新的时间点开始播放
    innerAudioContext.seek(currentTime);
    // 修改音乐时长格式
    var showcurrentTime = this.editduration(currentTime);
    this.setData({
      currentTime: currentTime,
      showcurrentTime: showcurrentTime
    })
  },
  // 点击设置铃声
  ringsetting(){
    this.setData({ringshow:true})
  },
  // 设置铃声popup关闭
  onRingClose(){
    this.setData({ringshow:false})
  },
  // 点击设置倍速
  playbackRate(){
    this.setData({rateshow:true})
  },
  // 设置倍速显示
  showratetext:function(currentRate){
    if(currentRate==10){
      this.setData({
        currentRate:currentRate,
        ratetext:"倍速播放"
      })
    }else{
      this.setData({
        currentRate:currentRate,
        ratetext:currentRate/10+"倍播放"
      })
    }
  },
  // 设置播放倍速
  onRateChange(e){
    var currentRate = e.detail;
    innerAudioContext.playbackRate = currentRate;
    // 设置倍速显示文字
    this.showratetext(currentRate);
    let eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('backdata', {currentRate: currentRate});
  },
  // 设置倍速popup关闭
  onRateClose(){
    this.setData({rateshow:false})
  },
  // 点击分享后 分享信息层打开
  shareinfo(){
    this.setData({ showShare:true });
  },
  // 分享面板选择后事件
  onShareSelect(event) {
    Toast({
      message: event.detail.name,
      selector: '#custom-selector',
    });
    this.onShareClose();
  },
  //分享面板的关闭
  onShareClose() {
    this.setData({ showShare: false });
  },
  // 提示点赞及按钮提示
  songmsg(e){
    Toast({
      message: e.currentTarget.dataset.message,
      selector: '#custom-selector',
    });
  },
  // 音量设置
  volumepopup(){
    this.setData({ volumeshow: true });
  },
  // volume音量Popup弹出层
  onVolumeClose(){
    this.setData({ volumeshow: false });
  },
  // 音量进度条设置
  onVolumeChange(e){
    var volume = e.detail;
    innerAudioContext.volume = volume/10;
    this.setData({volume:volume})
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
    eventChannel.on('currdata', function(data) {
      innerAudioContext = data.innerAudioContext;//获取传过来的播放器
      var musicnamearr = [];//将歌曲名单独提取出来
      for (var i = 0; i < data.adminMusic.length; i++) {
        musicnamearr.push(data.adminMusic[i].songName);
      }
      // 修改音乐总时长格式
      var showduration = that.editduration(data.duration);
      var showcurrentTime = that.editduration(data.currentTime);
      // 音乐倍速播放文字
      that.showratetext(data.currentRate);
      that.setData({
        adminMusic:data.adminMusic,//adminMusic数据
        musicnamearr:musicnamearr,//歌曲名单
        index:data.index,//当前点击的音乐下标
        nextplayarr:data.nextplayarr,//下一首播放的数组
        duration:data.duration,//音乐的总时长
        showduration:showduration,//总时长格式
        currentTime:data.currentTime,//当前播放的时间
        showcurrentTime:showcurrentTime,//当前播放的时间格式
        volume:data.volume,//音乐的音量
      })
      // 调用音乐播放
      that.musicplay(data.index);
      //监听音乐
      innerAudioContext.onCanplay(() => {
        var duration = innerAudioContext.duration;
        // 经过指定时间之后再执行获取歌曲时长
        setTimeout(()=>{
          // 获取最大歌曲长度
          duration = Math.ceil(innerAudioContext.duration);
          // 修改音乐时长格式
          var showduration = that.editduration(duration);
          that.setData({ 
            duration:duration,
            showduration: showduration 
          })
        },50)
      })
      innerAudioContext.onTimeUpdate(() => {
        var currentTime = Math.ceil(innerAudioContext.currentTime);
        // 修改音乐时长格式
        var showcurrentTime = that.editduration(currentTime);
        that.setData({ 
          currentTime:currentTime,
          showcurrentTime: showcurrentTime 
        })
      })
      //监听音乐自动播放完
      innerAudioContext.onEnded(()=>{
        var adminMusic = that.data.adminMusic;
        if(that.data.nextplayarr.length===0){
          var musiclength = adminMusic.length;
          // 全局播放下标加1
          var index = that.data.index + 1;
          if (index < musiclength){
            that.setData({index : index});
          }else{
            that.setData({index : 0});
          }
        }else{
          var nextindex = that.data.nextplayarr.pop();
          console.log(nextindex);//bug每次进来都会多一次监听
          that.setData({index : nextindex});
        }
      });
    })
    //获取用户信息
    wx.getUserInfo({
      lang:"zh_CN",//返回信息为简体中文
      success: function (res) {
          that.data.userInfo = res.userInfo;
          Toast.clear();
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