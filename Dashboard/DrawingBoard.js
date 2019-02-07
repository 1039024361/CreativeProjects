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
        // if(!target.handlers){
        //     target.handlers = {};
        // }
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
    //注意，不允许同一个对象之间相互动态删除handler
    fire: function(target, type){
        var that = this;
        if(!target.handlers&&!target.handlers[type]){
            return;
        }
        console.log(target.id);
        console.log(type);
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
    //实时显示绘图区域大小
    _displaySelectSize: function (x, y){
        (x>=0&&y>=0)? this.bottomFonts[1].textContent = `${Math.round(x)} × ${Math.round(y)}像素`: this.bottomFonts[1].textContent ="";
    },
    _resizeCanvasBox: function(target, width, height){
        //先保存图像信息
        var ctx = target.getContext("2d");
        if(!(target.width&&target.height)){
            return null;
        }
        var imgData = ctx.getImageData(0, 0, target.width, target.height);
        if(!target){
            return null;
        }
        if(typeof width === "number"&&typeof height === "number"){
            target.width = width;
            target.height = height;
            if(target.id === "canvasBox"){
                drawingInfo.set("canvasW", width);
                drawingInfo.set("canvasH", height);
            }
            this._displaySize(width, height);
        }
        ctx.putImageData(imgData, 0, 0);   //还原图像
    },
    //撤销重做原型
    _saveDrawingToBuffer: function(){
        var reDoUnDo = drawingInfo.get("reDoUnDo"),
            buffer = reDoUnDo.buffer,
            index = reDoUnDo.index,
            preWidth = drawingInfo.get("canvasW"),   //当前canvas宽度
            preHeight = drawingInfo.get("canvasH");  //当前canvas高度
        if(buffer.length === 50){
            buffer.shift();   //移除第一项
            if(index-1<=0){
                this._removeUndoHandler();
            }else{
                index--;
            }
        }
        index++;
        buffer.push(this.context.getImageData(0, 0, preWidth, preHeight));
        if(buffer.length > 1){
            //加载撤销操作事件
            this._addUndoHandler();
        }
        reDoUnDo.buffer = buffer;
        reDoUnDo.index = index;
        drawingInfo.set("reDoUnDo", reDoUnDo);
    },
    _undo: function(){
        var reDoUnDo = drawingInfo.get("reDoUnDo"),
            buffer = reDoUnDo.buffer,
            index = reDoUnDo.index,
            preWidth = drawingInfo.get("canvasW"),   //当前canvas宽度
            preHeight = drawingInfo.get("canvasH"),  //当前canvas高度
            recWidth= null,
            recHeight = null,
            imageData;
        index = index -1;
        imageData = buffer[index];
        recWidth = imageData.width;
        recHeight = imageData.height;
        // this.context.clearRect(0, 0, width, height);
        this._resizeCanvasBox(this.canvasBox, recWidth, recHeight);
        this.context.putImageData(imageData, 0, 0);
        if(index > 0){

        }
        else{
            //删除撤销操作事件
            this._removeUndoHandler();

        }
        if(index < buffer.length-1){
            //绑定redo事件
            this._addRedoHandler();
        }
        reDoUnDo.index = index;
        drawingInfo.set("reDoUnDo", reDoUnDo);
    },
    _redo: function(){
        var reDoUnDo = drawingInfo.get("reDoUnDo"),
            buffer = reDoUnDo.buffer,
            index = reDoUnDo.index,
            recWidth,
            recHeight,
            imageData;
        index = index +1;
        imageData = buffer[index];
        recWidth = imageData.width;
        recHeight = imageData.height;
        // this.context.clearRect(0, 0, width, height);
        this._resizeCanvasBox(this.canvasBox, recWidth, recHeight);
        this.context.putImageData(imageData, 0, 0);
        if(index < buffer.length-1){

        }
        else{
            //删除重做事件
            this._removeRedoHandler();
        }
        if(index > 0){
            this._addUndoHandler();
        }
        reDoUnDo.index = index;
        drawingInfo.set("reDoUnDo", reDoUnDo);
    },

    //
    _addRedoHandler: function(){
        this.redo.classList.remove("invalid");
        this.addHandler(this.redo, "handlers", this._redo);
    },
    //
    _removeRedoHandler: function(){
        this.redo.classList.add("invalid");
        this.removeHandler(this.redo, "handlers", this._redo);
    },
    //
    _addUndoHandler: function(){
        this.undo.classList.remove("invalid");
        this.addHandler(this.undo, "handlers", this._undo);
    },
    //
    _removeUndoHandler: function(){
        this.undo.classList.add("invalid");
        this.removeHandler(this.undo, "handlers", this._undo);
    },
});


