define(['drawingInfo', 'tools', 'EventUtil'], function (drawingInfo, tools, EventUtil) {
    //判断是否存在剪贴板数据，并将剪贴板图片粘贴值img标签
    var _clipboardDataHandle = function(clipboardData){
        var i = 0,
            items, item, types;
        if(clipboardData){
            items = clipboardData.items;

            if(!items){
                return false;
            }

            item = items[0];
            types = clipboardData.types || [];

            for( ; i < types.length; i++ ){
                if( types[i] === 'Files' ){
                    item = items[i];
                    break;
                }
            }

            if( item && item.kind === 'file' && item.type.match(/^image\//i) ){
                tools._imgReader.call(this, item);
                return true;
            }
            return false;
        }
    }
    var _imgPasteHandler = function(event){
        event = EventUtil.getEvent(event);
        var clipboardData = event.clipboardData,
            canvasW = drawingInfo.get("canvasW"),
            canvasH = drawingInfo.get("canvasH");

        this._showSelectObj(true);
        drawingInfo.set("behavior", "paste")
        if(_clipboardDataHandle.call(this, clipboardData)){
        }
        else{
            if(this.get("copyImageData") === null){
                return null;
            }
            if(this.elementWrap.style.display === "inline-block"){

            }

            var imageWidth = this.get("copyImageData").width,
                imageHeight = this.get("copyImageData").height;
            canvasW = (canvasW>imageWidth)? canvasW: imageWidth;
            canvasH = (canvasH>imageHeight)? canvasH: imageHeight;
            // this._showSelectObj(true);
            this._appendStyle(this.elementWrap, {
                top: "-1px",
                left: "-1px",
            });
            this._appendStyle(this.editCanvasBox, {
                top: "0px",
                left: "0px",
            });
            this._resizeCanvasBox(this.canvasBox, canvasW, canvasH);
            this._resizeCanvasBox(this.editCanvasBox, imageWidth, imageHeight);
            this.editContext.putImageData(this.get("copyImageData").imageData, 0 , 0);
        }
        this._handle(this._addDrawImageHandler, this._removeDrawImageHandler);
    }
    var _copyPasteHandler = function(event){
        if(drawingInfo.get("description") === "paste"){
            _imgPasteHandler.call(this, event);
        }
    }
    return {
        //添加粘贴事件
        _addImgPasteHandler: function(){
            this.addHandler(document, "paste", _imgPasteHandler);
        },
        //移除粘贴事件
        _removeImgPasteHandler: function(){
            this.removeHandler(document, "paste", _imgPasteHandler);
        },
        _addCopyPasteHandler: function(){
            this.addHandler(document, "copy", _copyPasteHandler);
        },
        _removeCopyPasteHandler: function(){
            this.removeHandler(document, "copy", _copyPasteHandler);
        },
    }
})