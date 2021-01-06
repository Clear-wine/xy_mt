//跳转到底部菜单
const tab_to = function (url) {
  wx.switchTab({
    url: url,
  })
};
//跳转到单个页面
const go_to = function (url) {
  wx.navigateTo({
    url: url
  })
}
//返回上一个页面，
const back = function (num) {
  wx.navigateBack({
    delta: num > 1 ? num : 1
  })
}
const close_to = function(url){
  wx.redirectTo({
    url: url
  })
}
// 消息提醒
const toast = function (text, type, time) {
  if (!text) { return; }
  wx.hideLoading()
  wx.showToast({
    title: text,
    icon: type ? type : 'none',
    duration: time ? time : 2000
  })
}
//拨打电话
const tel = function (num) {
  if (!num) { toast('电话号码为空'); }
  console.log(num)
  wx.makePhoneCall({
    phoneNumber: num //填写电话号码
  })
}
//复制到剪切板
const copy = function (text) {
  if (!text) { toast('复制内容不能为空'); return; }
  wx.setClipboardData({
    data: text,
    success(res) { }
  })
}

//获取缓存数据
const get_sg = function (key, type) {
  let d = null;
  var key_d = wx.getStorageSync(key);
  if (!key_d) {
    d = null;
    return d;
  }
  if (type == 'json') {
    d = JSON.parse(key_d);
  } else {
    d = key_d;
  }
  return d;
}
//设置缓存数据
const set_sg = function (key, data, type) {
  let d = '';
  if (type == 'json') {
    d = JSON.stringify(data)
  } else {
    d = data;
  }
  wx.setStorage({
    key: key,
    data: d
  })
}
//清除特定键值缓存数据
const remove_sg = function (key) {
  wx.removeStorage({
    key: key,
    success(res) {
      console.log(res)
    }
  })
}
//清除所有缓存数据
const clear_sg = function () {
  wx.clearStorage();
}

module.exports = {
  tab_to: tab_to,
  go_to: go_to,
  close_to: close_to,
  toast: toast,
  back: back,
  copy: copy,
  tel: tel,
  get_sg: get_sg,
  set_sg: set_sg,
  remove_sg: remove_sg,
  clear_sg: clear_sg,
}
