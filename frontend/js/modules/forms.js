import { showMessage } from '../utils/notifications.js';

export function initForms() {
  // Booking Form
  const bookingForm = document.querySelector(".booking-form");
  if (bookingForm) {
    const bookingBtn = bookingForm.querySelector(".booking-btn");
    const inputs = bookingForm.querySelectorAll("input");
    
    bookingBtn.addEventListener("click", (e) => {
      e.preventDefault();
      let isValid = true;
      
      inputs.forEach(input => {
        if (input.value.trim() === "") {
          isValid = false;
          input.style.borderColor = "#e74c3c";
          setTimeout(() => input.style.borderColor = "", 2000);
        }
      });
      
      if (isValid) {
        showMessage("Réservation envoyée ! Nous vous contacterons rapidement.", "success");
        inputs.forEach(input => input.value = "");
      } else {
        showMessage(`Veuillez remplir les champs obligatoires.`, "error");
      }
    });
  }

  // Contact Form
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const requiredInputs = contactForm.querySelectorAll("[required]");
      let isValid = true;
      requiredInputs.forEach(input => {
        if(!input.value.trim()) isValid = false;
      });

      if (isValid) {
        showMessage("Message envoyé avec succès !", "success");
        contactForm.reset();
      } else {
        showMessage("Veuillez remplir tous les champs.", "error");
      }
    });
  }

  // Phone Inputs
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      // Logic formatting here ila htajitooo
    });
  });
}