/**
 * Created by XING on 2018/5/10.
 */
var debug = 0;

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
        if(_indexOf(target.handlers[type], handler) === -1 && typeof handler === "function"){
            target.handlers[type].push(handler);
        }

        return this;
    },
    fire: function(target, type){
        var that = this;
        if(!target.handlers&&!target.handlers[type]){
            return;
        }
        var i = null,
            len = target.handlers[type].length,
            arg = Array.prototype.slice.call(arguments, 2)||[];    //每个handler函数传入参数的方式
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
        (x>=0&&y>=0)? this.bottomFonts[0].textContent = `${Math.round(x)}, ${Math.round(y)}像素`: this.bottomFonts[0].textContent ="";
    },
    //实时显示绘图区域大小
    _displaySize: function (x, y){
        (x>=0&&y>=0)? this.bottomFonts[2].textContent = `${Math.round(x)} × ${Math.round(y)}像素`: this.bottomFonts[2].textContent ="";
    },
});


//创建一个保存配置信息的对象
var drawingInfo = new Base({
    behavior: "pencil",
    lineWeight: 1,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    canvasW: 800,
    canvasH: 600,
    gain: 1   //图形放大系数
});

//创建一个获取canvasBox坐标的对象
// var PositionInfo = RichBase.extend({
//     //在这里注册所有事件，使用观察者模式
//     EVENTS:{
//         "canvasBox": {
//             "mousedown": [
//                 function (event) {
//                     event = EventUtil.getEvent(event);
//                     this.set("X", this._xConvert(event.clientX));
//                     this.set("Y", this._yConvert(event.clientY));
//                 }
//             ],
//             "mousemove": [
//                 function (event) {
//                     event = EventUtil.getEvent(event);
//                     event.preventDefault();
//                     this.set("X", this._xConvert(event.clientX));
//                     this.set("Y", this._yConvert(event.clientY));
//                 }
//             ],
//             "touchstart": [
//                 function (event) {
//                     event = EventUtil.getEvent(event);
//                     this.set("X", this._xConvert(event.touches[0].clientX));
//                     this.set("Y", this._yConvert(event.touches[0].clientY));
//                 }
//             ],
//             "touchmove": [
//                 function (event) {
//                     event = EventUtil.getEvent(event);
//                     event.preventDefault();   //阻止滚动
//                     this.set("X", this._xConvert(event.touches[0].clientX));
//                     this.set("Y", this._yConvert(event.touches[0].clientY));
//                 }
//             ],
//         }
//     },
//     //事件绑定及节流处理
//     init: function (config) {
//         this._super(config);
//         this.canvasBox = document.getElementById("canvasBox");   //canvas
//         this.createHandlers(this.canvasBox, this.EVENTS["canvasBox"]);    //加入到观察者
//         this.bind();
//     },
//     bind: function(){
//         var self = this;
//         EventUtil.addHandler(this.canvasBox, "mousedown",function (event) {
//             self.fire(self.canvasBox, "mousedown", event);
//         });
//         EventUtil.addHandler(this.canvasBox, "mousemove", function (event) {
//             self.fire(self.canvasBox, "mousemove", event);
//         });
//         EventUtil.addHandler(this.canvasBox, "touchstart", function (event) {
//             self.fire(self.canvasBox, "touchstart", event);
//         });
//         EventUtil.addHandler(this.canvasBox, "touchmove", function (event) {
//             self.fire(self.canvasBox, "touchmove", event);
//         });
//     }
// });
//
// var positionInfo  = new PositionInfo({
//     X: null,
//     Y: null
// });

