/**
 * Sable & Shear child theme: header, mobile drawer, sticky booking bar, footer accordions
 * and analytics events. Vanilla JS, no dependencies, loaded with `defer`.
 */
(function () {
  "use strict";

  var desktop = window.matchMedia("(min-width: 1024px)");

  /* ---------------------------------------------------------------- analytics */

  /** Push a GA4 event via GTM's dataLayer (design brief 6.7). Never pushes PII. */
  function track(event, params) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: event, brand: "sable", site_platform: "elementor" };
    Object.keys(params || {}).forEach(function (key) {
      payload[key] = params[key];
    });
    window.dataLayer.push(payload);
  }

  document.addEventListener("click", function (e) {
    var link = e.target instanceof Element ? e.target.closest("a") : null;
    if (!link) return;
    if (link.dataset.contact) {
      track("contact_click", { method: link.dataset.contact, location: link.dataset.location });
    } else if (link.dataset.cta) {
      track("cta_click", {
        cta_id: link.dataset.cta,
        cta_text: link.textContent.trim(),
        position: link.dataset.cta.split("_")[0],
      });
    } else if (link.dataset.brandLink && link.dataset.brandLink !== "sable") {
      track("brand_switch", { from_brand: "sable", to_brand: link.dataset.brandLink });
    }
  });

  /* ------------------------------------------------------------ header state */

  var header = document.querySelector("[data-sable-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------ submenu disclosure buttons */

  /**
   * Turn each parent menu item into link + toggle button (click, not hover; WAI-ARIA
   * disclosure pattern). Used in both the desktop nav and the drawer accordion.
   */
  document.querySelectorAll(".sable-menu .menu-item-has-children").forEach(function (item, i) {
    var link = item.querySelector(":scope > a");
    var submenu = item.querySelector(":scope > .sub-menu");
    if (!link || !submenu) return;
    submenu.id = submenu.id || "sable-submenu-" + i + "-" + Math.random().toString(36).slice(2, 7);
    submenu.hidden = true;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "sable-submenu-toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", submenu.id);
    button.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';
    var label = document.createElement("span");
    label.className = "screen-reader-text";
    label.textContent = link.textContent.trim() + " submenu";
    button.appendChild(label);
    link.after(button);

    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      submenu.hidden = open;
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        button.setAttribute("aria-expanded", "false");
        submenu.hidden = true;
        button.focus();
        e.stopPropagation();
      }
    });
  });

  // Close open desktop submenus when clicking elsewhere.
  document.addEventListener("click", function (e) {
    document
      .querySelectorAll('.sable-menu--header .sable-submenu-toggle[aria-expanded="true"]')
      .forEach(function (button) {
        var item = button.parentElement;
        if (item && !item.contains(e.target)) {
          button.setAttribute("aria-expanded", "false");
          var submenu = document.getElementById(button.getAttribute("aria-controls") || "");
          if (submenu) submenu.hidden = true;
        }
      });
  });

  /* -------------------------------------------------------------- mobile drawer */

  var drawer = document.querySelector("[data-sable-drawer]");
  var opener = document.querySelector("[data-sable-drawer-open]");

  if (drawer && opener && typeof drawer.showModal === "function") {
    var closeDrawer = function () {
      if (!drawer.open) return;
      drawer.classList.remove("is-open");
      var finish = function () {
        drawer.close();
      };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
      } else {
        window.setTimeout(finish, 240);
      }
    };

    opener.addEventListener("click", function () {
      drawer.showModal(); // Native modal: focus trap, inert background, Esc to close.
      opener.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(function () {
        drawer.classList.add("is-open");
      });
    });

    drawer.addEventListener("close", function () {
      drawer.classList.remove("is-open");
      opener.setAttribute("aria-expanded", "false");
      opener.focus(); // Return focus to the menu button.
    });

    // Esc: animate out instead of the instant native close.
    drawer.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeDrawer();
    });

    // Scrim tap: a click whose target is the <dialog> itself landed outside the panel.
    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) closeDrawer();
    });

    drawer.querySelectorAll("[data-sable-drawer-close]").forEach(function (button) {
      button.addEventListener("click", closeDrawer);
    });

    // Close if the viewport grows to desktop while open.
    desktop.addEventListener("change", function (e) {
      if (e.matches) closeDrawer();
    });
  } else if (opener) {
    opener.hidden = true; // Very old browsers: nav stays reachable via the footer links.
  }

  /* ------------------------------------------------------ sticky "Book now" bar */

  /**
   * Shown below 1024px once the hero CTA has scrolled out of view; hidden while the footer or
   * a booking/enquiry form is visible so there is never a duplicate CTA (design brief 4.10).
   */
  var bar = document.querySelector("[data-sable-bookbar]");
  if (bar && "IntersectionObserver" in window) {
    var heroCta =
      document.querySelector("[data-sable-hero-cta], .sable-hero-cta .elementor-button") ||
      document.querySelector("a.sable-hero-cta, button.sable-hero-cta") ||
      document.querySelector(".elementor-widget-button .elementor-button") ||
      document.querySelector("[data-sable-header] .sable-mainbar__cta");
    var blockers = Array.prototype.slice.call(
      document.querySelectorAll("[data-sable-footer], .sbe-form, form[data-booking-form]"),
    );
    var heroVisible = true;
    var blockersVisible = new Set();

    var update = function () {
      var show = !heroVisible && blockersVisible.size === 0;
      bar.classList.toggle("is-visible", show);
      bar.toggleAttribute("inert", !show);
      bar.setAttribute("aria-hidden", String(!show));
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === heroCta) {
          heroVisible = entry.isIntersecting;
        } else if (entry.isIntersecting) {
          blockersVisible.add(entry.target);
        } else {
          blockersVisible.delete(entry.target);
        }
      });
      update();
    });

    // The header CTA is hidden on mobile, so it never intersects; fall back to a scroll threshold.
    if (heroCta && heroCta.offsetParent !== null) {
      observer.observe(heroCta);
    } else {
      heroVisible = window.scrollY < 200;
      window.addEventListener(
        "scroll",
        function () {
          var next = window.scrollY < 200;
          if (next !== heroVisible) {
            heroVisible = next;
            update();
          }
        },
        { passive: true },
      );
    }
    blockers.forEach(function (el) {
      observer.observe(el);
    });
    update();
  } else if (bar) {
    bar.classList.add("is-visible");
  }

  /* -------------------------------------------------------- footer accordions */

  /** Below 1024px, footer columns marked data-sable-accordion become disclosure buttons. */
  var accordions = Array.prototype.slice
    .call(document.querySelectorAll("[data-sable-accordion]"))
    .map(function (section, i) {
      var heading = section.querySelector(".sable-footer__heading");
      var panel = section.querySelector(".sable-footer__panel");
      if (!heading || !panel) return null;
      panel.id = panel.id || "sable-footer-panel-" + i;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "sable-footer__toggle";
      button.setAttribute("aria-controls", panel.id);
      button.textContent = heading.textContent.trim();
      var original = heading.textContent;
      button.addEventListener("click", function () {
        var open = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      });
      return { heading: heading, panel: panel, button: button, original: original };
    });

  var syncAccordions = function () {
    accordions.forEach(function (a) {
      if (!a) return;
      if (desktop.matches) {
        a.heading.textContent = a.original;
        a.panel.hidden = false;
      } else {
        a.heading.textContent = "";
        a.heading.appendChild(a.button);
        a.button.setAttribute("aria-expanded", "false");
        a.panel.hidden = true;
      }
    });
  };
  syncAccordions();
  desktop.addEventListener("change", syncAccordions);
})();
