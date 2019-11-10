// 绘制图形
define(['drawingInfo', 'client', 'EventUtil'], function (drawingInfo, client, EventUtil) {
    //显示选择框
    var _displayDrawingSelectBox = function(toDisplay){
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
    }
    var _showDrawingSelectObj = function(toShow){
        _displayDrawingSelectBox.call(this, toShow);
        _addOrRemoveDrawingHandler.call(this, toShow);
    }
    var _addOrRemoveDrawingHandler = function (toAdd) {
        if(toAdd){
            this._addMoveAndStretchElementHandler();
        }
        else{
            this._removeMoveAndStretchElementHandler();
        }
    }
    var _fillDrawing = function () {
        if(drawingInfo.get("behavior") === "shape"){
            if(this.elementWrap.style.display === "inline-block") {
                console.log('_fillDrawing _drawShapeToCanvas')
                this._drawShapeToCanvas();
                _showDrawingSelectObj.call(this, false);
                this._saveDrawingToBuffer();
            }
            else{
                console.log('_fillDrawing')
                // this._drawShapeToCanvas();
                _showDrawingSelectObj.call(this, true);
            }
        }
    }
    //处理文本输入事件
    var _drawShapeHandler = function (event) {
        eventShape = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        if(target.id === "canvasBox"||target.id === "canvasWrap"){
            _fillDrawing.call(this);
        }
    }
    return {
        _addDrawShapeHandler: function(){
            console.log('_addDrawShapeHandler')
            this.canvasBox.style.cursor = "crosshair";
            // handleTarget.classList.toggle("selected");
            //拖拽效果事件

            //在桌面系统中，通过click事件触发显示隐藏文本框
            if(client.system.win||client.system.mac||client.system.x11){
                this.addHandler(this.canvasWrap, "click", _drawShapeHandler);
            }
            else{
                //在移动设备中，通过touchend事件触发显示隐藏文本框
                this.addHandler(this.canvasWrap, "touchend", _drawShapeHandler);
            }
        },
        //
        _removeDrawShapeHandler: function(){
            console.log('_removeDrawShapeHandler')
            document.querySelector("#" + drawingInfo.get("description")).classList.remove("selected");
            // this.removeHandler(this.canvasWrap, "click", this._drawShapeHandler);
            //在桌面系统中，通过click事件触发显示隐藏文本框
            if(client.system.win||client.system.mac||client.system.x11){
                this.removeHandler(this.canvasWrap, "click", _drawShapeHandler);
            }
            else{
                //在移动设备中，通过touchend事件触发显示隐藏文本框
                this.removeHandler(this.canvasWrap, "touchend", _drawShapeHandler);
            }
            drawingInfo.set("behavior", "");
            drawingInfo.set("description", "");
        }
    }
})