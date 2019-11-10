define(['drawingInfo', 'client', 'EventUtil'], function (drawingInfo, client, EventUtil) {
    //注入填充区域算法
        //颜色格式为rgba
        // _floodFill8: function f(imageRGBArr, x, y, oldColor, newColor){
        //     console.log(++debug);
        //     if(x < 0 || x > drawingInfo.canvasW || y < 0 || y > drawingInfo.canvasH){
        //         return null;
        //     }
        //     var color = this._getRGBByXY(imageRGBArr, x, y);
        //     if(color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha){
        //         this._setRGBByXY(imageRGBArr, x, y, newColor);
        //         f.call(this, imageRGBArr, x, y-1, oldColor, newColor);
        //         f.call(this, imageRGBArr, x, y+1, oldColor, newColor);
        //         f.call(this, imageRGBArr, x-1, y, oldColor, newColor);
        //         f.call(this, imageRGBArr, x+1, y, oldColor, newColor);
        //         f.call(this, imageRGBArr, x+1, y-1, oldColor, newColor);
        //         f.call(this, imageRGBArr, x+1, y+1, oldColor, newColor);
        //         f.call(this, imageRGBArr, x-1, y-1, oldColor, newColor);
        //         f.call(this, imageRGBArr, x-1, y+1, oldColor, newColor);
        //     }
        // },
        //扫描线填充算法，非迭代法
        var _floodFillScanLineWithStack = function(imageRGBArr, x, y, oldColor, newColor){
            if(newColor.R === oldColor.R&&newColor.G === oldColor.G&&newColor.B === oldColor.B&&newColor.alpha === oldColor.alpha) {
                console.log("do nothing !!!, filled area!!");
                return null;
            }
            var xStack = [],
                yStack = [];


            var y1,
                spanLeft,
                spanRight,
                width = drawingInfo.get("canvasW"),
                height = drawingInfo.get("canvasH");
            var pushXY = function (x, y){
                xStack.push(x);
                yStack.push(y);
            };
            var popx = function(){
                return xStack.pop();
            };
            var popy = function(){
                return yStack.pop();
            };

            pushXY(x, y);

            while(true)
            {
                // console.log(++debug);
                x = popx();
                if(x === undefined) {
                    return null;
                }
                // if(xStack.length ===0){
                //     return null;
                // }
                y = popy();
                y1 = y;
                var color = this._getRGBByXY(imageRGBArr, x, y1);
                while(y1 >= 0 && color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha) {
                    y1--;
                    color = this._getRGBByXY(imageRGBArr, x, y1);
                } // go to line top/bottom
                y1++; // start from line starting point pixel
                spanLeft = false;
                spanRight = false;
                color = this._getRGBByXY(imageRGBArr, x, y1);
                while(y1 < height && color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha) {
                    this._setRGBByXY(imageRGBArr, x, y1, newColor);
                    color = this._getRGBByXY(imageRGBArr, x-1, y1);
                    if(!spanLeft && x > 0 && color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha)// just keep left line once in the stack
                    {
                        pushXY(x - 1, y1);
                        spanLeft = true;
                    }
                    else if(spanLeft && x > 0 && (color.R !== oldColor.R||color.G !== oldColor.G||color.B !== oldColor.B||color.alpha !== oldColor.alpha))
                    {
                        spanLeft = false;
                    }

                    color = this._getRGBByXY(imageRGBArr, x+1, y1);
                    if(!spanRight && x < width - 1 && color.R === oldColor.R&&color.G === oldColor.G&&color.B === oldColor.B&&color.alpha === oldColor.alpha) // just keep right line once in the stack
                    {
                        pushXY(x + 1, y1);
                        spanRight = true;
                    }
                    else if(spanRight && x < width - 1 && (color.R !== oldColor.R||color.G !== oldColor.G||color.B !== oldColor.B||color.alpha !== oldColor.alpha))
                    {
                        spanRight = false;
                    }
                    y1++;
                    color = this._getRGBByXY(imageRGBArr, x, y1);
                }
            }
        }
        var _fillHandler = function(event){
            event = EventUtil.getEvent(event);
            var button = EventUtil.getButton(event);
            var imageData = null;
            var imageRGBArr = null;
            var X = null,
                Y = null,
                newColor = null,
                oldColor = null;
            X = this.get("X");
            Y = this.get("Y");

            if(button === 0 ){
                newColor = this._hexToRgba(drawingInfo.get("color"));
            }
            else if(button === 2){
                newColor = this._hexToRgba(drawingInfo.get("backgroundColor"));
            }
            else{
                return null;
            }
            //如果是在触摸设备，则选择前景色就填充前景色，选择背景色，就填充背景色
            if(!(client.system.win||client.system.mac||client.system.x11)){
                if(this.colorSetButtons[0].classList.contains("selected")){
                    newColor = this._hexToRgba(drawingInfo.get("color"));
                }
                else{
                    newColor = this._hexToRgba(drawingInfo.get("backgroundColor"));
                }
            }
            // newColor = (event.type === "click"? drawingInfo.color:drawingInfo.backgroundColor);
            imageData = this.context.getImageData(0, 0, this.canvasBox.width, this.canvasBox.height);
            imageRGBArr = imageData.data;
            oldColor = this._getRGBByXY(imageRGBArr, X, Y);
            // this._floodFill8(imageRGBArr, X, Y, oldColor, newColor);
            _floodFillScanLineWithStack.call(this, imageRGBArr, X, Y, oldColor, newColor);
            imageData.data = imageRGBArr;
            this.context.putImageData(imageData, 0, 0);
            this._saveDrawingToBuffer();
        }
    return {
        _addFillHandler: function(){
            this.addHandler(this.canvasWrap, "mousedown", _fillHandler);
        },
        _removeFillHandler: function(){
            this.fill.classList.remove("selected");
            this.removeHandler(this.canvasWrap, "mousedown", _fillHandler);
        }
    }
})