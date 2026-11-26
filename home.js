/* =========================================================
   OLYMPIA ACADEMY — HOME PAGE SCRIPT
   Active section nav, Hall of Fame, Hero carousel, Testimonials
   ========================================================= */

(async () => {
  async function loadSharedPartials() {
    const [headerResponse, formsResponse] = await Promise.all([
      fetch("./header.html"), fetch("./forms.html")
    ]);
    if (!headerResponse.ok || !formsResponse.ok) throw new Error("Could not load shared page components");
    document.getElementById("header-container").innerHTML = await headerResponse.text();
    document.getElementById("forms-container").innerHTML = await formsResponse.text();
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./app.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load app.js"));
      document.body.appendChild(script);
    });
  }
  try { await loadSharedPartials(); }
  catch (error) { console.error("Page setup failed:", error); }
  // 1. Highlight active nav link based on visible section
  const navLinks = [...document.querySelectorAll('header .links a[href^="#"]')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle("on", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-35% 0px -50% 0px" }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  // 2. Helpers
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function formatStudentMeta(student) {
    const parts = [`Class ${escapeHTML(student.class)}`];
    if (student.year) {
      parts.push(escapeHTML(student.year));
    }
    return parts.join(" · ");
  }

  // 3. Load academy data
  async function loadAcademyData() {
    try {
      const [resultsResponse, testimonialsResponse] = await Promise.all([
        fetch("./results.json"),
        fetch("./testimonials.json")
      ]);

      if (!resultsResponse.ok || !testimonialsResponse.ok) {
        throw new Error("Could not load academy data");
      }

      const results = await resultsResponse.json();
      const testimonials = await testimonialsResponse.json();

      renderStats(results.stats || []);
      renderCategories(results.categories || [], results.students || []);
      renderHomeCarousel(results.categories || [], results.students || []);
      renderTestimonials(testimonials.testimonials || []);

      requestAnimationFrame(() => autoScrollY('.category-page, .win-row'));
    } catch (error) {
      console.error("Academy data loading failed:", error);
      const track = document.getElementById("categoryTrack");
      if (track) {
        track.innerHTML =
          '<div class="category-page"><div class="category-empty">Results could not be loaded. Please open this site via a web server.</div></div>';
      }
    }
  }

  function renderStats(stats) {
    const container = document.getElementById("statsContainer");
    if (!container) return;
    container.innerHTML = stats
      .map(
        (stat) => `
      <div class="stat">
        <b>${escapeHTML(stat.value)}${escapeHTML(stat.suffix)}</b>
        <span>${escapeHTML(stat.label)}</span>
      </div>
    `
      )
      .join("");
  }

  // 4. Hall of Fame categories
  let activeCategory = 0;

  function renderCategories(categories, students) {
    const track = document.getElementById("categoryTrack");
    const pagination = document.getElementById("categoryPagination");
    const viewport = document.getElementById("categoryViewport");
    if (!track || !pagination || !viewport || !categories.length) return;

    track.innerHTML = categories
      .map((category) => {
        const categoryStudents = students.filter((student) =>
          (student.categories || []).includes(category.id)
        );

        return `
      <div class="category-page" data-category="${escapeHTML(category.id)}">
        ${categoryStudents.length
            ? `
          <div class="category-students">
            ${categoryStudents
              .map(
                (student) => `
              <article class="hall-card">
                <div class="hall-info">
                  <h3>${escapeHTML(student.name)}</h3>
                  <small>${formatStudentMeta(student)}</small>
                  <div class="hall-tags">
                    ${(student.achievements?.[category.id] || [])
                    .map((achievement) => {
                      const lower = achievement.toLowerCase();
                      const medalClass = lower.includes("gold")
                        ? "gold"
                        : lower.includes("silver")
                          ? "silver"
                          : lower.includes("bronze")
                            ? "bronze"
                            : "";
                      return `<span class="tag ${medalClass}">${escapeHTML(achievement)}</span>`;
                    })
                    .join("")}
                  </div>
                </div>
                <div class="hall-profile">
                  <img
                    loading="lazy"
                    src="${escapeHTML(student.photo || "images/stockpfp.png")}"
                    alt="${escapeHTML(student.name)}"
                    onerror="this.onerror=null;this.src='images/stockpfp.png'"
                  >
                </div>
              </article>
            `
              )
              .join("")}
          </div>
        `
            : '<div class="category-empty">Achievements coming soon.</div>'
          }
      </div>
    `;
      })
      .join("");

    pagination.innerHTML = categories
      .map(
        (category, index) => `
      <button
        type="button"
        class="category-dot ${index === 0 ? "active" : ""}"
        data-index="${index}"
        aria-label="Go to ${escapeHTML(category.title)}">
      </button>
    `
      )
      .join("");

    activeCategory = 0;

    const prevBtn = document.getElementById("prevCategory");
    const nextBtn = document.getElementById("nextCategory");

    if (prevBtn) prevBtn.onclick = () => goToCategory(activeCategory - 1);
    if (nextBtn) nextBtn.onclick = () => goToCategory(activeCategory + 1);

    pagination.querySelectorAll(".category-dot").forEach((dot) => {
      dot.onclick = () => goToCategory(Number(dot.dataset.index));
    });

    viewport.addEventListener(
      "scroll",
      () => {
        if (!viewport.clientWidth) return;
        const index = Math.round(viewport.scrollLeft / viewport.clientWidth);
        updateCategoryUI(index, categories);
      },
      { passive: true }
    );

    updateCategoryUI(0, categories);
  }

  function goToCategory(index) {
    const viewport = document.getElementById("categoryViewport");
    const pages = document.querySelectorAll(".category-page");
    if (!viewport || index < 0 || index >= pages.length) return;

    activeCategory = index;
    viewport.scrollTo({
      left: index * viewport.clientWidth,
      behavior: "smooth"
    });
  }

  function updateCategoryUI(index, categories) {
    if (index < 0 || index >= categories.length) return;
    activeCategory = index;

    const category = categories[index];
    const numberElement = document.getElementById("categoryNumber");
    const titleElement = document.getElementById("categoryTitle");
    const descElement = document.getElementById("categoryDescription");
    const prevBtn = document.getElementById("prevCategory");
    const nextBtn = document.getElementById("nextCategory");

    if (numberElement) {
      numberElement.textContent = `${String(index + 1).padStart(2, "0")} / ${String(
        categories.length
      ).padStart(2, "0")}`;
    }
    if (titleElement) titleElement.textContent = category.title;
    if (descElement) descElement.textContent = category.description;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === categories.length - 1;

    document.querySelectorAll(".category-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  // 5. Hero carousel
  function renderHomeCarousel(categories, students) {
    const track = document.getElementById("heroTrack");
    if (!track) return;

    categories.forEach((category) => {
      const list = students
        .filter((student) => (student.categories || []).includes(category.id))
        .slice(0, 3);
      if (!list.length) return;

      track.insertAdjacentHTML(
        "beforeend",
        `
      <div class="hero-slide">
        <div class="slide-win">
          <div class="eyebrow">${escapeHTML(category.title)}</div>
          <h2>${escapeHTML(category.description)}</h2>
          <div class="win-row">
            ${list
          .map(
            (student) => `
              <div class="win">
                <div class="win-info">
                  <b>${escapeHTML(student.name)}</b>
                  <small>${formatStudentMeta(student)}</small>
                  <div class="hall-tags">
                    ${(student.achievements?.[category.id] || [])
                .slice(0, 2)
                .map((ach) => `<span class="tag">${escapeHTML(ach)}</span>`)
                .join("")}
                  </div>
                </div>
                <img
                  class="win-pfp"
                  draggable="false"
                  loading="lazy"
                  src="${escapeHTML(student.photo || "images/stockpfp.png")}"
                  alt="${escapeHTML(student.name)}"
                  onerror="this.onerror=null;this.src='images/stockpfp.png'"
                >
              </div>
            `
          )
          .join("")}
          </div>
        </div>
      </div>
    `
      );
    });

    startCarousel();
  }

  function startCarousel() {
    const track = document.getElementById("heroTrack");
    const dots = document.getElementById("heroDots");
    const carousel = document.getElementById("heroCarousel");
    if (!track || !dots || !carousel) return;

    const total = track.children.length;
    if (total <= 1) return;

    let current = 0;
    let timer;

    dots.innerHTML = [...track.children]
      .map(
        (_, k) =>
          `<button type="button" aria-label="Slide ${k + 1}"></button>`
      )
      .join("");

    const mark = (idx) => {
      [...dots.children].forEach((dot, j) => dot.classList.toggle("on", j === idx));
    };

    const go = (idx) => {
      current = (idx + total) % total;
      if (!track.clientWidth) return;
      track.scrollTo({ left: current * track.clientWidth, behavior: "smooth" });
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => go(current + 1), 5000);
    };

    track.addEventListener(
      "scroll",
      () => {
        if (!track.clientWidth) return;
        current = Math.round(track.scrollLeft / track.clientWidth);
        mark(current);
      },
      { passive: true }
    );

    [...dots.children].forEach((dot, k) => {
      dot.onclick = () => {
        go(k);
        play();
      };
    });

    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", play);
    carousel.addEventListener("touchstart", () => clearInterval(timer), { passive: true });
    carousel.addEventListener("touchend", play);

    let down = false;
    let startX = 0;
    let startScroll = 0;

    track.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse") return;
      down = true;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.style.scrollSnapType = "none";
      track.style.cursor = "grabbing";
    });

    window.addEventListener("pointermove", (event) => {
      if (down) track.scrollLeft = startScroll - (event.clientX - startX);
    });

    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      track.style.scrollSnapType = "";
      track.style.cursor = "";
      if (track.clientWidth) {
        go(Math.round(track.scrollLeft / track.clientWidth));
      }
    });

    mark(0);
    play();
  }

  function autoScrollY(selector, speed = 15, holdMs = 2500) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll(selector).forEach(el => {
      let pos = 0, dir = 1, hovering = false, visible = false;
      let last = performance.now();
      let hold = last + 1500;                    // initial delay before moving

      const touched = () => { hold = performance.now() + holdMs; };
      el.addEventListener('mouseenter', () => hovering = true);
      el.addEventListener('mouseleave', () => hovering = false);
      ['wheel', 'touchstart', 'touchmove', 'pointerdown'].forEach(t =>
        el.addEventListener(t, touched, { passive: true }));

      // only scroll the page that is actually on screen
      new IntersectionObserver(([e]) => visible = e.isIntersecting, { threshold: 0.5 }).observe(el);

      (function tick(now) {
        const dt = (now - last) / 1000;
        last = now;
        const max = el.scrollHeight - el.clientHeight;

        if (visible && !hovering && now > hold && max > 0) {
          if (Math.abs(pos - el.scrollTop) > 2) pos = el.scrollTop;  // user scrolled it manually
          pos += dir * speed * dt;
          if (pos >= max) { pos = max; dir = -1; hold = now + 1200; }  // pause at bottom
          else if (pos <= 0) { pos = 0; dir = 1; hold = now + 1200; }  // pause at top
          el.scrollTop = pos;
        }
        requestAnimationFrame(tick);
      })(last);
    });
  }

  // 6. Testimonials
  function renderTestimonials(testimonials) {
    const rail = document.getElementById("testimonyRail");
    if (!rail) return;

    rail.innerHTML = testimonials
      .map(
        (item) => `
      <article class="card">
        <p class="quote">"${escapeHTML(item.quote)}"</p>
        <p>${escapeHTML(item.byline)}</p>
      </article>
    `
      )
      .join("");
  }

  loadAcademyData();
})();
