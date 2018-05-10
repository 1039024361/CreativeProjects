/**
 * Created by XING on 2018/5/10.
 */
var canvasBox = document.getElementById("canvasBox");
// var createImg = document.getElementById("createImg");
var drawFlag = 0;   //表明是否按下鼠标左键

if(canvasBox.getContext){
    var context = canvasBox.getContext("2d");
}

function draw(x, y){
    context.lineTo(x,y);
    context.stroke();
}

//        EventUtil.addHandler(canvasBox, "mousemove", function(event){
//            console.log(`pageX: ${event.pageX} pageY: ${event.pageY}`);
//            event = EventUtil.getEvent(event);
//            draw(event.pageX, event.pageY);
//        });
//
//        EventUtil.addHandler(canvasBox, "mousedown", function(event){
//            context.beginPath();
//        });

function XConvert(X){
    return X -= 7;
}

function YConvert(Y){
    return Y -= 146;
}

EventUtil.addHandler(canvasBox, "mousedown", function(event){
    console.log(`down`);
    console.log(`clientX: ${XConvert(event.clientX)} clientY: ${YConvert(event.clientY)}`);
    drawFlag = 1;

    context.beginPath();
    context.moveTo(XConvert(event.clientX), YConvert(event.clientY));
});

EventUtil.addHandler(canvasBox, "mousemove", function(event){
    console.log(`button: ${EventUtil.getButton(event)}`);
    if(drawFlag === 1){
        // console.log(`clientX: ${XConvert(event.clientX)} clientY: ${YConvert(event.clientY)}`);
        event = EventUtil.getEvent(event);
        draw(XConvert(event.clientX), YConvert(event.clientY));
    }
});

EventUtil.addHandler(canvasBox, "mouseup", function(event){
    console.log(`down`);
    drawFlag = 0;
});

//添加对触摸事件的支持
EventUtil.addHandler(canvasBox, "touchstart", function(event){
    event = EventUtil.getEvent(event);
    console.log(`clientX: ${XConvert(event.touches[0].clientX)} clientY: ${YConvert(event.touches[0].clientY)}`);
    //drawFlag = 1;

    context.beginPath();
    context.moveTo(XConvert(event.touches[0].clientX), YConvert(event.touches[0].clientY));
});

EventUtil.addHandler(canvasBox, "touchmove", function(event){
    //if(drawFlag == 1){
    event = EventUtil.getEvent(event);
    event.preventDefault();   //阻止滚动
    console.log(`clientX: ${XConvert(event.changedTouches[0].clientX)} clientY: ${YConvert(event.changedTouches[0].clientY)}`);
    draw(XConvert(event.changedTouches[0].clientX), YConvert(event.changedTouches[0].clientY));
    //}
});