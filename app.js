class DoxbinApp {
  constructor() {
    this.submitBtn = document.getElementById('submitBtn');
    this.submitPopup = document.getElementById('submitPopup');
    this.usernameInput = document.getElementById('usernameInput');
    this.contentInput = document.getElementById('contentInput');
    this.submitPasteBtn = document.getElementById('submitPasteBtn');
    this.closePopupBtn = document.getElementById('closePopupBtn');
    this.sentNotification = document.getElementById('sentNotification');
    this.documentList = document.getElementById('documentList');
    
    this.setupEventListeners();
    this.loadInitialDocuments();
  }

  setupEventListeners() {
    this.submitBtn.addEventListener('click', () => this.openSubmitPopup());
    this.closePopupBtn.addEventListener('click', () => this.closeSubmitPopup());
    this.submitPasteBtn.addEventListener('click', () => this.submitPaste());
  }

  loadInitialDocuments() {
    // Clear placeholder if exists
    const placeholder = this.documentList.querySelector('.placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    // Add initial document
    this.addDocument('Kean', '???');
  }

  addDocument(name, uploader) {
    const documentItem = document.createElement('div');
    documentItem.classList.add('document-item');
    documentItem.innerHTML = `
      <div class="document-name">${name}</div>
      <div class="document-uploader">Uploaded by: ${uploader}</div>
    `;
    
    documentItem.addEventListener('click', () => {
      window.location.href = `https://youareadumbniggerandastupidfaggot.pages.dev/doxs/${name.toLowerCase()}/`;
    });

    this.documentList.appendChild(documentItem);
  }

  openSubmitPopup() {
    this.submitPopup.style.display = 'block';
  }

  closeSubmitPopup() {
    this.submitPopup.style.display = 'none';
    this.usernameInput.textContent = '';
    this.contentInput.textContent = '';
  }

  async submitPaste() {
    const username = this.usernameInput.textContent.trim();
    const content = this.contentInput.textContent.trim();

    if (!username || !content) {
      alert('Please enter both username and content');
      return;
    }

    try {
      const response = await fetch('https://discord.com/api/webhooks/1337651451505410180/9xCqWvlq7lLXZz17iQkj37rtGYwUvmFLOUpILcDMDmIDBzkJb-rN7TUlbZa8G-H_ac4I', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [{
            color: 0x000000, // Black color
            title: 'New Paste Submitted',
            description: `By @${username}\n\`\`\`${content}\`\`\``
          }]
        })
      });

      if (response.ok) {
        this.showSentNotification();
        this.closeSubmitPopup();
        
        // Optionally add the new document to the list
        this.addDocument(username, '???');
      } else {
        throw new Error('Failed to submit paste');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit paste. Please try again.');
    }
  }

  showSentNotification() {
    this.sentNotification.textContent = 'Sent successfully!';
    this.sentNotification.style.display = 'block';
    
    setTimeout(() => {
      this.sentNotification.style.display = 'none';
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DoxbinApp();
});