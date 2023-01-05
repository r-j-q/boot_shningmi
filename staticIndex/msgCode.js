/*
 * @Author: Alan.zheng 
 * @Date: 2018-11-13 13:12:27 
 * @Last Modified by: Alan.zheng
 * @Last Modified time: 2019-07-29 18:14:23
 * 短信验证码发送
 */
;(function ($, window, document, undefined) {
    $.fn.msgAuthCode = function (options, callback) {
        var defaults = {
            'mobile':null, //手机号
            'count': 60, //倒计时总秒数
            'sending': true, 
            'InterValObj':null, //定时任务
            'curCount': null, //当前剩余秒数
        };
        var settings = $.extend({}, defaults, options);
        var $this=this;
        var defer = $.Deferred(); // jquery Promise
        var domain_protocol =window.location.protocol;
        var hosts = window.location.host;
        //console.log(hosts);
        //timer处理函数
        var countDown = {
            SetRemainTime: function () {
                if (settings.curCount === 0) {
                    countDown.clearRemainTime();
                } else {
                    settings.curCount--;
                    $this.html(settings.curCount + "秒后重新发送");
                }
            },
            clearRemainTime: function () {
                window.clearInterval(settings.InterValObj); //停止计时器
                $this.removeAttr("disabled").html("重新发送");
                settings.sending = true;
            }
        };
        if (settings.sending) {
            settings.sending = false;
            $.ajax({
                type: "post",
                url: domain_protocol+"//"+hosts+"/comments/getCode",
                data: {
                    'mobile': settings.mobile
                },
                dataType: "json"
            }).then(function (data) {
                if (!data.code) {
                    defer.resolve(data, countDown.clearRemainTime);
                    settings.curCount = settings.count; //设置button效果，开始计时
                    settings.InterValObj = window.setInterval(countDown.SetRemainTime, 1000); //启动计时器，1秒执行一次
                    $this.attr("disabled", true);
                }else {
                    defer.reject(data);
                }
            }, function (err) {
                defer.reject(err);
            });
        }
        return defer;
    };
    
})(jQuery, window, document);