/**
 * Created by XING on 2018/5/10.
 */
//组件基对象
var Base = Class.extend({
    init:function(config){
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
        this.removeHandler();
    }
});

//加入观察者模式
var RichBase = Base.extend({
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
        if(_indexOf(target.handlers[type], handler) === -1 && handler === "function"){
            target.handlers[type].push(handler);
        }

        return this;
    },
    fire: function(target, type){
        if(!target.handlers&&!target.handlers[type]){
            return;
        }
        var i = null,
            len = target.handlers[type].length,
            arg = Array.prototype.slice(arguments, 1);    //每个handler函数传入参数的方式
        if( target.handlers[type] instanceof Array){
            var handlers = target.handlers[type];
            for(i=0; i<len; i++){
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
                var index = _indexOf(handlers, handler);
                if(index > -1){
                    handlers.splice(index, 1);
                }
            }
        }
    },
    //加入节流机制(还需要改进)
    throttle: function(func, delay){
        var prev = Date.now(),
            self = this;

        return function () {
            var arg = Array.prototype.slice.call(arguments, 0);
            var now = Date.now();
            if(now-prev >= delay){
                func.apply(self, arg);
                prev = now;
            }
        }
    },
    //坐标转换
    _xConvert: function (X){
        var bbox = this.canvasBox.getBoundingClientRect();
        return X -= bbox.left;
    },
    _yConvert: function (Y){
        var bbox = this.canvasBox.getBoundingClientRect();
        // return Y -= 146;
        return Y -= bbox.top;
    },
    //实时显示绘图区域坐标位置
    _displayCursorPos: function(x, y){
        (x>=0&&y>=0)? this.bottomFonts[0].textContent = `${x}, ${y}像素`: this.bottomFonts[0].textContent ="";
    },
    //实时显示绘图区域大小
    _displaySize: function (x, y){
        (x>=0&&y>=0)? this.bottomFonts[2].textContent = `${x} × ${y}像素`: this.bottomFonts[2].textContent ="";
    },
});

//绘图模块设计
var Drawing = RichBase.extend({
    //在这里注册所有事件，使用观察者模式
    EVENTS:{
        "canvasBox": {
            "mousedown":[
                function(event){
                    event = EventUtil.getEvent(event);
                    console.log(`down`);
                    this._ctrlEvent.flag = true;
                    this.context.beginPath();
                    this.context.moveTo(this._xConvert(event.clientX), this._yConvert(event.clientY));
                }
            ],
            "mousemove":[
                function(event){
                    event = EventUtil.getEvent(event);
                    event.preventDefault();
                    this._displayCursorPos(this._xConvert(event.clientX),  this._yConvert(event.clientY));
                    if(this._ctrlEvent.flag === true){
                        this._draw(this._xConvert(event.clientX), this._yConvert(event.clientY));
                    }
                }
            ],
            "mouseup":[
                function(event){
                    console.log(`up`);
                    this._displayCursorPos(-1,  -1);
                    this._ctrlEvent.flag = false;
                }
            ],
            "mouseleave":[
                function(event){
                    console.log(`up`);
                    this._displayCursorPos(-1,  -1);
                    this._ctrlEvent.flag = false;
                }
            ],
            "touchstart":[
                function(event){
                    event = EventUtil.getEvent(event);
                    this.context.beginPath();
                    this.context.moveTo(this._xConvert(event.touches[0].clientX), this._yConvert(event.touches[0].clientY));
                }
            ],
            "touchmove":[
                function(event){
                    event = EventUtil.getEvent(event);
                    event.preventDefault();   //阻止滚动
                    this._displayCursorPos(this._xConvert(event.changedTouches[0].clientX),  this._yConvert(event.changedTouches[0].clientY));
                    this._draw(this._xConvert(event.changedTouches[0].clientX), this._yConvert(event.changedTouches[0].clientY));
                }
            ],
            "touchend":[
                function(event){
                    this._displayCursorPos(-1,  -1);
                }
            ],
        }
    },
    _ctrlEvent:{
        flag: false,
        startXY:[0, 0],
        middleXY:[0,0],
        endXY:[0, 0]
    },
    //描点函数
    _draw: function(x, y){
    this.context.lineWidth = this.get("behavior") !== "erase"? this.get("lineWeight"): 8;
    this.context.strokeStyle = this.get("behavior") !== "erase"? this.get("color"): this.get("backgroundColor");
    this.context.lineTo(x,y);
    this.context.stroke();
    },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.canvasBox = document.getElementById("canvasBox");   //canvas
        this.context = this.canvasBox.getContext("2d");
        this.bottomFonts = document.getElementsByClassName("bottom-font");   //坐标显示
        this.canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
        this.createHandlers(this.canvasBox, this.EVENTS["canvasBox"]);    //加入到观察者
        this.bind();
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.canvasBox, "mousedown", function (event) {
            self.fire(self.canvasBox, "mousedown", event);
        });
        EventUtil.addHandler(this.canvasBox, "mousemove", function (event) {
            // self.throttle(self.fire, 1).call(self, "mousemove", event);
            self.fire(self.canvasBox, "mousemove", event);
        });
        EventUtil.addHandler(this.canvasBox, "mouseup", function (event) {
            self.fire(self.canvasBox, "mouseup", event);
        });
        EventUtil.addHandler(this.canvasBox, "mouseleave", function (event) {
            self.fire(self.canvasBox, "mouseleave", event);
        });
        EventUtil.addHandler(this.canvasBox, "touchstart", function (event) {
            self.fire(self.canvasBox, "touchstart", event);
        });
        EventUtil.addHandler(this.canvasBox, "touchmove", function (event) {
            self.fire(self.canvasBox, "touchmove", event);
        });
        EventUtil.addHandler(this.canvasBox, "touchend", function (event) {
            self.fire(self.canvasBox, "touchend", event);
        });
    }
});


