var user = imToken.authByCookie() || '';
$(function () {
  $('.get-more').on('click', function (e) {
    // 加载更多商机
    e.preventDefault();
    //var url = window.location.pathname.split('/')[3];
    var url = $('.news_loading').attr('data-name');
    // alert(url);
    OB.getMore({
      url: url,
      page: ++OB.page
    });
  });

  $('body').on('click', '.huoqu,.btn-huoqu,.ob-lock', function () {
    // 获取按钮
    OB.huoqu($(this));
  });

  $('body').on('click', '.btn-baoming', function () {
    OB.sign($(this), $(this).attr('data-id'));
  });
  $('#getMoreSign').on('click', function () {
    OB.getMoreSign($(this));
  });
  $('.ob-screen-box-op,.ob-screen-box-lb').on('click', function () {
    // 最新发布&即将结束
    var $value = $(this).data('value');
    $(this).toggleClass('has').data('value', $value);
    OB.screen();
  });
  $('.ob-h2-title-tab-i').on('click', function () {
    // 集成项目 || 设备采购
    $(this).addClass('has').siblings().removeClass('has');
    OB.screen();
  });
  if (!ST.isMobile()) {
    $('.ob-screen-box-sl').on('mouseover mouseout', function (e) {
      var $this = $(this);
      /*鼠标显示隐藏 */
      if (e.type == "mouseover") {
        $this.addClass('cur').append('<div class="ob-screen-box-sl-bg"></div>').find('.ob-model').show();
      } else if (e.type == "mouseout") {
        $this.removeClass('cur').find('.ob-model').hide().next('.ob-screen-box-sl-bg').remove();
      }
    });
  }
  $('.ob-model-u').on('click', 'a', function () {
    $(this).toggleClass('cur');
  });

  $('.ob-model').on('click', 'a', function () {
    // 弹出页a点击
    var $this = $(this);
    $this.addClass('cur').siblings().removeClass('cur').parents('.ob-screen-box-sl').addClass('has');
    if ($this.parents('.ob-model-province').length > 0) {
      // 地域选择
      var provinceValue = $this.attr('data-value');
      var cKey = 0;
      for (cKey in MerchantDisk[100000]) {
        if (provinceValue == MerchantDisk[100000][cKey]) {
          Merchant.city(cKey); // 循环市区
        } else if (provinceValue == 0) {
          $this.parents('.ob-screen-box-sl').removeClass('cur has').find('.text').text($this.text());
          Merchant.city(0); // 不限
          if (!ST.isMobile()) {
            OB.screen();
          }
          return false;
        }
        $this.parents('.ob-screen-data').data('value', provinceValue);
        $this.parents('.ob-screen-box-sl').find('.text').text($this.text());
      }
    } else if ($this.parents('.ob-model-app').length > 0) {
      var provinceValue = $this.attr('data-value');
      var $text = $this.text();
      var $value = $this.data('value');
      for (let i = 0; i < application.length; i++) {
        if ($value == application[i]['id']) {
          Merchant.application(application[i]); // 循环二级应用
        } else if (provinceValue == 0) {
          Merchant.application(0); // 不限
          $this.parents('.ob-screen-box-sl').removeClass('cur has').find('.text').text($this.text());
          if (!ST.isMobile()) {
            OB.screen();
          }
          return false;
        }
      }
      $this.parents('.ob-screen-data').data('value', $value);
      $this.parents('.ob-screen-box-sl').find('.text').text($this.text());
    } else {
      var $text = $this.text();
      var $value = $this.data('value');
      if ($this.parents('.ob-model-city').length > 0) {
        $text = $('.ob-model-province .cur').text() + $this.text();
      }
      if ($this.parents('.ob-model-application').length > 0) {
        $text = $('.ob-model-app .cur').text() + $this.text();
      }
      $this.parents('.ob-screen-box').removeClass('cur').data('value', $value).find('.text').text($text);
    }
  });
  if (!ST.isMobile()) {
    $('.ob-model-btn').on('click', function () {
      OB.screen();
    })
    // OB.screen();
  }
  var $searchHtml = '<div class="search_bottom"><a class="btn search_input_close">清除</a><a class="btn search_input_submit">确定</a></div>';
  $(".mobile_sx").on("click", function (e) {
    //手机筛选框
    e.stopPropagation();
    var $obScreen = $('.ob-screen');
    $obScreen.addClass('ob-screen-show').append($searchHtml).parent().append("<div class='ob-screen-bg'></div>");
    $("html,body").addClass("noscroll");
    $(".ob-screen-bg").one("click", function () {
      OB.toggelBox($obScreen);
    });
    $('.search_input_close').on('click', function () {
      // 清除
      $('.ob-screen-wrap a').removeClass('cur');
    });
    $('.search_input_submit').on('click', function () {
      // 筛选
      OB.screen();
      OB.toggelBox($obScreen);
    });
  });
  var layerTips = null;
  $('.session-bar .btn').on('mouseenter', function () {
    var text = $(this).data('tips');
    layerTips = layer.tips(text, $(this), {
      tips: [3, '#555'],
      time: 30000
    });
  }).on('mouseleave', function () {
    layer.close(layerTips);
  });
  $('body').on('click', '.ob-list li a', function () {
    var $this = $(this);
    /*  zhuge.track('商机页-点击查看商机详情', {
        '商机名称': $this.attr('title'),
        '商机编号': $this.find('.ob-list-item-1').text(),
        '应用类型': $this.find('.ob-list-item-3').attr('title'),
        '地域': $this.find('.ob-list-item-4').data('text')
      });*/
  });


  // input的赋值
  $("#select-a").change(function () {
    var value = $("#select-a").find('option:selected').text();
    $('#datashow').val(value);
  })


});
var OB = {
  page: 1,
  /*  zhugeIO: {
      '商机名称': $('#buopTitle').text(),
      '商机编号': $('#buopCode').text(),
      '应用类型': $('#buopApplication').text(),
      '地域': $('#buopProvince').text(),
    },*/
  ajaxData: {},
  runSwiper: function () {
    var mySwiper = new Swiper('.ob-top-banner .swiper-container', {
      //焦点图
      autoplay: 5000,
      effect: 'slide',
      pagination: '.swiper-pagination',
      paginationClickable: true,
    });
    var mySwiper2 = new Swiper('.ob-jcs-container', {
      //集成商滚动
      direction: 'vertical', //向上
      autoplay: 1000,
      speed: 2000, //速度
      loop: true, //自动轮播
      freeMode: true,
      onlyExternal: true,
      slidesPerView: 4,
      autoplayDisableOnInteraction: true,
      spaceBetween: 0,
      noSwiping: true,
      breakpoints: {
        //当宽度小于等于320
        768: {
          slidesPerView: 1,
          speed: 2000, //速度
        }
      }
    });
  },
  huoqu: function ($this) {
    //获取商机
    var data_href = $this.attr('data-href');
    if ($this.hasClass('disabled')) {
      return false;
    }
    if (user.user_id) {
      if ($this.attr('tip-msg') != undefined) {
        layer.msg($this.attr('tip-msg'));
      } else if ($this.attr('data-msg') != undefined) {
        var $width = ST.isMobile() ? '100%' : '500px';
        var $height = ST.isMobile() ? '100vh' : 'auto';
        layer.open({
          title: '交换名片',
          type: 1,
          area: [$width, $height], //宽高
          content: OB.returnCardHtml() + '<div class="text-center mbot10 orange"><i class="f-20 iconfont icon-yuanchuang"></i> ' + $this.attr('data-msg') + '</div>',
          btn: ['确定', '取消'],
          yes: function (index) {
            // zhuge.track('商机详情页-获取-点击确定', OB.zhugeIO);
            if ($this.attr('data-redirect') != undefined) {
              window.location.href = $this.attr('data-redirect');
            } else {
              getBuop(data_href);
            }
          },
          cancel: function () {
            //  zhuge.track('商机详情页-获取-点击取消', OB.zhugeIO);
          }
        });
      } else {
        getBuop(data_href);
      }
    } else {
      //  OB.zhugeIO['原因'] = '未登录';
      // zhuge.track('商机详情页-获取失败', OB.zhugeIO);
      // ST.GoToLogin('登录后才能获取商机,去登录？');
      ST.login();
    }
  },
  sign: function ($this, $id) {
    if (user.user_id) {
      if ($this.attr('tip-msg') != undefined) {
        layer.msg($this.attr('tip-msg'));
      } else if ($this.attr('data-msg') != undefined) {
        layer.confirm($this.attr('data-msg'), {
          icon: 3,
          title: '报名项目'
        }, function (index) {
          if ($this.attr('tip-msg') != undefined) {
            layer.msg($this.attr('tip-msg'));
          } else if ($this.attr('data-redirect') != undefined) {
            window.location.href = $this.attr('data-redirect');
          } else {
            signBop($id);
          }
        });
      } else {
        signBop($id);
      }
    } else {
      ST.login();
    }
  },
  getMoreSign: function ($this) {
    $id = $this.attr('data-id');
    $page = $this.attr('data-next-page');
    if ($page) {
      ST.request('/buop/getMoreSign', {
        id: $id,
        page: $page
      }, function (error, data) {
        var $data = data.data;
        if ($data) {
          var element = '';
          for (var i in $data) {
            element += '<li>' +
              '<dl class="flex">' +
              '<dd class="dd-td omg">' + $data[i].company_name + '</dd>' +
              '<dd class="dd-td dd-td-2"><span class="visible-xs-inline-block">所在地：</span>' + $data[i].address + '</dd>' +
              '<dd class="dd-td dd-td-3"><span class="visible-xs-inline-block">联系人：</span>' + $data[i].name + '</dd>' +
              '<dd class="dd-td dd-td-4"><span class="visible-xs-inline-block">联系电话：</span>' + $data[i].contact + '</dd>' +
              '<dd class="dd-td dd-td-5"><span class="visible-xs-inline-block">邮箱：</span>' + $data[i].email + '</dd>' +
              '</dl>' +
              '</li>';
          }
          $('.sign-content').append(element);
        }
        if (data.next_page) {
          $this.attr('data-next-page', data.next_page);
        } else {
          $this.remove();
        }
      });
    }
  },
  listHtml: function (list) {
    // 商机列表html拼接
    var text = '';
    for (var i in list) {
      text += '<li><a href="/buop/detail/' +
        list[i].id +
        '.html" target="_blank" title="' + list[i].buop_title + '">' +
        '<div class="ob-list-item ob-list-item-1 hidden-xs">' +
        list[i].code +
        '</div> <div class="ob-list-item ob-list-item-2 omg">';

      if (list[i].user_attribute == 2) {
        text += '<span class="badge badge-m">学院 </span>';
      } else if (list[i].user_attribute == 3) {
        text += '<span class="badge badge-m">研究院 </span>';
      }
      var gray_class = list[i].project_stage == '已结束' ? 'badge-gray' : '';
      text += '<span class="badge ' + gray_class + '">' +
        list[i].project_stage +
        '</span><span class="omg"><span class="visible-xs-inline-block">项目描述：</span> &nbsp;' +
        list[i].buop_title +
        '</span>'
      if (list[i].is_vip) {
        text += ' <i class="iconfont icon-vip red"></i>';
      }
      text += '</div><div class="ob-list-item ob-list-item-3 omg" title="' + list[i].application + '"><span class="visible-xs-inline-block">应用：</span>' +
        list[i].application +
        '</div><div class="ob-list-item ob-list-item-4 omg" data-text="' +
        list[i].province + '/' + list[i].city +
        '"><span class="visible-xs-inline-block">地域：</span>' +
        list[i].province + '/' + list[i].city +
        ' </div><div class="ob-list-item ob-list-item-5 omg"><span class="visible-xs-inline-block">时间：</span>' +
        list[i].publish_time +
        '</div><div class="ob-list-item ob-list-item-6"><span class="visible-xs-inline-block">已报名：</span>' +
        list[i].sign_num +
        '次</div><div class="ob-list-item ob-list-item-7"><span class="visible-xs-inline-block">浏览量：</span>' +
        list[i].view_num + '次' +
        '</div></a></li>';
    }
    return text;
  },
  getList: function (param) {
    var $data = $.extend(true, param, OB.ajaxData);
    var def = $.Deferred(); // new promise
    ST.request('/buop/getList', $data, function (error, data) {
      if (!error) {
        var $resolve = data.data;
        var $applicationText = undefined;
        var $application = $('.ob-screen-data.has[data-type="application"]');
        if ($application.length > 0) {
          $applicationText = $application.find('.text').text();
        }

        if ($resolve.list.length > 0) {
          def.resolve($resolve);
        } else {
          $('.news_loading_box').hide();
          def.reject();
        }
      } else {
        layer.msg(data.msg);
      }
    });
    return def.promise();
  },
  getMore: function (param) {
    //加载更多
    OB.getList(param).then(function (data) {
      $('.total_page').text(data.total_page);
      $('.current_page').text(param.page);
      $('.ob-list ul').append(OB.listHtml(data.list));
      if (param.page >= data.page_total) {
        $('.news_loading_box').hide();
      }
    }, function (reject) {
      layer.msg('没有更多数据了');
    });
  },
  screen: function (param) {
    // 筛选ajax
    OB.ajaxData = {};
    if (!ST.isMobile()) {
      // pc
      $('.ob-screen-data.has').each(function (i, item) {
        OB.ajaxData[$(item).data('type')] = $(item).data('value');
      });

    } else {
      // mobile
      $('.ob-screen-box .cur').each(function (i, item) {
        var $parents = $(item).parents('.ob-screen-data') || $(item).parent('.ob-screen-data');
        OB.ajaxData[$parents.data('type')] = $(item).data('value');
      });
      var $allBuop = $('.ob-h2-title-tab-i.has');
      OB.ajaxData[$allBuop.data('type')] = $allBuop.data('value');
      $('.ob-screen').removeClass('ob-screen-show');
    }
    OB.getList().then(function (data) {
      OB.page = 1;
      $('.total_page').text(data.total_page);
      $('.current_page').text(1);
      $('.total').text(data.total);
      $('.ob-list ul').html(OB.listHtml(data.list));
      if (data.total_page > 1) {
        $('.news_loading_box').show();
      } else {
        $('.news_loading_box').hide();
      }
    }, function (reject) {
      $('.ob-list ul').html('<div class="clearfix zhuyishixiang mtop30"><span><i class="iconfont icon-zhuyishixiang_f"></i> 抱歉，没有找到相关结果,请更换筛选条件。</span></label></div>');
    });
  },
  toggelBox: function ($obScreen) {
    var $hide = $obScreen.is(':hidden');
    if (!$hide) {
      $obScreen.removeClass('ob-screen-show');
      $('.ob-screen-bg,.search_bottom').remove();
      $("html,body").removeClass("noscroll");
    }
  },
  returnCardHtml: function ($buop) {
    return '<div class="card-form-padding">' +
      '<div class="card">' +
      '<div class="card-left">' +
      '<div class="card-top">' +
      '<img class="img" src="' + ST.imgUrl + '/store/logo/20200320/45MdmyFCnB.jpg">' +
      '<div class="card-top-right omg">' +
      '</div></div></div>'
  },
}

