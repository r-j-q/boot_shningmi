/*
 * @Author: Alan.zheng 
 * @Date: 2018-02-27 09:55:45 
 * @Last Modified by: Alan.zheng
 * @Last Modified time: 2018-08-03 16:05:43
 */
//切换 后期添加事件可删除
$(function () {
    var thash = location.hash.substring(1);
    $(".ha" + thash).addClass("cur").siblings().removeClass("cur");
    $(".about_left li,wrapper02 li").bind("click", function (even) {
        $(".ha" + thash).addClass("cur").siblings().removeClass("cur");
    });
    //计算高度
    if ($('.about_left ul').height() < $('.about_right').height()) {
        $(".about_left ul").height($('.about_right').height() );
    }
    
});