export function initFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  
  if (filterBtns.length > 0) {
    filterBtns.forEach((eachBtn) => {
      eachBtn.addEventListener("click", () => {
        // Remove active class from all
        filterBtns.forEach((btn) => btn.classList.remove("active"));
        // Add active to clicked
        eachBtn.classList.add("active");
        
        // Filter Logic
        const category = eachBtn.textContent.toLowerCase().trim();
        if (category === 'tous' || category === 'all') {
          filterBtnAll();
        } else {
          filterBtn(category);
        }
      });
    });
  }
}

// Helper functions (Internal use)
function filterBtn(targetType) {
  const cards = document.querySelectorAll(".food-single-card, .fleet-card");

  cards.forEach((card) => {
    const cardType = card.getAttribute("data-type")?.toLowerCase();
    
    if (cardType === targetType || cardType?.includes(targetType)) {
      card.style.display = "flex";
      card.style.opacity = "0";
      setTimeout(() => card.style.opacity = "1", 50);
    } else {
      card.style.display = "none";
    }
  });
}

function filterBtnAll() {
  const cards = document.querySelectorAll(".food-single-card, .fleet-card");
  cards.forEach((card) => {
    card.style.display = "flex";
    setTimeout(() => card.style.opacity = "1", 50);
  });
}