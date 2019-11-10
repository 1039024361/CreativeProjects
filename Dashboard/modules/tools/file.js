define(['EventUtil', 'tools'], function (EventUtil, tools) {
    //open
    var _openFile = function(){
        var event = new MouseEvent('click');
        //读取图片函数
        var pic = function(event) {
            event = EventUtil.getEvent();
            var files = EventUtil.getTarget(event).files;
            if (/image/.test(files[0].type)) {
                tools._imgReader.call(this, files[0] ,true);
            } else {
                console.log("选择的不是图片");
            }
            EventUtil.removeHandler(this.openFile, "change", pic);
            // this._resizeCanvasBox(this.canvasBox, this.editCanvasBox.width, this.editCanvasBox.height);
        }.bind(this);
        EventUtil.addHandler(this.openFile, "change", pic);
            // 触发a的单击事件
        this.openFile.dispatchEvent(event);
    }
    //保存文件
    var _saveFile = function(){
        var defaultName = new Date().getTime();
        // 使用toDataURL方法将图像转换被base64编码的URL字符串
        var url = this.canvasBox.toDataURL('image/png');
        // 生成一个a元素
        var a = document.createElement('a');
        // 创建一个单击事件
        var event = new MouseEvent('click');
        // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
        a.download = name || defaultName;
        // 将生成的URL设置为a.href属性
        a.href = url;

        // 触发a的单击事件
        a.dispatchEvent(event);
    }
    return {
        _addOpenFileHandler: function(){
            this.addHandler(this.open, "click", _openFile);
        },
        _removerOpenFileHandler: function(){
            this.addHandler(this.open, "click", _openFile);
        },
        _addSaveHandler: function(){
            this.addHandler(this.save, "click", _saveFile);
        },
        _removerSaveHandler: function(){
            this.addHandler(this.save, "click", _saveFile);
        }
    }
})