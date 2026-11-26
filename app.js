/* =========================================================
   OLYMPIA ACADEMY — SHARED SCRIPT
   Header compact state, copyright year, registration modal
   ========================================================= */

(() => {
  const MAIL = "olympiaacademy.in@gmail.com";
  const FORMSPREE = ""; // Optional: paste your Formspree endpoint e.g. "https://formspree.io/f/xxxxxxx"
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

  // 2. Compact header on scroll
  const header = document.querySelector("header");
  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-compact", window.scrollY > 40);
    };
    window.addEventListener("scroll", updateHeader, { passive: true });
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

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd);
      data.exam = fd.getAll("exam").join(", ") || "Not selected";

      if (FORMSPREE) {
        try {
          const response = await fetch(FORMSPREE, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          });
          if (response.ok) {
            showSuccess("Your registration has been received. We will call you soon.");
            return;
          }
        } catch (_) {
          // Fall back to mailto below
        }
      }

      const enc = (value) => encodeURIComponent(value || "-");
      const nl = "%0D%0A";
      const body =
        `New registration${nl}${nl}` +
        `Student: ${enc(data.student)}${nl}` +
        `Class: ${enc(data.cls)}${nl}` +
        `School: ${enc(data.school)}${nl}` +
        `Parent: ${enc(data.parent)}${nl}` +
        `Phone: ${enc(data.phone)}${nl}` +
        `Email: ${enc(data.email)}${nl}` +
        `Interested in: ${enc(data.exam)}${nl}` +
        `Message: ${enc(data.msg)}`;

      window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(
        `Registration: ${data.student} (Class ${data.cls})`
      )}&body=${body}`;
      showSuccess(
        "Your email app should have opened with the details. Please press Send there to complete it."
      );
    });
  }
})();
