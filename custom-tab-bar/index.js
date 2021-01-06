// components/custom-tab-bar/index.js
var requestUtil = require('../utils/requestUtil.js')
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    selected: 0, //当前tabbar页面
    color: "#7A7E83", //未选中tabbar时的文字颜色
    selectedColor: "#3cc51f", //添加发布图标
    list: []
  },
  lifetimes: {
    attached() {
      this.setData({
        list: app.globalData.list
      })
    }

  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    }
  }
})