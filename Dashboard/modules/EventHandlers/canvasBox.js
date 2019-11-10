define(['common'], function (common) {
    return {
        //drag事件用于拖放图片
        "dragenter": [common.preventDefault],
        "dragover": [common.preventDefault],
        "drop": [
            function(event){
                event = common.preventDefault(event);
                var files = event.dataTransfer.files;
                //只读取第一个图片
                if(/image/.test(files[0].type)){
                    common.loadImage.call(this, files[0])
                }
                else{
                    console.log("请传入一幅图片");
                }
            }
        ]
    }
})