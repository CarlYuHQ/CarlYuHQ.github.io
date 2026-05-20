/*
 * Greedy Navigation
 * Toolbar (clock/theme) sits outside #site-nav — do not subtract its width again.
 * http://codepen.io/lukejacksonn/pen/PwmwWV
 */

var $nav = $("#site-nav");
var $btn = $("#site-nav > button");
var $vlinks = $("#site-nav .visible-links");
var $hlinks = $("#site-nav .hidden-links");

var breaks = [];
var MAX_NAV_ITER = 30;

function getAvailableSpace() {
  var navW = $nav.width() || 0;
  var btnW = $btn.hasClass("hidden") ? 0 : $btn.outerWidth(true) || 0;
  return Math.max(160, navW - btnW - 16);
}

function getVisibleLinksWidth() {
  var el = $vlinks[0];
  if (!el) return 0;
  return Math.max(el.scrollWidth, $vlinks.outerWidth(true) || 0);
}

function restoreAllLinks() {
  if ($hlinks.children().length) {
    $hlinks.children().appendTo($vlinks);
  }
  breaks = [];
}

function updateNav(iter) {
  iter = iter || 0;
  if (iter > MAX_NAV_ITER) {
    restoreAllLinks();
    $btn.addClass("hidden");
    $hlinks.addClass("hidden");
    return;
  }

  if ($vlinks.children().length === 0 && $hlinks.children().length > 0) {
    restoreAllLinks();
  }

  var availableSpace = getAvailableSpace();
  var vWidth = getVisibleLinksWidth();
  var vCount = $vlinks.children().length;
  var changed = false;

  if (vWidth > availableSpace && vCount > 1) {
    breaks.push(vWidth);
    $vlinks.children().last().prependTo($hlinks);
    $btn.removeClass("hidden");
    $hlinks.removeClass("hidden");
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

  if (changed) {
    updateNav(iter + 1);
  }
}

function scheduleUpdateNav() {
  window.requestAnimationFrame(function () {
    updateNav(0);
  });
}

$(window).on("resize", function () {
  scheduleUpdateNav();
});

$btn.on("click", function () {
  $hlinks.toggleClass("hidden");
  $(this).toggleClass("close");
});

$(function () {
  restoreAllLinks();
  $btn.addClass("hidden");
  $hlinks.addClass("hidden");
  scheduleUpdateNav();
  setTimeout(scheduleUpdateNav, 150);
});
