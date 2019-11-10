define(['drawingInfo'], function (drawingInfo) {
    //点击复制按键事件，这个事件直接会通过document.execCommand触发，主要是为了在复制事件中清空系统剪贴板
    var _pasteButtonHandler = function(event){
        try{
            drawingInfo.set("description", "paste");
            document.execCommand('copy');   //因为chrome无法执行paste指令，故通过copy事件，以便js程序访问剪贴板
        }
        catch(err){
            console.log("不支持document.execCommand方法，无法复制,可通过Ctrl+V粘贴");
        }
        // this._imgPasteHandler();
    }
    return {
        _addPasteButtonHandler: function(){
            this.addHandler(this.paste, "click", _pasteButtonHandler);
        },
        _removePasteButtonHandler: function(){
            this.removeHandler(this.paste, "click", _pasteButtonHandler);
        }
    }
})