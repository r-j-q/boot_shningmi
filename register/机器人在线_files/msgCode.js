/*
 * @Author: Alan.zheng 
 * @Date: 2018-11-13 13:12:27 
 * @Last Modified by: Alan.zheng
 * @Last Modified time: 2020-01-13 17:04:28
 * 短信验证码发送
 */
;(function ($, window, document, undefined) {
    $.fn.msgAuthCode = function (options, callback) {
        var defaults = {
            'mobile':null, //手机号
            'code_token':null,
            'count': 60, //倒计时总秒数
            'sending': true, 
            'InterValObj':null, //定时任务
            'curCount': null, //当前剩余秒数
        };
        var can = true;
        if(!can){
            return false;
        }
        var settings = $.extend({}, defaults, options);
        var $this=this;
        var defer = $.Deferred(); // jquery Promise
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
                $this.html("重新发送").removeClass('disabled');
                can =true;
                settings.sending = true;
            }
        };
        if (settings.sending) {
            settings.sending = false;
            $.ajax({
                type: "post",
                url: "/auth/getVerifyCode",
                data: {
                    'mobile': settings.mobile,
                    'code_token': settings.code_token
                },
                dataType: "json"
            }).then(function (data) {
                if (!data.err) {
                    defer.resolve(data, countDown.clearRemainTime);
                    settings.curCount = settings.count; //设置button效果，开始计时
                    settings.InterValObj = window.setInterval(countDown.SetRemainTime, 1000); //启动计时器，1秒执行一次
                    $this.addClass('disabled');
                    can = false;
                }else {
                    defer.reject(data);
                }
            }, function (err) {
                defer.reject(err);
            });
        }
        console.log(defer);
        return defer;
    };
    
})(jQuery, window, document);