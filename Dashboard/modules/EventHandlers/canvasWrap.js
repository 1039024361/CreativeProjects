define(['common', 'EventUtil'], function (common, EventUtil) {
    // 主要在于获取画布的位置
    return {
        "mousedown":[
            function (event) {
                event = EventUtil.getEvent(event);
                var pos = this._xyConvert(event.clientX, event.clientY)
                common.updateXY('X', 'Y', pos.X, pos.Y, this)
                common.updateXY('startX', 'startY', pos.X, pos.Y, this)
                this.set("clicking", true);
            }
        ],
        "mousemove":[
            function(event){
                // console.log('_displayCursorPos')
                this._displayCursorPos(this._xConvert(event.clientX),  this._yConvert(event.clientY)) 
            },
            function (event) {
                event = common.preventDefault(event);
                var pos = this._xyConvert(event.clientX, event.clientY)
                common.updateXY('X', 'Y', pos.X, pos.Y, this)
                if(this.get("clicking") === true){
                    common.updateXY('diffX', 'diffY', pos.X-this.get("startX"), pos.Y-this.get("startY"), this)
                }
            }
        ],
        "mouseup":[
            function(){ this.set("clicking", false) }
        ],
        "mouseleave":[
            function(){ this._displayCursorPos(-1,  -1) }
        ],
        "touchstart":[
            function (event) {
                event = EventUtil.getEvent(event);
                debug = 'touchstart';
                var pos = this._xyConvert(event.touches[0].clientX, event.touches[0].clientY)
                common.updateXY('X', 'Y', pos.X, pos.Y, this)
                common.updateXY('startX', 'startY', pos.X, pos.Y, this)
                this.set("clicking", true);
            }
        ],
        "touchmove":[
            function (event) {
                event = EventUtil.getEvent(event);
                event.preventDefault();   //阻止滚动
                var pos = this._xyConvert(event.touches[0].clientX, event.touches[0].clientY)
                common.updateXY('X', 'Y', pos.X, pos.Y, this)
                if(this.get("clicking") === true){
                    common.updateXY('diffX', 'diffY', pos.X-this.get("startX"), pos.Y-this.get("startY"), this)
                }
            }
        ],
        "touchend":[
            function () { this.set("clicking", false) }
        ]
    }
})