//绘图模块设计
var Drawing = RichBase.extend({
    //在这里注册所有事件，使用观察者模式
    EVENTS:{
        "canvasBox": {
            // "mousedown":[
            //     function (event) {
            //         event = EventUtil.getEvent(event);
            //         this.set("X", this._xConvert(event.clientX));
            //         this.set("Y", this._yConvert(event.clientY));
            //     }
            // ],
            // "mousemove":[
            //     function(event){
            //         this._displayCursorPos(this._xConvert(event.clientX),  this._yConvert(event.clientY));
            //     },
            //     function (event) {
            //         event = EventUtil.getEvent(event);
            //         event.preventDefault();
            //         this.set("X", this._xConvert(event.clientX));
            //         this.set("Y", this._yConvert(event.clientY));
            //     }
            // ],
            // "mouseup":[
            //     function(event){
            //         this._displayCursorPos(-1,  -1);
            //     }
            // ],
            // "mouseleave":[
            //     function(event){
            //         console.log(`up`);
            //         this._displayCursorPos(-1,  -1);
            //     }
            // ],
            // "touchstart":[
            //     function (event) {
            //         event = EventUtil.getEvent(event);
            //         this.set("X", this._xConvert(event.touches[0].clientX));
            //         this.set("Y", this._yConvert(event.touches[0].clientY));
            //     }
            // ],
            // "touchmove":[
            //     function (event) {
            //         event = EventUtil.getEvent(event);
            //         event.preventDefault();   //阻止滚动
            //         this.set("X", this._xConvert(event.touches[0].clientX));
            //         this.set("Y", this._yConvert(event.touches[0].clientY));
            //     }
            // ],
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
                            var imageDropHandle = function() {
                                this._resizeCanvasBox(this.canvasBox, this.image.width, this.image.height);
                                this.context.drawImage(this.image, 0, 0);
                                // this.image.onload = null;
                                EventUtil.removeHandler(this.image, "load", imageDropHandle);   //图片加载完成后，清除事件处理程序
                            }.bind(this);
                            // this.image.onload =
                            EventUtil.addHandler(this.image, "load", imageDropHandle);
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
            "click":[]
        },
        "canvasWrap": {
            "mousedown":[
                function (event) {
                    event = EventUtil.getEvent(event);
                    this.set("X", this._xConvert(event.clientX));
                    this.set("Y", this._yConvert(event.clientY));
                }
            ],
            "mousemove":[
                function(event){
                    this._displayCursorPos(this._xConvert(event.clientX),  this._yConvert(event.clientY));
                },
                function (event) {
                    event = EventUtil.getEvent(event);
                    event.preventDefault();
                    this.set("X", this._xConvert(event.clientX));
                    this.set("Y", this._yConvert(event.clientY));
                }
            ],
            "mouseup":[
                function(event){
                    // this._displayCursorPos(-1,  -1);
                }
            ],
            "mouseleave":[
                function(event){
                    // console.log(`up`);
                    this._displayCursorPos(-1,  -1);
                }
            ],
            "touchstart":[
                function (event) {
                    event = EventUtil.getEvent(event);
                    this.set("X", this._xConvert(event.touches[0].clientX));
                    this.set("Y", this._yConvert(event.touches[0].clientY));
                }
            ],
            "touchmove":[
                function (event) {
                    event = EventUtil.getEvent(event);
                    event.preventDefault();   //阻止滚动
                    this.set("X", this._xConvert(event.touches[0].clientX));
                    this.set("Y", this._yConvert(event.touches[0].clientY));
                }
            ],
            "click": [],
        },
        "adjustCanvas": {"click": [
            function(event){
                var keepRatio = confirm("保持纵横比？");
                var inputData = prompt("输入图片新的宽度、高度、水平倾斜角度(°)、垂直倾斜角度(°)，格式如'400, 300, 0 ,0'或者'400%, 300%, 0, 0'", "100%, 100%, 0, 0");
                if(typeof inputData !== "string"){
                    return null;
                }
                var regExpPixel = /\d{1,10}/g,
                    regExpPer = /\d{1,10}%/g;
                var arrayPixel = inputData.match(regExpPixel);
                var arrayPer = inputData.match(regExpPer);
                var width = null,
                    height = null,
                    preWidth = drawingInfo.get("canvasW"),
                    preHeight = drawingInfo.get("canvasH"),
                    scaleX = null,
                    scaleY = null,
                    verticalIncline = null,     //与Y轴负方向的夹角，水平倾斜
                    horizontalIncline = null;   //与X轴正方向的夹角，垂直倾斜
                if(!arrayPixel||(arrayPixel&&arrayPixel.length != 4)){
                    alert("输入参数不合理");
                    return null;
                }
                //返回范围内的数
                function limit(data, lowBorder, upBorder){
                    if(lowBorder>upBorder){
                        return null;
                    }
                    if(data<lowBorder){
                        console.log("超过下限");
                        return lowBorder;
                    }
                    if(data>upBorder){
                        console.log("超过上限");

                        return upBorder;
                    }
                    return data;
                }
                width = parseInt(arrayPixel[0]);
                height = parseInt(arrayPixel[1]);
                verticalIncline = parseInt(arrayPixel[2]);
                horizontalIncline = parseInt(arrayPixel[3]);
                width = limit(width, 1, 500);
                height = limit(height, 1, 500);
                verticalIncline = limit(verticalIncline, -89, 89);       // 倾斜角度
                horizontalIncline = limit(horizontalIncline, -89, 89);   //

                if(!arrayPer||(arrayPer&&arrayPer.length === 0)){
                    // width = parseInt(arrayPixel[0]);
                    if(keepRatio === true){
                        height = preHeight/preWidth*width;
                    }
                    else{
                        // height = parseInt(arrayPixel[1]);
                    }
                }
                else if(arrayPer&&arrayPer.length === 2){
                    width = preWidth*width/100;
                    if(keepRatio === true){
                        height = preHeight/preWidth*width;
                    }
                    else{
                        height = preHeight*height/100;
                    }
                }
                else{
                    alert("输入参数不合理");
                    return null;
                }
                scaleX = width/preWidth;
                scaleY = height/preHeight;

                var imageStretch = function(){
                    // var tanV = Math.tan(verticalIncline*Math.PI/180);
                    // var tanH = Math.tan(horizontalIncline*Math.PI/180);
                    // //下面这个顺序非常重要
                    // var diffX = height*tanV;
                    // var diffY0 = width*tanH;
                    // width += diffX;
                    // var diffY = width*tanH;
                    // height += diffY;


                    //transform(a, b, c, d, e, f);   //a水平拉伸，b水平倾斜（与X轴正方向夹角，即对应tanH,垂直倾斜
                    this._resizeCanvasBox(this.canvasBox, width, height);
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    //倾斜
                    // this.context.setTransform(1, -tanH, -tanV, 1, diffX, diffY);    //注意，倾斜用的参数为tan值
                    this.context.scale(scaleX, scaleY);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                    EventUtil.removeHandler(this.image, "load", imageStretch);
                    EventUtil.addHandler(this.image, "load", imageIncline);
                    this.image.src = this.canvasBox.toDataURL("image/png");
                }.bind(this);

                var imageIncline = function(){
                    var tanV = Math.tan(verticalIncline*Math.PI/180);
                    var tanH = Math.tan(horizontalIncline*Math.PI/180);
                    //下面这个顺序非常重要
                    var diffX = height*tanV;
                    var diffY0 = width*tanH;
                    width += diffX;
                    var diffY = width*tanH;
                    height += diffY;

                    //transform(a, b, c, d, e, f);   //a水平拉伸，b水平倾斜（与X轴正方向夹角，即对应tanH,垂直倾斜
                    this._resizeCanvasBox(this.canvasBox, width, height);
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    //倾斜
                    // this.context.setTransform(1, -tanH, -tanV, 1, diffX, diffY);    //注意，倾斜用的参数为tan值
                    this.context.drawImage(this.image, 0, 0);
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    this.context.transform(1, -tanH, 0, 1, diffX, 0);
                    this.context.transform(1, 0, -tanV, 1, 0, diffY0);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                    EventUtil.removeHandler(this.image, "load", imageIncline);
                }.bind(this);

                EventUtil.addHandler(this.image, "load", imageStretch);
                this.image.src = this.canvasBox.toDataURL("image/png");

            }
            ]},
        //旋转
        "rotateDrop": {"click": [
            function(event){
                event = EventUtil.getEvent(event);
                var target = EventUtil.getTarget(event);
                if(target.id === "right-90"||target.parentNode.id === "right-90"){
                    //向右旋转90°
                    var imageRight90 = function(){
                        this._resizeCanvasBox(this.canvasBox, this.canvasBox.height, this.canvasBox.width);
                        this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                        this.context.translate(this.canvasBox.width, 0);
                        this.context.rotate(0.5*Math.PI);
                        this.context.drawImage(this.image, 0, 0);
                        this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                        EventUtil.removeHandler(this.image, "load", imageRight90);
                    }.bind(this);
                    EventUtil.addHandler(this.image, "load", imageRight90);
                    this.image.src = this.canvasBox.toDataURL("image/png");
                }
                else if(target.id === "left-90"||target.parentNode.id === "left-90"){
                    //向左旋转90°
                    var imageLeft90 = function(){
                        this._resizeCanvasBox(this.canvasBox, this.canvasBox.height, this.canvasBox.width);
                        this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                        this.context.translate(0, this.canvasBox.height);
                        this.context.rotate(-0.5*Math.PI);
                        this.context.drawImage(this.image, 0, 0);
                        this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                        EventUtil.removeHandler(this.image, "load", imageLeft90);
                    }.bind(this);
                    EventUtil.addHandler(this.image, "load", imageLeft90);
                    this.image.src = this.canvasBox.toDataURL("image/png");
                }
                else if(target.id === "rotate-180"||target.parentNode.id === "rotate-180"){
                    //旋转180°
                    var rotate180 = function(){
                        this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                        this.context.setTransform(-1, 0, 0, -1, this.canvasBox.width, this.canvasBox.height);
                        this.context.drawImage(this.image, 0, 0);
                        this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                        EventUtil.removeHandler(this.image, "load", rotate180);
                    }.bind(this);
                    EventUtil.addHandler(this.image, "load", rotate180);
                    this.image.src = this.canvasBox.toDataURL("image/png");
                }
                else if(target.id === "flip-vertical"||target.parentNode.id === "flip-vertical"){
                    //垂直翻转
                    var flipVertical = function(){
                        this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                        this.context.setTransform(1, 0, 0, -1, 0, this.canvasBox.height);
                        this.context.drawImage(this.image, 0, 0);
                        this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                        EventUtil.removeHandler(this.image, "load", flipVertical);
                    }.bind(this);
                    EventUtil.addHandler(this.image, "load", flipVertical);
                    this.image.src = this.canvasBox.toDataURL("image/png");
                }
                else if(target.id === "flip-horizontal"||target.parentNode.id === "flip-horizontal"){
                    //水平翻转
                    var flipHorizontal = function(){
                        this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                        this.context.setTransform(-1, 0, 0, 1, this.canvasBox.width, 0);
                        this.context.drawImage(this.image, 0, 0);
                        this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                        EventUtil.removeHandler(this.image, "load", flipHorizontal);
                    }.bind(this);
                    EventUtil.addHandler(this.image, "load", flipHorizontal);
                    this.image.src = this.canvasBox.toDataURL("image/png");
                }
                }
        ]},
        //工具栏
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
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                drawingInfo.set("behavior", "pencil");
                                this._removeStrawHandler();
                                this._removeFillHandler();
                                this._removeMagnifierHandler();
                                this._addDrawLineHandler();
                            }
                        break;
                        case "erase":
                            console.log("erase");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/erase.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                drawingInfo.set("behavior", "erase");
                                this._removeStrawHandler();
                                this._removeFillHandler();
                                this._removeMagnifierHandler();
                                this._addDrawLineHandler();
                            }
                        break;
                        case "fill":
                            console.log("fill");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/fill.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                drawingInfo.set("behavior", "fill");
                                this._removeStrawHandler();
                                this._removeDrawLineHandler();
                                this._removeMagnifierHandler();
                                this._addFillHandler();
                            }
                        break;
                        case "straw":
                            console.log("straw");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/straw.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                drawingInfo.set("behavior", "straw");
                                this._removeDrawLineHandler();
                                this._removeFillHandler();
                                this._removeMagnifierHandler();
                                this._addStrawHandler();
                            }
                        break;
                        case "magnifier":
                            console.log("magnifier");
                            if(!handleTarget.classList.contains("selected")){
                                this.magnifierWrap.style.cursor = "url(images/magnifier.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                drawingInfo.set("behavior", "magnifier");
                                this._removeStrawHandler();
                                this._removeDrawLineHandler();
                                this._removeFillHandler();
                                this._addMagnifierHandler();
                            }
                        break;
                        case "text":
                            console.log("text");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "text";
                                handleTarget.classList.toggle("selected");
                                drawingInfo.set("behavior", "textInput");
                                this._removeStrawHandler();
                                this._removeDrawLineHandler();
                                this._removeFillHandler();
                                this._removeMagnifierHandler();
                                this._addTextInputHandler();
                                // this._removeStrawHandler();
                                // this._addDrawLineHandler();
                            }
                        break;
                    }
                }
            ],
        },
        "magnifierWrap":{
            "click":[],
        },
        "elementWrap":{
            "mousedown":[],
            "mousemove":[],
            "mouseup":[],
            "mouseleave":[],
            "touchstart":[],
            "touchmove":[],
            "touchend":[],
        }
    },
    _ctrlEvent:{
        target: null,
        flag: false,
        startXY:[null, null],
        middleXY:[null,null],
        endXY:[null, null],
        startStretchXY:[null, null],
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
        var ctx = target.getContext("2d");
        var imgData = ctx.getImageData(0, 0, target.width, target.height);
        if(!target){
            return null;
        }
        if(typeof width === "number"&&typeof height === "number"){
            target.width = width;
            target.height = height;
            drawingInfo.set("canvasW", width);
            drawingInfo.set("canvasH", height);
            this._displaySize(width, height);
        }
        ctx.putImageData(imgData, 0, 0);   //还原图像
    },
    //字符串颜色值转换成rgba颜色值
    _hexToRgba: function(hex){
        var R = null,
            G = null,
            B = null,
            alpha = null;
        if(/^#[0-9|A-Z|a-z]{6}$/.test(hex)){
            return {
                R: parseInt("0x" + hex.slice(1, 3)),
                G: parseInt("0x" + hex.slice(3, 5)),
                B: parseInt("0x" + hex.slice(5, 7)),
                alpha: 255
            };
        }
        else if(/^rgb/i.test(hex)){
            var regExp = /\d{1,3}/g;
            var rgbArray = hex.match(regExp);
            if(rgbArray.length === 3){
                return {
                    R: parseInt(rgbArray[0]),
                    G: parseInt(rgbArray[1]),
                    B: parseInt(rgbArray[2]),
                    alpha: 255
                };
            }
            else if(rgbArray.length === 4){
                return {
                    R: parseInt(rgbArray[0]),
                    G: parseInt(rgbArray[1]),
                    B: parseInt(rgbArray[2]),
                    alpha: parseInt(rgbArray[3])
                };
            }
        }
        else{
            return null;
        }
    },
    //返回指定点的RGB值
    _getRGB: function(imageRGBArr, index){
        var red = null,
            green = null,
            blue = null;
            alpha = null;
        if(!(typeof index === "number"&&index>=0)){
            return null;
        }
        // red = imageRGBArr[index].toString(16);
        // green = imageRGBArr[index+1].toString(16);
        // blue = imageRGBArr[index+2].toString(16);
        // alpha = imageRGBArr[index+3].toString(16);
        return {
            // RGB: "#"+red+green+blue,
            R: imageRGBArr[index],
            G: imageRGBArr[index+1],
            B: imageRGBArr[index+2],
            alpha: imageRGBArr[index+3]
        };
    },
    //根据坐标返回RGB值
    _getRGBByXY: function(imageRGBArr, X, Y){
        var index = null;
        if(typeof X !== "number"||typeof Y !== "number"||X<0||X>drawingInfo.get("canvasW")||Y<0||Y>drawingInfo.get("canvasH")){
            return null;
        }
        index = (X + Y * this.canvasBox.width)*4;
        return this._getRGB(imageRGBArr, index);
    },
    //设置RGB
    _setRGB: function(imageRGBArr, index, color){
        imageRGBArr[index] = color.R;
        imageRGBArr[index+1] = color.G;
        imageRGBArr[index+2] = color.B;
        imageRGBArr[index+3] = color.alpha;
        // alpha = imageRGBArr[index+3].toString(16);
        return imageRGBArr;
    },
    //设置RGB
    _setRGBByXY: function(imageRGBArr, X, Y, color){
        var index =  (X + Y * this.canvasBox.width)*4;
        return this._setRGB(imageRGBArr, index, color);
    },

    //事件绑定函数
    _beginDrawLine: function(event){
        event = EventUtil.getEvent(event);
        this._ctrlEvent.flag = true;
        this.context.beginPath();
        this.context.moveTo(this._xConvert(event.clientX), this._yConvert(event.clientY));
    },
    _drawingLine: function(event){
        event = EventUtil.getEvent(event);
        event.preventDefault();
        if(this._ctrlEvent.flag === true){
            this._draw(this._xConvert(event.clientX), this._yConvert(event.clientY));
        }
    },
    _endDrawLine: function(event){
        this._ctrlEvent.flag = false;
    },
    //触摸设备
    _beginDrawLineT: function(event){
        event = EventUtil.getEvent(event);
        this.context.beginPath();
        this.context.moveTo(this._xConvert(event.touches[0].clientX), this._yConvert(event.touches[0].clientY));
    },
    //触摸设备
    _drawingLineT: function(event){
        event = EventUtil.getEvent(event);
        event.preventDefault();   //阻止滚动
        this._displayCursorPos(this._xConvert(event.changedTouches[0].clientX),  this._yConvert(event.changedTouches[0].clientY));
        this._draw(this._xConvert(event.changedTouches[0].clientX), this._yConvert(event.changedTouches[0].clientY));
    },
    //添加画线事件
    //注意，默认是已经加上绘图事件
    _addDrawLineHandler: function(){
        this.addHandler(this.canvasWrap, "mousedown", this._beginDrawLine);
        this.addHandler(this.canvasWrap, "mousemove", this._drawingLine);
        this.addHandler(this.canvasWrap, "mouseup", this._endDrawLine);
        this.addHandler(this.canvasWrap, "mouseleave", this._endDrawLine);
        this.addHandler(this.canvasWrap, "touchstart", this._beginDrawLineT);
        this.addHandler(this.canvasWrap, "touchmove", this._drawingLineT);
    },
    //删除画线事件
    _removeDrawLineHandler: function(){
        this.removeHandler(this.canvasWrap, "mousedown", this._beginDrawLine);
        this.removeHandler(this.canvasWrap, "mousemove", this._drawingLine);
        this.removeHandler(this.canvasWrap, "mouseup", this._endDrawLine);
        this.removeHandler(this.canvasWrap, "mouseleave", this._endDrawLine);
        this.removeHandler(this.canvasWrap, "touchstart", this._beginDrawLineT);
        this.removeHandler(this.canvasWrap, "touchmove", this._drawingLineT);
    },
    //设置目标前景色
    _setForecolor: function(target, color){
        target.style.backgroundColor = color;
    },
    //吸管工具
    _strawHandler: function(){
        var X = this.get("X"),
            Y = this.get("Y");
        var imageRGBArr = this.context.getImageData(0, 0, this.canvasBox.width, this.canvasBox.height).data;
        var colorObj = this._getRGBByXY(imageRGBArr, X, Y);
        var color = `rgba(${colorObj.R}, ${colorObj.G}, ${colorObj.B}, ${colorObj.alpha/255})`;
        console.log(color);
        this._setForecolor(this.foreColor, color);
        drawingInfo.set("color", color);
    },
    _addStrawHandler: function(){
        this.addHandler(this.canvasWrap, "click", this._strawHandler);
     },
    _removeStrawHandler: function(){
        this.removeHandler(this.canvasWrap, "click", this._strawHandler);
    },
    //注入填充区域算法
    //颜色格式为rgba
    // _floodFill8: function f(imageRGBArr, x, y, oldColor, newColor){
    //     console.log(++debug);
    //     if(x < 0 || x > drawingInfo.canvasW || y < 0 || y > drawingInfo.canvasH){
    //         return null;
    //     }
    //     var color = this._getRGBByXY(imageRGBArr, x, y);
    //     if(color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha){
    //         this._setRGBByXY(imageRGBArr, x, y, newColor);
    //         f.call(this, imageRGBArr, x, y-1, oldColor, newColor);
    //         f.call(this, imageRGBArr, x, y+1, oldColor, newColor);
    //         f.call(this, imageRGBArr, x-1, y, oldColor, newColor);
    //         f.call(this, imageRGBArr, x+1, y, oldColor, newColor);
    //         f.call(this, imageRGBArr, x+1, y-1, oldColor, newColor);
    //         f.call(this, imageRGBArr, x+1, y+1, oldColor, newColor);
    //         f.call(this, imageRGBArr, x-1, y-1, oldColor, newColor);
    //         f.call(this, imageRGBArr, x-1, y+1, oldColor, newColor);
    //     }
    // },
    //扫描线填充算法，非迭代法
    _floodFillScanLineWithStack: function(imageRGBArr, x, y, oldColor, newColor){
        if(newColor.R === oldColor.R&&newColor.G === oldColor.G&&newColor.B === oldColor.B&&newColor.alpha === oldColor.alpha) {
            console.log("do nothing !!!, filled area!!");
            return null;
        }
        var xStack = [],
            yStack = [];


        var y1,
            spanLeft,
            spanRight,
            width = drawingInfo.get("canvasW"),
            height = drawingInfo.get("canvasH");
        var pushXY = function (x, y){
            xStack.push(x);
            yStack.push(y);
        };
        var popx = function(){
            return xStack.pop();
        };
        var popy = function(){
            return yStack.pop();
        };

        pushXY(x, y);

        while(true)
        {
            // console.log(++debug);
            x = popx();
            if(x === undefined) {
                return null;
            }
            // if(xStack.length ===0){
            //     return null;
            // }
            y = popy();
            y1 = y;
            var color = this._getRGBByXY(imageRGBArr, x, y1);
            while(y1 >= 0 && color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha) {
                y1--;
                color = this._getRGBByXY(imageRGBArr, x, y1);
            } // go to line top/bottom
            y1++; // start from line starting point pixel
            spanLeft = false;
            spanRight = false;
            color = this._getRGBByXY(imageRGBArr, x, y1);
            while(y1 < height && color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha) {
                this._setRGBByXY(imageRGBArr, x, y1, newColor);
                color = this._getRGBByXY(imageRGBArr, x-1, y1);
                if(!spanLeft && x > 0 && color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha)// just keep left line once in the stack
                {
                    pushXY(x - 1, y1);
                    spanLeft = true;
                }
                else if(spanLeft && x > 0 && (color.R !== oldColor.R||color.G !== oldColor.G||color.B !== oldColor.B||color.alpha !== oldColor.alpha))
                {
                    spanLeft = false;
                }

                color = this._getRGBByXY(imageRGBArr, x+1, y1);
                if(!spanRight && x < width - 1 && color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha) // just keep right line once in the stack
                {
                    pushXY(x + 1, y1);
                    spanRight = true;
                }
                else if(spanRight && x < width - 1 && (color.R !== oldColor.R||color.G !== oldColor.G||color.B !== oldColor.B||color.alpha !== oldColor.alpha))
                {
                    spanRight = false;
                }
                y1++;
                color = this._getRGBByXY(imageRGBArr, x, y1);
            }
        }
    },
    _fillHandler: function(event){
        event = EventUtil.getEvent(event);
        var button = EventUtil.getButton(event);
        var imageData = null;
        var imageRGBArr = null;
        var X = null,
            Y = null,
            newColor = null,
            oldColor = null;
        X = this.get("X");
        Y = this.get("Y");

        if(button === 0 ){
            newColor = this._hexToRgba(drawingInfo.get("color"));
        }
        else if(button === 2){
            newColor = this._hexToRgba(drawingInfo.get("backgroundColor"));
        }
        else{
            return null;
        }
        //如果是在触摸设备，则选择前景色就填充前景色，选择背景色，就填充背景色
        if(!(client.system.win||client.system.mac||client.system.x11)){
            if(this.colorSetButtons[0].classList.contains("selected")){
                newColor = this._hexToRgba(drawingInfo.get("color"));
            }
            else{
                newColor = this._hexToRgba(drawingInfo.get("backgroundColor"));
            }
        }
        // newColor = (event.type === "click"? drawingInfo.color:drawingInfo.backgroundColor);
        imageData = this.context.getImageData(0, 0, this.canvasBox.width, this.canvasBox.height);
        imageRGBArr = imageData.data;
        oldColor = this._getRGBByXY(imageRGBArr, X, Y);
        // this._floodFill8(imageRGBArr, X, Y, oldColor, newColor);
        this._floodFillScanLineWithStack(imageRGBArr, X, Y, oldColor, newColor);
        imageData.data = imageRGBArr;
        this.context.putImageData(imageData, 0, 0);
    },
    //
    _addFillHandler: function(){
        this.addHandler(this.canvasWrap, "mousedown", this._fillHandler);
    },
    _removeFillHandler: function(){
        this.removeHandler(this.canvasWrap, "mousedown", this._fillHandler);
    },
    //放大镜
    /*
    * option：
    *    isDisplay： 是否显示， 参数为true或者false
    *    top： 绝对定位，数值类型
    *    left： 绝对定位，数值类型
    *    width：宽度，数值类型
    *    height：高度，数值类型
    * */
    _magnifierWrapStyle: function(options){
        //if(options.isDisplay){
            this.magnifierWrap.style.display = options.isDisplay? "block":"none";
            this.magnifierWrap.style.top = options.top + "px";
            this.magnifierWrap.style.left = options.left + "px";
            this.magnifierWrap.style.width = options.width + "px";
            this.magnifierWrap.style.height = options.height + "px";
        //}
        //else{
        //    this.magnifierWrap.style.display = "none";
        //}
    },
    _appendStyle: function (target, options){
        if(target.tagName === "CANVAS"){
            if(options.width != undefined){
                target.width = parseInt(options.width);
                delete options.width;
            }
            if(options.height != undefined){
                target.height = parseInt(options.height);
                delete options.height;
            }
        }
        for(var key in options){
            if(options.hasOwnProperty(key)){
                // console.log(key);
                target.style[key] = options[key];
            }
        }
    },
    _magnify: function(xGain, yGain){
        xGain = xGain|| 1;
        yGain = yGain||xGain;
        var width = null,
            height = null,
            preWidth = drawingInfo.get("canvasW"),
            preHeight = drawingInfo.get("canvasH"),
            gain = drawingInfo.get("gain");
        width = preWidth * (gain + xGain);   //注意gain的计算方式
        height = preHeight * (gain + yGain);

        var imageStretch = function(){
            this._resizeCanvasBox(this.canvasBox, width, height);
            this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
            this.context.scale(xGain, yGain);
            this.context.drawImage(this.image, 0, 0);
            this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
            EventUtil.removeHandler(this.image, "load", imageStretch);
            drawingInfo.set("canvasW", width);
            drawingInfo.set("canvasH", height);
            drawingInfo.set("gain", gain + xGain);   //默认为xGain=yGain的放大
        }.bind(this);
        EventUtil.addHandler(this.image, "load", imageStretch);
        this.image.src = this.canvasBox.toDataURL("image/png");
    },
    //计算包裹边框的放大系数
    _magnifierFactor: function(){
        return document.body.clientWidth/1920;   //以1903的时候，wrap边框宽度为960作为参考
    },
    _updateMagnifierWrapStyle: function(){
        var canvasW = drawingInfo.get("canvasW"),
            canvasH = drawingInfo.get("canvasH"),
            wrapW = null,
            wrapH = null,
            top = null,
            left = null,
            factor = this._magnifierFactor(),
            xGain = drawingInfo.get("gain"),
            X = this.get("X"),
            Y = this.get("Y");

        if(canvasW <= 960*factor){
            wrapW = canvasW;
            left = 0;
        }
        else{
            wrapW = 960*factor;
            left = X-0.5*wrapW;
            left = left>=0? left: 0;   //不超过左侧
            left = (left+wrapW) > canvasW? canvasW-wrapW: left;  //不超过右侧
        }

        if(canvasH <= 428*factor){
            wrapH = canvasH;
            top = 0;
        }
        else{
            wrapH = 428*factor;
            top = Y-0.5*wrapH;
            top = top>=0? top: 0;   //不超过上侧
            top = (top+wrapH) > canvasH? canvasH-wrapH: top;  //不超过右侧
        }
        this._appendStyle(this.magnifierWrap, {
            display: "block",
            top: top+"px",
            left: left+"px",
            height: wrapH+"px",
            width: wrapW+"px"
        });
    },
    _magnifierHandler: function (event){
        event = EventUtil.getEvent(event);
        var xGain = drawingInfo.get("gain");

        if(event.type === "click"){
            if(xGain >0 &&xGain <1){
                xGain = xGain*2;
            }
            else{
                xGain = xGain+1;
            }
            this._magnify(xGain);
        }
        this._updateMagnifierWrapStyle();
    },
    //
    _addMagnifierHandler: function(){
        this.addHandler(this.canvasWrap, "mousemove", this._magnifierHandler);
        this.addHandler(this.magnifierWrap, "click", this._magnifierHandler);
    },
    //
    _removeMagnifierHandler: function () {
         this.removeHandler(this.canvasWrap, "mousemove", this._magnifierHandler);
         this.removeHandler(this.magnifierWrap, "click", this._magnifierHandler);
         this._appendStyle(this.magnifierWrap, {
             display: "none",
             top: drawingInfo.get("canvasH")+"px",
             left: drawingInfo.get("canvasW")+"px",
             height: 0,
             width: 0
         });
    },
    //选择框、输入框方法
    //重新定位
    //移动
    _moveElement: function(event){
        event = EventUtil.getEvent(event);
        var target  = EventUtil.getTarget(event);

        switch (event.type) {
            case "mousedown":
                if (target.id === "element-wrap") {
                    this._ctrlEvent.startXY = [this.get("X"), this.get("Y")];
                }
                break;
            case "touchstart":
                if (target.id === "element-wrap"||target.parentNode.id === "element-wrap") {
                    this._ctrlEvent.startXY = [this.get("X"), this.get("Y")];
                }
                break;
            case "mousemove":
            case "touchmove":
                EventUtil.preventDefault(event);
                if (this._ctrlEvent.startXY[0] !== null && this._ctrlEvent.startXY[1] !== null) {
                    let currentTarget = this.elementWrap,
                        width = parseInt(this.inputDiv.style.width),
                        height = parseInt(this.inputDiv.style.height),
                        x = this.get("X"),
                        y = this.get("Y"),
                        left = parseInt(currentTarget.style.left) + x - this._ctrlEvent.startXY[0],
                        top = parseInt(currentTarget.style.top) + y - this._ctrlEvent.startXY[1],
                        canvasW = drawingInfo.get("canvasW"),
                        canvasH = drawingInfo.get("canvasH");
                    console.log(`top: ${top}`);
                    console.log(`left: ${left}`);
                    //超过画布右侧
                    left = (left + width+ 2) > canvasW ? canvasW - width -2: left;  //2个像素的padding
                    //超出画布左侧
                    left = left < -2 ? -2 : left;
                    //超过画布下侧
                    top = (top + height +2) > canvasH ? canvasH - height - 2: top;
                    //超出画布上侧
                    top = top < -2 ? -2 : top;
                    this._appendStyle(currentTarget, {
                        top: top + "px",
                        left: left + "px"
                    });
                    this._ctrlEvent.startXY = [x, y];
                }
                break;
            case "mouseup":
            case "mouseleave":
            case "touchend":
                    this._ctrlEvent.startXY = [null, null];
                    break;
        }
    },
    //添加移动事件处理程序
    _addMoveElementHandler: function(){
        this.addHandler(this.canvasWrap, "mousedown", this._moveElement);
        this.addHandler(this.canvasWrap, "touchstart", this._moveElement);
        this.addHandler(this.canvasWrap, "mouseup", this._moveElement);
        this.addHandler(this.canvasWrap, "touchmove", this._moveElement);
        this.addHandler(this.canvasWrap, "mousemove", this._moveElement);
        this.addHandler(this.canvasWrap, "touchend", this._moveElement);
        this.addHandler(this.canvasWrap, "mouseleave", this._moveElement);
    },
    //
    _removeMoveElementHandler: function () {
        this.removeHandler(this.canvasWrap, "mousedown", this._moveElement);
        this.removeHandler(this.canvasWrap, "mousemove", this._moveElement);
        this.removeHandler(this.canvasWrap, "mouseup", this._moveElement);
        this.removeHandler(this.canvasWrap, "touchstart", this._moveElement);
        this.removeHandler(this.canvasWrap, "touchmove", this._moveElement);
        this.removeHandler(this.canvasWrap, "touchend", this._moveElement);
        this.removeHandler(this.canvasWrap, "mouseleave", this._moveElement);
    },
    //移动
    _stretchElement: function(event){
        event = EventUtil.getEvent(event);
        var eventTarget  = EventUtil.getTarget(event),
            target = eventTarget.childElementCount? eventTarget.firstElementChild:eventTarget;

        switch (event.type) {
            case "mousedown":
            case "touchstart":
                if (target.id === "top-left"||target.id === "top-middle"||target.id === "top-right"||target.id === "right-middle"||target.id === "right-bottom"||target.id === "bottom-middle"||target.id === "left-bottom"||target.id === "left-middle") {
                    console.log("mousedown");
                    console.log(`this.get("X"): ${this.get("X")}`);
                    console.log(`this.get("Y"): ${this.get("Y")}`);
                    this._ctrlEvent.startStretchXY = [this.get("X"), this.get("Y")];
                    this._ctrlEvent.target = target.id;
                }
                break;
            case "mousemove":
            case "touchmove":
                EventUtil.preventDefault(event);
                if (this._ctrlEvent.startStretchXY[0] !== null && this._ctrlEvent.startStretchXY[1] !== null) {
                    let currentTarget = this.elementWrap,
                        width = parseInt(this.inputDiv.style.width),
                        height = parseInt(this.inputDiv.style["min-height"]),
                        x = this.get("X"),
                        y = this.get("Y"),
                        diffX = x - this._ctrlEvent.startStretchXY[0],
                        diffY = y - this._ctrlEvent.startStretchXY[1],
                        left = parseInt(currentTarget.style.left),
                        top = parseInt(currentTarget.style.top),
                        canvasW = drawingInfo.get("canvasW"),
                        canvasH = drawingInfo.get("canvasH"),
                        newWidth = null,
                        newHeight = null,
                        newTop = null,
                        newLeft = null;

                    switch (this._ctrlEvent.target){
                        case "top-left":
                            newWidth = width - diffX;
                            newHeight = height - diffY;
                            newTop = top + diffY;
                            newLeft =left + diffX;
                            break;
                        case "top-middle":
                            newHeight = height - diffY;
                            newTop = top + diffY;
                            break;
                        case "top-right":
                            newWidth = width + diffX;
                            newHeight = height - diffY;
                            newTop = top + diffY;
                            break;
                        case "right-middle":
                            newWidth = width + diffX;
                            break;
                        case "right-bottom":
                            newWidth = width + diffX;
                            newHeight = height + diffY;
                            break;
                        case "bottom-middle":
                            newHeight = height + diffY;
                            break;
                        case "left-bottom":
                            newWidth = width - diffX;
                            newHeight = height + diffY;
                            newLeft = left + diffX;
                            break;
                        case "left-middle":
                            newWidth = width - diffX;
                            newLeft = left + diffX;
                            break;
                    }
                    //超过左边界
                    if(newLeft<0){
                        newWidth  = width+left;
                        newLeft = 0;
                    }
                    else if(newLeft>width+left-15){  //15为3个小方格宽度
                        //超过右边
                        newWidth = 15;
                        newLeft = width+left-15;
                    }
                    //超过上边界
                    if(newTop<0){
                        newHeight  = height+top;
                        newTop = 0;
                    }
                    else if(newTop>height+top-15){
                        //超过右边
                        newHeight = 15;
                        newTop = height+top-15;
                    }
                    this._appendStyle(this.inputDiv, {
                        width: newWidth + "px",
                        "min-height": newHeight + "px"
                    });
                    this._appendStyle(currentTarget, {
                        top: newTop + "px",
                        left: newLeft + "px",
                    });
                    this._ctrlEvent.startStretchXY = [x, y];
                }
                break;
            case "mouseup":
            case "mouseleave":
            case "touchend":
                this._ctrlEvent.startStretchXY = [null, null];
                break;
        }
    },
    //添加移动事件处理程序
    _addStretchElementHandler: function(){
        this.addHandler(this.canvasWrap, "mousedown", this._stretchElement);
        this.addHandler(this.canvasWrap, "touchstart", this._stretchElement);
        this.addHandler(this.canvasWrap, "mouseup", this._stretchElement);
        this.addHandler(this.canvasWrap, "touchmove", this._stretchElement);
        this.addHandler(this.canvasWrap, "mousemove", this._stretchElement);
        this.addHandler(this.canvasWrap, "touchend", this._stretchElement);
        this.addHandler(this.canvasWrap, "mouseleave", this._stretchElement);
    },
    //
    _removeStretchElementHandler: function () {
        this.removeHandler(this.canvasWrap, "mousedown", this._stretchElement);
        this.removeHandler(this.canvasWrap, "mousemove", this._stretchElement);
        this.removeHandler(this.canvasWrap, "mouseup", this._stretchElement);
        this.removeHandler(this.canvasWrap, "touchstart", this._stretchElement);
        this.removeHandler(this.canvasWrap, "touchmove", this._stretchElement);
        this.removeHandler(this.canvasWrap, "touchend", this._stretchElement);
        this.removeHandler(this.canvasWrap, "mouseleave", this._stretchElement);
    },

    //将一个字符串拆分成不大于绘图区域宽度的字数组序列
    _splitTOArray: function (context, string, width){
        var temp = "",
            tempCopy = "",
            arr = [],
            chrs = string.split("");

        for(let a = 0; a < chrs.length; a++){
            tempCopy += chrs[a];
            if( context.measureText(tempCopy).width < width ){

            }
            else{
                arr.push(temp);
                temp = "";
            }
            temp += chrs[a];
            tempCopy = temp;
        }
        arr.push(temp);
        return arr;
    },

    //将字符分行，用于canvas书写字符
    _wordBreak: function(context, string, width){
        var regEX = /[a-zA-Z0-9]+|\s|[\u4e00-\u9fa5]|\S/g;
        var array = string.match(regEX),
            temp = "",
            tempCopy = "",
            rowArray = [];

        for(var a = 0; a < array.length; ){
            tempCopy += array[a];
            if(context.measureText(tempCopy).width < width ){
                temp += array[a];
                a++;
            }
            else{
                if(context.measureText(array[a]).width >width){
                    var arg = [a, 1];
                    Array.prototype.push.apply(arg, this._splitTOArray(context, array[a], width));  //将两数组合并
                    Array.prototype.splice.apply(array, arg);
                }
                else{
                    rowArray.push(temp);
                    temp = "";
                }
            }
            tempCopy = temp;
            console.log(array);
        }
        rowArray.push(temp);
        return rowArray;
    },
    //绘制多行字符
    /*options
    *    context，
    *    string，
    *    width，
    *    height,
    *    X，
    *    Y，
    *    lineHeight,
    *    fontType,
    *    fontSize,
    *    fontWeight,
    *    color,
    *    backColor
    *    textAlign
    * */
    _drawText: function(options){
        var context = options.context,
            string = options.string,
            width = options.width,
            x = options.X,
            y = options.Y,
            height = options.lineHeight||20,
            fontSize = options.fontSize||16,
            fontWeight = options.fontWeight||"normal",
            fontFamily = options.fontFamily||"微软雅黑",
            backColor = options.backColor||"rgba(255, 255, 255, 0)",
            color = options.color||"rgba(0, 0, 0, 1)",
            textAlign = options.color||"start";

        if(!string){
            return null;
        }
        context.fillStyle = backColor;
        context.fillRect(x, y+4, width, height);
        context.fillStyle = color;
        context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        context.textAlign = textAlign;
        context.textBaseline = textAlign;
        var row = this._wordBreak(context, string, width);
        for(var b = 0; b < row.length; b++){
            context.fillText(row[b],x,y+(b+1)*height);
        }
    },
    //处理文本输入事件
    _textInputHandler: function (event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        if(target.id === "canvasBox"){
            if(drawingInfo.get("behavior") === "textInput"){
                if(this.elementWrap.style.display === "inline-block"){
                    this._drawText({
                        context: this.context,
                        string: this.inputDiv.textContent,
                        X: parseInt(this.elementWrap.style.left)+3,
                        Y: parseInt(this.elementWrap.style.top)-1,
                        color: drawingInfo.get("color"),
                        backColor: drawingInfo.get("backgroundColor"),
                        width: parseInt(this.inputDiv.style.width),
                        height: parseInt(this.inputDiv.style.height)
                    });
                    this._appendStyle(this.elementWrap, {
                        display: "none",
                    });
                    this.inputDiv.innerHTML = "";
                    // this._removeTextInputHandler();
                    this._removeStretchElementHandler();
                    this._removeMoveElementHandler();
                }
                else{
                    this._appendStyle(this.elementWrap, {
                        display: "inline-block",
                        top: this.get("Y")+"px",
                        left: this.get("X")+"px"
                    });
                    this.inputDiv.focus();
                    this._addStretchElementHandler();
                    this._addMoveElementHandler();
                }
            }
        }
    },
    //文本加载事件
    _addTextInputHandler: function(){
        this.addHandler(this.canvasWrap, "click", this._textInputHandler);
    },
    //删除文本事件
    _removeTextInputHandler: function(){
        this.removeHandler(this.canvasWrap, "click", this._textInputHandler);
    },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.canvasBox = document.getElementById("canvasBox");   //canvas
        this.context = this.canvasBox.getContext("2d");
        this.bottomFonts = document.getElementsByClassName("bottom-font");   //坐标显示
        this.image = document.getElementById("imgContainer");
        this.adjustCanvas = document.querySelector("#adjust-canvas");
        this.canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
        this.rotateDrop = document.querySelector("#rotate-drop");
        this.canvasWrap = document.querySelector("#canvas-wrap");
        //tool栏
        this.tool = document.querySelector("#tool");
        this.magnifierWrap = document.querySelector("#magnifier-wrap");
        //选择框调整
        this.elementWrap = document.querySelector("#element-wrap");
        this.inputDiv = document.querySelector("#input-div");

        this.toolImgWrap = document.querySelectorAll(".tool-wrap-img");
        this.canvasWrap = document.getElementsByClassName("canvas-wrap")[0];
        this.createHandlers(this.tool, this.EVENTS["tool"]);               //加入到观察者
        //背景颜色
        this.foreColor = document.querySelector(".font-color");
        this.colorSetButtons = document.querySelectorAll(".color-1");
        //初始化
        this.canvasWrap.style.zIndex = 1;
        this.createHandlers(this.canvasBox, this.EVENTS["canvasBox"]);    //加入到观察者
        this.createHandlers(this.canvasWrap, this.EVENTS["canvasWrap"]);    //加入到观察者
        this.createHandlers(this.adjustCanvas, this.EVENTS["adjustCanvas"]);    //加入到观察者
        this.createHandlers(this.rotateDrop, this.EVENTS["rotateDrop"]);    //加入到观察者
        this.createHandlers(this.magnifierWrap, this.EVENTS["magnifierWrap"]);    //加入到观察者
        // this.createHandlers(this.elementWrap, this.EVENTS["elementWrap"]);    //加入到观察者
        this._addDrawLineHandler();   //默认为绘制线条
        // this._addMoveElementHandler();  //调试使用
        // this._addStretchElementHandler(); //调试
        this.bind();
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.canvasWrap, "mousedown", function (event) {
            self.fire(self.canvasWrap, "mousedown", event);
        });
        EventUtil.addHandler(this.canvasWrap, "mousemove", function (event) {
            self.fire(self.canvasWrap, "mousemove", event);
        });
        EventUtil.addHandler(this.canvasWrap, "mouseup", function (event) {
            self.fire(self.canvasWrap, "mouseup", event);
        });
        EventUtil.addHandler(this.canvasWrap, "mouseleave", function (event) {
            self.fire(self.canvasWrap, "mouseleave", event);
        });
        EventUtil.addHandler(this.canvasWrap, "touchstart", function (event) {
            self.fire(self.canvasWrap, "touchstart", event);
        });
        EventUtil.addHandler(this.canvasWrap, "touchmove", function (event) {
            self.fire(self.canvasWrap, "touchmove", event);
        });
        EventUtil.addHandler(this.canvasWrap, "touchend", function (event) {
            self.fire(self.canvasWrap, "touchend", event);
        });
        //吸管事件
        EventUtil.addHandler(this.canvasWrap, "click", function (event) {
            self.fire(self.canvasWrap, "click", event);
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
        //弹出新长宽输入框
        EventUtil.addHandler(this.adjustCanvas, "click", function (event) {
            self.fire(self.adjustCanvas, "click", event);
        });
        //旋转
        EventUtil.addHandler(this.rotateDrop, "click", function (event) {
            self.fire(self.rotateDrop, "click", event);
        });
        //tool工具
        EventUtil.addHandler(this.tool, "click", function (event) {
            self.fire(self.tool, "click", event);
        });
        EventUtil.addHandler(this.tool, "touchstart", function (event) {
            self.fire(self.tool, "click", event);   //与click事件处理函数一致
        });
        //绑定放大镜事件处理
        EventUtil.addHandler(this.magnifierWrap, "click", function (event) {
            self.fire(self.magnifierWrap, "click", event);
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
        var width = ctrlEvent.endXY[0] - ctrlEvent.startXY[0];
        var height = ctrlEvent.endXY[1] - ctrlEvent.startXY[1];
        switch (ctrlEvent.source) {
            case this.ctrlWrapRight:
                target.width += width;
                drawingInfo.set("canvasW", target.width);
                this._displaySize(target.width, target.height);
                break;
            case this.ctrlWrapBottom:
                target.height += height;
                drawingInfo.set("canvasH", target.height);
                this._displaySize(target.width, target.height);
                break;
            case this.ctrlWrapCorner:
                target.width += width;
                target.height += height;
                drawingInfo.set("canvasW", target.width);
                drawingInfo.set("canvasH", target.height);
                this._displaySize(target.width, target.height);
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
                // this._displaySize(parseInt(target.style.width), this.canvasBox.height);
                break;
            case this.ctrlWrapBottom:
                target.style.height = parseInt(target.style.height) +(ctrlEvent.endXY[1] - ctrlEvent.middleXY[1]) +"px";
                // this._displaySize(this.canvasBox.width, parseInt(target.style.height));
                break;
            case this.ctrlWrapCorner:
                target.style.width = parseInt(target.style.width) +(ctrlEvent.endXY[0] - ctrlEvent.middleXY[0]) +"px";
                target.style.height = parseInt(target.style.height) +(ctrlEvent.endXY[1] - ctrlEvent.middleXY[1]) +"px";
                // this._displaySize(parseInt(target.style.width), parseInt(target.style.height));
                break;
        }
    }
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
        "colorInput": {
            "change": [
                function (event) {
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event);
                    var newColor = target.value;
                    // var actualTarget = (target.childElementCount === 0 && target.className === "color-box")? target: target.firstElementChild;

                    if(typeof newColor === "string"){
                        this._arrangeNewColorArray(this.newColor, newColor);
                        this._renderNewColorBoxes(this.colorBoxes, this.newColor);
                        if(!this.colorSetButtons[0].classList.contains("selected")){
                            this.backgroundColor.style.backgroundColor = newColor;
                            drawingInfo.set("backgroundColor", newColor);
                        }
                        else{
                            this.fontColor.style.backgroundColor = newColor;
                            drawingInfo.set("color", newColor);
                        }
                    }
                }
            ],
        },
    },
    _arrangeNewColorArray: function(array, newColor){
        var index = array.indexOf(newColor);

        if(index < 0){
            if(array.length >= 10){
                array.shift();
            }
        }
        else{
            array.splice(index, 1);

        }
        array.push(newColor);
    },
    _renderNewColorBoxes: function(boxes, array){
        var i = null,
            len = array.length;
        for(i = 0; i<len; i++){
            boxes[i+20].classList.add("line-highlight");
            boxes[i+20].firstElementChild.style.backgroundColor = array[i];
        }
    },
    //事件绑定及节流处理
    init: function (config) {
        this._super(config);
        this.colorSetButtons = document.querySelectorAll(".color-1");
        this.colorBoxContainer = document.getElementsByClassName("color-box-container")[0];
        this.colorBoxes = document.querySelectorAll(".color-box-wrap");
        this.fontColor = document.getElementsByClassName("font-color")[0];
        this.backgroundColor = document.getElementsByClassName("background-color")[0];
        this.colorInput = document.querySelector("#colorInput");
        this.newColor = [];
        this.createHandlers(this.colorSetButtons[0], this.EVENTS["colorSetButtons[0]"]);               //加入到观察者
        this.createHandlers(this.colorSetButtons[1], this.EVENTS["colorSetButtons[1]"]);               //加入到观察者
        this.createHandlers(this.colorBoxContainer, this.EVENTS["colorBoxContainer"]);
        this.createHandlers(this.colorInput, this.EVENTS["colorInput"]);
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
        EventUtil.addHandler(this.colorInput, "change", function (event) {
            self.fire(self.colorInput, "change", event);   //与click事件处理函数一直
        });
    },
});

(function(){
    var drawingModule = new Drawing({
            X: null,  //绘图区域X坐标
            Y: null   //绘图区域Y坐标
        }
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
    // var tool = new Tool();
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
// var getReminder = document.getElementById("get-reminder");
// var reminder = document.getElementById("reminder");
//
// console.log(reminder);
//
// EventUtil.addHandler(getReminder, "click", function(event){
//     console.log(reminder);
//     reminder.style.display = "none";
// });