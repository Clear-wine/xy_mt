const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    one_1: 5,
    two_1: 0, //产品评价
    one_2: 5,
    two_2: 0, //物流评价
    one_3: 5,
    two_3: 0, //服务评价
    img_arr: [], //上传图片数组
    commentTitle: '非常好',
    commentTitle2: '非常好',
    commentTitle3: '非常好',
    files: [],
    noteMaxLen: 300, // 最多放多少字
    noteNowLen: 0, //备注当前字数
    checktitle: true,
    checked: true,
    idx: 0,
    images: [],
    imageNum: 0,
    imageUploadFlag: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      goodsNoarr: JSON.parse(options.goodsNoarr),
      orderCode: options.orderCode,
      merchantNo: options.merchantNo,
      shopNo: options.shopNo,
      shopType: options.shopType,
      orderType:options.orderType,
      activityNo:options.activityNo
    })
    // 生成图片数组
    this.createimgarr();
  },
  /**根据商品数量生成对应的图片数组*/
  createimgarr() {
    let that = this;
    let img_arr_index = [];
    let fileArr_index = [];
    let star_index = [];

    for (let i = 0; i < that.data.goodsNoarr.length; i++) {
      img_arr_index[i] = [];
      fileArr_index[i] = [];
      star_index[i] = {
        one_1: 5,
        two_1: 0,
        commentTitle: '非常好'
      }
    }
    that.setData({
      img_arr_index: img_arr_index,
      fileArr_index: fileArr_index,
      star_index: star_index,
    })
    console.log(img_arr_index + "====================================================")
  },

  //商品评分
  shangpin_in: function(e) {
    let _this = this;
    var shangpin_in = e.currentTarget.dataset.in;
    let groupindex = e.currentTarget.dataset.groupindex
    let index = e.currentTarget.dataset.index; //点击的星级索引
    let goodsNo = e.currentTarget.dataset.goodsno;
    var one_1;
    var title;
    if (shangpin_in === 'use_sc1') {
      one_1 = Number(e.currentTarget.id);
      if (one_1 == 1) {
        title = '非常差'
      } else if (one_1 == 2) {
        title = '差'
      } else if (one_1 == 3) {
        title = '一般'
      } else if (one_1 == 4) {
        title = '好'
      } else {
        title = '非常好'
      }
    } else {
      one_1 = Number(e.currentTarget.id) + this.data.one_1;
      if (one_1 == 1) {
        title = '非常差'
      } else if (one_1 == 2) {
        title = '差'
      } else if (one_1 == 3) {
        title = '一般'
      } else if (one_1 == 4) {
        title = '好'
      } else {
        title = '非常好'
      }
    }
    _this.data.star_index[groupindex].one_1 = one_1;
    _this.data.star_index[groupindex].two_1 = 5 - one_1;
    _this.data.star_index[groupindex].commentTitle = title;
    this.setData({
      star_index: _this.data.star_index,

    })
    console.log(one_1)
  },
  //卖家服务
  maijia_in: function(e) {
    var shangpin_in = e.currentTarget.dataset.in;
    var one_2;
    var title;
    if (shangpin_in === 'use_sc2') {
      one_2 = Number(e.currentTarget.id);
      if (one_2 == 1) {
        title = '非常差'
      } else if (one_2 == 2) {
        title = '差'
      } else if (one_2 == 3) {
        title = '一般'
      } else if (one_2 == 4) {
        title = '好'
      } else {
        title = '非常好'
      }
    } else {
      one_2 = Number(e.currentTarget.id) + this.data.one_2;
      if (one_2 == 1) {
        title = '非常差'
      } else if (one_2 == 2) {
        title = '差'
      } else if (one_2 == 3) {
        title = '一般'
      } else if (one_2 == 4) {
        title = '好'
      } else {
        title = '非常好'
      }
    }
    this.setData({
      one_2: one_2,
      two_2: 5 - one_2,
      commentTitle2: title

    })
    console.log(one_1)
  },
  //物流服务
  wuliu_in: function(e) {
    var shangpin_in = e.currentTarget.dataset.in;
    var one_3;
    var title;
    if (shangpin_in === 'use_sc3') {
      one_3 = Number(e.currentTarget.id);
      if (one_3 == 1) {
        title = '非常差'
      } else if (one_3 == 2) {
        title = '差'
      } else if (one_3 == 3) {
        title = '一般'
      } else if (one_3 == 4) {
        title = '好'
      } else {
        title = '非常好'
      }
    } else {
      one_3 = Number(e.currentTarget.id) + this.data.one_3;
      if (one_3 == 1) {
        title = '非常差'
      } else if (one_3 == 2) {
        title = '差'
      } else if (one_3 == 3) {
        title = '一般'
      } else if (one_3 == 4) {
        title = '好'
      } else {
        title = '非常好'
      }
    }
    this.setData({
      one_3: one_3,
      two_3: 5 - one_3,
      commentTitle3: title

    })

  },
  // 监听字数
  bindTextAreaChange: function(e) {
    var that = this
    let comment = "comment[" + e.currentTarget.dataset.groupindex + "]"
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      [comment]: value,
      noteNowLen: len
    })
  },

  //选择需要上传的图片控制最多选择9张
  upimg: function(e) {
    var that = this;
    let index = e.currentTarget.dataset.groupindex;
    let goodsNo = e.currentTarget.dataset.goodsno;
    var images = that.data.img_arr_index[index]
    if (images.length < 4) {
      let countNum = 4 - images.length
      wx.chooseImage({
        count: 1, //最多可以选择的图片总数
        sizeType: ['compressed'], //可以指定是原图还是压缩图,默认二者都有
        // sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          const tempFilePaths = res.tempFilePaths;
          let select_img_arr = "select_img_arr[ " + e.currentTarget.dataset.groupindex + "]";
          if (res.tempFilePaths.length != 1) {
            res.tempFilePaths.forEach(el => {
              that.data.img_arr_index[index].push(el);
              // 获取原始图片大小
              wx.getImageInfo({
                src: el,
                success(res) {
                  console.log('获得原始图片大小', res.width);
                  console.log('获得原始图片高度', res.height);
                  var originWidth, originHeight;
                  originWidth = res.width;
                  originHeight = res.height;
                  //压缩比例
                  //最大存限度
                  var maxWidth = 1200,
                    maxHeight = 600;
                  // 目标尺寸
                  var targetWidth = originWidth,
                    targetHeight = originHeight;
                  //等比例压缩,如果宽度大于高度,则宽度优先,否则高度优先
                  if (originWidth > maxWidth || originHeight > maxHeight) {
                    if (originWidth / originHeight > maxWidth / maxHeight) {
                      // 要求宽度*(原生图片比例) = 新图片尺寸
                      targetWidth = maxWidth;
                      targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                    } else {
                      targetHeight = maxHeight;
                      targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                    }
                  }
                  // 更新 canvas 大小
                  that.setData({
                    ch: targetHeight,
                    cw: targetWidth
                  });
                  //尝试压缩文件,创建canvas
                  var ctx = wx.createCanvasContext('firstCanvas');
                  ctx.clearRect(0, 0, targetWidth, targetHeight);
                  ctx.drawImage(el, 0, 0, targetWidth, targetHeight);
                  ctx.draw(false, function() {
                    // 获取新图片输出
                    wx: wx.canvasToTempFilePath({
                      canvasId: 'firstCanvas',
                      success: function(res) {
                        //写入图片数组
                        that.setData({
                          img_arr_index: that.data.img_arr_index,
                        })
                      },
                      fail: function(res) {},

                    }, this)
                  })
                }
              })
            })
          } else {
            // that.data.img_arr_index[index].push(res.tempFilePaths[0]);
            // 获取原始图片大小
            wx.getImageInfo({
              src: res.tempFilePaths[0],
              success(res) {
                console.log('获得原始图片大小', res.width);
                console.log('获得原始图片高度', res.height);
                var originWidth, originHeight;
                originWidth = res.width;
                originHeight = res.height;
                //压缩比例
                //最大存限度
                var maxWidth = 1200,
                  maxHeight = 600;
                // 目标尺寸
                var targetWidth = originWidth,
                    targetHeight = originHeight;
                //等比例压缩,如果宽度大于高度,则宽度优先,否则高度优先
                if (originWidth > maxWidth || originHeight > maxHeight) {
                  if (originWidth / originHeight > maxWidth / maxHeight) {
                    // 要求宽度*(原生图片比例) = 新图片尺寸
                    targetWidth = maxWidth;
                    targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                  } else {
                    targetHeight = maxHeight;
                    targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                  }
                }
                // 更新 canvas 大小
                that.setData({
                  ch: targetHeight,
                  cw: targetWidth
                });
                //尝试压缩文件,创建canvas
                var ctx = wx.createCanvasContext('firstCanvas');
                ctx.clearRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(tempFilePaths[0], 0, 0, targetWidth, targetHeight);
                ctx.draw(false, function() {
                  // 获取新图片输出
                  wx: wx.canvasToTempFilePath({
                    canvasId: 'firstCanvas',
                    success: function(res) {
                      //写入图片数组
                      that.data.img_arr_index[index].push(res.tempFilePath);
                      that.setData({
                        img_arr_index: that.data.img_arr_index,
                        goodsNo: goodsNo,
                        imgUrl: res.tempFilePaths
                      })
                      var param = {
                        userId: wx.getStorageSync('userId') + "",
                        fileType: 1
                      }
                      var jsonStr = JSON.stringify(param);
                      var uploadImgCount = 0;
                      var imgUrl = res.tempFilePath //图片;
                      that.uploadImage(imgUrl, index)
                    },
                    fail: function(res) {},

                  }, this)
                })
              }
            })
          }

          console.log(that.data.img_arr_index, "============================>数组")
          /*********************************************/
          // that.setData({
          //   // img_arr_index: that.data.img_arr_index,
          //   goodsNo: goodsNo,
          //   imgUrl: res.tempFilePaths
          // });
          // var param = {
          //   userId: wx.getStorageSync('userId') + "",
          //   fileType: 1
          // }
          // var jsonStr = JSON.stringify(param);
          // var uploadImgCount = 0;
          // var imgUrl = res.tempFilePaths //图片;
          // for (let i = 0; i < imgUrl.length; i++) {
          //   let imageUrl = imgUrl[i];
          //   that.uploadImage(imageUrl, i + 1, index)
          // }
          /**********************************************************/
          // wx.uploadFile({
          //   // url: 'http://192.168.1.130:4002/imgMultiUpload',
          //   url: 'https://www.yisanmall.com/imgMultiUpload', //请求地址
          //   filePath: imgUrl[i],
          //   name: 'file',
          //   formData: {
          //     'param': jsonStr
          //   },
          //   success: function(res) {
          //     var data = res.data;
          //     var result = JSON.parse(data);
          //     var obj = result.data[0];
          //     var fileArr = that.data.files
          //     if (result.flag) {
          //       var resultObj = {};
          //       resultObj.fileType = obj.fileType;
          //       resultObj.filePath = obj.filePath;
          //       resultObj.thumPath = obj.thumPath;
          //       resultObj.thumWidth = obj.thumWidth;
          //       resultObj.thumHeigh = obj.thumHeigh;
          //       resultObj.goodsNo = goodsNo
          //       if (that.data.fileArr_index.length != 1) {
          //         that.data.fileArr_index[index].push(resultObj);
          //         that.setData({
          //           files: that.data.fileArr_index,
          //         })
          //       } else {
          //         fileArr = that.data.files;
          //         fileArr.push(resultObj);
          //         that.setData({
          //           files: fileArr,
          //         });
          //       }
          //     } else {
          //       that.showModal(res.data.msg);
          //     }
          //     //如果是最后一张,则隐藏等待中  
          //     // if (uploadImgCount == tempFilePaths.length) {
          //     //   wx.hideToast();
          //     // }
          //   },
          //   fail: function(res) {
          //     wx.hideToast();
          //     wx.showModal({
          //       title: '错误提示',
          //       content: '上传图片失败',
          //       showCancel: false,
          //       success: function(res) {}
          //     })
          //   }
          // })
        }
      })
    } else {
      wx.showModal({
        title: '系统提示',
        content: '最多传三张图片!',
      })
    }
  },
  //上传图片到服务器
  // uploadImage: function(imageUrl, imageNo, index) {
    uploadImage: function(imageUrl, index) {
    let that = this;
    console.log(imageUrl);
    // const uploadTask =
      wx.showLoading({
        title: '数据加载中...',
        icon: 'loading'
      })
    wx.uploadFile({
      url: 'https://www.yisanmall.com/imgMultiUpload', //请求地址
      filePath: imageUrl,
      name: 'file',
      success: function(res) {
        wx.hideLoading();
        var data = res.data;
        var result = JSON.parse(data);
        var obj = result.data[0];
        var fileArr = that.data.files
        if (result.flag) {
          var resultObj = {};
          resultObj.fileType = obj.fileType;
          resultObj.filePath = obj.filePath;
          resultObj.thumPath = obj.thumPath;
          resultObj.thumWidth = obj.thumWidth;
          resultObj.thumHeigh = obj.thumHeigh;
          resultObj.goodsNo = that.data.goodsNo
          if (that.data.fileArr_index.length != 1) {
            that.data.fileArr_index[index].push(resultObj);
            that.setData({
              files: that.data.fileArr_index,
            })
          } else {
            fileArr = that.data.files;
            fileArr.push(resultObj);
            that.setData({
              files: fileArr,
            });
          }
        } else {
          that.showModal(res.data.msg);
        }
        //判断最后一张图片上传
        // if (imageNo == that.data.imgUrl.length) {
        //   if (that.data.imageUploadFlag) {
        //     //全部提交成功
        //   } else {
        //     //其中有失败
        //   }
        // }
        //如果是最后一张,则隐藏等待中  
        // if (uploadImgCount == tempFilePaths.length) {
        //   wx.hideToast();
        // }
      },
    })
  },
  //提示框的显示
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    });
  },
  // 预览图片
  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id,
      urls: this.data.files
    })
  },
  //长按图片删除
  deleteImage: function(e) {
    var that = this;
    let groupindex = e.currentTarget.dataset.groupindex
    var images = that.data.img_arr_index;
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    let filesarr = that.data.files
    wx.showModal({
      title: '删除提醒',
      content: '确定要删除此图片吗？',
      success: function(res) {
        if (res.confirm) {
          images[groupindex].splice(index, 1);
          if (that.data.fileArr_index.length != 1) {
            filesarr[groupindex].splice(index, 1)
          } else {
            filesarr.splice(index, 1)
          }
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          img_arr_index: images,
          files: filesarr,
        });
      }
    })
  },
  // 图片删除效果
  closeClick: function(e) {
    
    var that = this;
    var images = that.data.img_arr_index;
    let groupindex = e.currentTarget.dataset.groupindex
    var index = e.currentTarget.dataset.index; //获取当前按图片下标
    let filesarr = that.data.files
    console.log(index)
    wx.showModal({
      title: '系统提醒',
      content: '确定要删除此图片吗？',
      success: function(res) {
        if (res.confirm) {
          images[groupindex].splice(index, 1);
          if (that.data.fileArr_index.length != 1) {
            filesarr[groupindex].splice(index, 1)
          } else {
            filesarr.splice(index, 1)
          }
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          img_arr_index: images,
          files: filesarr,
        });
      }
    })

  },
  checkedTap() {
    this.setData({
      checktitle: !this.data.checktitle,
      checked: !this.data.checked
    })
  },
  /**提交评论*/
  submitBnt() {
    let e = this;
    let data = [];
    let evaobj = {};
    e.data.goodsNoarr.forEach((el, i) => {
      let filesarr = [];
      evaobj = {
        goodsNo: el.goodsNo,
        userId: wx.getStorageSync('userId'),
        orderCode: e.data.orderCode,
        // descScore: e.data.one_1, //产品描述星级分数
        serviceScore: e.data.one_2, //卖家服务星级分数
        logisticScore: e.data.one_3, //物流星级分数
        merchantNo: e.data.merchantNo,
        shopNo: e.data.shopNo,
        shopType: e.data.shopType,
        activityNo:e.data.activityNo,//活动商品编码
        orderType:e.data.orderType //活动商品类型
      }
      //商品描述星级
      if (e.data.star_index.length == 1) {
        evaobj.descScore = e.data.star_index[0].one_1
      } else {
        e.data.star_index.forEach((val, j) => {
          if (j == i) {
            evaobj.descScore = val.one_1
          }
        })
      }
      // 图片
      if (e.data.files == undefined || e.data.files.length == 0) {
        // evaobj.files = ""
      } else {
        if (e.data.goodsNoarr.length == 1) {
          e.data.files.forEach((text, i3) => {
            filesarr.push(text)
          })
        } else {
          e.data.files.forEach((text, i3) => {
            text.forEach(it => {
              if (el.goodsNo == it.goodsNo) {
                filesarr.push(it)
              }
            })
          })
        }
        if (filesarr.length != 0) {
          evaobj.files = filesarr
        }
      }
      // 评论
      if (e.data.comment == undefined) {
        evaobj.content = ""
      } else {
        e.data.comment.forEach((item, i2) => {
          if (i == i2) {
            evaobj.content = item;
          }
        })
      }
      data.push(evaobj)
    })
    if(e.data.activityNo!=0){
      requestUtil.Requests('activity/evaluate/add', data).then((res) => {
        console.log(res)
        if (res.flag) {
          wx.showToast({
            title: '评论成功',
            icon:'success'
          })
          setTimeout(function() {
            var pages = getCurrentPages(); //当前页面
            var beforePage = pages[pages.length - 2]; //前一页
            wx.navigateBack({
              success: function () {
                beforePage.onShow(); // 执行前一个页面的onshow方法
              }
            });
          },1500);
  
        } else {
          console.log('评价失败!!!')
        }
  
      })
    }else{
      requestUtil.Requests('product/addProductEvaluate', data).then((res) => {
        if (res.flag) {
          wx.showToast({
            title: '评论成功',
            icon:'success'
          })
          setTimeout(function() {
            var pages = getCurrentPages(); //当前页面
            var beforePage = pages[pages.length - 2]; //前一页
            wx.navigateBack({
              success: function () {
                beforePage.onShow(); // 执行前一个页面的onshow方法
              }
            });
          },1500);
  
        } else {
          console.log('评价失败!!!')
        }
  
      })
    }   
  }
})