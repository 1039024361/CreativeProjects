define(['drawingInfo', 'EventUtil'], function (drawingInfo, EventUtil) {
    return {
        "click": [
            function(event){
                event = EventUtil.getEvent(event);
                var target = EventUtil.getTarget(event),
                    handleTarget;

                handleTarget = target.childElementCount? target:target.parentNode;

                switch (handleTarget.id)
                {
                    case "ellipse":
                        console.log("ellipse");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "ellipse");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "rectangle":
                        console.log("rectangle");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "rectangle");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "circle-rectangle":
                        console.log("circle-rectangle");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "circle-rectangle");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "triangle":
                        console.log("triangle");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "triangle");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "right-triangle":
                        console.log("right-triangle");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "right-triangle");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "quadrangle":
                        console.log("quadrangle");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "quadrangle");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "pentagon":
                        console.log("pentagon");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "pentagon");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "hexagon":
                        console.log("hexagon");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "hexagon");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "shape-arrow-right":
                        console.log("shape-arrow-right");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "shape-arrow-right");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "shape-arrow-left":
                        console.log("shape-arrow-left");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "shape-arrow-left");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "shape-arrow-up":
                        console.log("shape-arrow-up");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "shape-arrow-up");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "shape-arrow-down":
                        console.log("shape-arrow-down");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "shape-arrow-down");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "four-star":
                        console.log("four-star");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "four-star");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "five-star":
                        console.log("five-star");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "five-star");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "six-star":
                        console.log("six-star");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "six-star");
                            handleTarget.classList.add("selected");
                        }
                        break;
                    case "heart":
                        console.log("heart");
                        if(!handleTarget.classList.contains("selected")){
                            this._handle(this._addDrawShapeHandler, this._removeDrawShapeHandler);
                            drawingInfo.set("behavior", "shape");
                            drawingInfo.set("description", "heart");
                            handleTarget.classList.add("selected");
                        }
                        break;
                }
            }
        ]
    }
})