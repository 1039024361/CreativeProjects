Projects created (or edited) by Xing.

1. canvas坐标与windows坐标转换的问题，在这里我简化这个换算，即直接在html元素设置canvas的width跟height，使canvas大小与实际画图区域一致（区别于通过style设置）
然后canvas的left、top都为0，故坐标不需要换算，clientX就等于canvas的X坐标，详情见下面链接文章
https://blog.csdn.net/jjx0224/article/details/70183863

2.添加对触摸事件的支持

3. 粘贴图标、字符上下两栏用弹性布局，为什么不能对齐原因：设置了width属性


Win7DrawingBoard 3.0实现功能：
1.单击最上一栏，自动隐藏菜单栏
2.工具栏铅笔工具及擦除工具
3.设置线型粗细；
4.设置前景色、背景色
5.拉拽调整画布大小
6.动态显示鼠标在画布中的位置，动态显示画布大小
7.增加拖拽图片到绘图区域功能


待解决问题：
按住鼠标快速划线的时候，线条无法滑到边缘
拖放依照图片之后，再重新拖放图片，拉伸调整canvas大小会有问题
调整canvas到比较小的程度情况下，有点问题
图片拖拽释放区域限定
***复制的图片在pencil状态下无法填充

//下面方案一次性实现图片倾斜有问题：
var imageIncline = function(){
                    var tanV = Math.tan(verticalIncline*Math.PI/180);
                    var tanH = Math.tan(horizontalIncline*Math.PI/180);
                    //下面这个顺序非常重要
                    var diffX = height*tanV;
                    var diffY0 = width*tanH;
                    width += diffX;
                    var diffY = width*tanH;
                    height += diffY;

                    var diffX1 = preHeight*tanV;
                    var diffY01 = preWidth*tanH;

                    //transform(a, b, c, d, e, f);   //a水平拉伸，b水平倾斜（与X轴正方向夹角，即对应tanH,垂直倾斜
                    this._resizeCanvasBox(this.canvasBox, width, height);
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    //倾斜
                    // this.context.setTransform(1, -tanH, -tanV, 1, diffX, diffY);    //注意，倾斜用的参数为tan值
                    this.context.scale(scaleX, scaleY);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.clearRect(0, 0, this.canvasBox.width, this.canvasBox.height);
                    this.context.transform(1, -tanH, 0, 1, diffX, 0);
                    this.context.transform(1, 0, -tanV, 1, 0, diffY0);
                    this.context.drawImage(this.image, 0, 0);
                    this.context.setTransform(1, 0, 0, 1, 0, 0); //恢复坐标
                    EventUtil.removeHandler(this.image, "load", imageIncline);
                }.bind(this);
                EventUtil.addHandler(this.image, "load", imageIncline);
                this.image.src = this.canvasBox.toDataURL("image/png");


* 注意beginPath， closePath的使用，否者stroke会重绘所以线型