//调整绘图区域模块设计
var Stretch = RichBase.extend({
    //在这里注册所有事件，使用观察者模式
    EVENTS:{
        "target":{
            "mousedown":[
                function(event){
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event);
                    if(this.canvasWrap.style.zIndex !== -1&&this._ctrlEvent.flag === true){   //使虚线框在最前)
                        this.canvasWrap.style.zIndex = -1;
                    }
                    var targetCursor = (target.firstElementChild !==null? target: target.parentNode); //判断点击的是那个元素
                    if(targetCursor === this.ctrlWrapRight||targetCursor === this.ctrlWrapCorner||targetCursor === this.ctrlWrapBottom){
                        this._ctrlEvent.flag = true;
                        this._ctrlEvent.source = targetCursor;
                        this._ctrlEvent.startXY[0] = this._ctrlEvent.middleXY[0] = this._xConvert(event.clientX);
                        this._ctrlEvent.startXY[1] = this._ctrlEvent.middleXY[1] = this._yConvert(event.clientY);
                        console.log(targetCursor);
                        console.log(targetCursor.style.cursor);
                        this.virtualWrap.style.cursor = targetCursor.style.cursor;
                    }
                }
            ],
        },
        "body": {
            "mousemove":[
                function(event){
                    event = EventUtil.getEvent(event);
                    if (this.canvasWrap.style.zIndex !== -1 && this._ctrlEvent.flag === true) {   //使虚线框在最前)
                        this.canvasWrap.style.zIndex = -1;
                    }
                    event.preventDefault();
                    if(this._ctrlEvent.flag === true){
                        this.virtualWrap.style.border = "1px dotted black";
                        this._ctrlEvent.endXY[0] = this._xConvert(event.clientX);
                        this._ctrlEvent.endXY[1] = this._yConvert(event.clientY);
                        this.resizeDiv(this.virtualWrap, this._ctrlEvent);
                        this._ctrlEvent.middleXY[0] = this._ctrlEvent.endXY[0];
                        this._ctrlEvent.middleXY[1] = this._ctrlEvent.endXY[1];
                    }
                }
            ],
            "mouseup":[
                function(event){
                    if (this.canvasWrap.style.zIndex !== -1 && this._ctrlEvent.flag === true) {   //使虚线框在最前)
                        this.canvasWrap.style.zIndex = -1;
                    }
                if(this._ctrlEvent.flag === true) {
                        this._ctrlEvent.flag = false;
                        this.canvasWrap.style.zIndex = 1;    //使canvas在最前
                        this.virtualWrap.style.border = "none";
                        this.virtualWrap.style.cursor = "default";
                        this.resizeCanvas(canvasBox, this._ctrlEvent);
                        console.log(this._ctrlEvent);
                    }
                }
            ],
            "mouseleave":[
                function(event){
                    if (this.canvasWrap.style.zIndex !== -1 && this._ctrlEvent.flag === true) {   //使虚线框在最前)
                        this.canvasWrap.style.zIndex = -1;
                    }
                    if(this._ctrlEvent.flag === true) {
                        this._ctrlEvent.flag = false;
                        this.canvasWrap.style.zIndex = 1;    //使canvas在最前
                        this.virtualWrap.style.border = "none";
                        this.virtualWrap.style.cursor = "default";
                        this.resizeCanvas(canvasBox, this._ctrlEvent);
                        console.log(this._ctrlEvent);
                    }
                }
            ],
        }
    },
    _ctrlEvent:{
        flag: false,
        startXY:[0, 0],
        middleXY:[0,0],
        endXY:[0, 0]
    },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.body = document.body;
        this.canvasBox = document.getElementById("canvasBox");   //canvas
        this.context = this.canvasBox.getContext("2d");
        this.bottomFonts = document.getElementsByClassName("bottom-font");   //坐标显示
        this.canvasWrap = document.getElementsByClassName("canvas-wrap")[0];
        this.ctrlWrapRight = document.getElementsByClassName("ctrl-wrap-right")[0];
        this.ctrlWrapCorner = document.getElementsByClassName("ctrl-wrap-corner")[0];
        this.ctrlWrapBottom = document.getElementsByClassName("ctrl-wrap-bottom")[0];
        this.virtualWrap = document.getElementsByClassName("virtual-wrap")[0];
        this.createHandlers(this.body, this.EVENTS["body"]);               //加入到观察者
        this.createHandlers(this.ctrlWrapRight, this.EVENTS["target"]);    //加入到观察者，3个对象事件处理程序都一样
        //初始化
        this.ctrlWrapRight.style.cursor = "e-resize";
        this.ctrlWrapCorner.style.cursor = "nw-resize";
        this.ctrlWrapBottom.style.cursor = "n-resize";
        this.canvasWrap.style.zIndex = 1;
        this.bind();
        this._displaySize(this.canvasBox.width, this.canvasBox.height);
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.ctrlWrapRight, "mousedown", function (event) {
            self.fire(self.ctrlWrapRight, "mousedown", event);
        });
        EventUtil.addHandler(this.ctrlWrapCorner, "mousedown", function (event) {
            self.fire(self.ctrlWrapRight, "mousedown", event);
        });
        EventUtil.addHandler(this.ctrlWrapBottom, "mousedown", function (event) {
            self.fire(self.ctrlWrapRight, "mousedown", event);
        });

        EventUtil.addHandler(this.body, "mousemove", function (event) {
            // self.throttle(self.fire, 1).call(self, "mousemove", event);
            self.fire(self.body, "mousemove", event);
        });
        EventUtil.addHandler(this.body, "mouseup", function (event) {
            self.fire(self.body, "mouseup", event);
        });
    },
    resizeCanvas: function (target, ctrlEvent) {
        //先保存图像信息
        var imgData = this.context.getImageData(0, 0, this.canvasBox.width, this.canvasBox.height);
        switch (ctrlEvent.source) {
            case this.ctrlWrapRight:
                target.width += (ctrlEvent.endXY[0] - ctrlEvent.startXY[0]);
                break;
            case this.ctrlWrapBottom:
                target.height += (ctrlEvent.endXY[1] - ctrlEvent.startXY[1]);
                break;
            case this.ctrlWrapCorner:
                target.width += (ctrlEvent.endXY[0] - ctrlEvent.startXY[0]);
                target.height += (ctrlEvent.endXY[1] - ctrlEvent.startXY[1]);
                break;
        }
        this.context.putImageData(imgData, 0, 0);   //还原图像
    },
    resizeDiv: function (target, ctrlEvent){
        target.style.width = target.style.width? target.style.width:target.offsetWidth+"px";
        target.style.height = target.style.height? target.style.height:target.offsetHeight+"px";
        switch(ctrlEvent.source)
        {
            case this.ctrlWrapRight:
                target.style.width = parseInt(target.style.width) +(ctrlEvent.endXY[0] - ctrlEvent.middleXY[0]) +"px";
                this._displaySize(parseInt(target.style.width), this.canvasBox.height);
                break;
            case this.ctrlWrapBottom:
                target.style.height = parseInt(target.style.height) +(ctrlEvent.endXY[1] - ctrlEvent.middleXY[1]) +"px";
                this._displaySize(this.canvasBox.width, parseInt(target.style.height));
                break;
            case this.ctrlWrapCorner:
                target.style.width = parseInt(target.style.width) +(ctrlEvent.endXY[0] - ctrlEvent.middleXY[0]) +"px";
                target.style.height = parseInt(target.style.height) +(ctrlEvent.endXY[1] - ctrlEvent.middleXY[1]) +"px";
                this._displaySize(parseInt(target.style.width), parseInt(target.style.height));
                break;
        }
    }
});

