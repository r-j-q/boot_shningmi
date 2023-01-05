
// 导航栏技术服务点击显示隐藏

 
    $('.technicalservice').click(()=>{
    $('.technicalservicelist').show()
})
$('.technicalservicelist').mouseover(()=>{
    $('.technicalservicelist').show()
})
$('.technicalservicelist li').mouseout(()=>{
    $('.technicalservicelist').hide()
})
 
// 培训学院，线下培训
$('.technicalservice_pxxy').click(()=>{
    $('.technicalservicelist_pxxy').show()
})
$('.technicalservicelist_pxxy').mouseover(()=>{
    $('.technicalservicelist_pxxy').show()
})
$('.technicalservicelist_pxxy li').mouseout(()=>{
    $('.technicalservicelist_pxxy').hide()
})
 