(function () {
  "use strict";

  var WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  var MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

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

    function tick() {
      var now = new Date();
      if (weekdayEl) weekdayEl.textContent = WEEKDAYS[now.getDay()];
      if (monthdayEl) {
        monthdayEl.textContent =
          MONTHS[now.getMonth()] + " " + now.getDate();
      }
      if (hourEl) hourEl.textContent = pad(now.getHours());
      if (minEl) minEl.textContent = pad(now.getMinutes());
    }

    tick();
    setInterval(tick, 1000);
  }

  function initTypewriters() {
    var nodes = document.querySelectorAll("[data-ac-typewriter]");
    if (!nodes.length) return;

    function run(el, onComplete) {
      var text = el.getAttribute("data-ac-text") || el.textContent.trim();
      var speed = parseInt(el.getAttribute("data-ac-speed") || "42", 10);
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

  function isBlogsPath(pathname) {
    var path = (pathname || "").replace(/\/+$/, "") || "/";
    return /\/Blogs$/i.test(path) || /\/hiddenBlogs$/i.test(path);
  }

  function applyLoadingMask(overlay, radius, originX, originY) {
    var mask =
      "radial-gradient(circle at " +
      originX +
      "px " +
      originY +
      "px, transparent " +
      radius +
      "px, black " +
      (radius + 1) +
      "px)";
    overlay.style.webkitMaskImage = mask;
    overlay.style.maskImage = mask;
  }

  function initBlogsLoading() {
    var overlay = document.getElementById("ac-blogs-loading");
    if (!overlay) return;
    if (!isBlogsPath(window.location.pathname)) {
      overlay.classList.add("is-hidden");
      return;
    }

    document.body.classList.add("ac-blogs-loading-active");

    var originX = 0;
    var originY = 0;

    function updateOrigin() {
      var rect = overlay.getBoundingClientRect();
      originX = rect.width * 0.88;
      originY = rect.height * 0.88;
      applyLoadingMask(overlay, 0, originX, originY);
    }

    updateOrigin();
    window.addEventListener("resize", updateOrigin);

    var closing = false;

    function dismiss() {
      if (closing || overlay.classList.contains("is-hidden")) return;
      closing = true;
      overlay.classList.add("is-closing");

      var rect = overlay.getBoundingClientRect();
      originX = rect.width * 0.88;
      originY = rect.height * 0.88;
      var finalR = Math.ceil(Math.hypot(rect.width, rect.height) / 2) + 80;
      var duration = Math.max(0.6, finalR / 900);
      var start = performance.now();

      function frame(now) {
        var t = Math.min(1, (now - start) / (duration * 1000));
        var r = t * finalR;
        applyLoadingMask(overlay, r, originX, originY);
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          overlay.classList.add("is-hidden");
          document.body.classList.remove("ac-blogs-loading-active");
        }
      }

      requestAnimationFrame(frame);
    }

    overlay.addEventListener("click", dismiss);
    overlay.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    });
  }

  function markBlogsLinks() {
    document.addEventListener(
      "click",
      function (e) {
        var link = e.target.closest && e.target.closest("a[href]");
        if (!link) return;
        try {
          var url = new URL(link.href, window.location.origin);
          if (isBlogsPath(url.pathname)) {
            sessionStorage.removeItem("ac-blogs-loading-dismissed");
          }
        } catch (err) {
          /* ignore malformed href */
        }
      },
      true
    );
  }

  var bannerSpecs = [
    { selector: ".ac-banner-frame--header", ratio: 122 / 2400, floor: 40 },
    { selector: ".ac-banner-frame--footer", ratio: 327 / 2400, floor: 72 },
  ];

  function syncBannerFrameHeights() {
    bannerSpecs.forEach(function (spec) {
      document.querySelectorAll(spec.selector).forEach(function (frame) {
        var w = frame.offsetWidth;
        if (!w) return;
        var h = Math.ceil(Math.max(spec.floor, w * spec.ratio));
        frame.style.minHeight = h + "px";
      });
    });
  }

  function initPageBanners() {
    document.querySelectorAll(".theme-banner").forEach(function (img) {
      if (!img.getAttribute("src") && img.getAttribute("data-light-src")) {
        img.src = img.getAttribute("data-light-src");
      }
      img.loading = "eager";
      if (img.complete && img.naturalWidth === 0) {
        var fallback = img.getAttribute("data-light-src");
        if (fallback) img.src = fallback;
      }
    });

    syncBannerFrameHeights();

    if (!window._acBannerResizeBound) {
      window._acBannerResizeBound = true;
      window.addEventListener("resize", syncBannerFrameHeights, { passive: true });
      if (window.visualViewport) {
        window.visualViewport.addEventListener(
          "resize",
          syncBannerFrameHeights,
          { passive: true }
        );
      }
      if (typeof ResizeObserver !== "undefined") {
        document.querySelectorAll(".ac-banner-frame").forEach(function (frame) {
          new ResizeObserver(syncBannerFrameHeights).observe(frame);
        });
      }
    }

    if (typeof window.applyAcTheme === "function") {
      var theme =
        document.documentElement.getAttribute("data-theme") || "nord";
      window.applyAcTheme(theme);
    }
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
    markBlogsLinks();
    initBlogsLoading();
    initPageBanners();
  });
})();
