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

  function initPageBanners() {
    document.querySelectorAll(".theme-ribbon, .theme-banner").forEach(function (img) {
      if (!img.getAttribute("src") && img.getAttribute("data-light-src")) {
        img.src = img.getAttribute("data-light-src");
      }
      img.loading = "eager";
      img.style.removeProperty("min-height");
      if (img.complete && img.naturalWidth === 0) {
        var fallback = img.getAttribute("data-light-src");
        if (fallback) img.src = fallback;
      }
    });

    function enforceRibbonVisibility() {
      document
        .querySelectorAll(".theme-ribbon, .theme-banner, .ac-ribbon, .ac-banner")
        .forEach(function (img) {
          var wrap = img.closest(".ac-ribbon-wrap, .ac-banner-wrap");
          var width = img.clientWidth || (wrap && wrap.clientWidth) || 0;
          if (!width) return;
          var attrW = parseFloat(img.getAttribute("width")) || 2400;
          var attrH = parseFloat(img.getAttribute("height")) || 327;
          var floor = attrH <= 130 ? 40 : 72;
          var expected = Math.max(floor, Math.round((width * attrH) / attrW));
          var rendered = Math.round(img.getBoundingClientRect().height || 0);

          // 某些缩放档位渲染高度会掉到 0/1px，强制写入高度兜底
          if (rendered <= 1) {
            img.style.height = expected + "px";
            img.style.width = "100%";
          } else if (img.style.height) {
            img.style.removeProperty("height");
          }
        });
    }

    enforceRibbonVisibility();

    if (!window._acRibbonWatchBound) {
      window._acRibbonWatchBound = true;
      var rafId = 0;
      var scheduleCheck = function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(enforceRibbonVisibility);
      };
      window.addEventListener("resize", scheduleCheck, { passive: true });
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", scheduleCheck, {
          passive: true,
        });
      }
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) scheduleCheck();
      });
    }

    if (typeof window.applyAcTheme === "function") {
      var theme =
        document.documentElement.getAttribute("data-theme") || "nord";
      window.applyAcTheme(theme);
    }
  }

  function routineDateKey(date) {
    var now = date || new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, "0");
    var d = String(now.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function parseDateKey(key) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || "");
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function initRoutinePanel() {
    var payload = document.getElementById("ac-routine-data");
    if (!payload) return;

    var data = null;
    try {
      data = JSON.parse(payload.textContent || "{}");
    } catch (e) {
      return;
    }
    if (!data || !Array.isArray(data.tasks)) return;

    var today = routineDateKey();
    var todayDate = parseDateKey(today) || new Date();
    var dayLog = (data.log && data.log[today]) || {};
    var doneCount = 0;
    var totalTasks = data.tasks.length || 1;

    var dateEl = document.querySelector("[data-ac-routine-date]");
    if (dateEl) dateEl.textContent = today;

    document.querySelectorAll("[data-ac-routine-item]").forEach(function (item) {
      var taskId = item.getAttribute("data-task-id");
      var entry = dayLog[taskId] || { done: false };
      var isDone = !!entry.done;
      if (isDone) doneCount += 1;

      item.classList.toggle("is-done", isDone);

      var statusEl = item.querySelector("[data-ac-routine-status]");
      if (statusEl) statusEl.textContent = isDone ? "已完成" : "待完成";

      var extraEl = item.querySelector("[data-ac-routine-extra]");
      if (extraEl) {
        if (taskId === "leetcode" && entry.count) {
          extraEl.hidden = false;
          extraEl.textContent = "+" + entry.count + " 题";
        } else {
          extraEl.hidden = true;
          extraEl.textContent = "";
        }
      }
    });

    var progressEl = document.querySelector("[data-ac-routine-progress]");
    if (progressEl) progressEl.textContent = doneCount + "/" + totalTasks;

    var streak = data.meta && data.meta.leetcode_streak ? data.meta.leetcode_streak : 0;
    var streakEl = document.querySelector("[data-ac-routine-streak]");
    if (streakEl) streakEl.textContent = "LeetCode streak: " + streak + " days";

    function dayDoneCount(day) {
      var n = 0;
      data.tasks.forEach(function (task) {
        if (day[task.id] && day[task.id].done) n += 1;
      });
      return n;
    }

    var recent = [];
    var sumDone30 = 0;
    var activeDays30 = 0;
    for (var i = 29; i >= 0; i--) {
      var d = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - i);
      var key = routineDateKey(d);
      var day = (data.log && data.log[key]) || {};
      var done = dayDoneCount(day);
      var pct = done / totalTasks;
      if (done > 0) activeDays30 += 1;
      sumDone30 += done;
      recent.push({ key: key, pct: pct });
    }

    var monthDays = todayDate.getDate();
    var monthDoneSum = 0;
    var monthTaskDoneDays = {};
    var monthLeetCount = 0;
    data.tasks.forEach(function (t) {
      monthTaskDoneDays[t.id] = 0;
    });

    for (var dayIdx = 1; dayIdx <= monthDays; dayIdx++) {
      var md = new Date(todayDate.getFullYear(), todayDate.getMonth(), dayIdx);
      var mKey = routineDateKey(md);
      var mLog = (data.log && data.log[mKey]) || {};
      monthDoneSum += dayDoneCount(mLog);
      data.tasks.forEach(function (t) {
        if (mLog[t.id] && mLog[t.id].done) monthTaskDoneDays[t.id] += 1;
      });
      if (mLog.leetcode && mLog.leetcode.count) {
        monthLeetCount += Number(mLog.leetcode.count) || 0;
      }
    }

    function percentText(num, den) {
      if (!den) return "0%";
      return ((num / den) * 100).toFixed(1) + "%";
    }

    var stat30Rate = document.querySelector("[data-ac-stat-30rate]");
    if (stat30Rate) stat30Rate.textContent = percentText(sumDone30, 30 * totalTasks);
    var stat30Detail = document.querySelector("[data-ac-stat-30detail]");
    if (stat30Detail) stat30Detail.textContent = sumDone30 + "/" + 30 * totalTasks;
    var stat30Days = document.querySelector("[data-ac-stat-30days]");
    if (stat30Days) stat30Days.textContent = activeDays30 + " 天";
    var stat30DaysDetail = document.querySelector("[data-ac-stat-30days-detail]");
    if (stat30DaysDetail) stat30DaysDetail.textContent = activeDays30 + "/30 天";
    var statMonthRate = document.querySelector("[data-ac-stat-month-rate]");
    if (statMonthRate) statMonthRate.textContent = percentText(monthDoneSum, monthDays * totalTasks);
    var statMonthDetail = document.querySelector("[data-ac-stat-month-detail]");
    if (statMonthDetail) statMonthDetail.textContent = monthDoneSum + "/" + monthDays * totalTasks;

    var monthList = document.querySelector("[data-ac-routine-month-list]");
    if (monthList) {
      monthList.innerHTML = "";
      data.tasks.forEach(function (task) {
        var item = document.createElement("div");
        item.className = "ac-routine-month-item";
        var extra = "";
        if (task.id === "leetcode") extra = "，共 " + monthLeetCount + " 题";
        item.textContent =
          task.emoji +
          " " +
          task.label +
          "：完成 " +
          monthTaskDoneDays[task.id] +
          "/" +
          monthDays +
          " 天" +
          extra;
        monthList.appendChild(item);
      });
    }

    var chart = document.querySelector("[data-ac-routine-chart]");
    if (chart) {
      chart.innerHTML = "";
      recent.forEach(function (it) {
        var bar = document.createElement("span");
        var h = Math.max(2, Math.round(it.pct * 100));
        bar.className = "ac-routine-chart__bar";
        bar.style.height = h + "%";
        bar.title = it.key + " 完成率 " + (it.pct * 100).toFixed(0) + "%";
        chart.appendChild(bar);
      });
    }

    var toggle = document.querySelector("[data-ac-routine-stats-toggle]");
    var statsPanel = document.querySelector("[data-ac-routine-stats]");
    if (toggle && statsPanel) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
        toggle.textContent = expanded ? "查看统计" : "收起统计";
        statsPanel.hidden = expanded;
      });
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
    initRoutinePanel();
  });
})();
