/*
* 将代码中一些模块方法提取出来
*/
define(['EventUtil'], function (EventUtil) {
    return {
        // 获取event，并阻止事件冒泡
        preventDefault: function (event) {
            event = EventUtil.getEvent(event);
            EventUtil.preventDefault(event);
            return event
        },
        // 加载图片的方法
        loadImage: function (file) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                this.image.src = reader.result;
                // console.log(this.image);
                var imageDropHandle = function() {
                    this._resizeCanvasBox(this.canvasBox, this.image.width, this.image.height);
                    this.context.drawImage(this.image, 0, 0);
                    EventUtil.removeHandler(this.image, "load", imageDropHandle);   //图片加载完成后，清除事件处理程序
                    this._saveDrawingToBuffer();
                }.bind(this);
                EventUtil.addHandler(this.image, "load", imageDropHandle);
            }.bind(this);
        },
        // 更新画布保存的X, Y坐标信息
        updateXY: function (xLabel, yLabel, xPos, yPos, scope) {
            scope.set(xLabel, xPos);
            scope.set(yLabel, yPos);
        }
    }
})