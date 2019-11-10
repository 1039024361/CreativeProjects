define(['EventUtil'], function (EventUtil) {
    //拉拽时的虚拟框效果
    var _virtualBox = function(event) {
        event = EventUtil.getEvent(event);
        switch (event.type) {
            case "mousedown":
            case "touchstart":
                this._appendStyle(this.elemenDecorate, {
                    display: "inline-block",
                    top: this.get("Y")+"px",  //减去实线宽度
                    left: this.get("X")+"px",
                });
                break;
            case "mousemove":
            case "touchmove":
                if(this.get("clicking")){
                    this._appendStyle(this.elemenDecorate, {
                        width: this.get("diffX") + 2 + "px",
                        height: this.get("diffY") + 2 + "px",
                    });
                }
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
    }
    return {
        _addVirtualBoxHandler: function(){
            this.addHandler(this.canvasWrap, "mousedown", _virtualBox);
            this.addHandler(this.canvasWrap, "touchstart", _virtualBox);
            this.addHandler(this.canvasWrap, "mouseup", _virtualBox);
            this.addHandler(this.canvasWrap, "touchmove", _virtualBox);
            this.addHandler(this.canvasWrap, "mousemove", _virtualBox);
            this.addHandler(this.canvasWrap, "touchend", _virtualBox);
            this.addHandler(this.canvasWrap, "mouseleave", _virtualBox);
        },
        _removeVirtualBoxHandler: function(){
            this.removeHandler(this.canvasWrap, "mousedown", _virtualBox);
            this.removeHandler(this.canvasWrap, "mousemove", _virtualBox);
            this.removeHandler(this.canvasWrap, "mouseup", _virtualBox);
            this.removeHandler(this.canvasWrap, "touchstart", _virtualBox);
            this.removeHandler(this.canvasWrap, "touchmove", _virtualBox);
            this.removeHandler(this.canvasWrap, "touchend", _virtualBox);
            this.removeHandler(this.canvasWrap, "mouseleave", _virtualBox);
        }
    }
})