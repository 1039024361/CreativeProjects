define(['RichBase', 'EventUtil', 'drawingInfo'],
    function (RichBase, EventUtil, drawingInfo) {
    //线型选择
    var Line = RichBase.extend({
        //在这里注册所有事件，使用观察者模式
        EVENTS:{
            "lineWeightDrop": {
                "click": [
                    function (event) {
                        event = EventUtil.getEvent(event);
                        var target = EventUtil.getTarget(event);
                        var actualTarget = target.firstElementChild ? target : target.parentNode;

                        if (actualTarget.className === "drop-line-wrap") {
                            this.lineWraps[drawingInfo.get('lineWeight') - 1].classList.toggle("selected");
                            this.lineWraps[parseInt(actualTarget.id) - 1].classList.toggle("selected");
                            drawingInfo.set('lineWeight', parseInt(actualTarget.id));
                        }
                    }
                ],
            },
            "lineWeightWrap": {
                "touchstart": [
                    function (event) {
                        this.lineWeightDrop.style.display === "display" ? this.lineWeightDrop.style.display = "none" : "display";
                    }
                ],
            }
            },
        //事件绑定及节流处理
        init: function (config) {
            this._super(config);
            this.lineWeightDrop = document.getElementById("drop-line-weight");
            this.lineWeightWrap = document.getElementById("line-weight-wrap");
            this.lineWraps = document.querySelectorAll(".drop-line-wrap");
            this.createHandlers(this.lineWeightDrop, this.EVENTS["lineWeightDrop"]);               //加入到观察者
            this.createHandlers(this.lineWeightWrap, this.EVENTS["lineWeightWrap"]);               //加入到观察者
            //初始化
            this.bind();
        },
        bind: function(){
            var self = this;
            EventUtil.addHandler(this.lineWeightDrop, "click", function (event) {
                self.fire(self.lineWeightDrop, "click", event);
            });
            EventUtil.addHandler(this.lineWeightWrap, "touchstart", function (event) {
                self.fire(self.lineWeightWrap, "touchstart", event);   //与click事件处理函数一直
            });
        },
    });
    return Line
})