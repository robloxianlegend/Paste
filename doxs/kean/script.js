document.addEventListener('DOMContentLoaded', () => {
  // Create custom cursor and hide default cursor completely
  const cursor = document.createElement('div');
  cursor.classList.add('custom-cursor');
  document.body.appendChild(cursor);

  // Prevent default cursor entirely
  document.body.style.cursor = 'none';
  document.documentElement.style.cursor = 'none';

  // Update cursor position with smooth transition
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // Hover effect for interactive elements
  const interactiveElements = document.querySelectorAll('li[data-url], .image-grid img, .close-popup');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Remove default cursor from all elements
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    el.style.cursor = 'none';
  });

  // Remove glitch text functionality
  const listItems = document.querySelectorAll('li');
  listItems.forEach(item => {
    // Add click event to open Facebook for items with data-url
    if (item.getAttribute('data-url')) {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url');
        window.open(url, '_blank');
      });
    }
  });

  // Image gallery with local images and full-screen popup
  const imageContainer = document.getElementById('image-container');
  const photoPopup = document.getElementById('photo-popup');
  const popupImage = document.getElementById('popup-image');
  const closePopup = document.querySelector('.close-popup');

  const imageUrls = [
    '459614280_832222702414460_5549776247636790819_n.jpg',
    '457870435_824506413186089_7131823497290812508_n.jpg',
    '473791598_919033567066706_7311000717947497218_n.jpg',
    '422328527_695795539390511_4946464413404989915_n.jpg',
    '404618788_661425712827494_3513816375479628381_n.jpg',
    '397132319_649019800734752_1495857846391933821_n.jpg',
    '386758628_635370518766347_2794163087874041744_n.jpg'
  ];

  imageUrls.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'keann clyde benig photo';
    
    // Add click event to open full-screen popup
    img.addEventListener('click', () => {
      photoPopup.style.display = 'block';
      popupImage.src = url;
    });
    
    imageContainer.appendChild(img);
  });

  // Close popup when clicking the close button
  closePopup.addEventListener('click', () => {
    photoPopup.style.display = 'none';
  });

  // Close popup when clicking outside the image
  photoPopup.addEventListener('click', (e) => {
    if (e.target === photoPopup) {
      photoPopup.style.display = 'none';
    }
  });
});