// 保存画板配置基本信息
define(['Class', 'base'], function (Class, base,) {
    //组件基对象
    var Base = Class.extend(base);
    //创建一个保存配置信息的对象
    var drawingInfo = new Base({
        behavior: "pencil",
        description: "",   //描述behavior行为
        lineWeight: 1,     //线比例
        color: "#000000",
        backgroundColor: "#FFFFFF",
        canvasW: 1152,
        canvasH: 648,
        gain: 1,   //图形放大系数
        imageStretch: false,
        reDoUnDo: {
            buffer: [],
            index: -1,
        }
    });
    return drawingInfo
})