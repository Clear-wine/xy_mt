// components/activity-status/activity-status.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      //初始值
      value:''//属性初始值(可选),如果未指定则会根绝类型选择一个
    },
    showDialog:{
      type:Boolean,
      vaule:true
    },
    iscomplete:{ //是否成团
      type: Number
    },
    conut_down:{ //活动时间
      type: Number
    },
    joinActivity:{
      type:Boolean,
      value:true
    }

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
      /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    handleStatus:function(){ //查看订单
      //触发回调
      this.triggerEvent("handleStatus");
    }

  }
})
