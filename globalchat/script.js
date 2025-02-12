document.addEventListener('DOMContentLoaded', () => {
  const chatArea = document.getElementById('chat-area');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const welcomeMessageArea = document.getElementById('welcome-message-area');
  const fileInput = document.getElementById('file-input');
  const fileLabel = document.getElementById('file-label');
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  const secretModal = document.getElementById('secret-modal');
  const newUsernameInput = document.getElementById('new-username');
  const notification = document.getElementById('notification'); // Get the notification element
  let clientId = localStorage.getItem('clientId') || Math.random().toString(36).substring(2, 15);
  localStorage.setItem('clientId', clientId);
  let deletionMode = false;
  let messageCooldown = false;
  let replyTo = null;

  // Generate client ID and welcome message
  const channel = new BroadcastChannel('chat-channel');
  const welcomeMessage = `Welcome to anonymous chatroom, @${clientId}. Leave anonymous messages that will stay here, forever.`;
  appendWelcomeMessage(welcomeMessage);

  // Load saved messages
  loadMessages();

  // Event listeners
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  fileInput.addEventListener('change', handleFiles);
  fileLabel.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileLabel.classList.add('dragover');
  });

  fileLabel.addEventListener('dragleave', () => {
    fileLabel.classList.remove('dragover');
  });

  fileLabel.addEventListener('drop', (e) => {
    e.preventDefault();
    fileLabel.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
    handleFiles();
  });

  // Secret bind
  let keySequence = [];
  document.addEventListener('keydown', (e) => {
    keySequence.push(e.key);
    if (keySequence.length > 8) {
      keySequence.shift();
    }

    if (keySequence.join('') === '143') {
      openSecretModal();
    }

    if (keySequence.join('') === 'deletion') {
      toggleDeletionMode();
    }
  });

  function toggleDeletionMode() {
    deletionMode = !deletionMode;
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
      const deleteButton = message.querySelector('.delete-button');
      if (deleteButton) {
        deleteButton.style.display = deletionMode ? 'block' : 'none';
      }
    });
  }

  // Functions
  function sendMessage() {
    if (messageCooldown) {
      showNotification("Please wait before sending another message."); // Show custom notification
      return;
    }

    const messageText = messageInput.value.trim();
    if (messageText !== '') {
      const message = {
        senderId: clientId,
        text: messageText,
        type: 'text',
        timestamp: Date.now(),
        replyTo: replyTo
      };

      channel.postMessage(message);
      appendMessage(message);
      saveMessage(message);
      messageInput.value = '';
      chatArea.scrollTop = chatArea.scrollHeight;
      clearReplyPreview();

      messageCooldown = true;
      setTimeout(() => {
        messageCooldown = false;
      }, 3000);
    }
  }

  function handleFiles() {
    const files = fileInput.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileData = e.target.result;
        const message = {
          senderId: clientId,
          name: file.name,
          size: file.size,
          type: file.type,
          data: fileData,
          timestamp: Date.now()
        };
        channel.postMessage(message);
        appendFileMessage(message);
        saveMessage(message);
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading file');
      };

      if (file.type.startsWith('image') && file.type !== 'image/svg+xml' && file.type !== 'image/gif') {
        reader.readAsDataURL(file);
      } else if (file.type === 'image/gif') {
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video')) {
        reader.readAsDataURL(file);
      } else if (file.type === 'application/zip') {
        reader.readAsArrayBuffer(file);
      } else if (file.type.startsWith('audio')) {
        reader.readAsDataURL(file);
      } else {
        alert('Unsupported file type');
      }
    }
  }

  channel.onmessage = (event) => {
    const message = event.data;
    if (message.senderId !== clientId) {
      if (message.type === 'text') {
        appendMessage(message);
      } else {
        appendFileMessage(message);
      }
      saveMessage(message);
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  };

  function appendMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add('thread');
    messageDiv.dataset.timestamp = message.timestamp;

    const isSelf = message.senderId === clientId;
    if (isSelf) {
      messageDiv.classList.add('self');
    }

    const senderSpan = document.createElement('div');
    senderSpan.classList.add('sender-tag');
    senderSpan.textContent = isSelf ? '' : `@${message.senderId.substring(0, 8)}`;
    messageDiv.appendChild(senderSpan);

    const timeSpan = document.createElement('div');
    timeSpan.classList.add('timestamp');
    const date = new Date(message.timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    timeSpan.textContent = `(sent on: ${formattedTime})`;
    messageDiv.appendChild(timeSpan);

    if (message.replyTo) {
      const repliedToMessage = document.querySelector(`.message[data-timestamp="${message.replyTo}"]`);
      if (repliedToMessage) {
        const replyPreview = document.createElement('div');
        replyPreview.classList.add('reply-preview');
        replyPreview.textContent = `Replying to: ${repliedToMessage.textContent.substring(0, 50)}...`;
        messageDiv.appendChild(replyPreview);
      } else {
        message.replyTo = null;
      }
    }

    const textSpan = document.createElement('div');
    textSpan.textContent = message.text;
    messageDiv.appendChild(textSpan);

    const deleteButton = createDeleteButton(message.timestamp);
    messageDiv.appendChild(deleteButton);

    const replyButton = createReplyButton(message.timestamp);
    messageDiv.appendChild(replyButton);

    messageDiv.dataset.senderId = message.senderId;
    chatArea.appendChild(messageDiv);
  }

  function appendFileMessage(file) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add('file-message');
    messageDiv.classList.add('thread');
    messageDiv.dataset.timestamp = file.timestamp;

    const isSelf = file.senderId === clientId;
    if (isSelf) {
      messageDiv.classList.add('self');
    }

    const senderSpan = document.createElement('div');
    senderSpan.classList.add('sender-tag');
    senderSpan.textContent = isSelf ? '' : `@${file.senderId.substring(0, 8)}`;
    messageDiv.appendChild(senderSpan);

    const timeSpan = document.createElement('div');
    timeSpan.classList.add('timestamp');
    const date = new Date(file.timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    timeSpan.textContent = `(sent on: ${formattedTime})`;
    messageDiv.appendChild(timeSpan);

    let fileDisplay;
    if (file.type.startsWith('image') && file.type !== 'image/svg+xml') {
      fileDisplay = document.createElement('img');
      fileDisplay.src = file.data;
      fileDisplay.alt = file.name;
      fileDisplay.classList.add('file-content');
      fileDisplay.addEventListener('click', () => openModal(file.data, 'image', file.name));
      fileDisplay.style.borderRadius = '8px';
    } else if (file.type.startsWith('video')) {
      fileDisplay = document.createElement('video');
      fileDisplay.src = file.data;
      fileDisplay.alt = file.name;
      fileDisplay.classList.add('file-content');
      fileDisplay.controls = true;
      fileDisplay.addEventListener('click', () => openModal(file.data, 'video', file.name));
      fileDisplay.style.borderRadius = '8px';
    } else if (file.type === 'application/zip') {
      fileDisplay = createZipEmbed(file);
    } else if (file.type.startsWith('audio')) {
      fileDisplay = createAudioEmbed(file);
    } else {
      fileDisplay = document.createElement('div');
      fileDisplay.textContent = `Unsupported file: ${file.name} (${formatBytes(file.size)})`;
    }

    const deleteButton = createDeleteButton(file.timestamp);
    messageDiv.appendChild(deleteButton);

    const replyButton = createReplyButton(file.timestamp);
    messageDiv.appendChild(replyButton);

    messageDiv.appendChild(fileDisplay);
    messageDiv.dataset.senderId = file.senderId;
    chatArea.appendChild(messageDiv);
  }

  function createDeleteButton(timestamp) {
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.textContent = '🗑️';
    deleteButton.style.display = deletionMode ? 'block' : 'none';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteMessage(timestamp);
    });
    return deleteButton;
  }

  function createReplyButton(timestamp) {
    const replyButton = document.createElement('button');
    replyButton.classList.add('reply-button');
    replyButton.textContent = 'Reply';
    replyButton.addEventListener('click', (event) => {
      event.stopPropagation();
      startReply(timestamp);
    });
    return replyButton;
  }

  function startReply(timestamp) {
    replyTo = timestamp;
    const messageDiv = document.querySelector(`.message[data-timestamp="${timestamp}"]`);
    if (messageDiv) {
      messageDiv.classList.add('replying-to');
      displayReplyPreview(messageDiv.textContent);
    }
  }

  function displayReplyPreview(text) {
    const replyPreview = document.createElement('div');
    replyPreview.classList.add('reply-preview');
    replyPreview.textContent = `Replying to: ${text.substring(0, 50)}...`;
    messageInput.parentNode.insertBefore(replyPreview, messageInput);
  }

  function clearReplyPreview() {
    replyTo = null;
    const replyPreview = document.querySelector('.reply-preview');
    if (replyPreview) {
      replyPreview.remove();
    }
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => message.classList.remove('replying-to'));
  }

  function appendWelcomeMessage(messageText) {
    welcomeMessageArea.textContent = messageText;
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function createZipEmbed(file) {
    const zipEmbed = document.createElement('div');
    zipEmbed.classList.add('zip-embed');

    const fileNameRow = document.createElement('div');
    fileNameRow.classList.add('file-name-row');

    const fileName = document.createElement('span');
    fileName.textContent = file.name;
    fileNameRow.appendChild(fileName);

    const fileSize = document.createElement('div');
    fileSize.textContent = `size: ${formatBytes(file.size)}`;

    zipEmbed.appendChild(fileNameRow);
    zipEmbed.appendChild(fileSize);

    zipEmbed.addEventListener('click', () => downloadFile(file.data, file.name));

    return zipEmbed;
  }

  function createAudioEmbed(file) {
    const audioEmbed = document.createElement('div');
    audioEmbed.classList.add('audio-embed');

    const fileNameRow = document.createElement('div');
    fileNameRow.classList.add('file-name-row');

    const fileName = document.createElement('span');
    fileName.textContent = file.name;
    fileNameRow.appendChild(fileName);

    const audioElement = document.createElement('audio');
    audioElement.src = file.data;
    audioElement.controls = true;
    audioElement.classList.add('audio-element');

    audioEmbed.appendChild(fileNameRow);
    audioEmbed.appendChild(audioElement);

    audioEmbed.addEventListener('click', () => downloadFile(file.data, file.name));

    return audioEmbed;
  }

  function downloadFile(data, filename) {
    const a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function openModal(fileData, fileType, fileName) {
    modalContent.innerHTML = '';

    let element;
    if (fileType === 'image') {
      element = document.createElement('img');
      element.src = fileData;
      element.alt = fileName;
      element.classList.add('modal-content-element');
    } else if (fileType === 'video') {
      element = document.createElement('video');
      element.src = fileData;
      element.alt = fileName;
      element.controls = true;
      element.classList.add('modal-content-element');
    }

    modalContent.appendChild(element);

    modal.style.display = 'flex';
  }

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  function saveMessage(message) {
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }

  function loadMessages() {
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.forEach(message => {
      if (message.type === 'text') {
        appendMessage(message);
      } else {
        appendFileMessage(message);
      }
    });
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function deleteMessage(timestamp) {
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages = messages.filter(message => message.timestamp !== timestamp);
    localStorage.setItem('chatMessages', JSON.stringify(messages));

    const messageDiv = document.querySelector(`.message[data-timestamp="${timestamp}"]`);
    if (messageDiv) {
      chatArea.removeChild(messageDiv);
    }
  }

  // Secret modal functions
  function openSecretModal() {
    secretModal.style.display = 'flex';
  }

  function closeSecretModal() {
    secretModal.style.display = 'none';
  }

  // Save new username
  window.changeUsername = () => {
    const newUsername = newUsernameInput.value.trim();
    if (newUsername) {
      clientId = newUsername;
      localStorage.setItem('clientId', clientId);
      const welcomeMessage = `System: Username changed to: ${clientId}`;
      appendWelcomeMessage(welcomeMessage);
      closeSecretModal();
    }
  };

  window.addEventListener('click', (event) => {
    if (event.target === secretModal) {
      closeSecretModal();
    }
  });

  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
});