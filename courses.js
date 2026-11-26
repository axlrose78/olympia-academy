/* Page behavior for the courses page. Shared header, forms and controls load first. */
(async () => {
  try {
    const [headerResponse, formsResponse] = await Promise.all([fetch("./header.html"), fetch("./forms.html")]);
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

    const elements = document.querySelectorAll(".rv");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("in"));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
  } catch (error) {
    console.error("Courses page setup failed:", error);
  }
})();
