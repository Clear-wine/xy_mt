/***
 * 请求util的封装 调用方法:util.Requests().then((res) =>{})
 * 进行业务逻辑处理 res:为返回的结果集
 * 
 */
const app = getApp(); //引用app.js
const md5_ = require("md5.js");
const random = require("random.js");
var pageSize = 10;
var page = 1;
var hasMoreData = false;

function Requests_p(url, obj){
  var timestamp = Date.parse(new Date());
  var obj_ = JSON.stringify(obj), v = "v250", time = timestamp, merchantId = "123456", noStr = random.getRandom(10,"0");
  var key = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAMxgs97JuPuYuiD1ComdQYKQmQJI6qGMXHj5nF91CTTvI5zpNRr/TWZoMcX/LwkCYRL9zhyMvcKlnzVWjhSV27WU33Xf2qaiuh6ih9dx+7ehATlw2WUQSNsbZboU2svGONrTmAqOrn5d73kXq+67n6F3R7KnFifjQSoFwx9uZwaTAgMBAAECgYEAkJu/yVxMAeFfmWAok5RsPNjZGq/DLIknCQX8qeIioIywUx8DT1XjSxlgVmsnuaUwUIK66qJ+xhHwI4pZv6EFMiMxyH/thpyJw4S9n03XeRMwendklQFBf5Jc64zb27NBWQeMrwO/sm1yWoMb5fBl1U9P2UtVc6tLLSt2xkO4r3kCQQDk41yisr9w04OWcMq6IuSP3R8qxZj1K/ULby+dqlQ+39n0/GA6C1oJ4HOHCXfPnzbfxDcicMshibB2DPRsVJB/AkEA5JYbAdG/7nD/f7svZBw/yEPMf7rKXidEel278A6d0GcYnVgSiWwVRGGRPc+Z+JtLpF1p+lfNV3G5T4+8BHI/7QJATEsw9JZqU5xdT0cXfAXnc8C8A9DLlGVrj70m/QHqhO6uwwdgt9hS0dn8CDXytsUWUG4iBpvcSbiQljjpPDbP1wJBAIBQElDvIMIEBCf7NxsHEHamOEDq5XX8rN/Thg+25Ld7Z8HLEny5gyajbhg4VMHMyqU1GqxAZS/U0qTqliwYxfECQQDctgHsq5pZpgzD1FB56TylMTiRpF2j4RMPREQmgmqht/ZQeVjABhtI9LfZIEjE158cj5U/e+6jEJWkNN+IwtpB"
  key = key + time;
  // var key = '123456' + time;

  var signStr =  'merchantId=' + merchantId + '&noStr=' + noStr + "&params=" + obj_ + '&time=' + time + '&v=' + v;
  var signStr_ = signStr + '&key=' + key;
  var sign = md5_.md5(signStr_);

  var json = {
    params: obj,
    accessToken: {
      tokenId: "4D3BEB97-3B13-4AB2-9CF5-714B06C7144E",
      deviceId: "123"
    },
    sign: sign,
    v: v,
    merchantId: merchantId,
    time: time,
    noStr: noStr,
  }
  var jsonStr = JSON.stringify(json);

  return new Promise((resolv, reject) => {
    wx.request({
      url: app.globalData.requestPath + url+'/v250',
      data: jsonStr,
      method: "POST",
      header: {
        'Content-Type': 'application/json',
        'Client-Type': 'mobile/wxapp'
      },
      success: function(res) {
        console.log(res);
        if (res.data.flag) {
          resolv(res.data)
        } else {
          resolv(res.data)
          if(url!='order/refund/queryRefundDetail'){
            wx.showModal({
              title: res.data.msg
            })
          }
        }
      },
      fail: function(err) {
        reject(err)
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '网络错误或服务器繁忙!',
        })
      }
    })
  })
}

