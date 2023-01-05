/*
 * @Author: Jerry.deng 
 * @Date: 2018-10-11 14:20:28 
 * @Last Modified by: Alan.zheng
 * @Last Modified time: 2020-06-18 14:15:32
 */
var int = null;
var setBuop = {
    isClose: function () {
        $(".buop_sup").removeClass('slideOutLeft');
        int = window.setInterval(this.close, 5000);
    },
    close: function () {
        $(".buop_sup").addClass('slideOutLeft');
        int = window.clearInterval(int);
    }
};
$(function () {
    var $position = $('#navigation li .active').text();
    if ($('#intergratorsName').length > 0) {
       $position = '企业站详情页-' + $('#intergratorsName').text();
    }
    var validator = $("#releaseAdd").validate({
        debug: true,
        wrapper: "i",
        rules: {
            code: {
                minlength: 4,
                number: true
            },
            phone: {
                mobile: true
            }
        },
        messages: {
            description: {
                required: "项目需求不能为空！"
            },
            code: {
                required: "验证码不能为空！",
                minlength: "请输入正确的验证码！"
            },
            phone: {
                required: "手机号不能为空！",
                mobile: "请输入正确的手机号"
            }
        },
        invalidHandler: function (form, validator) { //不通过回调 
            var obj = validator.errorMap;
            //提示层
            layer.msg(obj[Object.keys(obj)[0]]);
            return false;
        },
        submitHandler: function (form) {
            var formname = $(form).attr('data-formname');
            var serializeUrl = $("#releaseAdd").serialize(); //直接获取form表单中name值 转成JSON数组
            $.ajax({
                url: "/buop/publish", //处理页面的路径
                data: serializeUrl, //要提交的数据是一个JSON
                type: "POST", //提交方式
                dataType: "json", //返回数据的类型
                //TEXT字符串 JSON返回JSON XML返回XML
                success: function (data) { //回调函数 ,成功时返回的数据存在形参data里
                    if (data.err == 0) {
                        var $div = '<div class="layer_alert"><div class="layer_alert_top"><p><i class="iconfont icon-zhengque"></i></p><p class="f-24">恭喜，提交成功</p></div><div class="layer_alert_bottom">请等待客户顾问与您取得联系 </div> <i class="iconfont layui-layer-close icon-cuo"></i> </div>'
                        layer.open({
                            title: 0,
                            area: ['380px', 'auto'],
                            type: 1,
                            skin: 'layui-layer-demo', //样式类名
                            closeBtn: 0, //不显示关闭按钮
                            anim: 2,
                            content: $div,
                            success: function (layero, index) {
                                // 诸葛IO事件统计
                               /* zhuge.track(formname + '-发布成功', {
                                    '所在页面': $position
                                });*/
                                window._hmt && window._hmt.push(['_trackEvent', '访问发布商机页', 'click', '发布成功']);
                            },
                            end: function () {
                                $(form)[0].reset();
                            }
                        });

                    } else {
                        layer.msg(data.msg);
                      /*  zhuge.track(formname +'-发布失败', {
                            '原因': data.msg,
                            '所在页面': $position
                        });*/
                        window._hmt && window._hmt.push(['_trackEvent', '访问发布商机页', 'click', '发布失败']);

                    }
                }
            });
        }
    });
    
    // 底部悬浮JS
    var $buop_sup = $(".buop_sup");
    
    setTimeout(function () {
        $buop_sup.css('opacity', 1);
        $('.issue_item').fadeIn();
    }, 1000);
    $('.buop_sup .dd_close, .issue_item').on('click', function (e) {
        var $event = '点击打开';
        if ($(this).hasClass('issue_item')) {
            $buop_sup.removeClass('slideOutLeft').addClass('slideInLeft');
            $(".issue_item").fadeOut();
        }else {
            $buop_sup.removeClass('slideInLeft').addClass('slideOutLeft');
            $(".issue_item").fadeIn();
            $event = '点击关闭';
            int = window.clearInterval(int);
        }
        // 诸葛IO事件统计
        /*zhuge.track('项目快捷发布-' + $event, {
            '所在页面': $position
        });*/
    });
    $('.buop_sup .tableText').on('click', function () {
        var phone = $('#ddIphone').val();
        if (ST.myreg.test(phone)) {
            $(this).msgAuthCode({
                'mobile': phone, //手机号
                'count': 60, //倒计时总秒数,默认60秒
            }).then(function (data) {
                if (data.code != 0) {
                    layer.msg(data.msg);
                }
            }, function (err) {
                layer.msg(err.msg);
            });
        } else {
            layer.msg('请输入正确的手机号');
        }
    });
    $('.buop_sup .more').on('click', function () {
        // 诸葛IO事件统计
        zhuge.track('项目快捷发布-点击了解更多', {
            '所在页面': $position
        });
    });
    $('#buop-form-description-input').on('focus',function(){
        window.clearInterval(int);
    });
});