function getBuop (data_href) {
  // zhuge.track('商机详情页-获取-点击确定', OB.zhugeIO);
  ST.request(data_href, {}, function (error, data) {
    if (!error) {
      $buop = data.buop;
      layer.closeAll();
      layer.open({
        title: '交换名片成功',
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: '500px', //宽高
        content: OB.returnCardHtml() + '<div class="text-center mar_b20 orange"><i class="f-20 iconfont icon-yuanchuang"></i> 交换成功</div>',
        cancel: function () {
          location.href = '/buop/detail/' + data_href.split('/').reverse()[0] + '.html'; // 跳转至详情页面
        }
      });
      //  zhuge.track('商机详情页-获取成功', OB.zhugeIO);
    } else {
      //OB.zhugeIO['原因'] = data.msg;
      // zhuge.track('商机详情页-获取失败', OB.zhugeIO);
      if (data.redirect != undefined) {
        layer.confirm(data.msg, {
          icon: 3
        }, function () {
          /* zhuge.track('商机详情页-免费次数已用完提示去购买-点击确定', OB.zhugeIO, function () {
             location.href = data.redirect;
           });*/
          location.href = data.redirect;
        });
      } else {
        layer.alert(data.msg, function () {
          location.reload();
        })
      }
    }
  });
}

function signBop ($id) {
  ST.request('/buop/sign', {
    id: $id
  }, function (error, data) {
    if (data.err) {
      layer.alert(data.msg, function (index) {
        if (data.redirect != undefined) {
          window.location.href = "https://www.imrobotic.com" + data.redirect;
        } else {
          layer.close(index);
        }
      });
      //  zhuge.track('商机详情页-报名成功', OB.zhugeIO);
    } else {
      layer.alert(data.msg, function (index) {
        location.reload();
      });
      // OB.zhugeIO['原因'] = data.msg;
      //zhuge.track('商机详情页-报名失败', OB.zhugeIO);
    }
  });
}

