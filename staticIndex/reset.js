/*
 * @Author: Alan.zheng 
 * @Date: 2018-05-03 10:19:50 
 * @Last Modified by: Alan.zheng
 * @Last Modified time: 2020-07-13 17:15:51
 */

$('.shu_A').last().css('display', 'none');
//ie8以下 ，提示更新浏览器
if (navigator.appName == "Microsoft Internet Explorer") {
  var versionIE = navigator.appVersion.split(";")[1].replace(/[ ]/g, "");
  if (versionIE == "MSIE8.0" || versionIE == "MSIE7.0" || versionIE == "MSIE6.0" || versionIE == "MSIE5.0") {
    alert('您正在使用' + versionIE + '浏览器,为了保证您能有更好的访问效果,我们建议您使用360浏览器（极速模式）、Chrome浏览器、火狐Firefox浏览器或者IE8以上版本浏览器！');
  }
}
//百度统计+百度商桥
var _hmt = _hmt || [];
(function () {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?19ae894f01d1e10994813d3c94c65df9";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
//百度站长推送
(function () {
  var bp = document.createElement('script');
  var curProtocol = window.location.protocol;
  if (curProtocol === 'https:') {
    bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
  } else {
    bp.src = 'http://push.zhanzhang.baidu.com/push.js';
  }
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(bp, s);
})();
// 百度事件统计
$("[data-track]").on("click", function () {
  var category = $(this).data("track");
  var opt_label = $(this).data("label");
  window._hmt && window._hmt.push(['_trackEvent', category, 'click', opt_label]);
});

$.zqTab = function (_tab, _box, _hover, _shijian) {
  //选项卡插件 _tab触发div _box执行div _hover当前选中class _shijian点击，滑动事件     
  var index; //索引值
  $(_tab).eq(0).addClass(_hover); //第一个导航高亮显示 
  $(_box).hide().eq(0).show(); //第一个内容显示
  $(_tab).bind(_shijian, function () {
    _index = $(_tab).index(this); //获取当前点击的索引值
    $(this).addClass(_hover).siblings().removeClass(_hover); //当前点击高亮显示
    $(_box).eq(_index).show().siblings().hide(); //通过索引值让对应的选项内容区显示
  });
};
$.zqTab_A = function (_tab, _box, _hover, _shijian) {
  //选项卡插件 _tab触发div _box执行div _hover当前选中class _shijian点击，滑动事件     
  var index; //索引值
  $(_tab).eq(0).addClass(_hover); //第一个导航高亮显示 
  $(_box).hide().eq(0).show(); //第一个内容显示
  $(_tab).bind(_shijian, function () {
    _index = $(_tab).index(this); //获取当前点击的索引值
    $(this).addClass(_hover).siblings().removeClass(_hover); //当前点击高亮显示
    $(_box).eq(_index).show().siblings().remove(); //通过索引值让对应的选项内容区显示
  });
};
// $.zqTab("#Tab>li","#page>.box","li-hover","click");//调用方法
// $.zqTab("#Tab2>li","#page2>.box","li-hover","mouseenter");//调用方法
// $.zqTab(".navbar-nav_A li", ".top_op .classification_fix_A ", "sad", "mouseenter");


//ajax 封装
var DEBUG = true;
var ST = {
  imgUrl: 'http://image.imrobotic.com/',
  myreg: /^1[3|4|5|6|7|8|9]\d{9}$/,
  request: function (action, sendObj, fb, disableTip, mockData) {
    if (mockData && DEBUG) {
      // 模拟数据调试
      setTimeout(function () {
        if (!mockData['err']) {
          fb(0, mockData['result']);
        } else {
          fb(mockData['err'], mockData['msg']);
        }
      }, 500);
    } else {
      var reAjax = $.ajax({
        url: action,
        type: "POST",
        data: sendObj,
        dataType: "json",
        beforeSend: function () {
          //ajax loading  
          if (!disableTip) {
            ajxaLayerLoad = layer.load(0, {
              time: 20 * 1000
            });
          }
        }
      });
      reAjax.then(function (data, status, xhr) {
       //  console.info("[ACK]", JSON.stringify(data));
        if (!disableTip) {
          layer.close(ajxaLayerLoad);
        }
        if (!data['err']) {
         // alert(3);return false;
          fb(0, data);
        } else {
          fb(data['err'], data);
        }
      }, function (xhr, error, exception) {
        if (fb) {
          fb(-1, error);
        }
      });
    }
  },
  lazyload: function () {
    //图片懒加载
    $("img[data-src]").lazyload({
      threshold: 100,
      skip_invisible: false,
      data_attribute: "src",
      placeholder: "https://image.imrobotic.com/jiqiren/images/grey.gif", //加载图片前的占位图片
      effect: "fadeIn" //加载图片使用的效果(淡入)
    });
  },
  // aniQQFun: function () {
  //     $('.menu_leftQQ').toggleClass('aniQQ');
  // },

  infoQh: function ($info) {
    var info_index = 0;
    $($info).parent().find('.hyh').on('click', function () {
      info_index++
      if (info_index >= $($info + ' li').length) {
        info_index = 0;
      }
      var $curLi = $($info).find('li').eq(info_index);
      $curLi.trigger('mouseenter');
      var $href = $curLi.find('a').attr('href');
      $($info).parent().find('.more').attr('href', $href);
    })
  },
  GoToLogin: function ($title) {
    var callbackUrl = window.location.href;
    layer.confirm($title, {
      icon: 3,
      title: '确定'
    }, function () {
      window.location.href = 'https://user.imrobotic.com/login?redirect_uri=' + callbackUrl;
    });
  },
  isMobile: function () {
    return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },
  setCookie: function (cname, cvalue, exdays, cdomain) {
    var d = new Date();
    cdomain = cdomain || location.hostname;
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/;domain=" + cdomain + ";";
  },
  getCookie: function (name) {
    var getArr, getReg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (getArr = document.cookie.match(getReg)) {
      var getValue = unescape(getArr[2])
      return getValue;
    } else {
      return false;
    }
  },
  saveToLocal: function (id, key, value) {
    var imrobotic = window.localStorage.__imrobotic__;
    if (!imrobotic) {
      // 第一次存储
      imrobotic = {};
      imrobotic[id] = {};
    } else {
      // 已经有存储，localStorage存储的是字符串，用JSON.parse()转成json对象
      imrobotic = JSON.parse(imrobotic);
      if (!imrobotic[id]) {
        imrobotic[id] = {};
      }
    }
    imrobotic[id][key] = value;
    window.localStorage.__imrobotic__ = JSON.stringify(imrobotic);
  },
  loadFromLocal: function (id, key, def) {
    // 取localStorage值
    var imrobotic = window.localStorage.__imrobotic__;
    if (!imrobotic) {
      // 如果没有localStorage，则返回默认值
      return def;
    }
    imrobotic = JSON.parse(imrobotic)[id];
    if (!imrobotic) {
      return def;
    }
    var ret = imrobotic[key];
    return ret || def;
  },
  getQueryString: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  },
  debounce: function (fn, wait) {
    // 防抖
    var timeout = null;
    return function () {
      if (timeout !== null)
        clearTimeout(timeout);
      timeout = setTimeout(fn, wait);
    }
  },
  throttle: function (func, delay) {
    // 节流
    var timer = null;
    var startTime = Date.now();
    return function () {
      var curTime = Date.now();
      var remaining = delay - (curTime - startTime);
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      if (remaining <= 0) {
        func.apply(context, args);
        startTime = Date.now();
      } else {
        timer = setTimeout(func, remaining);
      }
    }
  },
  getGuestBook: function () {
    // 留言
    layer.open({
      type: 2,
      title: '我要留言',
      area: ['600px', '600px'],
      content: '/about/guestbook',
      success: function (dom, index) {
        if (ST.isMobile()) {
          //手机端全屏
          layer.full(index);
          $(dom).find('.layui-layer-content').height('100%');
        }
      }
    });
  },

  pjaxInfo: function (info, url, container, i) {
    var htmlArr = [];
    htmlArr[i] = [];
    $(info + ' li').on('mouseenter', function () {
      $(this).addClass('cur').siblings().removeClass('cur');
      var $id = $(this).data('href');
      if (!htmlArr[i][$id]) {
        $.ajax({
          url: url + $id,
          dataType: 'html',
          type: 'get',
          success: function (data) {
            $(container).html(data);
            htmlArr[i][$id] = data;
          }
        })
      } else {

        $(container).html(htmlArr[i][$id]);
      }
    });


  },
  toCollect: function ($this) {
    var $data = {
      type: $this.data('type'),
      id: $this.data('id'),
      cancel: $this.data('cancel')
    };
    var defer = $.Deferred();
    ST.request('/user/collect', $data, function (err, data) {
      if (!err) {
        if ($data.cancel !== 0) {
          $this.data('cancel', 0).find('.text').text('收藏');
          defer.resolve('取消收藏');
        } else {
          $this.data('cancel', 1).find('.text').text('已收藏');
          layer.msg('收藏成功', {
            icon: 6
          });
          defer.resolve('收藏成功');
        }
        $this.find('.iconfont').toggleClass('cur');
      } else {
        layer.msg('请求失败');
        defer.reject(0);
      }
    });
    return defer.promise();

  },
  login: function (needform) {
    var _needform = needform ? '?needform=' + encodeURI(needform) : '';
    var $width = this.isMobile() ? '100%' : '500px';
    var $height = this.isMobile() ? '100%' : '410px';
    //alert(2);exit;
    layer.open({
      type: 2,
      title: '快捷登录',
      area: [$width, $height],
      content: '/index/smsLogin' + _needform,
      success: function (dom, index) {
       /* zhuge.track('快捷登录-弹出窗', {
          '来源入口': location.href,
        });*/
      }, cancel: function () {
      /*  zhuge.track('快捷登录-关闭弹出窗', {
          '来源入口': location.href,
        });*/
      }
    });
  }
};
var imToken = {
  authByCookie: function () {
    var token = ST.getCookie('token'); // 获取cookie
    if (token) {
      return JSON.parse(this.jwt.decode(token));
    }
  },
  jwt: {
    // jwt解码
    decode: function (sJWS) {
      var a = sJWS.split(".");
      var uHeader = b64utos(a[0]);
      var uClaim = b64utos(a[1]);

      var pHeader = KJUR.jws.JWS.readSafeJSONString(uHeader);
      var pClaim = KJUR.jws.JWS.readSafeJSONString(uClaim);

      var sHeader = JSON.stringify(pHeader, null, "  ");
      var sClaim = JSON.stringify(pClaim, null, "  ");

      return sClaim;
    }
  }
}
/*REM begin*/
ST.pjaxInfo('.type_topinfo', '/index/getLink?type=', '.top_op', 1);

// 128 px（ 盒子） / 640 px(设计稿) * 10 == 2 rem;
! function (e) {
  function t () {
    var t = n.clientWidth,
      r = "}";
    !navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i) && t > 1024 && (t = 640, r = ";font-size:12px;}"),
      e.rem = t / 10,
      /ZTE U930_TD/.test(navigator.userAgent) && (e.rem = 1.13 * e.rem),
      /Android\s+4\.4\.4;\s+M351\s/.test(navigator.userAgent) && (e.rem = e.rem / 1.05),
      i.innerHTML = t <= 414 ? "html{font-size:" + e.rem + "px!important;}body{font-size:" + 12 * (t / 320) + "px" + r : "html{font-size:40px!important;}body{font-size:14px"
  }
  var n = document.documentElement,
    i = document.createElement("style");
  n.firstElementChild.appendChild(i),
    e.addEventListener("resize", function () {
      t()
    }, !1),
    e.addEventListener("pageshow", function (e) {
      e.persisted && t()
    }, !1),
    t()
}(window);

