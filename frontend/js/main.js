import { initNavigation } from './modules/navigation.js';
import { initFilters } from './modules/filters.js';
import { initTheme } from './modules/theme.js';
import { initForms } from './modules/forms.js';
import { initUI } from './modules/ui.js';

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initFilters();
  initTheme();
  initForms();
  initUI();
  console.log("web site ready now");
});