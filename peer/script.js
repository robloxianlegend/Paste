document.addEventListener('DOMContentLoaded', function() {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');
  const peerIdDisplay = document.getElementById('peer-id-display');
  const fileInput = document.getElementById('file-input');
  const sendFileButton = document.getElementById('send-file-button');
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');
  const closeModal = document.getElementsByClassName('close')[0];
  const peerIdInput = document.getElementById('peer-id-input');
  
  const peer = new Peer();
  let peerId;
  let conn;
  let connectedPeerIP;

  peer.on('open', function(id) {
    peerId = id;
    console.log('my peer ID is: ' + id);
    displayPeerId(id);
  });

  peer.on('connection', function(connection) {
    conn = connection;
    // Simulate IP retrieval (replace with actual IP retrieval mechanism)
    connectedPeerIP = '139.135.241.131'; // Default IP (replace with actual retrieval)
    displayMessage('received', 'peer connected!');

    conn.on('data', function(data) {
      if (typeof data === 'string') {
        displayMessage('received', data, connectedPeerIP === '139.135.241.131');
      } else if (data.fileType === 'image') {
        displayImage('received', data.fileData, connectedPeerIP === '139.135.241.131');
      } else if (data.fileType === 'file') {
        displayFile('received', data.fileName, data.fileData, connectedPeerIP === '139.135.241.131');
      } else if (data.fileType === 'zip') {
        displayZipEmbed('received', data.fileName, data.fileSize, data.fileData, connectedPeerIP === '139.135.241.131');
      }
    });

    conn.on('close', function() {
      displayMessage('received', 'peer disconnected.');
      conn = null;
      connectedPeerIP = null;
    });
  });

  peer.on('error', function(err) {
    console.error(err);
    displayMessage('received', 'error: ' + err);
  });

  sendButton.addEventListener('click', sendMessage);

  messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText !== '') {
      if (conn) { 
        displayMessage('sent', messageText);
        conn.send(messageText);
        messageInput.value = '';
      } else {
        displayMessage('received', 'not connected to a peer. enter peer id to connect.');
      }
    }
  }

  function displayMessage(type, text, isSpecialIP = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    if (isSpecialIP) {
      messageDiv.classList.add('special-ip');
    }
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function displayImage(type, imageData, isSpecialIP = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    if (isSpecialIP) {
      messageDiv.classList.add('special-ip');
    }
    const img = document.createElement('img');
    img.src = imageData;
    img.classList.add('image-message');
    messageDiv.appendChild(img);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    img.onclick = function() {
      modal.style.display = "block";
      modalImg.src = this.src;
    }
  }

  function displayFile(type, fileName, fileData, isSpecialIP = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    if (isSpecialIP) {
      messageDiv.classList.add('special-ip');
    }
    const downloadLink = document.createElement('a');
    downloadLink.href = fileData;
    downloadLink.download = fileName;
    downloadLink.textContent = `download ${fileName}`;
    messageDiv.appendChild(downloadLink);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function displayZipEmbed(type, fileName, fileSize, fileData, isSpecialIP = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    if (isSpecialIP) {
      messageDiv.classList.add('special-ip');
    }

    const zipEmbed = document.createElement('div');
    zipEmbed.classList.add('zip-embed');

    const fileNamePara = document.createElement('p');
    fileNamePara.textContent = `file: ${fileName}`;
    zipEmbed.appendChild(fileNamePara);

    const fileSizePara = document.createElement('p');
    fileSizePara.textContent = `size: ${fileSize}`;
    zipEmbed.appendChild(fileSizePara);

    const downloadLink = document.createElement('a');
    downloadLink.href = fileData;
    downloadLink.download = fileName;
    downloadLink.textContent = 'download';
    zipEmbed.appendChild(downloadLink);

    messageDiv.appendChild(zipEmbed);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  const connectButton = document.getElementById('connect-button');

  connectButton.addEventListener('click', connectToPeer);

  function connectToPeer() {
    const peerIdToConnect = peerIdInput.value.trim();
    if (peerIdToConnect !== '') {
      conn = peer.connect(peerIdToConnect);

      conn.on('open', function() {
        // Simulate IP retrieval on connection
        connectedPeerIP = '139.135.241.131'; // Replace with actual IP retrieval
        displayMessage('received', 'connected to peer: ' + peerIdToConnect);
      });

      conn.on('data', function(data) {
        if (typeof data === 'string') {
          displayMessage('received', data, connectedPeerIP === '139.135.241.131');
        } else if (data.fileType === 'image') {
          displayImage('received', data.fileData, connectedPeerIP === '139.135.241.131');
        } else if (data.fileType === 'file') {
          displayFile('received', data.fileName, data.fileData, connectedPeerIP === '139.135.241.131');
        } else if (data.fileType === 'zip') {
          displayZipEmbed('received', data.fileName, data.fileSize, data.fileData, connectedPeerIP === '139.135.241.131');
        }
      });

      conn.on('close', function() {
        displayMessage('received', 'peer disconnected');
        conn = null;
        connectedPeerIP = null;
      });

      conn.on('error', function(err) {
        console.error(err);
        displayMessage('received', 'error: ' + err);
        conn = null;
        connectedPeerIP = null;
      });
    }
  }

  function displayPeerId(id) {
    peerIdDisplay.textContent = 'ur peer id: ' + id;
  }

  sendFileButton.addEventListener('click', sendFile);

  function sendFile() {
    const file = fileInput.files[0];
    if (!file) {
      alert('please select a file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
      const fileData = event.target.result;

      if (file.type.startsWith('image/')) {
        if (conn) { 
          displayImage('sent', fileData);
          conn.send({ fileType: 'image', fileData: fileData });
        } else {
          displayMessage('received', 'not connected to a peer. enter peer id to connect.');
        }
      } else if (file.name.endsWith('.zip')) {
        const fileSize = formatFileSize(file.size);
        if (conn) {
          conn.send({ fileType: 'zip', fileName: file.name, fileSize: fileSize, fileData: fileData });
          displayZipEmbed('sent', file.name, fileSize, fileData);
        } else {
          displayMessage('received', 'not connected to a peer. enter peer id to connect.');
        }
      }
       else {
        if (conn) {
          conn.send({ fileType: 'file', fileName: file.name, fileData: fileData });
          displayFile('sent', file.name, fileData);
        } else {
          displayMessage('received', 'not connected to a peer. enter peer id to connect.');
        }
      }
    };

    reader.onerror = function() {
      console.error("error reading file");
      displayMessage('received', 'error reading file.');
    };

    reader.readAsDataURL(file);
  }

  // Close the modal
  closeModal.onclick = function() {
    modal.style.display = "none";
  }

  // Close the modal if the user clicks outside of it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  // Copy Peer ID
  peerIdDisplay.addEventListener('click', function() {
    const idText = peerIdDisplay.textContent.replace('ur peer id: ', '');
    navigator.clipboard.writeText(idText).then(function() {
      alert('copied to clipboard!');
    }).catch(function(err) {
      console.error('could not copy text: ', err);
      alert('failed to copy peer id to clipboard.');
    });
  });

  // Drag and drop functionality
  chatMessages.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });

  chatMessages.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      handleFiles(files);
    }
  });

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = function(event) {
        const fileData = event.target.result;

        if (file.type.startsWith('image/')) {
          if (conn) {
            displayImage('sent', fileData);
            conn.send({ fileType: 'image', fileData: fileData });
          } else {
            displayMessage('received', 'not connected to a peer. enter peer id to connect.');
          }
        } else if (file.name.endsWith('.zip')) {
          const fileSize = formatFileSize(file.size);
          if (conn) {
            conn.send({ fileType: 'zip', fileName: file.name, fileSize: fileSize, fileData: fileData });
            displayZipEmbed('sent', file.name, fileSize, fileData);
          } else {
            displayMessage('received', 'not connected to a peer. enter peer id to connect.');
          }
        } else {
          if (conn) {
            conn.send({ fileType: 'file', fileName: file.name, fileData: fileData });
            displayFile('sent', file.name, fileData);
          } else {
            displayMessage('received', 'not connected to a peer. enter peer id to connect.');
          }
        }
      };

      reader.onerror = function() {
        console.error("error reading file");
        displayMessage('received', 'error reading file.');
      };

      reader.readAsDataURL(file);
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' kb';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' mb';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' gb';
    }
  }
});