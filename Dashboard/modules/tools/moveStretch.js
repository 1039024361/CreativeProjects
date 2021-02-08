define(['drawingInfo', 'EventUtil'], function (drawingInfo, EventUtil) {
    //移动
    var _moveElement = function(event){
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
    }
    //移动
    var _stretchElement = function(event){
        event = EventUtil.getEvent(event);
        var eventTarget  = EventUtil.getTarget(event),
            target = eventTarget.childElementCount? eventTarget.firstElementChild:eventTarget;

        switch (event.type) {
            case "mousedown":
            case "touchstart":
                if (target.id === "top-left"||target.id === "top-middle"||target.id === "top-right"||target.id === "right-middle"||target.id === "right-bottom"||target.id === "bottom-middle"||target.id === "left-bottom"||target.id === "left-middle") {
                    this._ctrlEvent.startStretchXY = [this.get("X"), this.get("Y")];
                    this._ctrlEvent.target = target.id;
                    // this.removeHandler(this.canvasWrap, "click", this._drawImageHandler); // here this._drawImageHandler is undefined
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
                    if(this.editCanvasBox.style.display !== "none"){
                        margin = 0;
                        _imageStretch.call(this, this.editCanvasBox, newWidth, newHeight);
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
                var recover = function (){
                    this.addHandler(this.canvasWrap, "click", this._drawImageHandler);
                    EventUtil.removeHandler(this.canvasWrap, "click", recover);
                }.bind(this);
                EventUtil.addHandler(this.canvasWrap, "click", recover);
                // this._addVirtualBoxHandler(); //注意这里无法使用，不能动态删除同一个对象的handler
                break;
        }
    }
    //
    var _imageStretch = function(target, width, height){
        var ctx = target.getContext("2d");
        if(!drawingInfo.get("imageStretch")){
            var imageStretch = function(){
                this._resizeCanvasBox(target, width, height);
                ctx.clearRect(0, 0, target.width, target.height);
                ctx.scale(width/this.image.width, height/this.image.height);
                ctx.drawImage(this.image, 0, 0);
                ctx.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                EventUtil.removeHandler(this.image, "load", imageStretch);
                // console.log("imageStretch");
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

    }
    return {
        //添加移动事件处理程序
        //将移动及拉伸选框事件合二为一
        _addMoveAndStretchElementHandler: function(){
            //move事件
            this.addHandler(this.canvasWrap, "mousedown", _moveElement);
            this.addHandler(this.canvasWrap, "touchstart", _moveElement);
            this.addHandler(this.canvasWrap, "mouseup", _moveElement);
            this.addHandler(this.canvasWrap, "touchmove", _moveElement);
            this.addHandler(this.canvasWrap, "mousemove", _moveElement);
            this.addHandler(this.canvasWrap, "touchend", _moveElement);
            this.addHandler(this.canvasWrap, "mouseleave", _moveElement);
            //拉伸事件
            this.addHandler(this.canvasWrap, "mousedown", _stretchElement);
            this.addHandler(this.canvasWrap, "touchstart", _stretchElement);
            this.addHandler(this.canvasWrap, "mouseup", _stretchElement);
            this.addHandler(this.canvasWrap, "touchmove", _stretchElement);
            this.addHandler(this.canvasWrap, "mousemove", _stretchElement);
            this.addHandler(this.canvasWrap, "touchend", _stretchElement);
            this.addHandler(this.canvasWrap, "mouseleave", _stretchElement);
        },
        _removeMoveAndStretchElementHandler: function(){
            //move事件
            this.removeHandler(this.canvasWrap, "mousedown", _moveElement);
            this.removeHandler(this.canvasWrap, "mousemove", _moveElement);
            this.removeHandler(this.canvasWrap, "mouseup", _moveElement);
            this.removeHandler(this.canvasWrap, "touchstart", _moveElement);
            this.removeHandler(this.canvasWrap, "touchmove", _moveElement);
            this.removeHandler(this.canvasWrap, "touchend", _moveElement);
            this.removeHandler(this.canvasWrap, "mouseleave", _moveElement);
            //拉伸事件
            this.removeHandler(this.canvasWrap, "mousedown", _stretchElement);
            this.removeHandler(this.canvasWrap, "mousemove", _stretchElement);
            this.removeHandler(this.canvasWrap, "mouseup", _stretchElement);
            this.removeHandler(this.canvasWrap, "touchstart", _stretchElement);
            this.removeHandler(this.canvasWrap, "touchmove", _stretchElement);
            this.removeHandler(this.canvasWrap, "touchend", _stretchElement);
            this.removeHandler(this.canvasWrap, "mouseleave", _stretchElement);
            //拖拽效果事件
        }
    }
})