define(['toolMenu', 'EventUtil', 'drawingInfo'], function (toolMenu, EventUtil, drawingInfo) {
    return {
        selectTool: {
            "click":[ toolMenu.selectTool ],
        },
        selectButton: {
            "click":[
                function(event){
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event),
                        handleTarget;

                    handleTarget = target.childElementCount? target:target.parentNode;

                    switch (handleTarget.id)
                    {
                        case "imgWrap":
                            console.log("imgWrap");
                            if(!handleTarget.classList.contains("selected")){
                                this._handle(this._addDrawImageHandler, this._removeDrawImageHandler);
                                drawingInfo.set("behavior", "select");
                            }
                            break;
                    }
                }
            ],
        },
        redoUndo: {
            "click":[
                function(event) {
                    event = EventUtil.getEvent(event);
                    var target = EventUtil.getTarget(event),
                        handleTarget;

                    handleTarget = target.childElementCount ? target : target.parentNode;

                    switch (handleTarget.id) {
                        case "undo":
                            console.log("undo");
                            this.fire(this.undo, "handlers");
                            break;
                        case "redo":
                            console.log("redo");
                            this.fire(this.redo, "handlers");
                            break;
                    }
                }
            ]
        },
    }
})