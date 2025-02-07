document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const retroItem = document.querySelector('.retro-item');
  
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.color = 'var(--accent-color)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.color = 'var(--text-color)';
    });
  });

  // Add click event to redirect 
  retroItem.addEventListener('click', () => {
    window.location.href = 'https://youareadumbniggerandastupidfaggot.pages.dev/doxs/kean'; // Replaced with a neutral URL
  });
});
