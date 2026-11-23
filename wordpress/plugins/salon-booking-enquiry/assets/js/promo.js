/**
 * Promo modal (replaces Elementor Pro Popups). Native <dialog> + showModal(): focus is trapped,
 * the page behind is inert and Esc closes it. Opens after a delay or on desktop exit intent,
 * whichever comes first, at most once per `frequency-days` per visitor (localStorage).
 */
(function () {
  "use strict";

  var dialog = document.querySelector("[data-sbe-promo]");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var id = dialog.getAttribute("data-promo-id") || "promo";
  var delay = Math.max(0, parseInt(dialog.getAttribute("data-delay") || "8", 10)) * 1000;
  var days = Math.max(0, parseInt(dialog.getAttribute("data-frequency-days") || "7", 10));
  var exitIntent = dialog.getAttribute("data-exit-intent") === "true";
  var key = "sbe_promo:" + id;
  var opener = null;
  var shown = false;

  function track(event, extra) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(
      Object.assign(
        {
          event: event,
          promo_id: id,
          promo_type: "modal",
          site_platform: dialog.getAttribute("data-platform") || "wordpress",
        },
        extra,
      ),
    );
  }

  /** Frequency cap. Storage can throw (private mode, blocked cookies): then show once per page view. */
  function cappedNow() {
    if (days === 0) return false;
    try {
      var last = parseInt(window.localStorage.getItem(key) || "0", 10);
      return last > 0 && Date.now() - last < days * 864e5;
    } catch {
      return false;
    }
  }

  function remember() {
    try {
      window.localStorage.setItem(key, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  function open(trigger) {
    if (shown || cappedNow()) return;
    // Never stack on another open dialog (e.g. the theme's mobile menu) or interrupt typing.
    if (document.querySelector("dialog[open]")) return;
    var active = document.activeElement;
    if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return;

    shown = true;
    opener = active instanceof HTMLElement ? active : null;
    remember();
    dialog.showModal();
    track("promo_view", { trigger: trigger });
    cleanup();
  }

  function close(reason) {
    if (!dialog.open) return;
    dialog.close(reason);
  }

  dialog.addEventListener("close", function () {
    if (dialog.returnValue !== "cta") track("promo_dismiss", {});
    if (opener && document.contains(opener)) opener.focus();
  });

  dialog.querySelectorAll("[data-sbe-promo-dismiss]").forEach(function (button) {
    button.addEventListener("click", function () {
      close("dismiss");
    });
  });

  var cta = dialog.querySelector("[data-sbe-promo-cta]");
  if (cta) {
    cta.addEventListener("click", function () {
      track("promo_click", {});
      dialog.returnValue = "cta";
    });
  }

  // Click on the backdrop (the dialog element itself, outside the panel) closes it.
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close("dismiss");
  });

  if (cappedNow()) return;

  var timer = window.setTimeout(function () {
    open("delay");
  }, delay);

  function onLeave(e) {
    if (e.clientY <= 0 && !e.relatedTarget) open("exit_intent");
  }

  var desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (exitIntent && desktopPointer) document.addEventListener("mouseout", onLeave);

  function cleanup() {
    window.clearTimeout(timer);
    document.removeEventListener("mouseout", onLeave);
  }
})();