(function(){
    var drawingModule = new Drawing({
        behavior: "pencil",
        lineWeight: 1,
        color: "black",
        backgroundColor: "white"
    });

    //拉伸操作只有桌面设备支持，触摸设备不知道拖拽调整画布大小
    if(client.system.win||client.system.mac||client.system.x11){
        var StretchModule = new Stretch();
    }
})();




//工具栏添加事件处理程序
var tool = document.getElementById("tool");
var pencil = document.getElementById("pencil");
var erase = document.getElementById("erase");
var toolImgWrap = document.querySelectorAll(".tool-wrap-img");

function toolEventHandle(event){
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event),
        handleTarget, i,
        len = toolImgWrap.length;

    if(target.childElementCount){
        handleTarget = target;
    }
    else{
        handleTarget = target.parentNode;
    }
    console.log(`tool的target:`);
    console.log(target);
    console.log(`tool的handleTarget:`);
    console.log(handleTarget);

    for(i=0; i<len; i++){
        toolImgWrap[i].classList.contains("selected")? toolImgWrap[i].classList.remove("selected"):"";
    }

    switch (handleTarget.id)
    {
        case "pencil":
            console.log("pencil");
            if(!pencil.classList.contains("selected")){
                canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
                pencil.classList.toggle("selected");
                drawBoardStatus.behavior = "pencil";
            }
            break;
        case "erase":
            console.log("erase");
            if(!erase.classList.contains("selected")){
                canvasBox.style.cursor = "url(images/erase.gif) 0 20, auto";
                erase.classList.toggle("selected");
                drawBoardStatus.behavior = "erase";
            }
            break;
    }
}

