export function initUI() {
  // Back To Top
  const backToTopBtn = document.querySelector("#scrollTopBtn");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("active");
        backToTopBtn.style.visibility = "visible";
        backToTopBtn.style.opacity = "1";
      } else {
        backToTopBtn.classList.remove("active");
        backToTopBtn.style.visibility = "hidden";
        backToTopBtn.style.opacity = "0";
      }
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Navbar Scroll Effect
  const navbar = document.querySelector("nav");
  if(navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
        navbar.style.paddingTop = "10px";
        navbar.style.paddingBottom = "10px";
      } else {
        navbar.style.boxShadow = "none";
        navbar.style.paddingTop = "15px";
        navbar.style.paddingBottom = "15px";
      }
    });
  }

  // Animation on Scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".service-card, .fleet-card, .tarif-card").forEach(el => {
    observer.observe(el);
  });
}