document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section');
  const socialLinks = document.querySelectorAll('.social-link');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  // Removing explicit hover effects as they're now handled by CSS
  
  // Dark Mode Toggle
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Optional: Save preference in localStorage
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('darkMode', 'enabled');
    } else {
      localStorage.setItem('darkMode', 'disabled');
    }
  });

  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  // Warning banner fade-in
  const warningBanner = document.querySelector('.warning-banner');
  warningBanner.style.opacity = '0';
  setTimeout(() => {
    warningBanner.style.transition = 'opacity 0.5s ease';
    warningBanner.style.opacity = '1';
  }, 500);
});