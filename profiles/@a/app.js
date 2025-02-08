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
  const audio = new Audio('song/song.mp3');
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

  // QnA Link Handling
  const qnaLink = document.getElementById('qnaLink');
  qnaLink.addEventListener('click', () => {
    window.location.href = 'https://images.theconversation.com/files/393210/original/file-20210401-13-z6rl6z.jpg?ixlib=rb-4.1.0&rect=9%2C0%2C2994%2C1999&q=20&auto=format&w=320&fit=clip&dpr=2&usm=12&cs=strip';
  });

  // Document Item Click Handling
  const documentItems = document.querySelectorAll('.document-item');
  documentItems.forEach(item => {
    item.addEventListener('click', () => {
      const link = item.getAttribute('data-link');
      window.location.href = link;
    });
  });
});
