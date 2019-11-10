define(['drawingInfo'], function (drawingInfo) {
    return {
        //模板坐标
        _ellipse: function(width, height){
            var lineWeight = drawingInfo.get("lineWeight");
                //假设elementWrap长宽都为1，定义绘图参数
                //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
            var  coordinate = {
                    x: 0.5,
                    y: 0.5,
                    radiusX: 0.5,
                    radiusY: 0.5
                },
                //x方向的放大系数
                xGain = (width - 1)>0? width - 1:1,
                yGain = (height - 1)>0? height - 1:1;
            coordinate.x = coordinate.x * xGain;
            coordinate.radiusX = coordinate.radiusX * xGain;
            coordinate.y = coordinate.y * yGain;
            coordinate.radiusY = coordinate.radiusY * yGain;
            //转换为editCanwas坐标
            coordinate.x = coordinate.x + 0.5*lineWeight;
            coordinate.y = coordinate.y + 0.5*lineWeight;
            return coordinate;
        },
        _drawEllipse: function(target, options){
            var ctx = target.getContext("2d"),
                lineWeight = options.lineWeight || drawingInfo.get("lineWeight"),
                radiusX = options.radiusX || lineWeight*0.5,
                radiusY = options.radiusY || lineWeight*0.5,
                x = options.x || 0,
                y = options.y || 0;

            ctx.moveTo(x + radiusX, y);

            if(ctx.ellipse){
                ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2*Math.PI, false);
                // ctx.stroke();
            }else{
                alert("浏览器canvas绘制椭圆");
            }
        },
        _rectangle: function(width, height){
            var lineWeight = drawingInfo.get("lineWeight");
            //假设elementWrap长宽都为1，定义绘图参数
            //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
            var  coordinate = {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1
                },
                //x方向的放大系数
                xGain = (width - 1)>0? width - 1:1,
                yGain = (height - 1)>0? height - 1:1;
            coordinate.x = coordinate.x * xGain;
            coordinate.width = coordinate.width * xGain;
            coordinate.y = coordinate.y * yGain;
            coordinate.height = coordinate.height * yGain;
            //转换为editCanwas坐标
            coordinate.x = coordinate.x + 0.5*lineWeight;
            coordinate.y = coordinate.y + 0.5*lineWeight;
            return coordinate;
        },
        _drawRectangle: function(target, options){
            var ctx = target.getContext("2d"),
                lineWeight = options.lineWeight || drawingInfo.get("lineWeight"),
                x = options.x || lineWeight,
                y = options.y || lineWeight,
                width = options.width - 1,
                height = options.height -1;

            ctx.moveTo(x, y);
            ctx.rect(x, y, width, height);
        },
        _circleRectangle: function(width, height){
            var lineWeight = drawingInfo.get("lineWeight");
            //假设elementWrap长宽都为1，定义绘图参数
            //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
            var  coordinate = {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    radius: 0.1
                },
                //x方向的放大系数，并转换为editCanwas坐标
                xGain = (width - 1)>0? width - 1:1,
                yGain = (height - 1)>0? height - 1:1;
            coordinate.x = 0.5*lineWeight;
            coordinate.y = 0.5*lineWeight;
            coordinate.width = coordinate.width * xGain;
            coordinate.height = coordinate.height * yGain;
            coordinate.radius = coordinate.width>coordinate.height? coordinate.radius * yGain + 0.5*lineWeight:coordinate.radius * xGain + 0.5*lineWeight;
            return coordinate;
        },
        _drawCircleRectangle: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height,
                radius = options.radius;
                ctx.moveTo(x+radius, y);
                ctx.lineTo(x+width-radius, y);
                ctx.arc(x+width-radius, y+radius, radius, -Math.PI*0.5, 0, false);
                ctx.lineTo(x+width, y+height-radius);
                ctx.arc(x+width-radius, y+height-radius, radius, 0, Math.PI*0.5, false);
                ctx.lineTo(x+radius, y+height);
                ctx.arc(x+radius, y+height-radius, radius, Math.PI*0.5, Math.PI, false);
                ctx.lineTo(x, y+radius);
                ctx.arc(x+radius, y+radius, radius, Math.PI, 1.5*Math.PI, false);
        },
        _triangle: function(width, height){
            var lineWeight = drawingInfo.get("lineWeight");
            //假设elementWrap长宽都为1，定义绘图参数
            //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
            var  coordinate = {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1
                },
                //x方向的放大系数，并转换为editCanwas坐标
                xGain = (width - 1)>0? width - 1:1,
                yGain = (height - 1)>0? height - 1:1;
            coordinate.x = 0.5*lineWeight;
            coordinate.y = 0.5*lineWeight;
            coordinate.width = coordinate.width * xGain;
            coordinate.height = coordinate.height * yGain;
            coordinate.radius = coordinate.width>coordinate.height? coordinate.radius * yGain + 0.5*lineWeight:coordinate.radius * xGain + 0.5*lineWeight;
            return coordinate;
        },
        _drawTriangle: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x+width, y+height);
            ctx.lineTo(x, y+height);
            ctx.lineTo(x+width*0.5, y);
        },
        _drawRightTriangle: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x, y);
            ctx.lineTo(x+width, y+height);
            ctx.lineTo(x, y+height);
            ctx.lineTo(x, y);
        },
        //四边形 菱形
        _drawQuadrangle: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x+width, y+height*0.5);
            ctx.lineTo(x+width*0.5, y+height);
            ctx.lineTo(x, y+height*0.5);
            ctx.lineTo(x+width*0.5, y);
        },
        //五边形
        _drawPentagon: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x+width, y+height*0.35);
            ctx.lineTo(x+width*0.8, y+height);
            ctx.lineTo(x+width*0.2, y+height);
            ctx.lineTo(x, y+height*0.35);
            ctx.lineTo(x+width*0.5, y);
        },
        //六边形
        _drawHexagon: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x+width, y+height*0.25);
            ctx.lineTo(x+width, y+height*0.75);
            ctx.lineTo(x+width*0.5, y+height);
            ctx.lineTo(x, y+height*0.75);
            ctx.lineTo(x, y+height*0.25);
            ctx.lineTo(x+width*0.5, y);
        },
        //向右的箭头
        _drawShapeArrowRight: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x+width, y+height*0.5);
            ctx.lineTo(x+width*0.5, y+height);
            ctx.lineTo(x+width*0.5, y+height*0.75);
            ctx.lineTo(x, y+height*0.75);
            ctx.lineTo(x, y+height*0.25);
            ctx.lineTo(x+width*0.5, y+height*0.25);
            ctx.lineTo(x+width*0.5, y);
        },
        //向左的箭头
        _drawShapeArrowLeft: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x, y+height*0.5);
            ctx.lineTo(x+width*0.5, y+height);
            ctx.lineTo(x+width*0.5, y+height*0.75);
            ctx.lineTo(x+width, y+height*0.75);
            ctx.lineTo(x+width, y+height*0.25);
            ctx.lineTo(x+width*0.5, y+height*0.25);
            ctx.lineTo(x+width*0.5, y);
        },
        //向上的箭头
        _drawShapeArrowUp: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x, y+height*0.5);
            ctx.lineTo(x+width*0.25, y+height*0.5);
            ctx.lineTo(x+width*0.25, y+height);
            ctx.lineTo(x+width*0.75, y+height);
            ctx.lineTo(x+width*0.75, y+height*0.5);
            ctx.lineTo(x+width, y+height*0.5);
            ctx.lineTo(x+width*0.5, y);
        },
        //向下的箭头
        _drawShapeArrowDown: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.25, y);
            ctx.lineTo(x+width*0.75, y);
            ctx.lineTo(x+width*0.75, y+height*0.5);
            ctx.lineTo(x+width, y+height*0.5);
            ctx.lineTo(x+width*0.5, y+height);
            ctx.lineTo(x, y+height*0.5);
            ctx.lineTo(x+width*0.25, y+height*0.5);
            ctx.lineTo(x+width*0.25, y);
        },
        //四角星形
        _draw4Star: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x+width*0.6, y+height*0.4);
            ctx.lineTo(x+width, y+height*0.5);
            ctx.lineTo(x+width*0.6, y+height*0.6);
            ctx.lineTo(x+width*0.5, y+height);
            ctx.lineTo(x+width*0.4, y+height*0.6);
            ctx.lineTo(x, y+height*0.5);
            ctx.lineTo(x+width*0.4, y+height*0.4);
            ctx.lineTo(x+width*0.5, y);
        },
        _5star: function(width, height){
            var halfLineWeight = drawingInfo.get("lineWeight");
            //假设elementWrap长宽都为1，定义绘图参数
            //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
            var  coordinate = {
                    x1: 0.5, y1: 0, x2: 0.618, y2: 0.382, x3: 1, y3: 0.4, x4: 0.696, y4: 0.62, x5: 0.808, y5: 1,
                    x6: 0.5, y6:0.8, x7: 0.192, y7: 1, x8: 0.304, y8: 0.62, x9: 0, y9: 0.4, x10: 0.382, y10: 0.382
                },
                //x方向的放大系数，并转换为editCanwas坐标
                xGain = (width - 1)>0? width - 1:1,
                yGain = (height - 1)>0? height - 1:1;
            coordinate.x1 = coordinate.x1 * xGain + halfLineWeight;
            coordinate.x2 = coordinate.x2 * xGain + halfLineWeight;
            coordinate.x3 = xGain + halfLineWeight;
            coordinate.x4 = coordinate.x4 * xGain + halfLineWeight;
            coordinate.x5 = coordinate.x5 * xGain + halfLineWeight;
            coordinate.x6 = coordinate.x6 * xGain + halfLineWeight;
            coordinate.x7 = coordinate.x7 * xGain + halfLineWeight;
            coordinate.x8 = coordinate.x8 * xGain + halfLineWeight;
            coordinate.x9 = halfLineWeight;
            coordinate.x10 = coordinate.x10 * xGain + halfLineWeight;
            coordinate.y1 = halfLineWeight;
            coordinate.y2 = coordinate.y2 * yGain + halfLineWeight;
            coordinate.y3 = coordinate.y3 * yGain + halfLineWeight;
            coordinate.y4 = coordinate.y4 * yGain + halfLineWeight;
            coordinate.y5 = yGain + halfLineWeight;
            coordinate.y6 = coordinate.y6 * yGain + halfLineWeight;
            coordinate.y7 = yGain + halfLineWeight;
            coordinate.y8 = coordinate.y8 * yGain + halfLineWeight;
            coordinate.y9 = coordinate.y9 * yGain + halfLineWeight;
            coordinate.y10 = coordinate.y10 * yGain + halfLineWeight;
            return coordinate;
        },
        //五角星形
        _draw5Star: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(options.x1, options.y1);
            ctx.lineTo(options.x2, options.y2);
            ctx.lineTo(options.x3, options.y3);
            ctx.lineTo(options.x4, options.y4);
            ctx.lineTo(options.x5, options.y5);
            ctx.lineTo(options.x6, options.y6);
            ctx.lineTo(options.x7, options.y7);
            ctx.lineTo(options.x8, options.y8);
            ctx.lineTo(options.x9, options.y9);
            ctx.lineTo(options.x10, options.y10);
            ctx.lineTo(options.x1, options.y1);
        },
        //六角星形
        _draw6Star: function(target, options){
            var ctx = target.getContext("2d"),
                x = options.x,
                y = options.y,
                width = options.width,
                height = options.height;
            ctx.moveTo(x+width*0.5, y);
            ctx.lineTo(x+width*0.68, y+height*0.25);
            ctx.lineTo(x+width, y+height*0.25);
            ctx.lineTo(x+width*0.836, y+height*0.5);
            ctx.lineTo(x+width, y+height*0.75);
            ctx.lineTo(x+width*0.68, y+height*0.75);
            ctx.lineTo(x+width*0.5, y+height);
            ctx.lineTo(x+width*0.32, y+height*0.75);
            ctx.lineTo(x, y+height*0.75);
            ctx.lineTo(x+width*0.164, y+height*0.5);
            ctx.lineTo(x, y+height*0.25);
            ctx.lineTo(x+width*0.32, y+height*0.25);
            ctx.lineTo(x+width*0.5, y);
        },
        _heart: function(width, height){
            var halfLineWeight = drawingInfo.get("lineWeight")*0.5;
            //假设elementWrap长宽都为1，定义绘图参数
            //注意，这个坐标并不是editCanvas的x坐标，而是以elementWrap： (0,0)对应(top+0.5， left+0.5）构成的坐标系
            var  coordinate = {
                    x1: 0.5, y1: 0.26, x2: 0.412, y2: 0, x3: 0.226, y3: 0, x4: 0, y4: 0, x5: 0, y5: 0.3,
                    x6: 0, y6:0.738, x7: 0.5, y7: 1,x8: 1, y8: 0.738, x9: 1, y9: 0.3, x10: 1, y10: 0,x11: 0.774, y11: 0,
                    x12: 0.588, y12:0
                },
                //x方向的放大系数，并转换为editCanwas坐标
                xGain = (width - 1)>0? width - 1:1,
                yGain = (height - 1)>0? height - 1:1;
            coordinate.x1 = coordinate.x1 * xGain + halfLineWeight;
            coordinate.x2 = coordinate.x2 * xGain + halfLineWeight;
            coordinate.x3 = coordinate.x3 * xGain + halfLineWeight;
            coordinate.x4 = halfLineWeight;
            coordinate.x5 = halfLineWeight;
            coordinate.x6 = halfLineWeight;
            coordinate.x7 = coordinate.x7 * xGain + halfLineWeight;
            coordinate.x8 = xGain + halfLineWeight;
            coordinate.x9 = xGain + halfLineWeight;
            coordinate.x10 = xGain + halfLineWeight;
            coordinate.x11 = coordinate.x11 * xGain + halfLineWeight;
            coordinate.x12 = coordinate.x12 * xGain + halfLineWeight;
            coordinate.y1 = coordinate.y1 * yGain + halfLineWeight;
            coordinate.y2 = halfLineWeight;
            coordinate.y3 = halfLineWeight;
            coordinate.y4 = halfLineWeight;
            coordinate.y5 = coordinate.y5 * yGain + halfLineWeight;
            coordinate.y6 = coordinate.y6 * yGain + halfLineWeight;
            coordinate.y7 = yGain + halfLineWeight;
            coordinate.y8 = coordinate.y8 * yGain + halfLineWeight;
            coordinate.y9 = coordinate.y9 * yGain + halfLineWeight;
            coordinate.y10 = halfLineWeight;
            coordinate.y11 = halfLineWeight;
            coordinate.y12 = halfLineWeight;
            return coordinate;
        },
        //五角星形
        _drawHeart: function(target, options){
            var ctx = target.getContext("2d");
            ctx.moveTo(options.x1,options.y1);
            ctx.quadraticCurveTo(options.x2,options.y2,options.x3,options.y3);
            ctx.quadraticCurveTo(options.x4,options.y4,options.x5,options.y5);
            ctx.quadraticCurveTo(options.x6,options.y6,options.x7,options.y7);
            ctx.quadraticCurveTo(options.x8,options.y8,options.x9,options.y9);
            ctx.quadraticCurveTo(options.x10,options.y10,options.x11,options.y11);
            ctx.quadraticCurveTo(options.x12,options.y12,options.x1,options.y1);
        },
        // 图形绘制方法
        _shapeDraw: function(target, shapeFunc, options){
            var editContext = target.getContext("2d");
            editContext.beginPath();
            editContext.lineWidth = drawingInfo.get("lineWeight");
            editContext.strokeStyle = drawingInfo.get("color");
            console.log('target, shapeFunc, options', target, shapeFunc, options)
            shapeFunc.call(this, target, options);
            editContext.closePath();
            editContext.stroke();
        },
        _drawDiffShapes: function(){
            var behavior = drawingInfo.get("behavior"),
                description = drawingInfo.get("description"),
                lineWeight = drawingInfo.get("lineWeight"),
                diff = lineWeight*0.5,
                top = parseInt(this.elementWrap.style.top),
                left = parseInt(this.elementWrap.style.left),
                width = parseInt(this.elementWrap.style.width),
                height = parseInt(this.elementWrap.style["min-height"]),
                editCanvasStyle = {
                    display: "inline-block",
                    top: top + 0.5 - diff  + "px",
                    left: left + 0.5 - diff  + "px",
                    width: width + 2*lineWeight + 1,
                    height: height + 2*lineWeight + 1
                },
                coordinate;
            if(behavior === "shape"){
                this._appendStyle(this.editCanvasBox, editCanvasStyle);
                switch (description)
                {
                    case "ellipse":
                        coordinate = this._ellipse(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawEllipse, coordinate);
                        break;
                    case "rectangle":
                        coordinate = this._rectangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawRectangle, coordinate);
                        break;
                    case "circle-rectangle":
                        coordinate = this._circleRectangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawCircleRectangle, coordinate);
                        break;
                    case "triangle":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawTriangle, coordinate);
                        break;
                    case "right-triangle":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawRightTriangle, coordinate);
                        break;
                    case "quadrangle":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawQuadrangle, coordinate);
                        break;
                    case "pentagon":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawPentagon, coordinate);
                        break;
                    case "hexagon":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawHexagon, coordinate);
                        break;
                    case "shape-arrow-right":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawShapeArrowRight, coordinate);
                        break;
                    case "shape-arrow-left":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawShapeArrowLeft, coordinate);
                        break;
                    case "shape-arrow-up":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawShapeArrowUp, coordinate);
                        break;
                    case "shape-arrow-down":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawShapeArrowDown, coordinate);
                        break;
                    case "four-star":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._draw4Star, coordinate);
                        break;
                    case "five-star":
                        coordinate = this._5star(width, height);
                        this._shapeDraw(this.editCanvasBox, this._draw5Star, coordinate);
                        break;
                    case "six-star":
                        coordinate = this._triangle(width, height);
                        this._shapeDraw(this.editCanvasBox, this._draw6Star, coordinate);
                        break;
                    case "heart":
                        coordinate = this._heart(width, height);
                        this._shapeDraw(this.editCanvasBox, this._drawHeart, coordinate);
                        break;
                }
            }
        },
        _drawShapeToCanvas: function(){
            var behavior = drawingInfo.get("behavior"),
                description = drawingInfo.get("description"),
                target = this.canvasBox,
                lineWeight = drawingInfo.get("lineWeight"),
                diff = lineWeight*0.5,
                top = parseInt(this.elementWrap.style.top),
                left = parseInt(this.elementWrap.style.left),
                width = parseInt(this.elementWrap.style.width),
                height = parseInt(this.elementWrap.style["min-height"]),
                coordinate;

            if(behavior === "shape"){
                switch (description)
                {
                    case "ellipse":
                        coordinate = this._ellipse(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawEllipse, coordinate, true);
                        break;
                    case "rectangle":
                        coordinate = this._rectangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawRectangle, coordinate, true);
                        break;
                    case "circle-rectangle":
                        coordinate = this._circleRectangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawCircleRectangle, coordinate, true);
                        break;
                    case "triangle":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawTriangle, coordinate, true);
                        break;
                    case "right-triangle":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawRightTriangle, coordinate, true);
                        break;
                    case "pentagon":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawPentagon, coordinate, true);
                        break;
                    case "hexagon":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawHexagon, coordinate, true);
                        break;
                    case "shape-arrow-right":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawShapeArrowRight, coordinate, true);
                        break;
                    case "shape-arrow-left":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawShapeArrowLeft, coordinate, true);
                        break;
                    case "shape-arrow-up":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawShapeArrowUp, coordinate, true);
                        break;
                    case "shape-arrow-down":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawShapeArrowDown, coordinate, true);
                        break;
                    case "four-star":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._draw4Star, coordinate, true);
                        break;
                    case "five-star":
                        coordinate = this._5star(width, height);
                        coordinate.x1 = coordinate.x1 + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.x2 = coordinate.x2 + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.x3 = coordinate.x3 + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.x4 = coordinate.x4 + left + 0.5 - diff;
                        coordinate.x5 = coordinate.x5 + left + 0.5 - diff;
                        coordinate.x6 = coordinate.x6 + left + 0.5 - diff;
                        coordinate.x7 = coordinate.x7 + left + 0.5 - diff;
                        coordinate.x8 = coordinate.x8 + left + 0.5 - diff;
                        coordinate.x9 = coordinate.x9 + left + 0.5 - diff;
                        coordinate.x10 = coordinate.x10 + left + 0.5 - diff;
                        coordinate.y1 = coordinate.y1 + top + 0.5 - diff;
                        coordinate.y2 = coordinate.y2 + top + 0.5 - diff;
                        coordinate.y3 = coordinate.y3 + top + 0.5 - diff;
                        coordinate.y4 = coordinate.y4 + top + 0.5 - diff;
                        coordinate.y5 = coordinate.y5 + top + 0.5 - diff;
                        coordinate.y6 = coordinate.y6 + top + 0.5 - diff;
                        coordinate.y7 = coordinate.y7 + top + 0.5 - diff;
                        coordinate.y8 = coordinate.y8 + top + 0.5 - diff;
                        coordinate.y9 = coordinate.y9 + top + 0.5 - diff;
                        coordinate.y10 = coordinate.y10 + top + 0.5 - diff;
                        this._shapeDraw(target, this._draw5Star, coordinate, true);
                        break;
                    case "six-star":
                        coordinate = this._triangle(width, height);
                        coordinate.x = coordinate.x + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.y = coordinate.y + top + 0.5 - diff;
                        this._shapeDraw(target, this._draw6Star, coordinate, true);
                        break;
                    case "heart":
                        coordinate = this._heart(width, height);
                        coordinate.x1 = coordinate.x1 + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.x2 = coordinate.x2 + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.x3 = coordinate.x3 + left + 0.5 - diff;   //转化为canvas坐标
                        coordinate.x4 = coordinate.x4 + left + 0.5 - diff;
                        coordinate.x5 = coordinate.x5 + left + 0.5 - diff;
                        coordinate.x6 = coordinate.x6 + left + 0.5 - diff;
                        coordinate.x7 = coordinate.x7 + left + 0.5 - diff;
                        coordinate.x8 = coordinate.x8 + left + 0.5 - diff;
                        coordinate.x9 = coordinate.x9 + left + 0.5 - diff;
                        coordinate.x10 = coordinate.x10 + left + 0.5 - diff;
                        coordinate.x11 = coordinate.x11 + left + 0.5 - diff;
                        coordinate.x12 = coordinate.x12 + left + 0.5 - diff;
                        coordinate.y1 = coordinate.y1 + top + 0.5 - diff;
                        coordinate.y2 = coordinate.y2 + top + 0.5 - diff;
                        coordinate.y3 = coordinate.y3 + top + 0.5 - diff;
                        coordinate.y4 = coordinate.y4 + top + 0.5 - diff;
                        coordinate.y5 = coordinate.y5 + top + 0.5 - diff;
                        coordinate.y6 = coordinate.y6 + top + 0.5 - diff;
                        coordinate.y7 = coordinate.y7 + top + 0.5 - diff;
                        coordinate.y8 = coordinate.y8 + top + 0.5 - diff;
                        coordinate.y9 = coordinate.y9 + top + 0.5 - diff;
                        coordinate.y10 = coordinate.y10 + top + 0.5 - diff;
                        coordinate.y11 = coordinate.y11 + top + 0.5 - diff;
                        coordinate.y12 = coordinate.y12 + top + 0.5 - diff;
                        this._shapeDraw(target, this._drawHeart, coordinate, true);
                        break;
                }
            }
        },
    }
})