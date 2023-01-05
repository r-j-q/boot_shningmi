/*
 * @Author: Alan.zheng 
 * @Date: 2017-12-18 11:05:16 
 * @Last Modified by: Alan.zheng
 * 
 * @Last Modified time: 2019-07-04 15:19:36
 */
$(function () {
  $(".hid_a").click(function () {
    $(".classification_fix").css("display", "none")
    window.location.reload();
  })
  // $('.clasbox_right').each(function () {
  //     var $this = $(this);
  //     var length = $this.children('a').length;
  //     if (length > 9 && $this.not('clasbox_pinpai') && !$this.is('.clasbox_application') ) {
  //         $this.append('<span class="hidden-xs clasbox_open"><b class="text">更多</b> <i class="iconfont icon-xiangxia ani"></i> </span>');
  //     }
  // });
  // $("body").on('click', '.clasbox_open', function () {
  //     var $this = $(this);
  //     $this.toggleClass('clasbox_close').parents('.clasbox_right').toggleClass('cur');
  //     if ($this.hasClass('clasbox_close')) {
  //         $this.find('.text').html('收起');
  //     } else {
  //         $this.find('.text').html('更多');
  //     }
  // });

  $(".mobile_sx").on("click", function (e) {
    //手机筛选框
    e.stopPropagation();
    $(".classification_fix").fadeIn().append("<div class='searchBar_before'></div>");
    $(".classification").attr('class', 'classification animated fadeInRightBig');
    var $hide = $(".classification_fix").is(':hidden');
    $("html,body").addClass("noscroll");
    $(".searchBar_before").one("click", function () {
      if (!$hide) {
        $(".classification_fix").fadeOut();
        $(".classification").attr('class', 'classification animated fadeOutRightBig');
        $(".searchBar_before").remove();
        $("html,body").removeClass("noscroll");
      }
    });
  });


  if ($(".page-prev")) {
    $(".previous").attr("href", $(".page-prev").find("a").attr("href"));
  }
  if ($(".page-next")) {
    $(".next").attr("href", $(".page-next").find("a").attr("href"));
  }
  // 更多筛选条件
  // $('.classi_list_more').on('click',function(){
  //     $(this).toggleClass('cur');
  //     $('.classi_list_more_box').toggle();
  // });

  $("#jqrFeedback").on('click', function (e) {
    e.preventDefault();
    layer.open({
      type: 2,
      title: '资料问题在线反馈',
      area: ['600px', '600px'],
      content: '/about/guestbook?type=feedback'
    });
  });
});

function searchCurrent (search) {
  if (search) {
    var scrollHeight = $("#searchBar").offset().top;
    $("body,html").scrollTop(scrollHeight);
  }
}



function searchWap ($wrap, url) {
  // alert(url);
  if (!isCollege(url)) {
    // 学院页面
    $('.clasbo_pinpai').remove();
  }
  // 筛选
  $wrap.on('click', 'a', function (event) {
    // alert(1212)
    var $that = $(this);
    event.preventDefault();
    if ($that.parents('.disk').length == 0) {
      // 判断是否为集成商的省市
      $that.parents('.clasbox_right').find('a').removeClass('cur');
      $that.addClass('cur');
      if (isCollege(url)) {
        // 学院页面
        $that.parents('.classi_college_type').siblings('.classi_college_type').find('.cur').removeClass('cur');
      }
    }

  });


  $('.search_input_close').on('click', function () {
    // 清除
    $('.clasbox_right a').removeClass('cur');
  });

  $('.search_input_submit').on('click', function () {
    // 提交
    var $search = [];
    var arr = url.split('/');
    //机器人
    if (arr[1] == 'jiqiren') {
      $search[1] = "0";
      $search[8] = "0";
    }
    //agv
    if (arr[1] == 'agv') {
    }
    // console.log($search[1]);
    $wrap.each(function (i, item) {
      var $isCur = $(this).find('.cur');
      var $index = $(this).parents('.classi_list').attr('data-index');


      if ($index >= 0) {
        // console.log($index);
        $search[$index] = $.trim($isCur.length > 0 ? $isCur.attr('data-value') : '0');
        if (isCollege(url)) {
          // 学院页面
          var $isCollegeCur = $('.classi_college_type .cur');
          $search[1] = $.trim($isCollegeCur.length > 0 ? $isCollegeCur.attr('data-value') : '0');
        }

      } else {
        $search[$index] = $.trim($isCur.length > 0 ? $isCur.attr('data-value') : '0');
      }
      // console.log($search[$index]);
      // console.log($index);
    });
    // console.log($search);

    //agv
    if (arr[1] == 'agv') {

      if (arr[2] == "search") {
        var pre_url = $search[0] + "-" + $search[3] + "-" + $search[2] + "-" + '0' + "-" + $search[1];
      } else {
        var pre_url = $search[0] + "-" + "0";
      }

      location.href = "http://m.imrobotic.com" + url + pre_url;
      return false;
    }
    //应用设备  
    if (arr[1] == 'appEqui') {

      var pre_url = $search[0] + "-0-" + $search[2];

      location.href = "http://m.imrobotic.com" + url + pre_url;
      return false;

    }
    //机器人
    if (arr[1] == 'jiqiren') {

      location.href = "http://m.imrobotic.com" + url + $search.join("-");
      return false;

    }
    //工业控制
    if (arr[1] == 'automation') {
      var pre_url = $search[0] + "-0-" + $search[1];
      // alert(pre_url)
      location.href = "http://m.imrobotic.com" + url + pre_url;
      return false;

    }
    //核心零部件
    if (arr[1] == 'parts') {
      var pre_url = $search[0] + "-0-" + $search[1];
      // var pre_url = $search[0] + $search[2] + $search[1];
      // alert(pre_url)
      location.href = "http://m.imrobotic.com" + url + pre_url;
      return false;

    }
    //智慧物流
    if (arr[1] == 'logistics') {
      var pre_url = $search[0] + "-0-" + $search[2];
      // alert(pre_url)
      location.href = "http://m.imrobotic.com" + url + pre_url;
      return false;

    }
    //无人叉车
    if (arr[1] == 'forklift') {
      var pre_url = $search[0] + "-" + $search[3] + "-" + $search[2] + "-0-" + $search[1];
      // alert(pre_url)
      location.href = "http://m.imrobotic.com" + url + pre_url;
      return false;

    }
    location.href = "http://m.imrobotic.com" + url + $search.join("-");

  });



  window.onload = function () {
    if (document.body.scrollTop > 0) {
      window.scrollTo(0, -1);
      document.body.scrollTop = 0;
    }
    window.scrollTo(0, -1);
    document.body.scrollTop = 0;
  }
}
function isCollege (url) {
  // alert(url)
  return url == '/college/search/' ? true : false;
}
