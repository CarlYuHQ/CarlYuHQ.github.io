/**
 * Back-to-top button (Animal Crossing style)
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("ac-back-to-top");
    if (!btn) return;

    var showAfter = 280;

    function toggle() {
      if (window.scrollY > showAfter) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
    }

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  });
})();
