define(['EventUtil'], function (EventUtil) {
//形状栏向上或者向下事件
var _arrowEvent = function(event){
    event = EventUtil.getEvent(event);
    EventUtil.stopPropagation(event);
    var target = EventUtil.getTarget(event),
        wrapDivHeight = this.wrapDiv.offsetHeight,
        top = this.wrapDiv.style.top? parseInt(this.wrapDiv.style.top):0,
        that = this;

        function move(diffTop){
            if(top + diffTop >= 60-wrapDivHeight && top + diffTop <= 0){
                that.wrapDiv.style.top = top + diffTop + "px";
            }
            if(top + diffTop <= 60-wrapDivHeight){
                that.arrowDown.classList.add("unused");
            }
            else{
                that.arrowDown.classList.remove("unused");
            }
            if(top + diffTop >= 0){
                that.arrowUp.classList.add("unused");
            }
            else {
                that.arrowUp.classList.remove("unused");
            }
        }
        if(target.id === "arrow-up"||target.parentNode.id === "arrow-up"){
            move(20);
        }
        else if(target.id === "arrow-down"||target.parentNode.id === "arrow-down"){
            move(-20);
        }
        else if(target.id === "arrow-drop"||target.parentNode.id === "arrow-drop"||target.parentNode.parentNode.id === "arrow-drop"){
            this.wrapLeft.classList.add("shape-wrap-left-abs");
            this.wrapDiv.classList.add("shape-wrap-left-img-abs");
            this.wrapDiv.classList.remove("animate");
            this._appendStyle(this.wrapDiv, {
                top: 0,
            });
            var handle = function(event){
                event = EventUtil.getEvent(event);
                var target = EventUtil.getTarget(event);
                if(target.id !== "arrow-drop" && target.parentNode.id !== "arrow-drop"&& target.parentNode.parentNode.id !== "arrow-drop"){
                    that._appendStyle(that.wrapDiv, {
                        top: 0,
                    });
                    that.wrapDiv.classList.add("animate");
                    that.wrapLeft.classList.remove("shape-wrap-left-abs");
                    that.wrapDiv.classList.remove("shape-wrap-left-img-abs");
                }
                EventUtil.removeHandler(document.body, "click" , handle);
            };
            EventUtil.addHandler(document.body, "click" , handle);
        }
    }
    return {
        _addArrowEventHandle: function(){
            this.addHandler(this.scroll, "click", _arrowEvent);
        },
        _removeArrowEventHandle: function(){
            this.removeHandler(this.scroll, "click", _arrowEvent);
        },
    }
})