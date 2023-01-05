$(function () {
  // var condition = $(".brand_conditions_Aa .span").text();
  // var condition_label = $(".brand_conditions_Aa label");
  // // var brand_selectd_a1 = $(".brand_selectd_a");
  // if (condition.length == "") {
  //   condition_label.css("display", "none");
  //   // brand_selectd_a1.css("display", "block")
  // } else {
  //   // brand_selectd_a1.css("display", "none")
  // }

  //自动滚动
  $('.brand_left .numA-Z .name').on('click', function (event) {
    event.preventDefault();
    var self = $(this);
    navT = self.text();
    list = self.closest('.brand_left').find('.brand_list');
    self.addClass('active').siblings().removeClass('active');
    list.animate({
      scrollTop: list.find('.name:contains(' + navT + ')').prop('offsetTop')
    }, 'fast');

  });
});
//自动加载滚动
$(document).ready(function () {
  var self = $(".active");
  var navT = self.attr('num_data');
  if (navT) {
    list = self.closest('.brand_left').find('.brand_list');
    list.animate({
      scrollTop: list.find('.name:contains(' + navT + ')').prop('offsetTop')
    }, 'fast');
  }
  // 滑动品牌导航浮动
  var gerTop = $('.brand_wrap_a').offset().top;
  //pc
  $(document).scroll(function () {
    //获取当前滚动栏scroll的高度
    var scrTop = $(window).scrollTop();
    //如果元素距顶部的高度 等于 当前滚动栏的高度，开始悬浮；否则清空悬浮
    if (scrTop >= gerTop) {
      $('.brand_wrap_a').css({ 'position': 'fixed', 'top': '0px', 'z-index': '9999' });
    } else {
      $('.brand_wrap_a').css({ 'position': '', 'top': '', 'z-index': '' });
    }
  });

  $('.brand_wrap_right_A').each(function () {
    var $this = $(this);
    var length = $this.children('a').length;
    if (length > 0) {
      $this.append(
        '<span class="hidden-xs clasbox_open"><i class="iconfont icon-weibiaoti1 ani"></i> </span>');
    }
  });

  $("body").on('click', '.clasbox_open', function () {
    var $this = $(this);
    $this.toggleClass('clasbox_close').parents('.brand_wrap_right_x').toggleClass('cur');


    $(".brand_wrap_right_x").addClass('brand_wrap_right_c');
    // }

  });
  $("body").on('mouseleave', '.brand_wrap_right_c', function () {
    $(this).removeClass('brand_wrap_right_c')
  });

  $('.search_brand').on('click', function () {
    $(".brand_wrap_right_x").addClass('brand_wrap_right_c');
  })

  $('.tag_brand').on('click', function () {
    var tid = $(this).attr('data_id');
    var type = $(this).attr('data_type');

    console.log(tid);
    console.log(type);
    //   $('.hidden-xs').remove('clasbox_open').toggleClass('brand_wrap_right')
    $(".brand_wrap_right_x").removeClass('brand_wrap_right_c');

    var title = $(this).attr('title');
    console.log(title);
    $(".all").removeClass("cur_a");
    $(".search_brand").text(title).addClass("cur_a");

    $('.list_cont').empty();
    $.ajax({
      url: "/brand/ajaxTagBrandInfo",
      data: { tid: tid, type: type },
      type: "POST",
      dataType: "json",
      success: function (data) {
        if (data.err == 0) {
          $('.list_cont').html(data.data.brand);
        } else {
          alert(data.data);
        }
      }
    });
  })
})
function getAjaxBrand (tid) {

}
$(".agv-oa a").click(function () {
  $(this).addClass('cura').siblings().removeClass('cura');
})