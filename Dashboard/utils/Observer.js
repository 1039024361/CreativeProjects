// 实现观察者模式的基本逻辑
define(['tools'], function (tools) {
    return {
        createHandlers: function(target, handlers){
            target.handlers = handlers;
        },
        addHandler: function (target, type, handler) {
            if(!target.handlers){
                target.handlers = {};
            }
            if(!target.handlers[type]){
                target.handlers[type] = [];
            }
            if(tools._indexOf(target.handlers[type], handler) === -1 && typeof handler === "function"){
                // console.log('addHandler', handler)
                target.handlers[type].push(handler);
            }

            return this;
        },
        //注意，不允许同一个对象之间相互动态删除handler
        fire: function(target, type){
            var that = this;
            if(!(target.handlers&&target.handlers[type])){
                return;
            }
            // console.log(target.id);
            // console.log(type);
            var i = null,
                len = target.handlers[type].length,
                arg = Array.prototype.slice.call(arguments, 2)||[];    //每个handler函数传入参数的方式
            if( target.handlers[type] instanceof Array){
                var handlers = target.handlers[type];
                // console.log(handlers);
                for(i=0; i<len; i++){
                    // console.log(i);
                    // console.log(handlers[i]);
                    handlers[i].apply(this, arg);
                }
            }
            return this;
        },
        removeHandler: function(target, type, handler){
            //不传递任何参数，直接清空事件对象
            if(!type&&!handler){
                target.handlers = {};
            }
            //只传递type参数，清空对应type数组
            if(type&&!handler){
                delete target.handlers[type];
            }

            if(type&&handler){
                if( target.handlers[type] instanceof Array){
                    var handlers = target.handlers[type];
                    var index = tools._indexOf(handlers, handler);
                    if(index > -1){
                        // console.log('removeHandler', handler)
                        handlers.splice(index, 1);
                    }
                }
            }
        },
    }
})