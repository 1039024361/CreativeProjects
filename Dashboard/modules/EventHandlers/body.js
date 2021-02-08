define(['EventUtil'], function (EventUtil) {
    return {
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
                    // console.log(this._ctrlEvent);
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
                    // console.log(this._ctrlEvent);
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
})