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
        // this.removeHandler();
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


//创建一个保存配置信息的对象
var drawingInfo = new Base({
    behavior: "pencil",
    lineWeight: 1,
    color: "black",
    backgroundColor: "white"
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
            //drag事件用于拖放图片
            "dragenter":[
                function(event){
                    event = EventUtil.getEvent(event);
                    EventUtil.preventDefault(event);
                }
            ],
            "drop":[
                function(event){
                    event = EventUtil.getEvent(event);
                    EventUtil.preventDefault(event);
                    var files,
                        reader = new FileReader();
                    files = event.dataTransfer.files;
                    console.log(files[0]);

                    //只读取第一个图片
                    if(/image/.test(files[0].type)){
                        reader.readAsDataURL(files[0]);
                        reader.onload = function () {
                            this.image.src = reader.result;
                            console.log(this.image);
                            // document.body.appendChild(image);
                            this.image.onload = function() {
                                this._resizeCanvasBox(this.canvasBox, this.image.width, this.image.height);
                                this.context.drawImage(this.image, 0, 0);
                            }.bind(this);
                        }.bind(this);
                    }
                    else{
                        console.log("请传入一幅图片");
                    }
                }
            ],
            "dragover":[
                function(event){
                    event = EventUtil.getEvent(event);
                    EventUtil.preventDefault(event);
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
    this.context.lineWidth = drawingInfo.get("behavior") !== "erase"? drawingInfo.get("lineWeight"): 8;
    this.context.strokeStyle = drawingInfo.get("behavior") !== "erase"? drawingInfo.get("color"): drawingInfo.get("backgroundColor");
    this.context.lineTo(x,y);
    this.context.stroke();
    },
    _resizeCanvasBox: function(target, width, height){
        //先保存图像信息
        var imgData = target.getContext("2d").getImageData(0, 0, target.width, target.height);
        if(!target){
            return null;
        }
        if(typeof width === "number"){
            target.width = width;
        }
        if(typeof height === "number"){
            target.height = height;
        }
        target.getContext("2d").putImageData(imgData, 0, 0);   //还原图像
    },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.canvasBox = document.getElementById("canvasBox");   //canvas
        this.context = this.canvasBox.getContext("2d");
        this.bottomFonts = document.getElementsByClassName("bottom-font");   //坐标显示
        this.image = document.getElementById("imgContainer");
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
        //拖放图片事件
        EventUtil.addHandler(this.canvasBox, "dragenter", function (event) {
            self.fire(self.canvasBox, "dragenter", event);
        });
        EventUtil.addHandler(this.canvasBox, "drop", function (event) {
            self.fire(self.canvasBox, "drop", event);
        });
        EventUtil.addHandler(this.canvasBox, "dragover", function (event) {
            self.fire(self.canvasBox, "dragover", event);
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


//调整绘图区域模块设计
var Tool = RichBase.extend({
    //在这里注册所有事件，使用观察者模式
    EVENTS:{
        "tool":{
            "click":[
                function(event){
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event),
                        handleTarget, i,
                        len = this.toolImgWrap.length;

                    handleTarget = target.childElementCount? target:target.parentNode;

                    for(i=0; i<len; i++){
                        this.toolImgWrap[i].classList.contains("selected")? this.toolImgWrap[i].classList.remove("selected"):"";
                    }

                    switch (handleTarget.id)
                    {
                        case "pencil":
                            console.log("pencil");
                            if(!this.pencil.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
                                this.pencil.classList.toggle("selected");
                                drawingInfo.set("behavior", "pencil");
                            }
                            break;
                        case "erase":
                            console.log("erase");
                            if(!this.erase.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/erase.gif) 0 20, auto";
                                this.erase.classList.toggle("selected");
                                drawingInfo.set("behavior", "erase");
                            }
                            break;
                    }
                }
            ],
        },
    },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.tool = document.getElementById("tool");
        this.pencil = document.getElementById("pencil");
        this.erase = document.getElementById("erase");
        this.toolImgWrap = document.querySelectorAll(".tool-wrap-img");
        this.canvasBox = document.getElementById("canvasBox");   //canvas
        this.canvasWrap = document.getElementsByClassName("canvas-wrap")[0];
        this.createHandlers(this.tool, this.EVENTS["tool"]);               //加入到观察者
        //初始化
        this.canvasWrap.style.zIndex = 1;
        this.bind();
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.tool, "click", function (event) {
            self.fire(self.tool, "click", event);
        });
        EventUtil.addHandler(this.tool, "touchstart", function (event) {
            self.fire(self.tool, "click", event);   //与click事件处理函数一直
        });
    },
});

//线型选择
var Line = RichBase.extend({
    //在这里注册所有事件，使用观察者模式
    EVENTS:{
        "lineWeightDrop": {
            "click": [
                function (event) {
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event);
                    var actualTarget = target.firstElementChild ? target : target.parentNode;

                    if (actualTarget.className === "drop-line-wrap") {
                        this.lineWraps[drawingInfo.get('lineWeight') - 1].classList.toggle("selected");
                        this.lineWraps[parseInt(actualTarget.id) - 1].classList.toggle("selected");
                        drawingInfo.set('lineWeight', parseInt(actualTarget.id));
                    }
                }
            ],
        },
        "lineWeightWrap": {
            "touchstart": [
                function (event) {
                    this.lineWeightDrop.style.display === "display" ? this.lineWeightDrop.style.display = "none" : "display";
                }
            ],
        }
        },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.lineWeightDrop = document.getElementById("drop-line-weight");
        this.lineWeightWrap = document.getElementById("line-weight-wrap");
        this.lineWraps = document.querySelectorAll(".drop-line-wrap");
        this.createHandlers(this.lineWeightDrop, this.EVENTS["lineWeightDrop"]);               //加入到观察者
        this.createHandlers(this.lineWeightWrap, this.EVENTS["lineWeightWrap"]);               //加入到观察者
        //初始化
        this.bind();
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.lineWeightDrop, "click", function (event) {
            self.fire(self.lineWeightDrop, "click", event);
        });
        EventUtil.addHandler(this.lineWeightWrap, "touchstart", function (event) {
            self.fire(self.lineWeightWrap, "touchstart", event);   //与click事件处理函数一直
        });
    },
});

