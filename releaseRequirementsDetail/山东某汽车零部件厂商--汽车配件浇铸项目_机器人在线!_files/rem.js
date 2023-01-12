(function(doc, win) {
    var docEl = doc.documentElement,
        isIOS = navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
        dpr = isIOS ? Math.min(win.devicePixelRatio, 3) : 1,
        dpr = window.top === window.self ? dpr : 1, //被iframe引用时，禁止缩放
        dpr = 1,
        scale = 1 / dpr,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    docEl.dataset.dpr = dpr;
    var metaEl = doc.createElement('meta');
    metaEl.name = 'viewport';
    metaEl.content = 'initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale;
    docEl.firstElementChild.appendChild(metaEl);
    var recalc = function() {
        var width = docEl.clientWidth;
        // if (width / dpr > 1920) {
        //     width = 1920 * dpr;
        // }
        // 乘以100，px : rem = 100 : 1
        if (width / dpr <= 750) {
            docEl.style.setProperty("font-size", 100  *  (width  / 750)  +  "px", "important");
            return;
        }
        docEl.style.setProperty("font-size", 100  *  (width  / 1920)  +  "px", "important");
    };
    recalc()
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
})(document, window);

// 新窗口打开方法
function openWin(url, jump, iWidth, iHeight) {
    //获得窗口的垂直位置 
    let iTop = (window.screen.availHeight - 30 - iHeight) / 2;
    //获得窗口的水平位置 
    let iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
    // 新建窗口打开方式
    window.open(url, jump, 'height=' + iHeight + ',innerHeight=' + iHeight + ',width=' + iWidth + ',innerWidth=' + iWidth + ',top=' + iTop + ',left=' + iLeft + ',status=no,toolbar=no,menubar=no,location=no,resizable=no,scrollbars=0,titlebar=no');
}

// 滚动动画封装
function ani(claname, type1, type2) {
    if (($("." + claname).offset().top - $(window).scrollTop()) < $(window).height()) {
        $("." + claname).children("div").eq(0).addClass(type1);
        $("." + claname).children("div").eq(1).addClass(type2);
    }
    $(window).scroll(function() {
        if (($("." + claname).offset().top - $(window).scrollTop()) < $(window).height()) {
            $("." + claname).children("div").eq(0).addClass(type1);
            $("." + claname).children("div").eq(1).addClass(type2);
        };
    });

};

// animated 动画封装
function an(claname, upclass) {
    // 添加class动画
    $("." + claname).eq(0).addClass(upclass);

    // 定时删除
    setTimeout(function() {
        $("." + claname).eq(0).removeClass(upclass);
    }, 1000);
};