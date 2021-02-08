// 通用的方法
define(['drawingInfo', 'EventUtil'], function (drawingInfo, EventUtil) {
    //将img标签的图片数据绘制到editCanvas
    var _getImg = function(options){
        var width = options.width || 0,
            height = options.height || 0,
            image = options.image || this.image,
            target = options.target || this.editCanvasBox;
        this._resizeCanvasBox(target, width, height);
        this.editContext.clearRect(0, 0, width, height);
        this.editContext.drawImage(image, 0, 0);
    }
    //将当前区域内容绘制到选择框
    var _getImage = function(options){
        var top = options.top || 0,
            left = options.left || 0,
            width = options.width || 0,
            height = options.height || 0;

            if(width === 0 || height === 0){
                return null;
            }
        var imageData = this.context.getImageData(left, top, width, height);
        this.context.clearRect(left, top, width, height);
        this.editContext.clearRect(0, 0, width, height);
        this.editContext.putImageData(imageData, 0, 0);
    }
    //选择框
    //显示选择框
    var _displaySelectBox = function(toDisplay){
        if(toDisplay){
            this._appendStyle(this.elementWrap, {
                display: "inline-block",
                top: this.get("startY")+"px",
                left: this.get("startX")+"px",
                width: this.get("diffX")+ 2 +"px",
                "min-height": this.get("diffY")+ 2 +"px"
            });
            this._displaySelectSize(this.get("diffX")+ 2, this.get("diffY")+ 2);
            this._appendStyle(this.editCanvasBox, {
                display: "inline-block",
                top: this.get("startY")+ 1 +"px",
                left: this.get("startX")+1 + "px",
                width: this.get("diffX"),
                height: this.get("diffY")
            });
        }
        else{
            this._displaySelectSize(0, 0);
            this._appendStyle(this.elementWrap, {display: "none"});
            this._appendStyle(this.editCanvasBox, {display: "none"});
        }
    }
    //按钮样式
    var _buttonStyle = function(toHighlight){
        if(toHighlight){
            this.cut.classList.remove("unused");
            this.copy.classList.remove("unused");
            this.clip.classList.remove("unused");
        }
        else{
            this.cut.classList.add("unused");
            this.copy.classList.add("unused");
            this.clip.classList.add("unused");
        }
    }
    //处理复制事件的事件处理程序
    var _copyHandler = function(event){
        if(drawingInfo.get("description") !== "paste"){
            event = EventUtil.getEvent(event);
            event.preventDefault();
            EventUtil.setClipboardText(event, "");   //清空系统剪贴板，后续判断系统剪贴板存在图片数据的话，可知，系统剪贴板数据为最新复制
            _copy.call(this, this.editCanvasBox);
            drawingInfo.set("description", "");
        }
    }
    var _addCopyHandler = function(){
        this.addHandler(document, "copy", _copyHandler);
    }
    var _removeCopyHandler = function(){
        this.removeHandler(document, "copy", _copyHandler);
    }
    var _cut = function(target){
        _copy.call(this, target);
        this._fillImage(true);  //不填充
    }
    //点击复制按键事件，这个事件直接会通过document.execCommand触发，主要是为了在复制事件中清空系统剪贴板
    var _cutButtonHandler = function(event){
        try{
            document.execCommand('Cut');
        }
        catch(err){
            console.log("不支持document.execCommand方法，无法复制,可通过Ctrl+C复制");
        }
    }
    var _addCutButtonHandler = function(){
        this.addHandler(this.cut, "click", _cutButtonHandler);
    }
    var _removeCutButtonHandler = function(){
        this.removeHandler(this.cut, "click", _cutButtonHandler);
    }
    //处理复制事件的事件处理程序
    var _cutHandler = function(event){
        event = EventUtil.getEvent(event);
        event.preventDefault();
        EventUtil.setClipboardText(event, "");   //清空系统剪贴板，后续判断系统剪贴板存在图片数据的话，可知，系统剪贴板数据为最新复制
        _cut.call(this, this.editCanvasBox);
    }
    var _addCutHandler = function(){
        this.addHandler(document, "cut", _cutHandler);
    }
    var _removeCutHandler = function(){
        this.removeHandler(document, "cut", _cutHandler);
    }
    //复制/剪切操作
    //点击复制按键事件，这个事件直接会通过document.execCommand触发，主要是为了在复制事件中清空系统剪贴板
    var _copyButtonHandler = function(event){
        try{
            drawingInfo.set("description", "copy");
            document.execCommand('Copy');
        }
        catch(err){
            console.log("不支持document.execCommand方法，无法复制,可通过Ctrl+C复制");
        }
    }
    var _addCopyButtonHandler = function(){
        this.addHandler(this.copy, "click", _copyButtonHandler);
    }
    var _removeCopyButtonHandler = function(){
        this.removeHandler(this.copy, "click", _copyButtonHandler);
    }
    var _clip = function(target){
        if(target.style.display === "inline-block"){
            this._appendStyle(this.elementWrap, {
                top: "-1px",
                left: "-1px",
            });
            this._appendStyle(target, {
                top: "0px",
                left: "0px",
            });
            this._resizeCanvasBox(this.canvasBox, target.width, target.height);
            this._fillImage();
        }
    }
    var _clipButtonHandle = function(){
        _clip.call(this, this.editCanvasBox);
    }
    var _addClipButtonHandler = function(){
        this.addHandler(this.clip, "click", _clipButtonHandle);
    }
    var _removeClipButtonHandler = function(){
        this.removeHandler(this.clip, "click", _clipButtonHandle);
    }
    //处理事件
    var _addOrRemoveHandler = function (toAdd) {
        if(toAdd){
            _addCutHandler.call(this);
            _addCutButtonHandler.call(this);
            _addCopyHandler.call(this);
            _addCopyButtonHandler.call(this);
            this._addMoveAndStretchElementHandler();
            _addClipButtonHandler.call(this);
        }
        else{
            _removeCopyButtonHandler.call(this);
            _removeCopyHandler.call(this);
            _removeCutButtonHandler.call(this);
            _removeCutHandler.call(this);
            this._removeMoveAndStretchElementHandler();
            _removeClipButtonHandler.call(this);
        }
    }
    var _renderCanvas = function(){
        this._drawImage({
            left: parseInt(this.editCanvasBox.style.left),    //注意，后续可能将editCanvas改成绝对定位
            top: parseInt(this.editCanvasBox.style.top),
            width: this.editCanvasBox.width,
            height: this.editCanvasBox.height,
        });
        this._showSelectObj(false);
        drawingInfo.set("imageStretch", false);
        this._saveDrawingToBuffer();
    }
    //target：选取中的canvas,这个复制事件不会吧图片插入系统剪贴板，只会清空系统剪贴板，并把数据保留在本地
    var _copy = function(target){
        var context = target.getContext("2d");
        //图片加载后，执行复制操作
        var copyImageData = {};
        if(target.style.display === "inline-block"){
            copyImageData.imageData = context.getImageData(0, 0, target.width, target.height);
            copyImageData.width = target.width;
            copyImageData.height = target.height;
            this.set("copyImageData", copyImageData);
        }
    }
    return {
        _indexOf: function(array, element){
            if(array === null){
                return -1;
            }
            var i,
                len = array.length;
            for(i=0; i<len; i++){
                if(element === array[i]){
                    return i;
                }
            }
            return -1;
        },
        //字符串颜色值转换成rgba颜色值
        _hexToRgba: function(hex){
            if(/^#[0-9|A-Z|a-z]{6}$/.test(hex)){
                return {
                    R: parseInt("0x" + hex.slice(1, 3)),
                    G: parseInt("0x" + hex.slice(3, 5)),
                    B: parseInt("0x" + hex.slice(5, 7)),
                    alpha: 255
                };
            }
            else if(/^rgb/i.test(hex)){
                var regExp = /\d{1,3}/g;
                var rgbArray = hex.match(regExp);
                if(rgbArray.length === 3){
                    return {
                        R: parseInt(rgbArray[0]),
                        G: parseInt(rgbArray[1]),
                        B: parseInt(rgbArray[2]),
                        alpha: 255
                    };
                }
                else if(rgbArray.length === 4){
                    return {
                        R: parseInt(rgbArray[0]),
                        G: parseInt(rgbArray[1]),
                        B: parseInt(rgbArray[2]),
                        alpha: parseInt(rgbArray[3])
                    };
                }
            }
            else{
                return null;
            }
        },
        //返回指定点的RGB值
        _getRGB: function(imageRGBArr, index){
            if(!(typeof index === "number"&&index>=0)){
                return null;
            }
            return {
                // RGB: "#"+red+green+blue,
                R: imageRGBArr[index],
                G: imageRGBArr[index+1],
                B: imageRGBArr[index+2],
                alpha: imageRGBArr[index+3]
            };
        },
        //根据坐标返回RGB值
        _getRGBByXY: function(imageRGBArr, X, Y, scope){
            var index = null;
            if(typeof X !== "number"||typeof Y !== "number"||X<0||X>drawingInfo.get("canvasW")||Y<0||Y>drawingInfo.get("canvasH")){
                return null;
            }
            index = (X + Y * scope.canvasBox.width)*4;
            return this._getRGB(imageRGBArr, index);
        },
        //设置RGB
        _setRGB: function(imageRGBArr, index, color){
            imageRGBArr[index] = color.R;
            imageRGBArr[index+1] = color.G;
            imageRGBArr[index+2] = color.B;
            imageRGBArr[index+3] = color.alpha;
            // alpha = imageRGBArr[index+3].toString(16);
            return imageRGBArr;
        },
        //设置RGB
        _setRGBByXY: function(imageRGBArr, X, Y, color, scope){
            var index =  (X + Y * scope.canvasBox.width)*4;
            return this._setRGB(imageRGBArr, index, color);
        },
        /*
        * option：
        *    isDisplay： 是否显示， 参数为true或者false
        *    top： 绝对定位，数值类型
        *    left： 绝对定位，数值类型
        *    width：宽度，数值类型
        *    height：高度，数值类型
        * */
       _appendStyle: function (target, options){
            if(target.tagName.toLowerCase() === "canvas"){
                if(options.width != undefined){
                    target.width = parseInt(options.width);
                    delete options.width;
                }
                if(options.height != undefined){
                    target.height = parseInt(options.height);
                    delete options.height;
                }
            }
            for(var key in options){
                if(options.hasOwnProperty(key)){
                    // console.log(key);
                    target.style[key] = options[key];
                }
            }
        },
        //实现复制图片
        _imgReader: function( item , isOpenFile){
            var blob,
                reader = new FileReader();
            blob = isOpenFile? item: item.getAsFile();
            //get image src
            var getImageSrc = new Promise(function (resolve, reject){
                reader.onload = function(e){
                    resolve(e.target.result);
                    reader.onload = null;
                };
                reader.readAsDataURL(blob);
            });
            //image on load
            function loadImage (src){
                // console.log('loadimgage: ', this)
                var that = this;
                return new Promise(function (resolve, reject){
                    // console.log('123: '. that)
                    that.image.onload = function(e){
                        // console.log('this: '. that)
                        resolve();
                        // console.log('that.image.onload: ', that.image.onload)
                        that.image.onload = null;
                    };
                    that.image.src = src;
                });
            }

            getImageSrc.then(loadImage.bind(this)).then(function(){
                var canvasW = drawingInfo.get("canvasW"),
                    canvasH = drawingInfo.get("canvasH");
                canvasW = (canvasW>this.image.width)? canvasW: this.image.width;
                canvasH = (canvasH>this.image.height)? canvasH: this.image.height;
                this._resizeCanvasBox(this.canvasBox, canvasW, canvasH);
                //显示选择框
                this._showSelectObj(true);
                this._appendStyle(this.elementWrap, {
                    top: "-1px",
                    left: "-1px",
                    width: this.image.width + 2 + "px",
                    "min-height": this.image.height + 2 + "px",
                });
                this._appendStyle(this.editCanvasBox, {
                    top: "0px",
                    left: "0px",
                });
                _getImg.call(this, {    //将image图片读取到editCanvasBox
                    width: this.image.width,
                    height: this.image.height,
                });
                if(isOpenFile){
                    this._resizeCanvasBox(this.canvasBox, this.image.width, this.image.height);
                    _renderCanvas.call(this);
                }
            }.bind(this));
        },
        //将选择框中的内容绘制到当前区域
        _drawImage: function(options){
            var top = options.top || 0,
                left = options.left || 0,
                width = options.width || 0,
                height = options.height || 0;
            if(!(width&&height)){
                return null;
            }
            var imageData = this.editContext.getImageData(0, 0, width, height);
            this.context.putImageData(imageData, left, top);
            // this.editContext.clearRect(0, 0, width, height);
        },
        //notFill： 为了模拟剪切事件不填充的效果
        _fillImage: function (notFill) {
            var behavior = drawingInfo.get("behavior") 
            if(behavior === "select"||behavior === "paste"){
                if(this.elementWrap.style.display === "inline-block"){
                    if(!notFill){
                        this._drawImage({
                            left: parseInt(this.editCanvasBox.style.left),    //注意，后续可能将editCanvas改成绝对定位
                            top: parseInt(this.editCanvasBox.style.top),
                            width: this.editCanvasBox.width,
                            height: this.editCanvasBox.height,
                        });
                    }
                    this._showSelectObj(false);

                    drawingInfo.set("imageStretch", false);
                    drawingInfo.set("description", "");
                    this._saveDrawingToBuffer();
                }
                else{
                    this._showSelectObj(true);
                    _getImage.call(this, {
                        left: parseInt(this.editCanvasBox.style.left),    //注意，后续可能将editCanvas改成绝对定位
                        top: parseInt(this.editCanvasBox.style.top),
                        width: this.editCanvasBox.width,
                        height: this.editCanvasBox.height,
                    });
                }
            }
        },
        _showSelectObj: function(toShow){
            _displaySelectBox.call(this, toShow);
            _buttonStyle.call(this, toShow);
            _addOrRemoveHandler.call(this, toShow);
        }
    }
})