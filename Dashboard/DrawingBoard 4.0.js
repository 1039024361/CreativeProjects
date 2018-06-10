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
    createHandlers: function(handlers){
        this._handlers = handlers;
    },
    addHandler: function (type, handler) {
        if(!this._handlers){
            this._handlers = {};
        }
        if(!this._handlers[type]){
            this._handlers[type] = [];
        }
        if(_indexOf(this._handlers[type], handler) === -1 && handler === "function"){
            this._handlers[type].push(handler);
        }

        return this;
    },
    fire: function(type){
        if(!this._handlers&&!this._handlers[type]){
            return;
        }
        var i = null,
            len = this._handlers[type].length,
            arg = Array.prototype.slice(arguments, 1);    //每个handler函数传入参数的方式
        if( this._handlers[type] instanceof Array){
            var handlers = this._handlers[type];
            for(i=0; i<len; i++){
                handlers[i].apply(this, arg);
            }
        }

        return this;
    },
    removeHandler: function(type, handler){
        //不传递任何参数，直接清空事件对象
        if(!type&&!handler){
            this._handlers = {};
        }
        //只传递type参数，清空对应type数组
        if(type&&!handler){
            delete this._handlers[type];
        }

        if(type&&handler){
            if( this._handlers[type] instanceof Array){
                var handlers = this._handlers[type];
                var index = _indexOf(handlers, handler);
                if(index > -1){
                    handlers.splice(index, 1);
                }
            }
        }
    },
    //加入节流机制
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
    }
});

//绘图模块设计
var Drawing = RichBase.extend({
    //在这里注册所有事件，使用观察者模式
    EVENTS:{
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
    //事件绑定及节流处理
    init: function (config) {
        console.log(this._super);
        this._super(config);
        this.canvasBox = document.getElementById("canvasBox");   //canvas
        this.context = this.canvasBox.getContext("2d");
        this.bottomFonts = document.getElementsByClassName("bottom-font");   //坐标显示
        this.createHandlers(this.EVENTS);    //加入到观察者
        this.bind();
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.canvasBox, "mousedown", function (event) {
            self.fire("mousedown", event);
        });
        EventUtil.addHandler(this.canvasBox, "mousemove", function (event) {
            // self.throttle(self.fire, 1).call(self, "mousemove", event);
            self.fire("mousemove", event);
        });
        EventUtil.addHandler(this.canvasBox, "mouseup", function (event) {
            self.fire("mouseup", event);
        });
        EventUtil.addHandler(this.canvasBox, "mouseleave", function (event) {
            self.fire("mouseleave", event);
        });
        EventUtil.addHandler(this.canvasBox, "touchstart", function (event) {
            self.fire("touchstart", event);
        });
        EventUtil.addHandler(this.canvasBox, "touchmove", function (event) {
            self.fire("touchmove", event);
        });
        EventUtil.addHandler(this.canvasBox, "touchend", function (event) {
            self.fire("touchend", event);
        });
    }
});

(function(){
    var drawingModule = new Drawing({
        behavior: "pencil",
        lineWeight: 1,
        color: "black",
        backgroundColor: "white"
    });
})();

var canvasBox = document.getElementById("canvasBox");
var canvasWrap = document.getElementsByClassName("canvas-wrap")[0];
var drawArea = document.getElementById("draw-area");
var ctrlWrapRight = document.getElementsByClassName("ctrl-wrap-right")[0];
var ctrlWrapCorner = document.getElementsByClassName("ctrl-wrap-corner")[0];
var ctrlWrapBottom = document.getElementsByClassName("ctrl-wrap-bottom")[0];
var virtualWrap = document.getElementsByClassName("virtual-wrap")[0];
var bottomFonts = document.getElementsByClassName("bottom-font");

//记录状态的对象
var drawBoardStatus ={
    behavior: "pencil",
    lineWeight: 1,
    color: "black",
    backgroundColor: "white"
};

//初始化
ctrlWrapRight.style.cursor = "e-resize";
ctrlWrapCorner.style.cursor = "nw-resize";
ctrlWrapBottom.style.cursor = "n-resize";
canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
canvasWrap.style.zIndex = 1;

//实时显示绘图区域坐标位置
// function displayCursorPos(x, y){
//     if(x>=0&&y>=0){
//         bottomFonts[0].textContent = `${x}, ${y}像素`;
//     }
//     else{
//         bottomFonts[0].textContent ="";
//     }
// }
//实时显示绘图区域大小
function displaySize(x, y){
    if(x>=0&&y>=0){
        bottomFonts[2].textContent = `${x} × ${y}像素`;
    }
    else{
        bottomFonts[2].textContent ="";
    }
}

