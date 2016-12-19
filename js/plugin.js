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
            if (typeof options.scaleRange[0] == 'string') {
                if (checkTime(options.scaleRange[0]) && checkTime(options.scaleRange[1])) {
                    formatTime(options);
                } else {
                    $.error("scaleRange[" + options.scaleRange + "],请检查你的scaleRange参数,必须是形如['09:00','10:00']格式");
                }
                if (!checkTime(options.initTime)) {
                    $.error("初始化时间:initTime:" + options.initTime + ",必须和scaleRange格式一致");
                }
                var init = getTimeFromZeroMenute(options.initTime);
                var begin = getTimeFromZeroMenute(options.scaleRange[0]);
                var end = getTimeFromZeroMenute(options.scaleRange[1]);
                if (end <= begin) {
                    $.error("你的初始化时间范围[" + options.scaleRange + "]有误");
                }
                if (init >= end || init < begin) {
                    $.error("你的初始化时间initTime:" + options.initTime + ",必须在约定范围[" + options.scaleRange + "]内");
                } else if (init % options.perMinute != 0) {
                    $.error("你的初始化时间initTime:" + options.initTime + ",必须满足当前分度值[" + options.perMinute + "]的要求");
                }
            } else {
                if (typeof options.initTime != 'number') {
                    $.error("当前条件下,你的初始化时间initTime:" + options.initTime + ",必须是数字");
                } else if (options.initTime < options.scaleRange[0] || options.initTime > options.scaleRange[1] - 1) {
                    $.error("你的初始化时间initTime:" + options.initTime + ",必须在约定范围[" + options.scaleRange + "]内");
                }
                options.timeType = "number";
                options.stopTime = options.scaleRange[1];
                options.perValue = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
            }

            return this.each(function () {
                var $this = $(this);
                var data = $this.data('dateTimeMove');
                if (!data) {
                    // 将options缓存到dom中,方便之后修改
                    $this.data('dateTimeMove', options);
                }
                if (options.arrangeType == 'h') {//水平排列
                    createDom($this, options);
                    adjustDom($this, options);
                    dragPoint($this, options);
                    bindEvent($this, options);
                    initData($this, options);
                }
            })
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this);
                $(window).unbind('.dateTimeMove');
                $this.html('');
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
        update: function (x) {
            console.log(this);
            console.log(x);
        },
        getCurrentTime: function () {
            var time = {
                currentDate: globe.currentDate,
                currentTime: globe.currentTime
            };
            return time;
        },
        setStopTime: function (obj) {
            var $this = $(this);

            var options = $this.data('dateTimeMove');
            if (options.timeType == 'xx:xx') {
                if (!checkTime(obj.stopTime)) {
                    $.error("你的停止时间[" + obj.stopTime + "],必须为有效的时间格式xx:xx");
                }
                var stop = getTimeFromZeroMenute(obj.stopTime);
                var begin = getTimeFromZeroMenute(options.scaleRange[0]);
                var end = getTimeFromZeroMenute(options.scaleRange[1]);
                if (stop > end || stop < begin) {
                    $.error("你的动画结束时间stopTime:" + obj.stopTime + ",必须在约定范围[" + options.scaleRange + "]内");
                } else if (stop % options.perMinute != 0) {
                    $.error("你的动画结束时间stopTime:" + obj.stopTime + ",必须满足当前分度值[" + options.perMinute + "]的要求");
                }
            } else if (typeof obj.stopTime != 'number') {
                $.error("你的动画结束时间stopTime:" + obj.stopTime + ",当前只能为数字");
            } else if (obj.stopTime < options.scaleRange[0] || obj.stopTime > options.scaleRange[1] - 1) {
                $.error("你的动画结束时间stopTime:" + obj.stopTime + ",必须在约定范围[" + options.scaleRange + "]内");
            }
            reSetEvent($this, options, obj);
        }
    };

    /**
     * 重新为dom绑定事件
     */
    function reSetEvent($this, options, obj) {
        // TODO 重新为dom绑定事件
        $this.find("#play i").unbind("click");
        $this.find("#nex i").unbind("click");
        $this.find("#pre i").unbind("click");
        options.stopTime = obj.stopTime;
        dragPoint($this, options);
        bindEvent($this, options);
    }

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
            if (i % options.groupCount == 0 && options.timeType == "number") {
                x += "<li><span>" + (options.scaleRange[0] + i * scaleValue) + "</span></li>"
            } else if (i % options.groupCount == 0 && options.timeType == "xx:xx") {
                x += "<li><span>" + getTimeSpan(options, i) + "</span></li>";
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
            if (i % options.groupCount == 0) {
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
                var dis = options.scalesWidth * options.scaleCount;

                if (options.timeType == 'xx:xx') {
                    var star = getTimeFromZeroMenute(options.scaleRange[0]);
                    var stop = getTimeFromZeroMenute(options.stopTime);
                    var s = (stop - star) / options.perMinute;
                    dis = s * options.scalesWidth;
                } else if (options.timeType == 'number') {
                    var s = (options.stopTime - options.scaleRange[0]) / options.perValue;
                    dis = s * options.scalesWidth;
                }

                if (d.left > dis) {
                    d.left = dis;
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
                if (options.timeType == 'xx:xx') {
                    // console.log(time * options.perMinute);//获取距离起始点的分钟数
                    var currentTime = getTimeFromBeginning(options.scaleRange[0], time * options.perMinute);
                    globe.currentTime = currentTime;
                } else {
                    var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
                    globe.currentTime = options.scaleRange[0] + time * divisionVal;
                }
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
        if (options.timeType == 'xx:xx') {
            var star = getTimeFromZeroMenute(options.scaleRange[0]);
            var stop = getTimeFromZeroMenute(options.stopTime);
            var s = (stop - star) / options.perMinute;
            if (d >= s * options.scalesWidth - $pointer.width()) {
                $pointer.css({left: options.scalesWidth});
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时

                // console.log(time * options.perMinute);//获取距离起始点的分钟数
                var currentTime = getTimeFromBeginning(options.scaleRange[0], time * options.perMinute);
                globe.currentTime = currentTime;

                options.hourChange();
            } else {
                $pointer.animate({left: d + options.scalesWidth}, options.animateTime, function () {
                    d = parseInt($pointer.css('left'));
                    var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                    // console.log(time * options.perMinute);//获取距离起始点的分钟数
                    var currentTime = getTimeFromBeginning(options.scaleRange[0], time * options.perMinute);
                    globe.currentTime = currentTime;
                    options.hourChange();
                });
            }
        } else if (options.timeType == 'number') {
            var s = (options.stopTime - options.scaleRange[0]) / options.perValue;
            if (d >= s * options.scalesWidth - $pointer.width()) {
                $pointer.css({left: options.scalesWidth});
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时


                globe.currentTime = options.scaleRange[0] + time * options.perValue;

                options.hourChange();
            } else {
                $pointer.animate({left: d + options.scalesWidth}, options.animateTime, function () {
                    d = parseInt($pointer.css('left'));
                    var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                    globe.currentTime = options.scaleRange[0] + time * options.perValue;
                    options.hourChange();
                });
            }
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
            if (options.timeType == 'xx:xx') {
                var left = (getTimeFromZeroMenute(options.stopTime) - getTimeFromZeroMenute(options.scaleRange[0])) / options.perMinute;
                $pointer.css({left: left * options.scalesWidth});
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                // console.log(time * options.perMinute);//获取距离起始点的分钟数
                var currentTime = getTimeFromBeginning(options.scaleRange[0], time * options.perMinute);
                globe.currentTime = currentTime;
            } else {
                var left = (options.stopTime - options.scaleRange[0]) / options.perValue;
                $pointer.css({left: left * options.scalesWidth});
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
                globe.currentTime = options.scaleRange[0] + time * divisionVal;
            }

            options.hourChange();
        } else {
            $pointer.animate({left: d - options.scalesWidth}, options.animateTime, function () {
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                if (options.timeType == 'xx:xx') {
                    // console.log(time * options.perMinute);//获取距离起始点的分钟数
                    var currentTime = getTimeFromBeginning(options.scaleRange[0], time * options.perMinute);
                    globe.currentTime = currentTime;
                } else {
                    var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;
                    globe.currentTime = options.scaleRange[0] + time * divisionVal;
                }
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
        if (options.timeType == 'xx:xx') {
            var star = getTimeFromZeroMenute(options.scaleRange[0]);
            var stop = getTimeFromZeroMenute(options.stopTime);
            var s = (stop - star) / options.perMinute;
            if (d >= s * options.scalesWidth - $pointer.width()) {
                $pointer.css({left: options.scalesWidth});
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时

                // console.log(time * options.perMinute);//获取距离起始点的分钟数
                var currentTime = getTimeFromBeginning(options.scaleRange[0], time * options.perMinute);
                globe.currentTime = currentTime;

                options.hourChange();
            } else {
                $pointer.animate({left: d + options.scalesWidth}, options.animateTime, function () {
                    d = parseInt($pointer.css('left'));
                    var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                    // console.log(time * options.perMinute);//获取距离起始点的分钟数
                    var currentTime = getTimeFromBeginning(options.scaleRange[0], time * options.perMinute);
                    globe.currentTime = currentTime;
                    options.hourChange();
                });
            }
        } else if (options.timeType == 'number') {
            var s = (options.stopTime - options.scaleRange[0]) / options.perValue;
            if (d >= s * options.scalesWidth - $pointer.width()) {
                $pointer.css({left: options.scalesWidth});
                d = parseInt($pointer.css('left'));
                var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时

                globe.currentTime = options.scaleRange[0] + time * options.perValue;
                options.hourChange();
            } else {
                $pointer.animate({left: d + options.scalesWidth}, options.animateTime, function () {
                    d = parseInt($pointer.css('left'));
                    var time = parseInt(d / options.scalesWidth) - 1;// 控件，处理为小时
                    globe.currentTime = options.scaleRange[0] + time * options.perValue;
                    options.hourChange();
                });
            }
        }
    }

    /**
     * 初始化数据
     * @param $this
     * @param lastOptions
     */
    function initData($this, options) {
        globe.currentDate = options.initDate;

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
        if (options.timeType == 'xx:xx') {
            var init = getTimeFromZeroMenute(options.initTime);
            var begin = getTimeFromZeroMenute(options.scaleRange[0]);
            var d = ((init - begin) / options.perMinute + 1) * options.scalesWidth;
            $pointer.css({
                left: d
            });
        } else {
            var divisionVal = (options.scaleRange[1] - options.scaleRange[0]) / options.scaleCount;

            var d = ((options.initTime - options.scaleRange[0]) / divisionVal + 1) * options.scalesWidth; // 初始化距离左边的距离
            $pointer.css({
                left: d
            })
        }
    }

    /**
     * 获取客户端当前时间
     */
    function getCurrentDate() {
        var date = new Date();
        var s = date.getFullYear();
        var m = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var mm = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var current = {
            year: s,
            month: m,
            date: d,
            hour: h,
            minute: mm
        }
        console.log(current);

    }

    /**
     * 格式化时间
     * @param scaleRange
     * @param scale
     */
    function formatTime(options) {
        options.stopTime = options.scaleRange[1];
        options.timeType = "xx:xx";
        var hour = [], minute = [];
        hour[0] = parseInt(options.scaleRange[0].split(':')[0]);
        minute[0] = parseInt(options.scaleRange[0].split(':')[1]);
        hour[1] = parseInt(options.scaleRange[1].split(':')[0]);
        minute[1] = parseInt(options.scaleRange[1].split(':')[1]);

        var minutes = (hour[1] * 60 + minute[1]) - (hour[0] * 60 + minute[0]);

        if (60 % (minutes / options.scaleCount) != 0) {
            $.error("请修改时间刻度,或者修改起止时间来保证本插件正确运行!");
        }
        var perMinute = minutes / options.scaleCount;//每一格刻度代表分钟数;
        options.perMinute = perMinute;
        options.hour = hour;
        options.minute = minute;

    }

    /**
     * 获取标签时间
     * @param options 配置
     * @param i 距离左侧多少格
     */
    function getTimeSpan(options, i) {
        var minute = options.perMinute * i + options.hour[0] * 60 + options.minute[0];
        var hour = parseInt(minute / 60) < 10 ? ('0' + parseInt(minute / 60)) : '' + parseInt(minute / 60);
        var minute = minute % 60 < 10 ? ('0' + minute % 60) : '' + minute % 60;
        var s = hour + ':' + minute;
        return s;
    }

    /**
     * 验证时间格式是否正确
     * @param time
     */
    function checkTime(time) {
        var result = false;
        var reg = /^([0-2][0-9]):([0-5][0-9])$/;
        if (reg.test(time)) {
            if ((parseInt(RegExp.$1) <= 24) && (parseInt(RegExp.$2) < 60)) {
                result = true;
            }
        }
        return result;
    }

    /**
     * 获取起始时间过了minute分钟之后的时间
     * @param beginTime 起始时间
     * @param minute 过了多少分钟
     */
    function getTimeFromBeginning(beginTime, minute) {
        var s, hour, m;
        hour = parseInt(beginTime.split(':')[0]);
        m = parseInt(beginTime.split(':')[1]);
        s = hour * 60 + m + minute;//获取过了minte分钟之后的分钟数
        hour = parseInt(s / 60) < 10 ? ('0' + parseInt(s / 60)) : '' + parseInt(s / 60);
        m = s % 60 < 10 ? ('0' + s % 60) : '' + s % 60;
        s = hour + ':' + m;
        return s;
    }

    /**
     * 获取某个时间距离凌晨的分钟数
     * @param time
     */
    function getTimeFromZeroMenute(time) {
        var hour = parseInt(time.split(':')[0]);
        var m = parseInt(time.split(':')[1]);
        return hour * 60 + m;
    }

    $.fn.dateTimeMove = function (options) {

        var defaults = {
            width: 1300,                                            // 容器宽度
            height: 100,                                            // 容器高度
            arrangeType: 'h',                                       // 容器排列方式 h:水平;v:垂直
            backgroundColor: '#1A5C90',                             // 容器背景颜色
            scaleCount: 24,                                         // 刻度个数,例如是一天中的24小时，就写24;每5分钟一个刻度，就写12
            groupCount: 3,                                          // 刻度组，及3个刻度一个长刻度
            scaleRange: [0, 24],                                    // 刻度范围,不包括后面的那个刻度，例如[9,22]，仅代表9~21点的数据
            initTime: 0,                                            // 初始化小时
            initDate: '2016-12-05',                                 // 初始化时间
            animateTime: 'slow',                                    // 动画长短，支持毫秒和字符串
            stepTime: 1000,                                         // 播放的间隔时间
            stopTime: 24,                                    // 滑块停止时间,undefined滑块将滑完整个容器,支持数字和字符串
            afterDrag: function () {
            },                                                      // 在拖拽结束后执行的事件
            afterClickPlay: function () {
            },                                                      // 在点击播放时执行的事件
            dateChange: function () {
            },                                                      // 选择日期事件
            hourChange: function () {
            }                                                       // 小时改变事件
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
