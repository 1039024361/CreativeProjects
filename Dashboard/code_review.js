1. //实时显示绘图区域坐标位置
// 将页面元素与方法耦合了
_displayCursorPos: function(x, y){
    (x>=0&&y>=0)? this.bottomFonts[0].textContent = `${Math.round(x)}, ${Math.round(y)}像素`: this.bottomFonts[0].textContent ="";
}
//实时显示绘图区域大小
_displaySize: function (x, y){
    (x>=0&&y>=0)? this.bottomFonts[2].textContent = `${Math.round(x)} × ${Math.round(y)}像素`: this.bottomFonts[2].textContent ="";
}
//实时显示绘图区域大小
_displaySelectSize: function (x, y){
    (x>=0&&y>=0)? this.bottomFonts[1].textContent = `${Math.round(x)} × ${Math.round(y)}像素`: this.bottomFonts[1].textContent ="";
}