//
// if(canvasBox.getContext){
//     var context = canvasBox.getContext("2d");
// }



// function draw(x, y){
//     context.lineWidth = drawBoardStatus.behavior !== "erase"? drawBoardStatus.lineWeight: 8;
//     context.strokeStyle = drawBoardStatus.behavior !== "erase"? drawBoardStatus.color: drawBoardStatus.backgroundColor;
//     context.lineTo(x,y);
//     context.stroke();
// }

//鼠标X坐标转换成绘图区域X坐标
function xConvert(X){
    var bbox = canvasBox.getBoundingClientRect();
    return X -= bbox.left;
}

//鼠标Y坐标转换成绘图区域Y坐标
function yConvert(Y){
    var bbox = canvasBox.getBoundingClientRect();
    // return Y -= 146;
    return Y -= bbox.top;
}
//mousedown、mousemove、mouseup操作函数
// function createMouseEvent(target, func){
//     var ctrlEvent = {
//         flag: false,
//         startXY:[0, 0],
//         middleXY:[0,0],
//         endXY:[0, 0]
//     };
//
//     EventUtil.addHandler(target, "mousedown", func(ctrlEvent));
//     EventUtil.addHandler(target, "mousemove", func(ctrlEvent));
//     EventUtil.addHandler(target, "mouseup", func(ctrlEvent));
//     EventUtil.addHandler(target, "mouseleave", func(ctrlEvent));
//     EventUtil.addHandler(target, "touchstart", func(ctrlEvent));
//     EventUtil.addHandler(target, "touchmove", func(ctrlEvent));
//     EventUtil.addHandler(target, "touchend", func(ctrlEvent));
// }
// //绘图函数
// function drawImg(ctrlEvent) {
//     return function (event) {
//         event = EventUtil.getEvent(event);
//         switch(event.type)
//         {
//             case "mousedown":
//                 console.log(`down`);
//                 ctrlEvent.flag = true;
//                 context.beginPath();
//                 context.moveTo(xConvert(event.clientX), yConvert(event.clientY));
//                 break;
//             case "mousemove":
//                 event.preventDefault();
//                 displayCursorPos(xConvert(event.clientX),  yConvert(event.clientY));
//                 if(ctrlEvent.flag === true){
//                     draw(xConvert(event.clientX), yConvert(event.clientY));
//                 }
//                 break;
//             case "mouseup": case "mouseleave":
//                 console.log(`up`);
//                 displayCursorPos(-1,  -1);
//                 ctrlEvent.flag = false;
//                 break;
//             case "touchstart":
//                 context.beginPath();
//                 context.moveTo(xConvert(event.touches[0].clientX), yConvert(event.touches[0].clientY));
//                 break;
//             case "touchmove":
//                 event.preventDefault();   //阻止滚动
//                 displayCursorPos(xConvert(event.changedTouches[0].clientX),  yConvert(event.changedTouches[0].clientY));
//                 draw(xConvert(event.changedTouches[0].clientX), yConvert(event.changedTouches[0].clientY));
//                 break;
//             case "touchend":
//                 displayCursorPos(-1,  -1);
//                 break;
//             default:
//                 break;
//         }
//     }
// }
//
// createMouseEvent(canvasBox, drawImg);


