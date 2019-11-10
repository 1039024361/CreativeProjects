define(['RichBase', 'colorEVENTS', 'EventUtil'], function (RichBase, colorEVENTS, EventUtil) {
    //颜色选择
    var Color = RichBase.extend({
        //在这里注册所有事件，使用观察者模式
        EVENTS: colorEVENTS,
        _arrangeNewColorArray: function(array, newColor){
            var index = array.indexOf(newColor);

            if(index < 0){
                if(array.length >= 10){
                    array.shift();
                }
            }
            else{
                array.splice(index, 1);

            }
            array.push(newColor);
        },
        _renderNewColorBoxes: function(boxes, array){
            var i = null,
                len = array.length;
            for(i = 0; i<len; i++){
                boxes[i+20].classList.add("line-highlight");
                boxes[i+20].firstElementChild.style.backgroundColor = array[i];
            }
        },
        //editColor
        _editColor: function(){
            var event = new MouseEvent('click');
            // 触发a的单击事件
            this.colorInput.dispatchEvent(event);
        },
        _addEditColorHandler: function(){
            this.addHandler(this.editColor, "click", this._editColor);
        },
        _removerEditColorHandler: function(){
            this.addHandler(this.editColor, "click", this._editColor);
        },

        //事件绑定及节流处理
        init: function (config) {
            this._super(config);
            this.colorSetButtons = document.querySelectorAll(".color-1");
            this.colorBoxContainer = document.getElementsByClassName("color-box-container")[0];
            this.colorBoxes = document.querySelectorAll(".color-box-wrap");
            this.fontColor = document.getElementsByClassName("font-color")[0];
            this.backgroundColor = document.getElementsByClassName("background-color")[0];
            this.colorInput = document.querySelector("#colorInput");
            //颜色选择按键
            this.editColor = document.querySelector("#editColor");
            this.newColor = [];
            this.createHandlers(this.colorSetButtons[0], this.EVENTS["colorSetButtons[0]"]);               //加入到观察者
            this.createHandlers(this.colorSetButtons[1], this.EVENTS["colorSetButtons[1]"]);               //加入到观察者
            this.createHandlers(this.colorBoxContainer, this.EVENTS["colorBoxContainer"]);
            this.createHandlers(this.colorInput, this.EVENTS["colorInput"]);
            this.createHandlers(this.editColor, this.EVENTS["editColor"]);    //加入到观察者
            //初始化
            this.bind();
            this._addEditColorHandler();
        },
        bind: function(){
            var self = this;
            EventUtil.addHandler(this.editColor, "click", function (event) {
                self.fire(self.editColor, "click", event);
            });
            EventUtil.addHandler(this.colorSetButtons[0], "click", function (event) {
                self.fire(self.colorSetButtons[0], "click", event);
            });
            EventUtil.addHandler(this.colorSetButtons[1], "click", function (event) {
                self.fire(self.colorSetButtons[1], "click", event);   //与click事件处理函数一直
            });
            EventUtil.addHandler(this.colorBoxContainer, "click", function (event) {
                self.fire(self.colorBoxContainer, "click", event);   //与click事件处理函数一直
            });
            EventUtil.addHandler(this.colorInput, "change", function (event) {
                self.fire(self.colorInput, "change", event);   //与click事件处理函数一直
            });
        },
    });
    return Color
})