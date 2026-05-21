/**
 * Animal Crossing theme toggle (ported from ac-site-template)
 */
(function () {
  "use strict";

  function getBasePath() {
    var base = document.documentElement.getAttribute("data-base") || "";
    if (base && base.slice(-1) !== "/") base += "/";
    return base;
  }

  function applyTheme(theme) {
    var t = theme === "night" ? "night" : "nord";
    document.documentElement.setAttribute("data-theme", t);
    document.body.classList.toggle("ac-theme-night", t === "night");
    localStorage.setItem("theme", t);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", t === "night" ? "#374063" : "#f7f3e7");
    }

    var base = getBasePath();
    document.querySelectorAll(".theme-banner").forEach(function (el) {
      var light = el.getAttribute("data-light-src");
      var dark = el.getAttribute("data-dark-src");
      if (light && dark) {
        el.src = t === "night" ? dark : light;
      }
    });

    var icon = document.getElementById("theme-icon");
    var label = document.getElementById("theme-label");
    if (icon) {
      icon.src =
        t === "night"
          ? base + "images/ac/leaf_light.png"
          : base + "images/ac/leaf_dark.png";
    }
    if (label) {
      label.textContent = t === "night" ? "日间模式" : "夜间模式";
    }
  }

  window.toggleTheme = function () {
    var current =
      document.documentElement.getAttribute("data-theme") || "nord";
    applyTheme(current === "night" ? "nord" : "night");
  };

  window.applyAcTheme = applyTheme;

  document.addEventListener("DOMContentLoaded", function () {
    var stored = localStorage.getItem("theme");
    var initial =
      stored ||
      document.documentElement.getAttribute("data-theme") ||
      "nord";
    applyTheme(initial);
  });
})();
