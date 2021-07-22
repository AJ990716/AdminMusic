// miniprogram/pages/index/index.js
// 导入Toast轻提示
import Toast from '@vant/weapp/toast/toast';
// 导入Dialog弹出框
import Dialog from '@vant/weapp/dialog/dialog';
// 导入消息通知
import Notify from '@vant/weapp/notify/notify';
const db = wx.cloud.database();//获取数据库
const innerAudioContext = wx.createInnerAudioContext();//创建音频
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,//当前页面下标
    userInfo:null,//个人信息
    carousel:[
      "cloud://aj-0716-nax47.616a-aj-0716-nax47-1301306489/example1149.jpg",
      "cloud://aj-0716-nax47.616a-aj-0716-nax47-1301306489/example1361.jpg",
      "cloud://aj-0716-nax47.616a-aj-0716-nax47-1301306489/example5785.jpg",
      "cloud://aj-0716-nax47.616a-aj-0716-nax47-1301306489/example1681.jpg"
    ],//轮播图数据
    firsttip:true,//第一次提示
    adminMusic:[],//adminMusic数据
    playstatus:false,//播放状态
    index:null,//全局播放下标
    nextplayarr:[],//下一首播放的数组
    duration:0,//音乐的总时长
    currentTime:0,//正在播放的时间
    volume:5,//音乐的音量
    currentRate:10,//默认播放速度为10
    showindex:null,//初始无点击下标
    show:false,//弹出层显示
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
    musicshow:false,//音乐信息弹出层显示
    images: [],    //获取上传的图片地址
    getSongName:"",     //获取输入的歌名
    getSingerName:"",   //获取歌手名
    getmusicAddress:"", //获取音乐地址
    musicAddressPass:true,//音乐地址格式是否通过
  },

  // 自定义导航栏
  onChange(event) {
    // event.detail 的值为当前选中项的索引
    this.setData({ active: event.detail });
  },

  // 控制音乐播放
  musicplay:function(songindex){
    var adminMusic = this.data.adminMusic;
    var musicAddress = adminMusic[songindex].musicAddress;
    innerAudioContext.src = musicAddress;
    innerAudioContext.volume=0.5;
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
      // 将点击的传递为当前播放的
      innerAudioContext.play();
      this.setData({
        index : songindex,
        nextplayarr:[],
        playstatus : true
      });
    }
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
      var nextindex = this.data.nextplayarr[this.data.nextplayarr.length-1];
      that.setData({index : nextindex});
    }
    innerAudioContext.src = adminMusic[this.data.index].musicAddress;
    innerAudioContext.play();
    that.setData({playstatus : true});
  },
  // 点击播放音乐
  playsong(e){
    var that = this;
    var songindex = e.currentTarget.dataset.songindex;
    // 调用音乐播放
    this.musicplay(songindex);
    //监听音乐自动播放完
    innerAudioContext.onEnded((res) => {
      if(that.data.firsttip){
        console.log("音乐播放完毕")
        that.setData({firsttip : false});
        // 调用下一首播放
        that.nextplay();
        setTimeout(function(){
          that.setData({firsttip : true});
        },1)
      }
    })
    //监听音乐出错
    innerAudioContext.onError((res) => {
      if(that.data.firsttip){
        that.setData({firsttip : false});
        Toast.loading({
          forbidClick: true,//是否禁止背景点击
          message: '音乐错误3秒后播放下一首',
          selector: '#custom-selector',
        });
        setTimeout(function(){
          // 调用下一首音乐播放
          that.nextplay();
          Toast.clear();
          that.setData({firsttip : true});
        },3000)
      }
    })
    //监听音乐
    innerAudioContext.onCanplay(() => {
      var duration = innerAudioContext.duration;
      // 经过指定时间之后再执行获取歌曲时长
      setTimeout(()=>{
        // 获取最大歌曲长度
        duration = Math.ceil(innerAudioContext.duration);
        that.setData({ duration:duration })
      },50)
    })
    innerAudioContext.onTimeUpdate(() => {
      var currentTime = Math.ceil(innerAudioContext.currentTime);
      that.setData({ currentTime:currentTime })
    })
  },
  // 添加下一首播放
  nextindexarr(e){
    var songindex = e.currentTarget.dataset.songindex;
    var nextplayarr = this.data.nextplayarr;
    nextplayarr.splice(0,0,songindex);
    this.setData({ nextplayarr:nextplayarr })
    this.onPopupClose();
    Toast.success({
      forbidClick: true,//是否禁止背景点击
      message: '添加至下\n一首播放',
      duration:'500',
      selector: '#custom-selector',
    });
  },
  // 点击跳转到音乐播放主页
  inmusicindex(e){
    var that = this;
    this.playsong(e);
    var nextplayarr;//点击时是否清楚下一首播放数组
    if(this.data.index===e.currentTarget.dataset.songindex){
      nextplayarr = this.data.nextplayarr;
    }else{ nextplayarr = []; }
    var data = {
      innerAudioContext:innerAudioContext,//创建的音乐播放器
      adminMusic:this.data.adminMusic,//adminMusic数据
      index:e.currentTarget.dataset.songindex,//当前点击的音乐下标
      nextplayarr:nextplayarr,//下一首播放的数组
      duration:this.data.duration,//音乐的总时长
      currentTime:this.data.currentTime,//当前播放的时间
      volume:this.data.volume,//音乐的音量
      currentRate:this.data.currentRate//音乐播放速度为10
    }
    wx.navigateTo({
      url: '../musicIndex/musicIndex',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        // 修改音乐播放速度的回调
        backdata: function(data) {
          that.setData({currentRate:data.currentRate})
        }
      },
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('currdata', data)
      }
    })
  },
  // 点击修改音乐
  editmusic(e){
    var that = this;
    var songindex = e.currentTarget.dataset.songindex;
    var songId = e.currentTarget.dataset.dataid
    var musicobj = {
      images: [{
        url:this.data.adminMusic[songindex].logoImageId,
      }],
      getSongName:this.data.adminMusic[songindex].songName,
      getSingerName:this.data.adminMusic[songindex].singerName,
      getmusicAddress:this.data.adminMusic[songindex].musicAddress,
      index:this.data.adminMusic[songindex].index,
      songId:songId
    };
    wx.navigateTo({
      url: '../editmusic/editmusic',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        someEvent: function(data) {
          // 如果更新数据成功 则刷新数据
          if(data.status){
            //成功过后刷新页面
            db.collection('adminMusic').get().then(res => {
              // Promise 风格调用
              that.setData({
                adminMusic: res.data
              })
              console.log("数据刷新");
            })
          }
        }
      },
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', musicobj)
      }
    })
  },
  // 点击删除音乐
  delmusic(e){
    var that = this;
    Dialog.confirm({
      title: '删除文件',
      message: '删除云文件后不可恢复',
      theme:'round-button'
    }).then(() => {
      // on confirm 执行删除
      Toast.loading({
        forbidClick: true,//是否禁止背景点击
        message: '正在删除...',
        selector: '#custom-selector',
      });
      var songindex = e.currentTarget.dataset.songindex;
      var dataid = e.currentTarget.dataset.dataid;
      db.collection('adminMusic').doc(dataid).remove({
        success: function (res) {
          console.log(res)
          //成功过后刷新页面
          db.collection('adminMusic').get().then(res => {
            // Promise 风格调用
            that.setData({
              adminMusic: res.data
            })
            if(that.data.index===songindex){
              that.setData({ index: null })
              innerAudioContext.stop();
            }else if(that.data.index>songindex){
              var newindex = that.data.index-1;
              that.setData({ index: newindex })
            }
            console.log("数据刷新");
            Toast.success({
              forbidClick: true,//是否禁止背景点击
              message: '删除成功',
              duration:'500',
              selector: '#custom-selector',
            });
          })
        }
      })
    }).catch(() => {
      // on cancel
    });
  },

  // 点击更多信息操作后 弹出Popup弹出层
  moreinfo(e){
    var songindex = e.currentTarget.dataset.songindex;
    this.setData({
      show:true,
      showindex:songindex
    })
  },
  // 弹出层的关闭
  onPopupClose() {
    this.setData({ show: false });
  },
  // 点击音乐信息后 音乐信息弹出层打开
  musicinfoshow(){
    this.onPopupClose();
    this.setData({ musicshow: true });
  },
  // 音乐信息弹出层的关闭
  onMusicInfoClose(){
    this.setData({ musicshow: false });
  },
  // 点击分享后 分享信息层打开
  shareinfo(){
    this.onPopupClose();
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
  // 点击不感兴趣后 提示框
  badmusic(){
    this.onPopupClose();
    Dialog.alert({
      message: '建议自行修改音乐，或联系管理员进行修改',
      theme: 'round-button',
    }).then(() => {
      // on close
    });
  },

  // 添加音乐界面
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
      images: images
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
    if(e.detail==''){
      this.setData({musicAddressPass:true})
    }
  },
  // 数据上传至数据库的方法
  insetdatabase:function(dataObj){
    var that = this;
    db.collection("adminMusic").add({
      data:{
        logoImageId: dataObj.logoImageId,
        songName: dataObj.songName,
        singerName: dataObj.singerName,
        musicAddress: dataObj.musicAddress,
        adminname: dataObj.adminname,
        index: dataObj.index
      },
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        Toast.success({
          forbidClick: true,//是否禁止背景点击
          message: '上传成功3秒后返回主页',
          duration:'3000',
          selector: '#custom-selector',
        });
        //成功过后刷新页面
        db.collection('adminMusic').get().then(res => {
          // Promise 风格调用
          that.setData({
            adminMusic: res.data
          })
          console.log("数据刷新");
        })
        setTimeout(function(){
          that.setData({
            active:0,
            images:[],
            getSongName: "",
            getSingerName: "",
            getmusicAddress: "",
          })
        },3000)
      }
    })
  },
  // 上传data的方法
  insetmusicdata:function(dataObj){
    var that = this;
    // 需要获取当前音乐数据的最大下标 下标用于命名 保证其命名不会重复
    var index;
    // 如果音乐数据长度为零 就无法获取当前音乐数据的最大下标
    if(dataObj.datalength===0){
      // 所以设置命名从0开始
      index=0;
      console.log("【记录为空的时候下一个的下标】"+index);
      wx.cloud.uploadFile({
        cloudPath: 'example' + index + '.jpg',
        filePath: dataObj.imagesUrl, // 文件路径
        success: res => {
          // get resource ID
          dataObj["logoImageId"]=res.fileID;
          dataObj["index"]=index;
          //将上传图片存入数据库
          that.insetdatabase(dataObj);
        },
        fail: err => {
          // handle error
        }
      })
    }else{
      var lengthindex = this.data.adminMusic[dataObj.datalength-1].index;
      index = lengthindex+1;
      console.log("【记录不为空的时候下一个的下标】"+index);
      wx.cloud.uploadFile({
        cloudPath: 'example' + index + '.jpg',
        filePath: dataObj.imagesUrl, // 文件路径
        success: res => {
          // get resource ID
          dataObj["logoImageId"]=res.fileID;
          dataObj["index"]=index;
          //将上传图片存入数据库
          that.insetdatabase(dataObj);
        },
        fail: err => {
          // handle error
        }
      })
    }
  },
  //提交/上传音乐
  submit: function () {
    var images = this.data.images;
    var getSongName = this.data.getSongName;
    var getSingerName = this.data.getSingerName;
    var musicAddressPass = this.data.musicAddressPass;
    var getmusicAddress = this.data.getmusicAddress;
    var adminname = this.data.userInfo.nickName;
    var pass = (adminname != "" && images != [] && getSongName != "" && getSingerName != "" && getmusicAddress!=""&& musicAddressPass);
    if(pass){
      Toast.loading({
        forbidClick: true,//是否禁止背景点击
        message: '正在上传...',
        selector: '#custom-selector',
        duration:0
      });
      // 获取当前数据的长度
      var datalength = this.data.adminMusic.length;
      var dataObj = {
        imagesUrl:images[0].url,
        songName:getSongName,
        singerName:getSingerName,
        musicAddress:getmusicAddress,
        adminname:adminname,
        datalength:datalength
      };
      // 调用上传data的方法
      this.insetmusicdata(dataObj);
    }else{
      this.onClickIcon();
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  getMySql:function(){
    var that = this;
    wx.request({
      url: 'http://localhost:8080/plus/query',
      data:{
        key:"fuck",
        me:"文毅",
        her:"阿夹"
      },
      method:"GET",
      dataType:"json",
      responseType:"text",
      success:function(result){
        console.log(result);
      }
    })
  },
  onLoad: function (options) {
    this.getMySql();
    var that = this;
    Toast.loading({
      forbidClick: true,//是否禁止背景点击
      message: '加载中...',
      selector: '#custom-selector',
    });
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
    db.collection('adminMusic').get().then(res => {
      // Promise 风格调用
      that.setData({
        adminMusic: res.data
      })
      console.log("获取数据环节");
      Toast.clear();
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
    innerAudioContext.pause();
    this.data.playstatus = false;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    innerAudioContext.stop();
    this.data.playstatus = false;
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