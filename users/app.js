document.addEventListener('DOMContentLoaded', () => {
  // Prevent right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Optional: Prevent text selection
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Music Player Functionality
  const audio = new Audio('songs/non.mp3');
  const customPlayBtn = document.getElementById('customPlayBtn');
  const customProgressBar = document.getElementById('customProgressBar');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  audio.addEventListener('loadedmetadata', () => {
    customProgressBar.max = audio.duration;
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    customProgressBar.value = audio.currentTime;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  customPlayBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      customPlayBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
          <rect x="6" y="4" width="4" height="16" fill="var(--text-color)"/>
          <rect x="14" y="4" width="4" height="16" fill="var(--text-color)"/>
        </svg>
      `;
    } else {
      audio.pause();
      customPlayBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
          <polygon points="5 3 19 12 5 21" fill="var(--text-color)"/>
        </svg>
      `;
    }
  });

  customProgressBar.addEventListener('input', () => {
    audio.currentTime = customProgressBar.value;
  });

  // Set initial volume to 50%
  audio.volume = 0.5;

  // Connection Screen Functionality
  const connectionScreen = document.getElementById('connectionScreen');
  const connectionStatus = document.getElementById('connectionStatus');
  const container = document.getElementById('container');

  // Disable all interactions during connection check
  function disableInteractions() {
    document.body.style.pointerEvents = 'none';
  }

  // Enable interactions
  function enableInteractions() {
    document.body.style.pointerEvents = 'auto';
  }

  // Simulate connection check
  function checkConnection() {
    disableInteractions();

    setTimeout(() => {
      connectionStatus.textContent = 'connection safe, click anywhere to proceed';
      
      // Add click listener to proceed
      const proceedListener = (e) => {
        connectionScreen.style.display = 'none';
        container.style.display = 'block';
        enableInteractions();
        
        // Remove the event listener after proceeding
        document.removeEventListener('click', proceedListener);

        // Autoplay music
        audio.play();
        customPlayBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="24" height="24">
            <rect x="6" y="4" width="4" height="16" fill="var(--text-color)"/>
            <rect x="14" y="4" width="4" height="16" fill="var(--text-color)"/>
          </svg>
        `;

        // Add tilt effect to profile card after connection
        const profileCard = document.querySelector('.profile-card');
        profileCard.classList.add('tilt-effect');

         // Start the snow effect
         startSnowfall();
      };

      // Wait for user click to proceed
      document.addEventListener('click', proceedListener);
    }, 2000);
  }

  // Start connection check
  checkConnection();

  // QnA Link Handling
  const qnaLink = document.getElementById('qnaLink');
  qnaLink.addEventListener('click', () => {
    window.location.href = 'https://youareadumbniggerandastupidfaggot.pages.dev/qna/@a/';
  });

  // Document Item Click Handling
  const documentItems = document.querySelectorAll('.document-item');
  documentItems.forEach(item => {
    item.addEventListener('click', () => {
      const link = item.getAttribute('data-link');
      window.location.href = link;
    });
  });

  let snowInterval; // Store the interval ID

  function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.style.left = `${Math.random() * 100}vw`;
    snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`; // Random duration
    snowflake.style.opacity = Math.random(); // Random opacity
    snowflake.style.fontSize = `${Math.random() * 10 + 5}px`; // Random size
    snowflake.style.animationName = 'fall';

    document.body.appendChild(snowflake);

    snowflake.addEventListener('animationend', () => {
      snowflake.remove();
    });
  }

  function startSnowfall() {
    if (!snowInterval) {
      snowInterval = setInterval(createSnowflake, 200);
    }
  }

  const trackArtwork = document.querySelector('.track-artwork');
  let isTiltLeft = true;

  trackArtwork.addEventListener('mouseenter', () => {
    if (isTiltLeft) {
      trackArtwork.classList.remove('tilt-left');
      trackArtwork.classList.add('tilt-right');
      isTiltLeft = false;
    } else {
      trackArtwork.classList.remove('tilt-right');
      trackArtwork.classList.add('tilt-left');
      isTiltLeft = true;
    }
  });
});
