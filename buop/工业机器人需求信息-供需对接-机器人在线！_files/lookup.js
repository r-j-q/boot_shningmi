$(function () {
  $(".lookup_A").click(function () {
    $(".brand_left—a").show();
  });
  var look = $(".lookup_A").val();
  $(".list_cont li a").click(function () {
    var vala = $(this).text();
    $(".lookup_A").val(vala);
    $(".brand_left—a").hide();

  });
  $(".clasbox_jcspa").mouseleave(function () {
    $(".brand_left—a").hide();
  })



})