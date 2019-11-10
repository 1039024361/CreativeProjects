define(['canvasBox', 'canvasWrap', 'adjustCanvas', 'rotateDrop', 'tool', 'wrapDiv',], function (canvasBox, canvasWrap, adjustCanvas, rotateDrop, tool, wrapDiv,) {
    return {
        canvasBox: canvasBox, // canvas画布对应的事件处理方法
        canvasWrap: canvasWrap,
        adjustCanvas: adjustCanvas, // 调整画布大小
        rotateDrop: rotateDrop, // 旋转
        tool: tool.selectTool, // 工具栏
        magnifierWrap: {},
        elementWrap: {},
        remove: {},
        pasteInput: {},
        selectButton: tool.selectButton, // 工具栏
        document: {},
        copy: {}, // 复制
        cut: {}, // 剪切
        paste: {}, // 粘贴按钮
        clip: {}, // 裁剪按钮
        scroll: {}, // 形状栏箭头按钮
        wrapDiv: wrapDiv,
        redoUndo: tool.redoUndo,
        redo: {},
        undo: {},
        open: {},
        save:{},
    }
})