//创建一个保存配置信息的对象
var drawingInfo = new Base({
    behavior: "pencil",
    description: "",   //描述behavior行为
    lineWeight: 1,     //线比例
    color: "#000000",
    backgroundColor: "#FFFFFF",
    canvasW: 800,
    canvasH: 600,
    gain: 1,   //图形放大系数
    imageStretch: false,
    reDoUnDo: {
        buffer: [],
        index: -1,
    }
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
                                // var virtualBoxWidth = parseInt(this.virtualWrap.width)+10,
                                //     virtualBoxHeight = parseInt(this.virtualWrap.height)+10;
                                // virtualBoxWidth = (virtualBoxWidth>this.image.width)? virtualBoxWidth:this.image.width;
                                // virtualBoxHeight = (virtualBoxHeight>this.image.height)? virtualBoxHeight:this.image.height;
                                // this._appendStyle(this.virtualWrap, {
                                //     width: virtualBoxWidth,
                                //     height: virtualBoxHeight
                                // });
                                this._resizeCanvasBox(this.canvasBox, this.image.width, this.image.height);
                                this.context.drawImage(this.image, 0, 0);
                                // this.image.onload = null;
                                EventUtil.removeHandler(this.image, "load", imageDropHandle);   //图片加载完成后，清除事件处理程序
                                this._saveDrawingToBuffer();
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
                    this.set("startX", this._xConvert(event.clientX));
                    this.set("startY", this._yConvert(event.clientY));
                    this.set("clicking", true);
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
                    if(this.get("clicking") === true){
                        this.set("diffX", this._xConvert(event.clientX)-this.get("startX"));
                        this.set("diffY", this._yConvert(event.clientY)-this.get("startY"));
                    }
                }
            ],
            "mouseup":[
                function(event){
                    this.set("clicking", false);
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
                    debug = 'touchstart';
                    // alert(debug);
                    this.set("X", this._xConvert(event.touches[0].clientX));
                    this.set("Y", this._yConvert(event.touches[0].clientY));
                    this.set("startX", this._xConvert(event.touches[0].clientX));
                    this.set("startY", this._yConvert(event.touches[0].clientY));
                    this.set("clicking", true);
                },
                // function (event) {
                //     event = EventUtil.getEvent(event);
                //     alert(event.target.id);
                // }
            ],
            "touchmove":[
                function (event) {
                    event = EventUtil.getEvent(event);
                    event.preventDefault();   //阻止滚动
                    // debug = 'touchmove';
                    this.set("X", this._xConvert(event.touches[0].clientX));
                    this.set("Y", this._yConvert(event.touches[0].clientY));
                    if(this.get("clicking") === true){
                        this.set("diffX", this._xConvert(event.touches[0].clientX)-this.get("startX"));
                        this.set("diffY", this._yConvert(event.touches[0].clientY)-this.get("startY"));
                    }
                }
            ],
            "touchend":[
                function (event) {
                    // event = EventUtil.getEvent(event);
                    // this.set("startX", null);
                    // this.set("startY", null);
                    // this.set("diffX", null);
                    // this.set("diffY", null);
                    // alert(debug);
                    this.set("clicking", false);
                }
            ],
            "click": [
                // function (event) {
                //     event = EventUtil.getEvent(event);
                //     event.preventDefault();
                // }
            ]
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
                    this._saveDrawingToBuffer();
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
                    this._saveDrawingToBuffer();
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
                        this._saveDrawingToBuffer();
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
                        this._saveDrawingToBuffer();
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
                        this._saveDrawingToBuffer();
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
                        this._saveDrawingToBuffer();
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
                        this._saveDrawingToBuffer();
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
                        if(this.toolImgWrap[i].classList.contains("selected")){
                            if(handleTarget.id !== drawingInfo.get("behavior")){
                                this.toolImgWrap[i].classList.remove("selected")
                            }
                        }
                    }

                    switch (handleTarget.id)
                    {
                        case "pencil":
                            console.log("pencil");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                this._handle(this._addDrawLineHandler, this._removeDrawLineHandler);
                                drawingInfo.set("behavior", "pencil");
                            }
                        break;
                        case "erase":
                            console.log("erase");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/erase.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                this._handle(this._addDrawLineHandler, this._removeDrawLineHandler);
                                drawingInfo.set("behavior", "erase");
                            }
                        break;
                        case "fill":
                            console.log("fill");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/fill.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                this._handle(this._addFillHandler, this._removeFillHandler);
                                drawingInfo.set("behavior", "fill");
                            }
                        break;
                        case "straw":
                            console.log("straw");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "url(images/straw.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                this._handle(this._addStrawHandler, this._removeStrawHandler);
                                drawingInfo.set("behavior", "straw");
                            }
                        break;
                        case "magnifier":
                            console.log("magnifier");
                            if(!handleTarget.classList.contains("selected")){
                                this.magnifierWrap.style.cursor = "url(images/magnifier.gif) 0 20, auto";
                                handleTarget.classList.toggle("selected");
                                this._handle(this._addMagnifierHandler, this._removeMagnifierHandler);
                                drawingInfo.set("behavior", "magnifier");
                            }
                        break;
                        case "text":
                            console.log("text");
                            if(!handleTarget.classList.contains("selected")){
                                this.canvasBox.style.cursor = "text";
                                handleTarget.classList.toggle("selected");
                                this._handle(this._addTextInputHandler, this._removeTextInputHandler);
                                // this.addHandler(this, "handlers", this._fillText);
                                drawingInfo.set("behavior", "text");
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
        },
        "remove":{
            "handlers":[]
        },
        "pasteInput":{
            "paste":[]
        },
        //选择栏事件处理程序
        //工具栏
        "selectButton":{
            "click":[
                function(event){
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event),
                        handleTarget;

                    handleTarget = target.childElementCount? target:target.parentNode;

                    switch (handleTarget.id)
                    {
                        case "imgWrap":
                            console.log("imgWrap");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawImageHandler, this._removeDrawImageHandler);
                                drawingInfo.set("behavior", "select");
                            }
                            break;
                    }
                }
            ],
        },
        "document":{
            "copy":[],
            "paste":[],
            // "click": [
            //     function (event) {
            //         event = EventUtil.getEvent(event);
            //         alert(event.target.id);
            //     }
            // ],
            // "touchstart": [
            //     function (event) {
            //         event = EventUtil.getEvent(event);
            //         alert(event.target.id);
            //     }
            // ]
        },
        //复制按键
        "copy":{
            "click":[]
        },
        //剪切按钮
        "cut":{
            "click":[]
        },
        //粘贴按钮
        "paste":{
            "click":[]
        },
        //裁剪按钮
        "clip":{
            "click":[]
        },
        //形状栏箭头按钮
        "scroll":{
            "click":[]
        },
        "wrapDiv":{
            "click":[
                function(event){
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event),
                        handleTarget;

                    handleTarget = target.childElementCount? target:target.parentNode;

                    switch (handleTarget.id)
                    {
                        case "ellipse":
                            console.log("ellipse");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "ellipse");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "rectangle":
                            console.log("rectangle");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "rectangle");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "circle-rectangle":
                            console.log("circle-rectangle");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "circle-rectangle");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "triangle":
                            console.log("triangle");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "triangle");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "right-triangle":
                            console.log("right-triangle");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "right-triangle");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "quadrangle":
                            console.log("quadrangle");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "quadrangle");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "pentagon":
                            console.log("pentagon");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "pentagon");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "hexagon":
                            console.log("hexagon");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "hexagon");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "shape-arrow-right":
                            console.log("shape-arrow-right");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "shape-arrow-right");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "shape-arrow-left":
                            console.log("shape-arrow-left");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "shape-arrow-left");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "shape-arrow-up":
                            console.log("shape-arrow-up");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "shape-arrow-up");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "shape-arrow-down":
                            console.log("shape-arrow-down");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "shape-arrow-down");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "four-star":
                            console.log("four-star");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "four-star");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "five-star":
                            console.log("five-star");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "five-star");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "six-star":
                            console.log("six-star");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "six-star");
                                handleTarget.classList.add("selected");
                            }
                            break;
                        case "heart":
                            console.log("heart");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                                drawingInfo.set("behavior", "shape");
                                drawingInfo.set("description", "heart");
                                handleTarget.classList.add("selected");
                            }
                            break;
                    }
                }
            ]
        },
        "redoUndo":{
            "click":[
                function(event) {
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event),
                        handleTarget;

                    handleTarget = target.childElementCount ? target : target.parentNode;

                    switch (handleTarget.id) {
                        case "undo":
                            console.log("undo");
                            this.fire(this.undo, "handlers");
                            break;
                        case "redo":
                            console.log("redo");
                            this.fire(this.redo, "handlers");
                            break;
                    }
                }
            ]
        },
        "redo":{
            "handlers":[]
        },
        "undo":{
            "handlers":[]
        },
        "open":{
            "click":[]
        },
        "save":{
            "click":[]
        },
    },
    _ctrlEvent:{
        target: null,
        flag: false,
        startXY:[null, null],
        middleXY:[null,null],
        endXY:[null, null],
        startStretchXY:[null, null],
    },
    //绑定新得事件，移除之前事件处理程序
    _handle: function(newHandler, newRemoveHandler){
        this.fire(this, "handlers");            //执行之前保存的remove的handler
        this.removeHandler(this, "handlers");   //清空handler数组
        if(newRemoveHandler){
            this.addHandler(this, "handlers", newRemoveHandler);   //添加新的事件处理
        }
        if(newHandler){
            newHandler.apply(this);
        }
    },
    //描点函数
    _draw: function(x, y){
    this.context.lineWidth = drawingInfo.get("behavior") !== "erase"? drawingInfo.get("lineWeight"): 8;
    this.context.strokeStyle = drawingInfo.get("behavior") !== "erase"? drawingInfo.get("color"): drawingInfo.get("backgroundColor");
    this.context.lineTo(x,y);
    this.context.stroke();
    },
    // _resizeCanvasBox: function(target, width, height){
    //     //先保存图像信息
    //     var ctx = target.getContext("2d");
    //     if(!(target.width&&target.height)){
    //         return null;
    //     }
    //     var imgData = ctx.getImageData(0, 0, target.width, target.height);
    //     if(!target){
    //         return null;
    //     }
    //     if(typeof width === "number"&&typeof height === "number"){
    //         target.width = width;
    //         target.height = height;
    //         if(target.id === "canvasBox"){
    //             drawingInfo.set("canvasW", width);
    //             drawingInfo.set("canvasH", height);
    //         }
    //         this._displaySize(width, height);
    //     }
    //     ctx.putImageData(imgData, 0, 0);   //还原图像
    // },
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
        if(this._ctrlEvent.flag === true){
            this._ctrlEvent.flag = false;
            this._saveDrawingToBuffer();
        }
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
        if(drawingInfo.get("behavior") === "pencil"){
            this.pencil.classList.remove("selected");
        }
        else{
            this.erase.classList.remove("selected");
        }
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
        this.straw.classList.remove("selected");
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
        this._saveDrawingToBuffer();
    },
    //
    _addFillHandler: function(){
        this.addHandler(this.canvasWrap, "mousedown", this._fillHandler);
    },
    _removeFillHandler: function(){
        this.fill.classList.remove("selected");
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
    // _magnifierWrapStyle: function(options){
    //     //if(options.isDisplay){
    //         this.magnifierWrap.style.display = options.isDisplay? "block":"none";
    //         this.magnifierWrap.style.top = options.top + "px";
    //         this.magnifierWrap.style.left = options.left + "px";
    //         this.magnifierWrap.style.width = options.width + "px";
    //         this.magnifierWrap.style.height = options.height + "px";
    //     //}
    //     //else{
    //     //    this.magnifierWrap.style.display = "none";
    //     //}
    // },
    _appendStyle: function (target, options){
        if(target.tagName.toLowerCase() === "canvas"){
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
         this.magnifier.classList.remove("selected");
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
                    // this._removeVirtualBoxHandler();
                }
                break;
            case "touchstart":
                if (target.id === "element-wrap"||target.parentNode.id === "element-wrap") {
                    this._ctrlEvent.startXY = [this.get("X"), this.get("Y")];
                    // this._removeVirtualBoxHandler();
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
                    if(this.editCanvasBox.style.display === "inline-block"){
                        this._appendStyle(this.editCanvasBox, {
                            top: top + 1 + "px",
                            left: left + 1 + "px"
                        });
                    }
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
                    // this._addVirtualBoxHandler();
                    break;
        }
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
                    this.removeHandler(this.canvasWrap, "click", this._drawImageHandler);
                    // this._removeVirtualBoxHandler();       //注意这里无法使用，不能动态删除同一个对象的handler
                }
                break;
            case "mousemove":
            case "touchmove":
                EventUtil.preventDefault(event);
                if (this._ctrlEvent.startStretchXY[0] !== null && this._ctrlEvent.startStretchXY[1] !== null) {
                    let currentTarget = this.elementWrap,
                        width = null,
                        height = null,
                        x = this.get("X"),
                        y = this.get("Y"),
                        diffX = x - this._ctrlEvent.startStretchXY[0],
                        diffY = y - this._ctrlEvent.startStretchXY[1],
                        left = parseInt(currentTarget.style.left),
                        top = parseInt(currentTarget.style.top),
                        canvasW = drawingInfo.get("canvasW"),
                        canvasH = drawingInfo.get("canvasH"),
                        newTop = top,
                        newLeft = left,
                        margin = 0;

                    if(this.editCanvasBox.style.display !== "none"){
                        width = parseInt(this.elementWrap.style.width) - 2;   //editCanva宽度
                        height = parseInt(this.elementWrap.style["min-height"]) - 2;
                    }
                    else{
                        width = parseInt(this.inputDiv.style.width);
                        height = parseInt(this.inputDiv.style["min-height"]);
                    }

                    let newWidth = width,
                        newHeight = height;

                    console.log(`1：${newWidth}, ${newHeight}`);
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
                    console.log(`2：${newWidth}, ${newHeight}`);
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
                    console.log(`3：${newWidth}, ${newHeight}`);
                    if(this.editCanvasBox.style.display !== "none"){
                        margin = 0;
                        var canvasWidth = parseInt(this.editCanvasBox.width),
                            canvasHeight = parseInt(this.editCanvasBox.height);
                        this._imageStretch(this.editCanvasBox, newWidth, newHeight);
                        this._drawDiffShapes();
                    }
                    if(this.inputDiv.style.display !== "none"){
                        margin = 4;
                        this._appendStyle(this.inputDiv, {
                            width: newWidth + "px",
                            "min-height": newHeight + "px"
                        });
                    }
                    this._appendStyle(currentTarget, {
                        top: newTop + "px",
                        left: newLeft + "px",
                        width: newWidth + margin + 2 +"px",
                        "min-height": newHeight + 2 + margin + "px"
                    });
                    this._displaySelectSize(newWidth + margin + 2, newHeight + 2 + margin);
                    this._ctrlEvent.startStretchXY = [x, y];
                }
                break;
            case "mouseup":
            case "mouseleave":
            case "touchend":
                this._ctrlEvent.startStretchXY = [null, null];
                var recover =  function (){
                    this.addHandler(this.canvasWrap, "click", this._drawImageHandler);
                    EventUtil.removeHandler(this.canvasWrap, "click", recover);
                }.bind(this);
                EventUtil.addHandler(this.canvasWrap, "click", recover);
                // this._addVirtualBoxHandler(); //注意这里无法使用，不能动态删除同一个对象的handler
                break;
        }
    },
    //添加移动事件处理程序
    //将移动及拉伸选框事件合二为一
    _addMoveAndStretchElementHandler: function(){
        //move事件
        this.addHandler(this.canvasWrap, "mousedown", this._moveElement);
        this.addHandler(this.canvasWrap, "touchstart", this._moveElement);
        this.addHandler(this.canvasWrap, "mouseup", this._moveElement);
        this.addHandler(this.canvasWrap, "touchmove", this._moveElement);
        this.addHandler(this.canvasWrap, "mousemove", this._moveElement);
        this.addHandler(this.canvasWrap, "touchend", this._moveElement);
        this.addHandler(this.canvasWrap, "mouseleave", this._moveElement);
        //拉伸事件
        this.addHandler(this.canvasWrap, "mousedown", this._stretchElement);
        this.addHandler(this.canvasWrap, "touchstart", this._stretchElement);
        this.addHandler(this.canvasWrap, "mouseup", this._stretchElement);
        this.addHandler(this.canvasWrap, "touchmove", this._stretchElement);
        this.addHandler(this.canvasWrap, "mousemove", this._stretchElement);
        this.addHandler(this.canvasWrap, "touchend", this._stretchElement);
        this.addHandler(this.canvasWrap, "mouseleave", this._stretchElement);
    },
    _removeMoveAndStretchElementHandler: function(){
        //move事件
        this.removeHandler(this.canvasWrap, "mousedown", this._moveElement);
        this.removeHandler(this.canvasWrap, "mousemove", this._moveElement);
        this.removeHandler(this.canvasWrap, "mouseup", this._moveElement);
        this.removeHandler(this.canvasWrap, "touchstart", this._moveElement);
        this.removeHandler(this.canvasWrap, "touchmove", this._moveElement);
        this.removeHandler(this.canvasWrap, "touchend", this._moveElement);
        this.removeHandler(this.canvasWrap, "mouseleave", this._moveElement);
        //拉伸事件
        this.removeHandler(this.canvasWrap, "mousedown", this._stretchElement);
        this.removeHandler(this.canvasWrap, "mousemove", this._stretchElement);
        this.removeHandler(this.canvasWrap, "mouseup", this._stretchElement);
        this.removeHandler(this.canvasWrap, "touchstart", this._stretchElement);
        this.removeHandler(this.canvasWrap, "touchmove", this._stretchElement);
        this.removeHandler(this.canvasWrap, "touchend", this._stretchElement);
        this.removeHandler(this.canvasWrap, "mouseleave", this._stretchElement);
        //拖拽效果事件
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
        if(temp !== ""){
            arr.push(temp);
        }
        return arr;
    },

    //将字符分行，用于canvas书写字符
    _wordBreak: function(context, string, width){
        // var regEX = /[a-zA-Z0-9]+|\s|[\u4e00-\u9fa5]|\S/g;
        var regEX = /[a-zA-Z0-9]+|\s|[\u4e00-\u9fa5][\·|\%|\!|\-|\——|\、|\:|\：|\;|\；|\"|\“|\”|\‘|\’|\'|\,|\，|\.|\。|\?|\？|\》|\>|\/]*|\S/g;
        var array = string.match(regEX),
            temp = "",
            tempCopy = "",
            rowArray = [];

        if(!string){
            return [];
        }

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
                    // a += arg.length-2;
                }
                else{
                    rowArray.push(temp);
                    temp = "";
                }
            }
            tempCopy = temp;
            console.log(array);
        }
        if(temp !== ""){
            rowArray.push(temp);
        }
        return rowArray;
    },
    //提取富文本输入框的文本内容,将分段内容分组，以数组返回
    _filterText: function f(target){
        var arr = [],
            i = null,
            len = null,
            nodes = null,
            tempArr = [];
        if(!target){
            return arr;
        }
        len = target.childNodes.length;
        if(len === 0){
            return arr;
        }
        nodes = target.childNodes;
        for(i = 0; i < len; i++){
            if(nodes[i].nodeType === 3){
                arr.push(nodes[i].nodeValue);
            }
            else{
                tempArr = f(nodes[i]);
                if(tempArr.length !== 0){
                    arr.push(tempArr.join(""));
                }
            }
        }
        return arr;
    },
    //将每段内容再分行
    /*
    * target: 富文本输入框
    * */
    _breakLine: function(target, context, width){
        var arr = this._filterText(target),
            i = null,
            len = arr.length,
            rowArr = [];
        for(i = 0; i < len; i++){
            rowArr = rowArr.concat(this._wordBreak(context, arr[i], width));
        }
        return rowArr;
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
            input = options.input,
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

        context.fillStyle = backColor;
        context.fillRect(x, y+4, width, height);
        context.fillStyle = color;
        context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        context.textAlign = textAlign;
        context.textBaseline = textAlign;
        // var row = this._wordBreak(context, string, width);
        var row = this._breakLine(input, context, width);
        for(var b = 0; b < row.length; b++){
            context.fillText(row[b],x,y+(b+1)*height);
        }
    },
    _strokeText: function(){
        var width,height;
        if(drawingInfo.get("behavior") === "text"){
            if(this.elementWrap.style.display === "inline-block"){
                this._drawText({
                    context: this.context,
                    input: this.inputDiv,
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
                this._appendStyle(this.inputDiv, {
                    display: "none",
                });
                this.inputDiv.innerHTML = "";
                // this._removeTextInputHandler();
                this._removeMoveAndStretchElementHandler();
                this._displaySelectSize(0, 0);
                this._saveDrawingToBuffer();
            }
        }
    },
    //点击书写文本
    _fillText: function(){
        var width,height;
        if(drawingInfo.get("behavior") === "text"){
            if(this.elementWrap.style.display === "inline-block"){
                this._drawText({
                    context: this.context,
                    input: this.inputDiv,
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
                this._appendStyle(this.inputDiv, {
                    display: "none",
                });
                this.inputDiv.innerHTML = "";
                // this._removeTextInputHandler();
                this._removeMoveAndStretchElementHandler();
                this._displaySelectSize(0, 0);
                this._saveDrawingToBuffer();
            }
            else{
                width = this.get("diffX")> 120? this.get("diffX"): 120;
                height = this.get("diffY")> 20? this.get("diffY"): 20;
                this._appendStyle(this.elementWrap, {
                    display: "inline-block",
                    top: this.get("startY")+"px",
                    left: this.get("startX")+"px",
                    width: width + 6 + "px",
                    "min-height": height + 6 +"px"
                });
                this._displaySelectSize(width + 6, height + 6);
                this._appendStyle(this.inputDiv, {
                    display: "inline-block",
                    color: drawingInfo.get("color"),
                    backgroundColor: drawingInfo.get("backgroundColor"),
                    width: width + "px",
                    "min-height": height + "px"
                });
                this.inputDiv.focus();
                this._addMoveAndStretchElementHandler();
                this.addHandler(this, "handlers", this._strokeText);   //添加新的事件处理
                // this._handle(null, this._filterText);
            }
        }
    },
    //处理文本输入事件
    _textInputHandler: function (event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        if(target.id === "canvasBox"||target.id === "canvasWrap"){
            this._fillText();
        }
    },
    //拉拽时的虚拟框效果
    _virtualBox: function(event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        switch (event.type) {
            case "mousedown":
            case "touchstart":
                // if(this.elementWrap.style.display === "inline-block"){
                //     this._appendStyle(this.elemenDecorate, {
                //         display: "none",
                //         // top: this.elementWrap.style.top,  //减去实线宽度
                //         // left: this.elementWrap.style.left,
                //     });
                // }
                // else{
                    this._appendStyle(this.elemenDecorate, {
                        display: "inline-block",
                        top: this.get("Y")+"px",  //减去实线宽度
                        left: this.get("X")+"px",
                    });
                // }
                break;
            case "mousemove":
            case "touchmove":
                // if(this.elementWrap.style.display === "inline-block"){
                //     if(this.get("clicking")){
                //         this._appendStyle(this.elemenDecorate, {
                //             width: parseInt(this.elementWrap.style.width) + this.get("diffX") + 2 + "px",
                //             height: parseInt(this.elementWrap.style.height) + this.get("diffY") + 2 + "px",
                //         });
                //     }
                // }
                // else{
                if(this.get("clicking")){
                    this._appendStyle(this.elemenDecorate, {
                        width: this.get("diffX") + 2 + "px",
                        height: this.get("diffY") + 2 + "px",
                    });
                }
                // }
                break;
            case "mouseup":
            case "mouseleave":
            case "touchend":
                if(this.elemenDecorate.style.display !== "none"){
                    this._appendStyle(this.elemenDecorate, {
                        display: "none",
                        top: 0,  //减去实线宽度
                        left: 0,
                        width: 0,
                        height: 0
                    });
                }
                break;
        }
    },
    //虚线框效果处理事件
    _addVirtualBoxHandler: function(){
        this.addHandler(this.canvasWrap, "mousedown", this._virtualBox);
        this.addHandler(this.canvasWrap, "touchstart", this._virtualBox);
        this.addHandler(this.canvasWrap, "mouseup", this._virtualBox);
        this.addHandler(this.canvasWrap, "touchmove", this._virtualBox);
        this.addHandler(this.canvasWrap, "mousemove", this._virtualBox);
        this.addHandler(this.canvasWrap, "touchend", this._virtualBox);
        this.addHandler(this.canvasWrap, "mouseleave", this._virtualBox);
    },
    _removeVirtualBoxHandler: function(){
        this.removeHandler(this.canvasWrap, "mousedown", this._virtualBox);
        this.removeHandler(this.canvasWrap, "mousemove", this._virtualBox);
        this.removeHandler(this.canvasWrap, "mouseup", this._virtualBox);
        this.removeHandler(this.canvasWrap, "touchstart", this._virtualBox);
        this.removeHandler(this.canvasWrap, "touchmove", this._virtualBox);
        this.removeHandler(this.canvasWrap, "touchend", this._virtualBox);
        this.removeHandler(this.canvasWrap, "mouseleave", this._virtualBox);
    },
    //文本加载事件
    _addTextInputHandler: function(){
        //拖拽效果事件
        this._addVirtualBoxHandler();
        //在桌面系统中，通过click事件触发显示隐藏文本框
        if(client.system.win||client.system.mac||client.system.x11){
            this.addHandler(this.canvasWrap, "click", this._textInputHandler);
        }
        else{
            //在移动设备中，通过touchend事件触发显示隐藏文本框
            this.addHandler(this.canvasWrap, "touchend", this._textInputHandler);
        }
    },
    //删除文本事件
    _removeTextInputHandler: function(){
        this.text.classList.remove("selected");
        //拖拽效果事件
        this._removeVirtualBoxHandler();
        if(client.system.win||client.system.mac||client.system.x11){
            this.removeHandler(this.canvasWrap, "click", this._textInputHandler);
        }
        else{
            //在移动设备中，通过touchend事件触发显示隐藏文本框
            this.removeHandler(this.canvasWrap, "touchend", this._textInputHandler);
        }
    },
    //
    _imageStretch: function(target, width, height){
        var ctx = target.getContext("2d");
        if(!drawingInfo.get("imageStretch")){
            var imageStretch = function(){
                this._resizeCanvasBox(target, width, height);
                ctx.clearRect(0, 0, target.width, target.height);
                ctx.scale(width/this.image.width, height/this.image.height);
                ctx.drawImage(this.image, 0, 0);
                ctx.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                EventUtil.removeHandler(this.image, "load", imageStretch);
                console.log("imageStretch");
            }.bind(this);
            EventUtil.addHandler(this.image, "load", imageStretch);
            this.image.src = target.toDataURL("image/png");
            drawingInfo.set("imageStretch", true);
        }
        else{
            this._resizeCanvasBox(target, width, height);
            ctx.clearRect(0, 0, target.width, target.height);
            ctx.scale(width/this.image.width, height/this.image.height);
            ctx.drawImage(this.image, 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
        }

    },
    //实现复制图片
    _imgReader: function( item , isOpenFile){
        var blob,
            reader = new FileReader();
        blob = isOpenFile? item: item.getAsFile();
        //get image src
        var getImageSrc = new Promise(function (resolve, reject){
            reader.onload = function(e){
                resolve(e.target.result);
                reader.onload = null;
            };
            reader.readAsDataURL(blob);
        });
        //image on load
        function loadImage (src){
            var that = this;
            return new Promise(function (resolve, reject){
                that.image.onload = function(e){
                    resolve();
                    that.image.onload = null;
                };
                that.image.src = src;
            });
        }

        getImageSrc.then(loadImage.bind(this)).then(function(){
            var canvasW = drawingInfo.get("canvasW"),
                canvasH = drawingInfo.get("canvasH");
            canvasW = (canvasW>this.image.width)? canvasW: this.image.width;
            canvasH = (canvasH>this.image.height)? canvasH: this.image.height;
            this._resizeCanvasBox(this.canvasBox, canvasW, canvasH);
            //显示选择框
            this._showSelectObj(true);
            this._appendStyle(this.elementWrap, {
                top: "-1px",
                left: "-1px",
                width: this.image.width + 2 + "px",
                "min-height": this.image.height + 2 + "px",
            });
            this._appendStyle(this.editCanvasBox, {
                top: "0px",
                left: "0px",
            });
            this._getImg({    //将image图片读取到editCanvasBox
                width: this.image.width,
                height: this.image.height,
            });
            if(isOpenFile){
                this._resizeCanvasBox(this.canvasBox, this.image.width, this.image.height);
                this._renderCanvas();
            }
        }.bind(this));
    },
    //判断是否存在剪贴板数据，并将剪贴板图片粘贴值img标签
    _clipboardDataHandle: function(clipboardData){
        var i = 0,
            items, item, types;
        if(clipboardData){
            items = clipboardData.items;

            if(!items){
                return false;
            }

            item = items[0];
            types = clipboardData.types || [];

            for( ; i < types.length; i++ ){
                if( types[i] === 'Files' ){
                    item = items[i];
                    break;
                }
            }

            if( item && item.kind === 'file' && item.type.match(/^image\//i) ){
                this._imgReader(item);
                return true;
            }
            return false;
        }
    },
    _imgPasteHandler: function(event){
        event = EventUtil.getEvent(event);
        var clipboardData = event.clipboardData,
            canvasW = drawingInfo.get("canvasW"),
            canvasH = drawingInfo.get("canvasH");

        this._showSelectObj(true);
        if(this._clipboardDataHandle(clipboardData)){
        }
        else{
            if(this.get("copyImageData") === null){
                return null;
            }
            if(this.elementWrap.style.display === "inline-block"){

            }

            var imageWidth = this.get("copyImageData").width,
                imageHeight = this.get("copyImageData").height;
            canvasW = (canvasW>imageWidth)? canvasW: imageWidth;
            canvasH = (canvasH>imageHeight)? canvasH: imageHeight;
            // this._showSelectObj(true);
            this._appendStyle(this.elementWrap, {
                top: "-1px",
                left: "-1px",
            });
            this._appendStyle(this.editCanvasBox, {
                top: "0px",
                left: "0px",
            });
            this._resizeCanvasBox(this.canvasBox, canvasW, canvasH);
            this._resizeCanvasBox(this.editCanvasBox, imageWidth, imageHeight);
            this.editContext.putImageData(this.get("copyImageData").imageData, 0 , 0);
        }
        // this.addHandler(this, "handlers", this._renderCanvas);   //添加新的事件处理
        // var handle = function(){
        //     this._renderCanvas();
        //     this.removeHandler(this.canvasWrap, "click", handle);
        // }.bind(this);
        // this.addHandler(this.canvasWrap, "click", handle);
        this._handle(this._addDrawImageHandler, this._removeDrawImageHandler);
    },
    //添加粘贴事件
    _addImgPasteHandler: function(){
        this.addHandler(document, "paste", this._imgPasteHandler);
    },
    //移除粘贴事件
    _removeImgPasteHandler: function(){
        this.removeHandler(document, "paste", this._imgPasteHandler);
    },
    //模拟粘贴事件处理程序
    _copyPasteHandler: function(event){
        if(drawingInfo.get("description") === "paste"){
            this._imgPasteHandler(event);
        }
    },
    _addCopyPasteHandler: function(){
        this.addHandler(document, "copy", this._copyPasteHandler);
    },
    _removeCopyPasteHandler: function(){
        this.removeHandler(document, "copy", this._copyPasteHandler);
    },
    //点击复制按键事件，这个事件直接会通过document.execCommand触发，主要是为了在复制事件中清空系统剪贴板
    _pasteButtonHandler: function(event){
        try{
            drawingInfo.set("description", "paste");
            document.execCommand('copy');   //因为chrome无法执行paste指令，故通过copy事件，以便js程序访问剪贴板
        }
        catch(err){
            console.log("不支持document.execCommand方法，无法复制,可通过Ctrl+V粘贴");
        }
        // this._imgPasteHandler();
    },
    _addPasteButtonHandler: function(){
        this.addHandler(this.paste, "click", this._pasteButtonHandler);
    },
    _removePasteButtonHandler: function(){
        this.removeHandler(this.paste, "click", this._pasteButtonHandler);
    },
    //将选择框中的内容绘制到当前区域
    _drawImage: function(options){
         var top = options.top || 0,
             left = options.left || 0,
             width = options.width || 0,
             height = options.height || 0;
        if(!(width&&height)){
            return null;
        }
        var imageData = this.editContext.getImageData(0, 0, width, height);
        this.context.putImageData(imageData, left, top);
        // this.editContext.clearRect(0, 0, width, height);
    },
    //将当前区域内容绘制到选择框
    _getImage: function(options){
        var top = options.top || 0,
            left = options.left || 0,
            width = options.width || 0,
            height = options.height || 0;

            if(width === 0 || height === 0){
                return null;
            }
        var imageData = this.context.getImageData(left, top, width, height);
        this.context.clearRect(left, top, width, height);
        this.editContext.clearRect(0, 0, width, height);
        this.editContext.putImageData(imageData, 0, 0);
    },
    //将img标签的图片数据绘制到editCanvas
    _getImg: function(options){
        var top = options.top || 0,
            left = options.left || 0,
            width = options.width || 0,
            height = options.height || 0,
            image = options.image || this.image,
            target = options.target || this.editCanvasBox;
        this._resizeCanvasBox(target, width, height);
        this.editContext.clearRect(0, 0, width, height);
        this.editContext.drawImage(image, 0, 0);
    },
    //选择框
    //显示选择框
    _displaySelectBox: function(toDisplay){
        if(toDisplay){
            this._appendStyle(this.elementWrap, {
                display: "inline-block",
                top: this.get("startY")+"px",
                left: this.get("startX")+"px",
                width: this.get("diffX")+ 2 +"px",
                "min-height": this.get("diffY")+ 2 +"px"
            });
            this._displaySelectSize(this.get("diffX")+ 2, this.get("diffY")+ 2);
            this._appendStyle(this.editCanvasBox, {
                display: "inline-block",
                top: this.get("startY")+ 1 +"px",
                left: this.get("startX")+1 + "px",
                width: this.get("diffX"),
                height: this.get("diffY")
            });
        }
        else{
            this._displaySelectSize(0, 0);
            this._appendStyle(this.elementWrap, {display: "none"});
            this._appendStyle(this.editCanvasBox, {display: "none"});
        }
    },
    //按钮样式
    _buttonStyle: function(toHighlight){
            if(toHighlight){
                this.cut.classList.remove("unused");
                this.copy.classList.remove("unused");
                this.clip.classList.remove("unused");
            }
            else{
                this.cut.classList.add("unused");
                this.copy.classList.add("unused");
                this.clip.classList.add("unused");
            }
        },
    //处理事件
    _addOrRemoveHandler: function (toAdd) {
        if(toAdd){
            this._addCutHandler();
            this._addCutButtonHandler();
            this._addCopyHandler();
            this._addCopyButtonHandler();
            this._addMoveAndStretchElementHandler();
            this._addClipButtonHandler();
        }
        else{
            this._removeCopyButtonHandler();
            this._removeCopyHandler();
            this._removeCutButtonHandler();
            this._removeCutHandler();
            this._removeMoveAndStretchElementHandler();
            this._removeClipButtonHandler();
        }
    },
    _showSelectObj: function(toShow){
        this._displaySelectBox(toShow);
        this._buttonStyle(toShow);
        this._addOrRemoveHandler(toShow);
    },
    _renderCanvas: function(){
        this._drawImage({
            left: parseInt(this.editCanvasBox.style.left),    //注意，后续可能将editCanvas改成绝对定位
            top: parseInt(this.editCanvasBox.style.top),
            width: this.editCanvasBox.width,
            height: this.editCanvasBox.height,
        });
        this._showSelectObj(false);
        drawingInfo.set("imageStretch", false);
        this._saveDrawingToBuffer();
    },
    //notFill： 为了模拟剪切事件不填充的效果
    _fillImage: function (notFill) {
        var width,height;
        if(drawingInfo.get("behavior") === "select"||drawingInfo.get("behavior") === "paste"){
            if(this.elementWrap.style.display === "inline-block"){
                if(!notFill){
                    this._drawImage({
                        left: parseInt(this.editCanvasBox.style.left),    //注意，后续可能将editCanvas改成绝对定位
                        top: parseInt(this.editCanvasBox.style.top),
                        width: this.editCanvasBox.width,
                        height: this.editCanvasBox.height,
                    });
                }
                // this._appendStyle(this.elementWrap, {
                //     display: "none",
                // });
                // this._appendStyle(this.editCanvasBox, {
                //     display: "none",
                // });
                // this.cut.classList.add("unused");
                // this.copy.classList.add("unused");
                // this.clip.classList.add("unused");
                // // this._removeTextInputHandler();
                // this._removeCopyButtonHandler();
                // this._removeCopyHandler();
                // this._removeCutButtonHandler();
                // this._removeCutHandler();
                // this._removeMoveAndStretchElementHandler();
                this._showSelectObj(false);

                drawingInfo.set("imageStretch", false);
                drawingInfo.set("description", "");
                this._saveDrawingToBuffer();
            }
            else{
                // this._appendStyle(this.elementWrap, {
                //     display: "inline-block",
                //     top: this.get("startY")+"px",
                //     left: this.get("startX")+"px",
                //     width: this.get("diffX")+ 2 +"px",
                //     height: this.get("diffY")+ 2 +"px"
                // });
                // this._appendStyle(this.editCanvasBox, {
                //     display: "inline-block",
                //     top: this.get("startY")+ 1 +"px",
                //     left: this.get("startX")+1 + "px",
                //     width: this.get("diffX"),
                //     height: this.get("diffY")
                // });
                this._showSelectObj(true);
                this._getImage({
                    left: parseInt(this.editCanvasBox.style.left),    //注意，后续可能将editCanvas改成绝对定位
                    top: parseInt(this.editCanvasBox.style.top),
                    width: this.editCanvasBox.width,
                    height: this.editCanvasBox.height,
                });
                // this.addHandler(this, "handlers", this._fillImage);   //添加新的事件处理
                // this.cut.classList.remove("unused");
                // this.copy.classList.remove("unused");
                // this.clip.classList.remove("unused");
                // this._addCutHandler();
                // this._addCutButtonHandler();
                // this._addCopyHandler();
                // this._addCopyButtonHandler();
                // this._addMoveAndStretchElementHandler();
            }
        }
    },
    //处理
    _drawImageHandler: function (event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        if(target.id === "canvasBox"||target.id === "canvasWrap"){
            this._fillImage();
        }
    },
    //image事件
    _addDrawImageHandler: function(){
        this.canvasBox.style.cursor = "crosshair";
        // handleTarget.classList.toggle("selected");
        this.selectButton.classList.add("selected");
        //拖拽效果事件
        this._addVirtualBoxHandler();
        // this.addHandler(this.canvasWrap, "click", this._drawImageHandler);
        //在桌面系统中，通过click事件触发显示隐藏文本框
        if(client.system.win||client.system.mac||client.system.x11){
            this.addHandler(this.canvasWrap, "click", this._drawImageHandler);
        }
        else{
            //在移动设备中，通过touchend事件触发显示隐藏文本框
            this.addHandler(this.canvasWrap, "touchend", this._drawImageHandler);
        }
    },
    //image事件
    _removeDrawImageHandler: function(){
        this.selectButton.classList.remove("selected");
        //拖拽效果事件
        this.imgWrap.classList.remove("selected");
        this.selectButton.classList.remove("selected");
        this._removeVirtualBoxHandler();
        // this.removeHandler(this.canvasWrap, "click", this._drawImageHandler);
        if(client.system.win||client.system.mac||client.system.x11){
            this.removeHandler(this.canvasWrap, "click", this._drawImageHandler);
        }
        else{
            //在移动设备中，通过touchend事件触发显示隐藏文本框
            this.removeHandler(this.canvasWrap, "touchend", this._drawImageHandler);
        }
    },
    //复制/剪切操作
    //target：选取中的canvas,这个复制事件不会吧图片插入系统剪贴板，只会清空系统剪贴板，并把数据保留在本地
    _copy: function(target){
        var context = target.getContext("2d");
        //图片加载后，执行复制操作
        // EventUtil.addHandler(this.image, "load", function(event){
            // var range = null;
            // var node = document.querySelector("#selectable");
            // if (document.selection) {
            //     range = document.body.createTextRange();
            //     range.moveToElementText(node);
            //     range.select();
            // } else if (window.getSelection) {
            //     var selection = window.getSelection();
            //     range = document.createRange();
            //     range.selectNode(node);
            //     selection.removeAllRanges();
            //     selection.addRange(range);
            // }
            // try{
            //     if(document.execCommand('Copy')){
            //         console.log("复制成功");
            //     }
            //     else{
            //         console.log("复制失败");
            //     }
            //
            // }
            // catch(err){
            //     console.log("不支持document.execCommand方法，无法复制");
            // }
            // this._fillImage();
        // });
        // this.image.src = target.toDataURL("image/png");
        var copyImageData = {};
        if(target.style.display === "inline-block"){
            copyImageData.imageData = context.getImageData(0, 0, target.width, target.height);
            copyImageData.width = target.width;
            copyImageData.height = target.height;
            this.set("copyImageData", copyImageData);
        }
    },
    //点击复制按键事件，这个事件直接会通过document.execCommand触发，主要是为了在复制事件中清空系统剪贴板
    _copyButtonHandler: function(event){
        try{
            drawingInfo.set("description", "copy");
            document.execCommand('Copy');
        }
        catch(err){
            console.log("不支持document.execCommand方法，无法复制,可通过Ctrl+C复制");
        }
    },
    _addCopyButtonHandler: function(){
        this.addHandler(this.copy, "click", this._copyButtonHandler);
    },
    _removeCopyButtonHandler: function(){
        this.removeHandler(this.copy, "click", this._copyButtonHandler);
    },
    //处理复制事件的事件处理程序
    _copyHandler: function(event){
        if(drawingInfo.get("description") !== "paste"){
            event = EventUtil.getEvent(event);
            event.preventDefault();
            EventUtil.setClipboardText(event, "");   //清空系统剪贴板，后续判断系统剪贴板存在图片数据的话，可知，系统剪贴板数据为最新复制
            this._copy(this.editCanvasBox);
            drawingInfo.set("description", "");
        }
    },
    _addCopyHandler: function(){
        this.addHandler(document, "copy", this._copyHandler);
    },
    _removeCopyHandler: function(){
        this.removeHandler(document, "copy", this._copyHandler);
    },
    _cut: function(target){
        this._copy(target);
        this._fillImage(true);  //不填充
    },
    //点击复制按键事件，这个事件直接会通过document.execCommand触发，主要是为了在复制事件中清空系统剪贴板
    _cutButtonHandler: function(event){
        try{
            document.execCommand('Cut');
        }
        catch(err){
            console.log("不支持document.execCommand方法，无法复制,可通过Ctrl+C复制");
        }
    },
    _addCutButtonHandler: function(){
        this.addHandler(this.cut, "click", this._cutButtonHandler);
    },
    _removeCutButtonHandler: function(){
        this.removeHandler(this.cut, "click", this._cutButtonHandler);
    },
    //处理复制事件的事件处理程序
    _cutHandler: function(event){
        event = EventUtil.getEvent(event);
        event.preventDefault();
        EventUtil.setClipboardText(event, "");   //清空系统剪贴板，后续判断系统剪贴板存在图片数据的话，可知，系统剪贴板数据为最新复制
        this._cut(this.editCanvasBox);
    },
    _addCutHandler: function(){
        this.addHandler(document, "cut", this._cutHandler);
    },
    _removeCutHandler: function(){
        this.removeHandler(document, "cut", this._cutHandler);
    },
    _clip: function(target){
        var context = target.getContext("2d");
        if(target.style.display === "inline-block"){
            this._appendStyle(this.elementWrap, {
                top: "-1px",
                left: "-1px",
            });
            this._appendStyle(target, {
                top: "0px",
                left: "0px",
            });
            this._resizeCanvasBox(this.canvasBox, target.width, target.height);
            this._fillImage();
        }
    },
    _clipButtonHandle: function(){
        this._clip(this.editCanvasBox);
    },
    _addClipButtonHandler: function(){
        this.addHandler(this.clip, "click", this._clipButtonHandle);
    },
    _removeClipButtonHandler: function(){
        this.removeHandler(this.clip, "click", this._clipButtonHandle);
    },
    //形状栏向上或者向下事件
    _arrowEvent: function(event){
        event = EventUtil.getEvent(event);
        EventUtil.stopPropagation(event);
        var target = EventUtil.getTarget(event),
            wrapDivWidth = this.wrapDiv.offsetWidth,
            wrapDivHeight = this.wrapDiv.offsetHeight,
            top = this.wrapDiv.style.top? parseInt(this.wrapDiv.style.top):0,
            that = this;

        function move(diffTop){
            if(top + diffTop >= 60-wrapDivHeight && top + diffTop <= 0){
                that.wrapDiv.style.top = top + diffTop + "px";
            }
            if(top + diffTop <= 60-wrapDivHeight){
                that.arrowDown.classList.add("unused");
            }
            else{
                that.arrowDown.classList.remove("unused");
            }
            if(top + diffTop >= 0){
                that.arrowUp.classList.add("unused");
            }
            else {
                that.arrowUp.classList.remove("unused");
            }
        }
        if(target.id === "arrow-up"||target.parentNode.id === "arrow-up"){
            move(20);
        }
        else if(target.id === "arrow-down"||target.parentNode.id === "arrow-down"){
            move(-20);
        }
        else if(target.id === "arrow-drop"||target.parentNode.id === "arrow-drop"||target.parentNode.parentNode.id === "arrow-drop"){
            this.wrapLeft.classList.add("shape-wrap-left-abs");
            this.wrapDiv.classList.add("shape-wrap-left-img-abs");
            this.wrapDiv.classList.remove("animate");
            this._appendStyle(this.wrapDiv, {
                // position: "absolute",
                top: 0,
                // width: wrapDivWidth + 16 + "px",
                // // overflow: "visible",
                // height: wrapDivHeight + "px",
                //
                // "overflow-y": "scroll",
            });
            var handle = function(event){
                event = EventUtil.getEvent(event);
                var target = EventUtil.getTarget(event);
                if(target.id !== "arrow-drop" && target.parentNode.id !== "arrow-drop"&& target.parentNode.parentNode.id !== "arrow-drop"){
                    that._appendStyle(that.wrapDiv, {
                        // position: "relative",
                        top: 0,
                        // width: wrapDivWidth + "px",
                        // // overflow: "visible",
                        // overflow: "hidden",
                    });
                    that.wrapDiv.classList.add("animate");
                    that.wrapLeft.classList.remove("shape-wrap-left-abs");
                    that.wrapDiv.classList.remove("shape-wrap-left-img-abs");
                }
                EventUtil.removeHandler(document.body, "click" , handle);
            };
            EventUtil.addHandler(document.body, "click" , handle);
        }
    },
    _addArrowEventHandle: function(){
        this.addHandler(this.scroll, "click", this._arrowEvent);
    },
    _removeArrowEventHandle: function(){
        this.removeHandler(this.scroll, "click", this._arrowEvent);
    },
    //形状绘图事件
    //将绘图用到的点保存在一个数组，创建一个绘制特定图形的方法
    //target: 要绘制图形的canvas， 这里应为editCanvas
    //dataArr： 绘制椭圆用的点，即elementWrap上的点，从上中，右中，下中，左中一次存入数组
    //将模板坐标转换为editCanwas坐标
    // _toCanvasXY: function(coordinate){
    //     var lineWeight = drawingInfo.get("lineWeight");
    //
    // },
    //模板坐标
    _ellipse: function(width, height){
        var lineWeight = drawingInfo.get("lineWeight");
            //假设elementWrap长宽都为1，定义绘图参数
            //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
        var  coordinate = {
                x: 0.5,
                y: 0.5,
                radiusX: 0.5,
                radiusY: 0.5
            },
            //x方向的放大系数
            xGain = (width - 1)>0? width - 1:1,
            yGain = (height - 1)>0? height - 1:1;
        coordinate.x = coordinate.x * xGain;
        coordinate.radiusX = coordinate.radiusX * xGain;
        coordinate.y = coordinate.y * yGain;
        coordinate.radiusY = coordinate.radiusY * yGain;
        //转换为editCanwas坐标
        coordinate.x = coordinate.x + 0.5*lineWeight;
        coordinate.y = coordinate.y + 0.5*lineWeight;
        return coordinate;
    },
    _drawEllipse: function(target, options){
        var ctx = target.getContext("2d"),
            lineWeight = options.lineWeight || drawingInfo.get("lineWeight"),
            radiusX = options.radiusX || lineWeight*0.5,
            radiusY = options.radiusY || lineWeight*0.5,
            x = options.x || 0,
            y = options.y || 0;

        ctx.moveTo(x + radiusX, y);

        if(ctx.ellipse){
            ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2*Math.PI, false);
            // ctx.stroke();
        }
        else{
            alert("浏览器canvas绘制椭圆");
        }
    },
    //矩形
    //模板坐标
    _rectangle: function(width, height){
        var lineWeight = drawingInfo.get("lineWeight");
        //假设elementWrap长宽都为1，定义绘图参数
        //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
        var  coordinate = {
                x: 0,
                y: 0,
                width: 1,
                height: 1
            },
            //x方向的放大系数
            xGain = (width - 1)>0? width - 1:1,
            yGain = (height - 1)>0? height - 1:1;
        coordinate.x = coordinate.x * xGain;
        coordinate.width = coordinate.width * xGain;
        coordinate.y = coordinate.y * yGain;
        coordinate.height = coordinate.height * yGain;
        //转换为editCanwas坐标
        coordinate.x = coordinate.x + 0.5*lineWeight;
        coordinate.y = coordinate.y + 0.5*lineWeight;
        return coordinate;
    },
    _drawRectangle: function(target, options){
        var ctx = target.getContext("2d"),
            lineWeight = options.lineWeight || drawingInfo.get("lineWeight"),
            x = options.x || lineWeight,
            y = options.y || lineWeight,
            width = options.width - 1,
            height = options.height -1;

        ctx.moveTo(x, y);
        ctx.rect(x, y, width, height);
    },
    //圆角矩形
    _circleRectangle: function(width, height){
        var lineWeight = drawingInfo.get("lineWeight");
        //假设elementWrap长宽都为1，定义绘图参数
        //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
        var  coordinate = {
                x: 0,
                y: 0,
                width: 1,
                height: 1,
                radius: 0.1
            },
            //x方向的放大系数，并转换为editCanwas坐标
            xGain = (width - 1)>0? width - 1:1,
            yGain = (height - 1)>0? height - 1:1;
        coordinate.x = 0.5*lineWeight;
        coordinate.y = 0.5*lineWeight;
        coordinate.width = coordinate.width * xGain;
        coordinate.height = coordinate.height * yGain;
        coordinate.radius = coordinate.width>coordinate.height? coordinate.radius * yGain + 0.5*lineWeight:coordinate.radius * xGain + 0.5*lineWeight;
        return coordinate;
    },
    _drawCircleRectangle: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height,
            radius = options.radius;
            ctx.moveTo(x+radius, y);
            ctx.lineTo(x+width-radius, y);
            ctx.arc(x+width-radius, y+radius, radius, -Math.PI*0.5, 0, false);
            ctx.lineTo(x+width, y+height-radius);
            ctx.arc(x+width-radius, y+height-radius, radius, 0, Math.PI*0.5, false);
            ctx.lineTo(x+radius, y+height);
            ctx.arc(x+radius, y+height-radius, radius, Math.PI*0.5, Math.PI, false);
            ctx.lineTo(x, y+radius);
            ctx.arc(x+radius, y+radius, radius, Math.PI, 1.5*Math.PI, false);
    },
    //三角形
    _triangle: function(width, height){
        var lineWeight = drawingInfo.get("lineWeight");
        //假设elementWrap长宽都为1，定义绘图参数
        //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
        var  coordinate = {
                x: 0,
                y: 0,
                width: 1,
                height: 1
            },
            //x方向的放大系数，并转换为editCanwas坐标
            xGain = (width - 1)>0? width - 1:1,
            yGain = (height - 1)>0? height - 1:1;
        coordinate.x = 0.5*lineWeight;
        coordinate.y = 0.5*lineWeight;
        coordinate.width = coordinate.width * xGain;
        coordinate.height = coordinate.height * yGain;
        coordinate.radius = coordinate.width>coordinate.height? coordinate.radius * yGain + 0.5*lineWeight:coordinate.radius * xGain + 0.5*lineWeight;
        return coordinate;
    },
    _drawTriangle: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x+width, y+height);
        ctx.lineTo(x, y+height);
        ctx.lineTo(x+width*0.5, y);
    },
    _drawRightTriangle: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x, y);
        ctx.lineTo(x+width, y+height);
        ctx.lineTo(x, y+height);
        ctx.lineTo(x, y);
    },
    //四边形 菱形
    _drawQuadrangle: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x+width, y+height*0.5);
        ctx.lineTo(x+width*0.5, y+height);
        ctx.lineTo(x, y+height*0.5);
        ctx.lineTo(x+width*0.5, y);
    },
    //五边形
    _drawPentagon: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x+width, y+height*0.35);
        ctx.lineTo(x+width*0.8, y+height);
        ctx.lineTo(x+width*0.2, y+height);
        ctx.lineTo(x, y+height*0.35);
        ctx.lineTo(x+width*0.5, y);
    },
    //六边形
    _drawHexagon: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x+width, y+height*0.25);
        ctx.lineTo(x+width, y+height*0.75);
        ctx.lineTo(x+width*0.5, y+height);
        ctx.lineTo(x, y+height*0.75);
        ctx.lineTo(x, y+height*0.25);
        ctx.lineTo(x+width*0.5, y);
    },
    //向右的箭头
    _drawShapeArrowRight: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x+width, y+height*0.5);
        ctx.lineTo(x+width*0.5, y+height);
        ctx.lineTo(x+width*0.5, y+height*0.75);
        ctx.lineTo(x, y+height*0.75);
        ctx.lineTo(x, y+height*0.25);
        ctx.lineTo(x+width*0.5, y+height*0.25);
        ctx.lineTo(x+width*0.5, y);
    },
    //向左的箭头
    _drawShapeArrowLeft: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x, y+height*0.5);
        ctx.lineTo(x+width*0.5, y+height);
        ctx.lineTo(x+width*0.5, y+height*0.75);
        ctx.lineTo(x+width, y+height*0.75);
        ctx.lineTo(x+width, y+height*0.25);
        ctx.lineTo(x+width*0.5, y+height*0.25);
        ctx.lineTo(x+width*0.5, y);
    },
    //向上的箭头
    _drawShapeArrowUp: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x, y+height*0.5);
        ctx.lineTo(x+width*0.25, y+height*0.5);
        ctx.lineTo(x+width*0.25, y+height);
        ctx.lineTo(x+width*0.75, y+height);
        ctx.lineTo(x+width*0.75, y+height*0.5);
        ctx.lineTo(x+width, y+height*0.5);
        ctx.lineTo(x+width*0.5, y);
    },
    //向下的箭头
    _drawShapeArrowDown: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.25, y);
        ctx.lineTo(x+width*0.75, y);
        ctx.lineTo(x+width*0.75, y+height*0.5);
        ctx.lineTo(x+width, y+height*0.5);
        ctx.lineTo(x+width*0.5, y+height);
        ctx.lineTo(x, y+height*0.5);
        ctx.lineTo(x+width*0.25, y+height*0.5);
        ctx.lineTo(x+width*0.25, y);
    },
    //四角星形
    _draw4Star: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x+width*0.6, y+height*0.4);
        ctx.lineTo(x+width, y+height*0.5);
        ctx.lineTo(x+width*0.6, y+height*0.6);
        ctx.lineTo(x+width*0.5, y+height);
        ctx.lineTo(x+width*0.4, y+height*0.6);
        ctx.lineTo(x, y+height*0.5);
        ctx.lineTo(x+width*0.4, y+height*0.4);
        ctx.lineTo(x+width*0.5, y);
    },
    _5star: function(width, height){
        var halfLineWeight = drawingInfo.get("lineWeight");
        //假设elementWrap长宽都为1，定义绘图参数
        //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
        var  coordinate = {
                x1: 0.5, y1: 0, x2: 0.618, y2: 0.382, x3: 1, y3: 0.4, x4: 0.696, y4: 0.62, x5: 0.808, y5: 1,
                x6: 0.5, y6:0.8, x7: 0.192, y7: 1, x8: 0.304, y8: 0.62, x9: 0, y9: 0.4, x10: 0.382, y10: 0.382
            },
            //x方向的放大系数，并转换为editCanwas坐标
            xGain = (width - 1)>0? width - 1:1,
            yGain = (height - 1)>0? height - 1:1;
        coordinate.x1 = coordinate.x1 * xGain + halfLineWeight;
        coordinate.x2 = coordinate.x2 * xGain + halfLineWeight;
        coordinate.x3 = xGain + halfLineWeight;
        coordinate.x4 = coordinate.x4 * xGain + halfLineWeight;
        coordinate.x5 = coordinate.x5 * xGain + halfLineWeight;
        coordinate.x6 = coordinate.x6 * xGain + halfLineWeight;
        coordinate.x7 = coordinate.x7 * xGain + halfLineWeight;
        coordinate.x8 = coordinate.x8 * xGain + halfLineWeight;
        coordinate.x9 = halfLineWeight;
        coordinate.x10 = coordinate.x10 * xGain + halfLineWeight;
        coordinate.y1 = halfLineWeight;
        coordinate.y2 = coordinate.y2 * yGain + halfLineWeight;
        coordinate.y3 = coordinate.y3 * yGain + halfLineWeight;
        coordinate.y4 = coordinate.y4 * yGain + halfLineWeight;
        coordinate.y5 = yGain + halfLineWeight;
        coordinate.y6 = coordinate.y6 * yGain + halfLineWeight;
        coordinate.y7 = yGain + halfLineWeight;
        coordinate.y8 = coordinate.y8 * yGain + halfLineWeight;
        coordinate.y9 = coordinate.y9 * yGain + halfLineWeight;
        coordinate.y10 = coordinate.y10 * yGain + halfLineWeight;
        return coordinate;
    },
    //五角星形
    _draw5Star: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(options.x1, options.y1);
        ctx.lineTo(options.x2, options.y2);
        ctx.lineTo(options.x3, options.y3);
        ctx.lineTo(options.x4, options.y4);
        ctx.lineTo(options.x5, options.y5);
        ctx.lineTo(options.x6, options.y6);
        ctx.lineTo(options.x7, options.y7);
        ctx.lineTo(options.x8, options.y8);
        ctx.lineTo(options.x9, options.y9);
        ctx.lineTo(options.x10, options.y10);
        ctx.lineTo(options.x1, options.y1);
    },
    //六角星形
    _draw6Star: function(target, options){
        var ctx = target.getContext("2d"),
            x = options.x,
            y = options.y,
            width = options.width,
            height = options.height;
        ctx.moveTo(x+width*0.5, y);
        ctx.lineTo(x+width*0.68, y+height*0.25);
        ctx.lineTo(x+width, y+height*0.25);
        ctx.lineTo(x+width*0.836, y+height*0.5);
        ctx.lineTo(x+width, y+height*0.75);
        ctx.lineTo(x+width*0.68, y+height*0.75);
        ctx.lineTo(x+width*0.5, y+height);
        ctx.lineTo(x+width*0.32, y+height*0.75);
        ctx.lineTo(x, y+height*0.75);
        ctx.lineTo(x+width*0.164, y+height*0.5);
        ctx.lineTo(x, y+height*0.25);
        ctx.lineTo(x+width*0.32, y+height*0.25);
        ctx.lineTo(x+width*0.5, y);
    },
    _heart: function(width, height){
        var halfLineWeight = drawingInfo.get("lineWeight")*0.5;
        //假设elementWrap长宽都为1，定义绘图参数
        //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
        var  coordinate = {
                x1: 0.5, y1: 0.26, x2: 0.412, y2: 0, x3: 0.226, y3: 0, x4: 0, y4: 0, x5: 0, y5: 0.3,
                x6: 0, y6:0.738, x7: 0.5, y7: 1,x8: 1, y8: 0.738, x9: 1, y9: 0.3, x10: 1, y10: 0,x11: 0.774, y11: 0,
                x12: 0.588, y12:0
            },
            //x方向的放大系数，并转换为editCanwas坐标
            xGain = (width - 1)>0? width - 1:1,
            yGain = (height - 1)>0? height - 1:1;
        coordinate.x1 = coordinate.x1 * xGain + halfLineWeight;
        coordinate.x2 = coordinate.x2 * xGain + halfLineWeight;
        coordinate.x3 = coordinate.x3 * xGain + halfLineWeight;
        coordinate.x4 = halfLineWeight;
        coordinate.x5 = halfLineWeight;
        coordinate.x6 = halfLineWeight;
        coordinate.x7 = coordinate.x7 * xGain + halfLineWeight;
        coordinate.x8 = xGain + halfLineWeight;
        coordinate.x9 = xGain + halfLineWeight;
        coordinate.x10 = xGain + halfLineWeight;
        coordinate.x11 = coordinate.x11 * xGain + halfLineWeight;
        coordinate.x12 = coordinate.x12 * xGain + halfLineWeight;
        coordinate.y1 = coordinate.y1 * yGain + halfLineWeight;
        coordinate.y2 = halfLineWeight;
        coordinate.y3 = halfLineWeight;
        coordinate.y4 = halfLineWeight;
        coordinate.y5 = coordinate.y5 * yGain + halfLineWeight;
        coordinate.y6 = coordinate.y6 * yGain + halfLineWeight;
        coordinate.y7 = yGain + halfLineWeight;
        coordinate.y8 = coordinate.y8 * yGain + halfLineWeight;
        coordinate.y9 = coordinate.y9 * yGain + halfLineWeight;
        coordinate.y10 = halfLineWeight;
        coordinate.y11 = halfLineWeight;
        coordinate.y12 = halfLineWeight;
        return coordinate;
    },
    //五角星形
    _drawHeart: function(target, options){
        var ctx = target.getContext("2d");
        ctx.moveTo(options.x1,options.y1);
        ctx.quadraticCurveTo(options.x2,options.y2,options.x3,options.y3);
        ctx.quadraticCurveTo(options.x4,options.y4,options.x5,options.y5);
        ctx.quadraticCurveTo(options.x6,options.y6,options.x7,options.y7);
        ctx.quadraticCurveTo(options.x8,options.y8,options.x9,options.y9);
        ctx.quadraticCurveTo(options.x10,options.y10,options.x11,options.y11);
        ctx.quadraticCurveTo(options.x12,options.y12,options.x1,options.y1);
    },
    _shapeDraw: function(target, shapeFunc, options){
        var editContext = target.getContext("2d");
        editContext.beginPath();
        editContext.lineWidth = drawingInfo.get("lineWeight");
        editContext.strokeStyle = drawingInfo.get("color");
        shapeFunc.call(this, target, options);
        editContext.closePath();
        editContext.stroke();
    },
    //显示选择框
    _displayDrawingSelectBox: function(toDisplay){
        if(toDisplay){
            this._appendStyle(this.elementWrap, {
                display: "inline-block",
                top: this.get("startY")+"px",
                left: this.get("startX")+"px",
                width: this.get("diffX")+ 2 +"px",
                "min-height": this.get("diffY")+ 2 +"px"
            });
            this._displaySelectSize(this.get("diffX")+ 2, this.get("diffY")+ 2);
            this._drawDiffShapes();
        }
        else{
            this._displaySelectSize(0, 0);
            this._appendStyle(this.elementWrap, {display: "none"});
            this._appendStyle(this.editCanvasBox, {display: "none"});
        }
    },
    _showDrawingSelectObj: function(toShow){
        this._displayDrawingSelectBox(toShow);
        this._addOrRemoveDrawingHandler(toShow);
    },
    _drawDiffShapes: function(){
        var behavior = drawingInfo.get("behavior"),
            description = drawingInfo.get("description"),
            lineWeight = drawingInfo.get("lineWeight"),
            diff = lineWeight*0.5,
            top = parseInt(this.elementWrap.style.top),
            left = parseInt(this.elementWrap.style.left),
            width = parseInt(this.elementWrap.style.width),
            height = parseInt(this.elementWrap.style["min-height"]),
            editCanvasStyle = {
                display: "inline-block",
                top: top + 0.5 - diff  + "px",
                left: left + 0.5 - diff  + "px",
                width: width + 2*lineWeight + 1,
                height: height + 2*lineWeight + 1
            },
            coordinate;
        if(behavior === "shape"){
            this._appendStyle(this.editCanvasBox, editCanvasStyle);
            switch (description)
            {
                case "ellipse":
                    coordinate = this._ellipse(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawEllipse, coordinate);
                    break;
                case "rectangle":
                    coordinate = this._rectangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawRectangle, coordinate);
                    break;
                case "circle-rectangle":
                    coordinate = this._circleRectangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawCircleRectangle, coordinate);
                    break;
                case "triangle":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawTriangle, coordinate);
                    break;
                case "right-triangle":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawRightTriangle, coordinate);
                    break;
                case "quadrangle":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawQuadrangle, coordinate);
                    break;
                case "pentagon":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawPentagon, coordinate);
                    break;
                case "hexagon":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawHexagon, coordinate);
                    break;
                case "shape-arrow-right":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawShapeArrowRight, coordinate);
                    break;
                case "shape-arrow-left":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawShapeArrowLeft, coordinate);
                    break;
                case "shape-arrow-up":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawShapeArrowUp, coordinate);
                    break;
                case "shape-arrow-down":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawShapeArrowDown, coordinate);
                    break;
                case "four-star":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._draw4Star, coordinate);
                    break;
                case "five-star":
                    coordinate = this._5star(width, height);
                    this._shapeDraw(this.editCanvasBox, this._draw5Star, coordinate);
                    break;
                case "six-star":
                    coordinate = this._triangle(width, height);
                    this._shapeDraw(this.editCanvasBox, this._draw6Star, coordinate);
                    break;
                case "heart":
                    coordinate = this._heart(width, height);
                    this._shapeDraw(this.editCanvasBox, this._drawHeart, coordinate);
                    break;
            }
        }
    },
    _drawShapeToCanvas: function(){
        var behavior = drawingInfo.get("behavior"),
            description = drawingInfo.get("description"),
            target = this.canvasBox,
            lineWeight = drawingInfo.get("lineWeight"),
            diff = lineWeight*0.5,
            top = parseInt(this.elementWrap.style.top),
            left = parseInt(this.elementWrap.style.left),
            width = parseInt(this.elementWrap.style.width),
            height = parseInt(this.elementWrap.style["min-height"]),
            coordinate;

        if(behavior === "shape"){
            switch (description)
            {
                case "ellipse":
                    coordinate = this._ellipse(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawEllipse, coordinate, true);
                    break;
                case "rectangle":
                    coordinate = this._rectangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawRectangle, coordinate, true);
                    break;
                case "circle-rectangle":
                    coordinate = this._circleRectangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawCircleRectangle, coordinate, true);
                    break;
                case "triangle":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawTriangle, coordinate, true);
                    break;
                case "right-triangle":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawRightTriangle, coordinate, true);
                    break;
                case "pentagon":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawPentagon, coordinate, true);
                    break;
                case "hexagon":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawHexagon, coordinate, true);
                    break;
                case "shape-arrow-right":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawShapeArrowRight, coordinate, true);
                    break;
                case "shape-arrow-left":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawShapeArrowLeft, coordinate, true);
                    break;
                case "shape-arrow-up":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawShapeArrowUp, coordinate, true);
                    break;
                case "shape-arrow-down":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawShapeArrowDown, coordinate, true);
                    break;
                case "four-star":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._draw4Star, coordinate, true);
                    break;
                case "five-star":
                    coordinate = this._5star(width, height);
                    coordinate.x1 = coordinate.x1 + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.x2 = coordinate.x2 + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.x3 = coordinate.x3 + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.x4 = coordinate.x4 + left + 0.5 - diff;
                    coordinate.x5 = coordinate.x5 + left + 0.5 - diff;
                    coordinate.x6 = coordinate.x6 + left + 0.5 - diff;
                    coordinate.x7 = coordinate.x7 + left + 0.5 - diff;
                    coordinate.x8 = coordinate.x8 + left + 0.5 - diff;
                    coordinate.x9 = coordinate.x9 + left + 0.5 - diff;
                    coordinate.x10 = coordinate.x10 + left + 0.5 - diff;
                    coordinate.y1 = coordinate.y1 + top + 0.5 - diff;
                    coordinate.y2 = coordinate.y2 + top + 0.5 - diff;
                    coordinate.y3 = coordinate.y3 + top + 0.5 - diff;
                    coordinate.y4 = coordinate.y4 + top + 0.5 - diff;
                    coordinate.y5 = coordinate.y5 + top + 0.5 - diff;
                    coordinate.y6 = coordinate.y6 + top + 0.5 - diff;
                    coordinate.y7 = coordinate.y7 + top + 0.5 - diff;
                    coordinate.y8 = coordinate.y8 + top + 0.5 - diff;
                    coordinate.y9 = coordinate.y9 + top + 0.5 - diff;
                    coordinate.y10 = coordinate.y10 + top + 0.5 - diff;
                    this._shapeDraw(target, this._draw5Star, coordinate, true);
                    break;
                case "six-star":
                    coordinate = this._triangle(width, height);
                    coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.y = coordinate.y + top + 0.5 - diff;
                    this._shapeDraw(target, this._draw6Star, coordinate, true);
                    break;
                case "heart":
                    coordinate = this._heart(width, height);
                    coordinate.x1 = coordinate.x1 + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.x2 = coordinate.x2 + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.x3 = coordinate.x3 + left + 0.5 - diff;   //转化为canvas坐标
                    coordinate.x4 = coordinate.x4 + left + 0.5 - diff;
                    coordinate.x5 = coordinate.x5 + left + 0.5 - diff;
                    coordinate.x6 = coordinate.x6 + left + 0.5 - diff;
                    coordinate.x7 = coordinate.x7 + left + 0.5 - diff;
                    coordinate.x8 = coordinate.x8 + left + 0.5 - diff;
                    coordinate.x9 = coordinate.x9 + left + 0.5 - diff;
                    coordinate.x10 = coordinate.x10 + left + 0.5 - diff;
                    coordinate.x11 = coordinate.x11 + left + 0.5 - diff;
                    coordinate.x12 = coordinate.x12 + left + 0.5 - diff;
                    coordinate.y1 = coordinate.y1 + top + 0.5 - diff;
                    coordinate.y2 = coordinate.y2 + top + 0.5 - diff;
                    coordinate.y3 = coordinate.y3 + top + 0.5 - diff;
                    coordinate.y4 = coordinate.y4 + top + 0.5 - diff;
                    coordinate.y5 = coordinate.y5 + top + 0.5 - diff;
                    coordinate.y6 = coordinate.y6 + top + 0.5 - diff;
                    coordinate.y7 = coordinate.y7 + top + 0.5 - diff;
                    coordinate.y8 = coordinate.y8 + top + 0.5 - diff;
                    coordinate.y9 = coordinate.y9 + top + 0.5 - diff;
                    coordinate.y10 = coordinate.y10 + top + 0.5 - diff;
                    coordinate.y11 = coordinate.y11 + top + 0.5 - diff;
                    coordinate.y12 = coordinate.y12 + top + 0.5 - diff;
                    this._shapeDraw(target, this._drawHeart, coordinate, true);
                    break;
            }
        }
    },
    _addOrRemoveDrawingHandler: function (toAdd) {
        if(toAdd){
            this._addMoveAndStretchElementHandler();
        }
        else{
            this._removeMoveAndStretchElementHandler();
        }
    },
    //
    _fillDrawing: function () {
        if(drawingInfo.get("behavior") === "shape"){
            if(this.elementWrap.style.display === "inline-block") {
                //     this._combineImage({
                //         left: parseInt(this.editCanvasBox.style.left),    //注意，后续可能将editCanvas改成绝对定位
                //         top: parseInt(this.editCanvasBox.style.top),
                //         width: this.editCanvasBox.width,
                //         height: this.editCanvasBox.height,
                //     });
                // this._drawImage({
                //     left: parseInt(this.editCanvasBox.style.left),    //注意，后续可能将editCanvas改成绝对定位
                //     top: parseInt(this.editCanvasBox.style.top),
                //     width: this.editCanvasBox.width,
                //     height: this.editCanvasBox.height,
                // });
                this._drawShapeToCanvas();
                this._showDrawingSelectObj(false);
                this._saveDrawingToBuffer();
            }
            else{
                // this._drawShapeToCanvas();
                this._showDrawingSelectObj(true);
            }
        }
    },

    //处理文本输入事件
    _drawShapeHandler: function (event) {
        eventShape = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        if(target.id === "canvasBox"||target.id === "canvasWrap"){
            this._fillDrawing();
        }
    },
    //
    _addDrawShapeHandler: function(){
        this.canvasBox.style.cursor = "crosshair";
        // handleTarget.classList.toggle("selected");
        //拖拽效果事件

        //在桌面系统中，通过click事件触发显示隐藏文本框
        if(client.system.win||client.system.mac||client.system.x11){
            this.addHandler(this.canvasWrap, "click", this._drawShapeHandler);
        }
        else{
            //在移动设备中，通过touchend事件触发显示隐藏文本框
            this.addHandler(this.canvasWrap, "touchend", this._drawShapeHandler);
        }
    },
    //
    _removeDrawShapeHandler: function(){
        document.querySelector("#" + drawingInfo.get("description")).classList.remove("selected");
        // this.removeHandler(this.canvasWrap, "click", this._drawShapeHandler);
        //在桌面系统中，通过click事件触发显示隐藏文本框
        if(client.system.win||client.system.mac||client.system.x11){
            this.removeHandler(this.canvasWrap, "click", this._drawShapeHandler);
        }
        else{
            //在移动设备中，通过touchend事件触发显示隐藏文本框
            this.removeHandler(this.canvasWrap, "touchend", this._drawShapeHandler);
        }
        drawingInfo.set("behavior", "");
        drawingInfo.set("description", "");
    },

    //撤销，重做事件
    //保存当前绘图，默认buffer为50
    // _saveDrawingToBuffer: function(){
    //     var reDoUnDo = drawingInfo.get("reDoUnDo"),
    //         buffer = reDoUnDo.buffer,
    //         index = reDoUnDo.index,
    //         preWidth = drawingInfo.get("canvasW"),   //当前canvas宽度
    //         preHeight = drawingInfo.get("canvasH");  //当前canvas高度
    //     if(buffer.length === 50){
    //         buffer.shift();   //移除第一项
    //         if(index-1<=0){
    //             this._removeUndoHandler();
    //         }else{
    //             index--;
    //         }
    //     }
    //     index++;
    //     buffer.push(this.context.getImageData(0, 0, preWidth, preHeight));
    //     if(buffer.length > 1){
    //         //加载撤销操作事件
    //         this._addUndoHandler();
    //     }
    //     reDoUnDo.buffer = buffer;
    //     reDoUnDo.index = index;
    //     drawingInfo.set("reDoUnDo", reDoUnDo);
    // },
    // _undo: function(){
    //     var reDoUnDo = drawingInfo.get("reDoUnDo"),
    //         buffer = reDoUnDo.buffer,
    //         index = reDoUnDo.index,
    //         preWidth = drawingInfo.get("canvasW"),   //当前canvas宽度
    //         preHeight = drawingInfo.get("canvasH"),  //当前canvas高度
    //         recWidth= null,
    //         recHeight = null,
    //         imageData;
    //     index = index -1;
    //     imageData = buffer[index];
    //     recWidth = imageData.width;
    //     recHeight = imageData.height;
    //     // this.context.clearRect(0, 0, width, height);
    //     this._resizeCanvasBox(this.canvasBox, recWidth, recHeight);
    //     this.context.putImageData(imageData, 0, 0);
    //     if(index > 0){
    //
    //     }
    //     else{
    //         //删除撤销操作事件
    //         this._removeUndoHandler();
    //
    //     }
    //     if(index < buffer.length-1){
    //         //绑定redo事件
    //         this._addRedoHandler();
    //     }
    //     reDoUnDo.index = index;
    //     drawingInfo.set("reDoUnDo", reDoUnDo);
    // },
    // _redo: function(){
    //     var reDoUnDo = drawingInfo.get("reDoUnDo"),
    //         buffer = reDoUnDo.buffer,
    //         index = reDoUnDo.index,
    //         recWidth,
    //         recHeight,
    //         imageData;
    //     index = index +1;
    //     imageData = buffer[index];
    //     recWidth = imageData.width;
    //     recHeight = imageData.height;
    //     // this.context.clearRect(0, 0, width, height);
    //     this._resizeCanvasBox(this.canvasBox, recWidth, recHeight);
    //     this.context.putImageData(imageData, 0, 0);
    //     if(index < buffer.length-1){
    //
    //     }
    //     else{
    //         //删除重做事件
    //         this._removeRedoHandler();
    //     }
    //     if(index > 0){
    //         this._addUndoHandler();
    //     }
    //     reDoUnDo.index = index;
    //     drawingInfo.set("reDoUnDo", reDoUnDo);
    // },
    //
    // //
    // _addRedoHandler: function(){
    //     this.redo.classList.remove("invalid");
    //     this.addHandler(this.redo, "handlers", this._redo);
    // },
    // //
    // _removeRedoHandler: function(){
    //     this.redo.classList.add("invalid");
    //     this.removeHandler(this.redo, "handlers", this._redo);
    // },
    // //
    // _addUndoHandler: function(){
    //     this.undo.classList.remove("invalid");
    //     this.addHandler(this.undo, "handlers", this._undo);
    // },
    // //
    // _removeUndoHandler: function(){
    //     this.undo.classList.add("invalid");
    //     this.removeHandler(this.undo, "handlers", this._undo);
    // },
    //事件绑定及节流处理
    //open
    _openFile: function(){
        var event = new MouseEvent('click');
        //读取图片函数
        var pic = function(event) {
            event = EventUtil.getEvent();
            var files = EventUtil.getTarget(event).files;
            if (/image/.test(files[0].type)) {
                this._imgReader(files[0] ,true);
            } else {
                console.log("选择的不是图片");
            }
            EventUtil.removeHandler(this.openFile, "change", pic);
            // this._resizeCanvasBox(this.canvasBox, this.editCanvasBox.width, this.editCanvasBox.height);
        }.bind(this);
        EventUtil.addHandler(this.openFile, "change", pic);
            // 触发a的单击事件
        this.openFile.dispatchEvent(event);
    },
    _addOpenFileHandler: function(){
        this.addHandler(this.open, "click", this._openFile);
    },
    _removerOpenFileHandler: function(){
        this.addHandler(this.open, "click", this._openFile);
    },
    //保存文件
    _saveFile: function(){
        var defaultName = new Date().getTime();
        // 使用toDataURL方法将图像转换被base64编码的URL字符串
        var url = this.canvasBox.toDataURL('image/png');
        // 生成一个a元素
        var a = document.createElement('a');
        // 创建一个单击事件
        var event = new MouseEvent('click');
        // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
        a.download = name || defaultName;
        // 将生成的URL设置为a.href属性
        a.href = url;

        // 触发a的单击事件
        a.dispatchEvent(event);
    },
    _addSaveHandler: function(){
        this.addHandler(this.save, "click", this._saveFile);
    },
    _removerSaveHandler: function(){
        this.addHandler(this.save, "click", this._saveFile);
    },

    init: function (config) {
        this._super(config);
        this.canvasBox = document.getElementById("canvasBox");   //canvas
        this.context = this.canvasBox.getContext("2d");
        this.bottomFonts = document.getElementsByClassName("bottom-font");   //坐标显示
        this.image = document.getElementById("imgContainer");
        // this.selectable = document.querySelector("#selectable");
        this.pasteInput = document.querySelector("#pasteInput");
        this.adjustCanvas = document.querySelector("#adjust-canvas");
        this.canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
        this.rotateDrop = document.querySelector("#rotate-drop");
        this.canvasWrap = document.querySelector(".canvas-wrap");
        this.virtualWrap = document.getElementsByClassName("virtual-wrap")[0];
        //tool栏
        this.tool = document.querySelector("#tool");
        this.magnifierWrap = document.querySelector("#magnifier-wrap");
        this.pencil = document.querySelector("#pencil");
        this.fill = document.querySelector("#fill");
        this.text = document.querySelector("#text");
        this.erase = document.querySelector("#erase");
        this.straw = document.querySelector("#straw");
        this.magnifier = document.querySelector("#magnifier");
        //选择框调整
        this.elementWrap = document.querySelector("#element-wrap");
        this.inputDiv = document.querySelector("#input-div");
        this.editCanvasBox = document.querySelector("#editCanvasBox");
        this.editContext = this.editCanvasBox.getContext("2d");
        this.elemenDecorate = document.querySelector("#element-decorate");
        this.selectButton = document.querySelector("#selectBoxWrap");
        this.imgWrap = document.querySelector("#imgWrap");
        //剪切、复制、裁剪
        this.cut = document.querySelector("#cut");
        this.copy = document.querySelector("#copy");
        this.paste = document.querySelector("#paste");
        this.clip = document.querySelector("#clip");
        this.toolImgWrap = document.querySelectorAll(".tool-wrap-img");
        this.canvasWrap = document.getElementsByClassName("canvas-wrap")[0];
        //背景颜色
        this.foreColor = document.querySelector(".font-color");
        this.colorSetButtons = document.querySelectorAll(".color-1");
        //形状框箭头
        this.scroll = document.querySelector(".scroll");
        this.arrowUp = document.querySelector("#arrow-up");
        this.arrowDown = document.querySelector("#arrow-down");
        this.arrowDrop = document.querySelector("#arrow-drop");
        this.wrapDiv = document.querySelector(".shape-wrap-left-img");
        this.wrapLeft = document.querySelector(".shape-wrap-left");
        //撤销、重做
        this.redoUndo = document.querySelector("#redo-undo");
        this.redo = document.querySelector("#redo");
        this.undo = document.querySelector("#undo");

        //下拉菜单
        this.openFile = document.querySelector("#openFile");
        this.open = document.querySelector("#open");
        this.save = document.querySelector("#save");

        //初始化
        this.canvasBox.style.zIndex = 1;
        this.createHandlers(this.canvasBox, this.EVENTS["canvasBox"]);    //加入到观察者
        this.createHandlers(this.canvasWrap, this.EVENTS["canvasWrap"]);    //加入到观察者
        this.createHandlers(this.adjustCanvas, this.EVENTS["adjustCanvas"]);    //加入到观察者
        this.createHandlers(this.rotateDrop, this.EVENTS["rotateDrop"]);    //加入到观察者
        this.createHandlers(this.magnifierWrap, this.EVENTS["magnifierWrap"]);    //加入到观察者
        this.createHandlers(document.body, this.EVENTS["pasteInput"]);    //加入到观察者
        this.createHandlers(this.selectButton, this.EVENTS["selectButton"]);    //加入到观察者
        this.createHandlers(this.tool, this.EVENTS["tool"]);               //加入到观察者
        this.createHandlers(document, this.EVENTS["document"]);               //加入到观察者
        this.createHandlers(this.copy, this.EVENTS["copy"]);               //加入到观察者
        this.createHandlers(this.cut, this.EVENTS["cut"]);               //加入到观察者
        this.createHandlers(this.paste, this.EVENTS["paste"]);               //加入到观察者
        this.createHandlers(this.clip, this.EVENTS["clip"]);               //加入到观察者
        this.createHandlers(this.arrowUp, this.EVENTS["arrowUp"]);               //加入到观察者
        this.createHandlers(this.arrowDown, this.EVENTS["arrowDown"]);               //加入到观察者
        this.createHandlers(this.arrowDrop, this.EVENTS["arrowDrop"]);               //加入到观察者
        this.createHandlers(this.wrapDiv, this.EVENTS["wrapDiv"]);               //加入到观察者
        this.createHandlers(this.scroll, this.EVENTS["scroll"]);               //加入到观察者
        this.createHandlers(this.redoUndo, this.EVENTS["redoUndo"]);
        this.createHandlers(this, this.EVENTS["remove"]);    //加入到观察者
        this.createHandlers(this.redo, this.EVENTS["redo"]);    //加入到观察者
        this.createHandlers(this.undo, this.EVENTS["undo"]);    //加入到观察者
        this.createHandlers(this.open, this.EVENTS["open"]);    //加入到观察者
        this.createHandlers(this.save, this.EVENTS["save"]);    //加入到观察者

        // this.createHandlers(this.elementWrap, this.EVENTS["elementWrap"]);    //加入到观察者
        // this._addDrawLineHandler();   //默认为绘制线条
        this._handle(this._addDrawLineHandler, this._removeDrawLineHandler);
        drawingInfo.set("behavior", "pencil");
        this._addImgPasteHandler();
        this._addPasteButtonHandler();
        this._addCopyPasteHandler();
        this._addArrowEventHandle();
        this._saveDrawingToBuffer();
        this._addOpenFileHandler();
        this._addSaveHandler();
        // this.addHandler(this, "handlers", this._removeDrawLineHandler);
        // this._addMoveElementHandler();  //调试使用
        // this._addStretchElementHandler(); //调试
        this.bind();
    },
    bind: function(){
        var self = this;
        //open
        EventUtil.addHandler(this.open, "click", function (event) {
            self.fire(self.open, "click", event);
        });
        //save
        EventUtil.addHandler(this.save, "click", function (event) {
            self.fire(self.save, "click", event);
        });
        //撤销
        EventUtil.addHandler(this.redoUndo, "click", function (event) {
            self.fire(self.redoUndo, "click", event);
        });
        //形状按钮
        EventUtil.addHandler(this.wrapDiv, "click", function (event) {
            self.fire(self.wrapDiv, "click", event);
        });
        EventUtil.addHandler(this.scroll, "click", function (event) {
            self.fire(self.scroll, "click", event);
        });
        // //形状向上箭头
        // EventUtil.addHandler(this.arrowUp, "click", function (event) {
        //     self.fire(self.arrowUp, "click", event);
        // });
        // //形状向下箭头
        // EventUtil.addHandler(this.arrowDown, "click", function (event) {
        //     self.fire(self.arrowDown, "click", event);
        // });
        // //形状向上箭头
        // EventUtil.addHandler(this.arrowDrop, "click", function (event) {
        //     self.fire(self.arrowDrop, "click", event);
        // });
        //复制事件等
        EventUtil.addHandler(document, "copy", function (event) {
            self.fire(document, "copy", event);
        });
        //剪切事件等
        EventUtil.addHandler(document, "cut", function (event) {
            self.fire(document, "cut", event);
        });
        //粘贴事件等
        EventUtil.addHandler(document, "paste", function (event) {
            self.fire(document, "paste", event);
        });
        //粘贴事件等
        // EventUtil.addHandler(document, "touchstart", function (event) {
        //     self.fire(document, "touchstart", event);
        // });
        // EventUtil.addHandler(this.canvasWrap, "click", function (event) {
        //     self.fire(self.canvasWrap, "click", event);
        // });
        //复制按钮
        EventUtil.addHandler(this.copy, "click", function (event) {
            self.fire(self.copy, "click", event);
        });
        //粘贴按钮
        EventUtil.addHandler(this.paste, "click", function (event) {
            self.fire(self.paste, "click", event);
        });
        //剪切按钮
        EventUtil.addHandler(this.cut, "click", function (event) {
            self.fire(self.cut, "click", event);
        });
        //裁剪按钮
        EventUtil.addHandler(this.clip, "click", function (event) {
            self.fire(self.clip, "click", event);
        });
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
        //粘贴截图事件
        // EventUtil.addHandler(document.body, "paste", function (event) {
        //     self.fire(document.body, "paste", event);
        // });
        //选择栏
        //吸管事件
        EventUtil.addHandler(this.selectButton, "click", function (event) {
            self.fire(self.selectButton, "click", event);
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
                    event.preventDefault();
                    if (this.canvasWrap.style.zIndex !== -1 && this._ctrlEvent.flag === true) {   //使虚线框在最前)
                        this.canvasWrap.style.zIndex = -1;
                    }
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
                        this._saveDrawingToBuffer();
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
                        this._saveDrawingToBuffer();
                        console.log(this._ctrlEvent);
                    }
                }
            ],
            "redo":{
                "handlers":[]
            },
            "undo":{
                "handlers":[]
            },
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
        //撤销、重做
        this.redo = document.querySelector("#redo");
        this.undo = document.querySelector("#undo");

        this.createHandlers(this.body, this.EVENTS["body"]);               //加入到观察者
        this.createHandlers(this.ctrlWrapRight, this.EVENTS["target"]);    //加入到观察者，3个对象事件处理程序都一样
        this.createHandlers(this.redo, this.EVENTS["redo"]);    //加入到观察者
        this.createHandlers(this.undo, this.EVENTS["undo"]);    //加入到观察者
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
        "editColor":{
            "click":[]
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
    //editColor
    _editColor: function(){
        var event = new MouseEvent('click');
        // 触发a的单击事件
        this.colorInput.dispatchEvent(event);
    },
    _addEditColorHandler: function(){
        this.addHandler(this.editColor, "click", this._editColor);
    },
    _removerEditColorHandler: function(){
        this.addHandler(this.editColor, "click", this._editColor);
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
        //颜色选择按键
        this.editColor = document.querySelector("#editColor");
        this.newColor = [];
        this.createHandlers(this.colorSetButtons[0], this.EVENTS["colorSetButtons[0]"]);               //加入到观察者
        this.createHandlers(this.colorSetButtons[1], this.EVENTS["colorSetButtons[1]"]);               //加入到观察者
        this.createHandlers(this.colorBoxContainer, this.EVENTS["colorBoxContainer"]);
        this.createHandlers(this.colorInput, this.EVENTS["colorInput"]);
        this.createHandlers(this.editColor, this.EVENTS["editColor"]);    //加入到观察者
        //初始化
        this.bind();
        this._addEditColorHandler();
    },
    bind: function(){
        var self = this;
        EventUtil.addHandler(this.editColor, "click", function (event) {
            self.fire(self.editColor, "click", event);
        });
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
    try {
        var drawingModule = new Drawing({
                X: null,  //绘图区域X坐标
                Y: null,   //绘图区域Y坐标
                startX: null,  //mousedown坐标
                startY: null,
                diffX: null,
                diffY: null,
                clicking: false,
                copyImageData: null,
                // reDoUnDo: {
                //     buffer: [],
                //     index: -1,
                // }
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
        // alert('no error');
    } catch (err) {
        alert(err);
    }

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