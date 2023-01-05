function getArticle(data) {
    ST.request('/news/getList', data, function(error, data) {
        if (!error) {
            var text = '',
                list = data.list,
                len = list.length;

            for (var i = 0; i < len; i++) {
                text += '<li class="ani">';
                if (list[i].file_url) {
                    text += '<div class="img col-md-3 col-xs-4"> <a href="/news/detail/' + list[i].article_id + '" target="_blank"> <img src="https://image.imrobotic.com/jiqiren/images/grey.gif?x-oss-process=image/resize,m_pad,w_210,h_140,limit_0,color_f1f1f1" data-src="https://image.imrobotic.com/' + list[i].file_url + '?x-oss-process=image/resize,limit_0,m_fixed,w_420,h_280" /> </a> ';
                    if (list[i].original == 1) {
                        text += '<span class="yuanchuang ">原创</span>';
                    }
                    text += '</div> ';
                    text += '<div class="col-md-9 col-xs-8">';
                } else {
                    text += '<div class="col-md-12 col-xs-12">';
                }


                text += ' <a href="/news/detail/' + list[i].article_id + '" target="_blank"> <h3>' + list[i].title + '</h3>  <div class="news_list_text">' + list[i].description + ' </div></a> <div class="f-12 c666 news_time clearfix"> <div class="f_l news_time"> ';

                var tagArr = list[i].keywords,
                    tagLen = tagArr.length;

                if (list[i].original == 1) {
                    text += ' <span class="mar_r30 hidden-xs">' + '<span class="iconfont icon-yuanchuang f-22"></span>原创</span>';
                }
                if (tagLen > 0) {
                    text += '<span class="hidden-xs  f_r">关键字： ';
                    for (var j in tagArr) {
                        text += '<a href="/news/tag/' + tagArr[j] + '">' + tagArr[j] + '</a> &nbsp;';
                    }
                    text += '</span>';
                }

                text += '<span class="mar_r30 yue_num"><span class="iconfont icon-shijian1 f-14 hidden-xs"></span><span class="hidden-lg hidden-md">时间：</span>' + list[i].add_time + '</span>   <span  value="' + list[i].article_id + '" class="num_time" ><span class="iconfont icon-yueduliang f-16 hidden-xs"></span><span class="hidden-lg hidden-md">阅读数：</span> ' + list[i].views + ' </span> </div> </div> </li>';
            }

            $('.news_show_list > ul').append(text);
            ST.lazyload(); // 懒加载
        } else {
            $('.news_loading_box').remove();
            layer.msg('没有更多数据了');
        }
    });
}
$(function() {
    //修复后台富文本多图片之间的间距问题
    $(".editor-box p img").parents("p").css({ "margin": "0" });
    var news_ad_swiper = new Swiper('.news_ad_swiper ', {
        // 焦点图
        autoplay: 5000,
        paginationClickable: true,
        spaceBetween: 10,
        pagination: '.swiper-pagination',
    });

    $.zqTab(".relevant_title li", ".relevant_text .relevant_text_item", "cur", "click");
    $.zqTab(".hot_news span", ".hot_news_text ul", "cur", "click");
    if ($('.wx_text_info video').eq(0).length > 0) {
        $('.video_area').html(` <div class="video-play text-center f-12">
            <img src="/static/news/img/play.png" data-io="资讯页-点击视频快捷播放" class="video-playImg" alt="">
                <div class="f-16 mar_b5 text-left">内含视频，点击直接观看</div> 
                <div class="row h10">
                    <span class="quanquan"></span>
                    <span class="col-md-1 col-xs-2 pad_0">00:00</span>
                    <div class="progress col-md-10 col-xs-8 pad_0"></div>
                <span class="col-md-1 col-xs-2 pad_0 video_time"></span>
            </div>
        </div>`);
        var $video_one = $('.wx_text_info video').eq(0);

        $('.video-playImg').on('click', function() {
            //视频点击全屏播放
            layer.open({
                type: 1,
                title: '播放视频',
                skin: 'new-layer-video',
                area: ST.isMobile() ? '100%' : '1000px', //宽高
                content: $video_one,
                success: function() {
                    var $newVideo = $('.new-layer-video video')[0];
                    $newVideo.preload = "preload";
                    $newVideo.play();
                },
                cancel: function() {
                    $('video')[0].pause();
                }
            });
        });


        //获取第一个视频的时长
        var i = setInterval(function() {
            if ($video_one.readyState > 0) {
                var minutes = parseInt(video_one.duration / 60, 10);
                var seconds = parseInt(video_one.duration % 60);
                $('.video_time').html(minutes + ':' + seconds)
                    // (Put the minutes and seconds in the display)
                clearInterval(i);
            }
        }, 200);
    }
    //关注我们

    $('.guanzhu').on('click', function() {
        layer.open({
            type: 2,
            title: false,
            area: ['420px', '300px'], //宽高
            skin: "gz",
            content: ['/about/followus', 'no'],
            closeBtn: 0,
            shadeClose: true
        });
    });

    //点赞
    $dianzan = `<div class="  c666 text-center">
            <div class="pad_25 dz_top" >
            <i class="iconfont  icon-dianzan1" style="font-size: 1.4rem;color:#fff"></i>
            </div>
            <div class="pad_lr20 text-center">
            <p class="mar_t15 f-18 ">谢谢！您的鼓励</p>
            <p class="f-14">有您支持，我们会更加努力创作更好内容</p>
            </div>
        </div>`;

    $('body').one('click', '.praise_zan', function() {
        $this = $(this);
        ST.request('/news/favour', {
            id: $this.attr('value')
        }, function(error, data) {
            if (!error) {
                var $num = $('#praiseZanNum');
                $num.text($num.text() * 1 + 1);
                $('.praise_zan').css('background', '#ff4040').addClass('animated tada');
                layer.open({
                    type: 1,
                    title: false,
                    area: ['220px', '220px'], //宽高
                    content: $dianzan,
                    skin: "dz",
                    closeBtn: 0,
                    shadeClose: true,
                    time: "2000",
                    anim: 0
                });
            } else {
                layer.msg('error');
            }
        })
    })
})