//颜色选择
var Color = RichBase.extend({
    //在这里注册所有事件，使用观察者模式
    EVENTS:{
        "colorSetButtons[0]": {
            "click": [
                function (event) {
                    if(!this.colorSetButtons[0].classList.contains("selected")){
                        this.colorSetButtons[0].classList.toggle("selected");
                        this.colorSetButtons[1].classList.toggle("selected");
                    }
                }
            ],
        },
        "colorSetButtons[1]": {
            "click": [
                function (event) {
                    if(!this.colorSetButtons[1].classList.contains("selected")){
                        this.colorSetButtons[0].classList.toggle("selected");
                        this.colorSetButtons[1].classList.toggle("selected");
                    }
                }
            ],
        },
        "colorBoxContainer": {
            "click": [
                function (event) {
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event);
                    var actualTarget = (target.childElementCount === 0 && target.className === "color-box")? target: target.firstElementChild;

                    if(actualTarget.style.backgroundColor){
                        if(!this.colorSetButtons[0].classList.contains("selected")){
                            this.backgroundColor.style.backgroundColor = actualTarget.style.backgroundColor;
                            drawingInfo.set("backgroundColor", actualTarget.style.backgroundColor);
                        }
                        else{
                            this.fontColor.style.backgroundColor = actualTarget.style.backgroundColor;
                            drawingInfo.set("color", actualTarget.style.backgroundColor);
                        }
                    }
                }
            ],
        },
    },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.colorSetButtons = document.querySelectorAll(".color-1");
        this.colorBoxContainer = document.getElementsByClassName("color-box-container")[0];
        this.fontColor = document.getElementsByClassName("font-color")[0];
        this.backgroundColor = document.getElementsByClassName("background-color")[0];
        this.createHandlers(this.colorSetButtons[0], this.EVENTS["colorSetButtons[0]"]);               //加入到观察者
        this.createHandlers(this.colorSetButtons[1], this.EVENTS["colorSetButtons[1]"]);               //加入到观察者
        this.createHandlers(this.colorBoxContainer, this.EVENTS["colorBoxContainer"]);
        //初始化
        this.bind();
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.colorSetButtons[0], "click", function (event) {
            self.fire(self.colorSetButtons[0], "click", event);
        });
        EventUtil.addHandler(this.colorSetButtons[1], "click", function (event) {
            self.fire(self.colorSetButtons[1], "click", event);   //与click事件处理函数一直
        });
        EventUtil.addHandler(this.colorBoxContainer, "click", function (event) {
            self.fire(self.colorBoxContainer, "click", event);   //与click事件处理函数一直
        });
    },
});

