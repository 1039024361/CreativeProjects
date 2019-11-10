// 基配置，保存了基本的方法
define(['EventUtil'], function(EventUtil) {
    return {
        init: function(config){
            this._config = config;    //保存配置信息
            // this.bind();      //绑定事件处理程序
        },
        set: function(key, value){
            this._config[key] = value;
        },
        get: function(key){
            return this._config[key];
        },
        bind: function(target, type, func){
            var eventTarget = target||document.body;
            EventUtil.addHandler(eventTarget, type, func);
        },
        destroy: function () {
            //去掉所有的监听事件
            // this.removeHandler();
        }
    }
});