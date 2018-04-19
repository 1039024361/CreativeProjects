EventUtil.addHandler(document.forms[0], "submit", function(event){
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);

    target.elements["comments"].value = richEdit.innerHTML;
});

上面function函数，不传入event对象的话，谷歌浏览器不会报错，但是火狐浏览器会报错