//拖拽图片
var DragPic = RichBase.extend({
    //在这里注册所有事件，使用观察者模式
    EVENTS:{
        "colorSetButtons[0]": {
            "click": [
                function (event) {
                    if(!this.colorSetButtons[0].classList.contains("selected")){
                        this.colorSetButtons[0].classList.toggle("selected");
                        this.colorSetButtons[1].classList.toggle("selected");
                    }
                }
            ],
        },
        "colorSetButtons[1]": {
            "click": [
                function (event) {
                    if(!this.colorSetButtons[1].classList.contains("selected")){
                        this.colorSetButtons[0].classList.toggle("selected");
                        this.colorSetButtons[1].classList.toggle("selected");
                    }
                }
            ],
        },
        "colorBoxContainer": {
            "click": [
                function (event) {
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event);
                    var actualTarget = (target.childElementCount === 0 && target.className === "color-box")? target: target.firstElementChild;

                    if(actualTarget.style.backgroundColor){
                        if(!this.colorSetButtons[0].classList.contains("selected")){
                            this.backgroundColor.style.backgroundColor = actualTarget.style.backgroundColor;
                            drawingInfo.set("backgroundColor", actualTarget.style.backgroundColor);
                        }
                        else{
                            this.fontColor.style.backgroundColor = actualTarget.style.backgroundColor;
                            drawingInfo.set("color", actualTarget.style.backgroundColor);
                        }
                    }
                }
            ],
        },
    },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.colorSetButtons = document.querySelectorAll(".color-1");
        this.colorBoxContainer = document.getElementsByClassName("color-box-container")[0];
        this.fontColor = document.getElementsByClassName("font-color")[0];
        this.backgroundColor = document.getElementsByClassName("background-color")[0];
        this.createHandlers(this.colorSetButtons[0], this.EVENTS["colorSetButtons[0]"]);               //加入到观察者
        this.createHandlers(this.colorSetButtons[1], this.EVENTS["colorSetButtons[1]"]);               //加入到观察者
        this.createHandlers(this.colorBoxContainer, this.EVENTS["colorBoxContainer"]);
        //初始化
        this.bind();
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.colorSetButtons[0], "click", function (event) {
            self.fire(self.colorSetButtons[0], "click", event);
        });
        EventUtil.addHandler(this.colorSetButtons[1], "click", function (event) {
            self.fire(self.colorSetButtons[1], "click", event);   //与click事件处理函数一直
        });
        EventUtil.addHandler(this.colorBoxContainer, "click", function (event) {
            self.fire(self.colorBoxContainer, "click", event);   //与click事件处理函数一直
        });
    },
});

(function(){
    var drawingModule = new Drawing(
        // {
        // behavior: "pencil",
        // lineWeight: 1,
        // color: "black",
        // backgroundColor: "white"}
        );

    //拉伸操作只有桌面设备支持，触摸设备不知道拖拽调整画布大小
    if(client.system.win||client.system.mac||client.system.x11){
        var StretchModule = new Stretch();
    }
    var tool = new Tool();
    var line = new Line();
    var colorSelect = new Color();
})();

//双击折叠菜单栏
// var topMenu = document.getElementById("top-menu");
// var menu = document.getElementById("menu");
//
// EventUtil.addHandler(topMenu, "click", function(event){
//     event = EventUtil.getEvent(event);
//     event.preventDefault();
//     console.log("双击");
//     if(menu.style.display === "none"){
//         menu.style.display = "block";
//         drawArea.style.top = "139px";
//         console.log(drawArea.style.top);
//     }
//     else{
//         menu.style.display = "none" ;
//         drawArea.style.top = "29px";
//         console.log(drawArea.style.top);
//     }
// });


//提示框
var getReminder = document.getElementById("get-reminder");
var reminder = document.getElementById("reminder");

console.log(reminder);

EventUtil.addHandler(getReminder, "click", function(event){
    console.log(reminder);
    reminder.style.display = "none";
});