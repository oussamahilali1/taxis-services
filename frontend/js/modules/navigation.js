export function initNavigation() {
  const openNavBtn = document.querySelector("#openNav"); 
  const closeNavBtn = document.querySelector("#closeNav"); 
  const nav = document.querySelector("nav");
  const navLinks = document.querySelectorAll("nav ul li a");

  function closeMenu() {
    if (nav.classList.contains("toggleNav")) {
      nav.classList.remove("toggleNav");
      document.body.style.overflow = "auto";
      if(openNavBtn) openNavBtn.style.display = "flex";
    }
  }

  if (openNavBtn) {
    openNavBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      nav.classList.add("toggleNav");
      document.body.style.overflow = "hidden";
      openNavBtn.style.display = "none";
    });
  }

  if (closeNavBtn) {
    closeNavBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (nav.classList.contains("toggleNav") && 
        !nav.querySelector("ul").contains(e.target) && 
        e.target !== openNavBtn) {
      closeMenu();
    }
  });
}