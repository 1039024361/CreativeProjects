define(['drawingInfo', 'EventUtil', 'drawingInfo'], function (drawingInfo, EventUtil, drawingInfo) {
    //放大镜
    var _magnify = function(xGain, yGain){
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
    }
    //计算包裹边框的放大系数
    var _magnifierFactor = function(){
        return document.body.clientWidth/1920;   //以1903的时候，wrap边框宽度为960作为参考
    }
    var _updateMagnifierWrapStyle = function(){
        var canvasW = drawingInfo.get("canvasW"),
            canvasH = drawingInfo.get("canvasH"),
            wrapW = null,
            wrapH = null,
            top = null,
            left = null,
            factor = _magnifierFactor(),
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
    }
    var _magnifierHandler = function (event){
        event = EventUtil.getEvent(event);
        var xGain = drawingInfo.get("gain");

        if(event.type === "click"){
            if(xGain >0 &&xGain <1){
                xGain = xGain*2;
            }
            else{
                xGain = xGain+1;
            }
            _magnify.call(this, xGain);
        }
        _updateMagnifierWrapStyle.call(this);
    }
    return {
        _addMagnifierHandler: function(){
            // console.log('this.magnifierWrap:', this.magnifierWrap)
            this.addHandler(this.canvasWrap, "mousemove", _magnifierHandler);
            this.addHandler(this.magnifierWrap, "click", _magnifierHandler);
        },
        //
        _removeMagnifierHandler: function () {
            this.magnifier.classList.remove("selected");
            this.removeHandler(this.canvasWrap, "mousemove", _magnifierHandler);
            this.removeHandler(this.magnifierWrap, "click", _magnifierHandler);
            this._appendStyle(this.magnifierWrap, {
                display: "none",
                top: drawingInfo.get("canvasH")+"px",
                left: drawingInfo.get("canvasW")+"px",
                height: 0,
                width: 0
            });
        }
    }
})