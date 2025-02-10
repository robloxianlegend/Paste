class PhotoBooth {
  constructor() {
    this.video = document.getElementById('camera');
    this.canvas = document.getElementById('canvas');
    this.captureBtn = document.getElementById('capture-btn');
    this.downloadBtn = document.getElementById('download-btn');
    this.retakeBtn = document.getElementById('retake-btn');
    this.gallery = document.getElementById('gallery');
    this.countdownEl = document.getElementById('countdown');
    this.cameraView = document.getElementById('camera-view');
    this.galleryView = document.getElementById('gallery-view');
    this.progressEl = document.getElementById('progress');
    this.savesBtnEl = document.getElementById('saves-btn');
    this.savesViewEl = document.getElementById('saves-view');
    this.savesGalleryEl = document.getElementById('saves-gallery');
    this.backToCameraBtn = document.getElementById('back-to-camera-btn');
    this.flipCameraBtn = document.getElementById('flip-camera-btn');
    this.currentCameraIndex = 0;
    this.availableDevices = [];
    this.photos = [];
    this.currentPhotoCount = 0;
    this.photoGroups = [];
    this.setupCameraDevices();
    this.setupCamera();
    this.setupEventListeners();
    this.setupAdditionalEventListeners();
  }

  async setupCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Only show flip camera button if more than one camera is available
      if (this.availableDevices.length > 1) {
        this.flipCameraBtn.style.display = 'flex';
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  }

  async setupCamera(deviceId = null) {
    try {
      const constraints = { 
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { 
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: 'user' 
            } 
      };

      // Stop existing stream if any
      if (this.video.srcObject) {
        const tracks = this.video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  }

  setupEventListeners() {
    this.captureBtn.addEventListener('click', () => this.captureSequence());
    this.downloadBtn.addEventListener('click', () => this.downloadPhotos());
    this.retakeBtn.addEventListener('click', () => this.retakePhotos());
  }

  setupAdditionalEventListeners() {
    this.savesBtnEl.addEventListener('click', () => this.showSaves());
    this.backToCameraBtn.addEventListener('click', () => this.backToCamera());
    this.flipCameraBtn.addEventListener('click', () => this.flipCamera());
  }

  capturePhoto() {
    const context = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    
    context.drawImage(this.video, 0, 0);
    
    const photoUrl = this.canvas.toDataURL('image/jpeg', 1.0);
    this.photos.push(photoUrl);
    this.displayPhoto(photoUrl);
  }

  displayPhoto(photoUrl) {
    const img = document.createElement('img');
    img.src = photoUrl;
    this.gallery.appendChild(img);
  }

  async captureSequence() {
    if (this.currentPhotoCount >= 3) return;

    this.captureBtn.disabled = true;
    
    // Wait for 3 seconds with a visible countdown
    await this.startCountdown(3);
    
    // Capture photo
    this.capturePhoto();
    
    // Update photo count and progress
    this.currentPhotoCount++;
    this.progressEl.textContent = `${this.currentPhotoCount}/3`;
    
    // If all 3 photos are taken, switch to gallery view
    if (this.currentPhotoCount === 3) {
      this.switchToGalleryView();
    }
    
    this.captureBtn.disabled = false;
  }

  switchToGalleryView() {
    this.cameraView.style.display = 'none';
    this.galleryView.style.display = 'flex';
  }

  retakePhotos() {
    this.photoGroups.push(this.photos.slice());
    
    this.cameraView.style.display = 'block';
    this.galleryView.style.display = 'none';
    this.gallery.innerHTML = '';
    this.photos = [];
    this.currentPhotoCount = 0;
    this.progressEl.textContent = '0/3';
  }

  startCountdown(number) {
    return new Promise((resolve) => {
      let currentCount = number;
      
      const updateCountdown = () => {
        this.countdownEl.textContent = currentCount;
        this.countdownEl.classList.add('show');
        
        if (currentCount > 0) {
          currentCount--;
          setTimeout(updateCountdown, 1000);
        } else {
          this.countdownEl.classList.remove('show');
          resolve();
        }
      };
      
      updateCountdown();
    });
  }

  downloadPhotos() {
    if (this.photos.length === 0) {
      alert('No photos to download. Capture a photo sequence first!');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const galleryImgs = this.gallery.querySelectorAll('img');
    
    const maxWidth = Math.max(...Array.from(galleryImgs).map(img => img.naturalWidth));
    const totalHeight = Array.from(galleryImgs).reduce((sum, img) => sum + img.naturalHeight, 0) + 40;
    
    canvas.width = maxWidth + 40;
    canvas.height = totalHeight;
    
    ctx.fillStyle = '#121212'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let currentY = 20;
    galleryImgs.forEach((img) => {
      const scaledWidth = maxWidth;
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const scaledHeight = scaledWidth * aspectRatio;
      
      const x = (canvas.width - scaledWidth) / 2;
      
      ctx.drawImage(
        img, 
        0, 0, img.naturalWidth, img.naturalHeight,
        x, currentY, scaledWidth, scaledHeight
      );
      
      currentY += scaledHeight + 20;
    });
    
    const photoUrl = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `love_snap_${new Date().toISOString()}.jpg`;
    link.click();
  }

  showSaves() {
    this.cameraView.style.display = 'none';
    this.savesViewEl.style.display = 'flex';
    this.renderSavedPhotos();
  }

  backToCamera() {
    this.cameraView.style.display = 'block';
    this.savesViewEl.style.display = 'none';
  }

  renderSavedPhotos() {
    this.savesGalleryEl.innerHTML = '';
    
    this.photoGroups.forEach((group, index) => {
      const groupEl = document.createElement('div');
      groupEl.classList.add('saves-gallery-group');
      
      const downloadGroupBtn = document.createElement('button');
      downloadGroupBtn.classList.add('group-download-btn');
      downloadGroupBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download
      `;

      downloadGroupBtn.addEventListener('click', () => this.downloadPhotoGroup(group));
      
      group.forEach(photoUrl => {
        const img = document.createElement('img');
        img.src = photoUrl;
        groupEl.appendChild(img);
      });
      
      groupEl.appendChild(downloadGroupBtn);
      this.savesGalleryEl.appendChild(groupEl);
    });
  }

  downloadPhotoGroup(group) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const maxWidth = Math.max(...group.map(photoUrl => {
      const img = new Image();
      img.src = photoUrl;
      return img.naturalWidth;
    }));
    const totalHeight = group.reduce((sum, photoUrl) => {
      const img = new Image();
      img.src = photoUrl;
      return sum + img.naturalHeight;
    }, 0) + 40;
    
    canvas.width = maxWidth + 40;
    canvas.height = totalHeight;
    
    ctx.fillStyle = '#121212'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let currentY = 20;
    group.forEach((photoUrl) => {
      const img = new Image();
      img.src = photoUrl;
      
      const scaledWidth = maxWidth;
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const scaledHeight = scaledWidth * aspectRatio;
      
      const x = (canvas.width - scaledWidth) / 2;
      
      ctx.drawImage(
        img, 
        0, 0, img.naturalWidth, img.naturalHeight,
        x, currentY, scaledWidth, scaledHeight
      );
      
      currentY += scaledHeight + 20;
    });
    
    const groupPhotoUrl = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.href = groupPhotoUrl;
    link.download = `love_snap_group_${new Date().toISOString()}.jpg`;
    link.click();
  }

  async flipCamera() {
    if (this.availableDevices.length <= 1) return;

    // Increment camera index, wrapping around if needed
    this.currentCameraIndex = (this.currentCameraIndex + 1) % this.availableDevices.length;
    
    const nextDevice = this.availableDevices[this.currentCameraIndex];
    await this.setupCamera(nextDevice.deviceId);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PhotoBooth();
});