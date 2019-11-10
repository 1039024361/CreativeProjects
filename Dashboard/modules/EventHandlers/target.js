define(['EventUtil'], function (EventUtil) {
    return {
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
    }
})