//拉伸操作只有桌面设备支持，触摸设备不知道拖拽调整画布大小
if(client.system.win||client.system.mac||client.system.x11){
    //定义拉伸画布四周小方框，改变画布大小
//控制拉伸函数
    function ctrlStretch(target, func){
        var ctrlEvent = {
            flag: false,
            startXY:[0, 0],
            middleXY:[0,0],
            endXY:[0, 0]
        };

        EventUtil.addHandler(target, "mousedown", func(ctrlEvent));
        EventUtil.addHandler(document.body, "mousemove", func(ctrlEvent));
        EventUtil.addHandler(document.body, "mouseup", func(ctrlEvent));
        EventUtil.addHandler(document.body, "mouseleave", func(ctrlEvent));
        EventUtil.addHandler(target, "touchstart", func(ctrlEvent));
        EventUtil.addHandler(document.body, "touchmove", func(ctrlEvent));
        EventUtil.addHandler(document.body, "touchend", func(ctrlEvent));
    }

//根据始末坐标重新定义宽、高
    function resizeCanvas(target, ctrlEvent){
        //先保存图像信息
        var imgData = context.getImageData(0, 0, canvasBox.width, canvasBox.height);
        switch(ctrlEvent.source)
        {
            case ctrlWrapRight:
                target.width += (ctrlEvent.endXY[0] - ctrlEvent.startXY[0]);
                break;
            case ctrlWrapBottom:
                target.height += (ctrlEvent.endXY[1] - ctrlEvent.startXY[1]);
                break;
            case ctrlWrapCorner:
                target.width += (ctrlEvent.endXY[0] - ctrlEvent.startXY[0]);
                target.height += (ctrlEvent.endXY[1] - ctrlEvent.startXY[1]);
                break;
        }
        context.putImageData(imgData, 0, 0);   //还原图像
    }

//根据始末坐标重新定义宽、高
    function resizeDiv(target, ctrlEvent){
        target.style.width = target.style.width? target.style.width:target.offsetWidth+"px";
        target.style.height = target.style.height? target.style.height:target.offsetHeight+"px";
        switch(ctrlEvent.source)
        {
            case ctrlWrapRight:
                target.style.width = parseInt(target.style.width) +(ctrlEvent.endXY[0] - ctrlEvent.middleXY[0]) +"px";
                displaySize(parseInt(target.style.width), canvasBox.height);
                break;
            case ctrlWrapBottom:
                target.style.height = parseInt(target.style.height) +(ctrlEvent.endXY[1] - ctrlEvent.middleXY[1]) +"px";
                displaySize(canvasBox.width, parseInt(target.style.height));
                break;
            case ctrlWrapCorner:
                target.style.width = parseInt(target.style.width) +(ctrlEvent.endXY[0] - ctrlEvent.middleXY[0]) +"px";
                target.style.height = parseInt(target.style.height) +(ctrlEvent.endXY[1] - ctrlEvent.middleXY[1]) +"px";
                displaySize(parseInt(target.style.width), parseInt(target.style.height));
                break;
        }
    }

    function stretchAction(ctrlEvent) {
        return function (event) {
            event = EventUtil.getEvent(event);
            var target = EventUtil.getTarget(event);
            // console.log(target);
            if(canvasWrap.style.zIndex !== -1&&ctrlEvent.flag === true){   //使虚线框在最前)
                canvasWrap.style.zIndex = -1;
            }

            switch(event.type)
            {
                case "mousedown": case "touchstart":
                var targetCursor = (target.firstElementChild !==null? target: target.parentNode); //判断点击的是那个元素
                if(targetCursor === ctrlWrapRight||targetCursor === ctrlWrapCorner||targetCursor === ctrlWrapBottom){
                    console.log(event.type);
                    ctrlEvent.flag = true;
                    ctrlEvent.source = targetCursor;
                    ctrlEvent.startXY[0] = ctrlEvent.middleXY[0] = xConvert(event.clientX);
                    ctrlEvent.startXY[1] = ctrlEvent.middleXY[1] = yConvert(event.clientY);
                    console.log(targetCursor);
                    console.log(targetCursor.style.cursor);
                    virtualWrap.style.cursor = targetCursor.style.cursor;
                    console.log(ctrlEvent);
                }
                break;
                case "mousemove": case "touchmove":
                event.preventDefault();
                if(ctrlEvent.flag === true){
                    console.log(event.type);
                    virtualWrap.style.border = "1px dotted black";
                    ctrlEvent.endXY[0] = xConvert(event.clientX);
                    ctrlEvent.endXY[1] = yConvert(event.clientY);
                    resizeDiv(virtualWrap, ctrlEvent);
                    ctrlEvent.middleXY[0] = ctrlEvent.endXY[0];
                    ctrlEvent.middleXY[1] = ctrlEvent.endXY[1];
                }
                break;

                case "mouseup": case "mouseleave": case "touchend":
                if(ctrlEvent.flag === true) {
                    ctrlEvent.flag = false;
                    canvasWrap.style.zIndex = 1;    //使canvas在最前
                    virtualWrap.style.border = "none";
                    virtualWrap.style.cursor = "default";
                    resizeCanvas(canvasBox, ctrlEvent);

                    console.log(ctrlEvent);
                }
                break;
            }
        }
    }

// createMouseEvent(virtualWrap, stretchAction);
    ctrlStretch(ctrlWrapRight, stretchAction);
    ctrlStretch(ctrlWrapCorner, stretchAction);
    ctrlStretch(ctrlWrapBottom, stretchAction);
    displaySize(canvasBox.width, canvasBox.height);
}




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