EventUtil.addHandler(tool, "click", toolEventHandle);
EventUtil.addHandler(tool, "touchstart", toolEventHandle);


//双击折叠菜单栏
var topMenu = document.getElementById("top-menu");
var menu = document.getElementById("menu");

EventUtil.addHandler(topMenu, "click", function(event){
    event = EventUtil.getEvent(event);
    event.preventDefault();
    console.log("双击");
    if(menu.style.display === "none"){
        menu.style.display = "block";
        drawArea.style.top = "139px";
        console.log(drawArea.style.top);
    }
    else{
        menu.style.display = "none" ;
        drawArea.style.top = "29px";
        console.log(drawArea.style.top);
    }
});


//线型选择
var lineWeightDrop = document.getElementById("drop-line-weight");
var lineWeightWrap = document.getElementById("line-weight-wrap");
var lineWraps = document.querySelectorAll(".drop-line-wrap");

EventUtil.addHandler(lineWeightWrap, "touchstart", function(event){
    lineWeightDrop.style.display === "display"? lineWeightDrop.style.display = "none":"display";
});

EventUtil.addHandler(lineWeightDrop, "click", function(event){
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);
    var actualTarget = target.firstElementChild? target: target.parentNode;

    if(actualTarget.className === "drop-line-wrap"){
        lineWraps[drawBoardStatus.lineWeight-1].classList.toggle("selected");
        lineWraps[parseInt(actualTarget.id)-1].classList.toggle("selected");
        drawBoardStatus.lineWeight = parseInt(actualTarget.id);
    }
});

