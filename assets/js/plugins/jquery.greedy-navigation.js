/*
 * Greedy Navigation (with masthead clock safe guards)
 * http://codepen.io/lukejacksonn/pen/PwmwWV
 */

var $nav = $("#site-nav");
var $btn = $("#site-nav > button");
var $vlinks = $("#site-nav .visible-links");
var $hlinks = $("#site-nav .hidden-links");

var breaks = [];
var MAX_NAV_ITER = 40;
var CLOCK_RESERVE_PX = 150;

function getAvailableSpace() {
  var navW = $nav.width() || 0;
  var reserve = $(".masthead__clock").length ? CLOCK_RESERVE_PX : 0;
  var btnW = $btn.hasClass("hidden") ? 0 : $btn.outerWidth(true) || 0;
  return Math.max(120, navW - btnW - 30 - reserve);
}

function recoverNavIfEmpty() {
  if ($vlinks.children().length === 0 && $hlinks.children().length > 0) {
    $hlinks.children().appendTo($vlinks);
    breaks = [];
    $btn.addClass("hidden");
    $hlinks.addClass("hidden");
    return true;
  }
  return false;
}

function updateNav(iter) {
  iter = iter || 0;
  if (iter > MAX_NAV_ITER) {
    recoverNavIfEmpty();
    return;
  }

  if (recoverNavIfEmpty()) {
    return;
  }

  var availableSpace = getAvailableSpace();
  var vWidth = $vlinks.width() || 0;
  var vCount = $vlinks.children().length;
  var changed = false;

  if (vWidth > availableSpace && vCount > 1) {
    breaks.push(vWidth);
    $vlinks.children().last().prependTo($hlinks);
    $btn.removeClass("hidden");
    changed = true;
  } else if (
    breaks.length > 0 &&
    $hlinks.children().length > 0 &&
    availableSpace > breaks[breaks.length - 1]
  ) {
    $hlinks.children().first().appendTo($vlinks);
    breaks.pop();
    if (breaks.length < 1) {
      $btn.addClass("hidden");
      $hlinks.addClass("hidden");
    }
    changed = true;
  } else if (breaks.length < 1) {
    $btn.addClass("hidden");
    $hlinks.addClass("hidden");
  }

  $btn.attr("count", breaks.length);

  if (!changed) {
    return;
  }

  updateNav(iter + 1);
}

$(window).on("resize", function () {
  updateNav(0);
});

$btn.on("click", function () {
  $hlinks.toggleClass("hidden");
  $(this).toggleClass("close");
});

$(function () {
  recoverNavIfEmpty();
  updateNav(0);
});
