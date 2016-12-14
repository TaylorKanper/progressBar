/**
 * Created by kangpeng on 2016/12/7.
 * @author 康鹏
 * @company 天源迪科
 * @copyright all right receive by kangpeng@tydic.com
 * @version 1.0
 * @description 这是一个基于jquery/jquery EasyUI 的时间轴插件，封装了许多很有用的功能,依赖jquery1.8以上版本<br/>
 * @email tony_kanper@hotmail.com
 */
;(function ($) {
    /**
     * 全局变量
     * @type {{int: number}}
     */
    var globe = {
        int: 0,
        currentDate: '',
        currentTime: 0
    };
    /**
     * 全局方法
     * @type {{init: init, destroy: destroy, reposition: reposition, show: show, hide: hide, update: update}}
     */
    var methods = {
        init: function (options) {
            return this.each(function () {
                if (options.arrangeType == 'h') {
                    createDom($(this), options);
                    adjustDom($(this), options);
                    dragPoint($(this), options);
                    bindEvent($(this), options);
                    initData($(this), options);
                }
            })
        },
        destroy: function () {
            return this.each(function () {
                $(window).unbind('.dateTimeMove');
            })
        },
        reposition: function () {
            // ...
        },
        show: function () {
            // ...
        },
        hide: function () {

        },
        update: function (obj, options) {

        },
        getCurrentTime: function () {
            var time = {
                currentDate: globe.currentDate,
                currentTime: globe.currentTime
            };
            return time;
        },
        setCurrentTime: function (param) {
            globe.currentDate = param.currentDate;

            globe.currentTime = param.currentTime;
            var $this = $(this);
            var $pointer = $this.find("#pointer");
            var itemWidth = parseInt($this.find(".progress-scale li").eq(0).css('left')) + 1;
            var d = (param.currentHour + 1) * itemWidth - $pointer.width() / 2;
            $pointer.css({
                left: d
            });
            $this.find("#dd").datebox("setValue", param.currentDate);
        }
    };


    /**
     * 生成dom
     * @param $this jquery对象
     * @param options 配置参数
     */
    function createDom($this, options) {
        $this.addClass("dateTimeMove-horizontal-container").css({
            width: options.width,
            height: options.height,
            backgroundColor: options.backgroundColor
        });
        var control = "<div class='horizontal-control-div'></div>";
        var $control = $(control).appendTo($this);

        var e = "<div id='mm' class='control-dateBox'><input id='dd'></div>";
        $(e).appendTo($control);

        $this.find("#mm #dd").datebox({value: options.initDate});

        var btn = "<div class='control-btn'><div id='play' class='horizontal-play'><i class='horizontal-play-div'></i><span>播放</span></div>" +
            "<div id='pre' class='horizontal-pre'><i></i><span>上一个</span></div>" +
            "<div id='nex' class='horizontal-nex'><i></i><span>下一个</span></div></div>";
        $(btn).appendTo($control);


        var s = "<div class='horizontal-progress-container'></div>";
        $(s).appendTo($this);

        var o = "<div id='pointer'  class='horizontal-progress-pointer'></div>";
        $(o).appendTo($this.find(".horizontal-progress-container"));

        var t = "<div class='horizontal-progress-bar'></div>";
        $(t).appendTo($this.find(".horizontal-progress-container"));


        var x = "<ul class='horizontal-progress-scale'>";
        var min = options.scaleRange[0], max = options.scaleRange[1];
        var scaleValue = (max - min) / options.scaleCount
        for (var i = 0, len = options.scaleCount; i < len; i++) {
            if (i % options.groupCount == 0) {
                x += "<li><span>" + (options.scaleRange[0] + i * scaleValue) + "</span></li>"
            } else {
                x += "<li></li>";
            }
        }
        x += "</ul>";
        $(x).appendTo($this.find(".horizontal-progress-container"));


    }

    /**
     * 根据参数调整dom位置
     * @param $this
     * @param options
     */
    function adjustDom($this, options) {
        var dateBoxWidth = $("#dd").datebox("options").panelWidth;
        var containerWidth = $this.width();
        var containerHeight = $this.height();

        $this.find("#mm").css({
            width: dateBoxWidth
        });
        $this.find(".horizontal-control-div").css({
            height: containerHeight - 10
        });
        var $barContainer = $this.find(".horizontal-progress-container").css({
            width: containerWidth - 240 - 10 * 2 - 5 * 2,   // 减去左边容器的宽度，左容器和右容器的内边距
            height: containerHeight - 20                    // 减去上下内边距
        });
        var barContainerWidth = $barContainer.width();
        $this.find(".horizontal-progress-bar").css({
            width: barContainerWidth,
            top: containerHeight / 2 - 10
        });
        var scales = $this.find(".horizontal-progress-scale").css({
            top: containerHeight / 2
        }).find("li");

        var itemWidth = parseInt(barContainerWidth / (scales.length + 1));
        // 将计算出的刻度值赋予全局
        options.scalesWidth = itemWidth;
        // 获取刻度线的边框宽度
        var borderWidth = 1;
        for (var i = 0, len = scales.length; i < len; i++) {
            if (i % 3 == 0) {
                $(scales[i]).css({left: itemWidth * (i + 1) - borderWidth, height: 20});
            }
            $(scales[i]).css({left: itemWidth * (i + 1) - borderWidth});
        }
        var $point = $this.find(".horizontal-progress-pointer");
        $point.css({
            left: options.scalesWidth - $point.width() / 2 + 10,//加上内边距的值
            top: containerHeight / 2 - 10 - 5,
            'z-index': 1
        })
    }

    /**
     * 拖拽按钮实现
     * @param $this
     * @param options
     */
    function dragPoint($this, options) {
        var $pointer = $this.find("#pointer");
        $pointer.draggable({
            cursor: 'pointer',
            axis: 'h',
            onDrag: function (e) {
                var d = e.data;
                if (d.left < options.scalesWidth - 10) {//减去滑块的宽度一半
                    d.left = options.scalesWidth - 10
                }

                if (d.left > options.scalesWidth * options.scaleCount) {
                    d.left = options.scalesWidth * options.scaleCount;
                }
                d.left = repair(d.left);
                function repair(v) {
                    var r = parseInt(v / options.scalesWidth) * options.scalesWidth;
                    if (Math.abs(v % options.scalesWidth) > 10) {
                        r += v > 0 ? options.scalesWidth : -options.scalesWidth;
                    }
                    return r;
                }
            },

            onStopDrag: function (e) {
                var d = e.data;
                var time = parseInt((d.left + $(d.target).width()) / options.scalesWidth) - 1;// 控件，处理为小时
                time = time == -1 ? 0 : time;

                var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;

                globe.currentTime = options.scaleRange[0] + time * divisionVal;
                options.hourChange();
                options.afterDrag();
            }
        });
    }

    /**
     * 给dom绑定事件
     * @param $this
     * @param options
     */
    function bindEvent($this, options) {
        $this.find("#play i").bind("click", function () {
            var $play = $this.find("#play");
            var $pointer = $this.find("#pointer");
            var $pre = $this.find("#pre");
            var $nex = $this.find("#nex");
            if ($play.find("span").text() == "播放") {
                $pre.unbind("click");
                $nex.unbind("click");
                $play.find("span").text("暂停");
                $play.find("i").toggleClass('horizontal-play-div horizontal-pause-div');
                $pointer.draggable("disable");
                var timeInt = setInterval(function () {
                    movePointAuto($this, options)
                }, options.stepTime);
                globe.int = timeInt;
            } else {
                $play.find("i").toggleClass('horizontal-pause-div horizontal-play-div');
                $play.find("span").text("播放");
                clearInterval(globe.int);
                $pointer.draggable("enable");
            }
            options.afterClickPlay(); // 插件使用者点击播放的事件
        });
        $this.find("#nex i").bind("click", function () {
            movePointRight($this, options)
        });
        $this.find("#pre i").bind("click", function () {
            movePointLeft($this, options)
        });

    }

    /**
     * 滑块自动向右边移动
     * @param $this
     * @param options
     */
    function movePointAuto($this, options) {
        var $pointer = $this.find("#pointer");
        $pointer.stop(false, true);
        var d = parseInt($pointer.css('left')); //获取滑块距离左边的距离
        if (d >= options.scaleCount * options.scalesWidth - $pointer.width()) {
            $pointer.css({left: options.scalesWidth});
            d = parseInt($pointer.css('left'));
            var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
            // console.log("d:" + d + "     option.scalesWidth:" + options.scalesWidth + "        d / options.scalesWidth:" + d / options.scalesWidth);
            var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
            globe.currentTime = options.scaleRange[0] + time * divisionVal;
            options.hourChange();
        } else {
            $pointer.animate({left: d + options.scalesWidth}, options.animateTime, function () {
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                // console.log("d:" + d + "     option.scalesWidth:" + options.scalesWidth + "        d / options.scalesWidth:" + d / options.scalesWidth);
                var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
                globe.currentTime = options.scaleRange[0] + time * divisionVal;
                options.hourChange();
            });
        }
    }

    /**
     * 滑块向左移动
     * @param $this
     * @param options
     */
    function movePointLeft($this, options) {
        var $pointer = $this.find("#pointer");
        $pointer.stop(false, true);
        var d = parseInt($pointer.css('left'));
        if (d <= options.scalesWidth) {
            $pointer.css({left: options.scaleCount * options.scalesWidth});
            d = parseInt($pointer.css('left'));
            var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
            var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
            globe.currentTime = options.scaleRange[0] + time * divisionVal;
            options.hourChange();
        } else {
            $pointer.animate({left: d - options.scalesWidth}, options.animateTime, function () {
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
                globe.currentTime = options.scaleRange[0] + time * divisionVal;
                options.hourChange();
            });
        }


    }

    /**
     * 滑块向右移动
     * @param $this
     * @param options
     */
    function movePointRight($this, options) {
        var $pointer = $this.find("#pointer");
        $pointer.stop(false, true);
        var d = parseInt($pointer.css('left'));
        if (d >= options.scaleCount * options.scalesWidth - $pointer.width()) {
            $pointer.css({left: options.scalesWidth});
            d = parseInt($pointer.css('left'));
            var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
            var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
            globe.currentTime = options.scaleRange[0] + time * divisionVal;
            options.hourChange();
        } else {
            $pointer.animate({left: d + options.scalesWidth}, options.animateTime, function () {
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
                globe.currentTime = options.scaleRange[0] + time * divisionVal;
                options.hourChange();
            });
        }

    }

    /**
     * 初始化数据
     * @param $this
     * @param lastOptions
     */
    function initData($this, options) {
        globe.currentDate = options.initDate;
        var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
        globe.currentTime = options.initTime;
        $($this.find("#dd")).datebox({
            value: options.initDate
        }).datebox({
            onSelect: function () {
                globe.currentDate = $(this).datebox("getValue");
                options.dateChange();
            }
        });
        var $pointer = $this.find("#pointer");
        var d = ((options.initTime - options.scaleRange[0]) / divisionVal + 1) * options.scalesWidth; // 初始化距离左边的距离

        if (options.initTime < options.scaleRange[0] || options.initTime > options.scaleRange[1] - 1) {
            $.error("你的初始化时间必须在约定范围" + options.scaleRange + "内");
        }
        $pointer.css({
            left: d
        })
    }


    $.fn.dateTimeMove = function (options) {

        var defaults = {
            width: 1300,                           // 容器宽度
            height: 100,                           // 容器高度
            arrangeType: 'h',                      // 容器排列方式 h:水平;v:垂直
            backgroundColor: '#1A5C90',            // 容器背景颜色
            scaleCount: 24,                        // 刻度个数,例如是一天中的24小时，就写24;每5分钟一个刻度，就写12
            groupCount: 3,                         // 刻度组，及3个刻度一个长刻度
            scaleRange: [0, 24],                   // 刻度范围,不包括后面的那个刻度，例如[9,22]，仅代表9~21点的数据
            initDate: '2016-12-05',                // 初始化时间
            initTime: 5,                          // 初始化小时
            stepTime: 1000,                        // 播放的间隔时间
            animateTime: 'slow',                   // 动画长短，支持毫秒和字符串
            afterDrag: function () {
            },                                     // 在拖拽结束后执行的事件
            afterClickPlay: function () {
            },                                     // 在点击播放时执行的事件
            dateChange: function () {
            },                                     // 选择日期事件
            hourChange: function () {
            }                                      // 小时改变事件


        };

        var lastOptions = $.extend({}, defaults, options);

        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            return methods.init.apply(this, [lastOptions]);
        } else {
            $.error('Method ' + options + ' does not exist on jQuery.dateTimeMove');
        }


    };

})(jQuery);