//颜色选择处理
var colorSetButtons = document.querySelectorAll(".color-1");
var colorBoxes = document.querySelectorAll(".color-box");
var colorBoxContainer = document.getElementsByClassName("color-box-container")[0];
var fontColor = document.getElementsByClassName("font-color")[0];
var backgroundColor = document.getElementsByClassName("background-color")[0];

EventUtil.addHandler(colorSetButtons[0], "click", function(event){
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);

    if(!colorSetButtons[0].classList.contains("selected")){
        colorSetButtons[0].classList.toggle("selected");
        colorSetButtons[1].classList.toggle("selected");
    }
});

EventUtil.addHandler(colorSetButtons[1], "click", function(event){
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);

    if(!colorSetButtons[1].classList.contains("selected")){
        colorSetButtons[0].classList.toggle("selected");
        colorSetButtons[1].classList.toggle("selected");
    }
});

EventUtil.addHandler(colorBoxContainer, "click", function(event){
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);
    var actualTarget = (target.childElementCount === 0 && target.className === "color-box")? target: target.firstElementChild;

    if(actualTarget.style.backgroundColor){
        if(!colorSetButtons[0].classList.contains("selected")){
            backgroundColor.style.backgroundColor = actualTarget.style.backgroundColor;
            drawBoardStatus.backgroundColor = actualTarget.style.backgroundColor;
        }
        else{
            fontColor.style.backgroundColor = actualTarget.style.backgroundColor;
            drawBoardStatus.color = actualTarget.style.backgroundColor;
        }
    }
});

// var image = document.createElement("img");
var image = document.getElementById("imgContainer");

//支持拖放图片
function handleDragEvent(event){
    var info = "",
        files,
        reader = new FileReader();

    EventUtil.preventDefault(event);

    if (event.type === "dragenter"){
        // canvasWrap.style.zIndex = 1;    //使canvas在最前
    }
    else if (event.type === "drop"){
        files = event.dataTransfer.files;
        console.log(files[0]);


        //只读取第一个图片
        if(/image/.test(files[0].type)){
            reader.readAsDataURL(files[0]);
            reader.onload = function () {
                // var image = document.createElement("img");
                // image.style.display = "none";
                image.src = reader.result;
                console.log(image);
                document.body.appendChild(image);
                image.onload = function() {
                    context.drawImage(image, 0, 0);
                };
            };
        }
        else{
            console.log("请传入一幅图片");
        }
        
    }
    else if(event.type === "dragover"){
        // canvasWrap.style.zIndex = -1;    //使虚线框在最前
    }
}

EventUtil.addHandler(canvasBox, "dragenter", handleDragEvent);
EventUtil.addHandler(canvasBox, "dragover", handleDragEvent);
EventUtil.addHandler(canvasBox, "drop", handleDragEvent);

//提示框
var getReminder = document.getElementById("get-reminder");
var reminder = document.getElementById("reminder");

console.log(reminder);

EventUtil.addHandler(getReminder, "click", function(event){
    console.log(reminder);
    reminder.style.display = "none";
});