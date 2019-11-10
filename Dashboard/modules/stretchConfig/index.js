define(['RichBase', 'stretchEVENTS', 'initStretch', 'drawingInfo'],
    function (RichBase, stretchEVENTS, initStretch, drawingInfo) {
    //调整绘图区域模块设计
    var Stretch = RichBase.extend({
        //在这里注册所有事件，使用观察者模式
        EVENTS: stretchEVENTS,
        _ctrlEvent:{
            flag: false,
            startXY:[0, 0],
            middleXY:[0,0],
            endXY:[0, 0]
        },
        //事件绑定及节流处理
        init: initStretch,
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
                    break;
                case this.ctrlWrapBottom:
                    target.style.height = parseInt(target.style.height) +(ctrlEvent.endXY[1] - ctrlEvent.middleXY[1]) +"px";
                    break;
                case this.ctrlWrapCorner:
                    target.style.width = parseInt(target.style.width) +(ctrlEvent.endXY[0] - ctrlEvent.middleXY[0]) +"px";
                    target.style.height = parseInt(target.style.height) +(ctrlEvent.endXY[1] - ctrlEvent.middleXY[1]) +"px";
                    break;
            }
        }
    });
    return Stretch
})