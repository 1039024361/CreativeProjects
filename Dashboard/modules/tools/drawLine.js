define(['EventUtil', 'drawingInfo'], function (EventUtil, drawingInfo) {
    //描点函数
    var _draw = function(x, y){
        this.context.lineWidth = drawingInfo.get("behavior") !== "erase"? drawingInfo.get("lineWeight"): 8;
        this.context.strokeStyle = drawingInfo.get("behavior") !== "erase"? drawingInfo.get("color"): drawingInfo.get("backgroundColor");
        this.context.lineTo(x,y);
        this.context.stroke();
    }
    var _beginDrawLine = function(event){
        event = EventUtil.getEvent(event);
        this._ctrlEvent.flag = true;
        this.context.beginPath();
        this.context.moveTo(this._xConvert(event.clientX), this._yConvert(event.clientY));
    }
    var _drawingLine = function(event){
        event = EventUtil.getEvent(event);
        event.preventDefault();
        if(this._ctrlEvent.flag === true){
            _draw.call(this, this._xConvert(event.clientX), this._yConvert(event.clientY));
        }
    }
    var _endDrawLine = function(event){
        if(this._ctrlEvent.flag === true){
            this._ctrlEvent.flag = false;
            this._saveDrawingToBuffer();
        }
    }
    //触摸设备
    var _beginDrawLineT = function(event){
        event = EventUtil.getEvent(event);
        this.context.beginPath();
        this.context.moveTo(this._xConvert(event.touches[0].clientX), this._yConvert(event.touches[0].clientY));
    }
    //触摸设备
    var _drawingLineT = function(event){
        event = EventUtil.getEvent(event);
        event.preventDefault();   //阻止滚动
        // this._displayCursorPos(this._xConvert(event.changedTouches[0].clientX),  this._yConvert(event.changedTouches[0].clientY));
        _draw.call(this, this._xConvert(event.changedTouches[0].clientX), this._yConvert(event.changedTouches[0].clientY));
    }
    return {
        
        //添加画线事件
        //注意，默认是已经加上绘图事件
        _addDrawLineHandler: function(){
            this.addHandler(this.canvasWrap, "mousedown", _beginDrawLine);
            this.addHandler(this.canvasWrap, "mousemove", _drawingLine);
            this.addHandler(this.canvasWrap, "mouseup", _endDrawLine);
            this.addHandler(this.canvasWrap, "mouseleave", _endDrawLine);
            this.addHandler(this.canvasWrap, "touchstart", _beginDrawLineT);
            this.addHandler(this.canvasWrap, "touchmove", _drawingLineT);
        },
        //删除画线事件
        _removeDrawLineHandler: function(){
            // console.log('this: ', this)
            if(drawingInfo.get("behavior") === "pencil"){
                this.pencil.classList.remove("selected");
            }
            else{
                this.erase.classList.remove("selected");
            }
            this.removeHandler(this.canvasWrap, "mousedown", _beginDrawLine);
            this.removeHandler(this.canvasWrap, "mousemove", _drawingLine);
            this.removeHandler(this.canvasWrap, "mouseup", _endDrawLine);
            this.removeHandler(this.canvasWrap, "mouseleave", _endDrawLine);
            this.removeHandler(this.canvasWrap, "touchstart", _beginDrawLineT);
            this.removeHandler(this.canvasWrap, "touchmove", _drawingLineT);
        },
    }
})