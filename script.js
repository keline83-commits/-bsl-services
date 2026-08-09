(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Preloader — arrow sweep + wordmark reveal, held for a minimum
     duration so the intro always plays out even on a fast connection,
     but never blocks longer than the page actually takes to load.
     --------------------------------------------------------------------- */
  const preloader = document.getElementById("preloader");
  if (preloader) {
    const INTRO_MIN_MS = reducedMotion ? 150 : 2750;
    let pageLoaded = false;
    let introPlayed = false;

    const revealSite = () => {
      if (pageLoaded && introPlayed) preloader.classList.add("hidden");
    };

    window.addEventListener("load", () => {
      pageLoaded = true;
      revealSite();
    });

    setTimeout(() => {
      introPlayed = true;
      revealSite();
    }, INTRO_MIN_MS);
  }

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Mobile nav
     --------------------------------------------------------------------- */
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-spy active nav link
     --------------------------------------------------------------------- */
  const navLinks = document.querySelectorAll(".nav a");
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => spyObserver.observe(section));
  }

  /* ---------------------------------------------------------------------
     Scroll reveal animations
     --------------------------------------------------------------------- */
  const animatedEls = document.querySelectorAll("[data-animate]");

  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    animatedEls.forEach((el) => revealObserver.observe(el));
  } else {
    animatedEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------------
     Cursor glow (desktop pointer only)
     --------------------------------------------------------------------- */
  const cursorGlow = document.getElementById("cursorGlow");
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (cursorGlow && hasFinePointer && !reducedMotion) {
    window.addEventListener("mousemove", (e) => {
      cursorGlow.style.setProperty("--x", `${e.clientX}px`);
      cursorGlow.style.setProperty("--y", `${e.clientY}px`);
    });
  } else if (cursorGlow) {
    cursorGlow.style.display = "none";
  }

  /* ---------------------------------------------------------------------
     Back to top
     --------------------------------------------------------------------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("show", window.scrollY > 600);
    });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     Steppers (bedrooms / bathrooms / kitchens)
     --------------------------------------------------------------------- */
  document.querySelectorAll("[data-stepper]").forEach((stepper) => {
    const input = stepper.querySelector("input");
    const min = Number(stepper.dataset.min ?? 0);
    const max = Number(stepper.dataset.max ?? 10);

    stepper.querySelectorAll(".stepper-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        let value = Number(input.value) || 0;
        value += btn.dataset.action === "inc" ? 1 : -1;
        value = Math.min(max, Math.max(min, value));
        input.value = value;
      });
    });
  });

  /* ---------------------------------------------------------------------
     Quote request form
     --------------------------------------------------------------------- */
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus");
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/info@bslservicesltd.com";

  const fieldOf = (el) => el.closest(".form-field");

  function clearErrors() {
    form.querySelectorAll(".form-field.error").forEach((el) => el.classList.remove("error"));
  }

  function markError(el) {
    const field = fieldOf(el);
    if (field) field.classList.add("error");
    return field;
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `form-status show ${type}`;
  }

  function clearStatus() {
    statusEl.textContent = "";
    statusEl.className = "form-status";
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("loading", isLoading);
  }

  function validate() {
    clearErrors();
    let firstInvalid = null;

    const name = form.elements["name"];
    const phone = form.elements["phone"];
    const email = form.elements["email"];
    const propertyType = form.querySelector('input[name="property_type"]:checked');
    const services = form.querySelectorAll('input[name="services"]:checked');

    const registerInvalid = (el) => {
      const field = markError(el);
      firstInvalid = firstInvalid || field;
    };

    if (!name.value.trim()) {
      registerInvalid(name);
    }

    if (!phone.value.trim()) {
      registerInvalid(phone);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
      registerInvalid(email);
    }

    if (!propertyType) {
      registerInvalid(document.getElementById("propertyTypeGroup"));
    }

    if (!services.length) {
      registerInvalid(document.getElementById("servicesGroup"));
    }

    return firstInvalid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    // Honeypot — silently drop likely-bot submissions.
    const honeypot = form.elements["_honeypot"];
    if (honeypot && honeypot.value.trim()) return;

    const firstInvalid = validate();
    if (firstInvalid) {
      setStatus("Please fill in the required fields highlighted below.", "error");
      const focusable = firstInvalid.querySelector("input, select, textarea");
      if (focusable) focusable.focus();
      return;
    }

    const services = Array.from(form.querySelectorAll('input[name="services"]:checked')).map((el) => el.value);

    const payload = {
      Name: form.elements["name"].value.trim(),
      Phone: form.elements["phone"].value.trim(),
      Email: form.elements["email"].value.trim(),
      "Property Type": form.querySelector('input[name="property_type"]:checked').value,
      Bedrooms: form.elements["bedrooms"].value,
      Bathrooms: form.elements["bathrooms"].value,
      Kitchens: form.elements["kitchens"].value,
      "Services Requested": services.join(", "),
      "Preferred Date": form.elements["preferred_date"].value || "Not specified",
      "Additional Details": form.elements["notes"].value.trim() || "None provided",
      _subject: "New Quote Request — BSL Services",
    };

    setLoading(true);

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      setStatus("Thank you! Your quote request has been sent — we'll be in touch shortly.", "success");
      form.reset();
      form.querySelectorAll("[data-stepper] input").forEach((input) => {
        input.value = input.defaultValue;
      });
    } catch (err) {
      setStatus(
        "Something went wrong sending your request. Please call us on 07984 495997 or email info@bslservicesltd.com directly.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });
})();
