/**
 * Created by XING on 2018/5/10.
 */
require.config({
    baseUrl: './',
    waitSeconds: 20000,
    paths: {
        client: './utils/Client',
        EventUtil: './utils/EventUtil',
        Observer: './utils/Observer',
        Class: './utils/ClassFactory',
        tools: './utils/tools',
        base: './utils/Base',
        common: './utils/common',
        shapes: './modules/Shapes',
        drawingInfo: './modules/DrawingInfo',
        RichBase: './modules/RichBase',
        transform: './modules/Transform',
        toolMenu: './modules/toolMenu',
        EVENTS: './modules/EventHandlers/EVENT',
        stretchEVENTS: './modules/EventHandlers/stretchEVENT',
        colorEVENTS: './modules/EventHandlers/colorEVENT',
        canvasBox: './modules/EventHandlers/canvasBox',
        canvasWrap: './modules/EventHandlers/canvasWrap',
        adjustCanvas: './modules/EventHandlers/adjustCanvas',
        rotateDrop: './modules/EventHandlers/rotateDrop',
        tool: './modules/EventHandlers/tool',
        wrapDiv: './modules/EventHandlers/wrapDiv',
        target: './modules/EventHandlers/target',
        body: './modules/EventHandlers/body',
        drawLine: './modules/tools/drawLine',
        straw: './modules/tools/straw',
        fill: './modules/tools/fill',
        moveStretch: './modules/tools/moveStretch',
        virtualBox: './modules/tools/virtualBox',
        fillText: './modules/tools/fillText',
        magnify: './modules/tools/magnify',
        pasteImage: './modules/tools/pasteImage',
        paste: './modules/tools/paste',
        drawImage: './modules/tools/drawImage',
        drawShape: './modules/tools/drawShape',
        moreShape: './modules/tools/moreShape',
        file: './modules/tools/file',
        init: './modules/drawConfig/init',
        initStretch: './modules/stretchConfig/init',
        Drawing: './modules/drawConfig/index',
        Stretch: './modules/stretchConfig/index',
        Line: './modules/lineConfig/index',
        Color: './modules/colorConfig/index'
    }
});

var debug = 0;

require(['Drawing', 'client','drawingInfo', 'Stretch', 'Line', 'Color'], function (Drawing, client, drawingInfo, Stretch, Line, Color) {
    try {
        new Drawing({
            X: null,  //绘图区域X坐标
            Y: null,   //绘图区域Y坐标
            startX: null,  //mousedown坐标
            startY: null,
            diffX: null,
            diffY: null,
            clicking: false,
            copyImageData: null,
        });
        //拉伸操作只有桌面设备支持，触摸设备不支持拖拽调整画布大小
        if(client.system.win||client.system.mac||client.system.x11){
            new Stretch();
        }
        new Line();
        new Color();
    } catch (err) {
        alert(err);
    }
});

