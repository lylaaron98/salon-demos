/**
 * Salon enquiry form: turns the server-rendered form into an accessible stepper with live
 * availability, client-side validation (on blur, then live) and REST submission.
 * Without this script the same form posts to admin-post.php and still works.
 *
 * Globals: window.sbeForm = { availabilityUrl, enquiryUrl, nonce, platform, i18n } (wp_localize_script).
 */
(function () {
  "use strict";

  var settings = window.sbeForm;
  if (!settings || !window.fetch) return;
  var t = settings.i18n;

  var EMAIL_TYPOS = {
    "gmial.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmail.co": "gmail.com",
    "gmai.com": "gmail.com",
    "hotmial.com": "hotmail.com",
    "hotmail.co": "hotmail.com",
    "yaho.com": "yahoo.com",
    "yahoo.co": "yahoo.com",
    "outlok.com": "outlook.com",
  };

  function format(str) {
    var args = Array.prototype.slice.call(arguments, 1);
    var i = 0;
    return str.replace(/%(\d\$)?[sd]/g, function (match, pos) {
      return String(pos ? args[parseInt(pos, 10) - 1] : args[i++]);
    });
  }

  /** GA4 via GTM dataLayer (design brief 6.7). Never pushes name, phone or email. */
  function track(event, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(
      Object.assign({ event: event, site_platform: settings.platform || "wordpress" }, params),
    );
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") node.className = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function Form(root) {
    this.root = root;
    this.form = root.querySelector("form");
    this.config = JSON.parse(root.getAttribute("data-config") || "{}");
    this.steps = this.config.steps || [];
    this.index = 0;
    this.touched = {};
    this.started = false;
    this.status = root.querySelector("[data-sbe-status]");
    this.success = root.querySelector("[data-sbe-success]");
    this.next = root.querySelector("[data-sbe-next]");
    this.back = root.querySelector("[data-sbe-back]");
    this.submit = root.querySelector("[data-sbe-submit]");
    if (!this.form) return;
    this.enhance();
  }

  Form.prototype.common = function () {
    return { brand: this.config.brand, flow: "enquiry", form_id: this.config.formId };
  };

  Form.prototype.enhance = function () {
    var self = this;
    this.root.classList.add("is-enhanced");
    this.form.addEventListener("submit", function (e) {
      e.preventDefault();
      self.send();
    });
    this.next.hidden = false;
    this.next.addEventListener("click", function () {
      self.go(1);
    });
    this.back.addEventListener("click", function () {
      self.go(-1);
    });

    // Progress indicator.
    this.progress = this.root.querySelector("[data-sbe-progress]");
    this.progressText = this.root.querySelector("[data-sbe-progress-text]");
    this.progress.hidden = false;
    this.progressText.hidden = false;
    this.progress.querySelectorAll("li").forEach(function (li, i) {
      li.addEventListener("click", function () {
        if (i < self.index) self.show(i);
      });
    });

    // Schedule: replace the no-JS date/time inputs with chips fed by the availability API.
    if (this.config.showSchedule) {
      var fallback = this.root.querySelector("[data-sbe-schedule-fallback]");
      if (fallback) fallback.remove();
      this.schedule = this.root.querySelector("[data-sbe-schedule]");
      this.dateInput = el("input", { type: "hidden", name: "date" });
      this.timeInput = el("input", { type: "hidden", name: "time" });
      this.form.appendChild(this.dateInput);
      this.form.appendChild(this.timeInput);
    }

    // Validation: on blur first, then live once a field has been in error (brief 6.3).
    this.form.addEventListener(
      "blur",
      function (e) {
        var name = e.target && e.target.name;
        if (!name || name === "website") return;
        self.touched[name] = true;
        self.validateField(name);
      },
      true,
    );
    this.form.addEventListener("input", function (e) {
      var name = e.target && e.target.name;
      if (name && self.fieldError(name) !== null && self.touched[name]) self.validateField(name);
    });
    this.form.addEventListener("change", function (e) {
      var name = e.target && e.target.name;
      if (name === "outlet") {
        self.clearError("outlet");
        if (self.schedule) self.loadDays();
      }
      if (name === "service" && self.schedule) self.loadDays();
      if (name === "consent") self.validateField("consent");
      if (!self.started) {
        self.started = true;
        track("booking_start", Object.assign(self.common(), { entry_step: self.steps[0] }));
      }
    });

    this.show(0, true);
  };

  Form.prototype.value = function (name) {
    var field = this.form.elements[name];
    if (!field) return "";
    if (field.type === "checkbox") return field.checked;
    return (field.value || "").trim();
  };

  Form.prototype.fieldError = function (name) {
    var slot = this.root.querySelector('[id$="-' + name + '-error"]');
    return slot && !slot.hidden ? slot.textContent : null;
  };

  /** Return an error message for a field, or "" when valid. Mirrors the PHP Validator. */
  Form.prototype.check = function (name) {
    var v = this.value(name);
    var r = t.required;
    switch (name) {
      case "outlet":
        return v ? "" : r.outlet;
      case "first_name":
        return /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]{0,49}$/u.test(v) ? "" : r.first_name;
      case "mobile": {
        var digits = v.replace(/[\s\-()]/g, "").replace(/^\+?65(?=\d{8}$)/, "");
        if (/^[89]\d{7}$/.test(digits)) return "";
        return /^6\d{7}$/.test(digits) ? r.landline : r.mobile;
      }
      case "email":
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : r.email;
      case "consent":
        return v ? "" : r.consent;
      default:
        return "";
    }
  };

  Form.prototype.validateField = function (name) {
    var message = this.check(name);
    if (message) this.setError(name, message);
    else this.clearError(name);
    if (name === "email" && !message) this.suggestEmail();
    return !message;
  };

  Form.prototype.setError = function (name, message, type) {
    var slot = this.root.querySelector('[id$="-' + name + '-error"]');
    var field = this.form.elements[name];
    // Track each distinct error once, not on every keystroke while a field stays invalid.
    var isNew = !slot || slot.hidden || slot.textContent !== message;
    if (slot) {
      slot.textContent = message;
      slot.hidden = false;
    }
    var inputs = field && field.length !== undefined && !field.tagName ? field : [field];
    Array.prototype.forEach.call(inputs, function (input) {
      if (input && input.setAttribute) input.setAttribute("aria-invalid", "true");
    });
    var wrap = this.root.querySelector('[data-field="' + name + '"]');
    if (wrap) wrap.classList.add("has-error");
    if (!isNew) return;
    track(
      "form_error",
      Object.assign(this.common(), {
        field: name,
        error_type: type || (this.value(name) ? "format" : "empty"),
      }),
    );
  };

  Form.prototype.clearError = function (name) {
    var slot = this.root.querySelector('[id$="-' + name + '-error"]');
    var wrap = this.root.querySelector('[data-field="' + name + '"]');
    var hadError = slot && !slot.hidden;
    if (slot) {
      slot.textContent = "";
      slot.hidden = true;
    }
    var field = this.form.elements[name];
    var inputs = field && field.length !== undefined && !field.tagName ? field : [field];
    Array.prototype.forEach.call(inputs, function (input) {
      if (input && input.removeAttribute) input.removeAttribute("aria-invalid");
    });
    if (wrap) {
      wrap.classList.remove("has-error");
      // Show a check only after a corrected error (brief 6.3).
      wrap.classList.toggle("is-corrected", Boolean(hadError));
    }
  };

  Form.prototype.suggestEmail = function () {
    var input = this.form.elements.email;
    if (!input) return;
    var wrap = this.root.querySelector('[data-field="email"]');
    var old = wrap.querySelector(".sbe-suggest");
    if (old) old.remove();
    var parts = input.value.trim().split("@");
    var fix = parts.length === 2 && EMAIL_TYPOS[parts[1].toLowerCase()];
    if (!fix) return;
    var suggestion = parts[0] + "@" + fix;
    var p = el("p", { className: "sbe-suggest" }, format(t.didYouMean, suggestion) + " ");
    var btn = el("button", { type: "button", className: "sbe-btn sbe-btn--text" }, t.useThis);
    btn.addEventListener("click", function () {
      input.value = suggestion;
      p.remove();
      input.focus();
    });
    p.appendChild(btn);
    wrap.appendChild(p);
  };

  /** Fields validated before leaving each step. */
  Form.prototype.stepFields = function (step) {
    if (step === "outlet") return ["outlet"];
    if (step === "details") {
      return ["first_name", "mobile", "email", "consent"].filter(
        function (n) {
          return this.form.elements[n];
        }.bind(this),
      );
    }
    return [];
  };

  Form.prototype.validateStep = function (step) {
    var self = this;
    var invalid = this.stepFields(step).filter(function (name) {
      return !self.validateField(name);
    });
    if (invalid.length) {
      this.announce(invalid.length === 1 ? t.oneError : format(t.manyErrors, invalid.length));
      var first = this.form.elements[invalid[0]];
      var target = first && first.length !== undefined && !first.tagName ? first[0] : first;
      if (target && target.focus) target.focus();
      return false;
    }
    return true;
  };

  Form.prototype.announce = function (message) {
    this.status.textContent = "";
    var status = this.status;
    window.setTimeout(function () {
      status.textContent = message;
    }, 50);
  };

  Form.prototype.go = function (delta) {
    var step = this.steps[this.index];
    if (delta > 0) {
      if (!this.validateStep(step)) return;
      this.trackStep(step);
    }
    this.show(this.index + delta);
  };

  Form.prototype.trackStep = function (step) {
    var c = this.common();
    if (step === "outlet") {
      track(
        "select_outlet",
        Object.assign(c, { outlet_id: this.value("outlet"), selection_method: "list" }),
      );
    } else if (step === "service") {
      var id = this.value("service");
      var svc = (this.config.services || []).filter(function (s) {
        return s.id === id;
      })[0];
      track(
        "select_service",
        Object.assign(c, { service_id: id || "undecided", price: svc ? svc.price : 0 }),
      );
    } else if (step === "time" && this.dateInput && this.dateInput.value) {
      var days = Math.round(
        (new Date(this.dateInput.value) - new Date().setHours(0, 0, 0, 0)) / 864e5,
      );
      var hour = parseInt((this.timeInput.value || "12").split(":")[0], 10);
      track(
        "select_slot",
        Object.assign(c, {
          days_ahead: days,
          daypart: hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening",
          staff_pref: "any",
        }),
      );
    }
  };

  Form.prototype.show = function (index, initial) {
    var self = this;
    index = Math.max(0, Math.min(index, this.steps.length - 1));
    this.index = index;
    var name = this.steps[index];

    this.root.querySelectorAll(".sbe-step").forEach(function (fs) {
      fs.hidden = fs.getAttribute("data-step") !== name;
    });
    this.progress.querySelectorAll("li").forEach(function (li, i) {
      li.classList.toggle("is-done", i < index);
      if (i === index) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    this.progressText.textContent =
      format(t.step, index + 1, this.steps.length) + " · " + this.config.stepLabels[index];

    var last = index === this.steps.length - 1;
    this.back.hidden = index === 0;
    this.next.hidden = last;
    this.submit.hidden = !last;

    if (name === "time" && this.schedule && !this.schedule.dataset.loaded) this.loadDays();

    track(
      "booking_step_view",
      Object.assign(this.common(), { step_number: index + 1, step_name: name }),
    );

    if (!initial) {
      var legend = this.root.querySelector('.sbe-step[data-step="' + name + '"] .sbe-step__title');
      if (legend) legend.focus();
      var top = self.root.getBoundingClientRect().top;
      if (top < 0) self.root.scrollIntoView({ block: "start" });
    }
  };

  /* --------------------------------------------------------------- availability */

  Form.prototype.query = function (extra) {
    var url = new URL(settings.availabilityUrl, window.location.href);
    url.searchParams.set("brand", this.config.brand);
    url.searchParams.set("outlet", this.value("outlet"));
    if (this.value("service")) url.searchParams.set("service", this.value("service"));
    Object.keys(extra || {}).forEach(function (k) {
      url.searchParams.set(k, extra[k]);
    });
    return fetch(url.toString(), {
      headers: { Accept: "application/json" },
    }).then(function (res) {
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    });
  };

  Form.prototype.loadDays = function () {
    var self = this;
    if (!this.schedule || !this.value("outlet")) return;
    this.schedule.dataset.loaded = "1";
    this.dateInput.value = "";
    this.timeInput.value = "";
    this.schedule.textContent = "";
    this.schedule.appendChild(el("p", { className: "sbe-note", role: "status" }, t.loading));

    this.query()
      .then(function (data) {
        self.schedule.textContent = "";
        var group = el("div", {
          className: "sbe-chips sbe-chips--dates",
          role: "radiogroup",
          "aria-label": self.config.stepLabels[self.steps.indexOf("time")] || "",
        });
        var none = self.chip("date", "", t.anyTime, true);
        group.appendChild(none);
        data.days.forEach(function (day) {
          if (day.count > 0) group.appendChild(self.chip("date", day.date, day.label, false));
        });
        self.schedule.appendChild(group);
        self.slots = el("div", { className: "sbe-slots" });
        self.schedule.appendChild(self.slots);
      })
      .catch(function () {
        self.schedule.textContent = "";
        self.schedule.appendChild(el("p", { className: "sbe-note" }, t.network));
      });
  };

  /** Radio "chip" (real input + label, so arrow keys work). */
  Form.prototype.chip = function (kind, value, label, checked) {
    var self = this;
    var wrap = el("label", { className: "sbe-chip" });
    var input = el("input", {
      type: "radio",
      name: "sbe-" + kind + "-" + this.config.formId,
      value: value,
    });
    input.checked = checked;
    input.addEventListener("change", function () {
      if (kind === "date") {
        self.dateInput.value = value;
        self.timeInput.value = "";
        self.loadSlots(value);
      } else {
        self.timeInput.value = value;
        self.clearError("time");
      }
    });
    wrap.appendChild(input);
    wrap.appendChild(el("span", {}, label));
    return wrap;
  };

  Form.prototype.loadSlots = function (date) {
    var self = this;
    this.slots.textContent = "";
    if (!date) return;
    this.slots.appendChild(el("p", { className: "sbe-note", role: "status" }, t.loading));
    this.query({ date: date })
      .then(function (data) {
        self.slots.textContent = "";
        if (!data.count) {
          var empty = el("p", { className: "sbe-empty" }, t.noSlots + " ");
          empty.appendChild(self.whatsappLink("booking_empty"));
          self.slots.appendChild(empty);
          track("no_slots_shown", Object.assign(self.common(), { date: date }));
          return;
        }
        ["morning", "afternoon", "evening"].forEach(function (part) {
          var list = data.slots[part] || [];
          if (!list.length) return;
          var groupId = self.root.id + "-" + part;
          self.slots.appendChild(el("p", { className: "sbe-slots__label", id: groupId }, t[part]));
          var group = el("div", {
            className: "sbe-chips",
            role: "radiogroup",
            "aria-labelledby": groupId,
          });
          list.forEach(function (slot) {
            group.appendChild(self.chip("time", slot.time, slot.label, false));
          });
          self.slots.appendChild(group);
        });
      })
      .catch(function () {
        self.slots.textContent = "";
        self.slots.appendChild(el("p", { className: "sbe-note" }, t.network));
      });
  };

  Form.prototype.whatsappLink = function (location) {
    var a = el(
      "a",
      {
        href: "https://wa.me/" + String(this.config.whatsapp || "").replace(/\D/g, ""),
        target: "_blank",
        rel: "noopener",
        "data-contact": "whatsapp",
        "data-location": location,
      },
      t.whatsapp,
    );
    var self = this;
    a.addEventListener("click", function () {
      track(
        "contact_click",
        Object.assign(self.common(), { method: "whatsapp", location: location }),
      );
    });
    return a;
  };

  /* -------------------------------------------------------------------- submit */

  Form.prototype.send = function () {
    var self = this;
    var invalidStep = -1;
    for (var i = 0; i < this.steps.length; i++) {
      var fields = this.stepFields(this.steps[i]);
      var ok = fields.every(function (n) {
        return !self.check(n);
      });
      if (!ok) {
        invalidStep = i;
        break;
      }
    }
    if (invalidStep !== -1) {
      this.show(invalidStep);
      this.validateStep(this.steps[invalidStep]);
      return;
    }

    var payload = {};
    [
      "brand",
      "outlet",
      "service",
      "date",
      "time",
      "first_name",
      "mobile",
      "email",
      "message",
      "website",
    ].forEach(function (name) {
      payload[name] = self.value(name);
    });
    payload.consent = this.value("consent") === true;
    payload.marketing = this.value("marketing") === true;

    this.submit.disabled = true;
    this.submit.setAttribute("aria-busy", "true");
    this.submit.dataset.label = this.submit.textContent;
    this.submit.textContent = t.sending;
    track("booking_confirm", Object.assign(this.common(), { currency: "SGD" }));

    fetch(settings.enquiryUrl, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-WP-Nonce": settings.nonce,
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (body) {
          return { status: res.status, body: body };
        });
      })
      .then(function (r) {
        self.resetButton();
        if (r.status === 201) return self.done(r.body);
        var data = (r.body && r.body.data) || {};
        if (r.status === 422 && data.fields) return self.serverErrors(data.fields);
        if (r.status === 409 && data.alternatives)
          return self.conflict(r.body.message, data.alternatives);
        self.fail(r.body && r.body.message ? r.body.message : t.network);
      })
      .catch(function () {
        self.resetButton();
        self.fail(t.network);
      });
  };

  Form.prototype.resetButton = function () {
    this.submit.disabled = false;
    this.submit.removeAttribute("aria-busy");
    this.submit.textContent = this.submit.dataset.label || this.submit.textContent;
  };

  Form.prototype.serverErrors = function (fields) {
    var self = this;
    var names = Object.keys(fields);
    names.forEach(function (name) {
      self.setError(name, fields[name], "server");
    });
    var stepOf = function (name) {
      if (name === "outlet") return self.steps.indexOf("outlet");
      if (name === "service") return self.steps.indexOf("service");
      if (name === "date" || name === "time") return self.steps.indexOf("time");
      return self.steps.indexOf("details");
    };
    var first = Math.min.apply(
      null,
      names.map(stepOf).filter(function (i) {
        return i >= 0;
      }),
    );
    if (isFinite(first)) this.show(first);
    this.announce(names.length === 1 ? t.oneError : format(t.manyErrors, names.length));
  };

  Form.prototype.conflict = function (message, alternatives) {
    var self = this;
    var step = this.steps.indexOf("time");
    if (step !== -1) this.show(step);
    this.setError("time", message, "server_409");
    var slot = this.root.querySelector('[id$="-time-error"]');
    if (!slot) return;
    var group = el("div", { className: "sbe-chips", role: "group" });
    alternatives.forEach(function (alt) {
      var b = el(
        "button",
        { type: "button", className: "sbe-chip sbe-chip--button" },
        alt.date + " · " + alt.label,
      );
      b.addEventListener("click", function () {
        self.dateInput.value = alt.date;
        self.timeInput.value = alt.time;
        self.clearError("time");
        group.remove();
        self.show(self.steps.indexOf("details"));
      });
      group.appendChild(b);
    });
    slot.after(group);
    this.announce(message);
  };

  Form.prototype.fail = function (message) {
    this.status.textContent = "";
    var p = el("span", {}, message + " ");
    p.appendChild(this.whatsappLink("form_error"));
    this.status.appendChild(p);
  };

  Form.prototype.done = function (body) {
    // Reserve the form's height so the success state causes no layout jump (brief 6.5).
    this.root.style.minHeight = this.root.offsetHeight + "px";
    this.form.hidden = true;
    this.success.textContent = "";
    this.success.appendChild(el("h3", { className: "sbe-success__title" }, body.message));
    if (body.ref)
      this.success.appendChild(el("p", { className: "sbe-success__ref" }, "Ref: " + body.ref));
    if (body.whatsapp_url) {
      var a = this.whatsappLink("success");
      a.href = body.whatsapp_url;
      a.className = "sbe-btn sbe-btn--whatsapp";
      this.success.appendChild(a);
    }
    this.success.hidden = false;
    this.success.focus();

    // Fire the conversion once per reference (brief 6.6).
    var key = "sbe_lead_" + body.ref;
    var seen = false;
    try {
      seen = window.sessionStorage.getItem(key) === "1";
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked: still track once for this page view */
    }
    if (!seen) {
      var id = this.value("service");
      var svc = (this.config.services || []).filter(function (s) {
        return s.id === id;
      })[0];
      track(
        "enquiry_submit",
        Object.assign(this.common(), { value: svc ? svc.price : 0, currency: "SGD" }),
      );
    }
  };

  function init(scope) {
    scope.querySelectorAll("[data-sbe-form]").forEach(function (root) {
      if (!root.dataset.sbeReady) {
        root.dataset.sbeReady = "1";
        new Form(root);
      }
    });
  }

  init(document);

  // Elementor's editor preview re-renders widgets without a page load; pick up new forms.
  if (document.body && document.body.classList.contains("elementor-editor-active")) {
    new MutationObserver(function () {
      init(document);
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
