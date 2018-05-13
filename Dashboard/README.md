1. canvas坐标与windows坐标转换的问题，在这里我简化这个换算，即直接在html元素设置canvas的width跟height，使canvas大小与实际画图区域一致（区别于通过style设置）
然后canvas的left、top都为0，故坐标不需要换算，clientX就等于canvas的X坐标，详情见下面链接文章
https://blog.csdn.net/jjx0224/article/details/70183863

2.添加对触摸事件的支持

3. 粘贴图标、字符上下两栏用弹性布局，为什么不能对齐原因：设置了width属性