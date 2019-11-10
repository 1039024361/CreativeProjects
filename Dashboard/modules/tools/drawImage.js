define(['client', 'EventUtil'], function (client, EventUtil) {
    //处理
    var _drawImageHandler = function (event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        if(target.id === "canvasBox"||target.id === "canvasWrap"){
            this._fillImage();
        }
    }
    return {
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
                this.addHandler(this.canvasWrap, "click", _drawImageHandler);
            }
            else{
                //在移动设备中，通过touchend事件触发显示隐藏文本框
                this.addHandler(this.canvasWrap, "touchend", _drawImageHandler);
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
                this.removeHandler(this.canvasWrap, "click", _drawImageHandler);
            }
            else{
                //在移动设备中，通过touchend事件触发显示隐藏文本框
                this.removeHandler(this.canvasWrap, "touchend", _drawImageHandler);
            }
        }
    }
})