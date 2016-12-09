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
        currentHour: 0
    };
    /**
     * 全局方法
     * @type {{init: init, destroy: destroy, reposition: reposition, show: show, hide: hide, update: update}}
     */
    var methods = {
        init: function (options) {
            return this.each(function () {
                createDom($(this), options);
                adjustDom($(this), options);
                dragPoint($(this), options);
                bindEvent($(this), options);
                initData($(this), options);
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
            console.log(options);
        },
        getCurrentTime: function () {
            var time = {
                currentDate: globe.currentDate,
                currentHour: globe.currentHour
            };
            return time;
        },
        setCurrentTime: function (param) {
            globe.currentDate = param.currentDate;
            globe.currentHour = param.currentHour;
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
        $this.addClass("dateTimeMove-container").css({
            width: options.width,
            height: options.height,
            backgroundColor: options.backgroundColor
        });
        var btn = "<div id='play'><img src='icons/bf.png'><span>播放</span></div><div id='nex'><img src='icons/xyg.png'><span>下一个</span></div>";
        $(btn).appendTo($this);


        var e = "<div id='mm'><input id='dd'></div>";
        $(e).appendTo($this);

        var s = "<div class='progress-container'></div>";
        $(s).appendTo($this);

        var o = "<div id='pointer'  class='progress-pointer'></div>";
        $(o).appendTo($this.find(".progress-container"));

        var t = "<div class='progress-bar'></div>";
        $(t).appendTo($this.find(".progress-container"));


        var x = "<ul class='progress-scale'>";
        for (var i = 0, len = options.timeCount; i < len; i++) {
            x += "<li></li>";
        }
        x += "</ul>";
        $(x).appendTo($this.find(".progress-container"));

        var y = "<ul class='progress-time'>";
        for (var i = 0, len = options.bar.scalesHours.length; i < len; i++) {
            y += "<li></li>";
        }
        y += "</ul>";
        $(y).appendTo($this.find(".progress-container"));
        btn = "<div id='pre'><img src='icons/syg.png'><span>上一个</span></div>";
        $(btn).appendTo($this);

    }

    /**
     * 根据参数调整dom位置
     * @param $this
     * @param options
     */
    function adjustDom($this, options) {
        $this.find("#play").css({
            width: options.item.width
        }).find("span").css({
            width: options.item.width / 2
        });


        $this.find("#nex").css({
            width: options.item.width
        }).find("span").css({
            width: options.item.width / 2
        });

        $this.find("#pre").css({
            width: options.item.width
        }).find("span").css({
            width: options.item.width / 2
        });

        $this.find("#mm").css({
            width: options.dateDivWidth
        });
        $this.find(".progress-container").css({
            width: options.progressWidth,
            height: '100%'
        });
        var $bar = $this.find(".progress-bar");
        $bar.css({
            width: '100%'
        });
        var scales = $this.find(".progress-scale").find("li");
        var barWidth = $this.find(".progress-bar").width();
        var itemWidth = parseInt(barWidth / (scales.length + 1));
        // 将计算出的刻度值赋予全局
        options.bar.scales = itemWidth;
        // 获取刻度线的边框宽度
        var borderWidth = 1;
        for (var i = 0, len = scales.length; i < len; i++) {
            if (i % 3 == 0) {
                $(scales[i]).css({left: itemWidth * (i + 1) - borderWidth, height: 20});
            }
            $(scales[i]).css({left: itemWidth * (i + 1) - borderWidth});
        }

        var hours = $this.find(".progress-time").find("li");
        $(hours[0]).css({left: itemWidth - $(hours[0]).width() / 2 - 1}).html(options.bar.scalesHours[0]);
        for (var i = 1, len = hours.length; i < len; i++) {
            $(hours[i]).css({left: itemWidth * ( i * 3 + 1) - $(hours[i]).width() / 2 - 1}).html(options.bar.scalesHours[i]);
        }

        var $point = $this.find(".progress-pointer");
        $point.css({
            left: options.bar.scales - $point.width() / 2,
            top: 15,
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
                if (d.left < 0) {
                    d.left = 0
                }

                if (d.left + $(d.target).outerWidth() >= $(d.parent).width() - options.bar.scales) {
                    d.left = $(d.parent).width() - $(d.target).outerWidth() - options.bar.scales;
                }
                d.left = repair(d.left) - $(d.target).outerWidth() / 2;
                function repair(v) {
                    var r = parseInt(v / options.bar.scales) * options.bar.scales;
                    if (Math.abs(v % options.bar.scales) > 10) {
                        r += v > 0 ? options.bar.scales : -options.bar.scales;
                    }
                    return r;
                }
            },

            onStopDrag: function (e) {
                var d = e.data;
                var hour = parseInt((d.left + $(d.target).width()) / options.bar.scales) - 1;// 控件，处理为小时
                hour = hour == -1 ? 0 : hour;
                $("#time span").html(hour);
                globe.currentHour = hour;
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
        $this.find("#play img").bind("click", function () {
            var $play = $this.find("#play");
            var $pointer = $this.find("#pointer");
            var $container = $this.find(".progress-container");
            var $pre = $this.find("#pre");
            var $nex = $this.find("#nex");
            if ($play.find("span").text() == "播放") {
                // 当滑块超过右边
                if (parseInt($pointer.css('left')) >= $container.width() - options.bar.scales - $pointer.width() / 2) {
                    $pointer.css({left: options.bar.scales - $pointer.width() / 2});
                }
                $pre.unbind("click");
                $nex.unbind("click");
                $play.find("span").text("暂停");
                $play.find("img").attr("src", "icons/zt.png");
                $pointer.draggable("disable");

                var timeInt = setInterval(function () {
                    movePointAuto($this, options)
                }, options.stepTime);
                globe.int = timeInt;
            } else {
                $play.find("img").attr("src", "icons/bf.png");
                $play.find("span").text("播放");
                clearInterval(globe.int);
                $pointer.draggable("enable");
            }
            options.afterClickPlay(); // 插件使用者点击播放的事件
        });
        $this.find("#nex img").bind("click", function () {
            movePointRight($this, options)
        });
        $this.find("#pre img").bind("click", function () {
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
        if (d >= 24 * options.bar.scales - $pointer.width()) {
            $pointer.css({left: -$pointer.width() / 2});
        } else {
            $pointer.animate({left: d + options.bar.scales}, options.animateTime, function () {
                d = parseInt($pointer.css('left'));
                var hour = parseInt((d + $pointer.width()) / options.bar.scales) - 1;// 控件，处理为小时
                hour = hour == -1 ? 0 : hour;
                $("#time span").html(hour);
                globe.currentDate = hour;
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
        var d = parseInt($pointer.css('left'));
        $pointer.stop(false, true);

        if (d <= options.bar.scales - $pointer.width() / 2) {
            return false;
        } else {
            $pointer.animate({left: d - options.bar.scales}, options.animateTime, function () {
                d = parseInt($pointer.css('left'));
                var hour = parseInt((d + $pointer.width()) / options.bar.scales) - 1;// 控件，处理为小时
                hour = hour == -1 ? 0 : hour;
                $("#time span").html(hour);
                globe.currentDate = hour;
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
        var $container = $this.find(".progress-container");
        $pointer.stop(false, true);
        var d = parseInt($pointer.css('left'));

        if (d >= $container.width() - options.bar.scales - $pointer.width() / 2) {
            return false;
        } else {
            $pointer.animate({left: d + options.bar.scales}, options.animateTime, function () {
                d = parseInt($pointer.css('left'));
                var hour = parseInt((d + $pointer.width()) / options.bar.scales) - 1;// 控件，处理为小时
                hour = hour == -1 ? 0 : hour;
                $("#time span").html(hour);
                globe.currentDate = hour;
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
        globe.currentHour = options.initHour;
        $("#time label").html(options.initDate);
        $("#time span").html(options.initHour);
        $($this.find("#dd")).datebox({
            value: options.initDate
        }).datebox({
            onSelect: function () {
                globe.currentDate = $(this).datebox("getValue");
                $("#time label").html($(this).datebox("getValue"));
                options.dateChange();
            }
        });
        var $pointer = $this.find("#pointer");
        var d = (options.initHour + 1) * options.bar.scales - $pointer.width() / 2; // 初始化距离左边的距离
        $pointer.css({
            left: d
        })
    }


    $.fn.dateTimeMove = function (options) {

        var defaults = {
            width: 1200,                           // 容器宽度
            height: 'auto',                        // 容器高度
            backgroundColor: '#1A5C90',            // 容器背景颜色
            timeCount: 24,                         // 时间显示个数
            initDate: '2016-12-05',                // 初始化时间
            initHour: 3,                           // 初始化小时
            dateDivWidth: 200,                     // 日期控件div宽度
            item: {
                width: 80,                         // 按钮控件的宽度
                height: 80                         // 按钮控件的高度
            },
            progressWidth: 750,                    // 进度条宽度
            bar: {
                scales: 30,                        // 刻度值长度
                scalesHours: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],             //控件下面的字
                scalesHourLeft: 90                 // 控件下面的字的间距
            },
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
