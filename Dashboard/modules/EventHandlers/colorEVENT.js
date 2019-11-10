define(['drawingInfo', 'EventUtil'], function (drawingInfo, EventUtil) {
    return {
        "colorSetButtons[0]": {
            "click": [
                function (event) {
                    if(!this.colorSetButtons[0].classList.contains("selected")){
                        this.colorSetButtons[0].classList.toggle("selected");
                        this.colorSetButtons[1].classList.toggle("selected");
                    }
                }
            ],
        },
        "colorSetButtons[1]": {
            "click": [
                function (event) {
                    if(!this.colorSetButtons[1].classList.contains("selected")){
                        this.colorSetButtons[0].classList.toggle("selected");
                        this.colorSetButtons[1].classList.toggle("selected");
                    }
                }
            ],
        },
        "colorBoxContainer": {
            "click": [
                function (event) {
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event);
                    var actualTarget = (target.childElementCount === 0 && target.className === "color-box")? target: target.firstElementChild;

                    if(actualTarget.style.backgroundColor){
                        if(!this.colorSetButtons[0].classList.contains("selected")){
                            this.backgroundColor.style.backgroundColor = actualTarget.style.backgroundColor;
                            drawingInfo.set("backgroundColor", actualTarget.style.backgroundColor);
                        }
                        else{
                            this.fontColor.style.backgroundColor = actualTarget.style.backgroundColor;
                            drawingInfo.set("color", actualTarget.style.backgroundColor);
                        }
                    }
                }
            ],
        },
        "colorInput": {
            "change": [
                function (event) {
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event);
                    var newColor = target.value;
                    // var actualTarget = (target.childElementCount === 0 && target.className === "color-box")? target: target.firstElementChild;

                    if(typeof newColor === "string"){
                        this._arrangeNewColorArray(this.newColor, newColor);
                        this._renderNewColorBoxes(this.colorBoxes, this.newColor);
                        if(!this.colorSetButtons[0].classList.contains("selected")){
                            this.backgroundColor.style.backgroundColor = newColor;
                            drawingInfo.set("backgroundColor", newColor);
                        }
                        else{
                            this.fontColor.style.backgroundColor = newColor;
                            drawingInfo.set("color", newColor);
                        }
                    }
                }
            ],
        },
        "editColor":{
            "click":[]
        },
    }
})
