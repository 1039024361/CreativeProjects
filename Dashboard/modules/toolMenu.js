define(['EventUtil', 'drawingInfo'], function (EventUtil, drawingInfo) {
    return {
        selectTool: function(event){
            event = EventUtil.getEvent(event);
            var target = EventUtil.getTarget(event),
                handleTarget, i,
                len = this.toolImgWrap.length;

            handleTarget = target.childElementCount? target:target.parentNode;

            for(i=0; i<len; i++){
                if(this.toolImgWrap[i].classList.contains("selected")){
                    if(handleTarget.id !== drawingInfo.get("behavior")){
                        this.toolImgWrap[i].classList.remove("selected")
                    }
                }
            }

            switch (handleTarget.id)
            {
                case "pencil":
                    // console.log("pencil");
                    if(!handleTarget.classList.contains("selected")){
                        this.canvasBox.style.cursor = "url(images/pen.gif) 0 20, auto";
                        handleTarget.classList.toggle("selected");
                        this._handle(this._addDrawLineHandler, this._removeDrawLineHandler);
                        drawingInfo.set("behavior", "pencil");
                    }
                break;
                case "erase":
                    // console.log("erase");
                    if(!handleTarget.classList.contains("selected")){
                        this.canvasBox.style.cursor = "url(images/erase.gif) 0 20, auto";
                        handleTarget.classList.toggle("selected");
                        this._handle(this._addDrawLineHandler, this._removeDrawLineHandler);
                        drawingInfo.set("behavior", "erase");
                    }
                break;
                case "fill":
                    // console.log("fill");
                    if(!handleTarget.classList.contains("selected")){
                        this.canvasBox.style.cursor = "url(images/fill.gif) 0 20, auto";
                        handleTarget.classList.toggle("selected");
                        this._handle(this._addFillHandler, this._removeFillHandler);
                        drawingInfo.set("behavior", "fill");
                    }
                break;
                case "straw":
                    // console.log("straw");
                    if(!handleTarget.classList.contains("selected")){
                        this.canvasBox.style.cursor = "url(images/straw.gif) 0 20, auto";
                        handleTarget.classList.toggle("selected");
                        this._handle(this._addStrawHandler, this._removeStrawHandler);
                        drawingInfo.set("behavior", "straw");
                    }
                break;
                case "magnifier":
                    // console.log("magnifier");
                    if(!handleTarget.classList.contains("selected")){
                        this.magnifierWrap.style.cursor = "url(images/magnifier.gif) 0 20, auto";
                        handleTarget.classList.toggle("selected");
                        this._handle(this._addMagnifierHandler, this._removeMagnifierHandler);
                        drawingInfo.set("behavior", "magnifier");
                    }
                break;
                case "text":
                    // console.log("text");
                    if(!handleTarget.classList.contains("selected")){
                        this.canvasBox.style.cursor = "text";
                        handleTarget.classList.toggle("selected");
                        this._handle(this._addTextInputHandler, this._removeTextInputHandler);
                        // this.addHandler(this, "handlers", this._fillText);
                        drawingInfo.set("behavior", "text");
                    }
                break;
            }
        }
    }
})