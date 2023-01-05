var Merchant = {
    href: '',
    data_href: $('#province .merchantTab').attr('data-href'),
    SHnum: function (key) {
        return MerchantDisk[100000][key];
    },
    Sinum: function (key, cityKey) {
        return MerchantDisk[key][cityKey];
    },
    Province: function ($href) {
        Merchant.href = $href;
        var provinceItem = '';
        var provinceValue = $('#province .merchantTab').attr('data-value');
        for (key in MerchantDisk[100000]) {
            // 循环省
            provinceItem += '<li><a href="' + Merchant.href + this.SHnum(key) + '-0-' + this.data_href + '">' + MerchantDisk[100000][key] + '</a></li>';
            if (provinceValue === MerchantDisk[100000][key]) {
                Merchant.city(key);
            }
        }
        $('#province ul').html('<li><a href="' + Merchant.href + '0-0-' + this.data_href + '">' + '不限</a></li>' + provinceItem);
    },
    city: function (key) {
        var cityItem = '';
        for (cityKey in MerchantDisk[key]) {
            cityItem += '<li><a href="' + Merchant.href + this.SHnum(key) + '-' + this.Sinum(key, cityKey) + '-' + this.data_href + '">' + MerchantDisk[key][cityKey] + '</a></li>';
        }
        $('#city ul').html('<li><a href="' + Merchant.href +  '0-0-' + this.data_href + '">' + '不限</a></li>' + cityItem);
    },
    application: function (obj) {
        var cityItem = '';
        var dataValue = 0;
        var area = $('#province .merchantTab').data('value')+'-'+$('#city .merchantTab').data('value');
        var dahref = $('#province .merchantTab').data('href');
        var href = dahref.slice(dahref.indexOf('-'));
        if (obj) {
            dataValue = obj["id"];
            var arr = obj['children'];
            for (let index = 0; index < arr.length; index++) {
                cityItem += '<a href="' + area + '-' + arr[index]["id"] + href + '">' + arr[index]["name"] + '</a>';
            }
        }
        $('.classification_fix_buop .clasbo_type').html('<a href="' + area+'-' + dataValue + href + '">不限</a>' + cityItem);
    }
}
$(function() {
    $('.merchantDisk .merchantDisk-box').on('mouseover mouseout', function(event) {
        var $ul = $(this).find('ul');
        /*鼠标显示隐藏 */
        if (event.type == "mouseover" && $ul.find('li').length>0) {
             $ul.show().parent().siblings().find('ul').hide();
        } else if (event.type == "mouseout") {
            $('.merchantDisk ul').hide();
        }
    });
    if ($(window).width() <= 768) {
        //移除flex
        $('.packTopText ul').removeClass('flex');
    }
    if (ST.isMobile()) {
        $('.classification_fix_buop .clasbox_left').on('click',function(){
            var $this = $(this);
            var classification_fix_buop = $this.parents('.classification_fix_buop');
            $this.parents('.classi_list').addClass('cshow').siblings('.classi_list').removeClass('cshow');
            if (classification_fix_buop.find('.bg').length===0) {
                $this.parents('.classification_fix_buop').append('<div class="bg"><div>');
            }
            classification_fix_buop.on('click','.bg',function(){
                $(this).remove();
                $this.parents('.classi_list').removeClass('cshow');
            });
        });
        
        $('.classification_fix_buop .disk-province').on('click', 'a', function (e) {
            var $this = $(this);
            var provinceValue = $this.text().trim();
            var cKey = 0;
            if (provinceValue !='不限') {
                e.preventDefault();
                $this.addClass('cur').parent().siblings().find('a').removeClass('cur');
                $(this).parents('.clasbox_right').scrollTop(0);
                // 地域选择
                for (cKey in MerchantDisk[100000]) {
                    if (provinceValue == MerchantDisk[100000][cKey]) {
                        Merchant.city(cKey); // 循环市区
                    } else if (provinceValue == 0) {
                        Merchant.city(0); // 不限
                        return false;
                    }
                }
            }
        });
        $('.classification_fix_buop .clasbox_application .clasbox_application_l a').on('click', function (e) {
            var $this = $(this);
            var $value = $this.data('value');
            var application = get_application();
            if ($value!=0) {
                e.preventDefault();
                $this.addClass('cur').siblings().removeClass('cur');
                for (let i = 0; i < application.length; i++) {
                    if ($value == application[i]['id']) {
                        Merchant.application(application[i]); // 循环二级应用
                    } else if ($value == 0) {
                        Merchant.application(0); // 不限
                        return false;
                    }
                }
            }
        });
    }
   
});