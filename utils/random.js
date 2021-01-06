// random.js

const charts = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function getRandom(length,type) { //length:随机长度, type:随机类型
  var result = '';
  if('0'=== type){ //数字字母混合
    for(var i=0;i<length;i++){
      var index = parseInt(Math.floor(Math.random() * charts.length + 0))//随机数组长度索引
      result+=charts[index]
    }
  }else{//纯数字
    for(var i=0;i<length;i++){
      var index = parseInt(Math.floor(Math.random() * 10 + 0))
      result+=charts [index]
    }
  }
  return result;
}

module.exports = {
  getRandom:getRandom
}