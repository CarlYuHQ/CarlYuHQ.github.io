/*
 * Keep all masthead links visible (greedy overflow disabled).
 */
$(function () {
  var $vlinks = $("#site-nav .visible-links");
  var $hlinks = $("#site-nav .hidden-links");

  if ($hlinks.length && $hlinks.children().length) {
    $hlinks.children().appendTo($vlinks);
  }
});
