define(['drawingInfo', 'client', 'EventUtil'], function (drawingInfo, client, EventUtil) {
    //将一个字符串拆分成不大于绘图区域宽度的字数组序列
    var _splitTOArray = function (context, string, width){
        var temp = "",
            tempCopy = "",
            arr = [],
            chrs = string.split("");

        for(let a = 0; a < chrs.length; a++){
            tempCopy += chrs[a];
            if( context.measureText(tempCopy).width < width ){

            }
            else{
                arr.push(temp);
                temp = "";
            }
            temp += chrs[a];
            tempCopy = temp;
        }
        if(temp !== ""){
            arr.push(temp);
        }
        return arr;
    }

    //将字符分行，用于canvas书写字符
    var _wordBreak = function(context, string, width){
        // var regEX = /[a-zA-Z0-9]+|\s|[\u4e00-\u9fa5]|\S/g;
        var regEX = /[a-zA-Z0-9]+|\s|[\u4e00-\u9fa5][\·|\%|\!|\-|\——|\、|\:|\：|\;|\；|\"|\“|\”|\‘|\’|\'|\,|\，|\.|\。|\?|\？|\》|\>|\/]*|\S/g;
        var array = string.match(regEX),
            temp = "",
            tempCopy = "",
            rowArray = [];

        if(!string){
            return [];
        }

        for(var a = 0; a < array.length; ){
            tempCopy += array[a];
            if(context.measureText(tempCopy).width < width ){
                temp += array[a];
                a++;
            }
            else{
                if(context.measureText(array[a]).width >width){
                    var arg = [a, 1];
                    Array.prototype.push.apply(arg, _splitTOArray(context, array[a], width));  //将两数组合并
                    Array.prototype.splice.apply(array, arg);
                    // a += arg.length-2;
                }
                else{
                    rowArray.push(temp);
                    temp = "";
                }
            }
            tempCopy = temp;
            console.log(array);
        }
        if(temp !== ""){
            rowArray.push(temp);
        }
        return rowArray;
    }
    //提取富文本输入框的文本内容,将分段内容分组，以数组返回
    var _filterText = function f(target){
        var arr = [],
            i = null,
            len = null,
            nodes = null,
            tempArr = [];
        if(!target){
            return arr;
        }
        len = target.childNodes.length;
        if(len === 0){
            return arr;
        }
        nodes = target.childNodes;
        for(i = 0; i < len; i++){
            if(nodes[i].nodeType === 3){
                arr.push(nodes[i].nodeValue);
            }
            else{
                tempArr = f(nodes[i]);
                if(tempArr.length !== 0){
                    arr.push(tempArr.join(""));
                }
            }
        }
        return arr;
    }
    //将每段内容再分行
    /*
    * target: 富文本输入框
    * */
    var _breakLine = function(target, context, width){
        var arr = _filterText(target),
            i = null,
            len = arr.length,
            rowArr = [];
        for(i = 0; i < len; i++){
            rowArr = rowArr.concat(_wordBreak(context, arr[i], width));
        }
        return rowArr;
    }
    //绘制多行字符
    /*options
    *    context，
    *    string，
    *    width，
    *    height,
    *    X，
    *    Y，
    *    lineHeight,
    *    fontType,
    *    fontSize,
    *    fontWeight,
    *    color,
    *    backColor
    *    textAlign
    * */
    var _drawText = function(options){
        var context = options.context,
            input = options.input,
            width = options.width,
            x = options.X,
            y = options.Y,
            height = options.lineHeight||20,
            fontSize = options.fontSize||16,
            fontWeight = options.fontWeight||"normal",
            fontFamily = options.fontFamily||"微软雅黑",
            backColor = options.backColor||"rgba(255, 255, 255, 0)",
            color = options.color||"rgba(0, 0, 0, 1)",
            textAlign = options.color||"start";

        context.fillStyle = backColor;
        context.fillRect(x, y+4, width, height);
        context.fillStyle = color;
        context.font = fontWeight + fontSize + 'px' + fontFamily;
        context.textAlign = textAlign;
        context.textBaseline = textAlign;
        // var row = this._wordBreak(context, string, width);
        var row = _breakLine(input, context, width);
        for(var b = 0; b < row.length; b++){
            context.fillText(row[b],x,y+(b+1)*height);
        }
    }
    var _strokeText = function(){
        var width,height;
        if(drawingInfo.get("behavior") === "text"){
            if(this.elementWrap.style.display === "inline-block"){
                _drawText({
                    context: this.context,
                    input: this.inputDiv,
                    X: parseInt(this.elementWrap.style.left)+3,
                    Y: parseInt(this.elementWrap.style.top)-1,
                    color: drawingInfo.get("color"),
                    backColor: drawingInfo.get("backgroundColor"),
                    width: parseInt(this.inputDiv.style.width),
                    height: parseInt(this.inputDiv.style.height)
                });
                this._appendStyle(this.elementWrap, {
                    display: "none",
                });
                this._appendStyle(this.inputDiv, {
                    display: "none",
                });
                this.inputDiv.innerHTML = "";
                // this._removeTextInputHandler();
                this._removeMoveAndStretchElementHandler();
                this._displaySelectSize(0, 0);
                this._saveDrawingToBuffer();
            }
        }
    }
    //点击书写文本
    var _fillText = function(){
        var width,height;
        if(drawingInfo.get("behavior") === "text"){
            if(this.elementWrap.style.display === "inline-block"){
                _drawText({
                    context: this.context,
                    input: this.inputDiv,
                    X: parseInt(this.elementWrap.style.left)+3,
                    Y: parseInt(this.elementWrap.style.top)-1,
                    color: drawingInfo.get("color"),
                    backColor: drawingInfo.get("backgroundColor"),
                    width: parseInt(this.inputDiv.style.width),
                    height: parseInt(this.inputDiv.style.height)
                });
                this._appendStyle(this.elementWrap, {
                    display: "none",
                });
                this._appendStyle(this.inputDiv, {
                    display: "none",
                });
                this.inputDiv.innerHTML = "";
                // this._removeTextInputHandler();
                this._removeMoveAndStretchElementHandler();
                this._displaySelectSize(0, 0);
                this._saveDrawingToBuffer();
            }
            else{
                width = this.get("diffX")> 120? this.get("diffX"): 120;
                height = this.get("diffY")> 20? this.get("diffY"): 20;
                this._appendStyle(this.elementWrap, {
                    display: "inline-block",
                    top: this.get("startY")+"px",
                    left: this.get("startX")+"px",
                    width: width + 6 + "px",
                    "min-height": height + 6 +"px"
                });
                this._displaySelectSize(width + 6, height + 6);
                this._appendStyle(this.inputDiv, {
                    display: "inline-block",
                    color: drawingInfo.get("color"),
                    backgroundColor: drawingInfo.get("backgroundColor"),
                    width: width + "px",
                    "min-height": height + "px"
                });
                this.inputDiv.focus();
                this._addMoveAndStretchElementHandler();
                this.addHandler(this, "handlers", _strokeText);   //添加新的事件处理
                // this._handle(null, this._filterText);
            }
        }
    }
    //处理文本输入事件
    var _textInputHandler = function (event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        if(target.id === "canvasBox"||target.id === "canvasWrap"){
            _fillText.call(this);
        }
    }
    return {
        _addTextInputHandler: function(){
            //拖拽效果事件
            this._addVirtualBoxHandler();
            //在桌面系统中，通过click事件触发显示隐藏文本框
            if(client.system.win||client.system.mac||client.system.x11){
                this.addHandler(this.canvasWrap, "click", _textInputHandler);
            }
            else{
                //在移动设备中，通过touchend事件触发显示隐藏文本框
                this.addHandler(this.canvasWrap, "touchend", _textInputHandler);
            }
        },
        //删除文本事件
        _removeTextInputHandler: function(){
            this.text.classList.remove("selected");
            //拖拽效果事件
            this._removeVirtualBoxHandler();
            if(client.system.win||client.system.mac||client.system.x11){
                this.removeHandler(this.canvasWrap, "click", _textInputHandler);
            }
            else{
                //在移动设备中，通过touchend事件触发显示隐藏文本框
                this.removeHandler(this.canvasWrap, "touchend", _textInputHandler);
            }
        }
    }
})