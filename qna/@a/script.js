const allowedIP = '139.135.241.131';

document.addEventListener('DOMContentLoaded', () => {
  const adminBtn = document.getElementById('admin-btn');
  const adminModal = document.getElementById('admin-modal');
  const closeBtn = document.querySelector('.close-btn');
  const uploadForm = document.getElementById('upload-form');

  // Check IP on page load
  async function checkIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      if (data.ip !== allowedIP) {
        adminBtn.style.display = 'none';
      }
    } catch (error) {
      console.error('Error checking IP:', error);
      adminBtn.style.display = 'none';
    }
  }

  // Open admin modal
  adminBtn.addEventListener('click', () => {
    adminModal.style.display = 'block';
  });

  // Close admin modal
  closeBtn.addEventListener('click', () => {
    adminModal.style.display = 'none';
  });

  // Handle form submission
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imageFile = document.getElementById('image-upload').files[0];
    const imageDesc = document.getElementById('image-desc').value;

    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    try {
      // Create FormData to send file and description
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('description', imageDesc);

      // In a real-world scenario, you'd send this to a server
      // For this example, we'll simulate the upload
      const newScreenshotContainer = document.querySelector('.screenshot-container');
      const newScreenshotItem = document.createElement('div');
      newScreenshotItem.classList.add('screenshot-item');

      const newImage = document.createElement('img');
      newImage.src = URL.createObjectURL(imageFile);
      newImage.classList.add('discord-image');

      const newDesc = document.createElement('p');
      newDesc.classList.add('user-response');
      newDesc.textContent = imageDesc;

      newScreenshotItem.appendChild(newImage);
      newScreenshotItem.appendChild(newDesc);
      newScreenshotContainer.appendChild(newScreenshotItem);

      // Close modal and reset form
      adminModal.style.display = 'none';
      uploadForm.reset();

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  });

  // Initial IP check
  checkIP();
});