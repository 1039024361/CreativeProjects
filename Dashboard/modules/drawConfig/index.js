define(['tools', 'shapes', 'RichBase', 'drawLine','straw', 'fill', 'moveStretch', 'virtualBox', 'fillText', 'magnify', 'pasteImage', 'paste', 'drawImage', 'drawShape', 
'moreShape', 'file', 'EVENTS', 'init'],
function (tools, shapes, RichBase, drawLine, straw, fill, moveStretch,virtualBox, fillText, magnify, pasteImage, paste, drawImage,
    drawShape, moreShape, file, EVENTS, init) {
    // 程序主体
    //绘图模块设计
    var Drawing = RichBase.extend({
        //在这里注册所有事件，使用观察者模式
        EVENTS: EVENTS,
        _ctrlEvent:{
            target: null,
            flag: false,
            startXY:[null, null],
            middleXY:[null,null],
            endXY:[null, null],
            startStretchXY:[null, null],
        },
        //绑定新得事件，移除之前事件处理程序
        _handle: function(newHandler, newRemoveHandler){
            this.fire(this, "handlers");            //执行之前保存的remove的handler
            this.removeHandler(this, "handlers");   //清空handler数组
            if(newRemoveHandler){
                this.addHandler(this, "handlers", newRemoveHandler);   //添加新的事件处理
            }
            if(newHandler){
                newHandler.apply(this);
            }
        },
        //字符串颜色值转换成rgba颜色值
        _hexToRgba: tools._hexToRgba,
        //返回指定点的RGB值
        _getRGB: tools._getRGB,
        //根据坐标返回RGB值
        _getRGBByXY: function (imageRGBArr, X, Y) {
            return tools._getRGBByXY(imageRGBArr, X, Y, this)
        },
        //设置RGB
        _setRGB: tools._setRGB,
        //设置RGB
        _setRGBByXY: function (imageRGBArr, X, Y, color) {
            tools._setRGBByXY(imageRGBArr, X, Y, color, this)
        },
        _appendStyle: tools._appendStyle,
        //事件绑定函数
        //添加画线事件
        //注意，默认是已经加上绘图事件
        _addDrawLineHandler: drawLine._addDrawLineHandler,
        _removeDrawLineHandler: drawLine._removeDrawLineHandler,
        //设置目标前景色
        _addStrawHandler: straw._addStrawHandler,
        _removeStrawHandler: straw._removeStrawHandler,
        //注入填充区域算法
        _addFillHandler: fill._addFillHandler,
        _removeFillHandler: fill._removeFillHandler,
        // 放大镜
        _addMagnifierHandler: magnify._addMagnifierHandler,
        _removeMagnifierHandler: magnify._removeMagnifierHandler,
        //将移动及拉伸选框事件合二为一
        _addMoveAndStretchElementHandler: moveStretch._addMoveAndStretchElementHandler,
        _removeMoveAndStretchElementHandler: moveStretch._removeMoveAndStretchElementHandler,
        //虚线框效果处理事件
        _addVirtualBoxHandler: virtualBox._addVirtualBoxHandler,
        _removeVirtualBoxHandler: virtualBox._removeVirtualBoxHandler,
        //文本加载事件
        _addTextInputHandler: fillText._addTextInputHandler,
        //删除文本事件
        _removeTextInputHandler: fillText._removeTextInputHandler,
        //添加粘贴事件
        _addImgPasteHandler: pasteImage._addImgPasteHandler,
        //移除粘贴事件
        _removeImgPasteHandler: pasteImage._removeImgPasteHandler,
        //模拟粘贴事件处理程序
        _addCopyPasteHandler: pasteImage._addCopyPasteHandler,
        _removeCopyPasteHandler: pasteImage._removeCopyPasteHandler,
        _addPasteButtonHandler: paste._addPasteButtonHandler,
        _removePasteButtonHandler: paste._removePasteButtonHandler,

        _drawImage: tools._drawImage,
        _showSelectObj: tools._showSelectObj,
        //notFill： 为了模拟剪切事件不填充的效果
        _fillImage: tools._fillImage,
        //image事件
        _addDrawImageHandler: drawImage._addDrawImageHandler,
        _removeDrawImageHandler: drawImage._removeDrawImageHandler,
        _addArrowEventHandle: moreShape._addArrowEventHandle,
        _removeArrowEventHandle: moreShape._removeArrowEventHandle,
        //形状绘图事件
        //模板坐标
        _ellipse: shapes._ellipse,
        _drawEllipse: shapes._drawEllipse,
        //矩形
        //模板坐标
        _rectangle: shapes._rectangle,
        _drawRectangle: shapes._drawRectangle,
        //圆角矩形
        _circleRectangle: shapes._circleRectangle,
        _drawCircleRectangle: shapes._drawCircleRectangle,
        //三角形
        _triangle: shapes._circleRectangle,
        _drawTriangle: shapes._drawTriangle,
        _drawRightTriangle: shapes._drawRightTriangle,
        //四边形 菱形
        _drawQuadrangle: shapes._drawQuadrangle,
        //五边形
        _drawPentagon: shapes._drawPentagon,
        //六边形
        _drawHexagon: shapes._drawHexagon,
        //向右的箭头
        _drawShapeArrowRight: shapes._drawShapeArrowRight,
        //向左的箭头
        _drawShapeArrowLeft: shapes._drawShapeArrowLeft,
        //向上的箭头
        _drawShapeArrowUp: shapes._drawShapeArrowUp,
        //向下的箭头
        _drawShapeArrowDown: shapes._drawShapeArrowDown,
        //四角星形
        _draw4Star: shapes._draw4Star,
        _5star: shapes._5star,
        //五角星形
        _draw5Star: shapes._draw5Star,
        //六角星形
        _draw6Star: shapes._draw6Star,
        _heart: shapes._heart,
        //五角星形
        _drawHeart: shapes._drawHeart,
        _shapeDraw: shapes._shapeDraw,
        _drawDiffShapes: shapes._drawDiffShapes,
        _drawShapeToCanvas: shapes._drawShapeToCanvas,
        _addDrawShapeHandler: drawShape._addDrawShapeHandler,
        _removeDrawShapeHandler: drawShape._removeDrawShapeHandler,
        _addOpenFileHandler: file._addOpenFileHandler,
        _removerOpenFileHandler: file._removerOpenFileHandler,
        _addSaveHandler: file._addSaveHandler,
        _removerSaveHandler: file._removerSaveHandler,

        // 初始化
        init: init
    });
    return Drawing
})