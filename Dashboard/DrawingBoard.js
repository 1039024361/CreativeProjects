/**
 * Created by XING on 2018/5/10.
 */
var canvasBox = document.getElementById("canvasBox");
var drawFlag = 0;   //表明是否按下鼠标左键

if(canvasBox.getContext){
    var context = canvasBox.getContext("2d");
}

function draw(x, y){
    context.lineTo(x,y);
    context.stroke();
}

//鼠标X坐标转换成绘图区域X坐标
function XConvert(X){
    return X -= 7;
}

//鼠标Y坐标转换成绘图区域Y坐标
function YConvert(Y){
    return Y -= 146;
}
//mousedown、mousemove、mouseup操作函数
function createMouseEvent(target, func){
    var ctrlEvent = {
        flag: false,
        startXY:[0, 0],
        endXY:[0, 0]
    };

    (function(){
        EventUtil.addHandler(target, "mousedown", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
        EventUtil.addHandler(target, "mousemove", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
        EventUtil.addHandler(target, "mouseup", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
        EventUtil.addHandler(target, "touchstart", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
        EventUtil.addHandler(target, "touchmove", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
    })();

}
//绘图函数
function drawImg(type) {
    switch(type)
    {
        case "mousedown":
            console.log(`down`);
            ctrlEvent.flag = true;
            context.beginPath();
            context.moveTo(XConvert(event.clientX), YConvert(event.clientY));
            break;
        case "mousemove":
            event.preventDefault();
            if(ctrlEvent.flag === true){
                draw(XConvert(event.clientX), YConvert(event.clientY));
            }
            break;
        case "mouseup":
            console.log(`up`);
            ctrlEvent.flag = false;
            break;
        case "touchstart":
            context.beginPath();
            context.moveTo(XConvert(event.touches[0].clientX), YConvert(event.touches[0].clientY));
            break;
        case "touchmove":
            event.preventDefault();   //阻止滚动
            draw(XConvert(event.changedTouches[0].clientX), YConvert(event.changedTouches[0].clientY));
            break;
    }
}

createMouseEvent(canvasBox, drawImg);


//定义拉伸画布四周小方框，改变画布大小
var ctrlWrapRight = document.getElementsByClassName("ctrl-wrap-right")[0];
var ctrlWrapCorner = document.getElementsByClassName("ctrl-wrap-corner")[0];
var ctrlWrapBottom = document.getElementsByClassName("ctrl-wrap-bottom")[0];
var virtualWrap = document.getElementsByClassName("virtual-wrap")[0];
var ctrlEvent = {
    flag: false,
    startXY:[0, 0],
    endXY:[0, 0]
};

//控制拉伸函数
//mousedown、mousemove、mouseup操作函数
function ctrlStretch(target, func){
    var ctrlEvent = {
        flag: false,
        startXY:[0, 0],
        endXY:[0, 0]
    };

    (function(){
        EventUtil.addHandler(target, "mousedown", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
        EventUtil.addHandler(target, "mousemove", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
        EventUtil.addHandler(target, "mouseup", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
        EventUtil.addHandler(target, "touchstart", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
        EventUtil.addHandler(target, "touchmove", function(event){
            event = EventUtil.getEvent(event);
            func(event.type);
        });
    })();

}
//绘图函数
function drawImg(type) {
    switch(type)
    {
        case "mousedown":
            console.log(`down`);
            ctrlEvent.flag = true;
            context.beginPath();
            context.moveTo(XConvert(event.clientX), YConvert(event.clientY));
            break;
        case "mousemove":
            event.preventDefault();
            if(ctrlEvent.flag === true){
                draw(XConvert(event.clientX), YConvert(event.clientY));
            }
            break;
        case "mouseup":
            console.log(`up`);
            ctrlEvent.flag = false;
            break;
        case "touchstart":
            context.beginPath();
            context.moveTo(XConvert(event.touches[0].clientX), YConvert(event.touches[0].clientY));
            break;
        case "touchmove":
            event.preventDefault();   //阻止滚动
            draw(XConvert(event.changedTouches[0].clientX), YConvert(event.changedTouches[0].clientY));
            break;
    }
}

createMouseEvent(canvasBox, drawImg);
