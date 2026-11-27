/* =========================================================
   OLYMPIA ACADEMY — SHARED SCRIPT
   Header compact state, copyright year, registration modal
   ========================================================= */

(() => {
  const MAIL = "olympiaacademy.in@gmail.com";
  const EXAMS = [
    "MAT / JMO",
    "Homi Bhabha",
    "IMO",
    "NSO",
    "IEO",
    "IPM",
    "Mental Maths",
    "Foundation"
  ];

  // 1. Copyright year
  const yearEl = document.getElementById("yr");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Mark the shared navigation link for the current page.
  const pageName = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("header .links a").forEach((link) => {
    const target = new URL(link.href, location.href);
    const isCurrentPage = target.pathname.split("/").pop() === pageName;
    const isCurrentSection = isCurrentPage && target.hash && target.hash === location.hash;
    if (isCurrentPage && (pageName === "courses.html" || !target.hash)) {
      link.classList.add("on");
      link.setAttribute("aria-current", "page");
    } else if (isCurrentSection) {
      link.classList.add("on");
      link.setAttribute("aria-current", "location");
    } else {
      link.classList.remove("on");
      link.removeAttribute("aria-current");
    }
  });

  // 2. Compact header on scroll
  const header = document.querySelector("header");
  if (header) {
    const syncHeaderOffset = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-offset", `${height}px`);
    };
    const updateHeader = () => {
      header.classList.toggle("is-compact", window.scrollY > 40);
      syncHeaderOffset();
    };
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", syncHeaderOffset, { passive: true });
    if ("ResizeObserver" in window) {
      new ResizeObserver(syncHeaderOffset).observe(header);
    }
    updateHeader();
  }

  // 3. Modals (Registration & Login) + exam chips
  const regModal = document.getElementById("regModal");
  const regFormWrap = document.getElementById("regForm");
  const regOk = document.getElementById("regOk");
  const form = document.getElementById("form");
  const chipsContainer = document.getElementById("chips");

  const loginModal = document.getElementById("loginModal");
  const loginFormWrap = document.getElementById("loginFormWrap");
  const loginOk = document.getElementById("loginOk");
  const loginForm = document.getElementById("loginForm");

  if (chipsContainer) {
    chipsContainer.innerHTML = EXAMS.map(
      (exam, index) =>
        `<input type="checkbox" name="exam" value="${exam}" id="ex${index}"><label for="ex${index}">${exam}</label>`
    ).join("");
  }

  let lastTrigger = null;

  function openModal(modal, trigger, resetFn) {
    if (!modal) return;
    closeModals(false);
    lastTrigger = trigger || document.activeElement;
    if (resetFn) resetFn();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const firstInput = modal.querySelector("input, select, textarea");
    if (firstInput) firstInput.focus();
  }

  function openRegistrationModal(trigger) {
    openModal(regModal, trigger, () => {
      if (regFormWrap) regFormWrap.style.display = "block";
      if (regOk) regOk.style.display = "none";
    });
  }

  function openLoginModal(trigger) {
    openModal(loginModal, trigger, () => {
      if (loginFormWrap) loginFormWrap.style.display = "block";
      if (loginOk) loginOk.style.display = "none";
    });
  }

  function closeModals(restoreFocus = true) {
    document.querySelectorAll(".modal.open").forEach((modal) => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("modal-open");
    if (restoreFocus && lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => openRegistrationModal(btn));
  });

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => openLoginModal(loginBtn));
  }

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModals(true));
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModals(true);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModals(true);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.has("register")) {
    openRegistrationModal();
  } else if (params.has("login")) {
    openLoginModal();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (loginFormWrap) loginFormWrap.style.display = "none";
      if (loginOk) loginOk.style.display = "block";
      loginForm.reset();
    });
  }

  function showSuccess(message) {
    if (regFormWrap) regFormWrap.style.display = "none";
    if (regOk) {
      regOk.style.display = "block";
      const paragraph = regOk.querySelector("p");
      if (paragraph && message) {
        paragraph.textContent = message;
      }
    }
    if (form) form.reset();
  }
  /* Registration form: require at least one exam chip.
   Native `required` attributes already cover the other fields.
   Paste into app.js (or home.js), anywhere after the DOM exists. */
  (() => {
    const form = document.getElementById("form");
    const chips = document.getElementById("chips");
    const error = document.getElementById("chipsError");
    if (!form || !chips || !error) return;

    const hasExam = () => Boolean(chips.querySelector("input:checked"));

    const showError = (on) => {
      error.hidden = !on;
      chips.classList.toggle("invalid", on);
    };

    // Capture phase: runs BEFORE your existing submit handler,
    // so nothing gets sent (mailto, thank-you screen) while invalid.
    form.addEventListener(
      "submit",
      (event) => {
        if (hasExam()) {
          showError(false);
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        showError(true);
        chips.scrollIntoView({ block: "center", behavior: "smooth" });
      },
      true
    );

    // Clear the error as soon as a chip is picked
    chips.addEventListener("change", () => {
      if (hasExam()) showError(false);
    });

    form.addEventListener("reset", () => showError(false));
  })();
  const WEB3FORMS_KEY = "7d31160f-b69a-434d-aca3-e09387d7415a";

  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorEl = document.getElementById("regError");
    const idleLabel = submitBtn ? submitBtn.textContent : "";

    const setError = (text) => {
      if (!errorEl) return;
      errorEl.textContent = text || "";
      errorEl.hidden = !text;
    };

    // Clear any old error as soon as the visitor edits something
    form.addEventListener("input", () => setError(""));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setError("");

      const fd = new FormData(form);

      // Keys become the labels in the email you receive
      const payload = {
        access_key: WEB3FORMS_KEY,
        subject: "New registration - Olympia Academy",
        from_name: "Olympia Academy website",
        "Student": fd.get("student"),
        "Class": fd.get("cls"),
        "Parent": fd.get("parent"),
        "Phone": fd.get("phone"),
        "Interested in": fd.getAll("exam").join(", ") || "Not selected",
        "Message": fd.get("msg") || "-"
      };

      // Hidden honeypot: only bots tick it
      if (fd.has("botcheck")) payload.botcheck = true;

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending…";
        }

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Send failed");
        }

        showSuccess("Thank you! We have received your details and will call you back shortly.");
      } catch (error) {
        console.error("Registration failed:", error);
        setError("Sorry, that didn’t go through. Please try again, or call us on +91 79775 76252.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = idleLabel;
        }
      }
    });
  }
})();