//参数为字符串时
function Requests(url, obj) {
  // var json = {
  //   data: obj,
  //   accessToken: {
  //     tokenId: "4D3BEB97-3B13-4AB2-9CF5-714B06C7144E",
  //     deviceId: "123"
  //   }
  // }
  var timestamp = Date.parse(new Date());
  var obj_ = JSON.stringify(obj), v = "v250", time = timestamp, merchantId = "123456", noStr = random.getRandom(10,"0");
  var key = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAMxgs97JuPuYuiD1ComdQYKQmQJI6qGMXHj5nF91CTTvI5zpNRr/TWZoMcX/LwkCYRL9zhyMvcKlnzVWjhSV27WU33Xf2qaiuh6ih9dx+7ehATlw2WUQSNsbZboU2svGONrTmAqOrn5d73kXq+67n6F3R7KnFifjQSoFwx9uZwaTAgMBAAECgYEAkJu/yVxMAeFfmWAok5RsPNjZGq/DLIknCQX8qeIioIywUx8DT1XjSxlgVmsnuaUwUIK66qJ+xhHwI4pZv6EFMiMxyH/thpyJw4S9n03XeRMwendklQFBf5Jc64zb27NBWQeMrwO/sm1yWoMb5fBl1U9P2UtVc6tLLSt2xkO4r3kCQQDk41yisr9w04OWcMq6IuSP3R8qxZj1K/ULby+dqlQ+39n0/GA6C1oJ4HOHCXfPnzbfxDcicMshibB2DPRsVJB/AkEA5JYbAdG/7nD/f7svZBw/yEPMf7rKXidEel278A6d0GcYnVgSiWwVRGGRPc+Z+JtLpF1p+lfNV3G5T4+8BHI/7QJATEsw9JZqU5xdT0cXfAXnc8C8A9DLlGVrj70m/QHqhO6uwwdgt9hS0dn8CDXytsUWUG4iBpvcSbiQljjpPDbP1wJBAIBQElDvIMIEBCf7NxsHEHamOEDq5XX8rN/Thg+25Ld7Z8HLEny5gyajbhg4VMHMyqU1GqxAZS/U0qTqliwYxfECQQDctgHsq5pZpgzD1FB56TylMTiRpF2j4RMPREQmgmqht/ZQeVjABhtI9LfZIEjE158cj5U/e+6jEJWkNN+IwtpB"
  key = key + time;
  // var key = '123456'+time;
  var signStr =  'merchantId=' + merchantId + '&noStr=' + noStr + "&params=" + obj_ + '&time=' + time + '&v=' + v;
  var signStr_ = signStr + '&key=' + key;
  var sign = md5_.md5(signStr_);
  // console.log(signStr,sign);
  var json = {
    params: obj,
    accessToken: {
      tokenId: "4D3BEB97-3B13-4AB2-9CF5-714B06C7144E",
      deviceId: "123"
    },
    sign: sign,
    v: v,
    merchantId: merchantId,
    time: time,
    noStr: noStr,
  }
  var jsonStr = JSON.stringify(json);
  return new Promise((resolv, reject) => {
    // wx.showLoading({
    //   title: '数据加载中...',
    //   icon: 'loading'
    // })
    wx.request({
      url: app.globalData.requestPath + url+'/v247',
      data: jsonStr,
      method: "POST",
      header: {
        'Content-Type': 'application/json',
        'Client-Type': 'mobile/wxapp'
      },

      success: function(res) {
        console.log(url)
        //wx.hideLoading();
        if (res.data.flag) {
          resolv(res.data)
        } else {
          resolv(res.data)
          if(url!='order/refund/queryRefundDetail'){
            wx.showModal({
              title: res.data.msg
            })
          }
        }
      },
      fail: function(err) {
        reject(err)
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '网络错误或服务器繁忙!',
        })
      }
    })
  })
}
//参数为json时
function Requests_json(url, obj) {
  return new Promise((resolve, reject) => {
    // wx.showLoading({
    //   title: '数据加载中...',
    //   icon: 'loading'
    // })
    wx.request({
      url: app.globalData.requestPath + url+'/v247',
      data: obj,
      method: "POST",
      header: {
        'Content-Type': 'application/json',
        'Client-Type': 'mobile/wxapp'
      },
      success: function(res) {
        if (res.data.flag) {
          //wx.hideLoading()
          resolve(res.data.data)
        } else {
          wx.showModal({
            title: res.data.msg
          })
        }
      },
      fail: function(err) {
        wx.hideLoading()
        reject(err)
        wx.showModal({
          title: '提示',
          content: '网络错误或服务器繁忙!',
        })
      }
    })
  })
}
//分页请求封装
function Requests_page(url, obj, contentlist) {
  console.log('11111111111',contentlist);
  var contentlistTem = contentlist;
  return new Promise((resolv, reject) => {
    // wx.showLoading({
    //   title: '数据加载中...',
    //   icon: 'loading'
    // })
    var json = {
      v : "v2473",
      params: obj
    }
    var jsonStr = JSON.stringify(json)
    wx.request({
      url: app.globalData.requestPath + url+'/v247', //点击下一步请求的接口
      method: 'POST',
      data: jsonStr,
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      success: function(res) {
        //console.log(res)
        //wx.hideLoading()
        if (res.data.flag) {
          // var contentlistTem = contentlist
          //console.log('测试分页数据' + contentlistTem)
          if (res.statusCode == 200) {
            if (obj.page == 1) {
              contentlistTem = []
            }
            var contentlist = res.data.data.data;
            if (contentlist.length >= res.data.data.count) {
              contentlist = contentlistTem.concat(contentlist);
              page = obj.page
              var result = {
                data: contentlist,
                pageParam: {
                  hasMoreData: false,
                  page:page
                },
                count:res.data.data.count,
                resdata: res.data.data

              }
              resolv(result);
            } else {
              contentlist = contentlistTem.concat(contentlist),
                page = obj.page + 1;
              var result = {
                data: contentlist,
                pageParam: {
                  hasMoreData: true,
                  page: page
                },
                count: res.data.data.count,
                resdata: res.data.data
              }
              resolv(result);
            }
          } else {
            wx.showToast({
              title: res.data.msg,
            })
          }
        } else {
          wx.showToast({
            title: '暂无数据',
            icon:'none'
          })
        }
      }
    })
  })
}
// 浏览记录分页请求
function Requests_page_both(url,obj,contentlist){
  var contentlistTem = contentlist;
  return new Promise((resolv, reject) => {
    wx.showLoading({
      title: '数据加载中...',
      icon: 'loading'
    })
    var json = {
      v:"v2473",
      params: obj,
      accessToken: {
        tokenId: "4D3BEB97-3B13-4AB2-9CF5-714B06C7144E",
        deviceId: "123"
      }
    }
    var jsonStr = JSON.stringify(json)
    wx.request({
      url: app.globalData.requestPath + url+'/v247', //点击下一步请求的接口
      method: 'POST',
      data: {
        param: jsonStr
      },
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.flag) {
          // var contentlistTem = contentlist
          console.log('测试分页数据' + contentlistTem)
          if (res.statusCode == 200) {
            if (obj.page == 1) {
              contentlistTem = []
            }
            var contentlist = res.data.data.rows;
            if (contentlist.length >= res.data.data.total) {
              contentlist = contentlistTem.concat(contentlist);
              page = obj.page
              var result = {
                data: contentlist,
                pageParam: {
                  hasMoreData: false,
                  page: page
                },
                count: res.data.data.total
              }
              resolv(result);
            } else {
              contentlist = contentlistTem.concat(contentlist),
                page = Number(obj.page) + 1;
              var result = {
                data: contentlist,
                pageParam: {
                  hasMoreData: true,
                  page: page
                },
                count: res.data.data.total

              }
              resolv(result);
            }
          } else {
            wx.showToast({
              title: res.data.msg,
            })
          }
        } else {
          wx.showToast({
            title: '加载数据失败!',
          })
        }
      }
    })
  })
}


