define(['EventUtil', 'drawingInfo'], function (EventUtil, drawingInfo) {
    return {
        // 点击重新调整大小的时候会进行的操作
        multiTransform: function () {
            var keepRatio = confirm("保持纵横比？");
            var inputData = prompt("输入图片新的宽度、高度、水平倾斜角度(°)、垂直倾斜角度(°)，格式如'400, 300, 0 ,0'或者'400%, 300%, 0, 0'", "100%, 100%, 0, 0");
            if(typeof inputData !== "string"){
                return null;
            }
            var regExpPixel = /\d{1,10}/g,
                regExpPer = /\d{1,10}%/g;
            var arrayPixel = inputData.match(regExpPixel);
            var arrayPer = inputData.match(regExpPer);
            var width = null,
                height = null,
                preWidth = drawingInfo.get("canvasW"),
                preHeight = drawingInfo.get("canvasH"),
                scaleX = null,
                scaleY = null,
                verticalIncline = null,     //与Y轴负方向的夹角，水平倾斜
                horizontalIncline = null;   //与X轴正方向的夹角，垂直倾斜
            if(!arrayPixel||(arrayPixel&&arrayPixel.length != 4)){
                alert("输入参数不合理");
                return null;
            }
            //返回范围内的数
            function limit(data, lowBorder, upBorder){
                if(lowBorder>upBorder){
                    return null;
                }
                if(data<lowBorder){
                    console.log("超过下限");
                    return lowBorder;
                }
                if(data>upBorder){
                    console.log("超过上限");

                    return upBorder;
                }
                return data;
            }
            width = parseInt(arrayPixel[0]);
            height = parseInt(arrayPixel[1]);
            verticalIncline = parseInt(arrayPixel[2]);
            horizontalIncline = parseInt(arrayPixel[3]);
            width = limit(width, 1, 500);
            height = limit(height, 1, 500);
            verticalIncline = limit(verticalIncline, -89, 89);       // 倾斜角度
            horizontalIncline = limit(horizontalIncline, -89, 89);   //

            if(!arrayPer||(arrayPer&&arrayPer.length === 0)){
                // width = parseInt(arrayPixel[0]);
                if(keepRatio === true){
                    height = preHeight/preWidth*width;
                }
                else{
                    // height = parseInt(arrayPixel[1]);
                }
            }
            else if(arrayPer&&arrayPer.length === 2){
                width = preWidth*width/100;
                if(keepRatio === true){
                    height = preHeight/preWidth*width;
                }
                else{
                    height = preHeight*height/100;
                }
            }
            else{
                alert("输入参数不合理");
                return null;
            }
            scaleX = width/preWidth;
            scaleY = height/preHeight;

            var imageStretch = function(){
                //transform(a, b, c, d, e, f);   //a水平拉伸，b水平倾斜（与X轴正方向夹角，即对应tanH,垂直倾斜
                this._resizeCanvasBox(this.canvasBox, width, height);
                this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                //倾斜
                // this.context.setTransform(1, -tanH, -tanV, 1, diffX, diffY);    //注意，倾斜用的参数为tan值
                this.context.scale(scaleX, scaleY);
                this.context.drawImage(this.image, 0, 0);
                this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                EventUtil.removeHandler(this.image, "load", imageStretch);
                EventUtil.addHandler(this.image, "load", imageIncline);
                this.image.src = this.canvasBox.toDataURL("image/png");
                this._saveDrawingToBuffer();
            }.bind(this);

            var imageIncline = function(){
                var tanV = Math.tan(verticalIncline*Math.PI/180);
                var tanH = Math.tan(horizontalIncline*Math.PI/180);
                //下面这个顺序非常重要
                var diffX = height*tanV;
                var diffY0 = width*tanH;
                width += diffX;
                var diffY = width*tanH;
                height += diffY;

                //transform(a, b, c, d, e, f);   //a水平拉伸，b水平倾斜（与X轴正方向夹角，即对应tanH,垂直倾斜
                this._resizeCanvasBox(this.canvasBox, width, height);
                this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                //倾斜
                // this.context.setTransform(1, -tanH, -tanV, 1, diffX, diffY);    //注意，倾斜用的参数为tan值
                this.context.drawImage(this.image, 0, 0);
                this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                this.context.transform(1, -tanH, 0, 1, diffX, 0);
                this.context.transform(1, 0, -tanV, 1, 0, diffY0);
                this.context.drawImage(this.image, 0, 0);
                this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                EventUtil.removeHandler(this.image, "load", imageIncline);
                this._saveDrawingToBuffer();
            }.bind(this);

            EventUtil.addHandler(this.image, "load", imageStretch);
            this.image.src = this.canvasBox.toDataURL("image/png");
        },
        rotate: function(event){
            event = EventUtil.getEvent(event);
            var target = EventUtil.getTarget(event);
            if(target.id === "right-90"||target.parentNode.id === "right-90"){
                //向右旋转90°
                var imageRight90 = function(){
                    this._resizeCanvasBox(this.canvasBox, this.canvasBox.height, this.canvasBox.width);
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    this.context.translate(this.canvasBox.width, 0);
                    this.context.rotate(0.5*Math.PI);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                    EventUtil.removeHandler(this.image, "load", imageRight90);
                    this._saveDrawingToBuffer();
                }.bind(this);
                EventUtil.addHandler(this.image, "load", imageRight90);
                this.image.src = this.canvasBox.toDataURL("image/png");
            }
            else if(target.id === "left-90"||target.parentNode.id === "left-90"){
                //向左旋转90°
                var imageLeft90 = function(){
                    this._resizeCanvasBox(this.canvasBox, this.canvasBox.height, this.canvasBox.width);
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    this.context.translate(0, this.canvasBox.height);
                    this.context.rotate(-0.5*Math.PI);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                    EventUtil.removeHandler(this.image, "load", imageLeft90);
                    this._saveDrawingToBuffer();
                }.bind(this);
                EventUtil.addHandler(this.image, "load", imageLeft90);
                this.image.src = this.canvasBox.toDataURL("image/png");
            }
            else if(target.id === "rotate-180"||target.parentNode.id === "rotate-180"){
                //旋转180°
                var rotate180 = function(){
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    this.context.setTransform(-1, 0, 0, -1, this.canvasBox.width, this.canvasBox.height);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                    EventUtil.removeHandler(this.image, "load", rotate180);
                    this._saveDrawingToBuffer();
                }.bind(this);
                EventUtil.addHandler(this.image, "load", rotate180);
                this.image.src = this.canvasBox.toDataURL("image/png");
            }
            else if(target.id === "flip-vertical"||target.parentNode.id === "flip-vertical"){
                //垂直翻转
                var flipVertical = function(){
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    this.context.setTransform(1, 0, 0, -1, 0, this.canvasBox.height);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                    EventUtil.removeHandler(this.image, "load", flipVertical);
                    this._saveDrawingToBuffer();
                }.bind(this);
                EventUtil.addHandler(this.image, "load", flipVertical);
                this.image.src = this.canvasBox.toDataURL("image/png");
            }
            else if(target.id === "flip-horizontal"||target.parentNode.id === "flip-horizontal"){
                //水平翻转
                var flipHorizontal = function(){
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    this.context.setTransform(-1, 0, 0, 1, this.canvasBox.width, 0);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                    EventUtil.removeHandler(this.image, "load", flipHorizontal);
                    this._saveDrawingToBuffer();
                }.bind(this);
                EventUtil.addHandler(this.image, "load", flipHorizontal);
                this.image.src = this.canvasBox.toDataURL("image/png");
            }
        }
    }
})