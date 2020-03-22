define(['drawingInfo', 'Class', 'base', 'Observer'], function (drawingInfo, Class, base, Observer) {
    //组件基对象
    var Base = Class.extend(base);
    //加入观察者模式
    var RichBase = Base.extend(Observer);
    //加入观察者模式
    RichBase = RichBase.extend({
        //加入节流机制(还需要改进)
        throttle: function(func, delay){
            var prev = Date.now(),
                self = this;

            return function () {
                var arg = Array.prototype.slice.call(arguments, 0);
                var now = Date.now();
                if(now-prev >= delay){
                    func.apply(self, arg);
                    prev = now;
                }
            }
        },
        //坐标转换
        _xConvert: function (X){
            var bbox = this.canvasBox.getBoundingClientRect();
            return X -= bbox.left;
        },
        _yConvert: function (Y){
            var bbox = this.canvasBox.getBoundingClientRect();
            // return Y -= 146;
            return Y -= bbox.top;
        },
        _xyConvert: function (X, Y) {
            var bbox = this.canvasBox.getBoundingClientRect();
            X -= bbox.left;
            Y -= bbox.top;
            return { X: X, Y: Y }
        },
        //实时显示绘图区域坐标位置
        _displayCursorPos: function(x, y){
            (x>=0&&y>=0)? this.bottomFonts[0].textContent = Math.round(x) + '×' + Math.round(y) + '像素': this.bottomFonts[0].textContent =""; // review：将方法与页面元素耦合
        },
        //实时显示绘图区域大小
        _displaySize: function (x, y){
            (x>=0&&y>=0)? this.bottomFonts[2].textContent = Math.round(x) + '×' + Math.round(y) + '像素': this.bottomFonts[2].textContent ="";
        },
        //实时显示绘图区域大小
        _displaySelectSize: function (x, y){
            (x>=0&&y>=0)? this.bottomFonts[1].textContent = Math.round(x) + '×' + Math.round(y) + '像素': this.bottomFonts[1].textContent ="";
        },
        _resizeCanvasBox: function(target, width, height){
            if(!target){
                return null;
            }
            //先保存图像信息
            var ctx = target.getContext("2d");
            if(!(target.width&&target.height)){
                return null;
            }
            var imgData = ctx.getImageData(0, 0, target.width, target.height);
            if(typeof width === "number"&&typeof height === "number"){
                target.width = width;
                target.height = height;
                if(target.id === "canvasBox"){
                    // console.log('this.drawingInfo: ', this)
                    drawingInfo.set("canvasW", width); // 与drawingInfo耦合了，drawingInfo是一个保存了配置信息的对象
                    drawingInfo.set("canvasH", height);
                }
                this._displaySize(width, height);
            }
            ctx.putImageData(imgData, 0, 0);   //还原图像
        },
        //撤销重做原型
        _saveDrawingToBuffer: function(){
            // console.log('this.drawingInfo: ', this)
            var reDoUnDo = drawingInfo.get("reDoUnDo"),
                buffer = reDoUnDo.buffer,
                index = reDoUnDo.index,
                preWidth = drawingInfo.get("canvasW"),   //当前canvas宽度
                preHeight = drawingInfo.get("canvasH");  //当前canvas高度
            if(buffer.length === 50){
                buffer.shift();   //移除第一项
                if(index-1<=0){
                    this._removeUndoHandler();
                }else{
                    index--;
                }
            }
            index++;
            buffer.push(this.context.getImageData(0, 0, preWidth, preHeight));
            if(buffer.length > 1){
                //加载撤销操作事件
                this._addUndoHandler();
            }
            reDoUnDo.buffer = buffer;
            reDoUnDo.index = index;
            drawingInfo.set("reDoUnDo", reDoUnDo);
        },
        _undo: function(){
            var reDoUnDo = drawingInfo.get("reDoUnDo"),
                buffer = reDoUnDo.buffer,
                index = reDoUnDo.index,
                // preWidth = drawingInfo.get("canvasW"),   //当前canvas宽度
                // preHeight = drawingInfo.get("canvasH"),  //当前canvas高度
                recWidth= null,
                recHeight = null,
                imageData;
            index = index -1;
            imageData = buffer[index];
            recWidth = imageData.width;
            recHeight = imageData.height;
            // this.context.clearRect(0, 0, width, height);
            this._resizeCanvasBox(this.canvasBox, recWidth, recHeight);
            this.context.putImageData(imageData, 0, 0);
            if(index > 0){

            }else{
                //删除撤销操作事件
                this._removeUndoHandler();

            }
            if(index < buffer.length-1){
                //绑定redo事件
                this._addRedoHandler();
            }
            reDoUnDo.index = index;
            drawingInfo.set("reDoUnDo", reDoUnDo);
        },
        _redo: function(){
            var reDoUnDo = drawingInfo.get("reDoUnDo"),
                buffer = reDoUnDo.buffer,
                index = reDoUnDo.index,
                recWidth,
                recHeight,
                imageData;
            index = index +1;
            imageData = buffer[index];
            recWidth = imageData.width;
            recHeight = imageData.height;
            // this.context.clearRect(0, 0, width, height);
            this._resizeCanvasBox(this.canvasBox, recWidth, recHeight);
            this.context.putImageData(imageData, 0, 0);
            if(index < buffer.length-1){

            }
            else{
                //删除重做事件
                this._removeRedoHandler();
            }
            if(index > 0){
                this._addUndoHandler();
            }
            reDoUnDo.index = index;
            drawingInfo.set("reDoUnDo", reDoUnDo);
        },

        //
        _addRedoHandler: function(){
            this.redo.classList.remove("invalid");
            this.addHandler(this.redo, "handlers", this._redo);
        },
        //
        _removeRedoHandler: function(){
            this.redo.classList.add("invalid");
            this.removeHandler(this.redo, "handlers", this._redo);
        },
        //
        _addUndoHandler: function(){
            this.undo.classList.remove("invalid");
            this.addHandler(this.undo, "handlers", this._undo);
        },
        //
        _removeUndoHandler: function(){
            this.undo.classList.add("invalid");
            this.removeHandler(this.undo, "handlers", this._undo);
        }
    });
    return RichBase;
})