function Requests_page1(url, obj, contentlist) {
  console.log('11111111111',contentlist);
  var obj_ = JSON.stringify(obj), timestamp = Date.parse(new Date()), v = "v250", time = timestamp,merchantId = "123456",noStr = random.getRandom(10,"0");
  var key = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAMxgs97JuPuYuiD1ComdQYKQmQJI6qGMXHj5nF91CTTvI5zpNRr/TWZoMcX/LwkCYRL9zhyMvcKlnzVWjhSV27WU33Xf2qaiuh6ih9dx+7ehATlw2WUQSNsbZboU2svGONrTmAqOrn5d73kXq+67n6F3R7KnFifjQSoFwx9uZwaTAgMBAAECgYEAkJu/yVxMAeFfmWAok5RsPNjZGq/DLIknCQX8qeIioIywUx8DT1XjSxlgVmsnuaUwUIK66qJ+xhHwI4pZv6EFMiMxyH/thpyJw4S9n03XeRMwendklQFBf5Jc64zb27NBWQeMrwO/sm1yWoMb5fBl1U9P2UtVc6tLLSt2xkO4r3kCQQDk41yisr9w04OWcMq6IuSP3R8qxZj1K/ULby+dqlQ+39n0/GA6C1oJ4HOHCXfPnzbfxDcicMshibB2DPRsVJB/AkEA5JYbAdG/7nD/f7svZBw/yEPMf7rKXidEel278A6d0GcYnVgSiWwVRGGRPc+Z+JtLpF1p+lfNV3G5T4+8BHI/7QJATEsw9JZqU5xdT0cXfAXnc8C8A9DLlGVrj70m/QHqhO6uwwdgt9hS0dn8CDXytsUWUG4iBpvcSbiQljjpPDbP1wJBAIBQElDvIMIEBCf7NxsHEHamOEDq5XX8rN/Thg+25Ld7Z8HLEny5gyajbhg4VMHMyqU1GqxAZS/U0qTqliwYxfECQQDctgHsq5pZpgzD1FB56TylMTiRpF2j4RMPREQmgmqht/ZQeVjABhtI9LfZIEjE158cj5U/e+6jEJWkNN+IwtpB"
  key = key + time;
  var signStr =  'merchantId=' + merchantId + '&noStr=' + noStr + "&params=" + obj_ + '&time=' + time + '&v=' + v;
  var signStr_ = signStr + '&key=' + key;
  var sign = md5_.md5(signStr_);

  var json = {
    params: obj,
    accessToken: {
      tokenId: "4D3BEB97-3B13-4AB2-9CF5-714B06C7144E",
      deviceId: "123"
    },
    sign: sign,
    v: v,
    merchantId: merchantId,
    time: time,
    noStr: noStr,
  }
  var jsonStr = JSON.stringify(json);

  var contentlistTem = contentlist;
  return new Promise((resolv, reject) => {
    // wx.showLoading({
    //   title: '数据加载中...',
    //   icon: 'loading'
    // })
    // var json = {
    //   v : "v2473",
    //   params: obj
    // }
    // var jsonStr = JSON.stringify(json)
    wx.request({
      url: app.globalData.requestPath + url+'/v250', //点击下一步请求的接口
      method: 'POST',
      data: jsonStr,
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      success: function(res) {
        //console.log(res)
        //wx.hideLoading()
        if (res.data.flag) {
          // var contentlistTem = contentlist
          //console.log('测试分页数据' + contentlistTem)
          if (res.statusCode == 200) {
            if (obj.page == 1) {
              contentlistTem = []
            }
            var contentlist = res.data.data.data;
            if (contentlist.length >= res.data.data.count) {
              contentlist = contentlistTem.concat(contentlist);
              page = obj.page
              var result = {
                data: contentlist,
                pageParam: {
                  hasMoreData: false,
                  page:page
                },
                count:res.data.data.count,
                resdata: res.data.data

              }
              resolv(result);
            } else {
              contentlist = contentlistTem.concat(contentlist),
                page = obj.page + 1;
              var result = {
                data: contentlist,
                pageParam: {
                  hasMoreData: true,
                  page: page
                },
                count: res.data.data.count,
                resdata: res.data.data
              }
              resolv(result);
            }
          } else {
            wx.showToast({
              title: res.data.msg,
            })
          }
        } else {
          wx.showToast({
            title: '暂无数据',
            icon:'none'
          })
        }
      }
    })
  })
}


module.exports = {
  Requests, 
  Requests_json,
  Requests_page,
  Requests_page_both,
  Requests_p,
  Requests_page1
}