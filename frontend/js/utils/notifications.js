export function showMessage(text, type = "success") {
  const notification = document.getElementById("notification");
  if (!notification) return;

  notification.textContent = text;
  notification.className = `notification ${type}`; 
  notification.style.display = "block";
  notification.style.opacity = "1";
  notification.style.top = "20px";

  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.top = "-50px";
    setTimeout(() => {
      notification.style.display = "none";
    }, 500);
  }, 3000);
}