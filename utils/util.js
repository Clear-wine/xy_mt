const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//判断用户是否绑定
function getUserId() {
  const userId = wx.getStorageSync('userId');
  if (!userId) {
    wx.showModal({
      content: '您未绑定手机号，暂无使用权限。请绑定手机号!',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  }
}
//时间倒计时 天时分秒
// function getTimeLeft(datetimeTo, newtime) {
//   let countObj = {};
//   //计算目标与现在时间差(毫秒)
//   let endtime = new Date(datetimeTo).getTime(); //结束时间
//   let nowtime = new Date(newtime).getTime(); //当前时间
//   //如果活动未结束,对时间进行处理
//   if (endtime - nowtime > 0) {
//     let time = (endtime - nowtime);
//     //获取天/时/分/秒
//     let day = Math.floor(time / 1000 / 60 / 60 / 24);
//     let hou = Math.floor(time / 1000 / 60 / 60 % 24);
//     let min = Math.floor(time / 1000 / 60 % 60);
//     let sec = Math.floor(time / 1000 % 60);
//     sec = sec < 10 ? "0" + sec : sec
//     min = min < 10 ? "0" + min : min
//     hou = hou < 10 ? "0" + hou : hou
//     countObj.date = day + "天" + hou + "时" + min + "分" + sec + "秒"
//     countObj.conut_down = 1; //活动未结束
//     return countObj
//   } else { //活动已结束,全部设置为'00'
//     let day = 00;
//     let hou = 00;
//     let min = 00;
//     let sec = 00;
//     countObj.date = day + "天" + hou + "时" + min + "分" + sec + "秒"
//     countObj.conut_down = 0; //活动结束
//     return countObj
//   }
//   //递归每秒调用countTime方法，显示动态时间效果
//   setTimeout(getTimeLeft, 1000);

// }
function getArrayIndex(arr, obj) {
  var arrindex = arr.length;
  while (arrindex--) {
    if (arr[arrindex].checked === obj) {
      return arrindex
    }
  }
  return -1;
}
function getNowArrayIndex(arr, obj) {
  var arrindex = arr.length;
  while (arrindex--) {
    if (arr[arrindex].shopNo === obj) {
      return arrindex
    }
  }
  return -1;
}
module.exports = {
  formatTime: formatTime,
  getUserId: getUserId,
  getArrayIndex: getArrayIndex,
  getNowArrayIndex: getNowArrayIndex
  // getTimeLeft: getTimeLeft
}