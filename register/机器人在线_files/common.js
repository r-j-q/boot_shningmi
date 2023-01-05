/**
 * Created by fred on 7/26/16.
 */
var ST = {
    myreg: /^1[3|4|5|6|7|8|9]\d{9}$/,
    request: function(act, data, fb, disableTip) {
        $.ajax({
            type: "POST",
            url: act,
            dataType: "json", //表示返回值类型，不必须
            data: data,
            beforeSend: function() {
                //ajax loading  
                if (!disableTip) {
                    ajxaLayerLoad = layer.load(0, {
                        time: 20 * 1000
                    });
                }
            },
            success: function(data) {
                if (!disableTip) {
                    layer.close(ajxaLayerLoad);
                }
                if (!data['err']) {
                    fb(0, data);
                } else {
                    fb(data['err'], data);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                fb(-1, errorThrown);
            }
        });
    },
    getCookie: function(name) {
        var getArr, getReg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (getArr = document.cookie.match(getReg)) {
            var getValue = unescape(getArr[2])
            return getValue;
        } else {
            return false;
        }
    }
};

function dologin() {
    var $input_user = $('#user_name');
    var $get_code = $('#get_code');
    var $login_type = $("#login-hidden");
    var validator = $("#signupForm").validate({
        rules: {
            openid: {
                required: true,
                mobile: true
            }
        },
        messages: {
            password: {
                required: "请输入您的密码",
                minlength: "密码长度不能小于6位！"
            },
            openid: {
                required: "手机号不能为空！",
                mobile: "请输入正确的手机号！"
            },
            mobile_code: "请输入短信验证码！",
        },
        success: function(element) {
            element.parent('li').find('.img_h').html('  <i class="iconfont icon-gougou"></i>');
        },
        showErrors: function(errorMap, errorList) {
            // 遍历错误列表
            for (var obj in errorMap) {
                // 自定义错误提示效果
                $("*[name='" + obj + "']").parents('li').find('.img_h').html(
                    '  <i class="iconfont icon-chacha"></i>')
            }
            // 此处注意，一定要调用默认方法，这样保证提示消息的默认效果
            this.defaultShowErrors();
        },
        submitHandler: function(form) {
            ST.request($(form).attr('action'), $(form).serialize(), function(err, data) {
                if (!err) {
                    var $redirect = data.data.redirect;
                    /*zhuge.track('登录成功', {
                        '来源入口': $redirect,
                        '登录方式': $login_type.val() == 'login' ? '账号密码登录' : '短信验证码登录'
                    }, function () {
                        window.location.href = $redirect;
                    });*/
                    window.location.href = $redirect;
                } else {
                    /* zhuge.track('登录失败', {
                         '来源入口': $redirect,
                         '失败原因': data.msg,
                         '登录方式': $login_type.val() == 'login' ? '账号密码登录' : '短信验证码登录'
                     }, function () {
                         layer.msg(data.msg);
                     });*/
                    layer.msg(data.msg);
                }
            })
        }
    });

    $input_user.on('input blur', function() {
        if (validatMobile()) {
            $get_code.removeAttr("disabled"); //启用按钮
        } else {
            $get_code.attr("disabled", "true");
        }
    });
    $(".pc-title-login .span").on('click', function() {
        //切换用户密码登录和短信登录
        $('#signupForm')[0].reset();
        validator.resetForm();
        $(this).addClass('curul').siblings().removeClass('curul');
        if ($(this).find('.a').is('.sj')) {
            $('.div_box').hide().eq(0).show();
            $login_type.val('login');
        } else {
            $('.div_box').hide().eq(1).show();
            $login_type.val('login_by_phone');
        }
    });
}

function doregister() {
    $.validator.setDefaults({
        submitHandler: function(form) {
            form.submit();
        }
    });
    // 在键盘按下并释放及提交后验证提交表单
    $("#signupForm").validate({
        errorPlacement: function(error, element) {
            error.appendTo(element.parent());
        },
        rules: {
            password: {
                required: true,
                minlength: 6
            },
            name: {
                required: true,
                emoji: true,
                stringCheck: true
            },
            telephone: {
                required: true,
                mobile: true
            },
            telephone_code: "required",
            agree: "required"
        },
        messages: {
            user_type: {
                required: "请选择您的身份！",
            },
            password: {
                required: "密码不能为空！",
                minlength: "密码长度不能小于6个字母！"
            },
            name: {
                required: "呢称不能为空！"
            },
            telephone: {
                required: "手机号不能为空！",
                mobile: "请输入正确的手机号！"
            },
            telephone_code: "请输入手机校验码！",
            agree: "请同意我们的协议！"
        },
        submitHandler: function(form) {
            ST.request($(form).attr('action'), $(form).serialize(), function(err, data) {
                if (!err) {
                    var $redirect = data.data.redirect;
                    // zhuge.track('注册成功', {
                    //     '来源入口': $redirect,
                    //     '方式': '账号注册'
                    // }, function() {
                    //     window.location.href = $redirect;
                    // });
                    window.location.href = $redirect;
                } else {
                    // zhuge.track('注册失败', {
                    //     '来源入口': $redirect,
                    //     '方式': '账号注册',
                    //     '失败原因': data.msg
                    // }, function() {
                    //     layer.msg(data.msg);
                    // });
                    layer.msg(data.msg);
                }
            });
        }
    });
}
$(function() {
    $('body').on('click', '#get_code', function() {
        var $mobile = validatMobile();
        if ($mobile) {
            $(this).msgAuthCode({
                'mobile': $mobile, //手机号
                'code_token': code_token
            }).catch(function(data) {
                layer.msg(data.msg);
            });
        } else {
            layer.msg('请填写正确的手机号码');
        }
    });
});

function validatMobile() {
    var mobile = $('#user_name').val().replace(/\s+/g, '');
    if (!ST.myreg.test(mobile)) {
        return false;
    }
    return mobile;
}