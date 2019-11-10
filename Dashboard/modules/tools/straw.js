define(['drawingInfo'], function (drawingInfo) {
    var _setForecolor = function(target, color){
        target.style.backgroundColor = color;
    }
    //吸管工具
    var _strawHandler = function(){
        var X = this.get("X"),
            Y = this.get("Y");
        var imageRGBArr = this.context.getImageData(0, 0, this.canvasBox.width, this.canvasBox.height).data;
        var colorObj = this._getRGBByXY(imageRGBArr, X, Y);
        var color = `rgba(${colorObj.R}, ${colorObj.G}, ${colorObj.B}, ${colorObj.alpha/255})`;
        console.log(color);
        _setForecolor(this.foreColor, color);
        drawingInfo.set("color", color);
    }
    return {
        _addStrawHandler: function(){
            this.addHandler(this.canvasWrap, "click", _strawHandler);
        },
        _removeStrawHandler: function(){
            this.straw.classList.remove("selected");
            this.removeHandler(this.canvasWrap, "click", _strawHandler);
        }
    }
})