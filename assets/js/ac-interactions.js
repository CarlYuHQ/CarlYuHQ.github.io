(function () {
  "use strict";

  var WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function initTime() {
    var root = document.querySelector("[data-ac-time]");
    if (!root) return;

    var weekdayEl = root.querySelector("[data-ac-weekday]");
    var monthdayEl = root.querySelector("[data-ac-monthday]");
    var hourEl = root.querySelector("[data-ac-hour]");
    var minEl = root.querySelector("[data-ac-min]");
    var secEl = root.querySelector("[data-ac-sec]");

    function tick() {
      var now = new Date();
      if (weekdayEl) weekdayEl.textContent = WEEKDAYS[now.getDay()];
      if (monthdayEl) {
        monthdayEl.textContent = now.getMonth() + 1 + "/" + now.getDate();
      }
      if (hourEl) hourEl.textContent = pad(now.getHours());
      if (minEl) minEl.textContent = pad(now.getMinutes());
      if (secEl) secEl.textContent = pad(now.getSeconds());
    }

    tick();
    setInterval(tick, 1000);
  }

  function initTypewriters() {
    var nodes = document.querySelectorAll("[data-ac-typewriter]");
    if (!nodes.length) return;

    var speedDefault = 75;

    function run(el, onComplete) {
      var text = el.getAttribute("data-ac-text") || el.textContent.trim();
      var speed = parseInt(el.getAttribute("data-ac-speed") || speedDefault, 10);
      var delay = parseInt(el.getAttribute("data-ac-delay") || "0", 10);

      el.textContent = "";
      el.classList.add("is-typing");

      setTimeout(function () {
        var i = 0;
        var timer = setInterval(function () {
          el.textContent = text.slice(0, i + 1);
          i += 1;
          if (i >= text.length) {
            clearInterval(timer);
            el.classList.remove("is-typing");
            el.classList.add("is-done");
            if (onComplete) onComplete();
          }
        }, speed);
      }, delay);
    }

    var list = Array.prototype.slice.call(nodes);
    (function chain(idx) {
      if (idx >= list.length) return;
      run(list[idx], function () {
        chain(idx + 1);
      });
    })(0);
  }

  function isBlogsPage() {
    var path = (window.location.pathname || "").replace(/\/+$/, "");
    return /\/Blogs$/i.test(path) || /\/hiddenBlogs$/i.test(path);
  }

  function initBlogsLoading() {
    var overlay = document.getElementById("ac-blogs-loading");
    if (!overlay || !isBlogsPage()) return;

    var dismissed = sessionStorage.getItem("ac-blogs-loading-dismissed");
    if (dismissed === "1") {
      overlay.classList.add("is-hidden");
      return;
    }

    var container = overlay;
    var hint = overlay.querySelector(".ac-loading-hint");

    function dismiss() {
      if (container.classList.contains("is-closing")) return;
      if (hint) hint.style.opacity = "0";

      var rect = container.getBoundingClientRect();
      var finalR = Math.ceil(Math.hypot(rect.width, rect.height) / 2) + 50;
      var duration = Math.max(0.35, finalR / 1200);

      container.classList.add("is-closing");
      container.style.transition = "--ac-mask-r " + duration + "s linear";
      container.style.setProperty("--ac-mask-r", "0px");
      void container.offsetHeight;
      container.style.setProperty("--ac-mask-r", finalR + "px");

      setTimeout(function () {
        container.classList.add("is-hidden");
        sessionStorage.setItem("ac-blogs-loading-dismissed", "1");
      }, duration * 1000 + 80);
    }

    overlay.addEventListener("click", dismiss);
    overlay.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") dismiss();
    });
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    initTime();
    initTypewriters();
    initBlogsLoading();
  });
})();
