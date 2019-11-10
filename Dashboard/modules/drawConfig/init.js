define(['drawingInfo', 'EventUtil'], function (drawingInfo, EventUtil) {
    var getElement = function () {
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
    }
    var initHandler = function () {
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
    }
    var bind = function(){
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
        //选择栏
        //吸管事件
        EventUtil.addHandler(this.selectButton, "click", function (event) {
            self.fire(self.selectButton, "click", event);
        });
    }
    return function (config) {
        this._super(config);
        getElement.call(this)
        initHandler.call(this)

        this._handle(this._addDrawLineHandler, this._removeDrawLineHandler);
        drawingInfo.set("behavior", "pencil");
        this._addImgPasteHandler();
        this._addPasteButtonHandler();
        this._addCopyPasteHandler();
        this._addArrowEventHandle();
        this._saveDrawingToBuffer();
        this._addOpenFileHandler();
        this._addSaveHandler();
        bind.call(this);
    }
})