/*REM end*/

/*REM end*/
$(function () {




  $("#qcode").hover(function () {
    //手机版微信二维码显示隐藏
    $(".qrcode").fadeToggle("fast");
  });

  $('video').on('contextmenu', function () {
    // 禁用video右键
    return false;
  });
  // var intQQ = self.setInterval("ST.aniQQFun()", 1000);
  if ($("img[data-src]").length > 0) {
    ST.lazyload(); //图片懒加载
  }
  $('#getGuestBook').on('click', function (e) {
    // 留言板
    e.preventDefault();
    ST.getGuestBook();
  });
  $("#go_top").click(function () {
    // 返回顶部
    $('body,html').animate({
      scrollTop: 0
    }, 500);
  });
  /* nav菜单栏点击切换事件  */
  $('.navbar-toggle').on('click', function () {
    $('.navbar-collapse').addClass('cur').show();
    $(".navbar-nav").animate({
      right: '0'
    });
  });
  $('.navbar-collapse').on('click', function () {
    $(".navbar-nav").animate({
      right: '-100%'
    });
    $(this).hide().removeClass('cur');
  });
  $(".navbar-nav").on(function (e) {
    e.stopPropagation();
  });
  // 确定能使用pjax时
  if ($.support.pjax) {
    var pjaxLoad = null;
    $(document).on('pjax:send', function () {
      pjaxLoad = layer.load();
    });
    $(document).on('pjax:complete', function () {
      layer.close(pjaxLoad);
    });
  }



  $('.classi_list_more').on('click', function () {
    $(this).toggleClass('cur');
    $('.classi_list_more_box').toggle();
  });


  $('.navbar-nav_a').bind('click', function () {
    $(this).toggleClass('cur');
    $('.navbar-nav_A').toggle();
    $('.top_op').css("display", "none");

  });
  if ($(".type_topinfo").css("display") == "block") {
    $('.navbar-nav_a').unbind();
  }

  $('.type_topinfo li').bind("mouseenter", function () {
    $(this).addClass('active_A').siblings().removeClass('active_A');
  })

  // 改版2021/3/8
  //导航全部分类
  $('.stli_a_b').on('mouseenter', function () {
    $(".stli_a_b_A").css({ "height": "158px", "background": "#fff" });
  });
  $('.stli_a_b').on('mouseleave', function () {
    $(".stli_a_b_A").css({ "height": "0", "background": "" });
  });
  $('.stli_a_B').on('mouseenter', function () {
    $(".stli_a_b_B").css({ "height": "135px", "background": "#fff" });
  });
  $('.stli_a_B').on('mouseleave', function () {
    $(".stli_a_b_B").css({ "height": "0", "background": "" });

  });


  //导航全部分类子集内容--增加阴影效果
  $(".nav_one_A").hover(function () {
    $(this).find('.nac_jt').addClass("nac_jt_a");
  }, function () {
    $(this).find('.nac_jt').removeClass('nac_jt_a');
  })

  // 全局首页banner

  $('#cata-nav').find('.item').hover(function () {
    $(this).addClass('nav-active').siblings().removeClass('nav-active');
    $(this).find('.color_red_A').addClass('color_red').siblings().removeClass('color_red');
  }, function () {
    $(this).removeClass('nav-active');
    $(this).find('.color_red_A').removeClass('color_red');
  })

  var this_vel = $(".new-news-3 .swiper-slide").length;
  if (this_vel == 8) {
    $(".this_let").css("left", "-145px")
  } if (this_vel == 7) {
    $(".this_let").css("left", "-175px")
  } if (this_vel == 6) {
    $(".this_let").css("left", "-205px")
  } if (this_vel == 5) {
    $(".this_let").css("left", "-235px")
  } if (this_vel == 4) {
    $(".this_let").css("left", "-265px")
  } if (this_vel == 3) {
    $(".this_let").css("left", "-295px")
  } if (this_vel == 2) {
    $(".this_let").css("left", "-325px")
  } if (this_vel == 1) {
    $(".this_let").css("left", "-355px")
    $(".this_let").removeClass('swiper-slide').css("display", "none")
    $(".swiper-pagination_21a").css("display", "none")
    $(".new-news-3 .swiper-wrapper a").removeClass("swiper-slide")
  }
});
//判断是否是手机
function ismobile () {
  var ua = navigator.userAgent;
  var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
    isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
    isAndroid = ua.match(/(Android)\s+([\d.]+)/),
    isMobile = isIphone || isAndroid;
  //判断
  if (isMobile) {
    return false
  } else {
    return true
  }
}
/*cookie 设置cookie */
function setCookie(cname,cvalue,exdays){
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires;
}
/*cookie 获取cookie */
function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) { return c.substring(name.length,c.length); }
    }
    return "";
}


//底部广告
if (ismobile() == true) {
  var cookie_val = getCookie("name");
  // alert(cookie_val)
  if (cookie_val) {
    $(".bott_img").hide();
  } else {
    $(".bott_img").css("display", 'block');
  }
}


//底部广告
$(function () {
  var display = $(".bott_img").css("display");
  if (display == 'block') {
    $(".X_x").click(function () {
        setCookie('name','ad_foot',1);
      $(".bott_img").hide();
    })
  };


})

