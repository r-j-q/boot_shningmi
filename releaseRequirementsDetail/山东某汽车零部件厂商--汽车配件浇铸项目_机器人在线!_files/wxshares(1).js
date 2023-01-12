/**
 * 
 * @authors Alan (www.imrobotic.com)
 * @date    2017-05-07 14:16:17
 * 微信分享
 */
function GoToWxLogin () {
  if (!getCookie('openid')) {
    // 微信授权登陆
    location.href = "https://user.imrobotic.com/wechat/oauth?url=" + encodeURIComponent(location.href);
  }
  function getCookie (name) {
    var getArr, getReg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (getArr = document.cookie.match(getReg)) {
      var getValue = unescape(getArr[2])
      return true;
    }
    else {
      return false;
    }
  };
}
$(function () {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) != "micromessenger") {
    // 非微信端返回
    return false;
  }
  window.wxshares = $.extend(true, {
    titleInfo: $('title').html() ? $('title').html() : '机器人在线,工业大数据平台',
    descInfo: $('meta[name="description"]').attr('content') ? $('meta[name="description"]').attr('content') : '机器人在线是中国机器人行业领先的门户网站，面向机器人技术与应用领域的用户提供大数据服务、机器人行业资讯、机器人技术资料，这里汇聚海量机器人本体、集成商、应用设备商，专注高端智能制造以及服务机器人领域产业研究的综合服务平台。',
    imgUrls: "<?=J_HOST?>/static/components/img/logo_weixin.png",
    wechatShare: function (titleInfo, descInfo, imgUrls) {
      var locationUrl = location.href.split('#')[0];
      $.ajax({
        url: 'https://api.imrobotic.com/ewechat/share',
        type: 'POST',
        dataType: 'json',
        data: { url: locationUrl },
      }).done(function (data) {
        wx.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: [
            // 所有要调用的 API 都要加到这个列表中
            'checkJsApi', 'openLocation', 'getLocation', 'updateTimelineShareData', 'updateAppMessageShareData',
          ]
        });
        wx.ready(function () {
          wx.checkJsApi({
            jsApiList: ['getLocation', 'updateTimelineShareData', 'updateAppMessageShareData',],
            success: function (res) {
              //alert(JSON.stringify(res));
            }
          });
          wx.updateAppMessageShareData({
            //自定义“分享给朋友”及“分享到QQ”
            title: titleInfo,
            desc: descInfo,
            link: locationUrl,
            imgUrl: imgUrls
          });
          wx.updateTimelineShareData({
            //自定义“分享到朋友圈”及“分享到QQ空间
            title: titleInfo,
            desc: descInfo,
            link: locationUrl,
            imgUrl: imgUrls
          });
          // wx.onMenuShareQQ({
          //     title: titleInfo, // 分享标题
          //     desc: descInfo, // 分享描述
          //     link: locationUrl, // 分享链接
          //     imgUrl: imgUrls // 分享图标
          // });
          // wx.onMenuShareQZone({
          //     title: titleInfo, // 分享标题
          //     desc: descInfo, // 分享描述
          //     link: locationUrl, // 分享链接
          //     imgUrl: imgUrls // 分享图标
          // });
        });
        wx.error(function () {
          console.log('config失败');
        });
      }).fail(function () {
        console.log("error");
      });
    }
  }, window.wxshares || {});
  wxshares.wechatShare(wxshares.titleInfo, wxshares.descInfo, wxshares.imgUrls);
});
// wxshares = {
//     //自定义分享配置
//     titleInfo: '标题',
//     descInfo: '描述',
//     imgUrls: '图片'
// }