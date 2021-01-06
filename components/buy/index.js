// components/buy/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hideBuy:{
      type:Boolean,
      value:true
    },
    partData:Object
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
// 隐藏商品弹框
    hideModal: function(e){
      if(e.target.dataset.target == 'self')
       this.setData({
         hideBuy:true
       })
    }
  }
})
