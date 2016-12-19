#时间控件
###说明
该项目依赖于jquery和jquery easyUI

首先需要引入该项目,引入脚本顺序必须为

```
<script type="text/javascript" src="../js/jquery-2.2.0.min.js"></script>
<script type="text/javascript" src="../js/jquery.easyui.min.js"></script>
<script type="text/javascript" src="../js/locale/easyui-lang-zh_CN.js"></script>
<script type="text/javascript" src="../js/plugin.js"></script>  
```
其次引入必要的CSS
```
<link rel="stylesheet" href="../css/themes/bootstrap/easyui.css">
<link rel="stylesheet" href="../css/themes/icon.css">
<link rel="stylesheet" href="../css/plugin.css">
```
前面两个为EasyUI的样式,最后一个为插件本身内部样式,里面的滑块半径不允许修改,修改会造成js出现问题,如果熟悉jquery.plugin可以修改plugin源文件进行二次开发

###用法
仅仅需要简单的一个语句即可启动:

```
<script>选择器
    $("your jquery Selector").dateTimeMove();
</script>
```
如果需要覆盖默认配置,则需要:
```
<script>
    $("your jquery Selector").dateTimeMove({
        width: 1200,                                            // 容器宽度
        height: 100,                                            // 容器高度
        arrangeType: 'h',                                       // 容器排列方式 h:水平;v:垂直
        backgroundColor: 'rgba(26, 92, 144,0.5)',               // 容器背景颜色
        scaleCount: 24,                                         // 刻度个数,例如是一天中的24小时，就写24;每5分钟一个刻度，就写12
        groupCount: 4,                                          // 刻度组，及3个刻度一个长刻度
        scaleRange: ['12:00', '24:00'],                         // 刻度范围,不包括后面的那个值，例如[9,22]，仅代表9~21点的数据,也支持字符串时间范围
        initDate: '2016-12-05',                                 // 初始化日期
        initTime: '12:00',                                      // 初始化时间
        stepTime: 1000,                                         // 播放的间隔时间
        animateTime: 'slow',                                    // 动画长短，支持毫秒和字符串
        afterDrag: function () {
        },                                                      // 在拖拽结束后执行的方法
        afterClickPlay: function () {
        },                                                      // 在点击播放时执行的方法
        dateChange: function () {
        },                                                      // 选择日期后执行方法
        hourChange: function () {

        }                                                       // 小时改变后执行方法
    });
</script>

```

###API
该容器可以在引用外层给他定义相对位置和其他的css来适应页面的开发

####property属性
| 属性           |类型                  |默认值        |示例            | 说明  |
| :--------------:|:------------------:|:-----------:|:-------------:| :-----|
| width             | number,string     | 1300        | 1200,'100%' |容器宽度
| height            | number,string     | 100         | 100,'100%'  |容器高度
| arrangeType       | string            | 'h'         | 'h','v'     |容器排列,只支持这2种
| backgroundColor   | string            | ''          | '#1A5C90','rgba(26, 92, 144,0.5)' |容器背景颜色,填入符合css规范的背景属性即可
| scaleCount        | number            | 24          | 24          |刻度线个数
| groupCount        | number            | 3           | 4           |刻度线分组数
| scaleRange        | array             | [0, 24]     | [0, 24],['00:00','24:00'] |显示的时间范围,时间不包括后者
| initDate          | string            | '1991-11-18'| '1991-11-18'|初始化日期
| initTime          | number,string     | 0           | '23:00'     |初始化时间,但是需要和scaleRange保持一致格式
| stepTime          | number            | 1000        | 1000        |两次动画间隔时间,单位为毫秒
| animateTime       | number,string     | 'slow'      | 2000        |动画播放时间,支持毫秒和特征字符串'fast','slow'
####event事件

afterDrag:在拖拽结束后执行的方法

afterClickPlay:在点击播放时执行的方法

dateChange:选择日期后执行方法

hourChange:小时改变后执行方法

####function方法

getCurrentTime:获取当前时间
```$xslt
var s = $("your jquery object").dateTimeMove("getCurrentTime");
console.log(s);
```

setStopTime:设置停止时间,包括拖拽/播放/上一个/下一个,均在时间处截止

```$xslt
$("your jquery object").dateTimeMove("setStopTime", {stopTime: '18:00'});
```